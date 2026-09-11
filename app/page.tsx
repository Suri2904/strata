"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStrataStore } from "@/lib/store";
import { CURATED_LIST, slugify } from "@/lib/curricula";
import { masteredCount } from "@/lib/selectors";
import TopBar from "@/components/TopBar";

export default function Home() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const curricula = useStrataStore((s) => s.curricula);
  const progress = useStrataStore((s) => s.progress);

  const inProgress = Object.values(curricula);

  function goToTopic(t: string) {
    const slug = slugify(t);
    if (!slug) return;
    setSubmitting(true);
    router.push(`/map/${slug}?topic=${encodeURIComponent(t)}`);
  }

  return (
    <div className="min-h-screen">
      <TopBar />

      <section className="grid-backdrop relative overflow-hidden border-b border-[var(--border-hairline)] px-5 pb-20 pt-20 sm:px-8 sm:pt-28">
        <div className="mx-auto max-w-3xl text-center">
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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (topic.trim()) goToTopic(topic.trim());
            }}
            className="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row"
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

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-[var(--ink-muted)]">
            <span>Curated &amp; instant, no key needed:</span>
            {CURATED_LIST.map((c) => (
              <button
                key={c.slug}
                onClick={() => goToTopic(c.topic)}
                className="rounded-full border border-[var(--border-hairline)] bg-[var(--surface-1)] px-3 py-1 text-[var(--ink-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--ink-primary)]"
              >
                {c.topic}
              </button>
            ))}
          </div>
        </div>
      </section>

      {inProgress.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Continue</h2>
            <Link href="/loop" className="text-sm text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]">
              Execution Loop →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inProgress.map((c) => {
              const done = masteredCount(c, progress);
              const total = c.nodes.length;
              const pct = total ? Math.round((done / total) * 100) : 0;
              return (
                <Link
                  key={c.slug}
                  href={`/map/${c.slug}`}
                  className="group rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-5 transition-colors hover:border-[var(--border-strong)]"
                >
                  <div className="flex items-center justify-between">
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
        </section>
      )}

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
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
