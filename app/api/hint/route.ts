import { NextRequest, NextResponse } from "next/server";
import { generateText, NoApiKeyError, QuotaExceededError } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let topic: string;
  let conceptTitle: string;
  let conceptOneLiner: string;
  let hookQuestion: string;
  let priorAttempt: string;
  let hintLevel: number;
  try {
    const body = await req.json();
    topic = String(body.topic ?? "").trim();
    conceptTitle = String(body.concept?.title ?? "");
    conceptOneLiner = String(body.concept?.oneLiner ?? "");
    hookQuestion = String(body.hookQuestion ?? "");
    priorAttempt = String(body.priorAttempt ?? "");
    hintLevel = Number(body.hintLevel ?? 1);
  } catch {
    return NextResponse.json({ error: "bad-request", message: "Malformed request body." }, { status: 400 });
  }

  if (!topic || !conceptTitle) {
    return NextResponse.json({ error: "bad-request", message: "Missing topic or concept." }, { status: 400 });
  }

  const escalation =
    hintLevel >= 3
      ? "This is the THIRD and final hint — get noticeably more specific, close enough that a focused guess should land, but still stop short of stating the concept's name or its core idea outright."
      : hintLevel === 2
        ? "This is the SECOND hint — narrower than a first nudge: point at the specific mechanism or relationship involved, without naming the concept."
        : "This is the FIRST hint — just a gentle nudge toward the right way of thinking about it, nothing specific yet.";

  const prompt = `Topic: "${topic}". Concept (don't name it or define it): "${conceptTitle}" — ${conceptOneLiner}.
The learner is trying to predict the answer to this question before seeing any explanation:
"${hookQuestion}"
${priorAttempt.trim() ? `Their attempt so far: """${priorAttempt}"""` : "They haven't written anything yet."}

Give ONE short hint (1-2 sentences) to help them reason toward it themselves. ${escalation}
Never state the concept's name or its formal answer. Respond with ONLY the hint text — no preamble, no labels like "Hint:".`;

  try {
    const hint = await generateText(prompt);
    return NextResponse.json({ hint });
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
    console.error("Hint generation failed:", err);
    return NextResponse.json({ error: "generation-failed", message: "Couldn't get a hint right now." }, { status: 502 });
  }
}
