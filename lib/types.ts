export type ConceptStatus = "new" | "learned" | "skipped";

export type StartingLevel = "beginner" | "some-familiarity" | "solid-basics";

export const STARTING_LEVELS: { value: StartingLevel; label: string }[] = [
  { value: "beginner", label: "Complete beginner" },
  { value: "some-familiarity", label: "Some familiarity, foundations shaky" },
  { value: "solid-basics", label: "Solid basics, want depth" },
];

export type TargetDepth = "working" | "professional" | "mastery";

export const TARGET_DEPTHS: { value: TargetDepth; label: string }[] = [
  { value: "working", label: "Working knowledge — enough to use it" },
  { value: "professional", label: "Professional depth — enough to rely on it" },
  { value: "mastery", label: "Full mastery — enough to teach it" },
];

export interface ConceptDiagram {
  left: string;
  right: string;
  relation: string;
}

/** The cached deep-dive response for a concept's Reveal stage — generated once, never re-called
 * unless explicitly regenerated (e.g. after being flagged wrong). */
export interface ConceptDetail {
  hookQuestion: string;
  coreIdea: string;
  why: string;
  connection: string;
  analogy: string;
  diagram: ConceptDiagram;
  classification: "derivable" | "arbitrary";
  classificationReason: string;
  /** 2-3 specific, real misconceptions people have about this concept. */
  misconceptions: string[];
}

/** Mirrors ts-fsrs's Card shape, but with Date fields serialized to ISO strings for
 * localStorage persistence. Null until the concept has had its first FSRS review. */
export interface FsrsCard {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review: string | null;
}

export interface Concept {
  id: string;
  title: string;
  oneLiner: string;
  status: ConceptStatus;
  fsrs: FsrsCard | null;
  detail: ConceptDetail | null;
  /** Set via the "this seems wrong" action; surfaced so it can be regenerated. */
  flagged: boolean;
}

export interface Topic {
  id: string;
  name: string;
  level: StartingLevel;
  targetDepth: TargetDepth;
  createdAt: string;
  concepts: Concept[];
  /** The one-time attention-gating line is shown once per topic, then never again. */
  attentionGateShown: boolean;
  /** Result of the one-time post-generation verification pass; null if none/no issues. */
  verificationNote: string | null;
}

export interface RetrieveGrade {
  score: number;
  feedback: string;
  fluencyWarning: boolean;
}

export interface CalibrationEntry {
  at: string;
  topicId: string;
  conceptId: string;
  stage: "retrieve" | "review";
  /** 0-100 */
  predicted: number;
  /** 0-100, derived from the 1-5 grader score */
  actual: number;
}
