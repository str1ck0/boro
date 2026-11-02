import Link from "next/link";
import { CategoryIcon } from "@/components/category-icon";
import { CATEGORIES, TONE_CLASSES } from "@/lib/categories";
import { cn } from "@/lib/cn";

export function CategoryTiles() {
  return (
    <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 lg:grid-cols-6">
      {CATEGORIES.filter((c) => c.slug !== "other").map((c) => {
        const tone = TONE_CLASSES[c.tone];
        return (
          <Link
            key={c.slug}
            href={`/explore?category=${c.slug}`}
            className={cn(
              "group flex w-28 shrink-0 flex-col items-center gap-2 rounded-card px-3 py-4 text-center transition hover:-translate-y-0.5 sm:w-auto",
              tone.soft,
            )}
          >
            <CategoryIcon icon={c.icon} className={cn("size-10 transition group-hover:scale-110", tone.text)} />
            <span className="text-sm font-semibold leading-tight">{c.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
