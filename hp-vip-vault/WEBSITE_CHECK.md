# Live website check — 2026-10-26

Scope: HTTP-level check of the deployed production site (`https://hp-vip-vault.vercel.app`) plus a local `next dev` run of the current branch, both as an unauthenticated visitor (no Clerk session). Checked main public/protected routes with `curl`; cross-referenced against `proxy.ts` and `app/layout.tsx`.

## Critical — confirmed live in production

### 1. Signed-out visitors get a bare 404 on protected pages instead of a sign-in prompt
`GET https://hp-vip-vault.vercel.app/home` (and `/about`, `/cars`, `/cars/[id]`) returns **404 Not Found** for a signed-out visitor, not the expected redirect to `/sign-in`.

Response headers confirm the cause:
```
X-Clerk-Auth-Reason: protect-rewrite, dev-browser-missing
X-Clerk-Auth-Status: signed-out
X-Matched-Path: /_not-found
```
`auth.protect()` (`proxy.ts:68`) is silently rewriting to Next's `_not-found` page instead of redirecting, because Clerk's **Development-instance** dev-browser JWT handshake (`dev-browser-missing`) fails on a first-touch/server-rendered request — there's no prior client-side bootstrap to have set it. This is the live, concrete consequence of the already-known "Clerk is on a Development instance (`pk_test_...`) while serving production traffic" risk (documented in `CLAUDE.md`): it isn't just a latent config smell, it's actively breaking the experience for every signed-out visitor who lands directly on one of these pages — a shared link, a bookmark, a search-engine crawl, or just typing the URL. They see "page not found," not an invitation to log in.

### 2. Signed-out visitors get a raw 500 on admin/driver-gated pages
`GET https://hp-vip-vault.vercel.app/admin`, `/admin/dashboard`, `/trips`, `/trips/add`, `/cars/add` all return **500 Internal Server Error** for a signed-out visitor (body: plain `Internal Server Error`, no stack leak — that part is fine).

Same root cause as #1, different failure mode: `proxy.ts`'s admin/driver branches (lines 32–52) call `await auth()` directly to read `sessionClaims`, rather than Clerk's `auth.protect()` helper used elsewhere. Under the same `dev-browser-missing` condition, that direct `auth()` call appears to throw instead of resolving to empty claims, so the middleware itself crashes with an unhandled exception instead of reaching its own `Response.redirect('/home')` fallback.

**Net effect of #1 + #2:** right now, in production, nobody can land directly (signed out) on *any* of this app's real pages except `/`, `/sign-in`, and `/sign-up` without hitting a 404 or 500. The fix is almost certainly the already-tracked infra task — promote Clerk to a Production instance — rather than a code change; worth escalating its priority given this confirms real, present breakage rather than a theoretical gap.

## Critical — confirmed live in production, now fixed

### 0. Landing page crashes to the error boundary when WebGL is unavailable
Visiting `https://hp-vip-vault.vercel.app/` in a browser/environment where a WebGL context can't be created (GPU disabled, sandboxed, software-rendering-only, etc.) shows the full "UPLINK INTERRUPTED" error-boundary screen instead of the landing page — not just a missing background, the entire page fails to render.

Confirmed via browser console:
```
THREE.WebGLRenderer: A WebGL context could not be created. Reason: Could not create a WebGL context, ...
Route render error: Error: Error creating WebGL context.
    at new App (.../Hyperspeed.tsx ...)
```
Root cause: `components/Hyperspeed.tsx`'s `useEffect` calls `new App(container, options)` (which constructs `new THREE.WebGLRenderer(...)`) with no `try/catch`. The component already has a graceful fallback path for `prefers-reduced-motion` (a static gradient `<div>`), but nothing caught an outright WebGL failure — that exception propagates up and trips the nearest error boundary (`app/error.tsx`), taking down the whole page instead of just the background.

**Fixed:** wrapped the `new App(...)` construction and the `loadAssets().then(init)` chain in `try/catch`/`.catch()`, and on failure fall back to the same static gradient already used for the reduced-motion case (`components/Hyperspeed.tsx`). Verified locally: in a browser with WebGL disabled, the page now renders the gradient fallback cleanly with no crash, no error boundary, and a single clear `console.error` instead of an uncaught exception.

## Medium — local dev only, not reproduced in production

### 3. `/sign-in` and `/sign-up` crash in local `next dev` (Turbopack)
Running the app locally (`next dev --turbopack`, Next 16.2.1) and hitting `/sign-in` or `/sign-up` as a signed-out visitor returns 500 every time, with this server-side error:
```
Error: @clerk/clerk-react: You've passed multiple children components to <SignUpButton/>.
You can only pass a single child component or text.
```
Traced to `app/layout.tsx:40-44` — a leftover `create-next-app`/Clerk-starter boilerplate header in the **root layout** (rendered above every real page's own `Navbar`):
```tsx
<SignUpButton>
  <button className="text-ceramic-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
    Sign Up
  </button>
</SignUpButton>
```
Confirmed **not** reproduced on the live production build — `/sign-in`/`/sign-up` both return 200 there (production build output apparently doesn't hit the same code path, or the pre-built/minified bundle sidesteps whatever triggers it under Turbopack dev). Still worth fixing since it currently blocks anyone from locally testing the sign-in/sign-up flow in dev.

### 4. The same dead boilerplate header is live on every page, unbranded
Independent of the crash above: `app/layout.tsx`'s header (`SignInButton`/`SignUpButton`/`UserButton`, lines 37-49) renders on **every** route, including the real homepage — confirmed by fetching `/` and finding two separate "Sign Up" occurrences in the HTML (the real on-brand CTA plus this bare, unstyled one). It doesn't use any of the app's `vault`/`vault-ghost` button primitives or orange/dark theme — it's plain unstyled text, sitting above the real `Navbar` component that every page already renders its own sign-in/sign-up/account UI through. This looks like dead scaffold code nobody removed after building the real `Navbar`, not an intentional second header.

**Suggested fix for #3/#4 together:** delete the header block in `app/layout.tsx` (lines 37-49) and its now-unused `SignInButton`/`SignUpButton`/`SignedIn`/`SignedOut`/`UserButton` imports — every page already has its own `Navbar` handling signed-in/out UI. This removes the crash and the stray duplicate UI in one fix.

## Low / noise
- Local dev log repeatedly printed `TypeError: immutable` (frames ignore-listed, no usable stack) around the same requests that returned 500 on protected routes — most likely the same Next.js 16 "readonly headers/cookies in middleware" mechanism surfacing differently under Turbopack dev than in the production runtime; not independently actionable beyond fixing #1/#2's root cause.
- Both the local dev server and production 500 bodies are plain text with no stack trace or internal detail leaked — good, no information-disclosure concern there.

## Not checked
No Clerk session was available to this check, so authenticated flows (actually logging in, viewing `/admin/users`, uploading a car photo, logging a trip, etc.) were not exercised — this was strictly an unauthenticated, HTTP-level pass. A real browser-driven pass while signed in (the kind already documented in `plan.md`'s prior audits) would be the natural follow-up.
