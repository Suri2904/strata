import Link from "next/link";

export default function TopBar({ active }: { active?: "map" | "loop" }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-hairline)] bg-[var(--page)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          Strata
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/loop"
            className={`rounded-full px-3.5 py-1.5 transition-colors ${
              active === "loop"
                ? "bg-[var(--surface-3)] text-[var(--ink-primary)]"
                : "text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
            }`}
          >
            Execution Loop
          </Link>
          <a
            href="https://github.com/Suri2904/strata"
            target="_blank"
            rel="noreferrer"
            className="rounded-full px-3.5 py-1.5 text-[var(--ink-secondary)] transition-colors hover:text-[var(--ink-primary)]"
          >
            Source
          </a>
        </nav>
      </div>
    </header>
  );
}
