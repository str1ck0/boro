"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { buttonClass } from "@/components/ui";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      className={buttonClass({ variant: "danger" })}
      onClick={async () => {
        await signOut();
        router.push("/");
        router.refresh();
      }}
    >
      <LogOut className="size-4" /> Log out
    </button>
  );
}
