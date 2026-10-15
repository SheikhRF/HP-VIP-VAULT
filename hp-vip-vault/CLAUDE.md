# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `hp-vip-vault/` (the Next.js app root, one level below the repo root).

```bash
npm run dev      # start dev server (Turbopack)
npm run build    # production build (Turbopack)
npm run start    # run the production build
npm run lint      # eslint .
```

There is no test suite/framework configured in this project (no test script in `package.json`). The two exceptions are framework-free regression scripts (plain assertions, no deps, same `npx tsx scripts/<name>.ts` pattern):
- `npx tsx scripts/test-admin-claims.ts` — admin role-claim casing logic in `lib/auth/requireAdmin.ts`. Run after touching that file or any admin-check code.
- `npx tsx scripts/test-dvla-sync-logic.ts` — retry/backoff and concurrency-limiter logic in `lib/dvla/syncFleet.ts` / `lib/dvla/concurrencyLimiter.ts`. Run after touching DVLA sync code.

One-off migration script (not part of the app build): `npx tsx scripts/sync-clerk-users.ts` — backfills Clerk users into the Supabase `profiles` table. Requires `CLERK_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY` in `.env.local`.

## Architecture

**Stack:** Next.js 16 App Router + React 19 + TypeScript (strict) + Tailwind v4 + shadcn/ui-style components (`components/ui/`). Auth via Clerk, data/storage via Supabase, external data from the DVLA Vehicle Enquiry Service and API Ninjas. Path alias `@/*` maps to the app root (`hp-vip-vault/`).

**Domain:** "Horsepower.VIP Vault" — a car-club fleet app. Members log trips/mileage against a shared fleet; admins manage the fleet (add/edit/delete cars, bulk-induct new cars, sync DVLA data) and users.

**Data model** (inferred from code — no schema/migration files live in this repo; Supabase is the source of truth):
- `cars` — `car_id`, `make`, `model`, `registration`, `mileage`, `pictures[]`, ~15 spec fields (engine, gearbox, etc. — populated from API Ninjas via the `SPEC_MAP` in `app/api/cars/route.ts`), plus `mot`/`tax_status`/`tax_due_date`/`last_synced_at` from DVLA.
- `trips` — `trip_id`, `car_id`, `user_id`, `start_date`/`end_date`, `mileage_before`/`mileage_after`, `rating`, `notes`.
- `profiles` — `id` (Clerk user id), `name`, `email`, `role`, `updated_at`. Kept in sync by `app/api/webhooks/clerk/route.ts` on Clerk's `user.created`/`user.updated`/`user.deleted` events.

**Role/auth model:**
- Clerk `publicMetadata.role` is the source of truth. The Clerk webhook normalizes it to lowercase into `profiles.role`.
- Session claims are cased inconsistently in practice (`sessionClaims.role` vs `sessionClaims.Role`) — this has caused real bugs before (see commit history: "fixes for roles case issue", "role fix for supabase sync"). **Use `requireAdmin()` from `lib/auth/requireAdmin.ts` for every admin-only check** — it already handles both casings and returns a ready-to-return `NextResponse` on failure (`401` if not logged in, `403` if not admin): `const check = await requireAdmin(); if (!check.ok) return check.response;`. The underlying pure predicate `isAdminClaims()` is unit-tested by `scripts/test-admin-claims.ts`. There is no `lib/user/claims.ts#checkIsAdmin()` anymore — it was deleted (unused, single-case, inconsistent with the real convention); don't reintroduce a second admin-check implementation.
- `proxy.ts` is this project's Next.js middleware (note the filename — it is the middleware, not a literal HTTP proxy). It only enforces admin-ness for **page** routes matched by `isAdminRoute` (`/admin(.*)`, `/cars/add`). It does **not** check admin for any `/api/*` route — the generic API branch only requires a logged-in user. **Every API route that should be admin-only or owner-only must self-check with `requireAdmin()` inside the handler.** All current admin-facing API routes (`admin/mass-induct`, `admin/update-car`, `admin/sync-dvla`, `cars` POST, `dvla`, `cars/details`, `cars/trims`) already do this — follow the same pattern for any new route under that umbrella. `app/api/trips/route.ts` is the one intentional exception: it only checks `auth()` for a logged-in `userId` (no admin check), since trips are user-owned and `user_id` is taken server-side from the session.
- `proxy.ts`'s `isPublicRoute` also lists `/api/cron(.*)` alongside `/api/webhooks(.*)` — both bypass Clerk auth entirely at the middleware level because they authenticate themselves inside the handler instead (webhooks via Svix signature verification, cron routes via a `CRON_SECRET` bearer-token check). Any new cron-triggered route must live under `/api/cron/*` and do its own `Authorization: Bearer ${process.env.CRON_SECRET}` check — Vercel's cron invoker carries no Clerk session, so `requireAdmin()` cannot be used there.

**Supabase access convention:** there is no shared Supabase client module in actual use. Every server page/route calls `createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)` inline, using the service-role key to bypass RLS. (`lib/supabaseServer.ts` exists but is unused dead code — it only wraps the anon key and adds nothing over `lib/supabaseClient.ts`.) Follow the existing inline pattern rather than introducing a new shared client, unless asked to refactor it.

**Env var inconsistency to be aware of:** the service-role key is read under two different names across the codebase — `SUPABASE_SECRET_KEY` (most files) and `SUPABASE_SERVICE_ROLE_KEY` (`app/admin/trips/[id]/page.tsx`, `app/admin/users/page.tsx`). Both are currently set in `.env.local`, but keep this in mind if env vars are ever rotated or restructured. `SUPABASE_BUCKET_NAME` is defined in `.env.local` but never read; the bucket name `"car-images"` is hardcoded everywhere it's needed instead.

**Registration number handling:** car registrations are always normalized with `.toUpperCase().replace(/\s+/g, "")` before being sent to DVLA or stored — follow this convention in any new code that touches registrations.

**External APIs** (server-side only):
- DVLA Vehicle Enquiry Service (`DVLA_VES_KEY`) — MOT/tax/year lookups by registration. No batch endpoint exists (one registration per call) and DVLA rate-limits per second (`429`). Fleet-wide syncing goes through `lib/dvla/syncFleet.ts`, which fetches with bounded concurrency (`lib/dvla/concurrencyLimiter.ts`, configurable via `DVLA_SYNC_CONCURRENCY`, default `4`) and retries only `429`/`502` with exponential backoff (`lib/dvla/syncFleet.ts#fetchDvlaWithRetry`) — one car's failure never aborts the rest of the fleet. This single function is called by both the manual trigger (`app/api/admin/sync-dvla/route.ts`, admin-only via `requireAdmin()`) and the weekly scheduled trigger (`app/api/cron/sync-dvla/route.ts`, `CRON_SECRET`-gated, invoked by the `vercel.json` cron entry) — don't reimplement the DVLA-calling loop in either route; extend `syncFleet`/`syncOneCar` instead.
- API Ninjas (`API_NINJAS_KEY`) — car spec lookups by make/model/trim, mapped into DB fields via `SPEC_MAP` in `app/api/cars/route.ts`. No batching/rate-limiting layer exists for this one.

**Styling:** dark-only theme, orange (`#f97316`) accent/primary. Theme tokens are defined in `app/globals.css` (Tailwind v4 `@theme inline`) and documented in `global tags.txt`.
