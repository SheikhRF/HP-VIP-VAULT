# Project Review — Horsepower.VIP Vault

Date: 2026-10-26
Scope: full repo at `hp-vip-vault/` — architecture docs (`CLAUDE.md`, `README.md`, `plan.md`), and source code (`app/`, `lib/`, `components/`, `proxy.ts`, `scripts/`).

This review draws on the project's own documentation (which is unusually thorough and already tracks most of its known gaps) plus a direct code-level pass over auth, API routes, and security-sensitive paths.

---

## Good points

**Process & documentation**
- `CLAUDE.md` and `plan.md` are exceptionally well maintained — they record *confirmed, verified* facts (schema, RLS policies, Clerk claim behavior) rather than assumptions, and explicitly flag what's inferred vs. checked against the real dashboards. This is rare and valuable: a future contributor (human or AI) can trust these docs over re-deriving everything from scratch.
- `plan.md` keeps an honest running log of root-causes, fixes, and — importantly — a "Verification gaps" section listing things that were *fixed but never click-tested* against production. That's a mature practice that most projects skip.
- Real production bugs were root-caused properly rather than patched around (e.g. the `/cars/[car_id]` crash was traced to a function prop crossing the Server/Client Component boundary, not just wrapped in a try/catch).

**Auth & authorization**
- `lib/auth/requireAdmin.ts` is correct: pure predicate functions, no implicit "undefined claims = admin" bypass, 401-before-403 ordering (doesn't leak role state to unauthenticated callers), and the confusing `role` vs. `Role` Clerk-claim distinction is documented in code comments, not just in `CLAUDE.md`.
- `canMutateTrip` (`app/api/trips/[id]/route.ts`) correctly implements "owner while still driver/admin, or any admin" — matches the documented demotion-revokes-access model.
- Every admin-sensitive route reviewed (`mass-induct/parse`, `update-car`, `users/[id]/role`, `users/[id]`, cron routes) is actually gated server-side via `requireAdmin()`/`requireDriverOrAdmin()`/a `CRON_SECRET` bearer check — not just gated by middleware, which can be bypassed for API routes.
- Self-removal is explicitly blocked on the user-deletion endpoint.
- Role values are validated against an exact allowlist before being written anywhere.

**Data access & external APIs**
- All database access goes through the Supabase client with parameterized filters — no raw SQL/string concatenation anywhere; no SQL-injection surface found.
- Clerk webhook signature verification (Svix) is actually implemented, not just asserted — all three headers checked, verification failures return 400 without leaking details.
- DVLA sync has real resilience engineering: bounded concurrency, retry/backoff limited to 429/502, one car's failure doesn't abort the fleet sync — and it's unit-tested (`scripts/test-dvla-sync-logic.ts`).
- The AI-assisted car-induction endpoint (`mass-induct/parse`) is admin-gated, clips input to 8000 chars before sending to the model, and forces structured tool-call output instead of parsing free-text JSON — a sound pattern for constraining LLM output.

**Code hygiene**
- No hardcoded secrets, no `eval()`, no `dangerouslySetInnerHTML`, no secret values in logs anywhere in the codebase (verified by grep across `app/`, `lib/`, `components/`, `scripts/`).
- `npm run lint` and `tsc --noEmit` are both clean of new issues; a documented ~45-issue `no-explicit-any`/unused-import backlog was already cleaned up in a prior session.
- Centralized logic (car compliance status, DVLA retry, admin/driver claim checks) is deliberately shared rather than duplicated — and the duplication problem (three different reimplementations of "needs attention") was caught and fixed.
- `package.json` dependency versions are current for the stack (Next 16, React 19, Clerk 6.36); `allowScripts` is an explicit allowlist rather than blanket-trusting all postinstall scripts.

---

## Problems, ranked by severity

### High
1. **No file size/MIME validation on car photo uploads** — `app/api/admin/update-car/route.ts` and `app/api/cars/route.ts` accept uploads into the public `car-images` Supabase bucket with no size cap and no content-type check. Since the bucket is public, a wrong-typed or oversized file is directly web-accessible once uploaded. Low likelihood (admin-only today) but no defense-in-depth if an admin session is ever compromised.
2. **Middleware provides no backstop for `/api/admin/*`** — `proxy.ts`'s generic `/api` branch only checks that a user is logged in, not their role. Every *current* admin API route self-checks correctly, but this is a "trust every future developer to remember" pattern with no structural safety net — a new admin route added without calling `requireAdmin()` inside the handler would be silently reachable by any authenticated non-admin.

### Medium
3. **Clerk webhook signs a re-serialized body, not the raw request bytes** (`app/api/webhooks/clerk/route.ts`) — it does `JSON.parse(await req.text())` then `JSON.stringify(payload)` and verifies *that* against the Svix signature, instead of verifying the original raw text. Svix signs exact bytes; re-serialization can diverge on key order/whitespace/unicode escaping. Hasn't caused a visible failure, but it's not the documented-correct pattern (`req.text()` should be passed to `.verify()` unmodified).
4. **No self-demotion guard on the role-change endpoint** (`app/api/admin/users/[id]/role/route.ts`) — self-*removal* is blocked, but an admin can demote their own account via the same endpoint with no check. A compromised session could downgrade the real admin while leaving an attacker-controlled account untouched; at minimum, risks a last-admin lockout.
5. **Trip validation lets invalid numeric input degrade silently instead of rejecting cleanly** (`lib/trips/validateTrip.ts`) — non-numeric `mileage_before`/`mileage_after` pass the initial truthy-check (as a string), then `parseInt` produces `NaN`; the `mileage_after < mileage_before` comparison is always `false` for `NaN`, so invalid data flows to the DB instead of a clean 400 — it then likely fails at the DB check-constraint layer with an opaque 500. `rating` has no 1–5 bounds check; `notes` has no length cap.
6. **AI induction endpoint has no rate limit or per-admin cost cap** (`app/api/admin/mass-induct/parse/route.ts`) — auth-gated, but nothing stops a compromised admin session from running repeated 8000-char Claude API calls. Pure cost-based risk, not a data-exposure one.
7. **Uploaded filenames aren't sanitized beyond whitespace replacement** (`app/api/admin/update-car/route.ts`) — `file.name.replace(/\s+/g, "_")` doesn't strip path-traversal characters before being used as a storage path component; likely caught by Supabase storage itself, but unverified in-code.
8. **`mass-induct/parse/route.ts`'s `req.json()` call has no try/catch** — a non-JSON request body throws unhandled, surfacing a raw 500 instead of a clean 400.

### Low / informational
- Several routes (`trips/route.ts`, `trips/[id]/route.ts`, `update-car/route.ts`) return raw Supabase `error.message` to the client — minor internal-detail leak (could expose table/column names), not directly exploitable.
- `CRON_SECRET` comparison uses plain `!==` rather than a timing-safe compare — theoretical timing side-channel, low real-world exploitability over HTTPS.
- AI-extracted car fields (`make`/`model`/`registration`) have no length/format validation before being returned/stored — degrades safely today (`?? ""` fallbacks) but is a soft spot if the AI pipeline output is ever trusted further downstream.
- `offset`/`limit` query params in `trips/route.ts` aren't explicitly guarded against negative values.
- `lib/supabaseServer.ts` is confirmed-dead code (per `CLAUDE.md`) — candidate for deletion.
- Contact form (`app/contact/actions.ts`) doesn't persist submissions anywhere — `console.log` only, no table or email service wired up.

### Known infrastructure gaps (already tracked in `CLAUDE.md`/`plan.md`, not new findings, but worth restating as outstanding)
- `CRON_SECRET` and `DVLA_SYNC_CONCURRENCY` are not set in Vercel's Production env — the weekly DVLA cron will 401 on every run until set.
- Clerk is running on a **Development** instance (`pk_test_...`) while serving real production traffic — should be promoted to a Production Clerk instance.
- `trips` table has Row-Level Security enabled with **zero policies** (any anon-key request returns empty, not an error) — currently harmless only because no client-side code attaches a Clerk JWT to Supabase, but is a latent trap for any future client-side query.
- `cars`/`profiles` RLS policies are narrow (anon SELECT only / own-row SELECT only) and the public `car-images` bucket has no RLS policies on `storage.objects` at all — relies entirely on service-role-key server routes, not defense-in-depth.
- Instagram integration is mid-setup (no Meta Developer app registered yet) — feed renders a fallback card, not real posts.
- No automated test suite — only four ad-hoc `tsx`-run regression scripts (admin claims, driver claims, DVLA retry logic, car status logic). No tests at all for trip validation, role-change, or file-upload code paths — exactly where today's findings landed.

---

## Suggested priority order
1. Add file size/MIME-type validation on the two upload routes (High, cheap fix).
2. Add a self-demotion guard to the role-change route (Medium, cheap fix, prevents a real lockout scenario).
3. Fix the Clerk webhook to verify the raw request text rather than a re-serialized body (Medium, correctness fix, low effort).
4. Tighten `validateTripBody` to reject non-numeric/out-of-range input with a clean 400 instead of letting `NaN` through (Medium).
5. Set `CRON_SECRET`/`DVLA_SYNC_CONCURRENCY` in Vercel (infra task, already tracked, zero code risk once done).
6. Everything else in Low/informational is fine to batch into a future cleanup pass rather than treated as urgent.
