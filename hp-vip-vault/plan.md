# Fix: SORN vehicles should not count as "driveable" / tax-valid

## Context

In an earlier session the three independently-implemented "needs attention / driveable" checks were unified into one shared `lib/cars/status.ts`, with one judgment call flagged explicitly as a product decision: whether a SORN'd (off-road, untaxed) car should count as tax-compliant. The default was to treat SORN as acceptable. The user has now confirmed: SORN should **not** count as driveable — a SORN'd car is off the road and should be flagged, not treated as fine.

Because the logic is already centralized in one module, this is a one-line fix with no call-site changes needed — `app/admin/dashboard/page.tsx`, `AssetIntelligenceCard.tsx`, and `DashboardSearch.tsx` all already import from `lib/cars/status.ts` and will pick up the corrected behavior automatically.

## Change

In `lib/cars/status.ts`, `isTaxValid`:
```ts
// Before
export function isTaxValid(car: CarComplianceFields): boolean {
  return car.tax_status === "Taxed" || car.tax_status === "SORN";
}

// After
export function isTaxValid(car: CarComplianceFields): boolean {
  return car.tax_status === "Taxed";
}
```

No other source file needs to change — `needsAttention`/`isDriveable` and all three call sites are unaffected mechanically; their displayed counts/badges will simply now correctly include SORN'd cars as "needs attention" / not driveable.

## Test update

`scripts/test-car-status-logic.ts` currently asserts the opposite of the new intent and must be updated to match:
- `check("Tax SORN is valid", isTaxValid({ mot: null, tax_status: "SORN", service_date: null }) === true);` → flip to assert `false` (rename to "Tax SORN is invalid").
- `compliantCar` currently uses `tax_status: "SORN"` to assert `needsAttention(...) === false` — change it to `tax_status: "Taxed"` so the "fully compliant" fixture is actually fully compliant.
- Add a new case: a car with `tax_status: "SORN"` (good MOT, no overdue service) asserts `needsAttention(...) === true`, to directly lock in the corrected behavior.

## Verification

1. `npx tsc --noEmit` — confirm no type errors.
2. `npx tsx scripts/test-car-status-logic.ts` — confirm the updated/new cases pass.
3. Re-run `npx tsx scripts/test-admin-claims.ts` and `npx tsx scripts/test-dvla-sync-logic.ts` as a sanity check that nothing else was touched.

---

# Known problems backlog (not yet fixed)

Everything below was identified during earlier audit/design-review passes on this repo but is **not yet implemented**. Captured here so it isn't lost, roughly in priority order.

## Verification gaps (things we fixed but never confirmed end-to-end)
- **Manual auth-fix verification never run.** The broken-access-control fixes on `/api/admin/update-car`, `/api/admin/sync-dvla`, `/api/cars` (POST), `/api/dvla`, `/api/cars/details`, `/api/cars/trims` were unit-tested at the logic level (`requireAdmin()`'s pure predicate), but nobody has hit these routes as a real non-admin authenticated account to confirm they actually 403 in practice, and as a real admin account to confirm they still work.
- **`eslint` has never successfully run this session** (blocked by the sandbox's auto-mode classifier each time it was attempted) — a real lint pass is still outstanding.
- **Visual check of the `next/image` gallery migration.** The car-detail photo gallery now renders in fixed-width tiles instead of each photo sizing to its own aspect ratio (a necessary trade-off for the `fill` layout) — never visually confirmed in a browser.
- **Visual check of the admin error-banner wiring** (`EditAssetForm`, `ServiceReminder`, `SyncFleetButton`, `AddAssetForm`) and `ServiceReminder`'s switch from `window.location.reload()` to `router.refresh()` — logic was reasoned through but not click-tested.

## Deployment / config
- **`CRON_SECRET` and `DVLA_SYNC_CONCURRENCY` are not yet set in Vercel's project settings.** Without `CRON_SECRET`, the weekly DVLA sync cron route will 401 on every scheduled invocation.
- **Vercel plan tier / cron limits unconfirmed.** Never checked whether the account's actual Vercel plan supports the `maxDuration = 60` set on the sync routes, or has any cron-frequency restrictions.
- **Real DVLA per-second rate limit is unknown.** `DVLA_SYNC_CONCURRENCY` defaults to 4 as a reasonable guess, not a confirmed-safe value for this account's actual DVLA API plan.

## Known product/UX gaps (from the design review, explicitly deferred)
- **"Manage Members" is a dead end.** The admin hub advertises member management, but neither the users list nor a user's detail page expose any role-change/deactivate action, and the users table has a non-functional "⋯" actions button with no handler.
- **No pagination or search on the admin users list** — every profile renders unbounded, unlike the cars list.
- **Contact form doesn't actually do anything.** Its server action only `console.log`s the submission — no persistence, no email, no success feedback shown to the user.
- **`app/api/trips/route.ts` doesn't validate that `car_id` exists** before using it to update `cars.mileage` — not an authz bug (trips are correctly owner-scoped), but a missing existence check.

## Smaller tech debt noted but not addressed
- **Env var naming split:** the Supabase service-role key is read as `SUPABASE_SECRET_KEY` in most files but `SUPABASE_SERVICE_ROLE_KEY` in `app/admin/trips/[id]/page.tsx` and `app/admin/users/page.tsx`. Both are currently set, but this is a footgun if one is ever rotated alone.
- **`lib/supabaseServer.ts` is unused dead code** (wraps the anon key, adds nothing over `lib/supabaseClient.ts`).
- **`SUPABASE_BUCKET_NAME` env var is defined but never read** — the bucket name `"car-images"` is hardcoded everywhere it's needed instead.
- **Supabase RLS policies have never been inspected from this session** — every server route relies on the service-role key bypassing RLS plus app-level `requireAdmin()` checks; there's no confirmed defense-in-depth at the database layer.
