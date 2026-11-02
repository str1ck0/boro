# Boro

**Don't buy it. Boro it.** A peer-to-peer marketplace for borrowing and lending everyday things — kayaks, cameras, drills, tents — from people nearby. Launching in Perth, WA.

Boro started as a UX/UI university project (Figma prototype, v1 → v2), then became a Rails app at Le Wagon. This is **v3**: a ground-up rebuild as a production web app.

## Features

- Browse without an account: search (Postgres full-text), categories, curated collections, suburb and price filters
- Listings with multi-photo upload (client-side resize → Vercel Blob), pricing per day, bond and minimum hire
- Booking requests with date-clash checks → lender accepts/declines → marked returned → two-way reviews
- Chat per item, with booking events posted into the thread and unread badges
- Profiles with ratings, saved items, account settings
- Mobile-first with a bottom tab bar, installable as a PWA

Payments are arranged between members for now; Stripe Connect is next on the roadmap.

## Stack

Next.js 16 (App Router, Server Actions) · TypeScript · Tailwind CSS v4 · Postgres (Neon) + Drizzle ORM · Better Auth · Vercel Blob · Vercel

## Getting started

```bash
nvm use                 # Node 20.19+
corepack enable         # pnpm
pnpm install
cp .env.example .env    # set DATABASE_URL + BETTER_AUTH_SECRET
createdb boro_dev       # or point DATABASE_URL at Neon
pnpm db:migrate
pnpm db:seed            # demo data; --reset wipes everything first
pnpm dev
```

Demo login after seeding: `tom@demo.boro.app` / `borrow-it-boro-it`

| Script | |
| --- | --- |
| `pnpm db:generate` | Generate a migration from `src/db/schema.ts` |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:studio` | Browse the database |
| `pnpm typecheck` / `pnpm lint` / `pnpm build` | Checks |

## Project layout

```
src/
  app/(main)/      pages with the app shell (home, explore, items, lend, messages, my-boro…)
  app/(auth)/      sign-in / sign-up
  app/actions/     server actions (items, bookings, messages, account)
  app/api/         Better Auth handler, photo upload
  components/      UI
  db/schema.ts     Drizzle schema
  lib/             auth, queries, formatting, categories
scripts/seed.ts    demo data
```

## Brand

Colours from the Boro brand guide — Outback `#FF6633`, Cosmos `#333399`, Daintree `#33CC66`, Eureka `#FFCC00`. Type: Archivo. Item line-icons are from the original v2 design.
