"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useStrataStore } from "@/lib/store";
import { frontierIndex } from "@/lib/selectors";
import { isDue } from "@/lib/spacedRepetition";

export default function TopicPage() {
  const { id } = useParams<{ id: string }>();
  const topic = useStrataStore((s) => s.topics.find((t) => t.id === id));

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

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-[640px] px-5 py-12">
        <p className="text-xs text-[var(--ink-faint)]">
          {topic.concepts.filter((c) => c.status === "learned").length} of {topic.concepts.length} learned
        </p>
        <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight">{topic.name}</h1>

        <ol className="mt-8 border-t border-[var(--border-hairline)]">
          {topic.concepts.map((concept, i) => {
            const learned = concept.status === "learned";
            const unlocked = i === frontier;
            const due = learned && isDue(concept.nextReview);
            const row = (
              <div className="flex items-center gap-4 py-4">
                <span
                  className="w-5 shrink-0 text-sm tabular-nums"
                  style={{ color: learned ? "var(--good)" : "var(--ink-faint)" }}
                >
                  {learned ? "✓" : i + 1}
                </span>
                <div className="flex-1">
                  <p
                    className="font-display text-base"
                    style={{ color: unlocked || learned ? "var(--ink)" : "var(--ink-faint)" }}
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
              </div>
            );
            return (
              <li key={concept.id} className="border-b border-[var(--border-hairline)]">
                {unlocked ? <Link href={`/topic/${topic.id}/concept/${concept.id}`}>{row}</Link> : row}
              </li>
            );
          })}
        </ol>
      </main>
    </div>
  );
}
