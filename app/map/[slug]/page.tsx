"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStrataStore } from "@/lib/store";
import { getCuratedCurriculum } from "@/lib/curricula";
import { ConceptNode, NodeStatus } from "@/lib/types";
import { isDue } from "@/lib/spacedRepetition";
import { masteredCount, progressKey } from "@/lib/selectors";
import TopBar from "@/components/TopBar";
import StrataGraph from "@/components/StrataGraph";
import NodePanel from "@/components/NodePanel";

// "idle" doubles as "still loading" whenever curriculum isn't present yet — there's no
// separate "loading" value, since the render below already shows the spinner by default
// in that case, without needing an explicit setState at the start of the fetch effect.
type FetchState = "idle" | "no-key" | "error";

export default function MapPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const topicHint = searchParams.get("topic") ?? undefined;

  const curricula = useStrataStore((s) => s.curricula);
  const progress = useStrataStore((s) => s.progress);
  const addCurriculum = useStrataStore((s) => s.addCurriculum);
  const recordAttempt = useStrataStore((s) => s.recordAttempt);
  const getNodeStatus = useStrataStore((s) => s.getNodeStatus);

  const [fetchState, setFetchState] = useState<FetchState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [selected, setSelected] = useState<ConceptNode | null>(null);

  // curriculum being present is the single source of truth for "ready" — no separate state needed for it.
  const curriculum = curricula[slug];

  useEffect(() => {
    if (curriculum) return;

    const curated = getCuratedCurriculum(slug);
    if (curated) {
      addCurriculum(curated);
      return;
    }

    let cancelled = false;
    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: topicHint ?? slug.replace(/-/g, " ") }),
    })
      .then(async (res) => {
        if (cancelled) return;
        const body = await res.json();
        if (res.status === 501) {
          setFetchState("no-key");
          return;
        }
        if (!res.ok) {
          setErrorMessage(body.message ?? "Something went wrong generating this path.");
          setFetchState("error");
          return;
        }
        addCurriculum(body.curriculum);
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMessage("Couldn't reach the generator. Check your connection and try again.");
          setFetchState("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug, curriculum, topicHint, addCurriculum]);

  const statusOf = (node: ConceptNode): NodeStatus => (curriculum ? getNodeStatus(curriculum.slug, node) : "locked");
  const dueOf = (node: ConceptNode): boolean => {
    if (!curriculum) return false;
    const p = progress[progressKey(curriculum.slug, node.id)];
    return p?.status === "mastered" && isDue(p.nextReviewAt);
  };

  const missingPrereqTitles = useMemo(() => {
    if (!selected || !curriculum) return [];
    return selected.prerequisites
      .filter((id) => statusOf(curriculum.nodes.find((n) => n.id === id)!) !== "mastered")
      .map((id) => curriculum.nodes.find((n) => n.id === id)?.title ?? id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, curriculum, progress]);

  if (!curriculum) {
    if (fetchState === "no-key") {
      return (
        <div className="min-h-screen">
          <TopBar />
          <div className="mx-auto max-w-lg px-5 py-24 text-center">
            <h1 className="font-display text-xl font-semibold">No API key configured yet</h1>
            <p className="mt-3 text-sm text-[var(--ink-secondary)]">
              Custom-topic generation needs a Gemini key wired into the server. Until then, try one of the curated paths.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-xl bg-[var(--ink-primary)] px-5 py-2.5 text-sm font-semibold text-[#0a0a0a]"
            >
              ← Back home
            </Link>
          </div>
        </div>
      );
    }

    if (fetchState === "error") {
      return (
        <div className="min-h-screen">
          <TopBar />
          <div className="mx-auto max-w-lg px-5 py-24 text-center">
            <h1 className="font-display text-xl font-semibold">Couldn&apos;t build this path</h1>
            <p className="mt-3 text-sm text-[var(--ink-secondary)]">{errorMessage}</p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => router.refresh()}
                className="rounded-xl border border-[var(--border-strong)] px-5 py-2.5 text-sm font-semibold"
              >
                Try again
              </button>
              <Link href="/" className="rounded-xl bg-[var(--ink-primary)] px-5 py-2.5 text-sm font-semibold text-[#0a0a0a]">
                ← Back home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen">
        <TopBar />
        <div className="mx-auto flex max-w-3xl flex-col items-center px-5 py-24 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--accent)]" />
          <p className="mt-5 text-sm text-[var(--ink-secondary)]">Building your mastery path…</p>
        </div>
      </div>
    );
  }

  const done = masteredCount(curriculum, progress);

  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <p className="text-xs uppercase tracking-wider text-[var(--ink-muted)]">
          {curriculum.source === "gemini" ? "Generated for you" : "Curated"}
        </p>
        <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight">{curriculum.topic}</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ink-secondary)]">{curriculum.tagline}</p>
        <p className="mt-3 text-xs text-[var(--ink-muted)]">
          {done} / {curriculum.nodes.length} concepts mastered
        </p>

        <div className="mt-10">
          <StrataGraph
            nodes={curriculum.nodes}
            statusOf={statusOf}
            dueOf={dueOf}
            onSelect={setSelected}
            selectedId={selected?.id}
          />
        </div>
      </div>

      <NodePanel
        node={selected}
        curriculum={curriculum}
        status={selected ? statusOf(selected) : "locked"}
        missingPrereqTitles={missingPrereqTitles}
        onClose={() => setSelected(null)}
        onComplete={(confidence, score) => {
          if (selected) recordAttempt(curriculum, selected, confidence, score);
          setSelected(null);
        }}
      />
    </div>
  );
}
