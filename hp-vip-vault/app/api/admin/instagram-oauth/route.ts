import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const check = await requireAdmin();
  if (!check.ok) return check.response;

  const redirectUri = `${new URL(req.url).origin}/api/admin/instagram-oauth/callback`;
  const authorizeUrl = new URL("https://www.instagram.com/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", process.env.INSTAGRAM_APP_ID!);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "instagram_business_basic");

  return NextResponse.redirect(authorizeUrl.toString());
}
