"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search, X } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { SUBURBS } from "@/lib/suburbs";
import { cn } from "@/lib/cn";

const SORTS = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

const PRICES = [
  { value: "", label: "Any price" },
  { value: "100", label: "Under R100/day" },
  { value: "250", label: "Under R250/day" },
  { value: "500", label: "Under R500/day" },
];

const pill =
  "h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition whitespace-nowrap";

export function ExploreFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    start(() => router.push(`/explore?${next.toString()}`, { scroll: false }));
  };

  const active = params.get("category");
  const selectClass =
    "h-10 shrink-0 appearance-none rounded-full border border-transparent bg-mist pl-4 pr-8 text-sm font-semibold focus:border-cosmos focus:outline-none bg-[length:0.9rem] bg-[right_0.75rem_center] bg-no-repeat";
  const chevron = {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2316162b' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
  };

  return (
    <div className={cn("space-y-4 transition-opacity", pending && "opacity-70")}>
      <form
        role="search"
        className="relative"
        onSubmit={(e) => {
          e.preventDefault();
          const q = new FormData(e.currentTarget).get("q") as string;
          set({ q: q.trim() || null, collection: null });
        }}
      >
        <Search aria-hidden className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <input
          key={params.get("q") ?? ""}
          name="q"
          type="search"
          defaultValue={params.get("q") ?? ""}
          placeholder="Search for anything"
          aria-label="Search"
          className="h-13 w-full rounded-full border border-transparent bg-mist focus:bg-surface pl-13 pr-5 text-base placeholder:text-muted/80 focus:border-cosmos focus:outline-none focus:ring-4 focus:ring-cosmos/10"
        />
      </form>

      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <button
          onClick={() => set({ category: null, collection: null })}
          className={cn(pill, !active ? "border-cosmos bg-cosmos text-white" : "border-transparent bg-mist hover:bg-mist-deep")}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.slug}
            onClick={() => set({ category: active === c.slug ? null : c.slug, collection: null })}
            aria-pressed={active === c.slug}
            className={cn(
              pill,
              "inline-flex items-center gap-1.5",
              active === c.slug ? "border-cosmos bg-cosmos text-white" : "border-transparent bg-mist hover:bg-mist-deep",
            )}
          >
            {c.label}
            {active === c.slug && <X aria-hidden className="size-3.5" />}
          </button>
        ))}
      </div>

      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <select
          aria-label="Sort by"
          value={params.get("sort") ?? "recommended"}
          onChange={(e) => set({ sort: e.target.value === "recommended" ? null : e.target.value })}
          className={selectClass}
          style={chevron}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          aria-label="Suburb"
          value={params.get("suburb") ?? ""}
          onChange={(e) => set({ suburb: e.target.value || null })}
          className={selectClass}
          style={chevron}
        >
          <option value="">All of Cape Town</option>
          {SUBURBS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          aria-label="Maximum price"
          value={params.get("max") ?? ""}
          onChange={(e) => set({ max: e.target.value || null })}
          className={selectClass}
          style={chevron}
        >
          {PRICES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
