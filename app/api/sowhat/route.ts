import { NextRequest, NextResponse } from "next/server";
import { generateText, NoApiKeyError } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let conceptTitle: string;
  let soWhatAnswer: string;
  try {
    const body = await req.json();
    conceptTitle = String(body.concept?.title ?? "");
    soWhatAnswer = String(body.soWhatAnswer ?? "");
  } catch {
    return NextResponse.json({ error: "bad-request", message: "Malformed request body." }, { status: 400 });
  }

  if (!conceptTitle || !soWhatAnswer.trim()) {
    return NextResponse.json({ error: "bad-request", message: "Missing required fields." }, { status: 400 });
  }

  const prompt = `Concept: "${conceptTitle}". The learner was asked "what does understanding this change for you — a prediction, a decision, or a link to something else you know" and answered:
"""${soWhatAnswer}"""
In one or two plain sentences, tell them directly whether this counts as a real "so what" or is still just restating information — and if it's just information, give one concrete example of what a real so-what would look like here. Respond with ONLY that text, no JSON, no preamble.`;

  try {
    const text = await generateText(prompt);
    return NextResponse.json({ text });
  } catch (err) {
    if (err instanceof NoApiKeyError) {
      return NextResponse.json(
        { error: "no-api-key", message: "No Gemini API key is configured on the server yet." },
        { status: 501 },
      );
    }
    console.error("So-what check failed:", err);
    return NextResponse.json(
      { error: "generation-failed", message: "Couldn't check that right now. Try again." },
      { status: 502 },
    );
  }
}
