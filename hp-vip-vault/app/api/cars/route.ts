import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { make, model, pictures } = body;

  if (!make || !model) {
    return NextResponse.json(
      { error: "Make and model are required" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("cars").insert({
    make,
    model,
    pictures: pictures || null,
    // you can also store created_by: userId if you add that column
  });

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Database error: " + error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
