# Boro — roadmap

_Last updated: 2 November 2026._

**Live:** https://boro.liamstrickland.dev · **Repo:** github.com/str1ck0/boro
**Stack:** Next.js 16, Tailwind v4, Postgres (Neon, London) + Drizzle, Better Auth, Vercel Blob, Resend.

## What's built

- Browse without an account: search, categories, collections, suburb and price filters.
- Listings with photos, daily price, bond and minimum hire; edit, pause, delete.
- Request to borrow → lender accepts or declines → marked returned → **two-way reviews**.
- Chat per item, with booking events in the thread and unread badges.
- Profiles, saved items, account hub (photo, details, change password).
- Email/password auth with password reset (Resend, from noreply@boro.liamstrickland.dev).
- Cape Town launch: rand pricing, Cape Town suburbs, demo data.

---

## 1. Before a real public launch

- [ ] **Remove the demo data.** 13 fictional members and 15 listings. Add a `db:wipe-demo` script that deletes only `@demo.boro.app` users (and their items, bookings, chats) so real accounts survive.
- [ ] **Separate preview and production databases.** `DATABASE_URL` is currently shared by Production, Preview *and* Development on Vercel, so a preview deployment writes to the live database. Use a Neon branch per preview (the Neon integration supports this) or a separate dev database.
- [ ] **Terms of use and privacy policy.** Required for a marketplace that stores personal information; South Africa's POPIA applies. Include what's collected, why, how long it's kept, and how to get it deleted.
- [ ] **Delete account and export my data** in Login & security (POPIA rights).
- [ ] **Email verification at sign-up.** Resend is set up; Better Auth supports it with a few lines. Gate requesting or lending on a verified email.
- [ ] **Report a user / listing / review**, plus a minimal admin view to act on reports and suspend accounts.
- [ ] **Rate limiting** on sign-in, password reset and uploads (Better Auth has a built-in limiter; back it with a store that works across serverless instances).
- [ ] **Error monitoring and analytics** (Vercel Analytics + Speed Insights; Sentry or Vercel error tracking).
- [ ] **Portfolio case study:** the Sanity `project-boro` entry has an empty description.

## 2. Trust and reviews (build on what's there)

Already working: after a lender marks an item returned, both people can leave a 1–5 star review with a comment; reviews only come from completed borrows; ratings show on profiles, item pages and the lender card.

- [ ] **Double-blind reviews.** Hide each review until both people have left one, or 14 days pass. Stops retaliation and makes reviews more honest (the Airbnb model).
- [ ] **Review window and reminders.** Email both people when an item is marked returned ("How did it go with Tom?"), remind after 3 days, close the window after 14.
- [ ] **Show the borrower's track record on requests.** In the lender's request card and chat: "★ 4.9 · 6 completed borrows · member since 2025", so lenders can decide with confidence.
- [ ] **Separate ratings for borrowers and lenders** on profiles ("As a lender ★ 4.8 (12) · As a borrower ★ 5.0 (3)").
- [ ] **Public reply to a review**, one per review, by the person reviewed.
- [ ] **Report a review** that breaks the guidelines.
- [ ] **Handover checklist with photos.** At pick-up and return, both people confirm condition and can attach photos. Settles bond disputes and feeds into reviews.
- [ ] **Verification badges.** Verified email now; then phone (SMS OTP); later ID verification for high-value items. Lenders can require "verified borrowers only" per listing.
- [ ] **Responsiveness stats** on profiles: response rate and typical reply time.
- [ ] **Cancellation record:** count cancellations after accepting; show it if it's a pattern.

## 3. Product

- [ ] **Notification emails:** new request, accepted or declined, new message (batched), return reminder the day before.
- [ ] **Payments and bonds.** Stripe doesn't onboard South African businesses directly; **Paystack** (owned by Stripe) does, and supports split payments to lenders. Hold the bond and release it on return. Needs a registered business; check Paystack's current requirements.
- [ ] **Availability calendar:** a visual date picker with booked dates greyed out; lenders can block dates.
- [ ] **Real-time chat** instead of 5-second polling (Ably, Pusher or Postgres listen/notify), plus web push notifications for the installed app.
- [ ] **Distance-based search:** geocode suburbs and sort by distance, or "within 5 km".
- [ ] **Google sign-in.** Code is ready; needs Google OAuth credentials.
- [ ] **Photos for every category** (Cooking & BBQ and Everything else have none on the home row).
- [ ] **Saved searches and alerts** ("tell me when someone lists a tent near Observatory").
- [ ] **Damage protection or insurance** partner for higher-value items (longer term).

## 4. Engineering

- [ ] **Tests:** unit tests for pricing/date logic, integration tests for booking state changes and permissions, and a Playwright run of request → accept → return → review.
- [ ] **CI on GitHub Actions:** typecheck, lint, tests and build on every pull request.
- [ ] **Clean up orphaned photos** in Blob storage (removed listing photos, replaced avatars, and the one stray test upload).
- [ ] **Accessibility pass:** brand yellow and green on light backgrounds and white text on Outback/Daintree are below WCAG contrast; decide where to keep brand-exact colours and where to put dark text on a brand background instead.
- [ ] **SEO:** sitemap, per-listing Open Graph images, structured data for listings.
- [ ] **Turbopack dev quirk:** theme changes in `globals.css` need a dev-server restart.
