import Link from "next/link";
import { CategoryIcon } from "@/components/category-icon";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <Link href="/" aria-label="Boro home"><Logo className="h-10" /></Link>
      <CategoryIcon icon="snorkel" className="size-24 text-cosmos" />
      <div>
        <h1 className="text-3xl font-extrabold">Someone&apos;s borrowed this page</h1>
        <p className="mt-2 text-muted">It might have been removed, paused, or never existed.</p>
      </div>
      <Link href="/explore" className="rounded-full bg-outback px-6 py-3 font-semibold text-white hover:bg-outback/90">
        Explore Boro
      </Link>
    </main>
  );
}
