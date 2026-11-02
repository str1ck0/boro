import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { ItemGrid } from "@/components/item-card";
import { ReviewList } from "@/components/review-list";
import { Avatar, ButtonLink, HeaderBand } from "@/components/ui";
import { firstName, memberSince } from "@/lib/format";
import { getProfile } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await getProfile((await params).id);
  return p ? { title: p.name } : {};
}

export default async function ProfilePage({ params }: { params: Params }) {
  const { id } = await params;
  const [profile, me] = await Promise.all([getProfile(id), getCurrentUser()]);
  if (!profile) notFound();
  const name = firstName(profile.name);

  return (
    <div className="space-y-10">
      <HeaderBand className="space-y-5">
        <div className="flex items-center justify-between gap-5">
          <div className="min-w-0">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-eureka sm:text-5xl">{profile.name}</h1>
            <p className="mt-1 text-lg">Boro member since {memberSince(profile.createdAt)}</p>
          </div>
          <Avatar src={profile.image} name={profile.name} size={88} className="shrink-0 ring-4 ring-white" />
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-semibold">
          {profile.stats.reviewCount > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Star className="size-5 fill-outback text-outback" />
              {profile.stats.rating?.toFixed(1)} · {profile.stats.reviewCount} review{profile.stats.reviewCount === 1 ? "" : "s"}
            </span>
          )}
          {profile.emailVerified && (
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck className="size-5 text-outback" /> Verified email
            </span>
          )}
          {profile.suburb && (
            <span className="inline-flex items-center gap-1.5 font-medium text-cosmos">
              <MapPin className="size-5 text-outback" /> {profile.suburb}
            </span>
          )}
          {me?.id === profile.id && (
            <ButtonLink href="/account/profile" variant="outline" size="sm" className="ml-auto">
              Edit profile
            </ButtonLink>
          )}
        </div>
      </HeaderBand>

      {profile.bio && (
        <section className="max-w-2xl space-y-2">
          <h2 className="text-xl font-bold">About {name}</h2>
          <p className="whitespace-pre-line text-[17px] leading-relaxed text-ink/85">{profile.bio}</p>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-bold">{name}&apos;s listings</h2>
        {profile.listings.length ? <ItemGrid items={profile.listings} /> : <p className="text-muted">Nothing listed right now.</p>}
      </section>

      <section className="max-w-2xl space-y-4">
        <h2 className="text-xl font-bold">Reviews</h2>
        <ReviewList reviews={profile.reviews} empty={`${name} doesn't have any reviews yet.`} />
      </section>
    </div>
  );
}
