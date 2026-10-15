import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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
