"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useStrataStore } from "@/lib/store";
import {
  dueReviews,
  compoundingSeries,
  cadenceSeries,
  currentStreak,
  calibrationError,
  lastSessionAt,
  masteredCount,
} from "@/lib/selectors";
import { daysUntil } from "@/lib/spacedRepetition";
import TopBar from "@/components/TopBar";
import StatTile from "@/components/StatTile";
import CompoundingChart from "@/components/CompoundingChart";
import CadenceChart from "@/components/CadenceChart";
import NodePanel from "@/components/NodePanel";
import { ConceptNode, Curriculum } from "@/lib/types";

export default function LoopPage() {
  const curricula = useStrataStore((s) => s.curricula);
  const progress = useStrataStore((s) => s.progress);
  const sessionLog = useStrataStore((s) => s.sessionLog);
  const recordAttempt = useStrataStore((s) => s.recordAttempt);
  const getNodeStatus = useStrataStore((s) => s.getNodeStatus);

  const [reviewTarget, setReviewTarget] = useState<{ curriculum: Curriculum; node: ConceptNode } | null>(null);

  const due = useMemo(() => dueReviews(curricula, progress), [curricula, progress]);
  const compounding = useMemo(() => compoundingSeries(sessionLog), [sessionLog]);
  const cadence = useMemo(() => cadenceSeries(sessionLog, 14), [sessionLog]);
  const streak = useMemo(() => currentStreak(sessionLog), [sessionLog]);
  const calibErr = useMemo(() => calibrationError(sessionLog), [sessionLog]);
  const totalMastered = useMemo(
    () => Object.values(curricula).reduce((sum, c) => sum + masteredCount(c, progress), 0),
    [curricula, progress],
  );

  const lastTime = useMemo(() => lastSessionAt(sessionLog)?.getTime() ?? null, [sessionLog]);
  // Date.now() is an impure read of the external clock, so it's captured in an effect rather than during render.
  const [daysSinceLast, setDaysSinceLast] = useState<number | null>(null);
  useEffect(() => {
    // Syncing from an external, impure source (the clock) is exactly what an effect is for here —
    // there's no pure way to derive "days since" during render itself.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDaysSinceLast(lastTime !== null ? Math.floor((Date.now() - lastTime) / 86_400_000) : null);
  }, [lastTime]);
  const showFriction = daysSinceLast !== null && daysSinceLast >= 2;

  const smallestNextAction = useMemo(() => {
    if (due.length > 0) return { label: `Review "${due[0].node.title}"`, curriculum: due[0].curriculum, node: due[0].node };
    for (const curriculum of Object.values(curricula)) {
      const next = curriculum.nodes
        .filter((n) => getNodeStatus(curriculum.slug, n) === "available")
        .sort((a, b) => a.estMinutes - b.estMinutes)[0];
      if (next) return { label: `Start "${next.title}" (${next.estMinutes} min)`, curriculum, node: next };
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [due, curricula, progress]);

  const hasAnyCurriculum = Object.keys(curricula).length > 0;

  return (
    <div className="min-h-screen">
      <TopBar active="loop" />
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Execution Loop</h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--ink-secondary)]">
          Knowing the path isn&apos;t the hard part. This is the loop that keeps you actually reviewing until it sticks.
        </p>

        {!hasAnyCurriculum ? (
          <div className="mt-10 rounded-2xl border border-dashed border-[var(--border-hairline)] p-10 text-center">
            <p className="text-sm text-[var(--ink-secondary)]">Nothing to execute on yet.</p>
            <Link href="/" className="mt-4 inline-block rounded-xl bg-[var(--ink-primary)] px-5 py-2.5 text-sm font-semibold text-[#0a0a0a]">
              Start a mastery path
            </Link>
          </div>
        ) : (
          <>
            {showFriction && smallestNextAction && (
              <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-[var(--warning)]/30 bg-[var(--warning)]/10 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-[var(--ink-primary)]">
                    {daysSinceLast} days since your last session — momentum is the friction point right now.
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--ink-secondary)]">Smallest next action: {smallestNextAction.label}</p>
                </div>
                <button
                  onClick={() => setReviewTarget({ curriculum: smallestNextAction.curriculum, node: smallestNextAction.node })}
                  className="shrink-0 rounded-xl bg-[var(--ink-primary)] px-4 py-2 text-xs font-semibold text-[#0a0a0a] hover:opacity-90"
                >
                  Do it now
                </button>
              </div>
            )}

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatTile label="Concepts mastered" value={String(totalMastered)} />
              <StatTile label="Current streak" value={`${streak}d`} tone={streak > 0 ? "good" : "default"} />
              <StatTile
                label="Calibration error"
                value={calibErr === null ? "—" : `±${calibErr}`}
                hint={calibErr === null ? undefined : calibErr <= 10 ? "well-calibrated" : calibErr <= 20 ? "somewhat off" : "recalibrate"}
                tone={calibErr === null ? "default" : calibErr <= 10 ? "good" : calibErr <= 20 ? "warning" : "critical"}
              />
              <StatTile
                label="Due today"
                value={String(due.length)}
                tone={due.length > 0 ? "warning" : "good"}
              />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <CompoundingChart data={compounding} />
              <CadenceChart data={cadence} />
            </div>

            <div className="mt-10">
              <h2 className="font-display text-lg font-semibold">Review queue</h2>
              {due.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--ink-secondary)]">Nothing due — you&apos;re caught up.</p>
              ) : (
                <div className="mt-3 divide-y divide-[var(--border-hairline)] overflow-hidden rounded-2xl border border-[var(--border-hairline)]">
                  {due.map(({ curriculum, node, progress: p }) => (
                    <button
                      key={`${curriculum.slug}::${node.id}`}
                      onClick={() => setReviewTarget({ curriculum, node })}
                      className="flex w-full items-center justify-between px-5 py-3.5 text-left hover:bg-[var(--surface-2)]"
                    >
                      <div>
                        <p className="text-sm text-[var(--ink-primary)]">{node.title}</p>
                        <p className="text-xs text-[var(--ink-muted)]">{curriculum.topic}</p>
                      </div>
                      <span className="text-xs text-[var(--warning)]">
                        {p.nextReviewAt ? `${Math.abs(daysUntil(p.nextReviewAt))}d overdue` : "due"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-10">
              <h2 className="font-display text-lg font-semibold">Active paths</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {Object.values(curricula).map((c) => {
                  const done = masteredCount(c, progress);
                  return (
                    <Link
                      key={c.slug}
                      href={`/map/${c.slug}`}
                      className="rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] px-4 py-3 text-sm hover:border-[var(--border-strong)]"
                    >
                      <span className="text-[var(--ink-primary)]">{c.topic}</span>
                      <span className="ml-2 text-xs text-[var(--ink-muted)]">
                        {done}/{c.nodes.length}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <NodePanel
        node={reviewTarget?.node ?? null}
        curriculum={reviewTarget?.curriculum as Curriculum}
        status="mastered"
        missingPrereqTitles={[]}
        onClose={() => setReviewTarget(null)}
        onComplete={(confidence, score) => {
          if (reviewTarget) recordAttempt(reviewTarget.curriculum, reviewTarget.node, confidence, score);
          setReviewTarget(null);
        }}
      />
    </div>
  );
}
