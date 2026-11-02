"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { deleteItem, setItemStatus } from "@/app/actions/items";
import { buttonClass } from "@/components/ui";

export function OwnerControls({ itemId, status }: { itemId: string; status: "active" | "paused" }) {
  const [pending, start] = useTransition();
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        {status === "active"
          ? "This listing is live. Borrowers can find it and send requests."
          : "This listing is paused and hidden from search."}
      </p>
      <div className="grid gap-2">
        <Link href={`/items/${itemId}/edit`} className={buttonClass({ variant: "secondary" })}>
          <Pencil className="size-4" /> Edit listing
        </Link>
        <button
          disabled={pending}
          onClick={() => start(() => setItemStatus(itemId, status === "active" ? "paused" : "active"))}
          className={buttonClass({ variant: "outline" })}
        >
          {status === "active" ? <><EyeOff className="size-4" /> Pause listing</> : <><Eye className="size-4" /> Make it live again</>}
        </button>
        <button
          disabled={pending}
          onClick={() => {
            if (window.confirm("Delete this listing for good? Past bookings and reviews will go too.")) {
              start(() => deleteItem(itemId));
            }
          }}
          className={buttonClass({ variant: "danger" })}
        >
          <Trash2 className="size-4" /> Delete
        </button>
      </div>
    </div>
  );
}
