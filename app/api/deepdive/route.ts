import { NextRequest, NextResponse } from "next/server";
import { SchemaType, Schema } from "@google/generative-ai";
import { generateJson, NoApiKeyError } from "@/lib/gemini";
import { ConceptDetail, STARTING_LEVELS, StartingLevel } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const schema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    hookQuestion: { type: SchemaType.STRING },
    coreIdea: { type: SchemaType.STRING, description: "2-3 sentences" },
    why: { type: SchemaType.STRING, description: "2-3 sentences, the causal/motivating reason" },
    connection: { type: SchemaType.STRING, description: "1-2 sentences naming ONE specific prior concept or everyday thing" },
    analogy: { type: SchemaType.STRING, description: "one sentence" },
    diagram: {
      type: SchemaType.OBJECT,
      properties: {
        left: { type: SchemaType.STRING, description: "2-4 words" },
        right: { type: SchemaType.STRING, description: "2-4 words" },
        relation: { type: SchemaType.STRING, description: "short verb phrase" },
      },
      required: ["left", "right", "relation"],
    },
    classification: { type: SchemaType.STRING, format: "enum", enum: ["derivable", "arbitrary"] },
    classificationReason: { type: SchemaType.STRING, description: "one sentence" },
  },
  required: ["hookQuestion", "coreIdea", "why", "connection", "analogy", "diagram", "classification", "classificationReason"],
} as unknown as Schema;

function levelLabel(level: StartingLevel): string {
  return STARTING_LEVELS.find((l) => l.value === level)?.label ?? level;
}

export async function POST(req: NextRequest) {
  let topic: string;
  let level: StartingLevel;
  let conceptTitle: string;
  let conceptOneLiner: string;
  let priorTitles: string[];
  try {
    const body = await req.json();
    topic = String(body.topic ?? "").trim();
    level = body.level as StartingLevel;
    conceptTitle = String(body.concept?.title ?? "");
    conceptOneLiner = String(body.concept?.oneLiner ?? "");
    priorTitles = Array.isArray(body.priorTitles) ? body.priorTitles : [];
  } catch {
    return NextResponse.json({ error: "bad-request", message: "Malformed request body." }, { status: 400 });
  }

  if (!topic || !conceptTitle) {
    return NextResponse.json({ error: "bad-request", message: "Missing topic or concept." }, { status: 400 });
  }

  const prompt = `Topic: "${topic}". Learner level: "${levelLabel(level)}".
Concept to teach now: "${conceptTitle}" — ${conceptOneLiner}.
Concepts the learner has ALREADY learned in this topic, in order: ${priorTitles.length ? priorTitles.join(", ") : "none yet"}.

Produce ONLY a JSON object with exactly these fields:
{
 "hookQuestion": "...",
 "coreIdea": "2-3 sentences",
 "why": "2-3 sentences, the causal/motivating reason",
 "connection": "1-2 sentences naming ONE specific prior concept or everyday thing",
 "analogy": "one sentence",
 "diagram": {"left":"2-4 words","right":"2-4 words","relation":"short verb phrase"},
 "classification": "derivable" or "arbitrary",
 "classificationReason": "one sentence"
}
Respond with ONLY the JSON object — no prose, no markdown fences.`;

  try {
    const detail = await generateJson<ConceptDetail>(prompt, schema);
    return NextResponse.json({ detail });
  } catch (err) {
    if (err instanceof NoApiKeyError) {
      return NextResponse.json(
        { error: "no-api-key", message: "No Gemini API key is configured on the server yet." },
        { status: 501 },
      );
    }
    console.error("Deep-dive generation failed:", err);
    return NextResponse.json(
      { error: "generation-failed", message: "Couldn't generate this concept right now. Try again." },
      { status: 502 },
    );
  }
}
