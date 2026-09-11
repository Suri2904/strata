"use client";

import { useState } from "react";
import { niceCeil, formatShortDate } from "@/lib/chartMath";

interface Point {
  date: string;
  count: number;
}

const HEIGHT = 200;
const PAD = { top: 16, right: 16, bottom: 28, left: 28 };

export default function CadenceChart({ data }: { data: Point[] }) {
  const [width, setWidth] = useState(600);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const innerW = width - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const maxCount = niceCeil(Math.max(1, ...data.map((d) => d.count)));
  const average = data.reduce((s, d) => s + d.count, 0) / (data.length || 1);

  const slot = innerW / data.length;
  const barW = Math.min(24, slot * 0.55);
  const x = (i: number) => i * slot + slot / 2;
  const y = (v: number) => innerH - (v / maxCount) * innerH;

  const hovered = hoverIdx !== null ? data[hoverIdx] : null;

  return (
    <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs font-medium text-[var(--ink-secondary)]">Sessions per day, last 14 days</p>
        <div className="flex items-center gap-3 text-[11px] text-[var(--ink-muted)]">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-[var(--accent)]" /> Sessions
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-0.5 w-3 bg-[var(--ink-muted)]" style={{ borderTop: "1px dashed var(--ink-muted)" }} /> Your average
          </span>
        </div>
      </div>
      <div
        ref={(el) => {
          if (!el) return;
          const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
          ro.observe(el);
        }}
        className="h-0"
      />
      <svg width="100%" height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} role="img" aria-label="Sessions per day for the last 14 days">
        <g transform={`translate(${PAD.left},${PAD.top})`}>
          <line x1={0} x2={innerW} y1={innerH} y2={innerH} stroke="var(--baseline)" strokeWidth={1} />
          <line x1={0} x2={innerW} y1={y(average)} y2={y(average)} stroke="var(--ink-muted)" strokeWidth={1} strokeDasharray="4 3" />

          {data.map((d, i) => {
            const barH = (d.count / maxCount) * innerH;
            const active = hoverIdx === i;
            return (
              <g key={d.date}>
                <rect
                  x={x(i) - barW / 2}
                  y={y(d.count)}
                  width={barW}
                  height={Math.max(0, barH)}
                  rx={4}
                  fill="var(--accent)"
                  opacity={active ? 1 : 0.85}
                />
                <rect
                  x={x(i) - slot / 2}
                  y={0}
                  width={slot}
                  height={innerH}
                  fill="transparent"
                  onPointerEnter={() => setHoverIdx(i)}
                  onPointerLeave={() => setHoverIdx(null)}
                />
              </g>
            );
          })}

          {data.map(
            (d, i) =>
              i % 2 === 0 && (
                <text key={d.date} x={x(i)} y={innerH + 18} textAnchor="middle" fontSize={9} fill="var(--ink-muted)">
                  {formatShortDate(d.date).split(" ")[1]}
                </text>
              ),
          )}
        </g>
      </svg>
      {hovered && (
        <p className="mt-1 text-center text-xs text-[var(--ink-muted)]">
          {formatShortDate(hovered.date)}: <span className="font-medium text-[var(--ink-primary)]">{hovered.count}</span> session
          {hovered.count === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}
