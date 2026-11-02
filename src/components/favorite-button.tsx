"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { toggleFavorite } from "@/app/actions/items";
import { cn } from "@/lib/cn";

export function FavoriteButton({
  itemId,
  saved,
  className,
  variant = "overlay",
}: {
  itemId: string;
  saved: boolean;
  className?: string;
  variant?: "overlay" | "plain";
}) {
  const router = useRouter();
  const [, start] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(saved);

  return (
    <button
      type="button"
      aria-pressed={optimistic}
      aria-label={optimistic ? "Remove from saved" : "Save item"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        start(async () => {
          setOptimistic(!optimistic);
          const res = await toggleFavorite(itemId);
          if ("error" in res) router.push(`/sign-in?next=/items/${itemId}`);
        });
      }}
      className={cn(
        "flex items-center justify-center rounded-full transition active:scale-90",
        variant === "overlay"
          ? "size-9 bg-surface/90 shadow-sm backdrop-blur hover:bg-surface"
          : "size-12 border border-line bg-surface hover:border-ink/30",
        className,
      )}
    >
      <Heart className={cn("size-5", optimistic ? "fill-outback text-outback" : "text-ink")} />
    </button>
  );
}
