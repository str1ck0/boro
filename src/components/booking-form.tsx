"use client";

import { useActionState, useMemo, useState } from "react";
import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { CalendarCheck, Info } from "lucide-react";
import { requestBooking } from "@/app/actions/bookings";
import { Button, Textarea } from "@/components/ui";
import { cn } from "@/lib/cn";
import { dateRange, money } from "@/lib/format";
import type { FormState } from "@/lib/form";

type Props = {
  itemId: string;
  pricePerDay: number;
  bond: number;
  minDays: number;
  lenderName: string;
  booked: { startDate: string; endDate: string }[];
};

const iso = (d: Date) => format(d, "yyyy-MM-dd");

export function BookingForm({ itemId, pricePerDay, bond, minDays, lenderName, booked }: Props) {
  const today = iso(new Date());
  const [start, setStart] = useState(iso(addDays(new Date(), 1)));
  const [end, setEnd] = useState(iso(addDays(new Date(), minDays)));
  const [state, action, pending] = useActionState<FormState, FormData>(requestBooking.bind(null, itemId), {});

  const days = useMemo(() => {
    if (!start || !end) return 0;
    return Math.max(0, differenceInCalendarDays(parseISO(end), parseISO(start)) + 1);
  }, [start, end]);
  const clash = booked.find((b) => b.startDate <= end && b.endDate >= start);
  const tooShort = days > 0 && days < minDays;

  const input =
    "h-12 w-full rounded-xl border border-line bg-surface px-3 text-[15px] focus:border-cosmos focus:outline-none focus:ring-4 focus:ring-cosmos/10";

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Pick up</span>
          <input
            type="date"
            name="startDate"
            required
            min={today}
            value={start}
            onChange={(e) => {
              setStart(e.target.value);
              if (e.target.value > end) setEnd(iso(addDays(parseISO(e.target.value), minDays - 1)));
            }}
            className={input}
            aria-invalid={!!state.fieldErrors?.startDate}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Return</span>
          <input
            type="date"
            name="endDate"
            required
            min={start || today}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className={input}
            aria-invalid={!!state.fieldErrors?.endDate}
          />
        </label>
      </div>

      {(state.fieldErrors?.startDate || state.fieldErrors?.endDate || state.error) && (
        <p className="text-sm font-medium text-outback-700">
          {state.error ?? state.fieldErrors?.startDate ?? state.fieldErrors?.endDate}
        </p>
      )}
      {clash && (
        <p className="text-sm font-medium text-outback-700">
          Already booked {dateRange(clash.startDate, clash.endDate)} — try other dates.
        </p>
      )}
      {tooShort && <p className="text-sm font-medium text-outback-700">Minimum hire is {minDays} days.</p>}

      <Textarea
        name="message"
        rows={3}
        className="min-h-0 rounded-xl"
        placeholder={`Say hi to ${lenderName} — what's it for, and when suits to pick up?`}
        maxLength={1000}
      />

      {days > 0 && (
        <dl className="space-y-2 rounded-2xl bg-canvas p-4 text-[15px]">
          <div className="flex justify-between">
            <dt className="text-muted">{money(pricePerDay)} × {days} day{days > 1 ? "s" : ""}</dt>
            <dd className="font-semibold">{money(pricePerDay * days)}</dd>
          </div>
          {bond > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted">Refundable bond</dt>
              <dd className="font-semibold">{money(bond)}</dd>
            </div>
          )}
        </dl>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending || !!clash || tooShort || days < 1}>
        <CalendarCheck className="size-5" />
        {pending ? "Sending request…" : "Request to borrow"}
      </Button>
      <p className={cn("flex gap-2 text-xs leading-relaxed text-muted")}>
        <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        You won&apos;t be charged. {lenderName} confirms first, then you sort out payment and pick-up together in chat.
      </p>
    </form>
  );
}
