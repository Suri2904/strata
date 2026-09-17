import { NextRequest, NextResponse } from "next/server";
import { SchemaType, Schema } from "@google/generative-ai";
import { generateJson, NoApiKeyError } from "@/lib/gemini";
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

export async function POST(req: NextRequest) {
  let topic: string;
  let conceptTitle: string;
  let conceptOneLiner: string;
  let coreIdea: string;
  let why: string;
  let userAnswer: string;
  let isReview: boolean;
  try {
    const body = await req.json();
    topic = String(body.topic ?? "").trim();
    conceptTitle = String(body.concept?.title ?? "");
    conceptOneLiner = String(body.concept?.oneLiner ?? "");
    coreIdea = String(body.coreIdea ?? "");
    why = String(body.why ?? "");
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
This is a SPACED REVIEW — the learner has not seen this concept in a while.
They tried to explain it from memory:
"""${userAnswer}"""
Grade it honestly. Produce ONLY a JSON object:
{"score": 1-5 integer, "feedback": "2-3 sentences", "fluencyWarning": true/false}
Respond with ONLY the JSON object.`
    : `Topic: "${topic}". Concept: "${conceptTitle}" (${conceptOneLiner}).
The correct core idea is: "${coreIdea}" Why: "${why}"
The learner just tried to explain this concept FROM MEMORY, in their own words, with no notes visible:
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
        { error: "no-api-key", message: "No Gemini API key is configured on the server yet." },
        { status: 501 },
      );
    }
    console.error("Retrieval grading failed:", err);
    return NextResponse.json(
      { error: "generation-failed", message: "Couldn't grade that right now. Try again." },
      { status: 502 },
    );
  }
}
