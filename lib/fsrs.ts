import { Card, CardInput, createEmptyCard, fsrs, Grade, Rating } from "ts-fsrs";
import { FsrsCard } from "./types";

const scheduler = fsrs({ enable_fuzz: false, request_retention: 0.9 });

function toCardInput(card: FsrsCard): CardInput {
  return {
    due: card.due,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review,
  };
}

function fromCard(card: Card): FsrsCard {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review ? card.last_review.toISOString() : null,
  };
}

/**
 * Maps our 1-5 grader score + fluency warning onto FSRS's Again/Hard/Good/Easy scale.
 * A fluency warning always forces "Again" — an answer that sounds confident but is hollow
 * should reset the interval, not extend it, regardless of the raw score.
 */
export function gradeToRating(score: number, fluencyWarning: boolean): Grade {
  if (fluencyWarning || score <= 2) return Rating.Again;
  if (score === 3) return Rating.Hard;
  if (score === 4) return Rating.Good;
  return Rating.Easy;
}

/**
 * Schedules the next review. `card` is null for a concept's very first FSRS review — the
 * Retrieve-stage grade that marks a concept "learned" doubles as that first review, so the
 * initial interval already reflects how well it actually landed, not a fixed default.
 */
export function scheduleNext(
  card: FsrsCard | null,
  score: number,
  fluencyWarning: boolean,
  now: Date = new Date(),
): FsrsCard {
  const rating = gradeToRating(score, fluencyWarning);
  const input: CardInput | Card = card ? toCardInput(card) : createEmptyCard(now);
  const result = scheduler.next(input, now, rating);
  return fromCard(result.card);
}

/** For concepts marked "already known" via the diagnostic or a manual skip — no real review
 * has happened yet, so this just creates an empty card due immediately, rather than inventing
 * a grade. The first real review (soon, since it's due now) is what actually earns the interval. */
export function initialCard(now: Date = new Date()): FsrsCard {
  return fromCard(createEmptyCard(now));
}

export function isDue(card: FsrsCard | null, now: Date = new Date()): boolean {
  if (!card) return false;
  return new Date(card.due).getTime() <= now.getTime();
}

export function daysUntil(card: FsrsCard, now: Date = new Date()): number {
  return Math.ceil((new Date(card.due).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
