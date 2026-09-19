import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CalibrationEntry, Concept, ConceptDetail, StartingLevel, TargetDepth, Topic } from "./types";
import { initialCard, scheduleNext } from "./fsrs";

interface RawConcept {
  id: string;
  title: string;
  oneLiner: string;
}

interface StrataState {
  topics: Topic[];
  calibrationLog: CalibrationEntry[];

  addTopic: (name: string, level: StartingLevel, targetDepth: TargetDepth, rawConcepts: RawConcept[]) => Topic;
  deleteTopic: (topicId: string) => void;
  markAttentionGateShown: (topicId: string) => void;
  saveDetail: (topicId: string, conceptId: string, detail: ConceptDetail) => void;
  markLearned: (topicId: string, conceptId: string, score: number, fluencyWarning: boolean) => void;
  recordReview: (topicId: string, conceptId: string, score: number, fluencyWarning: boolean) => void;
  skipConcept: (topicId: string, conceptId: string) => void;
  flagConcept: (topicId: string, conceptId: string, flagged: boolean) => void;
  setVerificationNote: (topicId: string, note: string | null) => void;
  reorderConcept: (topicId: string, conceptId: string, direction: "up" | "down") => void;
  addConcept: (topicId: string, title: string, oneLiner: string) => void;
  removeConcept: (topicId: string, conceptId: string) => void;
  logCalibration: (entry: Omit<CalibrationEntry, "at">) => void;
  resetAll: () => void;
  replaceAllTopics: (topics: Topic[]) => void;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export const useStrataStore = create<StrataState>()(
  persist(
    (set) => ({
      topics: [],
      calibrationLog: [],

      addTopic: (name, level, targetDepth, rawConcepts) => {
        const topic: Topic = {
          id: makeId(),
          name,
          level,
          targetDepth,
          createdAt: new Date().toISOString(),
          attentionGateShown: false,
          verificationNote: null,
          concepts: rawConcepts.map((c): Concept => ({
            id: c.id,
            title: c.title,
            oneLiner: c.oneLiner,
            status: "new",
            fsrs: null,
            detail: null,
            flagged: false,
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
              : { ...t, concepts: t.concepts.map((c) => (c.id === conceptId ? { ...c, detail, flagged: false } : c)) },
          ),
        })),

      markLearned: (topicId, conceptId, score, fluencyWarning) =>
        set((state) => ({
          topics: state.topics.map((t) =>
            t.id !== topicId
              ? t
              : {
                  ...t,
                  concepts: t.concepts.map((c) =>
                    c.id === conceptId
                      ? { ...c, status: "learned", fsrs: scheduleNext(null, score, fluencyWarning) }
                      : c,
                  ),
                },
          ),
        })),

      recordReview: (topicId, conceptId, score, fluencyWarning) =>
        set((state) => ({
          topics: state.topics.map((t) => {
            if (t.id !== topicId) return t;
            return {
              ...t,
              concepts: t.concepts.map((c) =>
                c.id !== conceptId ? c : { ...c, fsrs: scheduleNext(c.fsrs, score, fluencyWarning) },
              ),
            };
          }),
        })),

      skipConcept: (topicId, conceptId) =>
        set((state) => ({
          topics: state.topics.map((t) =>
            t.id !== topicId
              ? t
              : {
                  ...t,
                  concepts: t.concepts.map((c) =>
                    c.id === conceptId ? { ...c, status: "skipped", fsrs: initialCard() } : c,
                  ),
                },
          ),
        })),

      flagConcept: (topicId, conceptId, flagged) =>
        set((state) => ({
          topics: state.topics.map((t) =>
            t.id !== topicId
              ? t
              : { ...t, concepts: t.concepts.map((c) => (c.id === conceptId ? { ...c, flagged } : c)) },
          ),
        })),

      setVerificationNote: (topicId, note) =>
        set((state) => ({
          topics: state.topics.map((t) => (t.id === topicId ? { ...t, verificationNote: note } : t)),
        })),

      reorderConcept: (topicId, conceptId, direction) =>
        set((state) => ({
          topics: state.topics.map((t) => {
            if (t.id !== topicId) return t;
            const idx = t.concepts.findIndex((c) => c.id === conceptId);
            const swapWith = direction === "up" ? idx - 1 : idx + 1;
            if (idx < 0 || swapWith < 0 || swapWith >= t.concepts.length) return t;
            const concepts = [...t.concepts];
            [concepts[idx], concepts[swapWith]] = [concepts[swapWith], concepts[idx]];
            return { ...t, concepts };
          }),
        })),

      addConcept: (topicId, title, oneLiner) =>
        set((state) => ({
          topics: state.topics.map((t) =>
            t.id !== topicId
              ? t
              : {
                  ...t,
                  concepts: [
                    ...t.concepts,
                    { id: makeId(), title, oneLiner, status: "new", fsrs: null, detail: null, flagged: false },
                  ],
                },
          ),
        })),

      removeConcept: (topicId, conceptId) =>
        set((state) => ({
          topics: state.topics.map((t) =>
            t.id !== topicId ? t : { ...t, concepts: t.concepts.filter((c) => c.id !== conceptId) },
          ),
        })),

      logCalibration: (entry) =>
        set((state) => ({
          calibrationLog: [...state.calibrationLog, { ...entry, at: new Date().toISOString() }],
        })),

      resetAll: () => set({ topics: [], calibrationLog: [] }),

      replaceAllTopics: (topics) => set({ topics }),
    }),
    { name: "strata_topics_v2" },
  ),
);
