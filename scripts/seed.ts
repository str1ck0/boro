/**
 * Seeds a believable Perth Boro: members, listings, past borrows with reviews,
 * and a few live conversations for the demo account.
 *
 *   pnpm db:seed            # adds demo data (refuses if items already exist)
 *   pnpm db:seed --reset    # wipes ALL app data first
 *
 * Demo login: tom@demo.boro.app / borrow-it-boro-it
 */
import { addDays, format, subDays } from "date-fns";
import { hashPassword } from "better-auth/crypto";
import { sql } from "drizzle-orm";
import { db } from "../src/db";
import * as s from "../src/db/schema";

const DEMO_PASSWORD = "borrow-it-boro-it";
const d = (offset: number) => format(addDays(new Date(), offset), "yyyy-MM-dd");

const PEOPLE = {
  tom: { name: "Tom McAuliffe", suburb: "Leederville", bio: "I love going camping and have a bunch of quality gear that unfortunately doesn't get used enough, so I'm happy to lend it out. Always on the lookout to try new cameras and lenses, so maybe we can trade!" },
  jessica: { name: "Jessica Hayes", suburb: "Cottesloe", bio: "Ocean person. Weekends are for paddling, snorkelling and long lunches." },
  james: { name: "James Wilson", suburb: "Bayswater", bio: "Weekend gardener, weekday accountant." },
  lachie: { name: "Lachie Robinson", suburb: "Mount Lawley", bio: "Photographer and surfer. Happy to give tips on the camera when you pick it up." },
  sam: { name: "Sam Anderson", suburb: "Victoria Park", bio: "Renovating a 1950s house one weekend at a time." },
  mark: { name: "Mark Pearson", suburb: "Kelmscott", bio: "Retired sparky with a shed full of tools that deserve more use." },
  grace: { name: "Grace Walker", suburb: "Hillarys", bio: "Down at the marina most mornings." },
  tyson: { name: "Tyson Mathews", suburb: "Northbridge", bio: "DJ and events guy. I've got the gear for your next party." },
  ally: { name: "Ally Newman", suburb: "Fremantle", bio: "Musician, host, collector of too many chairs." },
  jenny: { name: "Jenny Chen", suburb: "Subiaco", bio: "Plein air painter. Art should be for everyone." },
  matty: { name: "Matty Cohen", suburb: "Scarborough", bio: "Beach every day it's over 25." },
  sarah: { name: "Sarah Nguyen", suburb: "South Perth", bio: "Snow trip every July, the rest of the year my board sits in the cupboard." },
  jacob: { name: "Jacob Morrison", suburb: "Midland", bio: "Carpenter. Look after the blades and we'll get along great." },
} as const;
type Person = keyof typeof PEOPLE;

type SeedItem = {
  key: string;
  owner: Person;
  title: string;
  category: string;
  price: number;
  bond: number;
  minDays?: number;
  photo: string;
  description: string;
  reviews?: [Person, number, string, string][];
};

