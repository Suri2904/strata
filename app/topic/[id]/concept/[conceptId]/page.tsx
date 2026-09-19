"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import ProgressStrip from "@/components/ProgressStrip";
import Diagram from "@/components/Diagram";
import { useStrataStore } from "@/lib/store";
import { frontierIndex } from "@/lib/selectors";
import { RetrieveGrade } from "@/lib/types";

type Stage = "hook" | "predict" | "reveal" | "retrieve" | "sowhat";
const STAGE_INDEX: Record<Stage, number> = { hook: 0, predict: 1, reveal: 2, retrieve: 3, sowhat: 4 };

const CONFIDENCE_LEVELS = [
  { label: "Guessing", value: 20 },
  { label: "Fairly sure", value: 55 },
  { label: "Confident", value: 90 },
] as const;

const MAX_HINTS = 3;

export default function LearnConceptPage() {
  const { id, conceptId } = useParams<{ id: string; conceptId: string }>();
  const router = useRouter();

  const topic = useStrataStore((s) => s.topics.find((t) => t.id === id));
  const saveDetail = useStrataStore((s) => s.saveDetail);
  const markLearned = useStrataStore((s) => s.markLearned);
  const markAttentionGateShown = useStrataStore((s) => s.markAttentionGateShown);
  const flagConcept = useStrataStore((s) => s.flagConcept);
  const logCalibration = useStrataStore((s) => s.logCalibration);

  const conceptIndex = topic?.concepts.findIndex((c) => c.id === conceptId) ?? -1;
  const concept = conceptIndex >= 0 ? topic!.concepts[conceptIndex] : undefined;

  const [stage, setStage] = useState<Stage>("hook");
  // Derived straight from the store rather than mirrored into local state: on a hard page
  // load, Zustand's persist middleware hydrates from localStorage asynchronously, so a local
  // useState seeded from `concept?.detail` at mount would freeze on whatever was there
  // (usually nothing) before hydration ever ran, and never pick up the real cached value.
  const detail = concept?.detail ?? null;
  const [detailError, setDetailError] = useState("");
  const loadingDetail = !detail && !detailError;
  const [regenerating, setRegenerating] = useState(false);

  const [prediction, setPrediction] = useState("");
  const [hints, setHints] = useState<string[]>([]);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState("");

  const [confidence, setConfidence] = useState<number | null>(null);
  const [retrieveAnswer, setRetrieveAnswer] = useState("");
  const [retrieveGrade, setRetrieveGrade] = useState<RetrieveGrade | null>(null);
  const [retrieveError, setRetrieveError] = useState("");
  const [submittingRetrieve, setSubmittingRetrieve] = useState(false);

  const [soWhatAnswer, setSoWhatAnswer] = useState("");
  const [soWhatText, setSoWhatText] = useState<string | null>(null);
  const [soWhatError, setSoWhatError] = useState("");
  const [submittingSoWhat, setSubmittingSoWhat] = useState(false);

  // A pure derivation, not local state — it's only marked shown (in the Hook stage's button
  // handler below) once the learner actually moves on, so simply rendering this stage never
  // itself flips the flag and yanks the line away before they've read it.
  const showAttentionGate = conceptIndex === 0 && !topic?.attentionGateShown;

  useEffect(() => {
    if (detail || detailError || !topic || !concept) return;
    const priorTitles = topic.concepts.slice(0, conceptIndex).map((c) => c.title);
    fetch("/api/deepdive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: topic.name,
        level: topic.level,
        targetDepth: topic.targetDepth,
        concept: { title: concept.title, oneLiner: concept.oneLiner },
        priorTitles,
      }),
    })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) {
          setDetailError(body.message ?? "Couldn't generate this concept.");
          return;
        }
        saveDetail(topic.id, concept.id, body.detail);
      })
      .catch(() => setDetailError("Couldn't reach the generator. Check your connection and try again."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail, detailError, topic?.id, concept?.id]);

  if (!topic || !concept) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-[640px] px-5 py-12">
          <p className="text-sm text-[var(--ink-soft)]">Concept not found.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-[var(--accent)]">
            ← Back home
          </Link>
        </main>
      </div>
    );
  }

  if (conceptIndex !== frontierIndex(topic)) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-[640px] px-5 py-12">
          <p className="text-sm text-[var(--ink-soft)]">
            This concept isn&apos;t unlocked yet — finish the ones before it first.
          </p>
          <Link href={`/topic/${topic.id}`} className="mt-4 inline-block text-sm text-[var(--accent)]">
            ← Back to {topic.name}
          </Link>
        </main>
      </div>
    );
  }

  const safeTopic = topic;
  const safeConcept = concept;

  async function requestHint() {
    if (!detail || hints.length >= MAX_HINTS) return;
    setHintLoading(true);
    setHintError("");
    try {
      const res = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: safeTopic.name,
          concept: { title: safeConcept.title, oneLiner: safeConcept.oneLiner },
          hookQuestion: detail.hookQuestion,
          priorAttempt: prediction,
          hintLevel: hints.length + 1,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setHintError(body.message ?? "Couldn't get a hint right now.");
        return;
      }
      setHints((h) => [...h, body.hint]);
    } catch {
      setHintError("Couldn't reach the hint generator. Check your connection and try again.");
    } finally {
      setHintLoading(false);
    }
  }

  async function regenerateDetail() {
    setRegenerating(true);
    setDetailError("");
    const priorTitles = safeTopic.concepts.slice(0, conceptIndex).map((c) => c.title);
    try {
      const res = await fetch("/api/deepdive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: safeTopic.name,
          level: safeTopic.level,
          targetDepth: safeTopic.targetDepth,
          concept: { title: safeConcept.title, oneLiner: safeConcept.oneLiner },
          priorTitles,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setDetailError(body.message ?? "Couldn't regenerate this concept.");
        return;
      }
      saveDetail(safeTopic.id, safeConcept.id, body.detail);
    } catch {
      setDetailError("Couldn't reach the generator. Check your connection and try again.");
    } finally {
      setRegenerating(false);
    }
  }

  async function submitRetrieve() {
    if (!retrieveAnswer.trim() || !detail || confidence === null) return;
    setSubmittingRetrieve(true);
    setRetrieveError("");
    try {
      const res = await fetch("/api/retrieve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: safeTopic.name,
          concept: { title: safeConcept.title, oneLiner: safeConcept.oneLiner },
          coreIdea: detail.coreIdea,
          why: detail.why,
          misconceptions: detail.misconceptions,
          userAnswer: retrieveAnswer,
          isReview: false,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setRetrieveError(body.message ?? "Couldn't grade that right now.");
        return;
      }
      const grade: RetrieveGrade = body.grade;
      setRetrieveGrade(grade);
      logCalibration({
        topicId: safeTopic.id,
        conceptId: safeConcept.id,
        stage: "retrieve",
        predicted: confidence,
        actual: grade.score * 20,
      });
    } catch {
      setRetrieveError("Couldn't reach the grader. Check your connection and try again.");
    } finally {
      setSubmittingRetrieve(false);
    }
  }

  async function submitSoWhat() {
    if (!soWhatAnswer.trim()) return;
    setSubmittingSoWhat(true);
    setSoWhatError("");
    try {
      const res = await fetch("/api/sowhat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept: { title: safeConcept.title }, soWhatAnswer }),
      });
      const body = await res.json();
      if (!res.ok) {
        setSoWhatError(body.message ?? "Couldn't check that right now.");
        return;
      }
      setSoWhatText(body.text);
    } catch {
      setSoWhatError("Couldn't reach the checker. Check your connection and try again.");
    } finally {
      setSubmittingSoWhat(false);
    }
  }

  function finish() {
    if (!retrieveGrade) return;
    markLearned(safeTopic.id, safeConcept.id, retrieveGrade.score, retrieveGrade.fluencyWarning);
    router.push(`/topic/${safeTopic.id}`);
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-[640px] px-5 py-12">
        <ProgressStrip stage={STAGE_INDEX[stage]} />

        {showAttentionGate && (
          <p className="mt-4 border-b border-[var(--border-hairline)] pb-4 text-xs text-[var(--ink-faint)]">
            One tab, no multitasking — split attention is the biggest failure mode here.
          </p>
        )}

        <div className="mt-8">
          {loadingDetail && (
            <p className="text-sm text-[var(--ink-soft)]">Preparing this concept…</p>
          )}

          {detailError && !loadingDetail && (
            <div>
              <p className="text-sm text-[var(--warning)]">{detailError}</p>
              <button
                onClick={() => setDetailError("")}
                className="mt-3 text-sm text-[var(--accent)] underline"
              >
                Try again
              </button>
            </div>
          )}

          {detail && stage === "hook" && (
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--ink-faint)]">{concept.title}</p>
              <h1 className="font-display mt-3 text-2xl leading-snug">{detail.hookQuestion}</h1>
              <button
                onClick={() => {
                  if (showAttentionGate) markAttentionGateShown(safeTopic.id);
                  setStage("predict");
                }}
                className="mt-8 rounded-lg px-5 py-2.5 text-sm font-semibold text-[var(--paper)]"
                style={{ background: "var(--ink)" }}
              >
                Take a guess
              </button>
            </div>
          )}

          {detail && stage === "predict" && (
            <div>
              <p className="text-sm text-[var(--ink-soft)]">
                Before any explanation — what&apos;s your best guess?
              </p>
              <textarea
                value={prediction}
                onChange={(e) => setPrediction(e.target.value)}
                rows={4}
                placeholder="Type your prediction…"
                className="mt-4 w-full border-b border-[var(--border-strong)] py-2 text-base outline-none placeholder:text-[var(--ink-faint)] focus:border-[var(--accent)]"
              />

              {hints.map((h, i) => (
                <p key={i} className="mt-3 rounded-md bg-[var(--accent-soft)] px-3 py-2 text-sm text-[var(--ink)]">
                  {h}
                </p>
              ))}
              {hintError && <p className="mt-3 text-sm text-[var(--warning)]">{hintError}</p>}

              <div className="mt-4 flex items-center gap-4">
                <button
                  onClick={() => setStage("reveal")}
                  disabled={!prediction.trim()}
                  className="rounded-lg px-5 py-2.5 text-sm font-semibold text-[var(--paper)] disabled:opacity-40"
                  style={{ background: "var(--ink)" }}
                >
                  See how close I was
                </button>
                {hints.length < MAX_HINTS && (
                  <button
                    onClick={requestHint}
                    disabled={hintLoading}
                    className="text-sm text-[var(--accent)] underline disabled:opacity-40"
                  >
                    {hintLoading ? "Thinking…" : hints.length === 0 ? "Need a hint?" : "Another hint"}
                  </button>
                )}
              </div>
            </div>
          )}

          {detail && stage === "reveal" && (
            <div className="space-y-6">
              <section>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">Core idea</p>
                <p className="mt-2 text-base leading-relaxed">{detail.coreIdea}</p>
              </section>
              <section>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">Why it&apos;s this way</p>
                <p className="mt-2 text-base leading-relaxed">{detail.why}</p>
              </section>
              <section>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">How it connects</p>
                <p className="mt-2 text-base leading-relaxed">{detail.connection}</p>
              </section>
              <section>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">Analogy</p>
                <p className="mt-2 text-base italic text-[var(--ink-soft)]">{detail.analogy}</p>
              </section>
              <Diagram diagram={detail.diagram} />
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{
                    background: detail.classification === "derivable" ? "var(--good-soft)" : "var(--warning-soft)",
                    color: detail.classification === "derivable" ? "var(--good)" : "var(--warning)",
                  }}
                >
                  {detail.classification === "derivable" ? "Derivable" : "Arbitrary"}
                </span>
                <p className="text-xs text-[var(--ink-faint)]">{detail.classificationReason}</p>
              </div>

              {detail.misconceptions?.length > 0 && (
                <section>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
                    Common misconceptions
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {detail.misconceptions.map((m, i) => (
                      <li key={i} className="text-sm leading-relaxed text-[var(--ink-soft)]">
                        · {m}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <div className="flex items-center gap-4 border-t border-[var(--border-hairline)] pt-6">
                <button
                  onClick={() => setStage("retrieve")}
                  className="rounded-lg px-5 py-2.5 text-sm font-semibold text-[var(--paper)]"
                  style={{ background: "var(--ink)" }}
                >
                  Explain it from memory
                </button>
                {!safeConcept.flagged ? (
                  <button
                    onClick={() => flagConcept(safeTopic.id, safeConcept.id, true)}
                    className="text-sm text-[var(--ink-faint)] underline hover:text-[var(--warning)]"
                  >
                    This seems wrong
                  </button>
                ) : (
                  <button
                    onClick={regenerateDetail}
                    disabled={regenerating}
                    className="text-sm text-[var(--warning)] underline disabled:opacity-40"
                  >
                    {regenerating ? "Regenerating…" : "Flagged — regenerate this concept"}
                  </button>
                )}
              </div>
            </div>
          )}

          {detail && stage === "retrieve" && (
            <div>
              <p className="text-sm text-[var(--ink-soft)]">
                Explain <span className="font-medium text-[var(--ink)]">{concept.title}</span> in your own words —
                from memory, no notes.
              </p>
              <textarea
                value={retrieveAnswer}
                onChange={(e) => setRetrieveAnswer(e.target.value)}
                rows={5}
                disabled={!!retrieveGrade}
                placeholder="Type your explanation…"
                className="mt-4 w-full border-b border-[var(--border-strong)] py-2 text-base outline-none placeholder:text-[var(--ink-faint)] focus:border-[var(--accent)] disabled:opacity-70"
              />

              {!retrieveGrade && (
                <div className="mt-4">
                  <p className="text-xs text-[var(--ink-faint)]">How sure are you, before grading?</p>
                  <div className="mt-2 flex gap-2">
                    {CONFIDENCE_LEVELS.map((c) => (
                      <button
                        key={c.label}
                        onClick={() => setConfidence(c.value)}
                        className="flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors"
                        style={{
                          borderColor: confidence === c.value ? "var(--accent)" : "var(--border-hairline)",
                          background: confidence === c.value ? "var(--accent-soft)" : "transparent",
                        }}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {retrieveError && <p className="mt-3 text-sm text-[var(--warning)]">{retrieveError}</p>}

              {!retrieveGrade ? (
                <button
                  onClick={submitRetrieve}
                  disabled={!retrieveAnswer.trim() || confidence === null || submittingRetrieve}
                  className="mt-6 rounded-lg px-5 py-2.5 text-sm font-semibold text-[var(--paper)] disabled:opacity-40"
                  style={{ background: "var(--ink)" }}
                >
                  {submittingRetrieve ? "Grading…" : "Grade my explanation"}
                </button>
              ) : (
                <div className="mt-6 border-t border-[var(--border-hairline)] pt-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
                    Score: {retrieveGrade.score} / 5
                  </p>
                  <p className="mt-2 text-base leading-relaxed">{retrieveGrade.feedback}</p>
                  {retrieveGrade.fluencyWarning && (
                    <p className="mt-3 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
                      This reads fluent but light on real content — that ease can feel like knowing it when it isn&apos;t.
                    </p>
                  )}
                  <button
                    onClick={() => setStage("sowhat")}
                    className="mt-6 rounded-lg px-5 py-2.5 text-sm font-semibold text-[var(--paper)]"
                    style={{ background: "var(--ink)" }}
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
          )}

          {detail && stage === "sowhat" && (
            <div>
              <p className="text-sm text-[var(--ink-soft)]">
                What does understanding this change for you — a prediction, a decision, or a link to something
                else you know?
              </p>
              <textarea
                value={soWhatAnswer}
                onChange={(e) => setSoWhatAnswer(e.target.value)}
                rows={4}
                disabled={!!soWhatText}
                placeholder="Type your so-what…"
                className="mt-4 w-full border-b border-[var(--border-strong)] py-2 text-base outline-none placeholder:text-[var(--ink-faint)] focus:border-[var(--accent)] disabled:opacity-70"
              />

              {soWhatError && <p className="mt-3 text-sm text-[var(--warning)]">{soWhatError}</p>}

              {!soWhatText ? (
                <button
                  onClick={submitSoWhat}
                  disabled={!soWhatAnswer.trim() || submittingSoWhat}
                  className="mt-6 rounded-lg px-5 py-2.5 text-sm font-semibold text-[var(--paper)] disabled:opacity-40"
                  style={{ background: "var(--ink)" }}
                >
                  {submittingSoWhat ? "Checking…" : "Check my so-what"}
                </button>
              ) : (
                <div className="mt-6 border-t border-[var(--border-hairline)] pt-6">
                  <p className="text-base leading-relaxed">{soWhatText}</p>
                  <button
                    onClick={finish}
                    className="mt-6 rounded-lg px-5 py-2.5 text-sm font-semibold text-[var(--paper)]"
                    style={{ background: "var(--ink)" }}
                  >
                    Mark learned
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
