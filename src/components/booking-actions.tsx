"use client";

import { useActionState, useState, useTransition } from "react";
import { Star } from "lucide-react";
import { leaveReview, updateBooking } from "@/app/actions/bookings";
import { Button, Textarea } from "@/components/ui";
import type { BookingStatus } from "@/components/booking-status";
import { cn } from "@/lib/cn";
import type { FormState } from "@/lib/form";

export function BookingActions({
  bookingId,
  status,
  role,
  reviewed,
  otherName,
}: {
  bookingId: string;
  status: BookingStatus;
  role: "lender" | "borrower";
  reviewed: boolean;
  otherName: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();
  const act = (a: "accept" | "decline" | "cancel" | "complete", confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    start(async () => {
      const res = await updateBooking(bookingId, a);
      setError(res && "error" in res ? res.error : undefined);
    });
  };

  let buttons: React.ReactNode = null;
  if (role === "lender" && status === "requested") {
    buttons = (
      <>
        <Button size="sm" variant="success" disabled={pending} onClick={() => act("accept")}>Accept</Button>
        <Button size="sm" variant="outline" disabled={pending} onClick={() => act("decline", `Decline ${otherName}'s request?`)}>Decline</Button>
      </>
    );
  } else if (role === "lender" && status === "accepted") {
    buttons = (
      <>
        <Button size="sm" variant="secondary" disabled={pending} onClick={() => act("complete", "Mark as returned? Do this once you have the item back.")}>
          Mark as returned
        </Button>
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => act("cancel", "Cancel this booking?")}>Cancel</Button>
      </>
    );
  } else if (role === "borrower" && (status === "requested" || status === "accepted")) {
    buttons = (
      <Button size="sm" variant="ghost" disabled={pending} onClick={() => act("cancel", status === "accepted" ? "Cancel this confirmed booking?" : "Withdraw your request?")}>
        {status === "requested" ? "Withdraw request" : "Cancel booking"}
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      {buttons && <div className="flex flex-wrap gap-2">{buttons}</div>}
      {error && <p className="text-sm text-outback-700">{error}</p>}
      {status === "completed" && !reviewed && <ReviewForm bookingId={bookingId} otherName={otherName} role={role} />}
      {status === "completed" && reviewed && <p className="text-sm text-muted">Thanks for leaving a review ✓</p>}
    </div>
  );
}

function ReviewForm({ bookingId, otherName, role }: { bookingId: string; otherName: string; role: "lender" | "borrower" }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [state, action, pending] = useActionState<FormState, FormData>(leaveReview.bind(null, bookingId), {});

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        <Star className="size-4" /> Review {otherName}
      </Button>
    );
  }
  return (
    <form action={action} className="space-y-3 rounded-2xl bg-mist p-4">
      <p className="font-semibold">
        {role === "borrower" ? `How was the item and borrowing from ${otherName}?` : `How was lending to ${otherName}?`}
      </p>
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={rating === i}
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
            onClick={() => setRating(i)}
          >
            <Star className={cn("size-8 transition", i <= rating ? "fill-outback text-outback" : "text-line")} />
          </button>
        ))}
        <input type="hidden" name="rating" value={rating} />
      </div>
      {state.fieldErrors?.rating && <p className="text-sm text-outback-700">{state.fieldErrors.rating}</p>}
      <input
        name="title"
        placeholder="Sum it up (optional)"
        maxLength={80}
        className="h-11 w-full rounded-xl border border-line bg-surface px-3 focus:border-cosmos focus:outline-none"
      />
      <Textarea name="comment" rows={3} className="min-h-0 rounded-xl" placeholder="What went well? Anything others should know?" />
      {(state.fieldErrors?.comment || state.error) && <p className="text-sm text-outback-700">{state.fieldErrors?.comment ?? state.error}</p>}
      <div className="flex gap-2">
        <Button size="sm" type="submit" disabled={pending}>{pending ? "Posting…" : "Post review"}</Button>
        <Button size="sm" type="button" variant="ghost" onClick={() => setOpen(false)}>Not now</Button>
      </div>
    </form>
  );
}
