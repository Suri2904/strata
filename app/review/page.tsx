"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { useStrataStore } from "@/lib/store";
import { dueConcepts } from "@/lib/selectors";
import { daysUntil } from "@/lib/spacedRepetition";
import { RetrieveGrade } from "@/lib/types";

export default function ReviewPage() {
  const topics = useStrataStore((s) => s.topics);
  const recordReview = useStrataStore((s) => s.recordReview);

  const queue = useMemo(() => dueConcepts(topics), [topics]);
  const [cursor, setCursor] = useState(0);

  const [answer, setAnswer] = useState("");
  const [grade, setGrade] = useState<RetrieveGrade | null>(null);
  const [nextReview, setNextReview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const current = queue[cursor];

  if (queue.length === 0 || cursor >= queue.length) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-[640px] px-5 py-12">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {queue.length === 0 ? "Nothing due right now" : "All caught up"}
          </h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            {queue.length === 0
              ? "Come back when a concept is due for review."
              : `You reviewed ${queue.length} concept${queue.length === 1 ? "" : "s"}.`}
          </p>
          <Link href="/" className="mt-6 inline-block text-sm text-[var(--accent)]">
            ← Back home
          </Link>
        </main>
      </div>
    );
  }

  const { topic, concept } = current;

  async function submit() {
    if (!answer.trim() || !concept.detail) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/retrieve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.name,
          concept: { title: concept.title, oneLiner: concept.oneLiner },
          coreIdea: concept.detail.coreIdea,
          why: concept.detail.why,
          userAnswer: answer,
          isReview: true,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.message ?? "Couldn't grade that right now.");
        return;
      }
      const g: RetrieveGrade = body.grade;
      recordReview(topic.id, concept.id, g.score, g.fluencyWarning);
      setGrade(g);
      // read the freshly-scheduled date back from the store rather than recomputing it here
      const updated = useStrataStore
        .getState()
        .topics.find((t) => t.id === topic.id)
        ?.concepts.find((c) => c.id === concept.id);
      setNextReview(updated?.nextReview ?? null);
    } catch {
      setError("Couldn't reach the grader. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    setAnswer("");
    setGrade(null);
    setNextReview(null);
    setError("");
    setCursor((c) => c + 1);
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-[640px] px-5 py-12">
        <p className="text-xs text-[var(--ink-faint)]">
          Review {cursor + 1} of {queue.length} · {topic.name}
        </p>
        <h1 className="font-display mt-2 text-2xl leading-snug">
          Explain <span className="italic">{concept.title}</span> from memory.
        </h1>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={5}
          disabled={!!grade}
          placeholder="Type your explanation…"
          className="mt-6 w-full border-b border-[var(--border-strong)] py-2 text-base outline-none placeholder:text-[var(--ink-faint)] focus:border-[var(--accent)] disabled:opacity-70"
        />

        {error && <p className="mt-3 text-sm text-[var(--warning)]">{error}</p>}

        {!grade ? (
          <button
            onClick={submit}
            disabled={!answer.trim() || submitting}
            className="mt-6 rounded-lg px-5 py-2.5 text-sm font-semibold text-[var(--paper)] disabled:opacity-40"
            style={{ background: "var(--ink)" }}
          >
            {submitting ? "Grading…" : "Grade my explanation"}
          </button>
        ) : (
          <div className="mt-6 border-t border-[var(--border-hairline)] pt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
              Score: {grade.score} / 5
            </p>
            <p className="mt-2 text-base leading-relaxed">{grade.feedback}</p>
            {grade.fluencyWarning && (
              <p className="mt-3 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
                This reads fluent but light on real content — that ease can feel like knowing it when it isn&apos;t.
              </p>
            )}
            {nextReview && (
              <p className="mt-3 text-sm text-[var(--ink-soft)]">
                Next review in {Math.max(1, daysUntil(nextReview))} day{Math.max(1, daysUntil(nextReview)) === 1 ? "" : "s"}.
              </p>
            )}
            <button
              onClick={next}
              className="mt-6 rounded-lg px-5 py-2.5 text-sm font-semibold text-[var(--paper)]"
              style={{ background: "var(--ink)" }}
            >
              {cursor + 1 >= queue.length ? "Finish" : "Next"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
