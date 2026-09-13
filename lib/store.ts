import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Curriculum, ConceptNode, NodeProgress, NodeStatus, SessionLogEntry } from "./types";
import { scheduleNextReview } from "./spacedRepetition";

function progressKey(curriculumSlug: string, nodeId: string) {
  return `${curriculumSlug}::${nodeId}`;
}

interface StrataState {
  curricula: Record<string, Curriculum>;
  progress: Record<string, NodeProgress>;
  sessionLog: SessionLogEntry[];

  addCurriculum: (c: Curriculum) => void;
  deleteCurriculum: (slug: string) => void;
  getNodeStatus: (slug: string, node: ConceptNode) => NodeStatus;
  recordAttempt: (
    curriculum: Curriculum,
    node: ConceptNode,
    confidencePrediction: number,
    quizScore: number,
  ) => void;
  resetAll: () => void;
}

const MASTERY_THRESHOLD = 70;

export const useStrataStore = create<StrataState>()(
  persist(
    (set, get) => ({
      curricula: {},
      progress: {},
      sessionLog: [],

      addCurriculum: (c) =>
        set((state) => ({
          curricula: { ...state.curricula, [c.slug]: c },
        })),

      deleteCurriculum: (slug) =>
        set((state) => {
          const remainingCurricula = Object.fromEntries(
            Object.entries(state.curricula).filter(([s]) => s !== slug),
          );
          const remainingProgress = Object.fromEntries(
            Object.entries(state.progress).filter(([, p]) => p.curriculumSlug !== slug),
          );
          const remainingSessionLog = state.sessionLog.filter((s) => s.curriculumSlug !== slug);
          return { curricula: remainingCurricula, progress: remainingProgress, sessionLog: remainingSessionLog };
        }),

      getNodeStatus: (slug, node) => {
        const key = progressKey(slug, node.id);
        const existing = get().progress[key];
        if (existing?.status === "mastered") return "mastered";
        if (node.prerequisites.length === 0) return "available";
        const allPrereqsMastered = node.prerequisites.every((prereqId) => {
          const p = get().progress[progressKey(slug, prereqId)];
          return p?.status === "mastered";
        });
        return allPrereqsMastered ? "available" : "locked";
      },

      recordAttempt: (curriculum, node, confidencePrediction, quizScore) => {
        const key = progressKey(curriculum.slug, node.id);
        const now = new Date();
        const nowIso = now.toISOString();
        set((state) => {
          const existing = state.progress[key];
          const wasAlreadyMastered = existing?.status === "mastered";
          const passed = quizScore >= MASTERY_THRESHOLD;

          const { nextReviewAt, reviewStep } = scheduleNextReview(
            existing?.reviewStep ?? 0,
            quizScore,
            node.retention,
            now,
          );

          const newProgress: NodeProgress = {
            nodeId: node.id,
            curriculumSlug: curriculum.slug,
            status: passed || wasAlreadyMastered ? "mastered" : "available",
            confidencePrediction,
            quizScore,
            masteredAt: existing?.masteredAt ?? (passed ? nowIso : undefined),
            lastReviewedAt: nowIso,
            nextReviewAt,
            reviewStep,
            reviewHistory: [
              ...(existing?.reviewHistory ?? []),
              { at: nowIso, quizScore, confidencePrediction },
            ],
          };

          const logEntry: SessionLogEntry = {
            at: nowIso,
            curriculumSlug: curriculum.slug,
            curriculumTopic: curriculum.topic,
            nodeId: node.id,
            nodeTitle: node.title,
            type: wasAlreadyMastered ? "review" : "first-mastery",
            confidencePrediction,
            quizScore,
          };

          return {
            progress: { ...state.progress, [key]: newProgress },
            sessionLog: [...state.sessionLog, logEntry],
          };
        });
      },

      resetAll: () => set({ curricula: {}, progress: {}, sessionLog: [] }),
    }),
    { name: "strata-store-v1" },
  ),
);
