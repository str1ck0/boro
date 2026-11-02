import Image from "next/image";
import Link from "next/link";
import { CategoryIcon } from "@/components/category-icon";
import { CATEGORIES } from "@/lib/categories";

/** Tall photo cards in a horizontal rail, as in the v2 "Discover" row. */
export function CategoryRail() {
  const withPhotos = CATEGORIES.filter((c): c is (typeof CATEGORIES)[number] & { image: string } => "image" in c);
  return (
    <div className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
      {withPhotos.map((c, i) => (
        <Link key={c.slug} href={`/explore?category=${c.slug}`} className="group w-36 shrink-0 snap-start sm:w-44">
          <div className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem] bg-mist shadow-[0_14px_24px_-14px_rgb(22_22_43/0.55)]">
            <Image
              src={c.image}
              alt=""
              fill
              priority={i < 3}
              sizes="176px"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
            <span className="absolute left-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/95 shadow-sm">
              <CategoryIcon icon={c.icon} className="size-5 text-ink" />
            </span>
          </div>
          <p className="mt-3 px-0.5 text-[17px] font-bold leading-tight">{c.label}</p>
        </Link>
      ))}
    </div>
  );
}
