import type { CSSProperties } from "react";
import { Logo } from "@/components/logo";
import { SPLASH_ICONS, type SplashIconName } from "@/components/splash-icons-data";

/** The brand gradient from the splash artwork, left to right. */
const STOPS: [number, [number, number, number]][] = [
  [0, [255, 102, 51]],
  [0.33, [51, 51, 153]],
  [0.66, [51, 204, 102]],
  [1, [255, 204, 0]],
];

function colorAt(t: number) {
  const x = Math.min(1, Math.max(0, t));
  const i = STOPS.findIndex(([at]) => at >= x);
  if (i <= 0) return rgb(STOPS[0][1]);
  const [a, ca] = STOPS[i - 1];
  const [b, cb] = STOPS[i];
  const k = (x - a) / (b - a);
  return rgb(ca.map((c, j) => c + (cb[j] - c) * k) as [number, number, number]);
}
const rgb = ([r, g, b]: [number, number, number]) => `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)})`;

/**
 * Where each icon floats: centre position (% of panel), drift offsets (px),
 * a little rotation (deg) and its own cycle length so they never sync up.
 */
type Placement = { name: SplashIconName; x: number; y: number; dx: number; dy: number; r: number; dur: number };

/** Desktop: a tall half-screen panel. */
const PANEL: Placement[] = [
  { name: "snorkel", x: 14, y: 13, dx: 10, dy: -12, r: 4, dur: 15 },
  { name: "guitar", x: 39, y: 15, dx: -8, dy: 12, r: -5, dur: 17 },
  { name: "kayak", x: 65, y: 12, dx: 12, dy: 8, r: 4, dur: 19 },
  { name: "umbrella", x: 88, y: 23, dx: -10, dy: -10, r: -4, dur: 16 },
  { name: "camera", x: 11, y: 36, dx: 8, dy: 10, r: 3, dur: 18 },
  { name: "tent", x: 35, y: 35, dx: -12, dy: -8, r: 2, dur: 21 },
  { name: "microphone", x: 60, y: 33, dx: 8, dy: -12, r: -6, dur: 14 },
  { name: "mower", x: 13, y: 58, dx: 12, dy: -8, r: 3, dur: 20 },
  { name: "chainsaw", x: 87, y: 52, dx: -10, dy: 10, r: -4, dur: 17 },
  { name: "bike", x: 37, y: 70, dx: 12, dy: 8, r: -2, dur: 22 },
  { name: "bbq", x: 64, y: 70, dx: -8, dy: -10, r: 4, dur: 16 },
  { name: "surfboard", x: 12, y: 84, dx: 10, dy: -12, r: -5, dur: 19 },
  { name: "palette", x: 40, y: 89, dx: -10, dy: -8, r: 5, dur: 18 },
  { name: "speaker", x: 85, y: 84, dx: -12, dy: 8, r: -3, dur: 20 },
];

/** Mobile: a wide banner above the form, so fewer icons in three loose rows. */
const BANNER: Placement[] = [
  { name: "snorkel", x: 10, y: 18, dx: 6, dy: -6, r: 4, dur: 15 },
  { name: "guitar", x: 30, y: 20, dx: -5, dy: 7, r: -5, dur: 17 },
  { name: "tent", x: 52, y: 17, dx: 6, dy: 5, r: 2, dur: 21 },
  { name: "kayak", x: 73, y: 20, dx: -6, dy: 6, r: 4, dur: 19 },
  { name: "umbrella", x: 92, y: 22, dx: -5, dy: -6, r: -4, dur: 16 },
  { name: "camera", x: 13, y: 52, dx: 5, dy: 6, r: 3, dur: 18 },
  { name: "chainsaw", x: 86, y: 54, dx: -6, dy: 6, r: -4, dur: 17 },
  { name: "mower", x: 11, y: 84, dx: 6, dy: -5, r: 3, dur: 20 },
  { name: "bike", x: 38, y: 86, dx: 6, dy: 4, r: -2, dur: 22 },
  { name: "bbq", x: 60, y: 84, dx: -5, dy: -6, r: 4, dur: 16 },
  { name: "speaker", x: 82, y: 85, dx: -6, dy: 5, r: -3, dur: 20 },
];

const VARIANTS = {
  // --u is 1% of the panel's shorter side; icons are SCALE% of the width per source unit.
  panel: { layout: PANEL, scale: 0.22, unit: "[--u:min(0.5vw,1dvh)]", logo: 22 },
  banner: { layout: BANNER, scale: 0.24, unit: "[--u:min(1vw,4.8px)]", logo: 40 },
} as const;

/**
 * The v2 splash icons, split apart and drifting slowly around the logo.
 * Fills its container; sized off `--u` (1% of the panel's shorter side).
 */
export function FloatingIcons({ variant = "panel" }: { variant?: keyof typeof VARIANTS }) {
  const { layout, scale: SCALE, unit, logo } = VARIANTS[variant];
  return (
    <div className={`relative size-full overflow-hidden ${unit}`} aria-hidden>
      {layout.map(({ name, x, y, dx, dy, r, dur }, i) => {
        const icon = SPLASH_ICONS[name];
        const half = (icon.w * SCALE) / 2;
        const from = (x - half) / 100;
        const to = (x + half) / 100;
        const style = {
          left: `${x}%`,
          top: `${y}%`,
          width: `calc(${icon.w * SCALE} * var(--u))`,
          "--dx": `${dx}px`,
          "--dy": `${dy}px`,
          "--r": `${r}deg`,
          "--dur": `${dur}s`,
          // Start each icon part-way through its cycle so nothing moves in lockstep.
          "--delay": `${-((i * 3.7) % dur)}s`,
          "--in": `${i * 60}ms`,
        } as CSSProperties;
        return (
          <svg key={name} viewBox={`0 0 ${icon.w} ${icon.h}`} className="splash-float absolute" style={style}>
            <defs>
              <linearGradient id={`splash-${variant}-${name}`}>
                {[0, 0.25, 0.5, 0.75, 1].map((k) => (
                  <stop key={k} offset={k} stopColor={colorAt(from + (to - from) * k)} />
                ))}
              </linearGradient>
            </defs>
            <path
              d={icon.d}
              fill="none"
              stroke={`url(#splash-${variant}-${name})`}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
      <Logo
        className="absolute left-1/2 top-1/2 h-auto -translate-x-1/2 -translate-y-1/2"
        style={{ width: `calc(${logo} * var(--u))` }}
        gap="#fff"
      />
    </div>
  );
}
