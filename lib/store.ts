import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Concept, ConceptDetail, StartingLevel, Topic } from "./types";
import { scheduleAfterReview, scheduleFirstLearned } from "./spacedRepetition";

interface RawConcept {
  id: string;
  title: string;
  oneLiner: string;
}

interface StrataState {
  topics: Topic[];

  addTopic: (name: string, level: StartingLevel, rawConcepts: RawConcept[]) => Topic;
  deleteTopic: (topicId: string) => void;
  markAttentionGateShown: (topicId: string) => void;
  saveDetail: (topicId: string, conceptId: string, detail: ConceptDetail) => void;
  markLearned: (topicId: string, conceptId: string) => void;
  recordReview: (topicId: string, conceptId: string, score: number, fluencyWarning: boolean) => void;
  resetAll: () => void;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export const useStrataStore = create<StrataState>()(
  persist(
    (set) => ({
      topics: [],

      addTopic: (name, level, rawConcepts) => {
        const topic: Topic = {
          id: makeId(),
          name,
          level,
          createdAt: new Date().toISOString(),
          attentionGateShown: false,
          concepts: rawConcepts.map((c): Concept => ({
            id: c.id,
            title: c.title,
            oneLiner: c.oneLiner,
            status: "new",
            box: 0,
            nextReview: null,
            detail: null,
          })),
        };
        set((state) => ({ topics: [...state.topics, topic] }));
        return topic;
      },

      deleteTopic: (topicId) =>
        set((state) => ({ topics: state.topics.filter((t) => t.id !== topicId) })),

      markAttentionGateShown: (topicId) =>
        set((state) => ({
          topics: state.topics.map((t) => (t.id === topicId ? { ...t, attentionGateShown: true } : t)),
        })),

      saveDetail: (topicId, conceptId, detail) =>
        set((state) => ({
          topics: state.topics.map((t) =>
            t.id !== topicId
              ? t
              : { ...t, concepts: t.concepts.map((c) => (c.id === conceptId ? { ...c, detail } : c)) },
          ),
        })),

      markLearned: (topicId, conceptId) =>
        set((state) => {
          const { box, nextReview } = scheduleFirstLearned();
          return {
            topics: state.topics.map((t) =>
              t.id !== topicId
                ? t
                : {
                    ...t,
                    concepts: t.concepts.map((c) =>
                      c.id === conceptId ? { ...c, status: "learned", box, nextReview } : c,
                    ),
                  },
            ),
          };
        }),

      recordReview: (topicId, conceptId, score, fluencyWarning) =>
        set((state) => ({
          topics: state.topics.map((t) => {
            if (t.id !== topicId) return t;
            return {
              ...t,
              concepts: t.concepts.map((c) => {
                if (c.id !== conceptId) return c;
                const { box, nextReview } = scheduleAfterReview(c.box, score, fluencyWarning);
                return { ...c, box, nextReview };
              }),
            };
          }),
        })),

      resetAll: () => set({ topics: [] }),
    }),
    { name: "strata_topics_v1" },
  ),
);
