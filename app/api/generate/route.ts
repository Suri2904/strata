import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { Curriculum } from "@/lib/types";
import { slugify } from "@/lib/curricula";

export const runtime = "nodejs";

const nodeSchema = {
  type: SchemaType.OBJECT,
  properties: {
    id: { type: SchemaType.STRING, description: "short kebab-case id, unique within the curriculum" },
    title: { type: SchemaType.STRING },
    depth: { type: SchemaType.NUMBER, description: "0 = most foundational, increasing = more advanced" },
    summary: { type: SchemaType.STRING, description: "2-4 sentences explaining the concept" },
    whyItMatters: { type: SchemaType.STRING, description: "one sentence: why this must come before what it unlocks" },
    prerequisites: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "ids of nodes that must be mastered first; [] if none" },
    estMinutes: { type: SchemaType.NUMBER },
    retention: { type: SchemaType.STRING, format: "enum", enum: ["slow", "medium", "fast"], description: "how fast this knowledge decays without review: slow for formal/derived concepts, fast for fact-heavy/trivia concepts" },
    quiz: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          question: { type: SchemaType.STRING },
          options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          correctIndex: { type: SchemaType.NUMBER },
          explanation: { type: SchemaType.STRING },
        },
        required: ["id", "question", "options", "correctIndex", "explanation"],
      },
      description: "exactly 2 multiple-choice questions, 4 options each",
    },
  },
  required: ["id", "title", "depth", "summary", "whyItMatters", "prerequisites", "estMinutes", "retention", "quiz"],
};

const curriculumSchema = {
  type: SchemaType.OBJECT,
  properties: {
    topic: { type: SchemaType.STRING },
    tagline: { type: SchemaType.STRING, description: "one sentence, in the style: 'From X to Y, in the order each idea actually requires the last.'" },
    nodes: { type: SchemaType.ARRAY, items: nodeSchema, description: "8 to 12 nodes, forming a valid prerequisite DAG from foundational (depth 0) to advanced" },
  },
  required: ["topic", "tagline", "nodes"],
};

const SYSTEM_PROMPT = `You are a world-class curriculum designer building a "foundational mastery path" for a given topic.

Rules:
- Produce 8 to 12 concept nodes ordered so that each node's prerequisites (by id) are strictly earlier/foundational relative to it.
- depth 0 nodes have no prerequisites. Later nodes reference only earlier node ids as prerequisites.
- The graph must be a valid DAG - no cycles, no forward references.
- Every non-root node needs at least one prerequisite; most should have 1-2.
- Write summaries that are accurate, specific, and free of fluff - assume an intelligent adult reader learning this for the first time, aiming for near-foundational mastery, not a shallow overview.
- Each node needs exactly 2 multiple-choice quiz questions (4 options, one correct, with a real explanation) that test understanding, not trivia recall.
- retention should vary honestly per node: "slow" for durable first-principles/derivation-heavy ideas, "medium" for standard conceptual ideas, "fast" for fact-heavy or context-specific ideas.
- Respond with JSON only, matching the provided schema exactly.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "no-api-key", message: "No Gemini API key is configured on the server yet." },
      { status: 501 },
    );
  }

  let topic: string;
  try {
    const body = await req.json();
    topic = String(body.topic ?? "").trim();
  } catch {
    return NextResponse.json({ error: "bad-request", message: "Expected JSON body with a topic field." }, { status: 400 });
  }

  if (!topic || topic.length > 120) {
    return NextResponse.json({ error: "bad-request", message: "Topic must be 1-120 characters." }, { status: 400 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: curriculumSchema as unknown as Schema,
      },
    });

    const result = await model.generateContent(
      `Build the foundational mastery path for: "${topic}"`,
    );
    const text = result.response.text();
    const parsed = JSON.parse(text) as { topic: string; tagline: string; nodes: Curriculum["nodes"] };

    const curriculum: Curriculum = {
      slug: slugify(topic),
      topic: parsed.topic || topic,
      tagline: parsed.tagline,
      generatedAt: new Date().toISOString(),
      source: "gemini",
      nodes: parsed.nodes,
    };

    return NextResponse.json({ curriculum });
  } catch (err) {
    console.error("Gemini generation failed:", err);
    return NextResponse.json(
      { error: "generation-failed", message: "Generation failed. Try again, or try a more specific topic." },
      { status: 502 },
    );
  }
}