const ITEMS: SeedItem[] = [
  {
    key: "kayaks", owner: "jessica", title: "Sit-on-top kayaks (up to 6)", category: "water", price: 25, bond: 100, photo: "kayaks",
    description: "I have a bunch of kayaks available to lend. Perfect for a family weekend away! They're all different sizes, so feel free to come take a look and see which ones you need. Paddles and life jackets included.\n\nHappy to negotiate on the price if you take a few :)",
    reviews: [
      ["grace", 5, "Heaps of fun!", "Borrowed these for a weekend down south. Great quality, Jess even helped us strap them to the roof."],
      ["sam", 5, "Good exercise", "Great to get out on the river, thanks Jess! Will be borrowing again."],
      ["matty", 4, "Will be borrowing again", "Nice kayaks, the paddles aren't the best though. You'll need a roof rack."],
      ["jenny", 4, "Good kayaks!", "These are pretty big and a bit heavy but go great on the water."],
    ],
  },
  {
    key: "camping", owner: "tom", title: "Complete camping kit — tent, chairs & stove", category: "camping", price: 30, bond: 100, minDays: 2, photo: "camping-kit",
    description: "Everything for two people to head bush for the weekend: 4-person dome tent, two folding chairs, Trangia stove, head torches, cookware and a 40L cooler.\n\nAll clean and checked after every trip. I'll show you how the tent goes up at pick-up.",
    reviews: [
      ["james", 5, "Thanks Tom!", "Meeting up was easy and Tom replied super quick! I'll be back for the Margaret River trip."],
      ["jacob", 5, "Nice to meet you", "I needed some extra camping gear last minute, Tom was a legend."],
    ],
  },
  {
    key: "canon", owner: "lachie", title: "Canon EOS 80D + 18–135mm lens", category: "photography", price: 45, bond: 300, photo: "canon-80d",
    description: "Great all-rounder DSLR. Comes with the 18–135mm kit lens, two batteries, charger, 64GB SD card and a padded bag. Ideal for a holiday, a wedding or just trying photography before you buy.",
    reviews: [["ally", 5, "Perfect for our trip", "Lachie gave me a 10-minute crash course which made all the difference. Photos came out amazing."]],
  },
  {
    key: "mower", owner: "james", title: "Push reel lawn mower", category: "garden", price: 10, bond: 0, photo: "lawn-mower",
    description: "Quiet, no petrol, no cord. Perfect for small to medium lawns — it gives a really clean cut. Freshly sharpened.",
    reviews: [["tom", 4, "Does the job", "Easy to use and James had it ready when I got there. Great for a small backyard."]],
  },
  {
    key: "tools", owner: "sam", title: "Cordless power tool kit (drill, driver, grinder)", category: "tools", price: 20, bond: 100, photo: "power-tools",
    description: "18V kit with hammer drill, impact driver, angle grinder, 3 batteries and a fast charger. Plus a full bit set. Everything you need for flat-pack, shelving or a small reno.",
    reviews: [["tom", 5, "Saved me $400", "Was about to buy a set for one job. Sam's kit was spotless and fully charged."]],
  },
  {
    key: "chainsaw", owner: "mark", title: "Bosch electric chainsaw", category: "tools", price: 25, bond: 150, photo: "chainsaw",
    description: "35cm bar, corded electric so no fuel mixing. Chain freshly sharpened. Safety chaps, gloves and eye protection included — please use them!",
  },
  {
    key: "rods", owner: "grace", title: "Fishing rods ×4 with tackle box", category: "water", price: 15, bond: 50, photo: "fishing-rods",
    description: "Four rods (two surf, two jetty), reels spooled with fresh line, and a tackle box with sinkers, hooks and lures. Great for a family day at the jetty.",
    reviews: [["matty", 5, "Caught dinner", "Took the kids to Hillarys jetty, everyone caught something. Grace's tips were gold."]],
  },
  {
    key: "pa", owner: "tyson", title: "PA speaker stack for parties", category: "party", price: 80, bond: 400, photo: "pa-speakers",
    description: "Two powered tops, a sub and a 4-channel mixer. Will fill a backyard or small hall. Bluetooth input so you can play straight from your phone. I can help with set-up for a small fee.",
    reviews: [["sarah", 5, "Party was a hit", "Easy to set up and LOUD. Tyson was super helpful."]],
  },
  {
    key: "guitar", owner: "ally", title: "Acoustic guitar — Yamaha FG800", category: "music", price: 12, bond: 100, minDays: 3, photo: "acoustic-guitar",
    description: "Lovely sounding solid-top acoustic, perfect for learning. Comes with a gig bag, tuner, capo and spare strings. Try it for a few weeks before you commit to buying one.",
  },
  {
    key: "easel", owner: "jenny", title: "Field easel + starter acrylics", category: "art", price: 8, bond: 0, photo: "easel",
    description: "Portable French box easel with a set of student acrylics, brushes and two canvases. Head to Kings Park and paint something!",
  },
  {
    key: "cricket", owner: "matty", title: "Beach cricket set", category: "sport", price: 5, bond: 0, photo: "beach-cricket",
    description: "Bat, two tennis balls, a stump set that actually stays up in the sand, and a bucket for the boundary. Classic Aussie summer.",
    reviews: [["jessica", 5, "Day for it", "Made our Cottesloe Sunday. Stumps are great."]],
  },
  {
    key: "snowboard", owner: "sarah", title: "Snowboard + bindings (155cm)", category: "sport", price: 35, bond: 150, minDays: 3, photo: "snowboard",
    description: "All-mountain board, waxed and edges done before each trip. Bindings fit boot sizes 8–11. Way cheaper than hiring at the mountain.",
  },
  {
    key: "lights", owner: "tyson", title: "Stage lighting kit — 4 LED pars + controller", category: "party", price: 40, bond: 200, photo: "stage-lighting",
    description: "Four RGB LED pars on two stands with a simple DMX controller. Music-reactive mode makes any room feel like a club.",
  },
  {
    key: "saw", owner: "jacob", title: "254mm compound mitre saw", category: "tools", price: 30, bond: 150, photo: "mitre-saw",
    description: "Sliding compound mitre saw with a sharp 60-tooth blade. Great for skirting, decking and framing. I'll run you through it at pick-up.",
  },
  {
    key: "dining", owner: "ally", title: "Dining table + 6 chairs for events", category: "party", price: 50, bond: 100, photo: "dining-set",
    description: "Seats six comfortably. Perfect for a long lunch or an extra table at Christmas. You'll need a ute or van — I can help load.",
  },
];

