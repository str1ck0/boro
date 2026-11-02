import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Tintable brand line-icon from /public/icons. Colour comes from `text-*`. */
export function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("icon-mask inline-block size-8", className)}
      style={{ "--icon": `url(/icons/${icon}.svg)` } as CSSProperties}
    />
  );
}
