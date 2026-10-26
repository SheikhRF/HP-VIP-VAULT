# History

## ✅ Done: Instagram feed connected end-to-end, real posts live on /home

Picked up where the Instagram feed was paused (Meta Developer app registration blocked on account trouble — see the old "PAUSED mid-setup" note, now removed from `CLAUDE.md`). The user had since created the Meta Developer app and connected `@horsepower.vip` to it.

- **Meta dashboard (browser-driven, read/write with the user's own login):** confirmed the Instagram API (Instagram Login) product was already added on the `hp-vip-vault` app (App ID `1595349705590713`), required permissions (`instagram_business_basic`, `instagram_business_manage_comments`, `instagram_business_manage_messages`) already granted, and `@horsepower.vip` already listed as an Instagram Tester. Added the missing piece: the production OAuth redirect URL (`https://hp-vip-vault.vercel.app/api/admin/instagram-oauth/callback`) under "Set up Instagram business login".
- **Credentials wired in:** added `INSTAGRAM_APP_ID`/`INSTAGRAM_APP_SECRET` to `.env.local` and to Vercel's Production environment variables, then redeployed so Production picked them up.
- **Ran the one-time OAuth "Connect" flow** against production as admin — Instagram's consent screen correctly showed `hp-vip-vault-IG` requesting access to `horsepower.vip`; approved, and `instagram_token` was seeded in Supabase.
- **Found and fixed a real bug** while verifying the manual "Sync Instagram" button: it 500'd with a generic `{"ok":false,"error":"Sync failed"}`. Root cause (via Vercel request logs + a local repro script against the real API): Instagram's media endpoint omits `media_url` for some VIDEO/REELS posts, but `instagram_posts.media_url` is `NOT NULL` in Supabase — the upsert threw a `PostgrestError`, which isn't an `Error` instance, so the route's `error instanceof Error` check fell through to the generic message instead of anything useful. **Fix:** `lib/instagram/syncFeed.ts` now falls back to `thumbnail_url` when `media_url` is missing (the same fallback `components/InstagramFeed.tsx` already applies when rendering). Commit `e897d4c`, pushed directly to `main` (Vercel auto-deployed).
- **Verified live, end-to-end:** `/home` renders 12 real `@horsepower.vip` posts (cars, a meet, reels) instead of the fallback card; re-hit `/api/admin/sync-instagram` after the fix deployed and got back `{"ok":true,"synced":12}` from the actual production route (not just the local repro).
- **Not yet done:** the daily cron (`app/api/cron/sync-instagram/route.ts`) calls the same now-fixed `syncInstagramFeed`, so it should work, but the scheduled run itself hasn't been observed firing yet.

## ✅ Done: inline role control + user removal on the admin Users Registry

`/admin/users` previously only let admins view a search/filter table — changing a role or removing someone required opening that user's detail page (and removal wasn't possible at all). Both are now available directly on the table row.

- **New `DELETE /api/admin/users/[id]`** (`app/api/admin/users/[id]/route.ts`, admin-gated via `requireAdmin()`): deletes the Clerk account, then the `profiles` row. Rejects a request where the target id is the calling admin's own id (no self-removal). `trips.user_id` has no FK to `profiles` (pre-existing schema design, see `CLAUDE.md`), so a removed user's trips are left orphaned rather than cascade-deleted — not a new gap, just worth knowing.
- **New `components/admin/UserRowActions.tsx`**: compact per-row Promote/Revoke + Remove buttons, confirmation dialogs, `ErrorBanner` on failure — same pattern as the existing `components/admin/RoleToggle.tsx` on the user detail page, just sized for a table cell. Wired into `UserRegistrySearch.tsx`'s new "Actions" column; `app/admin/users/page.tsx` now passes the signed-in admin's own id down so the Remove button can disable itself on their own row.
- Verified: `tsc --noEmit` clean, `eslint` clean on touched files, full `npm run build` succeeds (all 35 routes, including the new DELETE route, compile), `scripts/test-admin-claims.ts` passes. **Not yet done:** the role-toggle and remove actions haven't been click-tested against a real non-primary account — same verification gap as the existing `RoleToggle` noted below.
- Branch `worktree-user-management`, PR #2: `https://github.com/SheikhRF/HP-VIP-VAULT/pull/2` (open, not yet merged).

