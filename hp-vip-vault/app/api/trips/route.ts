import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { requireDriverOrAdmin } from "@/lib/auth/requireAdmin";
import { validateTripBody } from "@/lib/trips/validateTrip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Initialize Supabase client with Service Role for bypass permissions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecret) {
  throw new Error("Missing Supabase configuration environment variables");
}

const supabase = createClient(supabaseUrl, supabaseSecret);

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized access" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const offset = Number(searchParams.get("offset")) || 0;
  const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);

  const { data: rawTrips, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", userId)
    .order("start_date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const trips = rawTrips ?? [];
  const carIds = Array.from(new Set(trips.map((t) => t.car_id)));

  type CarLookup = { car_id: number; make: string | null; model: string | null; registration: string | null };

  const { data: cars } = carIds.length
    ? await supabase.from("cars").select("car_id, make, model, registration").in("car_id", carIds)
    : { data: [] as CarLookup[] };

  const formatted = trips.map((trip) => {
    const car = cars?.find((c) => c.car_id === trip.car_id);
    return {
      ...trip,
      car_name: car ? `${car.make} ${car.model}` : "Asset Deleted",
      car_plate: car?.registration || "N/A",
    };
  });

  return NextResponse.json({ ok: true, trips: formatted });
}

export async function POST(req: Request) {
  try {
    // 1. Authenticate the user and require driver/admin to log a trip
    const check = await requireDriverOrAdmin();
    if (!check.ok) return check.response;
    const { userId } = check;

    // 2. Parse and validate the request body
    const body = await req.json();
    const result = validateTripBody(body);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    const row = { ...result.row, user_id: userId };

    // 3. Insert into Supabase 'trips' table
    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .insert(row)
      .select()
      .single();

    if (tripError) {
      console.error("Supabase trip insertion error:", tripError.message);
      return NextResponse.json(
        { ok: false, error: tripError.message },
        { status: 500 }
      );
    }

    // 4. MILEAGE SYNC PROTOCOL: Update Main Asset Table
    // Fetch current odometer from 'cars' table
    const { data: carData } = await supabase
      .from("cars")
      .select("mileage")
      .eq("car_id", row.car_id)
      .single();

    const currentCarMileage = carData?.mileage ? parseInt(carData.mileage) : 0;

    // Only update the main car record if this trip provides a newer, higher reading
    // This allows users to log older, backdated trips without breaking current telemetry
    let carUpdated = false;
    if (row.mileage_after > currentCarMileage) {
      const { error: updateError } = await supabase
        .from("cars")
        .update({ mileage: row.mileage_after })
        .eq("car_id", row.car_id);

      if (updateError) {
        console.error("Auto-mileage sync failed:", updateError.message);
      } else {
        carUpdated = true;
      }
    }

    return NextResponse.json({
      ok: true,
      trip_id: tripData.trip_id,
      car_mileage_synced: carUpdated,
      message: carUpdated
        ? "Trip logged and car telemetry updated to new peak mileage."
        : "Trip logged. Car telemetry remains at current peak."
    });

  } catch (err) {
    console.error("Internal API Error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
