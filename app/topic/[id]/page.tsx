"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useStrataStore } from "@/lib/store";
import { frontierIndex } from "@/lib/selectors";
import { isDue } from "@/lib/fsrs";

export default function TopicPage() {
  const { id } = useParams<{ id: string }>();
  const topic = useStrataStore((s) => s.topics.find((t) => t.id === id));
  const skipConcept = useStrataStore((s) => s.skipConcept);
  const reorderConcept = useStrataStore((s) => s.reorderConcept);
  const addConcept = useStrataStore((s) => s.addConcept);
  const removeConcept = useStrataStore((s) => s.removeConcept);
  const setVerificationNote = useStrataStore((s) => s.setVerificationNote);

  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newOneLiner, setNewOneLiner] = useState("");

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

  const frontier = frontierIndex(topic);

  function submitAdd() {
    if (!newTitle.trim()) return;
    addConcept(topic!.id, newTitle.trim(), newOneLiner.trim() || "Added manually.");
    setNewTitle("");
    setNewOneLiner("");
    setAdding(false);
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-[640px] px-5 py-12">
        <p className="text-xs text-[var(--ink-faint)]">
          {topic.concepts.filter((c) => c.status === "learned" || c.status === "skipped").length} of{" "}
          {topic.concepts.length} learned
        </p>
        <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight">{topic.name}</h1>

        {topic.verificationNote && (
          <div className="mt-4 flex items-start justify-between gap-3 rounded-md bg-[var(--warning-soft)] px-3 py-2.5">
            <p className="text-sm text-[var(--warning)]">{topic.verificationNote}</p>
            <button
              onClick={() => setVerificationNote(topic.id, null)}
              className="shrink-0 text-xs text-[var(--warning)] underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <ol className="mt-8 border-t border-[var(--border-hairline)]">
          {topic.concepts.map((concept, i) => {
            const settled = concept.status === "learned" || concept.status === "skipped";
            const unlocked = i === frontier;
            const due = settled && isDue(concept.fsrs);
            const marker = concept.status === "learned" ? "✓" : concept.status === "skipped" ? "~" : String(i + 1);
            const row = (
              <div className="flex items-center gap-4 py-4">
                <span
                  className="w-5 shrink-0 text-sm tabular-nums"
                  style={{ color: settled ? "var(--good)" : "var(--ink-faint)" }}
                  title={concept.status === "skipped" ? "Marked already known" : undefined}
                >
                  {marker}
                </span>
                <div className="flex-1">
                  <p
                    className="font-display text-base"
                    style={{ color: unlocked || settled ? "var(--ink)" : "var(--ink-faint)" }}
                  >
                    {concept.title}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--ink-faint)]">{concept.oneLiner}</p>
                </div>
                {due && (
                  <span className="shrink-0 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
                    due
                  </span>
                )}
                {!settled && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        reorderConcept(topic.id, concept.id, "up");
                      }}
                      disabled={i <= frontier}
                      className="text-xs text-[var(--ink-faint)] hover:text-[var(--ink)] disabled:opacity-30"
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        reorderConcept(topic.id, concept.id, "down");
                      }}
                      disabled={i >= topic.concepts.length - 1}
                      className="text-xs text-[var(--ink-faint)] hover:text-[var(--ink)] disabled:opacity-30"
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeConcept(topic.id, concept.id);
                      }}
                      className="text-xs text-[var(--ink-faint)] hover:text-[var(--warning)]"
                      aria-label="Remove concept"
                    >
                      ✕
                    </button>
                  </div>
                )}
                {unlocked && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      skipConcept(topic.id, concept.id);
                    }}
                    className="shrink-0 text-xs text-[var(--ink-faint)] underline hover:text-[var(--ink)]"
                  >
                    I already know this
                  </button>
                )}
              </div>
            );
            return (
              <li key={concept.id} className="border-b border-[var(--border-hairline)]">
                {unlocked ? <Link href={`/topic/${topic.id}/concept/${concept.id}`}>{row}</Link> : row}
              </li>
            );
          })}
        </ol>

        <div className="mt-6">
          {adding ? (
            <div className="space-y-3 border-t border-[var(--border-hairline)] pt-6">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Concept title"
                className="w-full border-b border-[var(--border-strong)] bg-transparent py-2 text-sm outline-none placeholder:text-[var(--ink-faint)] focus:border-[var(--accent)]"
              />
              <input
                value={newOneLiner}
                onChange={(e) => setNewOneLiner(e.target.value)}
                placeholder="One-line description (optional)"
                className="w-full border-b border-[var(--border-strong)] bg-transparent py-2 text-sm outline-none placeholder:text-[var(--ink-faint)] focus:border-[var(--accent)]"
              />
              <div className="flex gap-3">
                <button
                  onClick={submitAdd}
                  disabled={!newTitle.trim()}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-[var(--paper)] disabled:opacity-40"
                  style={{ background: "var(--ink)" }}
                >
                  Add
                </button>
                <button onClick={() => setAdding(false)} className="text-sm text-[var(--ink-faint)]">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} className="text-sm text-[var(--accent)] underline">
              + Add a concept
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
