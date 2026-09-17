/** Leitner boxes 0-4, review intervals in days per box. */
const INTERVALS_DAYS = [1, 3, 7, 16, 35];
const MAX_BOX = INTERVALS_DAYS.length - 1;

export interface ScheduleResult {
  box: number;
  nextReview: string;
  intervalDays: number;
}

function atInterval(box: number, from: Date): ScheduleResult {
  const days = INTERVALS_DAYS[box];
  const next = new Date(from);
  next.setDate(next.getDate() + days);
  return { box, nextReview: next.toISOString(), intervalDays: days };
}

/** A newly-learned concept starts at box 0, due tomorrow. */
export function scheduleFirstLearned(from: Date = new Date()): ScheduleResult {
  return atInterval(0, from);
}

/**
 * Grade >=4 with no fluency warning: harder-to-repeat material earns a longer gap, box+1.
 * Grade <=2, or any fluency warning (fluent-sounding but hollow): back to box 0, daily review.
 * Grade ==3 with no warning: shaky but not wrong, hold the current box.
 */
export function scheduleAfterReview(
  box: number,
  score: number,
  fluencyWarning: boolean,
  from: Date = new Date(),
): ScheduleResult {
  let nextBox: number;
  if (score >= 4 && !fluencyWarning) nextBox = Math.min(box + 1, MAX_BOX);
  else if (score <= 2 || fluencyWarning) nextBox = 0;
  else nextBox = box;

  return atInterval(nextBox, from);
}

export function isDue(nextReview: string | null, now: Date = new Date()): boolean {
  if (!nextReview) return false;
  return new Date(nextReview).getTime() <= now.getTime();
}

export function daysUntil(iso: string, now: Date = new Date()): number {
  return Math.ceil((new Date(iso).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
