import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { clerkClient } from "@clerk/nextjs/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET_KEY;

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireAdmin();
  if (!check.ok) return check.response;

  const { id } = await params;

  if (id === check.userId) {
    return NextResponse.json({ ok: false, error: "You can't remove your own account." }, { status: 400 });
  }

  try {
    const client = await clerkClient();
    await client.users.deleteUser(id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Clerk user deletion failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }

  // Clerk's own user.deleted webhook will also try to remove the profiles row,
  // but we don't wait on that round-trip - delete it here so the UI reflects
  // the change immediately, same reasoning as the role route.
  const supabase = createClient(supabaseUrl!, supabaseSecret!);
  const { error } = await supabase.from("profiles").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
