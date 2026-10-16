# History

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

## Infra-only — needs manual action in a dashboard, can't be fixed by changing code
- **Set `CRON_SECRET` and `DVLA_SYNC_CONCURRENCY` in Vercel's Production environment variables.** Neither is set today. The weekly DVLA sync cron will 401 on every run until this is done.
- **Clerk is a Development instance (`pk_test_...`) serving real production traffic.** Worth deciding whether/when to promote to a Production Clerk instance.
- **`cars`/`profiles` RLS policies and the public `car-images` bucket's lack of size/MIME limits** could be hardened in Supabase directly, though confirmed not actively exploited by any current code path.
- **True contact form persistence** needs a Supabase table (migration/dashboard access) or an email service (API key) — neither exists today.

## Pre-existing lint debt (lower priority, not a bug)
- **~45 pre-existing `@typescript-eslint/no-explicit-any` errors and unused-import warnings** across admin forms (`AddAssetForm`, `EditAssetForm`, `AssetIntelligenceCard`, `DashboardSearch`, `ServiceReminder`, `SyncFleetButton`), API routes (`sync-dvla`, `cars`, `trips`, `webhooks/clerk`, `cron/sync-dvla`), `Hyperspeed.tsx`, and a couple of scripts. Mostly `catch (err: any)` blocks and loosely-typed Supabase query results. None of these are live bugs — `tsc --noEmit` and the production build are both clean — but a real cleanup pass would need to touch ~20 files. Run `npm run lint` for the full current list.

## Verification gaps (things fixed but never confirmed end-to-end)
- **Manual auth-fix verification never run.** The broken-access-control fixes on the admin API routes were unit-tested at the logic level, but nobody has hit them as a real non-admin authenticated account to confirm they 403 in practice — needs real Clerk test accounts I don't have credentials for.
- **Role toggle mutation itself never exercised.** `RoleToggle`'s UI was confirmed rendering correctly on a real user (Vlad Apostol), but actually clicking "Grant/Revoke Admin Access" against production data was deliberately not done (not requested, and it's a real, consequential mutation on a live user's account) — so the `app/api/admin/users/[id]/role/route.ts` write path itself is still only logic-verified, not click-tested.
- **`/admin/dashboard`** — confirmed live: fleet status renders (20 assets, 16 alerts), `DashboardSearch` correctly filtered "mclaren" → 3 matching assets (including the fuzzy "Mercedes-Benz SLR McLaren" match) ✅
- **`/admin/trips`** — confirmed live: `/api/admin/trips` route returns real trip records (asset, driver, distance, date) correctly — this directly confirms the RLS-blocked-query bug fix actually works in production, not just in logic. Only 7 trips exist total so true multi-page pagination (>10 rows) wasn't exercised, but the core fix (the route returning data at all) is verified. ✅
- **Landing page `/`** — Hyperspeed WebGL scene renders correctly with the "UNLOCK VAULT" CTA, zero console errors on load (confirms the `next/dynamic` lazy-load and reduced-motion/visibility-check additions didn't break anything) ✅
- **Still not browser-checked:** `loading.tsx` skeletons actually appearing during navigation (hard to catch manually on a fast Vercel edge deploy — would need network throttling), the sign-up page's Clerk theming, and actually toggling `prefers-reduced-motion`/backgrounding the tab to watch Hyperspeed's rAF loop pause (code-reviewed and logically correct, not instrumented-and-watched live).
