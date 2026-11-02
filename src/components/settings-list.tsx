import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

/** A titled group of settings rows, styled after the v2 account screen. */
export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-1 text-xl font-bold">{title}</h2>
      <ul>{children}</ul>
    </section>
  );
}

export function SettingsRow({
  href,
  label,
  hint,
  badge,
  external,
}: {
  href: string;
  label: string;
  hint?: string;
  badge?: ReactNode;
  external?: boolean;
}) {
  return (
    <li className="border-b-2 border-outback">
      <Link
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="group flex items-center justify-between gap-4 py-4 text-[17px]"
      >
        <span className="min-w-0">
          <span className="flex items-center gap-2 font-medium">
            {label}
            {badge}
          </span>
          {hint && <span className="block truncate text-sm text-muted">{hint}</span>}
        </span>
        <ChevronRight className="size-6 shrink-0 transition group-hover:translate-x-0.5" strokeWidth={2.5} />
      </Link>
    </li>
  );
}
