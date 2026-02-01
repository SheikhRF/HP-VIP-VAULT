import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Initialize Supabase client with Service Role for bypass permissions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecret) {
  throw new Error("Missing Supabase configuration environment variables");
}

const supabase = createClient(supabaseUrl, supabaseSecret);

export async function POST(req: Request) {
  try {
    // 1. Authenticate the user via Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // 2. Parse the request body
    const body = await req.json();
    const { 
      car_id, 
      start_date, 
      end_date, 
      mileage_before, 
      mileage_after, 
      rating, 
      notes 
    } = body;

    // 3. Validation: Check for mandatory fields
    if (!car_id || !start_date || !mileage_before || !end_date || !mileage_after || !rating) {
      return NextResponse.json(
        { ok: false, error: "Missing mandatory trip data" },
        { status: 400 }
      );
    }

    const mBefore = parseInt(mileage_before);
    const mAfter = parseInt(mileage_after);

    // Logic Gate: Prevent negative distance
    if (mAfter < mBefore) {
      return NextResponse.json(
        { ok: false, error: "Odometer After cannot be less than Odometer Before" },
        { status: 400 }
      );
    }

    // 4. Build the DB row
    const row = {
      car_id: parseInt(car_id),
      user_id: userId, 
      start_date,
      end_date,
      mileage_before: mBefore,
      mileage_after: mAfter,
      rating: parseInt(rating),
      notes: notes || null,
    };

    // 5. Insert into Supabase 'trips' table
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

    // 6. MILEAGE SYNC PROTOCOL: Update Main Asset Table
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
    if (mAfter > currentCarMileage) {
      const { error: updateError } = await supabase
        .from("cars")
        .update({ mileage: mAfter })
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

  } catch (err: any) {
    console.error("Internal API Error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}