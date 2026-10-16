# History

## ✅ Done: SORN vehicles no longer count as "driveable" / tax-valid

`lib/cars/status.ts#isTaxValid` now only accepts `"Taxed"` (SORN removed). `scripts/test-car-status-logic.ts` updated to match and lock in the corrected behavior. No call sites needed changes since the logic was already centralized.

## ✅ Done: infrastructure recon (Supabase / Vercel / Clerk)

A Claude in Chrome session was run against the real Supabase, Vercel, and Clerk dashboards (read-only) and reported back in the "Horsepower.VIP Vault — Infrastructure Recon" Claude Doc (`https://claude.ai/artifact/11ajhySQvngjposMxqvjm7`). The real schema, RLS policies, Vercel env/cron state, and Clerk session-claim configuration are now documented in `CLAUDE.md` instead of being inferred. Headline findings and what was done about each:

1. **`CRON_SECRET`/`DVLA_SYNC_CONCURRENCY` not set in Vercel** — infra-only, still outstanding, see backlog below.
2. **`cars` RLS policy only covers `anon`, not `authenticated`** — confirmed harmless today (grepped the codebase: nothing attaches a Clerk JWT to a Supabase request anywhere), but documented in `CLAUDE.md` as a latent trap for future client-side Supabase code.
3. **`trips` has RLS enabled with zero policies** — this one was live. `components/admin/trip-list.tsx`'s "Show More Deployments" pagination queried `trips` directly with the anon key and would silently return nothing once trip count passed 10. **Fixed:** added `app/api/admin/trips/route.ts` (admin-gated via `requireAdmin()`, service-role key) and switched `trip-list.tsx` to call it instead.
4. **`role`/`Role` session-claim "casing inconsistency" was never actually a casing bug** — confirmed from the Clerk dashboard: `role` is a Supabase-managed claim permanently fixed to `"authenticated"`, unrelated to app roles; `Role` is the real one. The existing dual-check in `requireAdmin()`/`proxy.ts` still works (by coincidence of the `Role` half always catching it), so no behavior change was needed — but the misleading "historical casing bug" comments were corrected in `lib/auth/requireAdmin.ts`, `proxy.ts`, and `CLAUDE.md` to explain the real mechanism.
5. **Clerk is on the Development instance while serving production traffic on Vercel** — infra-only, still outstanding, see backlog below.

## ✅ Done: approved npm install-scripts for esbuild/sharp/unrs-resolver/@clerk/shared

