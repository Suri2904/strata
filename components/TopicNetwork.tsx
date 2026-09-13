"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Curriculum } from "@/lib/types";

interface Point {
  x: number;
  y: number;
}

export default function TopicNetwork({ topics }: { topics: Curriculum[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [paths, setPaths] = useState<{ id: string; d: string }[]>([]);

  useEffect(() => {
    function measure() {
      const container = containerRef.current;
      const hub = hubRef.current;
      if (!container || !hub) return;
      const containerRect = container.getBoundingClientRect();
      const hubRect = hub.getBoundingClientRect();
      const from: Point = {
        x: hubRect.left + hubRect.width / 2 - containerRect.left,
        y: hubRect.bottom - containerRect.top,
      };

      const next: { id: string; d: string }[] = [];
      for (const topic of topics) {
        const el = nodeRefs.current.get(topic.slug);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const to: Point = { x: r.left + r.width / 2 - containerRect.left, y: r.top - containerRect.top };
        const midY = (from.y + to.y) / 2;
        next.push({ id: topic.slug, d: `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}` });
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
  }, [topics]);

  return (
    <div ref={containerRef} className="relative">
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        {paths.map((p) => (
          <path key={p.id} d={p.d} fill="none" stroke="var(--gridline)" strokeWidth={2} strokeOpacity={0.9} />
        ))}
      </svg>

      <div className="relative flex flex-col items-center">
        <div
          ref={hubRef}
          className="flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-2"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-strong)]" />
          <span className="text-xs font-medium text-[var(--ink-primary)]">Curated library</span>
        </div>

        <div className="mt-12 flex flex-wrap items-start justify-center gap-4">
          {topics.map((topic) => (
            <Link
              key={topic.slug}
              href={`/map/${topic.slug}`}
              ref={(el) => {
                if (el) nodeRefs.current.set(topic.slug, el);
              }}
              className="w-[220px] rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4 transition-colors hover:border-[var(--accent)]"
            >
              <p className="font-display text-sm font-semibold text-[var(--ink-primary)]">{topic.topic}</p>
              <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-[var(--ink-secondary)]">{topic.tagline}</p>
              <p className="mt-2.5 text-[11px] text-[var(--ink-muted)]">{topic.nodes.length} concepts · instant, no key needed</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
