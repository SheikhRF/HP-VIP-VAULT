import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { clerkClient } from "@clerk/nextjs/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET_KEY;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireAdmin();
  if (!check.ok) return check.response;

  const { id } = await params;
  const { role } = await req.json().catch(() => ({}));

  if (role !== "admin" && role !== "driver" && role !== "user") {
    return NextResponse.json({ ok: false, error: "Role must be 'admin', 'driver', or 'user'." }, { status: 400 });
  }

  if (id === check.userId && role !== "admin") {
    return NextResponse.json({ ok: false, error: "You can't change your own admin role." }, { status: 400 });
  }

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(id, { publicMetadata: { role } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Clerk update failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }

  // Also update Supabase directly so the change is reflected immediately,
  // rather than waiting on the Clerk -> webhook -> profiles round-trip.
  const supabase = createClient(supabaseUrl!, supabaseSecret!);
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, role });
}
