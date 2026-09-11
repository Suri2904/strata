import { Curriculum } from "../types";
import { specialRelativity } from "./specialRelativity";
import { bayesianThinking } from "./bayesianThinking";

export const CURATED_CURRICULA: Record<string, Curriculum> = {
  [specialRelativity.slug]: specialRelativity,
  [bayesianThinking.slug]: bayesianThinking,
};

export const CURATED_LIST = Object.values(CURATED_CURRICULA);

export function getCuratedCurriculum(slug: string): Curriculum | undefined {
  return CURATED_CURRICULA[slug];
}

export function slugify(topic: string): string {
  return topic
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
