import "server-only";
import { and, asc, desc, eq, ilike, inArray, lte, ne, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  bookings,
  conversations,
  favorites,
  itemPhotos,
  items,
  messages,
  reviews,
  user,
} from "@/db/schema";

/* ───────────────────────────── Items ───────────────────────────── */

const coverPhoto = sql<string | null>`(
  select ${itemPhotos.url} from ${itemPhotos}
  where ${itemPhotos.itemId} = ${items.id}
  order by ${itemPhotos.position} asc limit 1
)`;

const itemRating = sql<number | null>`(
  select avg(${reviews.rating})::float from ${reviews} where ${reviews.itemId} = ${items.id}
)`;

const itemReviewCount = sql<number>`(
  select count(*)::int from ${reviews} where ${reviews.itemId} = ${items.id}
)`;

export type ItemCardData = {
  id: string;
  title: string;
  pricePerDay: number;
  suburb: string;
  category: string;
  photo: string | null;
  rating: number | null;
  reviewCount: number;
  ownerName: string;
  ownerImage: string | null;
};

export type ItemSort = "recommended" | "newest" | "price-asc" | "price-desc";

export async function listItems(opts: {
  q?: string;
  categories?: string[];
  suburb?: string;
  maxPrice?: number;
  sort?: ItemSort;
  ownerId?: string;
  excludeOwnerId?: string;
  includePaused?: boolean;
  ids?: string[];
  limit?: number;
  offset?: number;
}): Promise<ItemCardData[]> {
  const where: SQL[] = [];
  if (!opts.includePaused) where.push(eq(items.status, "active"));
  if (opts.categories?.length) where.push(inArray(items.category, opts.categories));
  if (opts.suburb) where.push(ilike(items.suburb, opts.suburb));
  if (opts.maxPrice != null) where.push(lte(items.pricePerDay, opts.maxPrice));
  if (opts.ownerId) where.push(eq(items.ownerId, opts.ownerId));
  if (opts.excludeOwnerId) where.push(ne(items.ownerId, opts.excludeOwnerId));
  if (opts.ids) {
    if (!opts.ids.length) return [];
    where.push(inArray(items.id, opts.ids));
  }

  const q = opts.q?.trim();
  let rank: SQL | undefined;
  if (q) {
    const tsv = sql`to_tsvector('english', ${items.title} || ' ' || ${items.description})`;
    const tsq = sql`websearch_to_tsquery('english', ${q})`;
    where.push(or(sql`${tsv} @@ ${tsq}`, ilike(items.title, `%${q}%`), ilike(items.category, `%${q}%`))!);
    rank = sql`ts_rank(${tsv}, ${tsq})`;
  }

  const order = {
    newest: [desc(items.createdAt)],
    "price-asc": [asc(items.pricePerDay)],
    "price-desc": [desc(items.pricePerDay)],
    // Relevance when searching, otherwise a blend of rating and freshness.
    recommended: rank
      ? [desc(rank), desc(items.createdAt)]
      : [desc(sql`coalesce(${itemRating}, 4) * ln(${itemReviewCount} + 2)`), desc(items.createdAt)],
  }[opts.sort ?? "recommended"];

  return db
    .select({
      id: items.id,
      title: items.title,
      pricePerDay: items.pricePerDay,
      suburb: items.suburb,
      category: items.category,
      photo: coverPhoto,
      rating: itemRating,
      reviewCount: itemReviewCount,
      ownerName: user.name,
      ownerImage: user.image,
    })
    .from(items)
    .innerJoin(user, eq(user.id, items.ownerId))
    .where(and(...where))
    .orderBy(...order)
    .limit(opts.limit ?? 48)
    .offset(opts.offset ?? 0);
}

