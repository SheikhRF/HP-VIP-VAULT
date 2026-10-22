import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET_KEY;

export async function GET(req: Request) {
  const check = await requireAdmin();
  if (!check.ok) return check.response;

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error_description") ?? url.searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      `${url.origin}/admin/dashboard?instagram_error=${encodeURIComponent(oauthError)}`
    );
  }
  if (!code) {
    return NextResponse.redirect(
      `${url.origin}/admin/dashboard?instagram_error=${encodeURIComponent("Missing authorization code")}`
    );
  }

  try {
    const redirectUri = `${url.origin}/api/admin/instagram-oauth/callback`;

    const shortLivedForm = new URLSearchParams({
      client_id: process.env.INSTAGRAM_APP_ID!,
      client_secret: process.env.INSTAGRAM_APP_SECRET!,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    });

    const shortLivedRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      body: shortLivedForm,
    });

    if (!shortLivedRes.ok) {
      throw new Error(`Short-lived token exchange failed (${shortLivedRes.status})`);
    }

    const shortLived = (await shortLivedRes.json()) as { access_token: string; user_id: string };

    const longLivedUrl = new URL("https://graph.instagram.com/access_token");
    longLivedUrl.searchParams.set("grant_type", "ig_exchange_token");
    longLivedUrl.searchParams.set("client_secret", process.env.INSTAGRAM_APP_SECRET!);
    longLivedUrl.searchParams.set("access_token", shortLived.access_token);

    const longLivedRes = await fetch(longLivedUrl.toString());
    if (!longLivedRes.ok) {
      throw new Error(`Long-lived token exchange failed (${longLivedRes.status})`);
    }

    const longLived = (await longLivedRes.json()) as { access_token: string; expires_in: number };
    const expiresAt = new Date(Date.now() + longLived.expires_in * 1000).toISOString();

    const supabase = createClient(supabaseUrl!, supabaseSecret!);
    const { error } = await supabase.from("instagram_token").upsert({
      id: 1,
      access_token: longLived.access_token,
      ig_user_id: String(shortLived.user_id),
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    return NextResponse.redirect(`${url.origin}/admin/dashboard?instagram_connected=1`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Instagram connection failed";
    return NextResponse.redirect(
      `${url.origin}/admin/dashboard?instagram_error=${encodeURIComponent(message)}`
    );
  }
}
