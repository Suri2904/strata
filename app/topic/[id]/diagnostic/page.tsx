"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useStrataStore } from "@/lib/store";

interface DiagnosticQuestion {
  conceptId: string;
  question: string;
  options: string[];
  correctIndex: number;
}

type FetchState = "loading" | "ready" | "no-key" | "error";

const MAX_QUESTIONS = 8;

/** Evenly spaced sample across the full concept list, so an 8-question diagnostic on a
 * 9-concept topic still covers the whole span rather than clustering at the start. */
function sampleConcepts<T>(items: T[], max: number): T[] {
  if (items.length <= max) return items;
  const step = items.length / max;
  const out: T[] = [];
  for (let i = 0; i < max; i++) out.push(items[Math.floor(i * step)]);
  return out;
}

export default function DiagnosticPage() {
  const { id } = useParams<{ id: string }>();

  const topic = useStrataStore((s) => s.topics.find((t) => t.id === id));
  const skipConcept = useStrataStore((s) => s.skipConcept);

  const [state, setState] = useState<FetchState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ known: number; total: number } | null>(null);

  useEffect(() => {
    if (!topic) return;
    const sample = sampleConcepts(topic.concepts, MAX_QUESTIONS).map((c) => ({
      id: c.id,
      title: c.title,
      oneLiner: c.oneLiner,
    }));
    fetch("/api/diagnostic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: topic.name, level: topic.level, concepts: sample }),
    })
      .then(async (res) => {
        const body = await res.json();
        if (res.status === 501) {
          setState("no-key");
          return;
        }
        if (!res.ok) {
          setErrorMessage(body.message ?? "Couldn't build a diagnostic.");
          setState("error");
          return;
        }
        setQuestions(body.questions);
        setState("ready");
      })
      .catch(() => {
        setErrorMessage("Couldn't reach the generator. Check your connection and try again.");
        setState("error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic?.id]);

  if (!topic) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-[640px] px-5 py-12">
          <p className="text-sm text-[var(--ink-soft)]">Topic not found.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-[var(--accent)]">
            ← Back home
          </Link>
        </main>
      </div>
    );
  }

  function submit() {
    let known = 0;
    for (const q of questions) {
      if (answers[q.conceptId] === q.correctIndex) {
        skipConcept(topic!.id, q.conceptId);
        known++;
      }
    }
    setResult({ known, total: questions.length });
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-[640px] px-5 py-12">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Quick diagnostic</h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          A few questions to find your real gaps, so you skip what you already know.
        </p>

        {(state === "loading") && <p className="mt-8 text-sm text-[var(--ink-soft)]">Building your diagnostic…</p>}

        {(state === "no-key" || state === "error") && (
          <div className="mt-8">
            <p className="text-sm text-[var(--warning)]">
              {state === "no-key" ? "No Gemini API key is configured on the server yet." : errorMessage}
            </p>
            <Link
              href={`/topic/${topic.id}`}
              className="mt-4 inline-block rounded-lg px-5 py-2.5 text-sm font-semibold text-[var(--paper)]"
              style={{ background: "var(--ink)" }}
            >
              Skip diagnostic
            </Link>
          </div>
        )}

        {state === "ready" && !result && (
          <div className="mt-8 space-y-8">
            {questions.map((q, i) => (
              <div key={q.conceptId} className="border-t border-[var(--border-hairline)] pt-6">
                <p className="text-xs text-[var(--ink-faint)]">Question {i + 1} of {questions.length}</p>
                <p className="mt-2 text-base leading-relaxed">{q.question}</p>
                <div className="mt-3 space-y-2">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => setAnswers((a) => ({ ...a, [q.conceptId]: oi }))}
                      className="block w-full rounded-lg border px-3 py-2 text-left text-sm"
                      style={{
                        borderColor: answers[q.conceptId] === oi ? "var(--accent)" : "var(--border-hairline)",
                        background: answers[q.conceptId] === oi ? "var(--accent-soft)" : "transparent",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center gap-4">
              <button
                onClick={submit}
                disabled={Object.keys(answers).length < questions.length}
                className="rounded-lg px-5 py-2.5 text-sm font-semibold text-[var(--paper)] disabled:opacity-40"
                style={{ background: "var(--ink)" }}
              >
                See results
              </button>
              <Link href={`/topic/${topic.id}`} className="text-sm text-[var(--ink-faint)] underline">
                Skip diagnostic
              </Link>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-8 border-t border-[var(--border-hairline)] pt-6">
            <p className="text-base leading-relaxed">
              {result.known === 0
                ? "Looks like everything here is genuinely new — the full path is ahead of you."
                : `You already know ${result.known} of ${result.total} concepts tested — those are marked and your path starts at the first real gap.`}
            </p>
            <Link
              href={`/topic/${topic.id}`}
              className="mt-6 inline-block rounded-lg px-5 py-2.5 text-sm font-semibold text-[var(--paper)]"
              style={{ background: "var(--ink)" }}
            >
              Continue to path
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
