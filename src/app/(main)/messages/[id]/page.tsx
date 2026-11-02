import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ChevronLeft } from "lucide-react";
import { db } from "@/db";
import { conversations as conversationsTable, reviews } from "@/db/schema";
import { AutoRefresh } from "@/components/auto-refresh";
import { BookingActions } from "@/components/booking-actions";
import { BookingStatusBadge } from "@/components/booking-status";
import { ConversationList } from "@/components/conversation-list";
import { MessageComposer, ScrollToEnd } from "@/components/message-composer";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/cn";
import { dateRange, daysBetween, firstName, money } from "@/lib/format";
import { getConversation, listConversations } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { format, isSameDay } from "date-fns";

export const metadata: Metadata = { title: "Chat" };

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/messages/${id}`);
  const [convo, all] = await Promise.all([getConversation(id, user.id), listConversations(user.id)]);
  if (!convo) notFound();

  const role = convo.lenderId === user.id ? "lender" : "borrower";
  const other = role === "lender" ? convo.borrower : convo.lender;

  // Mark read (cheap, idempotent).
  await db
    .update(conversationsTable)
    .set(role === "lender" ? { lenderReadAt: new Date() } : { borrowerReadAt: new Date() })
    .where(eq(conversationsTable.id, convo.id));

  const myReviews = await db
    .select({ bookingId: reviews.bookingId })
    .from(reviews)
    .where(and(eq(reviews.authorId, user.id)));
  const reviewed = new Set(myReviews.map((r) => r.bookingId));

  // Show live bookings, plus the most recent finished one if it still needs a review.
  const visibleBookings = convo.bookings.filter(
    (b) => b.status === "requested" || b.status === "accepted" || (b.status === "completed" && !reviewed.has(b.id)),
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <AutoRefresh />
      <aside className="hidden lg:block">
        <h1 className="mb-3 px-3 text-2xl font-extrabold text-daintree-700">Chats</h1>
        <ConversationList conversations={all} activeId={convo.id} />
      </aside>

      <section className="flex min-h-[calc(100dvh-7rem)] flex-col">
        <header className="sticky top-16 z-10 -mx-4 flex items-center gap-3 border-b border-line bg-canvas/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-b-2xl">
          <Link href="/messages" aria-label="Back to chats" className="-ml-2 flex size-10 items-center justify-center rounded-full hover:bg-ink/5 lg:hidden">
            <ChevronLeft className="size-6" />
          </Link>
          <Link href={`/u/${other.id}`} className="flex min-w-0 flex-1 items-center gap-3">
            <Avatar src={other.image} name={other.name} size={44} />
            <div className="min-w-0">
              <p className="truncate text-lg font-bold">{other.name}</p>
              <p className="truncate text-sm text-muted">
                {role === "lender" ? "Wants to borrow" : "Lending"} · {convo.item.title}
              </p>
            </div>
          </Link>
          <Link href={`/items/${convo.item.id}`} className="shrink-0" aria-label={`View ${convo.item.title}`}>
            {convo.item.photos[0] && (
              <Image src={convo.item.photos[0].url} alt="" width={48} height={48} className="size-12 rounded-xl object-cover" />
            )}
          </Link>
        </header>

        {visibleBookings.map((b) => (
          <div key={b.id} className="mt-4 rounded-card bg-mist p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold">
                {dateRange(b.startDate, b.endDate)}
                <span className="font-normal text-muted"> · {daysBetween(b.startDate, b.endDate)} day{daysBetween(b.startDate, b.endDate) === 1 ? "" : "s"} · {money(b.total)}</span>
              </p>
              <BookingStatusBadge status={b.status} />
            </div>
            <BookingActions bookingId={b.id} status={b.status} role={role} reviewed={reviewed.has(b.id)} otherName={firstName(other.name)} />
          </div>
        ))}

        <ol className="flex-1 space-y-2 py-6">
          {convo.messages.length === 0 && (
            <li className="py-10 text-center text-muted">Say hi to {firstName(other.name)} 👋</li>
          )}
          {convo.messages.map((m, i) => {
            const prev = convo.messages[i - 1];
            const showDay = !prev || !isSameDay(prev.createdAt, m.createdAt);
            const mine = m.senderId === user.id;
            return (
              <li key={m.id}>
                {showDay && (
                  <p className="py-3 text-center text-xs font-semibold text-muted">{format(m.createdAt, "EEEE d MMMM")}</p>
                )}
                {m.kind === "event" ? (
                  <p className="mx-auto my-2 w-fit max-w-[90%] rounded-full bg-cosmos-50 px-4 py-1.5 text-center text-sm font-medium text-cosmos">
                    {m.body}
                  </p>
                ) : (
                  <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
                    <p
                      title={format(m.createdAt, "h:mmaaa")}
                      className={cn(
                        "max-w-[80%] whitespace-pre-line rounded-3xl px-4 py-2.5 text-[15px] leading-snug",
                        mine ? "rounded-br-lg bg-cosmos text-white" : "rounded-bl-lg bg-mist",
                      )}
                    >
                      {m.body}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        <ScrollToEnd count={convo.messages.length} />

        <div className="pb-safe sticky bottom-0 -mx-4 bg-gradient-to-t from-canvas via-canvas to-canvas/0 px-4 pt-4 sm:mx-0 sm:px-0">
          <MessageComposer conversationId={convo.id} />
        </div>
      </section>
    </div>
  );
}