## ✅ Done: found and fixed the real `/cars/[car_id]` crash — a function prop crossing the RSC boundary

The first fix (below, commit `d614459`) addressed the *suspected* cause from the audit (a possible unhandled Promise rejection) and added error boundaries, but after deploying it I re-tested live rather than assuming it worked — and the crash was not only still happening, it was now reproducing on **every single car, every single time** (previously intermittent), each with its own stable digest. That ruled out "transient network hiccup" definitively and pointed at something deterministic in the render itself.

**Real root cause:** `app/cars/[car_id]/page.tsx` passed an inline arrow function as a prop to `CountUp` — `<CountUp value={...} format={(n) => formatPrice(Math.round(n))} />` — where `CountUp` is a `"use client"` component. React Server Components cannot serialize a function across the server→client boundary, so this threw during render on *every* request, 100% deterministically. This existed since the original Phase 3 motion-roadmap work, well before this session. It explains the audit's confusing "sometimes works via raw fetch" observation too: those "successful" raw fetches were almost certainly serving stale cached HTML from before this code path was hit, not a live render.

**Fix:** `components/CountUp.tsx` now takes a `format: "number" | "currency"` string prop and resolves it internally via a small lookup table, instead of accepting a function — only `value` (a plain number) crosses the server→client boundary now. The page's local `formatPrice` helper was removed since `CountUp`'s built-in `"currency"` formatter replaces it. Commit `f760aa0`.

**Verified live after deploy:** clicked into cars 45, 41, 40, and 39 (all previously crashing or untested) via real in-app navigation — all load cleanly, valuation `CountUp` animates correctly with the `£` formatting intact.

**Lesson for `CLAUDE.md`:** never pass a function (or any non-serializable value — class instances, Symbols, etc.) as a prop from a Server Component to a Client Component, even inline/"just for formatting." Next.js's production error message for this ("error occurred in the Server Components render") gives zero indication of the actual cause — only a digest — so this class of bug is easy to misdiagnose as a data/network issue instead. If a client component needs custom formatting, give it a small set of named string variants it resolves internally, not a callback.

## ✅ Done: fixed the first round of problems found in the full-site audit

- **`/cars/[car_id]` crash — partial fix, superseded above.** `app/cars/[car_id]/page.tsx`'s `Promise.all` fetch was wrapped so a rejected promise would be caught and retried once before falling back gracefully, addressing the audit's leading theory (a transient Supabase network hiccup). This turned out not to be the actual cause (see entry above) but is a harmless, real correctness improvement kept in place regardless. Commit `d614459`.
- **Error boundaries added app-wide.** New `app/error.tsx` (route-level, on-brand "Uplink Interrupted" screen with a Try Again button calling `reset()` and a Return to Vault link — note it can't render the real `Navbar` since that's an async Server Component and `error.tsx` is forced client-side, so it has its own minimal static header matching the same look) and `app/global-error.tsx` (root-layout-level fallback, renders its own `<html>/<body>` since it replaces the layout entirely). This is what actually caught the real crash above and turned it from a bare browser error page into a proper on-brand screen — genuinely valuable independent of root-causing the crash itself.
- **Instagram handle typo fixed.** `app/home/page.tsx`: "@horespower.vip" → "@horsepower.vip".
- **`/trips/add` without `?car_id=` now shows a proper "No Asset Selected" state** (`app/trips/add/TripPageClient.tsx`) with a link back to `/cars`, instead of rendering a full trip-logging form stamped "CAR ID: #UNKN" that could never actually submit.
- **`/admin/cars/[id]`'s "Asset Not Found" state restyled** to match the public `/cars/[car_id]` equivalent — now has the navbar, consistent typography, and a "Return to Fleet" link instead of a bare unstyled string.
- Verified: `npx tsc --noEmit` clean, full `npm run build` succeeds (all 32 routes compile) for both rounds of fixes.