export async function getItem(id: string) {
  const item = await db.query.items.findFirst({
    where: eq(items.id, id),
    with: {
      photos: { orderBy: asc(itemPhotos.position) },
      owner: { columns: { id: true, name: true, image: true, suburb: true, createdAt: true, bio: true } },
    },
  });
  if (!item) return null;

  const [itemReviews, ownerStats] = await Promise.all([
    db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        title: reviews.title,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        authorId: user.id,
        authorName: user.name,
        authorImage: user.image,
      })
      .from(reviews)
      .innerJoin(user, eq(user.id, reviews.authorId))
      .where(eq(reviews.itemId, id))
      .orderBy(desc(reviews.createdAt)),
    getUserStats(item.ownerId),
  ]);

  const rating = itemReviews.length
    ? itemReviews.reduce((s, r) => s + r.rating, 0) / itemReviews.length
    : null;

  return { ...item, reviews: itemReviews, rating, ownerStats };
}

/** Dates already promised to someone, so the booking form can block them. */
export async function getBookedRanges(itemId: string) {
  return db
    .select({ startDate: bookings.startDate, endDate: bookings.endDate })
    .from(bookings)
    .where(
      and(
        eq(bookings.itemId, itemId),
        eq(bookings.status, "accepted"),
        sql`${bookings.endDate} >= current_date`,
      ),
    )
    .orderBy(asc(bookings.startDate));
}

/* ───────────────────────────── Users ───────────────────────────── */

export async function getUserStats(userId: string) {
  const [row] = await db
    .select({
      rating: sql<number | null>`avg(${reviews.rating})::float`,
      count: sql<number>`count(*)::int`,
    })
    .from(reviews)
    .where(eq(reviews.subjectId, userId));
  const [lends] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookings)
    .innerJoin(items, eq(items.id, bookings.itemId))
    .where(and(eq(items.ownerId, userId), eq(bookings.status, "completed")));
  return { rating: row?.rating ?? null, reviewCount: row?.count ?? 0, completedLends: lends?.count ?? 0 };
}

export async function getProfile(userId: string) {
  const profile = await db.query.user.findFirst({
    where: eq(user.id, userId),
    columns: { id: true, name: true, image: true, bio: true, suburb: true, createdAt: true, emailVerified: true },
  });
  if (!profile) return null;
  const [stats, listings, userReviews] = await Promise.all([
    getUserStats(userId),
    listItems({ ownerId: userId, limit: 24 }),
    db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        title: reviews.title,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        authorId: user.id,
        authorName: user.name,
        authorImage: user.image,
      })
      .from(reviews)
      .innerJoin(user, eq(user.id, reviews.authorId))
      .where(eq(reviews.subjectId, userId))
      .orderBy(desc(reviews.createdAt))
      .limit(20),
  ]);
  return { ...profile, stats, listings, reviews: userReviews };
}

/* ─────────────────────────── Favourites ─────────────────────────── */

export async function getFavoriteIds(userId: string | undefined) {
  if (!userId) return new Set<string>();
  const rows = await db
    .select({ itemId: favorites.itemId })
    .from(favorites)
    .where(eq(favorites.userId, userId));
  return new Set(rows.map((r) => r.itemId));
}

export async function listFavorites(userId: string) {
  const rows = await db
    .select({ itemId: favorites.itemId })
    .from(favorites)
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt));
  const ids = rows.map((r) => r.itemId);
  const list = await listItems({ ids, includePaused: true });
  return ids.map((id) => list.find((i) => i.id === id)).filter((i) => i != null);
}

/* ──────────────────────────── Bookings ──────────────────────────── */

const bookingSelect = {
  id: bookings.id,
  startDate: bookings.startDate,
  endDate: bookings.endDate,
  total: bookings.total,
  status: bookings.status,
  createdAt: bookings.createdAt,
  itemId: items.id,
  itemTitle: items.title,
  itemPhoto: coverPhoto,
  bond: items.bond,
  lenderId: items.ownerId,
  borrowerId: bookings.borrowerId,
};

export type BookingRow = Awaited<ReturnType<typeof listBookings>>[number];