A Vercel build log showed `npm warn install-scripts` for these four packages (npm 11's new advisory allowScripts feature; npm 12 will block unreviewed scripts by default). All four are legitimate — `sharp` backs Next.js's image optimizer, `esbuild`/`unrs-resolver` need native binaries, `@clerk/shared`'s postinstall is standard. Approved via `npm approve-scripts`, recorded in `package.json`'s new `allowScripts` field.

## 🚧 In progress: public-pages motion/performance roadmap

Full roadmap (context, confirmed baseline, phase-by-phase plan) lives in this session's plan-mode history; summarized here for persistence. Goal: make the non-admin pages (`/`, `/home`, `/cars`, `/cars/[car_id]`, `/about`, `/contact`) feel more dynamic and fast without a new motion library — `tw-animate-css` is already installed and unused, stay CSS-only.

**✅ Phase 1 — correctness & perceived-speed fixes — DONE:**
- Parallelized the car-detail page's two sequential Supabase fetches (`app/cars/[car_id]/page.tsx`) via `Promise.all` — was a real latency bug, not a design choice.
- Added `loading.tsx` skeletons for `/home`, `/cars`, `/cars/[car_id]`, each shaped to match its real content's bounding boxes (new `components/CarCardSkeleton.tsx` shared shape) so there's no layout jump when real content swaps in.
- Hardened `components/Hyperspeed.tsx`: added a `prefers-reduced-motion` check that skips mounting the WebGL scene entirely (renders a static CSS gradient instead), added a `visibilitychange` listener that pauses/resumes the render loop when the tab is backgrounded (was previously running forever, even off-screen), and wrapped the import in `next/dynamic(..., { ssr: false })` in `app/page.tsx` with a lightweight CSS placeholder so the CTA paints before the WebGL scene initializes.
- Verified: `tsc --noEmit` clean, full `npm run build` succeeds, all 3 regression scripts pass.
- **Not yet done:** visually confirmed in a browser (reduced-motion toggle, tab-backgrounding, and the new skeletons' appearance) — flagged under "Verification gaps" below.

**⏳ Phase 2 — extend `CarCard`/`navbar`'s existing hover/reveal language to flat pages** (`about`, `contact`, `home`, `cars`/`PublicFleet`) — not started.

**⏳ Phase 3 — car-detail photo gallery upgrade** (hover zoom + indicator dots + click-to-lightbox, new `components/CarGallery.tsx`/`GalleryDots.tsx`/`Lightbox.tsx`) — not started, deliberately last since it borrows Phase 2's conventions.

**Also planned alongside Phases 2-3:** a shared `blurDataURL` placeholder constant for `next/image` (`CarCard`, the future `CarGallery`) — not started.

---

# Known problems backlog (not yet fixed)

Roughly in priority order. Items resolved by the infra recon above have been removed from this list; this reflects current state.

## Infra-only — can't be fixed by changing code, needs manual action in a dashboard
- **Set `CRON_SECRET` and `DVLA_SYNC_CONCURRENCY` in Vercel's Production environment variables.** Confirmed via recon: neither is set today. The weekly DVLA sync cron (`/api/cron/sync-dvla`, registered and scheduled correctly in Vercel) will 401 on every run until this is done.
- **Clerk is a Development instance (`pk_test_...`) serving real production traffic.** Worth deciding whether/when to promote to a Production Clerk instance.
- **`cars`/`profiles` RLS policies and the public `car-images` bucket's lack of size/MIME limits** could be hardened in Supabase directly, though confirmed not to be actively exploited by any current code path.

## Verification gaps (things fixed but never confirmed end-to-end)
- **Manual auth-fix verification never run.** The broken-access-control fixes on `/api/admin/update-car`, `/api/admin/sync-dvla`, `/api/cars` (POST), `/api/dvla`, `/api/cars/details`, `/api/cars/trims` were unit-tested at the logic level, but nobody has hit these routes as a real non-admin authenticated account to confirm they actually 403 in practice.
- **`eslint` has never successfully run this session** (blocked by the sandbox's auto-mode classifier every time it was attempted) — a real lint pass is still outstanding.
- **Visual check of the `next/image` gallery migration** on the car detail page (fixed-width tiles instead of each photo's native aspect ratio) — never visually confirmed in a browser.
- **Visual check of the admin error-banner wiring** (`EditAssetForm`, `ServiceReminder`, `SyncFleetButton`, `AddAssetForm`) and the new `/api/admin/trips` pagination fix — reasoned through and type-checked, not click-tested in a browser.
- **Visual check of the Phase 1 motion/perf fixes** — the new `loading.tsx` skeletons, Hyperspeed's `prefers-reduced-motion` fallback and tab-backgrounded pause, and the `next/dynamic` CTA-paints-first behavior — all type-check and build cleanly but haven't been exercised in an actual browser yet.

## Known product/UX gaps (from the design review, explicitly deferred)
- **"Manage Members" is a dead end.** The admin hub advertises member management, but neither the users list nor a user's detail page expose any role-change/deactivate action, and the users table has a non-functional "⋯" actions button with no handler.
- **No pagination or search on the admin users list** — every profile renders unbounded, unlike the cars list. (Not urgent yet — confirmed real scale is only 22 profiles.)
- **Contact form doesn't actually do anything.** Its server action only `console.log`s the submission — no persistence, no email, no success feedback shown to the user.

## Smaller tech debt noted but not addressed
- **Env var naming split:** the Supabase service-role key is read as `SUPABASE_SECRET_KEY` in most files but `SUPABASE_SERVICE_ROLE_KEY` in `app/admin/trips/[id]/page.tsx` and `app/admin/users/page.tsx`. Both are currently set, but this is a footgun if one is ever rotated alone.
- **`lib/supabaseServer.ts` is unused dead code** (wraps the anon key, adds nothing over `lib/supabaseClient.ts`).
- **`SUPABASE_BUCKET_NAME` env var is defined but never read** — the bucket name `"car-images"` is hardcoded everywhere it's needed instead.
