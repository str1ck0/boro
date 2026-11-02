"use server";

import { and, eq, gte, lte, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { bookings, items, reviews } from "@/db/schema";
import { ensureConversation, postMessage } from "@/lib/chat";
import { dateRange, daysBetween, firstName, money, todayISO } from "@/lib/format";
import { fieldErrors, type FormState } from "@/lib/form";
import { requireUser } from "@/lib/session";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date");

const requestSchema = z
  .object({
    startDate: isoDate,
    endDate: isoDate,
    message: z.string().trim().max(1000).optional(),
  })
  .refine((v) => v.endDate >= v.startDate, { message: "Return date must be after pick-up", path: ["endDate"] })
  .refine((v) => v.startDate >= todayISO(), { message: "Pick-up can't be in the past", path: ["startDate"] });

function overlapsAccepted(itemId: string, start: string, end: string, excludeId?: string) {
  return db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.itemId, itemId),
        eq(bookings.status, "accepted"),
        lte(bookings.startDate, end),
        gte(bookings.endDate, start),
        excludeId ? ne(bookings.id, excludeId) : undefined,
      ),
    )
    .limit(1);
}

export async function requestBooking(itemId: string, _: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser(`/items/${itemId}`);
  const parsed = requestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  const { startDate, endDate, message } = parsed.data;

  const item = await db.query.items.findFirst({ where: eq(items.id, itemId) });
  if (!item || item.status !== "active") return { error: "This item isn't available right now." };
  if (item.ownerId === user.id) return { error: "That's your own item!" };

  const days = daysBetween(startDate, endDate);
  if (days < item.minDays) {
    return { fieldErrors: { endDate: `Minimum hire is ${item.minDays} days` } };
  }
  if ((await overlapsAccepted(itemId, startDate, endDate)).length) {
    return { fieldErrors: { startDate: "Already booked for some of those dates" } };
  }

  const total = days * item.pricePerDay;
  const conversationId = await db.transaction(async (tx) => {
    await tx.insert(bookings).values({ itemId, borrowerId: user.id, startDate, endDate, total });
    const convo = await ensureConversation(tx, itemId, user.id);
    await postMessage(
      tx,
      convo,
      null,
      `${firstName(user.name)} requested ${dateRange(startDate, endDate)} · ${days} day${days > 1 ? "s" : ""} · ${money(total)}`,
      "event",
    );
    if (message) await postMessage(tx, convo, user.id, message);
    return convo;
  });

  revalidatePath("/", "layout");
  redirect(`/messages/${conversationId}`);
}

type Transition = "accept" | "decline" | "cancel" | "complete";

/** Lender: accept / decline / complete. Borrower: cancel. Lender may also cancel an accepted booking. */
export async function updateBooking(bookingId: string, action: Transition) {
  const user = await requireUser();
  const [b] = await db
    .select({
      id: bookings.id,
      status: bookings.status,
      itemId: bookings.itemId,
      borrowerId: bookings.borrowerId,
      startDate: bookings.startDate,
      endDate: bookings.endDate,
      ownerId: items.ownerId,
    })
    .from(bookings)
    .innerJoin(items, eq(items.id, bookings.itemId))
    .where(eq(bookings.id, bookingId));
  if (!b) return { error: "Booking not found" };

  const isLender = b.ownerId === user.id;
  const isBorrower = b.borrowerId === user.id;

  const rules: Record<Transition, { allowed: boolean; from: string[]; to: typeof b.status; verb: string }> = {
    accept: { allowed: isLender, from: ["requested"], to: "accepted", verb: "accepted the request" },
    decline: { allowed: isLender, from: ["requested"], to: "declined", verb: "declined the request" },
    cancel: { allowed: isLender || isBorrower, from: ["requested", "accepted"], to: "cancelled", verb: "cancelled the booking" },
    complete: { allowed: isLender, from: ["accepted"], to: "completed", verb: "marked the item as returned" },
  };
  const rule = rules[action];
  if (!rule.allowed || !rule.from.includes(b.status)) return { error: "That action isn't available." };

  if (action === "accept" && (await overlapsAccepted(b.itemId, b.startDate, b.endDate, b.id)).length) {
    return { error: "You've already accepted another booking for those dates." };
  }

  await db.transaction(async (tx) => {
    // Optimistic concurrency: only move from the status we read.
    const res = await tx
      .update(bookings)
      .set({ status: rule.to })
      .where(and(eq(bookings.id, b.id), sql`${bookings.status} = ${b.status}`))
      .returning({ id: bookings.id });
    if (!res.length) return;
    const convo = await ensureConversation(tx, b.itemId, b.borrowerId);
    const extra =
      action === "complete" ? " — time to leave each other a review!" : action === "accept" ? " 🎉" : "";
    await postMessage(tx, convo, null, `${firstName(user.name)} ${rule.verb}${extra}`, "event");
  });

  revalidatePath("/", "layout");
  return { ok: true };
}

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Pick a star rating").max(5),
  title: z.string().trim().max(80).optional(),
  comment: z.string().trim().min(10, "Tell people a bit more (10+ characters)").max(1000),
});

export async function leaveReview(bookingId: string, _: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const [b] = await db
    .select({ status: bookings.status, borrowerId: bookings.borrowerId, itemId: bookings.itemId, ownerId: items.ownerId })
    .from(bookings)
    .innerJoin(items, eq(items.id, bookings.itemId))
    .where(eq(bookings.id, bookingId));
  if (!b || b.status !== "completed") return { error: "You can review once the item has been returned." };

  const isBorrower = b.borrowerId === user.id;
  if (!isBorrower && b.ownerId !== user.id) return { error: "Not your booking." };

  await db
    .insert(reviews)
    .values({
      bookingId,
      authorId: user.id,
      subjectId: isBorrower ? b.ownerId : b.borrowerId,
      // Borrower reviews count towards the item and the lender; lender reviews towards the borrower.
      itemId: isBorrower ? b.itemId : null,
      ...parsed.data,
      title: parsed.data.title || null,
    })
    .onConflictDoNothing();

  revalidatePath("/", "layout");
  return { ok: true };
}