export async function listBookings(userId: string, role: "borrowing" | "lending") {
  const other = role === "borrowing" ? eq(user.id, items.ownerId) : eq(user.id, bookings.borrowerId);
  const rows = await db
    .select({
      ...bookingSelect,
      otherId: user.id,
      otherName: user.name,
      otherImage: user.image,
      reviewed: sql<boolean>`exists (
        select 1 from ${reviews} where ${reviews.bookingId} = ${bookings.id} and ${reviews.authorId} = ${userId}
      )`,
      conversationId: conversations.id,
    })
    .from(bookings)
    .innerJoin(items, eq(items.id, bookings.itemId))
    .innerJoin(user, other)
    .leftJoin(
      conversations,
      and(eq(conversations.itemId, bookings.itemId), eq(conversations.borrowerId, bookings.borrowerId)),
    )
    .where(role === "borrowing" ? eq(bookings.borrowerId, userId) : eq(items.ownerId, userId))
    .orderBy(
      sql`case ${bookings.status} when 'requested' then 0 when 'accepted' then 1 when 'completed' then 2 else 3 end`,
      asc(bookings.startDate),
    );
  return rows;
}

export async function getBooking(id: string) {
  const [row] = await db
    .select({ ...bookingSelect, itemPrice: items.pricePerDay })
    .from(bookings)
    .innerJoin(items, eq(items.id, bookings.itemId))
    .where(eq(bookings.id, id));
  return row ?? null;
}

export async function countPendingRequests(userId: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookings)
    .innerJoin(items, eq(items.id, bookings.itemId))
    .where(and(eq(items.ownerId, userId), eq(bookings.status, "requested")));
  return row?.count ?? 0;
}

/* ────────────────────────── Conversations ────────────────────────── */

export async function listConversations(userId: string) {
  const lastMessage = sql<string | null>`(
    select ${messages.body} from ${messages}
    where ${messages.conversationId} = ${conversations.id}
    order by ${messages.createdAt} desc limit 1
  )`;
  const rows = await db
    .select({
      id: conversations.id,
      lastMessageAt: conversations.lastMessageAt,
      borrowerId: conversations.borrowerId,
      lenderId: conversations.lenderId,
      borrowerReadAt: conversations.borrowerReadAt,
      lenderReadAt: conversations.lenderReadAt,
      itemId: items.id,
      itemTitle: items.title,
      itemPhoto: coverPhoto,
      otherName: user.name,
      otherImage: user.image,
      lastMessage,
    })
    .from(conversations)
    .innerJoin(items, eq(items.id, conversations.itemId))
    .innerJoin(
      user,
      sql`${user.id} = case when ${conversations.borrowerId} = ${userId} then ${conversations.lenderId} else ${conversations.borrowerId} end`,
    )
    .where(or(eq(conversations.borrowerId, userId), eq(conversations.lenderId, userId)))
    .orderBy(desc(conversations.lastMessageAt));

  return rows.map((r) => {
    const readAt = r.borrowerId === userId ? r.borrowerReadAt : r.lenderReadAt;
    return { ...r, unread: !readAt || readAt < r.lastMessageAt };
  });
}

export async function countUnreadConversations(userId: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(conversations)
    .where(
      or(
        and(
          eq(conversations.borrowerId, userId),
          sql`(${conversations.borrowerReadAt} is null or ${conversations.borrowerReadAt} < ${conversations.lastMessageAt})`,
        ),
        and(
          eq(conversations.lenderId, userId),
          sql`(${conversations.lenderReadAt} is null or ${conversations.lenderReadAt} < ${conversations.lastMessageAt})`,
        ),
      ),
    );
  return row?.count ?? 0;
}

export async function getConversation(id: string, userId: string) {
  const convo = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.id, id),
      or(eq(conversations.borrowerId, userId), eq(conversations.lenderId, userId)),
    ),
    with: {
      item: { with: { photos: { orderBy: asc(itemPhotos.position), limit: 1 } } },
      borrower: { columns: { id: true, name: true, image: true } },
      lender: { columns: { id: true, name: true, image: true } },
    },
  });
  if (!convo) return null;

  const [thread, convoBookings] = await Promise.all([
    db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(asc(messages.createdAt)),
    db
      .select()
      .from(bookings)
      .where(and(eq(bookings.itemId, convo.itemId), eq(bookings.borrowerId, convo.borrowerId)))
      .orderBy(desc(bookings.createdAt)),
  ]);

  return { ...convo, messages: thread, bookings: convoBookings };
}
