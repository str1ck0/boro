import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/* ───────────────────────── Auth (Better Auth) ───────────────────────── */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  bio: text("bio"),
  suburb: text("suburb"),
  ...timestamps,
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [index("session_user_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    ...timestamps,
  },
  (t) => [index("account_user_idx").on(t.userId)],
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ...timestamps,
});

/* ───────────────────────────── Marketplace ──────────────────────────── */

export const itemStatus = pgEnum("item_status", ["active", "paused"]);

export const items = pgTable(
  "items",
  {
    id: id(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    /** Price per day, in cents (AUD). */
    pricePerDay: integer("price_per_day").notNull(),
    /** Refundable bond, in cents (AUD). Arranged between users in v1. */
    bond: integer("bond").notNull().default(0),
    minDays: integer("min_days").notNull().default(1),
    suburb: text("suburb").notNull(),
    status: itemStatus("status").notNull().default("active"),
    ...timestamps,
  },
  (t) => [
    index("items_owner_idx").on(t.ownerId),
    index("items_category_idx").on(t.category),
    index("items_search_idx").using(
      "gin",
      sql`to_tsvector('english', ${t.title} || ' ' || ${t.description})`,
    ),
    check("items_price_positive", sql`${t.pricePerDay} >= 0`),
  ],
);

export const itemPhotos = pgTable(
  "item_photos",
  {
    id: id(),
    itemId: text("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("item_photos_item_idx").on(t.itemId)],
);

export const bookingStatus = pgEnum("booking_status", [
  "requested", // borrower asked
  "accepted", // lender said yes
  "declined", // lender said no
  "cancelled", // borrower withdrew (or lender cancelled after accepting)
  "completed", // item returned
]);

export const bookings = pgTable(
  "bookings",
  {
    id: id(),
    itemId: text("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    borrowerId: text("borrower_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    /** Snapshot of the price at request time, in cents. */
    total: integer("total").notNull(),
    status: bookingStatus("status").notNull().default("requested"),
    ...timestamps,
  },
  (t) => [
    index("bookings_item_idx").on(t.itemId),
    index("bookings_borrower_idx").on(t.borrowerId),
    check("bookings_dates", sql`${t.endDate} >= ${t.startDate}`),
  ],
);

export const conversations = pgTable(
  "conversations",
  {
    id: id(),
    itemId: text("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    borrowerId: text("borrower_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lenderId: text("lender_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }).notNull().defaultNow(),
    borrowerReadAt: timestamp("borrower_read_at", { withTimezone: true }),
    lenderReadAt: timestamp("lender_read_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("conversations_item_borrower_uq").on(t.itemId, t.borrowerId),
    index("conversations_lender_idx").on(t.lenderId),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: id(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: text("sender_id").references(() => user.id, { onDelete: "set null" }),
    body: text("body").notNull(),
    /** System messages (e.g. "Tom requested 12–14 Nov") have kind = 'event'. */
    kind: text("kind", { enum: ["text", "event"] }).notNull().default("text"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("messages_conversation_idx").on(t.conversationId, t.createdAt)],
);

export const reviews = pgTable(
  "reviews",
  {
    id: id(),
    bookingId: text("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    subjectId: text("subject_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** Set when a borrower reviews the item they borrowed. */
    itemId: text("item_id").references(() => items.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    title: text("title"),
    comment: text("comment").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("reviews_booking_author_uq").on(t.bookingId, t.authorId),
    index("reviews_subject_idx").on(t.subjectId),
    index("reviews_item_idx").on(t.itemId),
    check("reviews_rating_range", sql`${t.rating} between 1 and 5`),
  ],
);

export const favorites = pgTable(
  "favorites",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    itemId: text("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.itemId] })],
);

/* ───────────────────────────── Relations ───────────────────────────── */

export const userRelations = relations(user, ({ many }) => ({
  items: many(items),
}));

export const itemRelations = relations(items, ({ one, many }) => ({
  owner: one(user, { fields: [items.ownerId], references: [user.id] }),
  photos: many(itemPhotos),
  bookings: many(bookings),
}));

export const itemPhotoRelations = relations(itemPhotos, ({ one }) => ({
  item: one(items, { fields: [itemPhotos.itemId], references: [items.id] }),
}));

export const bookingRelations = relations(bookings, ({ one }) => ({
  item: one(items, { fields: [bookings.itemId], references: [items.id] }),
  borrower: one(user, { fields: [bookings.borrowerId], references: [user.id] }),
}));

export const conversationRelations = relations(conversations, ({ one, many }) => ({
  item: one(items, { fields: [conversations.itemId], references: [items.id] }),
  borrower: one(user, {
    fields: [conversations.borrowerId],
    references: [user.id],
    relationName: "borrower",
  }),
  lender: one(user, {
    fields: [conversations.lenderId],
    references: [user.id],
    relationName: "lender",
  }),
  messages: many(messages),
}));

export const messageRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(user, { fields: [messages.senderId], references: [user.id] }),
}));

export const reviewRelations = relations(reviews, ({ one }) => ({
  author: one(user, { fields: [reviews.authorId], references: [user.id] }),
  booking: one(bookings, { fields: [reviews.bookingId], references: [bookings.id] }),
}));
