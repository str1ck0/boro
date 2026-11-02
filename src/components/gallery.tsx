"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function Gallery({ photos, title }: { photos: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="space-y-3">
      <div className="group relative -mx-4 overflow-hidden sm:mx-0 sm:rounded-[1.75rem]">
        <div
          ref={track}
          onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="scrollbar-none flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto bg-line"
        >
          {photos.map((src, i) => (
            <div key={src} className="relative w-full shrink-0 snap-center">
              <Image
                src={src}
                alt={`${title} — photo ${i + 1} of ${photos.length}`}
                fill
                priority={i === 0}
                sizes="(min-width: 1024px) 700px, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        {photos.length > 1 && (
          <>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/30 px-2 py-1.5 backdrop-blur">
              {photos.map((_, i) => (
                <span key={i} className={cn("size-1.5 rounded-full transition", i === index ? "w-4 bg-white" : "bg-white/60")} />
              ))}
            </div>
            <button
              aria-label="Previous photo"
              onClick={() => go(Math.max(0, index - 1))}
              className="absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 opacity-0 shadow transition group-hover:opacity-100 disabled:hidden sm:flex"
              disabled={index === 0}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              aria-label="Next photo"
              onClick={() => go(Math.min(photos.length - 1, index + 1))}
              className="absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 opacity-0 shadow transition group-hover:opacity-100 disabled:hidden sm:flex"
              disabled={index === photos.length - 1}
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="hidden gap-2 sm:flex">
          {photos.map((src, i) => (
            <button
              key={src}
              onClick={() => go(i)}
              aria-label={`Show photo ${i + 1}`}
              className={cn("relative size-16 overflow-hidden rounded-xl ring-2 transition", i === index ? "ring-cosmos" : "ring-transparent opacity-70 hover:opacity-100")}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
