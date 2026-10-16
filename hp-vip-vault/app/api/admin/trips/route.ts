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

  const { searchParams } = new URL(req.url);
  const offset = Number(searchParams.get("offset")) || 0;
  const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);

  const supabase = createClient(supabaseUrl!, supabaseSecret!);

  const { data: rawTrips, error } = await supabase
    .from("trips")
    .select("*")
    .order("start_date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const trips = rawTrips ?? [];
  const carIds = Array.from(new Set(trips.map((t) => t.car_id)));
  const userIds = Array.from(new Set(trips.map((t) => t.user_id)));

  const [{ data: cars }, { data: profiles }] = await Promise.all([
    carIds.length
      ? supabase.from("cars").select("car_id, make, model, registration").in("car_id", carIds)
      : Promise.resolve({ data: [] as any[] }),
    userIds.length
      ? supabase.from("profiles").select("id, name").in("id", userIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const formatted = trips.map((trip) => {
    const car = cars?.find((c) => c.car_id === trip.car_id);
    const user = profiles?.find((p) => p.id === trip.user_id);
    return {
      ...trip,
      car_name: car ? `${car.make} ${car.model}` : "Asset Deleted",
      car_plate: car?.registration || "N/A",
      user_name: user?.name || "Unknown Driver",
    };
  });

  return NextResponse.json({ ok: true, trips: formatted });
}
