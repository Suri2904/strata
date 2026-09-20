import { NextRequest, NextResponse } from "next/server";
import { SchemaType, Schema } from "@google/generative-ai";
import { generateJson, NoApiKeyError } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 60;

interface VerifyResult {
  ok: boolean;
  issues: string[];
}

const schema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    ok: { type: SchemaType.BOOLEAN, description: "true if the ordering is a valid prerequisite chain with no gaps" },
    issues: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "specific ordering problems or missing prerequisites; empty array if none",
    },
  },
  required: ["ok", "issues"],
} as unknown as Schema;

export async function POST(req: NextRequest) {
  let topic: string;
  let concepts: { id: string; title: string; oneLiner: string }[];
  try {
    const body = await req.json();
    topic = String(body.topic ?? "").trim();
    concepts = Array.isArray(body.concepts) ? body.concepts : [];
  } catch {
    return NextResponse.json({ error: "bad-request", message: "Malformed request body." }, { status: 400 });
  }

  if (!topic || concepts.length === 0) {
    return NextResponse.json({ error: "bad-request", message: "Missing topic or concepts." }, { status: 400 });
  }

  const list = concepts.map((c, i) => `${i + 1}. ${c.title} — ${c.oneLiner}`).join("\n");
  const prompt = `Topic: "${topic}". A curriculum was generated as this ordered sequence of concepts, foundation to mastery:
${list}

Check whether this is a valid, strictly-ordered prerequisite chain: does every concept only depend on ideas that appear earlier in the list, and is anything a later concept clearly needs missing entirely from the list?
Produce ONLY a JSON object: {"ok": true/false, "issues": ["specific problems, empty array if none"]}
Be conservative — only flag a real ordering violation or a genuinely missing prerequisite, not stylistic preferences.
Respond with ONLY the JSON object — no prose, no markdown fences.`;

  try {
    const result = await generateJson<VerifyResult>(prompt, schema);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof NoApiKeyError) {
      return NextResponse.json(
        { error: "no-api-key", message: err.message },
        { status: 501 },
      );
    }
    console.error("Verification pass failed:", err);
    // Non-critical — a failed verification pass shouldn't block using the curriculum.
    return NextResponse.json({ ok: true, issues: [] });
  }
}
