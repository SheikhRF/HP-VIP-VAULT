import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { syncInstagramFeed } from "@/lib/instagram/syncFeed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET_KEY;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseSecret!);
    const { synced } = await syncInstagramFeed(supabase);
    return NextResponse.json({ ok: true, synced });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
