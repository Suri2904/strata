import { ConceptDiagram } from "@/lib/types";

export default function Diagram({ diagram }: { diagram: ConceptDiagram }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 rounded-md border border-[var(--border-strong)] px-3 py-2.5 text-center text-sm">
        {diagram.left}
      </div>
      <div className="flex flex-shrink-0 flex-col items-center gap-0.5 px-1 text-[10px] uppercase tracking-wide text-[var(--ink-faint)]">
        <span>{diagram.relation}</span>
        <span aria-hidden="true">&#8594;</span>
      </div>
      <div className="flex-1 rounded-md border border-[var(--border-strong)] px-3 py-2.5 text-center text-sm">
        {diagram.right}
      </div>
    </div>
  );
}
