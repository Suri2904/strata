export type NodeStatus = "locked" | "available" | "mastered";

export type RetentionSpeed = "slow" | "medium" | "fast";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ConceptNode {
  id: string;
  title: string;
  /** 0 = most foundational. Higher = deeper / more advanced. */
  depth: number;
  summary: string;
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
