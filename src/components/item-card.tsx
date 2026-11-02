import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { FavoriteButton } from "@/components/favorite-button";
import { CategoryIcon } from "@/components/category-icon";
import { getCategory, TONE_CLASSES } from "@/lib/categories";
import { cn } from "@/lib/cn";
import { money } from "@/lib/format";
import type { ItemCardData } from "@/lib/queries";

export function ItemCard({
  item,
  saved,
  className,
  priority,
}: {
  item: ItemCardData;
  saved?: boolean;
  className?: string;
  priority?: boolean;
}) {
  const cat = getCategory(item.category);
  return (
    <Link href={`/items/${item.id}`} className={cn("group block", className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-line">
        {item.photo ? (
          <Image
            src={item.photo}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1024px) 270px, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className={cn("flex size-full items-center justify-center", TONE_CLASSES[cat.tone].soft, TONE_CLASSES[cat.tone].text)}>
            <CategoryIcon icon={cat.icon} className="size-16" />
          </div>
        )}
        {saved !== undefined && <FavoriteButton itemId={item.id} saved={saved} className="absolute right-3 top-3" />}
      </div>
      <div className="mt-3 space-y-0.5 px-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-bold leading-snug">{item.title}</h3>
          {item.rating != null && (
            <span className="flex shrink-0 items-center gap-0.5 text-sm font-semibold">
              <Star aria-hidden className="size-3.5 fill-outback text-outback" />
              {item.rating.toFixed(1)}
            </span>
          )}
        </div>
        <p className="flex items-center gap-1 text-sm text-muted">
          <MapPin aria-hidden className="size-3.5" /> {item.suburb}
        </p>
        <p className="pt-0.5 text-[15px]">
          <span className="font-bold">{money(item.pricePerDay)}</span>
          <span className="text-muted"> / day</span>
        </p>
      </div>
    </Link>
  );
}

export function ItemGrid({ items, savedIds, firstPriority }: { items: ItemCardData[]; savedIds?: Set<string>; firstPriority?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item, i) => (
        <ItemCard key={item.id} item={item} saved={savedIds?.has(item.id)} priority={firstPriority && i < 4} />
      ))}
    </div>
  );
}

/** Horizontally scrolling row on mobile, grid on desktop. */
export function ItemRail({ items, savedIds }: { items: ItemCardData[]; savedIds?: Set<string> }) {
  return (
    <div className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} saved={savedIds?.has(item.id)} className="w-[44vw] max-w-56 shrink-0 snap-start sm:w-auto sm:max-w-none" />
      ))}
    </div>
  );
}
