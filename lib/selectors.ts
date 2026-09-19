import { CalibrationEntry, Concept, Topic } from "./types";
import { isDue } from "./fsrs";

/** "learned" (evidence from the full lesson loop) or "skipped" (diagnostic/manual — lighter
 * evidence, but still done for unlock purposes; the first due review will confirm or catch it). */
function isSettled(c: Concept): boolean {
  return c.status === "learned" || c.status === "skipped";
}

export function learnedCount(topic: Topic): number {
  return topic.concepts.filter(isSettled).length;
}

/** The frontier concept: the single next concept the learner may start. Linear, sequential unlock. */
export function frontierIndex(topic: Topic): number {
  const idx = topic.concepts.findIndex((c) => !isSettled(c));
  return idx === -1 ? topic.concepts.length : idx;
}

export function isUnlocked(topic: Topic, index: number): boolean {
  return index === frontierIndex(topic);
}

export interface DueItem {
  topic: Topic;
  concept: Concept;
}

export function dueConcepts(topics: Topic[], now: Date = new Date()): DueItem[] {
  const items: DueItem[] = [];
  for (const topic of topics) {
    for (const concept of topic.concepts) {
      if (isSettled(concept) && isDue(concept.fsrs, now)) {
        items.push({ topic, concept });
      }
    }
  }
  return items.sort((a, b) => (a.concept.fsrs?.due ?? "").localeCompare(b.concept.fsrs?.due ?? ""));
}

export function topicDueCount(topic: Topic, now: Date = new Date()): number {
  return topic.concepts.filter((c) => isSettled(c) && isDue(c.fsrs, now)).length;
}

/** Round-robins across topics so a review session doesn't run through one topic's items in a
 * row before touching another's — mixing related-but-distinct material aids retention over
 * blocked practice. */
export function interleave(items: DueItem[]): DueItem[] {
  const byTopic = new Map<string, DueItem[]>();
  for (const item of items) {
    const list = byTopic.get(item.topic.id) ?? [];
    list.push(item);
    byTopic.set(item.topic.id, list);
  }
  const queues = [...byTopic.values()];
  const out: DueItem[] = [];
  let i = 0;
  while (out.length < items.length) {
    const q = queues[i % queues.length];
    if (q.length) out.push(q.shift()!);
    i++;
  }
  return out;
}

export interface CalibrationStats {
  count: number;
  meanAbsError: number;
  /** actual - predicted, averaged: positive = underconfident, negative = overconfident. */
  bias: number;
}

export function calibrationStats(log: CalibrationEntry[]): CalibrationStats | null {
  if (log.length === 0) return null;
  let absSum = 0;
  let biasSum = 0;
  for (const e of log) {
    absSum += Math.abs(e.actual - e.predicted);
    biasSum += e.actual - e.predicted;
  }
  return {
    count: log.length,
    meanAbsError: Math.round(absSum / log.length),
    bias: Math.round(biasSum / log.length),
  };
}
