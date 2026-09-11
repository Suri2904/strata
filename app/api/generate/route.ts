import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { Curriculum } from "@/lib/types";
import { slugify } from "@/lib/curricula";

export const runtime = "nodejs";
export const maxDuration = 60;

const explanationSchema = {
  type: SchemaType.OBJECT,
  properties: {
    foundation: {
      type: SchemaType.STRING,
      description: "1-2 sentences: what we're taking as already established, the ground this reasoning starts from",
    },
    reasoning: {
      type: SchemaType.STRING,
      description:
        "The derivation itself, 3-6 sentences across 2-3 paragraphs (separate paragraphs with a blank line). Reason FORWARD from the foundation toward the concept - show why it has to be this way, don't just assert what it is.",
    },
    formalStatement: {
      type: SchemaType.STRING,
      description: "The precise, formal statement of the concept - given only now that the reasoning has earned it",
    },
    example: {
      type: SchemaType.STRING,
      description: "A concrete, specific worked example that grounds the abstraction - numbers, a scenario, an actual case",
    },
    misconception: {
      type: SchemaType.STRING,
      description: "A SPECIFIC, named misconception people actually have about this - state it, then say exactly why it's wrong",
    },
  },
  required: ["foundation", "reasoning", "formalStatement", "example", "misconception"],
};

const nodeSchema = {
  type: SchemaType.OBJECT,
  properties: {
    id: { type: SchemaType.STRING, description: "short kebab-case id, unique within the curriculum" },
    title: { type: SchemaType.STRING },
    depth: { type: SchemaType.NUMBER, description: "0 = most foundational, increasing = more advanced" },
    explanation: explanationSchema,
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
          question: { type: SchemaType.STRING, description: "test REASONING or application, not recall - 'why' or 'what happens if' questions beat 'what is X called' questions" },
          options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          correctIndex: { type: SchemaType.NUMBER },
          explanation: { type: SchemaType.STRING },
        },
        required: ["id", "question", "options", "correctIndex", "explanation"],
      },
      description: "exactly 2 multiple-choice questions, 4 options each",
    },
  },
  required: ["id", "title", "depth", "explanation", "whyItMatters", "prerequisites", "estMinutes", "retention", "quiz"],
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

const SYSTEM_PROMPT = `You are teaching someone a topic from first principles - the way a superb professor would, not the way an encyclopedia would. Your job is to build a "foundational mastery path": a prerequisite-ordered sequence of concepts, each one REASONED INTO EXISTENCE, never just defined.

The single most important rule: NEVER open with a definition. A definition is the destination of the reasoning, not the starting line. Bad: "Entropy is a measure of disorder in a system." Good: start from counting how many microscopic arrangements produce the same macroscopic state, notice that overwhelmingly more arrangements look "mixed" than "ordered", reason that a system left alone drifts toward whichever macrostate has the most arrangements simply because that's where it's statistically likely to end up - and only THEN name that quantity entropy and give S = k ln W. The reader should feel the concept was inevitable by the time you name it, not memorized.

For every node's "explanation":
- foundation: name exactly what prior knowledge this reasoning leans on (ideally an earlier node in this same path).
- reasoning: actually derive or build up the idea. Use concrete numbers, thought experiments, or a specific scenario rather than abstract language. Write 2-3 short paragraphs (separate with a blank line). This is the part that must never degrade into "X is Y" - it should read like you're reconstructing the idea live, showing why it has to work this way.
- formalStatement: NOW give the precise, textbook-accurate statement - it should feel like the reasoning already proved it, this is just naming it.
- example: one concrete worked case with real specifics (numbers, a real scenario), not another abstract restatement.
- misconception: name a REAL, specific mistake people make here (not a strawman) and explain precisely why it's wrong, ideally by pointing back at a step in the reasoning that resolves it.

Other rules:
- Produce 8 to 12 concept nodes ordered so that each node's prerequisites (by id) are strictly earlier/foundational relative to it.
- depth 0 nodes have no prerequisites. Later nodes reference only earlier node ids as prerequisites. The graph must be a valid DAG - no cycles, no forward references.
- Every non-root node needs at least one prerequisite; most should have 1-2.
- Quiz questions test whether the reasoning landed, not whether a term was memorized - favor "why does X happen" or "what would change if Y" over "what is X called".
- retention should vary honestly per node: "slow" for durable first-principles/derivation-heavy ideas, "medium" for standard conceptual ideas, "fast" for fact-heavy or context-specific ideas.
- Write for an intelligent adult encountering this for the first time, aiming for near-foundational mastery - rigorous, not dumbed down, but built up rather than dropped on them.

Before outputting, silently self-check every node against this rubric, and fix anything that fails BEFORE you respond - don't show the check, just apply it:
1. Does "reasoning" actually derive the concept, or does it just restate/define it in different words? A disguised definition must be rewritten to genuinely build the idea up from the foundation, using a concrete scenario or numbers.
2. Is "foundation" something the reader would actually already have at this point in the path (an earlier node, or genuine common knowledge for depth 0)?
3. Is "misconception" a real, specific, named error - not a vague strawman?
4. Do quiz questions test understanding of the reasoning (why/what-if) rather than recall of a label?
5. Is the prerequisite graph a valid DAG with no forward references, and does every non-root node's depth exceed all of its prerequisites' depths?

Respond with JSON only, matching the provided schema exactly - the final, self-checked version, not a draft.`;

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
    const generationConfig = {
      responseMimeType: "application/json" as const,
      responseSchema: curriculumSchema as unknown as Schema,
    };

    // One call: the system prompt already bakes in a self-check-before-responding rubric,
    // rather than a second network round trip - two sequential calls risked exceeding the
    // serverless function's execution limit on top of Gemini's own free-tier latency.
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig,
    });
    const result = await model.generateContent(`Build the foundational mastery path for: "${topic}"`);
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
