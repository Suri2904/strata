"use client";

import { useRef, useState } from "react";
import { niceCeil, formatShortDate } from "@/lib/chartMath";

interface Point {
  date: string;
  cumulative: number;
}

const HEIGHT = 220;
const PAD = { top: 16, right: 16, bottom: 28, left: 32 };

export default function CompoundingChart({ data }: { data: Point[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-2xl border border-dashed border-[var(--border-hairline)] text-sm text-[var(--ink-muted)]">
        No concepts mastered yet — your compounding curve starts after your first check.
      </div>
    );
  }

  const innerW = width - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const maxY = niceCeil(Math.max(...data.map((d) => d.cumulative)));
  const yTicks = [0, Math.round(maxY / 2), maxY];

  const x = (i: number) => (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => innerH - (v / maxY) * innerH;

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.cumulative)}`).join(" ");
  const areaPath = `${linePath} L ${x(data.length - 1)} ${innerH} L ${x(0)} ${innerH} Z`;

  function handleMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const ratio = data.length === 1 ? 0 : px / innerW;
    const idx = Math.round(ratio * (data.length - 1));
    setHoverIdx(Math.max(0, Math.min(idx, data.length - 1)));
  }

  const hovered = hoverIdx !== null ? data[hoverIdx] : null;

  return (
    <div ref={containerRef} className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs font-medium text-[var(--ink-secondary)]">Concepts mastered, cumulative</p>
        {hovered && (
          <p className="text-xs text-[var(--ink-muted)]">
            {formatShortDate(hovered.date)} · <span className="font-medium text-[var(--ink-primary)]">{hovered.cumulative}</span>
          </p>
        )}
      </div>
      <ResizeWatcher onWidth={setWidth} />
      <svg width="100%" height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} role="img" aria-label="Cumulative concepts mastered over time">
        <g transform={`translate(${PAD.left},${PAD.top})`}>
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={0} x2={innerW} y1={y(t)} y2={y(t)} stroke="var(--gridline)" strokeWidth={1} />
              <text x={-8} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="var(--ink-muted)">
                {t}
              </text>
            </g>
          ))}

          <path d={areaPath} fill="var(--accent)" fillOpacity={0.1} stroke="none" />
          <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

          {data.map((d, i) => (
            <circle key={d.date} cx={x(i)} cy={y(d.cumulative)} r={i === data.length - 1 ? 4 : 3} fill="var(--accent)" stroke="var(--surface-1)" strokeWidth={2} />
          ))}

          {hoverIdx !== null && (
            <line x1={x(hoverIdx)} x2={x(hoverIdx)} y1={0} y2={innerH} stroke="var(--ink-muted)" strokeWidth={1} strokeDasharray="3 3" />
          )}

          <text x={0} y={innerH + 20} fontSize={10} fill="var(--ink-muted)">
            {formatShortDate(data[0].date)}
          </text>
          <text x={innerW} y={innerH + 20} textAnchor="end" fontSize={10} fill="var(--ink-muted)">
            {formatShortDate(data[data.length - 1].date)}
          </text>

          <rect
            x={0}
            y={0}
            width={innerW}
            height={innerH}
            fill="transparent"
            onPointerMove={handleMove}
            onPointerLeave={() => setHoverIdx(null)}
          />
        </g>
      </svg>
    </div>
  );
}

function ResizeWatcher({ onWidth }: { onWidth: (w: number) => void }) {
  return (
    <div
      ref={(el) => {
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => onWidth(Math.max(280, entry.contentRect.width)));
        ro.observe(el.parentElement ?? el);
      }}
      className="h-0"
    />
  );
}
