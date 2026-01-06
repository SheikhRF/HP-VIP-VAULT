import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.API_NINJAS_KEY;

  if (!key) {
    return NextResponse.json(
      { ok: false, error: "Missing API_NINJAS_KEY in .env.local" },
      { status: 500 }
    );
  }

  const url = "https://api.api-ninjas.com/v1/carmodels?make=Audi";

  const res = await fetch(url, {
    headers: { "X-Api-Key": key },
    cache: "no-store",
  });

  const text = await res.text();

  if (!res.ok) {
    return NextResponse.json(
      { ok: false, error: "API Ninjas failed", status: res.status, body: text },
      { status: 502 }
    );
  }

  try {
    return NextResponse.json({ ok: true, data: JSON.parse(text) });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Non-JSON response from API Ninjas", body: text },
      { status: 502 }
    );
  }
}
