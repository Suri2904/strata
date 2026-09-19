"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { useStrataStore } from "@/lib/store";
import { dueConcepts, DueItem, interleave } from "@/lib/selectors";
import { RetrieveGrade } from "@/lib/types";

const MINUTES_PER_REVIEW = 2;
const CONFIDENCE_LEVELS = [
  { label: "Guessing", value: 20 },
  { label: "Fairly sure", value: 55 },
  { label: "Confident", value: 90 },
] as const;

export default function ReviewPage() {
  const topics = useStrataStore((s) => s.topics);
  const recordReview = useStrataStore((s) => s.recordReview);
  const logCalibration = useStrataStore((s) => s.logCalibration);

  const allDue = useMemo(() => interleave(dueConcepts(topics)), [topics]);

  const [minutes, setMinutes] = useState<string>("15");
  const [queue, setQueue] = useState<DueItem[] | null>(null);
  const [cursor, setCursor] = useState(0);

  const [confidence, setConfidence] = useState<number | null>(null);
  const [answer, setAnswer] = useState("");
  const [grade, setGrade] = useState<RetrieveGrade | null>(null);
  const [nextReviewDays, setNextReviewDays] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (allDue.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-[640px] px-5 py-12">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Nothing due right now</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">Come back when a concept is due for review.</p>
          <Link href="/" className="mt-6 inline-block text-sm text-[var(--accent)]">
            ← Back home
          </Link>
        </main>
      </div>
    );
  }

  if (!queue) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-[640px] px-5 py-12">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {allDue.length} concept{allDue.length === 1 ? "" : "s"} due
          </h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">How many minutes do you have?</p>
          <input
            type="number"
            min={1}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="mt-4 w-24 border-b border-[var(--border-strong)] bg-transparent py-2 text-base outline-none focus:border-[var(--accent)]"
          />
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={() => {
                const fit = Math.max(1, Math.floor(Number(minutes || 0) / MINUTES_PER_REVIEW));
                setQueue(allDue.slice(0, fit));
              }}
              disabled={!minutes || Number(minutes) <= 0}
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-[var(--paper)] disabled:opacity-40"
              style={{ background: "var(--ink)" }}
            >
              Start review
            </button>
            <button onClick={() => setQueue(allDue)} className="text-sm text-[var(--accent)] underline">
              Review everything ({allDue.length})
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (cursor >= queue.length) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-[640px] px-5 py-12">
          <h1 className="font-display text-2xl font-semibold tracking-tight">All caught up</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            You reviewed {queue.length} concept{queue.length === 1 ? "" : "s"}.
          </p>
          <Link href="/" className="mt-6 inline-block text-sm text-[var(--accent)]">
            ← Back home
          </Link>
        </main>
      </div>
    );
  }

  const { topic, concept } = queue[cursor];

  async function submit() {
    if (!answer.trim() || !concept.detail || confidence === null) return;
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
          misconceptions: concept.detail.misconceptions,
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
      logCalibration({ topicId: topic.id, conceptId: concept.id, stage: "review", predicted: confidence, actual: g.score * 20 });
      setGrade(g);
      // read the freshly-scheduled card back from the store rather than recomputing it here
      const updated = useStrataStore
        .getState()
        .topics.find((t) => t.id === topic.id)
        ?.concepts.find((c) => c.id === concept.id);
      const due = updated?.fsrs?.due;
      setNextReviewDays(due ? Math.max(1, Math.ceil((new Date(due).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null);
    } catch {
      setError("Couldn't reach the grader. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    setConfidence(null);
    setAnswer("");
    setGrade(null);
    setNextReviewDays(null);
    setError("");
    setCursor((c) => c + 1);
  }

  const days = nextReviewDays;

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

        {!grade && (
          <div className="mt-4">
            <p className="text-xs text-[var(--ink-faint)]">How sure are you, before grading?</p>
            <div className="mt-2 flex gap-2">
              {CONFIDENCE_LEVELS.map((c) => (
                <button
                  key={c.label}
                  onClick={() => setConfidence(c.value)}
                  className="flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors"
                  style={{
                    borderColor: confidence === c.value ? "var(--accent)" : "var(--border-hairline)",
                    background: confidence === c.value ? "var(--accent-soft)" : "transparent",
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-[var(--warning)]">{error}</p>}

        {!grade ? (
          <button
            onClick={submit}
            disabled={!answer.trim() || confidence === null || submitting}
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
            {days !== null && (
              <p className="mt-3 text-sm text-[var(--ink-soft)]">
                Next review in {days} day{days === 1 ? "" : "s"}.
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
