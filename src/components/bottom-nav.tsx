"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, MessageCircle, Plus, User } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = { signedIn: boolean; unread: number; pending: number };

/** Mobile tab bar, as in the v2 prototype — each tab picks up a brand colour when active. */
export function BottomNav({ signedIn, unread, pending }: Props) {
  const path = usePathname();
  const tabs = [
    { href: "/", label: "Home", icon: Home, active: path === "/", color: "text-outback" },
    { href: "/explore", label: "Explore", icon: Compass, active: path.startsWith("/explore"), color: "text-cosmos" },
    { href: "/lend", label: "Lend", icon: Plus, active: path.startsWith("/lend"), color: "text-ink", primary: true },
    {
      href: "/messages",
      label: "Chats",
      icon: MessageCircle,
      active: path.startsWith("/messages"),
      color: "text-daintree",
      badge: unread,
    },
    {
      href: signedIn ? "/my-boro" : "/sign-in",
      label: signedIn ? "My Boro" : "Log in",
      icon: User,
      active: ["/my-boro", "/account", "/saved", "/sign-in"].some((p) => path.startsWith(p)),
      color: "text-eureka",
      dot: pending > 0,
    },
  ];

  if (path.startsWith("/messages/")) return null; // full-screen chat on mobile

  return (
    <nav
      aria-label="Tabs"
      className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 px-2 pt-1.5">
        {tabs.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              aria-current={t.active ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-xl py-1 text-[11px] font-semibold",
                t.active ? t.color : "text-muted",
              )}
            >
              {t.primary ? (
                <span className="flex size-9 items-center justify-center rounded-full bg-outback text-white shadow-sm">
                  <t.icon className="size-5" strokeWidth={2.5} />
                </span>
              ) : (
                <t.icon className="size-6" strokeWidth={t.active ? 2.4 : 1.8} />
              )}
              <span className={t.primary ? "sr-only" : undefined}>{t.label}</span>
              {!!t.badge && (
                <span className="absolute right-[22%] top-0 flex min-w-4.5 items-center justify-center rounded-full bg-outback px-1 text-[10px] font-bold text-white">
                  {t.badge}
                </span>
              )}
              {t.dot && <span className="absolute right-[30%] top-1 size-2 rounded-full bg-outback" />}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
