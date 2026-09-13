"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStrataStore } from "@/lib/store";
import { CURATED_LIST, slugify } from "@/lib/curricula";
import { masteredCount } from "@/lib/selectors";
import TopBar from "@/components/TopBar";
import TopicNetwork from "@/components/TopicNetwork";

export default function Home() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const curricula = useStrataStore((s) => s.curricula);
  const progress = useStrataStore((s) => s.progress);
  const deleteCurriculum = useStrataStore((s) => s.deleteCurriculum);

  const yourTopics = Object.values(curricula).filter((c) => c.source === "gemini");

  function goToTopic(t: string) {
    const slug = slugify(t);
    if (!slug) return;
    setSubmitting(true);
    router.push(`/map/${slug}?topic=${encodeURIComponent(t)}`);
  }

  function handleDelete(e: React.MouseEvent, slug: string, topicName: string) {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Delete "${topicName}"? This removes its progress and can't be undone.`)) {
      deleteCurriculum(slug);
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar />

      <section className="relative overflow-hidden border-b border-[var(--border-hairline)] px-5 pb-16 pt-20 sm:px-8 sm:pt-28">
        <div className="grid-backdrop pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border-hairline)] bg-[var(--surface-1)] px-3.5 py-1.5 text-xs text-[var(--ink-secondary)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-strong)]" />
            A personal learning engine
          </p>
          <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
            Learn anything.
            <br />
            In the right order.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-base text-[var(--ink-secondary)] sm:text-lg">
            Type a topic. Get the exact prerequisite path to near-foundational mastery —
            then a system that keeps you reviewing until it actually sticks.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <p className="text-xs uppercase tracking-wider text-[var(--ink-muted)]">Section 1</p>
        <h2 className="font-display mt-1 text-xl font-semibold">Curated library</h2>
        <p className="mt-1.5 max-w-xl text-sm text-[var(--ink-secondary)]">
          Pre-built paths, ready instantly — no generation, no key required.
        </p>
        <div className="mt-10">
          <TopicNetwork topics={CURATED_LIST} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl border-t border-[var(--border-hairline)] px-5 py-16 sm:px-8">
        <p className="text-xs uppercase tracking-wider text-[var(--ink-muted)]">Section 2</p>
        <h2 className="font-display mt-1 text-xl font-semibold">Your topics</h2>
        <p className="mt-1.5 max-w-xl text-sm text-[var(--ink-secondary)]">
          Search any topic to generate a new path for it, or manage the ones you&apos;ve already built.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (topic.trim()) goToTopic(topic.trim());
          }}
          className="mt-6 flex flex-col gap-3 sm:flex-row"
        >
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. thermodynamics, macroeconomics, the fall of Rome…"
            className="w-full flex-1 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-1)] px-4 py-3.5 text-sm text-[var(--ink-primary)] outline-none placeholder:text-[var(--ink-muted)] focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            disabled={submitting || !topic.trim()}
            className="shrink-0 rounded-xl bg-[var(--ink-primary)] px-6 py-3.5 text-sm font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Build my path
          </button>
        </form>

        {yourTopics.length > 0 && (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--ink-secondary)]">
                {yourTopics.length} topic{yourTopics.length === 1 ? "" : "s"} built
              </p>
              <Link href="/loop" className="text-sm text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]">
                Execution Loop →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {yourTopics.map((c) => {
                const done = masteredCount(c, progress);
                const total = c.nodes.length;
                const pct = total ? Math.round((done / total) * 100) : 0;
                return (
                  <Link
                    key={c.slug}
                    href={`/map/${c.slug}`}
                    className="group relative rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-5 transition-colors hover:border-[var(--border-strong)]"
                  >
                    <button
                      onClick={(e) => handleDelete(e, c.slug, c.topic)}
                      aria-label={`Delete ${c.topic}`}
                      className="absolute right-3 top-3 rounded-lg p-1.5 text-[var(--ink-muted)] opacity-0 transition-opacity hover:bg-[var(--surface-3)] hover:text-[var(--critical)] group-hover:opacity-100"
                    >
                      <TrashIcon />
                    </button>
                    <div className="flex items-center justify-between pr-6">
                      <h3 className="font-display font-semibold">{c.topic}</h3>
                      <span className="text-xs text-[var(--ink-muted)]">
                        {done}/{total}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-[var(--ink-secondary)]">{c.tagline}</p>
                    <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
                      <div
                        className="h-full rounded-full bg-[var(--accent)] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl border-t border-[var(--border-hairline)] px-5 py-16 sm:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Prerequisite graphs, not reading lists",
              body: "Every concept sits at the exact depth its prerequisites earn it. You always know what to learn next, and why it had to wait.",
            },
            {
              title: "Calibrated, not just quizzed",
              body: "Predict your confidence before every check. Strata tracks whether your confidence actually matches your accuracy over time.",
            },
            {
              title: "Retention-aware review",
              body: "Different knowledge decays at different rates. The Execution Loop schedules review around each concept's real half-life.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-[var(--border-hairline)] p-5">
              <h3 className="font-display text-sm font-semibold text-[var(--ink-primary)]">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--border-hairline)] px-5 py-8 text-center text-xs text-[var(--ink-muted)] sm:px-8">
        Strata — a personal project. Built by Suryansh.
      </footer>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7h16M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3m3 0-.8 12.1a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7h12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
