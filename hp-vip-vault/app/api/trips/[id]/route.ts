import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { isAdminClaims, isDriverOrAdminClaims } from "@/lib/auth/requireAdmin";
import { validateTripBody } from "@/lib/trips/validateTrip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecret) {
  throw new Error("Missing Supabase configuration environment variables");
}

const supabase = createClient(supabaseUrl, supabaseSecret);

// Ownership rule: the trip's own driver may edit/delete it, but only while
// currently a driver (or admin) — a user demoted back to plain "user" loses
// edit rights on their own old trips too. Any admin can act regardless of
// ownership.
async function canMutateTrip(tripUserId: string) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return { ok: false as const, response: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  }
  const isOwner = tripUserId === userId && isDriverOrAdminClaims(sessionClaims);
  if (!isOwner && !isAdminClaims(sessionClaims)) {
    return { ok: false as const, response: NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true as const };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: trip, error: fetchError } = await supabase
    .from("trips")
    .select("*")
    .eq("trip_id", id)
    .single();

  if (fetchError || !trip) {
    return NextResponse.json({ ok: false, error: "Trip not found" }, { status: 404 });
  }

  const check = await canMutateTrip(trip.user_id);
  if (!check.ok) return check.response;

  const body = await req.json();
  const result = validateTripBody(body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("trips")
    .update(result.row)
    .eq("trip_id", id);

  if (updateError) {
    return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 });
  }

  // MILEAGE SYNC PROTOCOL (same forward-only sync as POST /api/trips) —
  // bumps the car's peak mileage if this edit raises it. Intentionally does
  // NOT recompute the peak downward if this edit lowers it; that's a
  // pre-existing gap (the add flow has never had reverse-sync either).
  const { data: carData } = await supabase
    .from("cars")
    .select("mileage")
    .eq("car_id", result.row.car_id)
    .single();

  const currentCarMileage = carData?.mileage ? parseInt(carData.mileage) : 0;
  if (result.row.mileage_after > currentCarMileage) {
    await supabase
      .from("cars")
      .update({ mileage: result.row.mileage_after })
      .eq("car_id", result.row.car_id);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: trip, error: fetchError } = await supabase
    .from("trips")
    .select("user_id")
    .eq("trip_id", id)
    .single();

  if (fetchError || !trip) {
    return NextResponse.json({ ok: false, error: "Trip not found" }, { status: 404 });
  }

  const check = await canMutateTrip(trip.user_id);
  if (!check.ok) return check.response;

  const { error: deleteError } = await supabase.from("trips").delete().eq("trip_id", id);

  if (deleteError) {
    return NextResponse.json({ ok: false, error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
