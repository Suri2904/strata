import { GoogleGenerativeAI, GoogleGenerativeAIFetchError, Schema } from "@google/generative-ai";

const GEMINI_MODEL = "gemini-3.6-flash";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export class NoApiKeyError extends Error {}

export class QuotaExceededError extends Error {}

/** Defensive strip in case a model wraps JSON in markdown fences despite JSON mode being requested. */
function stripFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

const RETRYABLE_STATUS = new Set([500, 502, 503, 504]);
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 800;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Shared retry helper for both providers. 429 is deliberately never retryable here — both
 * Gemini and Groq's free tiers are rate/quota-limited, and either way the provider's own
 * suggested backoff runs far longer than anything worth blocking a request on. Retrying it
 * would just burn more of a scarce daily budget chasing an error that won't clear in time.
 */
async function withRetry<T>(fn: () => Promise<T>, isRetryable: (err: unknown) => boolean): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === MAX_RETRIES || !isRetryable(err)) throw err;
      await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }
  throw lastErr;
}

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function isRetryableGemini(err: unknown): boolean {
  return err instanceof GoogleGenerativeAIFetchError && !!err.status && RETRYABLE_STATUS.has(err.status);
}

function isRetryableHttp(err: unknown): boolean {
  return err instanceof HttpError && RETRYABLE_STATUS.has(err.status);
}

async function geminiCall(prompt: string, schema?: Schema): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new NoApiKeyError("GEMINI_API_KEY is not configured.");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: schema ? { responseMimeType: "application/json", responseSchema: schema } : undefined,
  });

  try {
    const result = await withRetry(() => model.generateContent(prompt), isRetryableGemini);
    return result.response.text();
  } catch (err) {
    if (err instanceof GoogleGenerativeAIFetchError && err.status === 429) {
      throw new QuotaExceededError(
        err.message.includes("PerDay")
          ? "Gemini's free-tier daily quota for this model is used up."
          : "Gemini is rate-limiting requests right now.",
      );
    }
    throw err;
  }
}

async function groqCall(prompt: string, jsonMode: boolean): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new NoApiKeyError("GROQ_API_KEY is not configured.");

  const doFetch = async () => {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new HttpError(res.status, `Groq ${res.status}: ${body.slice(0, 300)}`);
    }
    const data = await res.json();
    return (data.choices?.[0]?.message?.content as string | undefined) ?? "";
  };

  try {
    return await withRetry(doFetch, isRetryableHttp);
  } catch (err) {
    if (err instanceof HttpError && err.status === 429) {
      throw new QuotaExceededError("Groq's free-tier rate limit is used up right now.");
    }
    throw err;
  }
}

/**
 * Gemini first (its native JSON-schema mode guarantees exact shape), Groq as a fallback for
 * anything that takes Gemini down — quota exhausted, rate-limited, transient outage, or not
 * configured at all. This is the whole point of running two free tiers side by side: between
 * Gemini's 20 requests/day and Groq's ~1,000/day, the app keeps working well past what either
 * free tier alone would allow, and a single provider having a bad day doesn't stop the app.
 */
async function withFallback<T>(primary: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  try {
    return await primary();
  } catch (primaryErr) {
    try {
      return await fallback();
    } catch (fallbackErr) {
      if (primaryErr instanceof QuotaExceededError && fallbackErr instanceof QuotaExceededError) {
        throw new QuotaExceededError("Both Gemini's and Groq's free daily limits are used up right now.");
      }
      if (primaryErr instanceof NoApiKeyError && fallbackErr instanceof NoApiKeyError) {
        throw new NoApiKeyError("Neither GEMINI_API_KEY nor GROQ_API_KEY is configured on the server.");
      }
      throw fallbackErr;
    }
  }
}

export async function generateJson<T>(prompt: string, schema: Schema): Promise<T> {
  return withFallback(
    async () => JSON.parse(stripFences(await geminiCall(prompt, schema))) as T,
    async () => JSON.parse(stripFences(await groqCall(prompt, true))) as T,
  );
}

export async function generateText(prompt: string): Promise<string> {
  return withFallback(
    async () => (await geminiCall(prompt)).trim(),
    async () => (await groqCall(prompt, false)).trim(),
  );
}
