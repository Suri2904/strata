"use client";

import Link from "next/link";
import { useStrataStore } from "@/lib/store";
import { dueConcepts, learnedCount, topicDueCount } from "@/lib/selectors";
import Header from "@/components/Header";

export default function Home() {
  const topics = useStrataStore((s) => s.topics);
  const due = dueConcepts(topics);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-[640px] px-5 py-12">
        <div className="flex items-baseline justify-between">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Your topics</h1>
          {due.length > 0 && (
            <Link
              href="/review"
              className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]"
            >
              {due.length} due for review
            </Link>
          )}
        </div>

        {topics.length === 0 ? (
          <div className="mt-10 border-t border-[var(--border-hairline)] pt-10">
            <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
              No topics yet. Name anything you want to learn from foundation to mastery, and Strata will
              order it into the sequence you actually need to learn it in.
            </p>
          </div>
        ) : (
          <ul className="mt-8 border-t border-[var(--border-hairline)]">
            {topics.map((t) => {
              const done = learnedCount(t);
              const total = t.concepts.length;
              const dueCount = topicDueCount(t);
              return (
                <li key={t.id} className="border-b border-[var(--border-hairline)]">
                  <Link href={`/topic/${t.id}`} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="font-display text-base">{t.name}</p>
                      <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
                        {done} of {total} concepts learned
                      </p>
                    </div>
                    {dueCount > 0 && (
                      <span className="shrink-0 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
                        {dueCount} due
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <Link
          href="/new"
          className="mt-8 inline-block rounded-lg px-5 py-2.5 text-sm font-semibold text-[var(--paper)]"
          style={{ background: "var(--ink)" }}
        >
          Start a new topic
        </Link>
      </main>
    </div>
  );
}
