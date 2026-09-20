import { GoogleGenerativeAI, GoogleGenerativeAIFetchError, Schema } from "@google/generative-ai";

export const MODEL_NAME = "gemini-3.6-flash";

export class NoApiKeyError extends Error {}

export class QuotaExceededError extends Error {}

export function getGenAI(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new NoApiKeyError();
  return new GoogleGenerativeAI(apiKey);
}

/** Defensive strip in case the model wraps JSON in markdown fences despite JSON-mode being requested. */
export function stripFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

// 429 is deliberately NOT in here. Google returns 429 for both a transient per-minute rate limit
// and a hard daily quota cap, and either way its own suggested retryDelay runs tens of seconds —
// far past anything worth blocking a request on. Blindly retrying it would only burn more of a
// (often tiny, free-tier) request budget chasing an error that won't clear in time.
const RETRYABLE_STATUS = new Set([500, 502, 503, 504]);
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 800;

function isRetryable(err: unknown): boolean {
  return err instanceof GoogleGenerativeAIFetchError && !!err.status && RETRYABLE_STATUS.has(err.status);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Gemini returns transient 503s ("model is currently experiencing high demand") often enough
 * in practice that surfacing them straight to the user is the wrong default — a second attempt
 * a moment later almost always succeeds. Retries only on the handful of transient/5xx-style
 * statuses; a 400 (our own bad prompt/schema) or 403 (auth) fails immediately since retrying
 * won't fix either.
 */
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
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

async function callModel<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await withRetry(fn);
  } catch (err) {
    if (err instanceof GoogleGenerativeAIFetchError && err.status === 429) {
      throw new QuotaExceededError(
        err.message.includes("PerDay")
          ? "Gemini's free-tier daily quota for this model is used up. Wait for it to reset, or switch to a paid plan."
          : "Gemini is rate-limiting requests right now. Wait a moment and try again.",
      );
    }
    throw err;
  }
}

export async function generateJson<T>(prompt: string, responseSchema: Schema): Promise<T> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });
  const result = await callModel(() => model.generateContent(prompt));
  const text = result.response.text();
  return JSON.parse(stripFences(text)) as T;
}

export async function generateText(prompt: string): Promise<string> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const result = await callModel(() => model.generateContent(prompt));
  return result.response.text().trim();
}
