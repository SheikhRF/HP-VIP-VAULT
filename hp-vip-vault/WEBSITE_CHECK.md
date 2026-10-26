# Live website check — 2026-10-26

Scope: HTTP-level check of the deployed production site (`https://hp-vip-vault.vercel.app`) plus a local `next dev` run of the current branch, both as an unauthenticated visitor (no Clerk session). Checked main public/protected routes with `curl`; cross-referenced against `proxy.ts` and `app/layout.tsx`.

## Retracted: findings #1 and #2 below were curl-testing artifacts, not real bugs

**Correction (2026-10-26, same day):** the two "critical" auth findings originally reported here (signed-out visitors getting a 404 or 500 instead of a sign-in redirect) were re-investigated after a user report and turned out to be **false positives caused by plain `curl` requests missing the headers a real browser navigation always sends** (`Accept: text/html...`, `Sec-Fetch-Dest: document`, `Sec-Fetch-Mode: navigate`). Clerk's `auth.protect()` treats a request without those as a "non-document request" and returns 404/handled differently — that's documented Clerk behavior, not a bug.

Re-tested every previously-"broken" route (`/home`, `/about`, `/trips`, `/trips/add`, `/admin`, `/admin/dashboard`, `/cars/add`) on **both production and local dev** with proper browser-navigation headers: every single one now returns a clean **307** to Clerk's dev-instance handshake endpoint (`https://fair-alpaca-74.clerk.accounts.dev/v1/client/handshake?...&__clerk_hs_reason=dev-browser-missing`), which is the correct, working, by-design flow for a Clerk Development instance syncing its dev-browser cookie on a visitor's first touch. A real browser follows that redirect automatically and lands on the sign-in page (or the real page, if already signed in) exactly as intended. **There is no live auth bug here — nothing to fix.** The "Clerk is on a Development instance serving production traffic" item remains a legitimate, already-tracked infra concern (rate limits, branding, etc.), but it is not causing broken redirects for real visitors.

Lesson: don't trust plain `curl -s -o /dev/null -w "%{http_code}"` status codes alone when checking Clerk-gated routes — always add `-H "Sec-Fetch-Dest: document"` (and ideally `Accept`/`User-Agent`) to get the same code path a browser hits, or just check in an actual browser.

<details>
<summary>Original (incorrect) write-up, kept for the record</summary>

### 1. Signed-out visitors get a bare 404 on protected pages instead of a sign-in prompt — **INCORRECT, see retraction above**
`GET https://hp-vip-vault.vercel.app/home` (and `/about`, `/cars`, `/cars/[id]`) returns **404 Not Found** for a signed-out visitor, not the expected redirect to `/sign-in`.

Response headers confirm the cause:
```
X-Clerk-Auth-Reason: protect-rewrite, dev-browser-missing
X-Clerk-Auth-Status: signed-out
X-Matched-Path: /_not-found
```
`auth.protect()` (`proxy.ts:68`) is silently rewriting to Next's `_not-found` page instead of redirecting, because Clerk's **Development-instance** dev-browser JWT handshake (`dev-browser-missing`) fails on a first-touch/server-rendered request — there's no prior client-side bootstrap to have set it.

### 2. Signed-out visitors get a raw 500 on admin/driver-gated pages — **INCORRECT, see retraction above**
`GET https://hp-vip-vault.vercel.app/admin`, `/admin/dashboard`, `/trips`, `/trips/add`, `/cars/add` all return **500 Internal Server Error** for a signed-out visitor (body: plain `Internal Server Error`, no stack leak).

</details>

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
- Local dev log's `TypeError: immutable` (full stack confirmed via the Next dev error overlay: thrown entirely inside `@clerk/nextjs`'s compiled middleware code, no app frames) also turned out to be the same curl-header artifact — it stopped reproducing once the same requests were retried with `Sec-Fetch-Dest: document`. Likely Clerk's SDK hits a Next.js 16 "immutable headers" edge case specifically on the non-document-request code path it takes for a plain curl request; not something a real browser navigation triggers. Not independently actionable.
- Both the local dev server and production 500 bodies (from the retracted findings) were plain text with no stack trace or internal detail leaked — good, no information-disclosure concern there, moot as it turned out.

## Not checked
No Clerk session was available to this check, so authenticated flows (actually logging in, viewing `/admin/users`, uploading a car photo, logging a trip, etc.) were not exercised — this was strictly an unauthenticated, HTTP-level pass. A real browser-driven pass while signed in (the kind already documented in `plan.md`'s prior audits) would be the natural follow-up.
