import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

/* ── Buttons ─────────────────────────────────────────────────────────── */

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const buttonVariants = {
  primary: "bg-outback-600 text-white hover:bg-outback-700 shadow-sm",
  secondary: "bg-cosmos text-white hover:bg-cosmos-700 shadow-sm",
  outline: "border border-line bg-surface text-ink hover:border-ink/30",
  ghost: "text-ink hover:bg-ink/5",
  success: "bg-daintree-700 text-white hover:bg-daintree-700/90",
  danger: "border border-line bg-surface text-outback-700 hover:border-outback-700/40",
} as const;

const buttonSizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
} as const;

type ButtonStyle = { variant?: keyof typeof buttonVariants; size?: keyof typeof buttonSizes };

export function buttonClass({ variant = "primary", size = "md" }: ButtonStyle = {}, className?: string) {
  return cn(buttonBase, buttonVariants[variant], buttonSizes[size], className);
}

export function Button({ variant, size, className, ...props }: ComponentProps<"button"> & ButtonStyle) {
  return <button className={buttonClass({ variant, size }, className)} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: ComponentProps<typeof Link> & ButtonStyle) {
  return <Link className={buttonClass({ variant, size }, className)} {...props} />;
}

/* ── Form fields ─────────────────────────────────────────────────────── */

const fieldBase =
  "w-full rounded-2xl border border-line bg-surface px-4 text-[15px] text-ink placeholder:text-muted/70 transition focus:border-cosmos focus:ring-4 focus:ring-cosmos/10 focus:outline-none aria-invalid:border-outback-600";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(fieldBase, "h-12", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(fieldBase, "min-h-32 py-3 leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(fieldBase, "h-12 appearance-none bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10", className)} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236a6a7e' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }} {...props} />;
}

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-outback-700">{error}</p>
      ) : hint ? (
        <p className="text-sm text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

/* ── Display ─────────────────────────────────────────────────────────── */

export function Avatar({
  src,
  name,
  size = 40,
  className,
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-cosmos-100 font-semibold text-cosmos", className)}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </span>
  );
}

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          aria-hidden
          className={cn("size-3.5", i <= Math.round(rating) ? "fill-outback text-outback" : "fill-line text-line")}
        />
      ))}
    </span>
  );
}

export function RatingSummary({ avg, count }: { avg: number | null; count: number }) {
  if (!count || avg == null) return <span className="text-sm text-muted">No reviews yet</span>;
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold">
      <Star aria-hidden className="size-4 fill-outback text-outback" />
      {avg.toFixed(1)}
      <span className="font-normal text-muted">({count})</span>
    </span>
  );
}

const badgeTones = {
  outback: "bg-outback-50 text-outback-700",
  cosmos: "bg-cosmos-50 text-cosmos",
  daintree: "bg-daintree-50 text-daintree-700",
  eureka: "bg-eureka-50 text-eureka-700",
  neutral: "bg-ink/5 text-muted",
} as const;

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: keyof typeof badgeTones;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", badgeTones[tone], className)}>
      {children}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-line bg-surface/60 px-6 py-14 text-center">
      {icon && <div className="mb-4 text-cosmos">{icon}</div>}
      <h3 className="text-lg font-bold">{title}</h3>
      {children && <p className="mt-1 max-w-sm text-muted">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  tone = "cosmos",
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  tone?: "cosmos" | "outback" | "daintree" | "eureka";
  action?: ReactNode;
}) {
  const color = {
    cosmos: "text-cosmos",
    outback: "text-outback-600",
    daintree: "text-daintree-700",
    eureka: "text-eureka-700",
  }[tone];
  return (
    <div className="flex items-end justify-between gap-4 pb-6 pt-2">
      <div>
        <h1 className={cn("text-3xl font-extrabold tracking-tight sm:text-4xl", color)}>{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionHeading({ title, subtitle, href, linkLabel = "See all" }: { title: string; subtitle?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="shrink-0 text-sm font-semibold text-cosmos hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