## 🔍 Done: full-site functional audit (every route, browser-driven)

Went through every route in `app/` live on production, clicking through real flows rather than just loading pages statically. Full list checked: `/`, `/home`, `/cars` (+ search), `/cars/add` (+ DVLA trim-search API), `/cars/[car_id]` (multiple ids), `/about`, `/trips/add`, `/admin`, `/admin/induct-selection`, `/admin/mass-induct`, `/admin/cars/[id]` (valid and invalid ids), `/admin/dashboard` (+ search), `/admin/users` (+ search), `/admin/trips`, `/sign-in` (already-authenticated redirect). Nothing was submitted/mutated (no cars added, no CSV uploaded, no role toggled, no asset decommissioned) — all forms were visually/structurally verified without triggering writes.

**Found one real, high-priority bug — see "Known problems backlog" below for the full write-up: `/cars/[car_id]` intermittently crashes.** Clicking from `/cars` into a car's detail page (client-side navigation) sometimes throws an uncaught Server-Components render error and falls through to a generic, unstyled "This page couldn't load" screen, with a server-assigned error digest. Reproduced on multiple different cars with different digests; the same URL sometimes loads fine on direct/raw fetch. Root cause not fully pinned down — needs Vercel function logs to see the actual server-side exception (only the digest is visible client-side in production builds).

**Also found while auditing:**
- **Zero `error.tsx`/`global-error.tsx` boundaries exist anywhere in `app/`.** This is why the crash above (and any other future uncaught render error) falls through to Next's bare default UI instead of something on-brand with a retry path. Worth adding regardless of the `/cars/[car_id]` root cause.
- **Minor typo:** the Instagram handle on `/home` reads "@HORESPOWER.VIP" (letters transposed).
- **Minor UX gap:** `/trips/add` visited without a `?car_id=` query param (i.e. not via the "Add Trip" button) shows "CAR ID: #UNKN" instead of redirecting or prompting for a car — low real-world impact since nothing in the app links there without the param, but a stray bookmark or typed URL hits a confusing dead end.
- **Minor inconsistency:** `/admin/cars/[id]` for a non-existent id shows a bare, unstyled "ASSET NOT FOUND" with no navbar or way back — compare to the public `/cars/[car_id]` equivalent, which has proper styling and a "Return to Vault" link.

**Confirmed working well:** `/cars` search/filter, `/cars/add`'s multi-step induction form including the live external trim-lookup API (returned 30 real Porsche 911 trims and populated the native `<select>` correctly — verified via DOM/network inspection since native `<select>` dropdowns don't render in automation screenshots), `/admin` hub's four cards all link correctly, `/admin/induct-selection` → Single Unit/Bulk Array, `/admin/mass-induct`'s CSV format instructions and drop zone, `/admin/cars/[id]`'s full edit form (specs, compliance, DVLA fields) loading real data correctly, and `/sign-in` correctly redirecting an already-authenticated session straight to `/home`.

## ✅ Done: fixed broken `/cars` card layout + live browser verification pass

User caught this live in production before I did: `/cars` had collapsed into raw overlapping text with no images, borders, or spacing.

**Root cause:** `CarCard.tsx`'s root element is a `<Link>`, which is `inline` by default. It only got its `aspect-[4/5]` block sizing because it used to be a *direct child of the CSS Grid* in `PublicFleet.tsx`, and Grid auto-blockifies its direct children. The Phase 2 motion work (`animate-in fade-in duration-300` wrapper) wrapped each `CarCard` in an extra `<div>` so it was no longer a direct grid child — Grid blockified the new wrapper `div` instead, and the `Link` fell back to inline, collapsing the whole card.

**Fix:** added explicit `block w-full` to the `Link`'s className in `CarCard.tsx` (commit `c4c8cd5`). This makes `CarCard` robust regardless of future nesting, instead of special-casing the wrapper.

**Lesson (also added to `CLAUDE.md`):** any component that depends on being a direct CSS Grid/Flex child for implicit sizing is fragile — adding a wrapper div anywhere above it for animation/layout purposes can silently break it. Prefer explicit `block`/`flex`/sizing classes on grid-item components rather than relying on auto-blockification.

