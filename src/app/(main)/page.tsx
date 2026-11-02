import Link from "next/link";
import { ArrowRight, Earth, HandCoins, Handshake, Search } from "lucide-react";
import { CategoryTiles } from "@/components/category-chips";
import { CollectionCards } from "@/components/collections";
import { ItemRail } from "@/components/item-card";
import { ButtonLink, SectionHeading } from "@/components/ui";
import { firstName } from "@/lib/format";
import { getFavoriteIds, listItems } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";

export default async function HomePage() {
  const user = await getCurrentUser();
  const [recommended, newest, savedIds] = await Promise.all([
    listItems({ sort: "recommended", limit: 8, excludeOwnerId: user?.id }),
    listItems({ sort: "newest", limit: 4, excludeOwnerId: user?.id }),
    getFavoriteIds(user?.id),
  ]);

  return (
    <div className="space-y-14">
      {user ? (
        <section className="space-y-5">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-outback-600 sm:text-5xl">
              Hello, {firstName(user.name)}
            </h1>
            <p className="mt-1 text-lg text-muted">What do you need this week?</p>
          </div>
          <SearchBar />
        </section>
      ) : (
        <Hero />
      )}

      <section>
        <SectionHeading title="Discover" subtitle="Popular categories" href="/explore" />
        <CategoryTiles />
      </section>

      <section>
        <SectionHeading title="Recommended" subtitle="Well-loved by Boro borrowers" href="/explore" />
        <ItemRail items={recommended} savedIds={savedIds} />
      </section>

      <section>
        <SectionHeading title="Plans for the weekend?" subtitle="Hand-picked collections" />
        <CollectionCards />
      </section>

      <section>
        <SectionHeading title="Just listed" subtitle="Fresh on Boro" href="/explore?sort=newest" />
        <ItemRail items={newest} savedIds={savedIds} />
      </section>

      <LendCta />
    </div>
  );
}

function SearchBar() {
  return (
    <form action="/explore" role="search" className="relative">
      <Search aria-hidden className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted" />
      <input
        name="q"
        type="search"
        placeholder="Kayak, drill, tent, camera…"
        aria-label="Search Boro"
        className="h-14 w-full rounded-full border border-line bg-surface pl-13 pr-32 text-base shadow-card placeholder:text-muted/80 focus:border-cosmos focus:outline-none focus:ring-4 focus:ring-cosmos/10"
      />
      <button className="absolute right-2 top-2 h-10 rounded-full bg-cosmos px-5 font-semibold text-white hover:bg-cosmos-700">
        Search
      </button>
    </form>
  );
}

const PROMISES = [
  {
    icon: Handshake,
    title: "Borrow from neighbours",
    body: "A community of sharing, doing, friendly people.",
    className: "bg-outback text-white",
  },
  {
    icon: Earth,
    title: "For the Earth",
    body: "The world is full of stuff. Share what's there, don't buy new.",
    className: "bg-cosmos text-white",
  },
  {
    icon: HandCoins,
    title: "List it, lend it, spend it",
    body: "Turn dust collectors into a little extra cash.",
    className: "bg-daintree text-ink",
  },
  {
    icon: Search,
    title: "Borrow & bring back",
    body: "Get what you need, just for when you need it.",
    className: "bg-eureka text-ink",
  },
];

function Hero() {
  return (
    <section className="space-y-8 pt-2 sm:pt-6">
      <div className="max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-sm font-semibold text-cosmos shadow-card">
          <span className="size-2 rounded-full bg-daintree" /> Now live in Cape Town
        </p>
        <h1 className="text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-7xl">
          Don&apos;t buy it.
          <br />
          <span className="bg-gradient-to-r from-outback via-cosmos to-daintree bg-clip-text text-transparent">
            Boro it.
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted sm:text-xl">
          Borrow the kayak, the drill, the tent or the camera from someone nearby — and lend out the things
          gathering dust in your shed.
        </p>
      </div>
      <div className="max-w-2xl">
        <SearchBar />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {PROMISES.map((p) => (
          <div key={p.title} className={`rounded-card p-5 ${p.className}`}>
            <p.icon aria-hidden className="size-8" strokeWidth={1.6} />
            <h2 className="mt-6 text-lg font-bold leading-tight">{p.title}</h2>
            <p className="mt-1 text-sm opacity-85">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function LendCta() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-cosmos px-6 py-10 text-white sm:px-12 sm:py-14">
      <div className="absolute -right-16 -top-16 size-64 rounded-full bg-cosmos-700" aria-hidden />
      <div className="absolute -bottom-24 right-24 size-48 rounded-full bg-outback/90" aria-hidden />
      <div className="relative max-w-lg">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Got a shed full of maybes?</h2>
        <p className="mt-3 text-lg text-white/80">
          List the things you only use once a year. You set the price and the bond, and you choose who borrows.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/lend" size="lg">
            Lend an item <ArrowRight className="size-4" />
          </ButtonLink>
          <Link href="/how-it-works" className="inline-flex h-13 items-center px-4 font-semibold text-white/90 hover:text-white">
            How Boro works
          </Link>
        </div>
      </div>
    </section>
  );
}
