"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ConceptNode, Curriculum, NodeStatus } from "@/lib/types";

type Step = "brief" | "confidence" | "quiz" | "result";

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
  const [confidence, setConfidence] = useState(50);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [score, setScore] = useState(0);

  function submitQuiz() {
    const correct = node.quiz.filter((q) => answers[q.id] === q.correctIndex).length;
    const pct = Math.round((correct / node.quiz.length) * 100);
    setScore(pct);
    setStep("result");
  }

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
            {node.estMinutes} min · {node.quiz.length} check questions · {node.retention}-decay
          </p>
          <button
            onClick={() => setStep("confidence")}
            className="w-full rounded-xl bg-[var(--ink-primary)] py-3 text-sm font-semibold text-[#0a0a0a] hover:opacity-90"
          >
            {status === "mastered" ? "Review this concept" : "Begin the check"}
          </button>
        </div>
      )}

      {step === "confidence" && (
        <div className="mt-6 space-y-5">
          <p className="text-sm text-[var(--ink-primary)]">
            Before you answer: how confident are you, right now, that you understand this?
          </p>
          <div>
            <input
              type="range"
              min={0}
              max={100}
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
            <div className="mt-1 flex justify-between text-xs text-[var(--ink-muted)]">
              <span>Not at all</span>
              <span className="font-display text-base text-[var(--ink-primary)]">{confidence}%</span>
              <span>Fully confident</span>
            </div>
          </div>
          <button
            onClick={() => setStep("quiz")}
            className="w-full rounded-xl bg-[var(--ink-primary)] py-3 text-sm font-semibold text-[#0a0a0a] hover:opacity-90"
          >
            Continue to questions
          </button>
        </div>
      )}

      {step === "quiz" && (
        <div className="mt-6 space-y-6">
          {node.quiz.map((q, qi) => (
            <div key={q.id}>
              <p className="text-sm font-medium text-[var(--ink-primary)]">
                {qi + 1}. {q.question}
              </p>
              <div className="mt-2 space-y-2">
                {q.options.map((opt, oi) => (
                  <label
                    key={oi}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      answers[q.id] === oi
                        ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                        : "border-[var(--border-hairline)] hover:border-[var(--border-strong)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      className="accent-[var(--accent)]"
                      checked={answers[q.id] === oi}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                    />
                    <span className="text-[var(--ink-secondary)]">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={submitQuiz}
            disabled={Object.keys(answers).length < node.quiz.length}
            className="w-full rounded-xl bg-[var(--ink-primary)] py-3 text-sm font-semibold text-[#0a0a0a] hover:opacity-90 disabled:opacity-40"
          >
            Submit
          </button>
        </div>
      )}

      {step === "result" && (
        <ResultView node={node} confidence={confidence} score={score} answers={answers} onSave={() => onComplete(confidence, score)} />
      )}
    </>
  );
}

function ResultView({
  node,
  confidence,
  score,
  answers,
  onSave,
}: {
  node: ConceptNode;
  confidence: number;
  score: number;
  answers: Record<string, number>;
  onSave: () => void;
}) {
  const delta = confidence - score;
  const passed = score >= 70;
  let calibrationNote: string;
  if (Math.abs(delta) <= 10) calibrationNote = "Well-calibrated — your confidence matched your result.";
  else if (delta > 10) calibrationNote = "Overconfident — you scored lower than you predicted.";
  else calibrationNote = "Underconfident — you scored higher than you predicted.";

  return (
    <div className="mt-6 space-y-5">
      <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-2)] p-4 text-center">
        <p className="font-display text-3xl font-semibold" style={{ color: passed ? "var(--good)" : "var(--critical)" }}>
          {score}%
        </p>
        <p className="mt-1 text-xs text-[var(--ink-muted)]">
          predicted {confidence}% · {calibrationNote}
        </p>
      </div>

      <div className="space-y-4">
        {node.quiz.map((q, qi) => {
          const correct = answers[q.id] === q.correctIndex;
          return (
            <div key={q.id} className="text-sm">
              <p className="text-[var(--ink-primary)]">
                {qi + 1}. {q.question}
              </p>
              <p className={`mt-1 ${correct ? "text-[var(--good)]" : "text-[var(--critical)]"}`}>
                {correct ? "✓ Correct" : `✕ You picked: ${q.options[answers[q.id]]}`}
              </p>
              <p className="mt-1 text-[var(--ink-secondary)]">{q.explanation}</p>
            </div>
          );
        })}
      </div>

      <button
        onClick={onSave}
        className="w-full rounded-xl bg-[var(--ink-primary)] py-3 text-sm font-semibold text-[#0a0a0a] hover:opacity-90"
      >
        {passed ? "Save & unlock next concepts" : "Save & try again later"}
      </button>
    </div>
  );
}