**Live verification pass** (`hp-vip-vault.vercel.app`, browser-driven, read-only except one real contact-form submission):
- `/cars` — broken pre-fix, confirmed fixed post-deploy ✅
- `/home` — unaffected by the bug (no wrapper there), confirmed fine ✅
- `/cars/[id]` — gallery + lightbox (Phase 3) confirmed working ✅
- `/about` — Reveal-animated cards confirmed working ✅
- `/contact` — submitted a real test message, got the success banner, form cleared ✅
- `/admin/users` — search confirmed working (filtered "vlad" → 1 result) ✅
- `/admin/users/[id]` — `RoleToggle` confirmed rendering correctly; **not clicked** (would mutate a real user's production admin access, not requested)

This closes most of the "Verification gaps" item below, except the two items noted as still open (see that section).

## ✅ Done: SORN vehicles no longer count as "driveable" / tax-valid

`lib/cars/status.ts#isTaxValid` now only accepts `"Taxed"` (SORN removed). `scripts/test-car-status-logic.ts` updated to match and lock in the corrected behavior. No call sites needed changes since the logic was already centralized.

## ✅ Done: infrastructure recon (Supabase / Vercel / Clerk)

A Claude in Chrome session was run against the real Supabase, Vercel, and Clerk dashboards (read-only) and reported back in the "Horsepower.VIP Vault — Infrastructure Recon" Claude Doc (`https://claude.ai/artifact/11ajhySQvngjposMxqvjm7`). The real schema, RLS policies, Vercel env/cron state, and Clerk session-claim configuration are documented in `CLAUDE.md` instead of being inferred. Headline findings and what was done about each:

1. **`CRON_SECRET`/`DVLA_SYNC_CONCURRENCY` not set in Vercel** — infra-only, still outstanding, see backlog below.
2. **`cars` RLS policy only covers `anon`, not `authenticated`** — confirmed harmless today (nothing attaches a Clerk JWT to a Supabase request anywhere), documented in `CLAUDE.md` as a latent trap.
3. **`trips` has RLS enabled with zero policies** — this one was live. `trip-list.tsx`'s pagination queried `trips` directly with the anon key and would silently return nothing once trip count passed 10. **Fixed:** added `app/api/admin/trips/route.ts` and switched `trip-list.tsx` to call it.
4. **`role`/`Role` session-claim "casing inconsistency" was never actually a casing bug** — `role` is a Supabase-managed claim permanently fixed to `"authenticated"`; `Role` is the real one. Comments corrected in `lib/auth/requireAdmin.ts`, `proxy.ts`, `CLAUDE.md`.
5. **Clerk is on the Development instance while serving production traffic on Vercel** — infra-only, still outstanding, see backlog below.

## ✅ Done: approved npm install-scripts for esbuild/sharp/unrs-resolver/@clerk/shared

npm 11's new advisory allowScripts feature flagged these four (npm 12 will block unreviewed scripts by default). All legitimate — approved via `npm approve-scripts`, recorded in `package.json`'s `allowScripts` field.

## ✅ Done: public-pages motion/performance roadmap (all 3 phases)

Goal: make the non-admin pages feel more dynamic and fast, CSS-only (no new motion library — `tw-animate-css` was already installed and unused).

- **Phase 1 — correctness & perceived-speed:** parallelized the car-detail page's two Supabase fetches; added `loading.tsx` skeletons for `/home`, `/cars`, `/cars/[car_id]` (new shared `CarCardSkeleton`); hardened `Hyperspeed.tsx` (`prefers-reduced-motion` skips mounting WebGL entirely, `visibilitychange` pauses the render loop when backgrounded, lazy-loaded via `next/dynamic` with a CSS placeholder).
- **Phase 2 — extend existing hover/reveal language to flat pages:** new `components/Reveal.tsx` (`IntersectionObserver`-driven fade+rise, fires once, respects `prefers-reduced-motion`) applied to `about`, `contact`, `home`. Fixed the contact submit button's unexplained `hover:scale-100` override (now inherits the shared `vault` Button's hover-scale like every other CTA). `PublicFleet`'s filtered cards now fade in (`animate-in fade-in duration-300`) — filter logic itself untouched. Also fixed a dead `group-focus-within` class (missing `group` ancestor) and the "INDENTIFY" typo while in that file.
- **Phase 3 — car-detail gallery upgrade:** new `components/CarGallery.tsx` (replaces the old inline gallery `<section>`) with hover zoom, `components/GalleryDots.tsx` (scroll-position-tracked via `IntersectionObserver`), and `components/Lightbox.tsx` (full-screen modal, Esc/backdrop/arrow-key nav). No autoplay, no custom drag-momentum — deliberately, per the original roadmap reasoning.
- **Image polish:** new `lib/image.ts#VAULT_BLUR_PLACEHOLDER` (a tiny solid-color SVG data URI matching the app's `#171717` background) applied to `CarCard` and `CarGallery`'s `next/image` usages via `placeholder="blur"`.
- Verified: `tsc --noEmit` clean, full `npm run build` succeeds at every step, all 3 regression scripts pass throughout.
- **Not yet done:** none of this has been visually confirmed in an actual browser — see "Verification gaps" below.

## ✅ Done: backlog cleanup pass

- **Admin role-management dead end fixed.** New `app/api/admin/users/[id]/role/route.ts` (admin-gated, calls Clerk's backend `clerkClient().users.updateUserMetadata()` + updates `profiles.role` directly so it's reflected immediately without waiting on the webhook round-trip) and a new `components/admin/RoleToggle.tsx` on the user detail page to grant/revoke admin access. Also fixed `user.name.split(' ')[0]` crashing on a null name.
- **Admin users list search added.** New `components/admin/UserRegistrySearch.tsx` (client-side filter by name/email/role, same pattern as `DashboardSearch`), and the non-functional "⋯" actions button was removed (role management now lives on the detail page, which the row already links to).
- **Contact form now gives real feedback.** Converted to `components/ContactForm.tsx` using React's `useActionState`, with a new `app/contact/actions.ts` server action returning a typed status. Shows a success confirmation or an `ErrorBanner` on failure, disables the submit button while pending. **Honest scope note:** this does not add persistence — there's no contact-messages table in Supabase and no email service configured, so submissions are still only logged server-side. Real persistence needs one of those provisioned first (not something I can do without dashboard/API-key access).
- **Env var naming split fixed.** `app/admin/trips/[id]/page.tsx` now reads `SUPABASE_SECRET_KEY` like every other file (was the one remaining `SUPABASE_SERVICE_ROLE_KEY` outlier after `app/admin/users/page.tsx` was rewritten for search).
- **`SUPABASE_BUCKET_NAME` wired up.** `app/api/cars/route.ts` and `app/api/admin/update-car/route.ts` now read `process.env.SUPABASE_BUCKET_NAME || "car-images"` instead of the hardcoded string everywhere (including the URL-path-splitting logic that assumes the bucket name appears literally in public URLs).
- **`lib/supabaseServer.ts` deleted** (confirmed unused).
- **`eslint` ran successfully this time** (was blocked by the sandbox before; this run just took a while — not actually blocked). Found 85 problems (51 errors, 34 warnings), almost entirely pre-existing `@typescript-eslint/no-explicit-any` and unused-import debt scattered across ~20 files that predate this session. Fixed the handful that were either newly introduced this session or trivial/auto-fixable: `components/Reveal.tsx`'s real `react-hooks/set-state-in-effect` issue (refactored to a lazy `useState` initializer instead of setting state synchronously in the effect body), a `prefer-const` auto-fix in `app/api/admin/update-car/route.ts`, and `any` → proper types in the three new files from this session (`app/api/admin/users/[id]/role/route.ts`, `app/api/admin/trips/route.ts`, `components/admin/RoleToggle.tsx`). The remaining ~45 pre-existing `any`/unused-import errors across admin forms, API routes, and `Hyperspeed.tsx` were left alone — fixing those is a much larger, separate cleanup pass (mostly `catch (err: any)` blocks and loosely-typed Supabase row shapes), not something to fold silently into this session's scope.

---

# Known problems backlog (what's left)

Nothing outstanding from the full-site audit — `/cars/[car_id]`'s crash is fixed and confirmed live (re-tested across 4 previously-crashing cars post-deploy, all load cleanly), and all four smaller gaps from the audit are fixed. See "found and fixed the real `/cars/[car_id]` crash" in History above for the full story.

## Infra-only — needs manual action in a dashboard, can't be fixed by changing code
- **Set `CRON_SECRET` and `DVLA_SYNC_CONCURRENCY` in Vercel's Production environment variables.** Neither is set today. The weekly DVLA sync cron will 401 on every run until this is done.
- **Clerk is a Development instance (`pk_test_...`) serving real production traffic.** Worth deciding whether/when to promote to a Production Clerk instance.
- **`cars`/`profiles` RLS policies and the public `car-images` bucket's lack of size/MIME limits** could be hardened in Supabase directly, though confirmed not actively exploited by any current code path.
- **True contact form persistence** needs a Supabase table (migration/dashboard access) or an email service (API key) — neither exists today.

## Pre-existing lint debt (lower priority, not a bug)
- **~45 pre-existing `@typescript-eslint/no-explicit-any` errors and unused-import warnings** across admin forms (`AddAssetForm`, `EditAssetForm`, `AssetIntelligenceCard`, `DashboardSearch`, `ServiceReminder`, `SyncFleetButton`), API routes (`sync-dvla`, `cars`, `trips`, `webhooks/clerk`, `cron/sync-dvla`), `Hyperspeed.tsx`, and a couple of scripts. Mostly `catch (err: any)` blocks and loosely-typed Supabase query results. None of these are live bugs — `tsc --noEmit` and the production build are both clean — but a real cleanup pass would need to touch ~20 files. Run `npm run lint` for the full current list.

## Verification gaps (things fixed but never confirmed end-to-end)
- **Manual auth-fix verification never run.** The broken-access-control fixes on the admin API routes were unit-tested at the logic level, but nobody has hit them as a real non-admin authenticated account to confirm they 403 in practice — needs real Clerk test accounts I don't have credentials for.
- **Role toggle mutation itself never exercised.** `RoleToggle`'s UI was confirmed rendering correctly on a real user (Vlad Apostol), but actually clicking "Grant/Revoke Admin Access" against production data was deliberately not done (not requested, and it's a real, consequential mutation on a live user's account) — so the `app/api/admin/users/[id]/role/route.ts` write path itself is still only logic-verified, not click-tested. This also covers `UserRowActions.tsx`'s identical Promote/Revoke button on the `/admin/users` table row.
- **User removal (`DELETE /api/admin/users/[id]`) never exercised against a real account.** Build/type/lint-verified only — deleting a real Clerk user and `profiles` row is a permanent, consequential mutation, so it hasn't been click-tested against production data (not requested, and there's no disposable test account to use).
- **`/admin/dashboard`** — confirmed live: fleet status renders (20 assets, 16 alerts), `DashboardSearch` correctly filtered "mclaren" → 3 matching assets (including the fuzzy "Mercedes-Benz SLR McLaren" match) ✅
- **`/admin/trips`** — confirmed live: `/api/admin/trips` route returns real trip records (asset, driver, distance, date) correctly — this directly confirms the RLS-blocked-query bug fix actually works in production, not just in logic. Only 7 trips exist total so true multi-page pagination (>10 rows) wasn't exercised, but the core fix (the route returning data at all) is verified. ✅
- **Landing page `/`** — Hyperspeed WebGL scene renders correctly with the "UNLOCK VAULT" CTA, zero console errors on load (confirms the `next/dynamic` lazy-load and reduced-motion/visibility-check additions didn't break anything) ✅
- **Still not browser-checked:** `loading.tsx` skeletons actually appearing during navigation (hard to catch manually on a fast Vercel edge deploy — would need network throttling), the sign-up page's Clerk theming, and actually toggling `prefers-reduced-motion`/backgrounding the tab to watch Hyperspeed's rAF loop pause (code-reviewed and logically correct, not instrumented-and-watched live).
