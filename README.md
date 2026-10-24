# HavenMarket

A full-stack online marketplace (eBay-style) built with Next.js. Buy fixed-price items, bid in live auctions, run a seller storefront, message other users, and leave reviews — all backed by a real database with server-validated business logic.

## Tech stack

- **Frontend:** React 19 + Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **Backend:** Next.js Server Actions + Route Handlers (same codebase, no separate API server)
- **Database:** SQLite via Prisma ORM 7 (file-based, zero external services required). Swappable to PostgreSQL/MySQL by changing the `datasource` provider and `DATABASE_URL`.
- **Auth:** Auth.js (NextAuth v5), credentials provider, JWT sessions, bcrypt password hashing
- **Icons:** lucide-react
- **Tests:** Vitest, against a throwaway SQLite database

## Getting started

```bash
npm install
npm run db:migrate   # creates dev.db and applies the schema
npm run db:seed       # loads demo categories, listings, auctions, users
npm run dev
```

Visit http://localhost:3000.

**Demo login:** `demo@marketplace.test` / `Demo12345!` — this account can both buy and sell (it owns some listings, has items in its cart/watchlist, and has an order history).

### Other useful scripts

```bash
npm run build       # production build
npm run start        # run the production build
npm run test          # run the Vitest suite (spins up a throwaway test.db)
npm run db:studio    # open Prisma Studio to browse the database
npm run lint          # ESLint
```

### Environment variables

See `.env.example`. For local development the defaults work out of the box:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLite file path (`file:./dev.db`) |
| `AUTH_SECRET` | Signs session JWTs. A dev value is pre-filled; generate your own with `openssl rand -base64 32` for anything beyond local testing. |
| `NEXTAUTH_URL` | Base URL used by Auth.js |
| `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` | Optional. Leave blank — checkout runs in simulated-payment mode without them (see below). |

## Implemented features

**Browsing & discovery**
- Homepage with hero banner, trending/recommended rows, featured "ending soon" auctions with live countdowns, popular-category grid, and a recently-viewed shelf (per-browser, via `localStorage`)
- Search with keyword matching, category/subcategory browsing, filters (price range, condition, brand, location, free shipping, listing type), sorting (newest, popularity, price, ending-soon), pagination, and search-suggestion autocomplete
- Product detail pages with an image gallery (hover-to-zoom), seller info + rating, shipping estimate, related products, Q&A, and reviews

**Buying**
- Cart with quantity updates and removal, server-recomputed totals (subtotal/shipping/tax)
- Checkout with saved/new shipping addresses; all prices, stock levels, and totals are re-validated server-side at order time inside a database transaction — nothing from the client is trusted
- Order history and per-order status tracking (`PENDING_PAYMENT → PAID → SHIPPED → DELIVERED`)
- Watchlist (heart icon everywhere a product card appears)

**Selling**
- Create listings (fixed-price or auction) with multi-image upload (saved to `/public/uploads`) or pasted image URLs
- Seller dashboard: overview stats (active/paused listings, completed sales, revenue), listing management (edit/pause/resume/delete), order fulfillment (mark shipped/delivered), and a buyer-questions inbox

**Auctions**
- Starting bid, minimum bid increment, optional Buy-It-Now price, live countdown
- All bid validation happens server-side inside a database transaction with optimistic concurrency control (a bid only commits if the auction's current price hasn't changed since it was read), so two simultaneous bids can never both "win" — see `src/lib/auctions.ts` and the race-condition test in `tests/auctions.test.ts`
- Auctions are finalized (winner determined, listing marked SOLD/ENDED) lazily the next time they're read past their end time, since there's no background worker in this environment — see "Remaining integrations" below
- Winners get a dedicated checkout flow to pay for what they won

**Accounts & trust**
- Sign up / sign in / sign out, password reset (demo mode — the reset link is shown on screen instead of emailed, since no email provider is configured), account settings, password change, multiple shipping addresses
- Buyer ↔ seller messaging, per-listing Q&A, purchase-verified reviews (only buyers with a completed order for that item can review it), listing reports

**Security practices applied throughout**
- Passwords hashed with bcrypt; sessions are signed JWTs in httpOnly cookies
- Every mutation re-checks ownership/authorization server-side (you can't edit someone else's listing, bid on your own auction, review something you didn't buy, etc.)
- Zod validation on every form submission
- Prices, bid amounts, stock levels, and order totals are always recomputed from the database inside the server action — the client only ever sends an ID and a requested quantity/amount

## Demo / simulated features (clearly not production-grade)

- **Payments:** Checkout completes instantly as `SIMULATED_PAID`. No card data is collected or stored anywhere. Wiring up real Stripe test-mode payments would mean adding `@stripe/stripe-js` + a PaymentIntent-based checkout flow in `src/actions/orders.ts`.
- **Password reset:** Works end-to-end (signed, time-limited token), but the "email" is just displayed on screen rather than sent, since no email provider is configured.
- **Image storage:** Uploaded listing photos are written to the local filesystem (`/public/uploads`). On a real deployment this should go to an object store (S3, R2, etc.) instead — it won't persist across most hosting platforms' deploys.
- **Auction closing:** Finalized lazily on read rather than by a scheduled job (see below).

## Remaining integrations for a production deployment

1. **Real payments** — Stripe test-mode (or live) integration in place of the simulated payment step.
2. **Object storage for images** instead of local disk.
3. **A scheduled job for auction closing** (e.g. a cron hitting a small "sweep expired auctions" endpoint, or a queue) instead of closing auctions lazily when a page happens to read them. The lazy-close logic already lives in `src/lib/auctions.ts` (`finalizeExpiredAuctions`) and is safe to call from a cron trigger as-is.
4. **Transactional email** for password resets, order confirmations, and shipping updates.
5. **A real Postgres/MySQL database** for multi-instance deployments — SQLite is great for a single-process demo but doesn't support concurrent writers across multiple server instances. Swapping providers in `prisma/schema.prisma` and the adapter in `src/lib/prisma.ts` is the only change needed; the rest of the app is provider-agnostic Prisma code.
6. **Rate limiting** on login, messaging, and bidding endpoints (e.g. via Upstash/Redis) — not implemented here since it typically depends on the hosting platform's infrastructure.
7. **An admin/moderation view** over the `Report` table — reports are captured and stored today (visible via `npm run db:studio`), but there's no dedicated moderation UI yet.

## Data model

See `prisma/schema.prisma` for the full schema: `User`, `Address`, `Category`, `Listing`, `ListingImage`, `Auction`, `Bid`, `CartItem`, `Order`, `OrderItem`, `Payment`, `Message`, `Review`, `Watchlist`, `Question`, `Report`.

## Project structure

```
src/
  app/            Routes (App Router) — pages + API route handlers
  actions/         Server Actions — all mutations live here, each with its own auth + validation
  components/      UI components
  lib/              Business logic & data access (Prisma queries, pricing, auction engine, validation schemas)
  generated/prisma  Generated Prisma Client (gitignored, regenerated by `prisma generate`)
prisma/
  schema.prisma     Data model
  seed.ts            Demo data generator
tests/              Vitest suite for pricing, auction bidding, and validation logic
```
