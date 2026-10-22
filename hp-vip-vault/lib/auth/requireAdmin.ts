import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// NOTE: these are not "the same claim, inconsistently cased." They're two
// distinct claims. Lowercase `role` is a Supabase-managed claim fixed to
// "authenticated" by Clerk's Supabase integration — it will never be "admin".
// Capital `Role` is this app's real role, mapped from `public_metadata.role`
// via the session token customization in the Clerk dashboard. The `role`
// check below is permanently a no-op; it's kept only so this function still
// behaves correctly if that Clerk/Supabase integration is ever removed and
// `role` becomes available for app use again.
export function isAdminClaims(sessionClaims: Record<string, unknown> | null | undefined) {
  return sessionClaims?.role === "admin" || sessionClaims?.Role === "admin";
}

export async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return { ok: false as const, response: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  }
  if (!isAdminClaims(sessionClaims)) {
    return { ok: false as const, response: NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true as const, userId };
}

// Same two-claim caveat as isAdminClaims above: `role` is permanently
// "authenticated" (Supabase-managed, never "driver"/"admin"); `Role` is the
// real app role. Admins count as drivers here since they can access every
// page, including trip logging/editing.
export function isDriverOrAdminClaims(sessionClaims: Record<string, unknown> | null | undefined) {
  return (
    sessionClaims?.role === "driver" ||
    sessionClaims?.Role === "driver" ||
    isAdminClaims(sessionClaims)
  );
}

export async function requireDriverOrAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return { ok: false as const, response: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  }
  if (!isDriverOrAdminClaims(sessionClaims)) {
    return { ok: false as const, response: NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true as const, userId };
}
