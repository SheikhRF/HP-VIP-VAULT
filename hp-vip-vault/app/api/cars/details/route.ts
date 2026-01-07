import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { make, model, trim } = body;

  if (!make || !model || !trim) {
    return NextResponse.json(
      { ok: false, error: "Missing make, model, or trim" },
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
    trim,
  });

  const url = `https://api.api-ninjas.com/v1/cardetails?${params.toString()}`;

  const res = await fetch(url, {
    headers: { "X-Api-Key": key },
    cache: "no-store",
  });

  const text = await res.text();

  if (!res.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to fetch car details from API Ninjas",
        status: res.status,
        body: text,
      },
      { status: 502 }
    );
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON from API Ninjas", body: text },
      { status: 502 }
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No details found for this trim" },
      { status: 404 }
    );
  }

  // ✅ Always take the top response
  const top = data[0];

  return NextResponse.json({
    ok: true,
    top,
  });
}
