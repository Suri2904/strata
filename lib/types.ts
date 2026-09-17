export type ConceptStatus = "new" | "learned";

export type StartingLevel = "beginner" | "some-familiarity" | "solid-basics";

export const STARTING_LEVELS: { value: StartingLevel; label: string }[] = [
  { value: "beginner", label: "Complete beginner" },
  { value: "some-familiarity", label: "Some familiarity, foundations shaky" },
  { value: "solid-basics", label: "Solid basics, want depth" },
];

export interface ConceptDiagram {
  left: string;
  right: string;
  relation: string;
}

/** The cached deep-dive response for a concept's Reveal stage — generated once, never re-called. */
export interface ConceptDetail {
  hookQuestion: string;
  coreIdea: string;
  why: string;
  connection: string;
  analogy: string;
  diagram: ConceptDiagram;
  classification: "derivable" | "arbitrary";
  classificationReason: string;
}

export interface Concept {
  id: string;
  title: string;
  oneLiner: string;
  status: ConceptStatus;
  /** Leitner box, 0-4. */
  box: number;
  nextReview: string | null;
  detail: ConceptDetail | null;
}

export interface Topic {
  id: string;
  name: string;
  level: StartingLevel;
  createdAt: string;
  concepts: Concept[];
  /** The one-time attention-gating line is shown once per topic, then never again. */
  attentionGateShown: boolean;
}

export interface RetrieveGrade {
  score: number;
  feedback: string;
  fluencyWarning: boolean;
}
