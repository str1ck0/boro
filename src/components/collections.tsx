import Image from "next/image";
import Link from "next/link";
import { COLLECTIONS } from "@/lib/categories";
import { cn } from "@/lib/cn";

export function CollectionCards({ layout = "rail" }: { layout?: "rail" | "mosaic" }) {
  return (
    <div
      className={cn(
        layout === "rail"
          ? "scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0"
          : "grid grid-cols-2 gap-4 lg:grid-cols-3",
      )}
    >
      {COLLECTIONS.map((c, i) => (
        <Link
          key={c.slug}
          href={`/explore?collection=${c.slug}`}
          className={cn(
            "group relative isolate flex shrink-0 snap-start flex-col justify-end overflow-hidden rounded-card p-5 text-white",
            layout === "rail" ? "aspect-[4/3] w-[78vw] max-w-80 sm:w-auto sm:max-w-none" : "aspect-[4/5] sm:aspect-[4/3]",
            layout === "mosaic" && i === 0 && "col-span-2 aspect-[16/9] sm:aspect-[16/9] lg:col-span-2 lg:row-span-2 lg:aspect-auto",
          )}
        >
          <Image
            src={c.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 400px, 80vw"
            className="-z-10 object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <h3 className="text-2xl font-extrabold leading-tight tracking-tight">{c.title}</h3>
          <p className="mt-1 text-sm text-white/85">{c.blurb}</p>
        </Link>
      ))}
    </div>
  );
}
