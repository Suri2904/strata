const STAGES = ["Hook", "Predict", "Reveal", "Retrieve", "So-What"];

export default function ProgressStrip({ stage }: { stage: number }) {
  return (
    <div className="flex gap-1.5" role="progressbar" aria-valuenow={stage + 1} aria-valuemin={1} aria-valuemax={5}>
      {STAGES.map((label, i) => (
        <div
          key={label}
          title={label}
          className="h-1 flex-1 rounded-full transition-colors duration-300"
          style={{ background: i <= stage ? "var(--accent)" : "var(--border-hairline)" }}
        />
      ))}
    </div>
  );
}
