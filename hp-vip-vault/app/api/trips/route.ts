import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Initialize Supabase client using your existing environment variables
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

    // 3. Validation: Match your database constraints
    if (!car_id || !start_date || !mileage_before || !end_date || !mileage_after || !rating) {
      return NextResponse.json(
        { ok: false, error: "Missing mandatory trip data" },
        { status: 400 }
      );
    }

    // Validate mileage logic: After must be greater or equal to Before
    if (mileage_after < mileage_before) {
      return NextResponse.json(
        { ok: false, error: "Odometer After cannot be less than Odometer Before" },
        { status: 400 }
      );
    }

    // 4. Build the DB row
    const row = {
      car_id: parseInt(car_id),
      user_id: userId, // Link trip to the current Clerk user
      start_date,
      end_date,
      mileage_before: parseInt(mileage_before),
      mileage_after: parseInt(mileage_after),
      rating: parseInt(rating),
      notes: notes || null,
    };

    // 5. Insert into Supabase 'trips' table
    const { data, error } = await supabase
      .from("trips")
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error("Supabase trip insertion error:", error.message);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      trip_id: data.trip_id,
      message: "Trip successfully logged to Vault"
    });

  } catch (err: any) {
    console.error("Internal API Error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}