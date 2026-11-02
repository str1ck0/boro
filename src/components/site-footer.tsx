import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="hidden border-t border-line bg-surface md:block">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-10">
        <div className="flex items-center gap-4">
          <Logo className="h-6" gap="#fff" />
          <p className="text-sm text-muted">Don&apos;t buy it. Boro it. Made in Perth.</p>
        </div>
        <nav className="flex gap-6 text-sm text-muted" aria-label="Footer">
          <Link href="/how-it-works" className="hover:text-ink">How Boro works</Link>
          <Link href="/guidelines" className="hover:text-ink">Lend &amp; borrow guidelines</Link>
          <Link href="/explore" className="hover:text-ink">Explore</Link>
        </nav>
      </div>
    </footer>
  );
}
