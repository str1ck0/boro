import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Inbox, Package, PackageOpen, Plus } from "lucide-react";
import { BookingActions } from "@/components/booking-actions";
import { BookingStatusBadge } from "@/components/booking-status";
import { ItemGrid } from "@/components/item-card";
import { Avatar, ButtonLink, EmptyState, PageHeader } from "@/components/ui";
import { cn } from "@/lib/cn";
import { dateRange, firstName, money } from "@/lib/format";
import { listBookings, listItems, type BookingRow } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "My Boro" };

const TABS = [
  { id: "borrowing", label: "Borrowing" },
  { id: "lending", label: "Lending" },
  { id: "listings", label: "My listings" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default async function MyBoroPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requireUser("/my-boro");
  const { tab: tabParam } = await searchParams;

  const [borrowing, lending, listings] = await Promise.all([
    listBookings(user.id, "borrowing"),
    listBookings(user.id, "lending"),
    listItems({ ownerId: user.id, includePaused: true, sort: "newest", limit: 100 }),
  ]);
  const pending = lending.filter((b) => b.status === "requested").length;
  // Land on whatever needs attention.
  const tab: Tab = TABS.some((t) => t.id === tabParam) ? (tabParam as Tab) : pending ? "lending" : "borrowing";

  return (
    <div className="space-y-6">
      <PageHeader
        title={<>Hey {firstName(user.name)}</>}
        subtitle="Everything you're borrowing and lending, in one place."
        tone="eureka"
        action={
          <Link href="/saved" className="hidden items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold hover:border-ink/30 sm:inline-flex">
            <Heart className="size-4" /> Saved
          </Link>
        }
      />

      <nav className="flex gap-1 rounded-full bg-surface p-1 shadow-card sm:w-fit" aria-label="My Boro sections">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/my-boro?tab=${t.id}`}
            aria-current={tab === t.id ? "page" : undefined}
            className={cn(
              "relative flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold transition sm:flex-none sm:px-6",
              tab === t.id ? "bg-ink text-white" : "text-muted hover:text-ink",
            )}
          >
            {t.label}
            {t.id === "lending" && pending > 0 && (
              <span className="ml-1.5 inline-flex size-5 items-center justify-center rounded-full bg-outback-600 text-[11px] text-white">{pending}</span>
            )}
          </Link>
        ))}
      </nav>

      {tab === "borrowing" &&
        (borrowing.length ? (
          <BookingList rows={borrowing} role="borrower" />
        ) : (
          <EmptyState icon={<PackageOpen className="size-10" />} title="Nothing borrowed yet" action={<ButtonLink href="/explore">Explore items <ArrowRight className="size-4" /></ButtonLink>}>
            Find something nearby and send a request — lenders usually reply within a day.
          </EmptyState>
        ))}

      {tab === "lending" &&
        (lending.length ? (
          <BookingList rows={lending} role="lender" />
        ) : (
          <EmptyState icon={<Inbox className="size-10" />} title="No requests yet" action={listings.length ? undefined : <ButtonLink href="/lend"><Plus className="size-4" /> Lend an item</ButtonLink>}>
            {listings.length ? "Requests for your items will show up here." : "List something you own and requests will show up here."}
          </EmptyState>
        ))}

      {tab === "listings" && (
        <div className="space-y-6">
          {listings.length ? (
            <>
              <ButtonLink href="/lend" variant="outline"><Plus className="size-4" /> Add another item</ButtonLink>
              <ItemGrid items={listings} />
            </>
          ) : (
            <EmptyState icon={<Package className="size-10" />} title="You haven't listed anything" action={<ButtonLink href="/lend"><Plus className="size-4" /> Lend an item</ButtonLink>}>
              That drill you&apos;ve used twice? Someone in your suburb needs it this weekend.
            </EmptyState>
          )}
        </div>
      )}
    </div>
  );
}

function BookingList({ rows, role }: { rows: BookingRow[]; role: "lender" | "borrower" }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {rows.map((b) => {
        const done = b.status === "declined" || b.status === "cancelled";
        return (
          <li key={b.id} className={cn("rounded-card bg-surface p-4 shadow-card", done && "opacity-60")}>
            <div className="flex gap-4">
              <Link href={`/items/${b.itemId}`} className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-line">
                {b.itemPhoto && <Image src={b.itemPhoto} alt="" fill sizes="80px" className="object-cover" />}
              </Link>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/items/${b.itemId}`} className="truncate font-bold hover:underline">{b.itemTitle}</Link>
                  <BookingStatusBadge status={b.status} />
                </div>
                <p className="text-[15px]">
                  {dateRange(b.startDate, b.endDate)} · <span className="font-semibold">{money(b.total)}</span>
                </p>
                <p className="flex items-center gap-2 text-sm text-muted">
                  <Avatar src={b.otherImage} name={b.otherName} size={20} />
                  {role === "lender" ? "Borrower" : "Lender"}: {b.otherName}
                </p>
              </div>
            </div>
            {!done && (
              <div className="mt-4 flex flex-wrap items-start justify-between gap-3 border-t border-line pt-4">
                <BookingActions bookingId={b.id} status={b.status} role={role} reviewed={b.reviewed} otherName={firstName(b.otherName)} />
                {b.conversationId && (
                  <Link href={`/messages/${b.conversationId}`} className="text-sm font-semibold text-cosmos hover:underline">
                    Open chat →
                  </Link>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
