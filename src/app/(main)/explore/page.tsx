import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SearchX } from "lucide-react";
import { CollectionCards } from "@/components/collections";
import { ExploreFilters } from "@/components/explore-filters";
import { ItemGrid } from "@/components/item-card";
import { EmptyState, PageHeader } from "@/components/ui";
import { getCategory, getCollection } from "@/lib/categories";
import { getFavoriteIds, listItems, type ItemSort } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Explore" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const SORTS: ItemSort[] = ["recommended", "newest", "price-asc", "price-desc"];

export default async function ExplorePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = one(sp.q)?.slice(0, 100);
  const category = one(sp.category);
  const collection = getCollection(one(sp.collection) ?? "");
  const suburb = one(sp.suburb);
  const max = Number(one(sp.max));
  const sortParam = one(sp.sort) as ItemSort | undefined;
  const sort = sortParam && SORTS.includes(sortParam) ? sortParam : "recommended";

  const filtering = Boolean(q || category || collection || suburb || max || sortParam);
  const user = await getCurrentUser();
  const [results, savedIds] = await Promise.all([
    listItems({
      q,
      categories: category ? [category] : collection ? [...collection.categories] : undefined,
      suburb,
      maxPrice: max > 0 ? max * 100 : undefined,
      sort,
      limit: 60,
    }),
    getFavoriteIds(user?.id),
  ]);

  const heading = collection
    ? collection.title
    : q
      ? `Results for “${q}”`
      : category
        ? getCategory(category).label
        : "All items";

  return (
    <div className="space-y-8">
      <PageHeader title="Explore" subtitle="See what's out there" />
      <Suspense>
        <ExploreFilters />
      </Suspense>

      {!filtering && (
        <section>
          <h2 className="mb-4 text-xl font-bold tracking-tight sm:text-2xl">Collections</h2>
          <CollectionCards layout="mosaic" />
        </section>
      )}

      <section aria-live="polite">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{heading}</h2>
          <p className="shrink-0 text-sm text-muted">
            {results.length} item{results.length === 1 ? "" : "s"}
            {suburb && <> in {suburb}</>}
          </p>
        </div>
        {collection && <p className="-mt-3 mb-6 text-muted">{collection.blurb}</p>}
        {results.length ? (
          <ItemGrid items={results} savedIds={savedIds} firstPriority={!filtering} />
        ) : (
          <EmptyState
            icon={<SearchX className="size-10" />}
            title="Nothing here yet"
            action={
              <Link href="/lend" className="font-semibold text-cosmos hover:underline">
                Got one? List it on Boro →
              </Link>
            }
          >
            Try a different search or suburb — or be the first to lend one.
          </EmptyState>
        )}
      </section>
    </div>
  );
}
