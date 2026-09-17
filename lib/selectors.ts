import { Concept, Topic } from "./types";
import { isDue } from "./spacedRepetition";

export function learnedCount(topic: Topic): number {
  return topic.concepts.filter((c) => c.status === "learned").length;
}

/** The frontier concept: the single next concept the learner may start. Linear, sequential unlock. */
export function frontierIndex(topic: Topic): number {
  const idx = topic.concepts.findIndex((c) => c.status !== "learned");
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
      if (concept.status === "learned" && isDue(concept.nextReview, now)) {
        items.push({ topic, concept });
      }
    }
  }
  return items.sort((a, b) => (a.concept.nextReview ?? "").localeCompare(b.concept.nextReview ?? ""));
}

export function topicDueCount(topic: Topic, now: Date = new Date()): number {
  return topic.concepts.filter((c) => c.status === "learned" && isDue(c.nextReview, now)).length;
}
