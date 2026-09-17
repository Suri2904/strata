import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-[var(--border-hairline)]">
      <div className="mx-auto flex max-w-[640px] items-center justify-between px-5 py-5">
        <Link href="/" className="font-display text-lg italic tracking-tight">
          Strata
        </Link>
        <nav className="flex items-center gap-5 text-sm text-[var(--ink-soft)]">
          <Link href="/review" className="hover:text-[var(--ink)]">
            Review
          </Link>
          <Link href="/settings" className="hover:text-[var(--ink)]">
            Settings
          </Link>
        </nav>
      </div>
    </header>
  );
}
