import { NextRequest, NextResponse } from "next/server";
import { SchemaType, Schema } from "@google/generative-ai";
import { generateJson, NoApiKeyError, QuotaExceededError } from "@/lib/llm";
import { STARTING_LEVELS, StartingLevel } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface DiagnosticQuestion {
  conceptId: string;
  question: string;
  options: string[];
  correctIndex: number;
}

const schema: Schema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      conceptId: { type: SchemaType.STRING },
      question: { type: SchemaType.STRING, description: "tests whether the learner already knows this concept" },
      options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "exactly 4 options" },
      correctIndex: { type: SchemaType.NUMBER },
    },
    required: ["conceptId", "question", "options", "correctIndex"],
  },
} as unknown as Schema;

function levelLabel(level: StartingLevel): string {
  return STARTING_LEVELS.find((l) => l.value === level)?.label ?? level;
}

export async function POST(req: NextRequest) {
  let topic: string;
  let level: StartingLevel;
  let concepts: { id: string; title: string; oneLiner: string }[];
  try {
    const body = await req.json();
    topic = String(body.topic ?? "").trim();
    level = body.level as StartingLevel;
    concepts = Array.isArray(body.concepts) ? body.concepts : [];
  } catch {
    return NextResponse.json({ error: "bad-request", message: "Malformed request body." }, { status: 400 });
  }

  if (!topic || concepts.length === 0) {
    return NextResponse.json({ error: "bad-request", message: "Missing topic or concepts." }, { status: 400 });
  }

  const list = concepts.map((c) => `{"conceptId":"${c.id}","title":"${c.title}","oneLiner":"${c.oneLiner}"}`).join("\n");
  const prompt = `Topic: "${topic}". Learner's stated starting level: "${levelLabel(level)}".
Write one multiple-choice diagnostic question for EACH of the following concepts, to check whether the learner already knows it well enough to skip the lesson:
${list}

Each question should test real understanding, not trivia — favor "what happens if" or "why" over "what is X called". Produce a JSON array with exactly one item per concept, each shaped as:
{"conceptId":"...", "question":"...", "options":["a","b","c","d"], "correctIndex":0-3}
Respond with ONLY the JSON array — no prose, no markdown fences.`;

  try {
    const questions = await generateJson<DiagnosticQuestion[]>(prompt, schema);
    return NextResponse.json({ questions });
  } catch (err) {
    if (err instanceof NoApiKeyError) {
      return NextResponse.json(
        { error: "no-api-key", message: err.message },
        { status: 501 },
      );
    }
    if (err instanceof QuotaExceededError) {
      return NextResponse.json({ error: "quota-exceeded", message: err.message }, { status: 429 });
    }
    console.error("Diagnostic generation failed:", err);
    return NextResponse.json(
      { error: "generation-failed", message: "Couldn't build a diagnostic. Skipping straight to the path." },
      { status: 502 },
    );
  }
}
