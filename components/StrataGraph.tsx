"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ConceptNode, NodeStatus } from "@/lib/types";

interface Props {
  nodes: ConceptNode[];
  statusOf: (node: ConceptNode) => NodeStatus;
  dueOf: (node: ConceptNode) => boolean;
  onSelect: (node: ConceptNode) => void;
  selectedId?: string;
}

interface Point {
  x: number;
  y: number;
}

const DEPTH_LABELS: Record<number, string> = {
  0: "Bedrock",
};

export default function StrataGraph({ nodes, statusOf, dueOf, onSelect, selectedId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [paths, setPaths] = useState<{ id: string; d: string; active: boolean }[]>([]);
  const [tick, setTick] = useState(0);

  const depths = useMemo(() => Array.from(new Set(nodes.map((n) => n.depth))).sort((a, b) => a - b), [nodes]);
  const byDepth = useMemo(() => {
    const map = new Map<number, ConceptNode[]>();
    for (const d of depths) map.set(d, nodes.filter((n) => n.depth === d));
    return map;
  }, [nodes, depths]);

  useEffect(() => {
    function measure() {
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const centerBottom = (el: HTMLElement): Point => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - containerRect.left, y: r.bottom - containerRect.top };
      };
      const centerTop = (el: HTMLElement): Point => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - containerRect.left, y: r.top - containerRect.top };
      };

      const next: { id: string; d: string; active: boolean }[] = [];
      for (const node of nodes) {
        const target = nodeRefs.current.get(node.id);
        if (!target) continue;
        const to = centerTop(target);
        for (const prereqId of node.prerequisites) {
          const source = nodeRefs.current.get(prereqId);
          if (!source) continue;
          const from = centerBottom(source);
          const midY = (from.y + to.y) / 2;
          const d = `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;
          const prereqNode = nodes.find((n) => n.id === prereqId);
          const active = prereqNode ? statusOf(prereqNode) === "mastered" : false;
          next.push({ id: `${prereqId}->${node.id}`, d, active });
        }
      }
      setPaths(next);
    }

    measure();
    const ro = new ResizeObserver(() => measure());
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, tick]);

  // re-measure after status changes settle (unlock animation) and fonts load
  useEffect(() => {
    const t = setTimeout(() => setTick((n) => n + 1), 350);
    return () => clearTimeout(t);
  }, [nodes]);

  return (
    <div ref={containerRef} className="relative">
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        {paths.map((p) => (
          <path
            key={p.id}
            d={p.d}
            fill="none"
            stroke={p.active ? "var(--accent)" : "var(--gridline)"}
            strokeOpacity={p.active ? 0.55 : 0.8}
            strokeWidth={2}
          />
        ))}
      </svg>

      <div className="relative flex flex-col gap-10">
        {depths.map((depth) => (
          <div key={depth}>
            <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--ink-muted)]">
              <span>Layer {depth}</span>
              {DEPTH_LABELS[depth] && <span className="text-[var(--ink-primary)]">· {DEPTH_LABELS[depth]}</span>}
            </div>
            <div className="flex flex-wrap gap-3">
              {byDepth.get(depth)!.map((node) => {
                const status = statusOf(node);
                const isDue = dueOf(node);
                const selected = selectedId === node.id;
                return (
                  <motion.button
                    key={node.id}
                    ref={(el) => {
                      if (el) nodeRefs.current.set(node.id, el);
                    }}
                    onClick={() => onSelect(node)}
                    initial={false}
                    animate={
                      status === "available"
                        ? { boxShadow: ["0 0 0 0 rgba(57,135,229,0)", "0 0 0 6px rgba(57,135,229,0.08)", "0 0 0 0 rgba(57,135,229,0)"] }
                        : {}
                    }
                    transition={status === "available" ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" } : {}}
                    className={[
                      "min-w-[180px] max-w-[240px] rounded-xl border px-4 py-3 text-left transition-colors",
                      status === "locked" &&
                        "cursor-default border-dashed border-[var(--border-hairline)] bg-transparent opacity-45",
                      status === "available" &&
                        `border-[var(--border-strong)] bg-[var(--surface-1)] hover:border-[var(--accent)] ${
                          selected ? "border-[var(--accent)]" : ""
                        }`,
                      status === "mastered" &&
                        `border-[var(--accent)]/40 bg-[var(--accent-soft)] hover:border-[var(--accent)] ${
                          selected ? "border-[var(--accent)]" : ""
                        }`,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium leading-snug text-[var(--ink-primary)]">{node.title}</span>
                      {status === "locked" && <LockIcon />}
                      {status === "mastered" && <CheckIcon />}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[var(--ink-muted)]">
                      <span>{node.estMinutes} min</span>
                      {isDue && (
                        <span className="rounded-full bg-[var(--warning)]/15 px-1.5 py-0.5 font-medium text-[var(--warning)]">
                          due for review
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-[var(--ink-muted)]">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-[var(--accent-strong)]">
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
