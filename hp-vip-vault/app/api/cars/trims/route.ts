import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const make = searchParams.get("make");
  const model = searchParams.get("model");
  const year = searchParams.get("year"); // optional

  if (!make || !model) {
    return NextResponse.json(
      { ok: false, error: "Missing make or model" },
      { status: 400 }
    );
  }

  const key = process.env.API_NINJAS_KEY;
  if (!key) {
    return NextResponse.json(
      { ok: false, error: "Missing API_NINJAS_KEY" },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    make,
    model,
  });

  if (year) params.set("year", year);

  const url = `https://api.api-ninjas.com/v1/cartrims?${params.toString()}`;

  const res = await fetch(url, {
    headers: { "X-Api-Key": key },
    cache: "no-store",
  });

  const text = await res.text();

  if (!res.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to fetch trims from API Ninjas",
        status: res.status,
        body: text,
      },
      { status: 502 }
    );
  }

  let trims: unknown;
  try {
    trims = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON from API Ninjas", body: text },
      { status: 502 }
    );
  }

  if (!Array.isArray(trims)) {
    return NextResponse.json(
      { ok: false, error: "Unexpected trims response shape" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    trims,
  });
}
