import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, CalendarDays, MapPin, MessageCircle, PartyPopper, ShieldCheck, Star } from "lucide-react";
import { startConversation } from "@/app/actions/messages";
import { BookingForm } from "@/components/booking-form";
import { CategoryIcon } from "@/components/category-icon";
import { FavoriteButton } from "@/components/favorite-button";
import { Gallery } from "@/components/gallery";
import { OwnerControls } from "@/components/owner-controls";
import { ReviewList } from "@/components/review-list";
import { Avatar, Badge, ButtonLink, RatingSummary } from "@/components/ui";
import { getCategory, TONE_CLASSES } from "@/lib/categories";
import { cn } from "@/lib/cn";
import { dateRange, firstName, memberSince, money } from "@/lib/format";
import { getBookedRanges, getFavoriteIds, getItem } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) return {};
  return {
    title: `${item.title} — ${money(item.pricePerDay)}/day in ${item.suburb}`,
    description: item.description.slice(0, 160),
    openGraph: { images: item.photos[0] ? [item.photos[0].url] : [] },
  };
}

export default async function ItemPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<{ listed?: string }>;
}) {
  const { id } = await params;
  const { listed } = await searchParams;
  const [item, user, booked] = await Promise.all([getItem(id), getCurrentUser(), getBookedRanges(id)]);
  if (!item) notFound();

  const isOwner = user?.id === item.ownerId;
  if (item.status === "paused" && !isOwner) notFound();

  const saved = (await getFavoriteIds(user?.id)).has(item.id);
  const cat = getCategory(item.category);
  const tone = TONE_CLASSES[cat.tone];
  const lender = firstName(item.owner.name);

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      {listed && isOwner && (
        <div className="flex items-center gap-3 rounded-card bg-daintree-50 p-4 text-daintree-700">
          <PartyPopper className="size-6 shrink-0" />
          <p className="font-semibold">Your item is live on Boro! We&apos;ll let you know when someone asks to borrow it.</p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
        <div className="min-w-0 space-y-8">
          <Gallery photos={item.photos.map((p) => p.url)} title={item.title} />

          <header className="space-y-3">
            <div className="flex items-center gap-2">
              <Link href={`/explore?category=${cat.slug}`} className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold", tone.soft, tone.text)}>
                <CategoryIcon icon={cat.icon} className="size-4" /> {cat.label}
              </Link>
              {item.status === "paused" && <Badge tone="eureka">Paused</Badge>}
            </div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{item.title}</h1>
              {!isOwner && <FavoriteButton itemId={item.id} saved={saved} variant="plain" className="shrink-0" />}
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px]">
              <RatingSummary avg={item.rating} count={item.reviews.length} />
              <span className="inline-flex items-center gap-1 text-muted">
                <MapPin aria-hidden className="size-4" /> {item.suburb}
              </span>
            </div>
          </header>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">About this item</h2>
            <p className="whitespace-pre-line text-[17px] leading-relaxed text-ink/85">{item.description}</p>
          </section>

          <dl className="grid grid-cols-3 gap-3">
            <Fact label="Per day" value={money(item.pricePerDay)} />
            <Fact label="Bond" value={item.bond ? money(item.bond) : "None"} />
            <Fact label="Min. hire" value={`${item.minDays} day${item.minDays > 1 ? "s" : ""}`} />
          </dl>

          {booked.length > 0 && (
            <section className="space-y-2">
              <h2 className="flex items-center gap-2 font-bold">
                <CalendarDays className="size-5 text-cosmos" /> Already booked
              </h2>
              <div className="flex flex-wrap gap-2">
                {booked.map((b) => (
                  <Badge key={b.startDate} tone="cosmos" className="py-1 text-sm">
                    {dateRange(b.startDate, b.endDate)}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          <section className="flex items-center gap-4 rounded-card bg-surface p-5 shadow-card">
            <Avatar src={item.owner.image} name={item.owner.name} size={56} />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted">Lent by</p>
              <p className="text-lg font-bold">{item.owner.name}</p>
              <p className="flex flex-wrap items-center gap-x-3 text-sm text-muted">
                {item.ownerStats.reviewCount > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Star aria-hidden className="size-3.5 fill-outback text-outback" />
                    {item.ownerStats.rating?.toFixed(1)} · {item.ownerStats.reviewCount} reviews
                  </span>
                )}
                <span>Member since {memberSince(item.owner.createdAt)}</span>
              </p>
            </div>
            <ButtonLink href={`/u/${item.owner.id}`} variant="outline" size="sm">
              Profile
            </ButtonLink>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold">
              Reviews <span className="font-normal text-muted">({item.reviews.length})</span>
            </h2>
            <ReviewList reviews={item.reviews} empty="No reviews yet — be the first to borrow it." />
          </section>
        </div>

        <aside id="book" className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-5 rounded-[1.75rem] bg-surface p-6 shadow-card">
            <p className="text-2xl">
              <span className="font-extrabold">{money(item.pricePerDay)}</span>
              <span className="text-lg text-muted"> / day</span>
            </p>
            {isOwner ? (
              <OwnerControls itemId={item.id} status={item.status} />
            ) : user ? (
              <>
                <BookingForm
                  itemId={item.id}
                  pricePerDay={item.pricePerDay}
                  bond={item.bond}
                  minDays={item.minDays}
                  lenderName={lender}
                  booked={booked}
                />
                <form action={startConversation.bind(null, item.id)}>
                  <button className="flex w-full items-center justify-center gap-2 rounded-full py-2 text-[15px] font-semibold text-cosmos hover:bg-cosmos-50">
                    <MessageCircle className="size-4" /> Ask {lender} a question
                  </button>
                </form>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-muted">Log in to check dates and send {lender} a request — it&apos;s free.</p>
                <ButtonLink href={`/sign-in?next=/items/${item.id}`} size="lg" className="w-full">
                  Log in to borrow
                </ButtonLink>
                <ButtonLink href={`/sign-up?next=/items/${item.id}`} variant="outline" className="w-full">
                  Create an account
                </ButtonLink>
              </div>
            )}
          </div>
          <ul className="mt-4 space-y-2 px-2 text-sm text-muted">
            <li className="flex gap-2"><ShieldCheck className="size-4 shrink-0 text-daintree-700" /> Check the item together at pick-up and return.</li>
            <li className="flex gap-2"><BadgeCheck className="size-4 shrink-0 text-daintree-700" /> Reviews only come from completed borrows.</li>
          </ul>
        </aside>
      </div>

      {!isOwner && (
        <div className="fixed inset-x-0 bottom-[calc(max(env(safe-area-inset-bottom),0.5rem)+3.5rem)] z-20 flex items-center justify-between gap-4 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
          <p>
            <span className="text-lg font-extrabold">{money(item.pricePerDay)}</span>
            <span className="text-muted"> / day</span>
          </p>
          <ButtonLink href="#book">Check dates</ButtonLink>
        </div>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-card">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-lg font-bold">{value}</dd>
    </div>
  );
}
