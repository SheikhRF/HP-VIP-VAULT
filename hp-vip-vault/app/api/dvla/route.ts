import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.registrationNumber) {
    return NextResponse.json({ ok: false, error: "Missing registrationNumber" }, { status: 400 });
  }

  const key = process.env.DVLA_VES_KEY;
  if (!key) {
    return NextResponse.json({ ok: false, error: "Missing DVLA_VES_KEY" }, { status: 500 });
  }

  const reg = String(body.registrationNumber)
    .toUpperCase()
    .replace(/\s+/g, "");

  const res = await fetch("https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ registrationNumber: reg }),
    cache: "no-store",
  });

  const text = await res.text();

  if (!res.ok) {
    return NextResponse.json(
      { ok: false, error: "DVLA error", status: res.status, body: text },
      { status: 502 }
    );
  }

  const data = JSON.parse(text);

  return NextResponse.json({
    ok: true,
    dvla: {
      registration: data.registrationNumber ?? reg,
      year_of_manufacture: data.yearOfManufacture ?? null,
      mot: data.motStatus ?? null,
      tax_status: data.taxStatus ?? null,
      tax_due_date: data.artEndDate ?? null,
    },
    raw: data, // keep for debugging 
  });
}
