import { RetentionSpeed } from "./types";

/** Base interval ladder in days, before the retention-speed multiplier. */
const BASE_STEPS = [1, 3, 7, 16, 35, 75, 160];

const RETENTION_MULTIPLIER: Record<RetentionSpeed, number> = {
  // Fast-decaying knowledge (trivia, syntax, fresh vocabulary) needs closer review.
  fast: 0.6,
  medium: 1,
  // Slow-decaying knowledge (formal math, first-principles physics) tolerates longer gaps.
  slow: 1.5,
};

export interface ScheduleResult {
  nextReviewAt: string;
  reviewStep: number;
  intervalDays: number;
}

/**
 * Given how a review went, compute the next step index and the resulting due date.
 * - score >= 85: advance two steps (strong recall, stretch the interval)
 * - score >= 70: advance one step (normal pass)
 * - score >= 50: hold the same step (shaky, review again at the same cadence)
 * - score <  50: drop back to step 0 (forgotten, needs to be re-anchored)
 */
export function scheduleNextReview(
  currentStep: number,
  quizScore: number,
  retention: RetentionSpeed,
  from: Date = new Date(),
): ScheduleResult {
  let nextStep: number;
  if (quizScore >= 85) nextStep = currentStep + 2;
  else if (quizScore >= 70) nextStep = currentStep + 1;
  else if (quizScore >= 50) nextStep = currentStep;
  else nextStep = 0;

  nextStep = Math.max(0, Math.min(nextStep, BASE_STEPS.length - 1));

  const baseDays = BASE_STEPS[nextStep];
  const intervalDays = Math.max(1, Math.round(baseDays * RETENTION_MULTIPLIER[retention]));

  const next = new Date(from);
  next.setDate(next.getDate() + intervalDays);

  return { nextReviewAt: next.toISOString(), reviewStep: nextStep, intervalDays };
}

export function isDue(nextReviewAt: string | undefined, now: Date = new Date()): boolean {
  if (!nextReviewAt) return false;
  return new Date(nextReviewAt).getTime() <= now.getTime();
}

export function daysUntil(iso: string, now: Date = new Date()): number {
  const ms = new Date(iso).getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
