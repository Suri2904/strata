import { NextRequest, NextResponse } from "next/server";
import { SchemaType, Schema } from "@google/generative-ai";
import { generateJson, NoApiKeyError, QuotaExceededError } from "@/lib/llm";
import { RetrieveGrade } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const schema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    score: { type: SchemaType.INTEGER, description: "1-5 integer" },
    feedback: { type: SchemaType.STRING, description: "2-3 sentences, specific and honest" },
    fluencyWarning: { type: SchemaType.BOOLEAN },
  },
  required: ["score", "feedback", "fluencyWarning"],
} as unknown as Schema;

function misconceptionBlock(misconceptions: string[]): string {
  if (!misconceptions.length) return "";
  return `\nKnown misconceptions about this concept — if the learner's answer shows one of these, say so explicitly in the feedback:\n${misconceptions.map((m) => `- ${m}`).join("\n")}\n`;
}

export async function POST(req: NextRequest) {
  let topic: string;
  let conceptTitle: string;
  let conceptOneLiner: string;
  let coreIdea: string;
  let why: string;
  let misconceptions: string[];
  let userAnswer: string;
  let isReview: boolean;
  try {
    const body = await req.json();
    topic = String(body.topic ?? "").trim();
    conceptTitle = String(body.concept?.title ?? "");
    conceptOneLiner = String(body.concept?.oneLiner ?? "");
    coreIdea = String(body.coreIdea ?? "");
    why = String(body.why ?? "");
    misconceptions = Array.isArray(body.misconceptions) ? body.misconceptions : [];
    userAnswer = String(body.userAnswer ?? "");
    isReview = Boolean(body.isReview);
  } catch {
    return NextResponse.json({ error: "bad-request", message: "Malformed request body." }, { status: 400 });
  }

  if (!topic || !conceptTitle || !userAnswer.trim()) {
    return NextResponse.json({ error: "bad-request", message: "Missing required fields." }, { status: 400 });
  }

  const prompt = isReview
    ? `Topic: "${topic}". Concept: "${conceptTitle}" (${conceptOneLiner}).
Correct core idea: "${coreIdea}" Why: "${why}"
${misconceptionBlock(misconceptions)}This is a SPACED REVIEW — the learner has not seen this concept in a while.
They tried to explain it from memory:
"""${userAnswer}"""
Grade it honestly. Produce ONLY a JSON object:
{"score": 1-5 integer, "feedback": "2-3 sentences", "fluencyWarning": true/false}
Respond with ONLY the JSON object.`
    : `Topic: "${topic}". Concept: "${conceptTitle}" (${conceptOneLiner}).
The correct core idea is: "${coreIdea}" Why: "${why}"
${misconceptionBlock(misconceptions)}The learner just tried to explain this concept FROM MEMORY, in their own words, with no notes visible:
"""${userAnswer}"""
Grade it honestly. Produce ONLY a JSON object:
{"score": 1-5 integer, "feedback": "2-3 sentences, specific and honest — say exactly what is missing or wrong, do not just be encouraging", "fluencyWarning": true/false}
Respond with ONLY the JSON object.`;

  try {
    const grade = await generateJson<RetrieveGrade>(prompt, schema);
    return NextResponse.json({ grade });
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
    console.error("Retrieval grading failed:", err);
    return NextResponse.json(
      { error: "generation-failed", message: "Couldn't grade that right now. Try again." },
      { status: 502 },
    );
  }
}
