import { NextRequest, NextResponse } from "next/server";
import { SchemaType, Schema } from "@google/generative-ai";
import { generateJson, NoApiKeyError, QuotaExceededError } from "@/lib/llm";
import { STARTING_LEVELS, StartingLevel, TARGET_DEPTHS, TargetDepth } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface RawConcept {
  id: string;
  title: string;
  oneLiner: string;
}

const schema: Schema = {
  type: SchemaType.ARRAY,
  minItems: 6,
  maxItems: 9,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      id: { type: SchemaType.STRING },
      title: { type: SchemaType.STRING },
      oneLiner: { type: SchemaType.STRING, description: "one plain-language sentence" },
    },
    required: ["id", "title", "oneLiner"],
  },
} as unknown as Schema;

function levelLabel(level: StartingLevel): string {
  return STARTING_LEVELS.find((l) => l.value === level)?.label ?? level;
}

function depthLabel(depth: TargetDepth): string {
  return TARGET_DEPTHS.find((d) => d.value === depth)?.label ?? depth;
}

export async function POST(req: NextRequest) {
  let topic: string;
  let level: StartingLevel;
  let targetDepth: TargetDepth;
  try {
    const body = await req.json();
    topic = String(body.topic ?? "").trim();
    level = body.level as StartingLevel;
    targetDepth = body.targetDepth as TargetDepth;
  } catch {
    return NextResponse.json({ error: "bad-request", message: "Expected JSON body with topic and level." }, { status: 400 });
  }

  if (!topic || topic.length > 120) {
    return NextResponse.json({ error: "bad-request", message: "Topic must be 1-120 characters." }, { status: 400 });
  }

  const prompt = `You are designing a mastery curriculum for a self-learner on the topic: "${topic}". The learner's starting level: "${levelLabel(level)}". Their target depth: "${depthLabel(targetDepth)}" — scope each concept's ambition accordingly (a "working knowledge" target should stop at practical fluency; a "mastery" target should go far enough that later concepts get genuinely rigorous).
Produce a JSON array (6 to 9 items, ordered strictly foundation to mastery) of the core concepts they must learn, each item shaped exactly as {"id":"c1","title":"...","oneLiner":"one plain-language sentence"}.
Order matters: earlier concepts must be true prerequisites for later ones.
Respond with ONLY the JSON array — no prose, no markdown fences.`;

  try {
    const concepts = await generateJson<RawConcept[]>(prompt, schema);
    return NextResponse.json({ concepts });
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
    console.error("Curriculum generation failed:", err);
    return NextResponse.json(
      { error: "generation-failed", message: "Couldn't build a curriculum for that topic. Try again, or be more specific." },
      { status: 502 },
    );
  }
}
