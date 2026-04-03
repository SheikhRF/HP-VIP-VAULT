import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const isAdmin = sessionClaims?.role === "admin" || sessionClaims?.Role === "admin";
  if (!isAdmin) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const { cars } = await req.json();

  if (!Array.isArray(cars) || cars.length === 0) {
    return NextResponse.json({ ok: false, error: "No cars provided" }, { status: 400 });
  }

  const rows = cars.map((car: { make: string; model: string; registration: string }) => ({
    make: car.make?.trim() || null,
    model: car.model?.trim() || null,
    registration: car.registration?.toUpperCase().replace(/\s+/g, "") || null,
    pictures: [],
  }));

  const { data, error } = await supabase.from("cars").insert(rows).select("car_id");

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, inserted: data?.length ?? 0 });
}