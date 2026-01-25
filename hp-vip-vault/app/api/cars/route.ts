import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET_KEY;
if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
if (!supabaseSecret) throw new Error("Missing SUPABASE_SECRET_KEY");

const supabase = createClient(supabaseUrl, supabaseSecret);

// ---- spec mapping ----
const SPEC_MAP: Record<string, string> = {
  acceleration_0_100: "Acceleration (0-100 km/h)",
  body_type: "Body type",
  engine_capacity: "Capacity",
  curb_weight: "Curb weight",
  cylinder_layout: "Cylinder layout",
  drive_wheels: "Drive wheels",
  engine_power: "Engine power",
  fuel_tank_capacity: "Fuel tank capacity",
  gearbox_type: "Gearbox type",
  max_speed: "Max speed",
  max_torque: "Maximum torque",
  max_trunk_capacity: "Max trunk capacity",
  number_of_cylinders: "Number of cylinders",
  number_of_gears: "Number of gear",
  number_of_seats: "Number of seater",
};

function normalizeReg(input: string) {
  return input.toUpperCase().replace(/\s+/g, "");
}

async function fetchTopDetails(make: string, model: string, trim: string) {
  const key = process.env.API_NINJAS_KEY;
  if (!key) throw new Error("Missing API_NINJAS_KEY");

  const params = new URLSearchParams({ make, model, trim });
  const url = `https://api.api-ninjas.com/v1/cardetails?${params.toString()}`;

  const res = await fetch(url, {
    headers: { "X-Api-Key": key },
    cache: "no-store",
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`API Ninjas error: ${text}`);

  const data = JSON.parse(text);
  if (!Array.isArray(data) || data.length === 0) throw new Error("No details found");

  return data[0];
}

// DVLA helper
async function fetchDVLA(registrationNumber: string) {
  const key = process.env.DVLA_VES_KEY;
  if (!key) throw new Error("Missing DVLA_VES_KEY");

  const res = await fetch(
    "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles",
    {
      method: "POST",
      headers: {
        "x-api-key": key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ registrationNumber }),
      cache: "no-store",
    }
  );

  const text = await res.text();

  if (!res.ok) {
    // DVLA returns JSON errors but to be safe we return raw text too
    throw new Error(`DVLA error (${res.status}): ${text}`);
  }

  return JSON.parse(text);
}

export async function POST(req: Request) {
  const form = await req.formData();

  const make = String(form.get("make") ?? "").trim();
  const model = String(form.get("model") ?? "").trim();
  const trim = String(form.get("trim") ?? "").trim();
  const price = form.get("price");
  const mileage = form.get("mileage");

  if (!make || !model || !trim) {
    return NextResponse.json(
      { ok: false, error: "Missing make/model/trim" },
      { status: 400 }
    );
  }

  const registrationRaw = String(form.get("registration") ?? "").trim();
  const locationRaw = String(form.get("location") ?? "").trim();

  const registration = registrationRaw ? normalizeReg(registrationRaw) : null;
  const location = locationRaw || null;

  const files = form.getAll("photos").filter((v): v is File => v instanceof File);
  if (files.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Please upload at least 1 photo" },
      { status: 400 }
    );
  }

  // 1) get top specs
  const top = await fetchTopDetails(make, model, trim);
  const specs: Record<string, string> = top.specifications ?? {};

  // 2) upload photos to Supabase Storage
  const bucket = "car-images";
  const uploadedUrls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: `Photo ${i + 1} is too large (max 15MB)` },
        { status: 400 }
      );
    }

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${make}-${model}/${Date.now()}-${i}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(path, await file.arrayBuffer(), {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (upErr) {
      return NextResponse.json(
        { ok: false, error: `Upload failed: ${upErr.message}` },
        { status: 500 }
      );
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    uploadedUrls.push(data.publicUrl);
  }

  // 3) build DB row (specs + photos)
  const row: Record<string, any> = {
    make: top.make ?? make,
    model: top.model ?? model,
    pictures: uploadedUrls, //  text[] column
    registration,           // can be null
    location,
    price,
    mileage,                // can be null 
  };

  for (const [dbField, apiKey] of Object.entries(SPEC_MAP)) {
    row[dbField] = specs[apiKey] ?? null;
  }

  row.number_of_cylinders = parseInt(row.number_of_cylinders, 10) || null;
  row.number_of_gears = parseInt(row.number_of_gears, 10) || null;
  row.number_of_seats = parseInt(row.number_of_seats, 10) || null;

  // 4) DVLA enrichment (only if registration provided)
  if (registration) {
    try {
      const dvla = await fetchDVLA(registration);

      // Only the DVLA fields you said you want:
      row.year_of_manufacture = dvla.yearOfManufacture ?? null;
      row.mot = dvla.motStatus ?? null;
      row.tax_status = dvla.taxStatus ?? null;
      row.tax_due_date = dvla.artEndDate ?? null;
    } catch (e) {
      // Don’t fail the entire upload if DVLA is down / reg invalid
      console.error("DVLA lookup failed:", e);
    }
  }

  const { data: inserted, error } = await supabase
    .from("cars")
    .insert(row)
    .select("car_id")
    .single();

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    car_id: inserted.car_id,
    pictures: uploadedUrls,
    dvla_enriched: !!registration,
  });
}
