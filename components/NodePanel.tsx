"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ConceptNode, Curriculum, NodeStatus, QuizQuestion } from "@/lib/types";

type Step = "brief" | "check";

// Coarse-to-numeric mapping so the lightweight tap-chip still feeds the same
// |predicted - actual| calibration math the Execution Loop already uses.
const CONFIDENCE_LEVELS = [
  { label: "Guessing", value: 20 },
  { label: "Fairly sure", value: 55 },
  { label: "Confident", value: 90 },
] as const;

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--ink-muted)]">{label}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

interface Props {
  node: ConceptNode | null;
  curriculum: Curriculum;
  status: NodeStatus;
  missingPrereqTitles: string[];
  onClose: () => void;
  onComplete: (confidence: number, score: number) => void;
}

export default function NodePanel({ node, curriculum, status, missingPrereqTitles, onClose, onComplete }: Props) {
  const open = !!node;

  return (
    <AnimatePresence>
      {open && node && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-[var(--border-hairline)] bg-[var(--surface-1)] p-6"
          >
            <button onClick={onClose} className="mb-4 text-sm text-[var(--ink-muted)] hover:text-[var(--ink-primary)]">
              ← Close
            </button>

            <p className="text-xs uppercase tracking-wider text-[var(--ink-muted)]">
              {curriculum.topic} · Layer {node.depth}
            </p>
            <h2 className="font-display mt-1 text-xl font-semibold leading-snug">{node.title}</h2>

            {status === "locked" ? (
              <div className="mt-6 rounded-xl border border-dashed border-[var(--border-hairline)] p-4">
                <p className="text-sm text-[var(--ink-secondary)]">
                  Locked until you master{missingPrereqTitles.length > 1 ? " these" : " this"}:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-[var(--ink-primary)]">
                  {missingPrereqTitles.map((t) => (
                    <li key={t}>· {t}</li>
                  ))}
                </ul>
              </div>
            ) : (
              // Keyed by node id so switching nodes (or reopening the same node fresh) simply remounts
              // the wizard instead of needing an effect to reset its internal step/answers state.
              <NodeWizard key={node.id} node={node} status={status} onComplete={onComplete} />
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function NodeWizard({
  node,
  status,
  onComplete,
}: {
  node: ConceptNode;
  status: NodeStatus;
  onComplete: (confidence: number, score: number) => void;
}) {
  const [step, setStep] = useState<Step>("brief");
  // One question per attempt, picked fresh whenever the panel opens (remounts on node.id) —
  // reviews see variety across a node's two authored questions instead of always the same one.
  const [question] = useState<QuizQuestion>(() => node.quiz[Math.floor(Math.random() * node.quiz.length)]);
  const [confidenceIdx, setConfidenceIdx] = useState<number | null>(null);
  const [answerIdx, setAnswerIdx] = useState<number | null>(null);

  const correct = answerIdx !== null && answerIdx === question.correctIndex;

  return (
    <>
      {step === "brief" && (
        <div className="mt-5 space-y-5">
          <Section label="Starting from what you know">
            <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">{node.explanation.foundation}</p>
          </Section>

          <Section label="Building it up">
            {node.explanation.reasoning
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((para, i) => (
                <p key={i} className="text-sm leading-relaxed text-[var(--ink-primary)]">
                  {para}
                </p>
              ))}
          </Section>

          <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] p-3.5">
            <p className="text-xs font-medium text-[var(--accent-strong)]">Stated formally</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--ink-primary)]">{node.explanation.formalStatement}</p>
          </div>

          <Section label="In practice">
            <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">{node.explanation.example}</p>
          </Section>

          <div className="rounded-xl border border-dashed border-[var(--border-hairline)] p-3.5">
            <p className="text-xs font-medium text-[var(--warning)]">A common mistake</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--ink-secondary)]">{node.explanation.misconception}</p>
          </div>

          <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-2)] p-3.5">
            <p className="text-xs font-medium text-[var(--ink-muted)]">Why it matters</p>
            <p className="mt-1 text-sm text-[var(--ink-primary)]">{node.whyItMatters}</p>
          </div>
          <p className="text-xs text-[var(--ink-muted)]">
            {node.estMinutes} min · one quick check · {node.retention}-decay
          </p>
          <button
            onClick={() => setStep("check")}
            className="w-full rounded-xl bg-[var(--ink-primary)] py-3 text-sm font-semibold text-[#0a0a0a] hover:opacity-90"
          >
            {status === "mastered" ? "Review this concept" : "Quick check"}
          </button>
        </div>
      )}

      {step === "check" && (
        <div className="mt-6 space-y-5">
          <div>
            <p className="text-xs text-[var(--ink-muted)]">How sure are you, before answering?</p>
            <div className="mt-2 flex gap-2">
              {CONFIDENCE_LEVELS.map((c, i) => (
                <button
                  key={c.label}
                  onClick={() => setConfidenceIdx(i)}
                  className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                    confidenceIdx === i
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--ink-primary)]"
                      : "border-[var(--border-hairline)] text-[var(--ink-secondary)] hover:border-[var(--border-strong)]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-[var(--ink-primary)]">{question.question}</p>
            <div className="mt-2 space-y-2">
              {question.options.map((opt, oi) => {
                const isPicked = answerIdx === oi;
                const revealed = answerIdx !== null;
                const isCorrectOption = oi === question.correctIndex;
                return (
                  <button
                    key={oi}
                    disabled={revealed}
                    onClick={() => setAnswerIdx(oi)}
                    className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      revealed && isCorrectOption
                        ? "border-[var(--good)] bg-[var(--good)]/10"
                        : revealed && isPicked
                          ? "border-[var(--critical)] bg-[var(--critical)]/10"
                          : "border-[var(--border-hairline)] hover:border-[var(--border-strong)]"
                    }`}
                  >
                    <span className="text-[var(--ink-secondary)]">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {answerIdx !== null && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border p-3.5 ${
                correct ? "border-[var(--good)]/30 bg-[var(--good)]/10" : "border-[var(--critical)]/30 bg-[var(--critical)]/10"
              }`}
            >
              <p className="text-sm font-medium" style={{ color: correct ? "var(--good)" : "var(--critical)" }}>
                {correct ? "✓ Correct" : "✕ Not quite"}
              </p>
              <p className="mt-1 text-sm text-[var(--ink-secondary)]">{question.explanation}</p>
            </motion.div>
          )}

          <button
            onClick={() => {
              const confidence = CONFIDENCE_LEVELS[confidenceIdx ?? 1].value;
              onComplete(confidence, correct ? 100 : 0);
            }}
            disabled={answerIdx === null || confidenceIdx === null}
            className="w-full rounded-xl bg-[var(--ink-primary)] py-3 text-sm font-semibold text-[#0a0a0a] hover:opacity-90 disabled:opacity-40"
          >
            {answerIdx === null ? "Pick an answer" : correct ? "Save & unlock next concepts" : "Save & review again later"}
          </button>
        </div>
      )}
    </>
  );
}
