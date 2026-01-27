import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { car_id, isDelete, ...updateData } = body;

    if (!car_id) {
      return NextResponse.json({ error: "Missing Asset ID" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    // DELETE LOGIC
    if (isDelete) {
      const { error } = await supabase
        .from("cars")
        .delete()
        .eq("car_id", car_id);

      if (error) throw error;
      return NextResponse.json({ success: true, message: "Asset Decommissioned" });
    }

    // UPDATE LOGIC
    const { error } = await supabase
      .from("cars")
      .update(updateData)
      .eq("car_id", car_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}