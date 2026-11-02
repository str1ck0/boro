import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { ItemGrid } from "@/components/item-card";
import { ReviewList } from "@/components/review-list";
import { Avatar, ButtonLink } from "@/components/ui";
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
      <header className="flex flex-col gap-6 rounded-[2rem] bg-mist p-6 sm:flex-row sm:items-center sm:p-8">
        <Avatar src={profile.image} name={profile.name} size={112} className="ring-4 ring-eureka" />
        <div className="flex-1 space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-eureka-700 sm:text-4xl">{profile.name}</h1>
          <p className="text-muted">Boro member since {memberSince(profile.createdAt)}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1 text-sm font-semibold">
            {profile.stats.reviewCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <Star className="size-4 fill-outback text-outback" />
                {profile.stats.rating?.toFixed(1)} · {profile.stats.reviewCount} review{profile.stats.reviewCount === 1 ? "" : "s"}
              </span>
            )}
            {profile.emailVerified && (
              <span className="inline-flex items-center gap-1"><BadgeCheck className="size-4 text-daintree-700" /> Verified email</span>
            )}
            {profile.suburb && (
              <span className="inline-flex items-center gap-1 text-cosmos"><MapPin className="size-4" /> {profile.suburb}</span>
            )}
          </div>
        </div>
        {me?.id === profile.id && <ButtonLink href="/account" variant="outline">Edit profile</ButtonLink>}
      </header>

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