async function main() {
  const reset = process.argv.includes("--reset");
  if (reset) {
    console.log("Resetting app data…");
    await db.execute(sql`truncate table reviews, messages, conversations, bookings, favorites, item_photos, items, session, account, verification, "user" cascade`);
  } else {
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(s.items);
    if (count > 0) {
      console.log("Items already exist — run with --reset to start fresh. Skipping.");
      process.exit(0);
    }
  }

  const password = await hashPassword(DEMO_PASSWORD);
  const users = {} as Record<Person, string>;
  const longAgo = subDays(new Date(), 400);

  for (const [key, p] of Object.entries(PEOPLE) as [Person, (typeof PEOPLE)[Person]][]) {
    const id = crypto.randomUUID();
    users[key] = id;
    const email = `${key}@demo.boro.app`;
    await db.insert(s.user).values({
      id, name: p.name, email, emailVerified: true, image: `/seed/people/${key}.jpg`,
      bio: p.bio, suburb: p.suburb, createdAt: subDays(longAgo, Math.floor(Math.random() * 200)),
    });
    await db.insert(s.account).values({ id: crypto.randomUUID(), accountId: id, providerId: "credential", userId: id, password });
  }

  const itemIds = {} as Record<string, string>;
  for (const [i, it] of ITEMS.entries()) {
    const [row] = await db
      .insert(s.items)
      .values({
        ownerId: users[it.owner], title: it.title, description: it.description, category: it.category,
        pricePerDay: it.price * 100, bond: it.bond * 100, minDays: it.minDays ?? 1, suburb: PEOPLE[it.owner].suburb,
        createdAt: subDays(new Date(), 60 - i * 3),
      })
      .returning({ id: s.items.id });
    itemIds[it.key] = row.id;
    await db.insert(s.itemPhotos).values({ itemId: row.id, url: `/seed/items/${it.photo}.jpg`, position: 0 });

    // Past, completed borrows → reviews (borrower reviews item + lender).
    for (const [j, [who, rating, title, comment]] of (it.reviews ?? []).entries()) {
      const start = -(30 + j * 25 + i);
      const [b] = await db
        .insert(s.bookings)
        .values({ itemId: row.id, borrowerId: users[who], startDate: d(start), endDate: d(start + 2), total: it.price * 300, status: "completed" })
        .returning({ id: s.bookings.id });
      await db.insert(s.reviews).values({
        bookingId: b.id, authorId: users[who], subjectId: users[it.owner], itemId: row.id,
        rating, title, comment, createdAt: subDays(new Date(), -start - 3),
      });
      // …and the lender reviews the borrower.
      await db.insert(s.reviews).values({
        bookingId: b.id, authorId: users[it.owner], subjectId: users[who], rating: 5,
        comment: `${PEOPLE[who].name.split(" ")[0]} looked after it and brought it back on time. Welcome back any time!`,
        createdAt: subDays(new Date(), -start - 3),
      });
    }
  }

  // A future accepted booking so the calendar shows blocked dates.
  await db.insert(s.bookings).values({ itemId: itemIds.kayaks, borrowerId: users.tyson, startDate: d(9), endDate: d(11), total: 7500, status: "accepted" });

  // Live conversations for the demo account (Tom).
  const now = Date.now();
  const convo = async (
    itemKey: string, borrower: Person, lender: Person,
    lines: [Person | null, string, number][], booking?: { start: number; end: number; status: "requested" | "accepted" },
  ) => {
    const item = ITEMS.find((x) => x.key === itemKey)!;
    if (booking) {
      await db.insert(s.bookings).values({
        itemId: itemIds[itemKey], borrowerId: users[borrower], startDate: d(booking.start), endDate: d(booking.end),
        total: item.price * 100 * (booking.end - booking.start + 1), status: booking.status,
      });
    }
    const last = new Date(now - lines[lines.length - 1][2] * 60_000);
    const [c] = await db
      .insert(s.conversations)
      .values({ itemId: itemIds[itemKey], borrowerId: users[borrower], lenderId: users[lender], lastMessageAt: last, ...(lines[lines.length - 1][0] === "tom" ? (borrower === "tom" ? { borrowerReadAt: last } : { lenderReadAt: last }) : {}) })
      .returning({ id: s.conversations.id });
    for (const [who, body, minsAgo] of lines) {
      await db.insert(s.messages).values({
        conversationId: c.id, senderId: who ? users[who] : null, body, kind: who ? "text" : "event",
        createdAt: new Date(now - minsAgo * 60_000),
      });
    }
  };

  await convo("camping", "james", "tom", [
    [null, `James requested ${format(addDays(new Date(), 5), "d")}–${format(addDays(new Date(), 7), "d MMM")} · 3 days · $90`, 180],
    ["james", "Hi Tom, is your camping kit available that weekend? Heading to Lane Poole with my partner.", 179],
  ], { start: 5, end: 7, status: "requested" });

  await convo("mower", "tom", "james", [
    ["tom", "Hi James! Is the mower free this Saturday?", 60 * 26],
    ["james", "Hi! Yes it's available, would you like to come take a look?", 60 * 25],
    ["tom", "I read the reviews, sounds like it works great — can I come by Saturday morning?", 60 * 24],
    ["james", "Sure, does 9am work for you?", 60 * 23],
  ]);

  await convo("canon", "tom", "lachie", [
    [null, `Tom requested ${format(addDays(new Date(), 14), "d")}–${format(addDays(new Date(), 16), "d MMM")} · 3 days · $135`, 60 * 50],
    ["tom", "Keen to try the 80D for my trip to Esperance!", 60 * 50],
    [null, "Lachie accepted the request 🎉", 60 * 30],
    ["lachie", "All yours! I'm at 16 Maple St, just send me a message when you're here :)", 60 * 30],
  ], { start: 14, end: 16, status: "accepted" });

  // A few saved items for Tom.
  await db.insert(s.favorites).values([itemIds.kayaks, itemIds.pa, itemIds.snowboard].map((itemId) => ({ userId: users.tom, itemId })));

  console.log(`Seeded ${Object.keys(PEOPLE).length} members and ${ITEMS.length} items.`);
  console.log(`Demo login: tom@demo.boro.app / ${DEMO_PASSWORD}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
