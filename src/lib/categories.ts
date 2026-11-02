export type Tone = "outback" | "cosmos" | "daintree" | "eureka";

export const CATEGORIES = [
  { slug: "camping", label: "Camping & outdoors", icon: "tent", tone: "daintree", image: "/seed/collections/outdoors.jpg" },
  { slug: "water", label: "Water & beach", icon: "kayak", tone: "cosmos", image: "/seed/collections/day-for-it.jpg" },
  { slug: "photography", label: "Photography", icon: "camera", tone: "outback", image: "/seed/collections/photography.jpg" },
  { slug: "tools", label: "Tools & DIY", icon: "chainsaw", tone: "eureka", image: "/seed/items/power-tools.jpg" },
  { slug: "garden", label: "Garden", icon: "lawn-mower", tone: "daintree", image: "/seed/collections/garden.jpg" },
  { slug: "music", label: "Music", icon: "electric-guitar", tone: "outback", image: "/seed/collections/lets-play.jpg" },
  { slug: "party", label: "Party & events", icon: "speaker", tone: "cosmos", image: "/seed/collections/party.jpg" },
  { slug: "sport", label: "Sport & bikes", icon: "bicycle", tone: "eureka", image: "/seed/collections/sport.jpg" },
  { slug: "art", label: "Art & craft", icon: "paint-palette", tone: "outback", image: "/seed/collections/creative.jpg" },
  { slug: "cooking", label: "Cooking & BBQ", icon: "bbq-grill", tone: "eureka" },
  { slug: "other", label: "Everything else", icon: "umbrella", tone: "cosmos" },
] as const satisfies readonly { slug: string; label: string; icon: string; tone: Tone; image?: string }[];

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];
export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as [CategorySlug, ...CategorySlug[]];

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug) ?? CATEGORIES[CATEGORIES.length - 1];
}

/** Curated, editorial entry points into the catalogue (from the v2 Explore screen). */
export const COLLECTIONS = [
  {
    slug: "garden",
    title: "Get in the garden",
    blurb: "All the tools you need, none of the shed space.",
    image: "/seed/collections/garden.jpg",
    categories: ["garden", "tools"],
  },
  {
    slug: "weekend",
    title: "Weekend away",
    blurb: "Tents, kayaks and rods for a few nights off-grid.",
    image: "/seed/collections/outdoors.jpg",
    categories: ["camping", "water"],
  },
  {
    slug: "party",
    title: "Throw a party",
    blurb: "Speakers, lights and a BBQ big enough for everyone.",
    image: "/seed/collections/party.jpg",
    categories: ["party", "cooking"],
  },
  {
    slug: "day-for-it",
    title: "Day for it?",
    blurb: "Beach cricket, boards and everything for a Cape Town summer.",
    image: "/seed/collections/day-for-it.jpg",
    categories: ["water", "sport"],
  },
  {
    slug: "creative",
    title: "Get creative",
    blurb: "Cameras, easels and gear to make something.",
    image: "/seed/collections/creative.jpg",
    categories: ["art", "photography"],
  },
  {
    slug: "play",
    title: "Let's play",
    blurb: "Try an instrument before you commit to one.",
    image: "/seed/collections/lets-play.jpg",
    categories: ["music"],
  },
] as const satisfies readonly {
  slug: string;
  title: string;
  blurb: string;
  image: string;
  categories: readonly CategorySlug[];
}[];

export function getCollection(slug: string) {
  return COLLECTIONS.find((c) => c.slug === slug);
}

export const TONE_CLASSES: Record<Tone, { bg: string; soft: string; text: string }> = {
  outback: { bg: "bg-outback", soft: "bg-outback-50", text: "text-outback-700" },
  cosmos: { bg: "bg-cosmos", soft: "bg-cosmos-50", text: "text-cosmos" },
  daintree: { bg: "bg-daintree", soft: "bg-daintree-50", text: "text-daintree-700" },
  eureka: { bg: "bg-eureka", soft: "bg-eureka-50", text: "text-eureka-700" },
};
