import { cn } from "@/lib/cn";

/**
 * The Boro wordmark, rebuilt as strokes so it's crisp at any size.
 * Each letter sits on a knockout stroke in the page colour, recreating
 * the little gaps where the letters overlap in the original artwork.
 */
export function Logo({
  className,
  mono,
  gap = "var(--color-canvas)",
  title = "Boro",
}: {
  className?: string;
  /** Render in a single colour (e.g. "white") instead of the four brand colours. */
  mono?: string;
  /** Colour of the knockout gaps — match the background the logo sits on. */
  gap?: string;
  title?: string;
}) {
  const c = (brand: string) => mono ?? brand;
  const letters = [
    { d: "M19 19V117 M142 117a57 57 0 1 1-114 0a57 57 0 1 1 114 0", color: c("#ff6633") },
    { d: "M281 117a57 57 0 1 1-114 0a57 57 0 1 1 114 0", color: c("#333399") },
    { d: "M467 117a57 57 0 1 1-114 0a57 57 0 1 1 114 0", color: c("#ffcc00") },
    { d: "M307 174V112A48 48 0 0 1 355 64", color: c("#33cc66") },
  ];
  return (
    <svg
      viewBox="0 0 486 193"
      role="img"
      aria-label={title}
      className={cn("h-8 w-auto", className)}
      fill="none"
      strokeLinecap="round"
    >
      {letters.map((l, i) => (
        <g key={i}>
          {i > 0 && !mono && <path d={l.d} stroke={gap} strokeWidth={52} />}
          <path d={l.d} stroke={l.color} strokeWidth={38} />
        </g>
      ))}
    </svg>
  );
}
