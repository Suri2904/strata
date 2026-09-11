export type NodeStatus = "locked" | "available" | "mastered";

export type RetentionSpeed = "slow" | "medium" | "fast";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/**
 * A first-principles explanation, not a definition. Each field is a stage of actually
 * building the idea up from what's already known, rather than stating it and moving on.
 */
export interface ConceptExplanation {
  /** What we're taking as already established — the ground this reasoning starts from. */
  foundation: string;
  /** The derivation itself: reason forward from the foundation toward the concept. This is
   *  the core teaching content — multiple paragraphs, showing the "why", not asserting the "what". */
  reasoning: string;
  /** The precise, formal statement of the concept — given only after the reasoning has earned it. */
  formalStatement: string;
  /** A concrete worked example that grounds the abstraction in something specific. */
  example: string;
  /** A specific, named misconception people actually have here, and why it's wrong. */
  misconception: string;
}

export interface ConceptNode {
  id: string;
  title: string;
  /** 0 = most foundational. Higher = deeper / more advanced. */
  depth: number;
  explanation: ConceptExplanation;
  /** One sentence: why this has to come before what it unlocks. */
  whyItMatters: string;
  prerequisites: string[];
  estMinutes: number;
  /** How fast this kind of knowledge decays without review. Drives spaced-repetition interval. */
  retention: RetentionSpeed;
  quiz: QuizQuestion[];
}

export interface Curriculum {
  slug: string;
  topic: string;
  tagline: string;
  generatedAt: string;
  source: "mock" | "gemini";
  nodes: ConceptNode[];
}

export interface NodeProgress {
  nodeId: string;
  curriculumSlug: string;
  status: NodeStatus;
  confidencePrediction?: number;
  quizScore?: number;
  masteredAt?: string;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  reviewStep: number;
  reviewHistory: { at: string; quizScore: number; confidencePrediction: number }[];
}

export interface SessionLogEntry {
  at: string;
  curriculumSlug: string;
  curriculumTopic: string;
  nodeId: string;
  nodeTitle: string;
  type: "first-mastery" | "review";
  confidencePrediction: number;
  quizScore: number;
}
