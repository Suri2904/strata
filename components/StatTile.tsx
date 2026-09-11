interface Props {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "good" | "warning" | "critical";
}

const TONE_COLOR: Record<NonNullable<Props["tone"]>, string> = {
  default: "var(--ink-primary)",
  good: "var(--good)",
  warning: "var(--warning)",
  critical: "var(--critical)",
};

export default function StatTile({ label, value, hint, tone = "default" }: Props) {
  return (
    <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-5">
      <p className="text-xs text-[var(--ink-muted)]">{label}</p>
      <p className="font-display mt-1.5 text-3xl font-semibold" style={{ color: TONE_COLOR[tone] }}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-[var(--ink-secondary)]">{hint}</p>}
    </div>
  );
}
