"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Lightweight "realtime": refresh server data on an interval while the tab is visible. */
export function AutoRefresh({ ms = 5000 }: { ms?: number }) {
  const router = useRouter();
  useEffect(() => {
    const tick = () => document.visibilityState === "visible" && router.refresh();
    const id = setInterval(tick, ms);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [ms, router]);
  return null;
}
