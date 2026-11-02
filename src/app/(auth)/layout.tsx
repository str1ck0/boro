import Link from "next/link";
import { CategoryIcon } from "@/components/category-icon";
import { Logo } from "@/components/logo";

const ICONS = [
  ["snorkel", "text-cosmos", "left-[8%] top-[6%]"],
  ["electric-guitar", "text-daintree", "left-[44%] top-[4%]"],
  ["kayak", "text-daintree", "right-[8%] top-[8%]"],
  ["camera", "text-outback", "left-[6%] top-[26%]"],
  ["tent", "text-cosmos", "left-[40%] top-[24%]"],
  ["umbrella", "text-eureka", "right-[6%] top-[28%]"],
  ["microphone", "text-outback", "left-[14%] top-[48%]"],
  ["lawn-mower", "text-cosmos", "left-[8%] top-[66%]"],
  ["bicycle", "text-daintree", "right-[10%] top-[62%]"],
  ["surfboard", "text-outback", "left-[6%] top-[84%]"],
  ["bbq-grill", "text-cosmos", "left-[42%] top-[80%]"],
  ["chainsaw", "text-eureka", "right-[24%] top-[82%]"],
  ["paint-palette", "text-cosmos", "left-[30%] top-[92%]"],
  ["speaker", "text-daintree", "right-[6%] top-[92%]"],
] as const;

/** Split-screen auth, echoing the v2 splash screen's icon field. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-surface lg:block" aria-hidden>
        {ICONS.map(([icon, color, pos]) => (
          <CategoryIcon key={icon} icon={icon} className={`absolute size-20 xl:size-24 ${color} ${pos}`} />
        ))}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="rounded-[2rem] bg-surface/90 px-10 py-8 text-center backdrop-blur-sm">
            <Logo className="h-24" gap="#fff" />
            <p className="mt-3 text-lg text-muted">Don&apos;t buy it. Boro it.</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link href="/" className="w-fit lg:hidden" aria-label="Boro home">
          <Logo className="h-9" />
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">{children}</div>
      </div>
    </div>
  );
}
