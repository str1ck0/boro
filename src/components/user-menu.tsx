"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui";
import { signOut } from "@/lib/auth-client";

export function UserMenu({ image, name }: { image: string | null; name: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const item = "block rounded-xl px-3 py-2 text-[15px] hover:bg-ink/5";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="rounded-full ring-offset-2 ring-offset-canvas transition hover:ring-2 hover:ring-line"
      >
        <Avatar src={image} name={name} size={36} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 w-56 rounded-2xl border border-line bg-surface p-2 shadow-float"
          onClick={() => setOpen(false)}
        >
          <p className="truncate px-3 pb-2 pt-1 text-sm text-muted">{name}</p>
          <Link role="menuitem" href="/my-boro" className={item}>My Boro</Link>
          <Link role="menuitem" href="/saved" className={item}>Saved items</Link>
          <Link role="menuitem" href="/account" className={item}>Account settings</Link>
          <hr className="my-2 border-line" />
          <button
            role="menuitem"
            className={`${item} w-full text-left text-outback-700`}
            onClick={async () => {
              await signOut();
              router.push("/");
              router.refresh();
            }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
