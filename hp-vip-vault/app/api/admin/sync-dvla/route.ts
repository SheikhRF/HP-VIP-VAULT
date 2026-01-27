import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET_KEY;

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl!, supabaseSecret!);

    // 1. Get all cars that have a registration
    const { data: cars, error: fetchError } = await supabase
      .from("cars")
      .select("car_id, registration")
      .not("registration", "is", null);

    if (fetchError) throw fetchError;

    let updatedCount = 0;

    // 2. Loop through and fetch fresh DVLA data for each
    for (const car of cars) {
      const dvlaRes = await fetch(
        "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles",
        {
          method: "POST",
          headers: {
            "x-api-key": process.env.DVLA_VES_KEY!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ registrationNumber: car.registration }),
        }
      );

      if (dvlaRes.ok) {
        const dvla = await dvlaRes.json();
        
        await supabase
        .from("cars")
        .update({
        mot: dvla.motStatus ?? null,
        tax_status: dvla.taxStatus ?? null,
        tax_due_date: dvla.artEndDate ?? null,
        last_synced_at: new Date().toISOString(), 
  })
  .eq("car_id", car.car_id);
          
        updatedCount++;
      }
    }

    return NextResponse.json({ ok: true, updated: updatedCount });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}