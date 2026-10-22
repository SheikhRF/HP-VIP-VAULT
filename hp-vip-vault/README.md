# Horsepower.VIP Vault

A fleet-management app for Horsepower.VIP members. Drivers log and manage their own trips/mileage against a shared fleet of cars; admins manage the fleet (add, edit, delete, bulk-induct cars), manage user roles, and sync vehicle data (MOT/tax) from the DVLA.

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict)
- **Styling:** Tailwind CSS v4, shadcn/ui-style components (`components/ui/`)
- **Auth:** [Clerk](https://clerk.com/)
- **Data & storage:** [Supabase](https://supabase.com/) (Postgres + Storage)
- **External data:** DVLA Vehicle Enquiry Service (MOT/tax lookups), API Ninjas (car spec lookups)

## Getting started

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev      # start dev server (Turbopack)
npm run build    # production build (Turbopack)
npm run start    # run the production build
npm run lint      # eslint .
```

There is no automated test runner configured for the app itself. The exceptions are standalone regression checks:

```bash
npx tsx scripts/test-admin-claims.ts       # admin role-check logic
npx tsx scripts/test-driver-claims.ts      # driver/admin role-check logic
npx tsx scripts/test-dvla-sync-logic.ts    # DVLA retry/backoff + concurrency limiter
npx tsx scripts/test-car-status-logic.ts   # car compliance/driveable status logic
```

## Environment variables

Create `.env.local` in this directory with:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_SIGN_UP_URL=
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=
NEXT_PUBLIC_CLERK_WAITLIST_URL=

# DVLA Vehicle Enquiry Service
DVLA_VES_KEY=
DVLA_SYNC_CONCURRENCY=4

# API Ninjas
API_NINJAS_KEY=

# Cron (Vercel Cron Job auth — see "Scheduled DVLA sync" below)
CRON_SECRET=

# Instagram API (Instagram Login flow — no Facebook Page needed)
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
```

`SUPABASE_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` should be the same Supabase service-role key — both names are read by different files in the codebase.

`DVLA_SYNC_CONCURRENCY` is optional (defaults to `4`) and caps how many DVLA lookups run in parallel during a fleet sync. `CRON_SECRET` should be a long random value, set in Vercel's project settings for production and in `.env.local` for local testing — never commit it.

`INSTAGRAM_APP_ID`/`INSTAGRAM_APP_SECRET` come from a Meta Developer app with the "Instagram API" (Instagram Login) product added — see "Scheduled Instagram sync" below. The live access token and Instagram user id are **not** env vars; they live in Supabase's `instagram_token` table instead, seeded once via the one-time OAuth flow and rotated automatically by the sync job.

## Scheduled DVLA sync

`vercel.json` defines a weekly Vercel Cron Job (Sundays at 03:00 UTC) that hits `/api/cron/sync-dvla`, which authenticates via the `CRON_SECRET` bearer token (Vercel attaches this automatically) rather than a Clerk session. Admins can still trigger the same sync on demand via the "Sync Fleet" button on `/admin/dashboard`, which calls `/api/admin/sync-dvla` (Clerk admin session required). Both routes call the same underlying `syncFleet()` logic in `lib/dvla/syncFleet.ts`, so behavior is identical either way.

## Scheduled Instagram sync

`vercel.json` defines a daily Vercel Cron Job (04:00 UTC) that hits `/api/cron/sync-instagram`, `CRON_SECRET`-gated like the DVLA cron. It calls `syncInstagramFeed()` in `lib/instagram/syncFeed.ts`, which refreshes the Instagram access token if it's within 7 days of expiry, fetches the latest ~12 posts from the Instagram API, and caches them in Supabase's `instagram_posts` table (read by `components/InstagramFeed.tsx` on `/home`). Admins can also trigger this manually via the "Sync Instagram" button on `/admin/dashboard` (`/api/admin/sync-instagram`).

**One-time setup:** before the first sync can succeed, an admin must click "Connect" next to that button once — it kicks off `/api/admin/instagram-oauth`, which redirects to Instagram's own login/consent screen and, on return, exchanges the resulting code for a long-lived access token and seeds `instagram_token`. This is only needed once (the sync job keeps the token refreshed after that), or again if the token is ever fully revoked.

## Architecture overview

- **Auth & roles:** Clerk handles sign-in/sign-up. A user's role (`user`/`driver`/`admin`) lives in Clerk's `publicMetadata.role` and is mirrored into Supabase's `profiles` table by the Clerk webhook (`app/api/webhooks/clerk/route.ts`). `proxy.ts` (the Next.js middleware) gates admin-only **pages** (`/admin/*`, `/cars/add`) and driver-or-admin-only pages (`/trips`, `/trips/add`, `/trips/*/edit`); every role-gated **API** route additionally self-checks via `requireAdmin()`/`requireDriverOrAdmin()` in `lib/auth/requireAdmin.ts`. Only drivers and admins can log a trip; a trip can only be edited/deleted by the driver who logged it (while they're still currently a driver or admin) or by any admin.
- **Data model:** `cars` (fleet records + specs + MOT/tax data), `trips` (member-logged mileage, owned by `user_id`), `profiles` (Clerk users mirrored into Supabase, `role` one of `user`/`driver`/`admin`), `instagram_posts`/`instagram_token` (cached social feed + its rotating access token). No schema/migration files live in this repo — Supabase is the source of truth.
- **External integrations:** adding a car enriches it with specs from API Ninjas and MOT/tax/year data from the DVLA Vehicle Enquiry Service; the fleet-wide DVLA sync (manual button or weekly cron, see above) refreshes MOT/tax data for every car with bounded concurrency and rate-limit-aware retries. The home page's Instagram section is populated by a daily sync against Meta's Instagram API (Instagram Login flow), not a live third-party embed.
- **Styling:** dark-only theme with an orange accent; theme tokens are defined in `app/globals.css` and documented in `global tags.txt`.

See `CLAUDE.md` for the fuller set of codebase conventions (auth patterns, Supabase client usage, naming inconsistencies to be aware of) aimed at AI coding assistants working in this repo.
