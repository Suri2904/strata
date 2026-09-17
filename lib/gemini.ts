import { GoogleGenerativeAI, Schema } from "@google/generative-ai";

export const MODEL_NAME = "gemini-3.6-flash";

export class NoApiKeyError extends Error {}

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

export async function generateJson<T>(prompt: string, responseSchema: Schema): Promise<T> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(stripFences(text)) as T;
}

export async function generateText(prompt: string): Promise<string> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
