import Link from "next/link";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/cn";

/**
 * The v2 splash artwork: the original icon field (one stroked path with the
 * four-colour brand gradient, so line weight and spacing are consistent) with
 * the wordmark sitting in the gap left for it.
 */
function SplashArt({ className, bold }: { className?: string; bold?: boolean }) {
  return (
    <Link href="/" aria-label="Boro home" className={cn("relative block aspect-[260.3/523.31]", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static vector art, no optimisation needed */}
      <img src={bold ? "/splash-icons-bold.svg" : "/splash-icons.svg"} alt="" className="absolute inset-0 size-full" />
      <Logo className="absolute left-[26%] top-[41.5%] h-auto w-[48%]" gap="#fff" />
    </Link>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-2">
      <div className="hidden items-center justify-center p-10 lg:flex">
        <SplashArt className="h-[min(86dvh,860px)]" />
      </div>
      <div className="flex flex-col items-center px-6 pb-10 pt-8 sm:px-12 lg:justify-center">
        {/* Heavier strokes at this size so the lines read the same as on desktop. */}
        <SplashArt bold className="h-[min(38dvh,320px)] lg:hidden" />
        <div className="mt-8 w-full max-w-sm lg:mt-0">{children}</div>
      </div>
    </div>
  );
}
