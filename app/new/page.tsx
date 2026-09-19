"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useStrataStore } from "@/lib/store";
import { STARTING_LEVELS, StartingLevel, TARGET_DEPTHS, TargetDepth } from "@/lib/types";

type FetchState = "idle" | "loading" | "no-key" | "error";

export default function NewTopicPage() {
  const router = useRouter();
  const addTopic = useStrataStore((s) => s.addTopic);
  const setVerificationNote = useStrataStore((s) => s.setVerificationNote);

  const [name, setName] = useState("");
  const [level, setLevel] = useState<StartingLevel>("beginner");
  const [targetDepth, setTargetDepth] = useState<TargetDepth>("working");
  const [state, setState] = useState<FetchState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const topicName = name.trim();
    if (!topicName) return;

    setState("loading");
    try {
      const res = await fetch("/api/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicName, level, targetDepth }),
      });
      const body = await res.json();
      if (res.status === 501) {
        setState("no-key");
        return;
      }
      if (!res.ok) {
        setErrorMessage(body.message ?? "Something went wrong.");
        setState("error");
        return;
      }
      const topic = addTopic(topicName, level, targetDepth, body.concepts);

      // Non-blocking: sanity-check the ordering in the background, don't make the learner wait on it.
      fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicName, concepts: body.concepts }),
      })
        .then((r) => r.json())
        .then((v) => {
          if (v.ok === false && Array.isArray(v.issues) && v.issues.length) {
            setVerificationNote(topic.id, v.issues.join(" "));
          }
        })
        .catch(() => {});

      router.push(`/topic/${topic.id}/diagnostic`);
    } catch {
      setErrorMessage("Couldn't reach the generator. Check your connection and try again.");
      setState("error");
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-[640px] px-5 py-12">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Start a new topic</h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          Name what you want to learn. Strata will order the concepts strictly foundation to mastery.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="text-xs font-medium text-[var(--ink-soft)]" htmlFor="topic">
              Topic
            </label>
            <input
              id="topic"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. special relativity, macroeconomics, Bayesian thinking…"
              className="mt-2 w-full border-b border-[var(--border-strong)] bg-transparent py-2 text-base outline-none placeholder:text-[var(--ink-faint)] focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--ink-soft)]" htmlFor="level">
              Your starting level
            </label>
            <select
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value as StartingLevel)}
              className="mt-2 w-full border-b border-[var(--border-strong)] bg-transparent py-2 text-base outline-none focus:border-[var(--accent)]"
            >
              {STARTING_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--ink-soft)]" htmlFor="depth">
              Target depth
            </label>
            <select
              id="depth"
              value={targetDepth}
              onChange={(e) => setTargetDepth(e.target.value as TargetDepth)}
              className="mt-2 w-full border-b border-[var(--border-strong)] bg-transparent py-2 text-base outline-none focus:border-[var(--accent)]"
            >
              {TARGET_DEPTHS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {state === "no-key" && (
            <p className="text-sm text-[var(--warning)]">
              No Gemini API key is configured on the server yet — add one to generate curricula.
            </p>
          )}
          {state === "error" && <p className="text-sm text-[var(--warning)]">{errorMessage}</p>}

          <button
            type="submit"
            disabled={state === "loading" || !name.trim()}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-[var(--paper)] disabled:opacity-40"
            style={{ background: "var(--ink)" }}
          >
            {state === "loading" ? "Building your path…" : "Build my path"}
          </button>
        </form>
      </main>
    </div>
  );
}
