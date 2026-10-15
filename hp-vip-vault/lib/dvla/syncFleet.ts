import type { SupabaseClient } from "@supabase/supabase-js";
import { runWithConcurrency } from "./concurrencyLimiter";

const DVLA_URL = "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles";
const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 500;
const RETRYABLE_STATUSES = new Set([429, 502]);

type Car = { car_id: string; registration: string };

type SyncResult =
  | { ok: true; car_id: string }
  | { ok: false; car_id: string; registration: string; error: string };

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type FetchFn = typeof fetch;

export async function fetchDvlaWithRetry(registration: string, fetchFn: FetchFn = fetch) {
  let lastError = "Unknown error";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await fetchFn(DVLA_URL, {
      method: "POST",
      headers: {
        "x-api-key": process.env.DVLA_VES_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ registrationNumber: registration }),
    });

    if (res.ok) {
      return { ok: true as const, data: await res.json() };
    }

    if (!RETRYABLE_STATUSES.has(res.status) || attempt === MAX_ATTEMPTS) {
      return { ok: false as const, error: `DVLA error (${res.status})` };
    }

    lastError = `DVLA error (${res.status})`;
    const retryAfterHeader = res.headers.get("Retry-After");
    const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : NaN;
    const backoffMs = Number.isFinite(retryAfterMs) ? retryAfterMs : BASE_DELAY_MS * 2 ** (attempt - 1);
    await sleep(backoffMs);
  }

  return { ok: false as const, error: lastError };
}

export async function syncOneCar(
  supabase: SupabaseClient,
  car: Car,
  fetchFn: FetchFn = fetch
): Promise<SyncResult> {
  const result = await fetchDvlaWithRetry(car.registration, fetchFn);

  if (!result.ok) {
    return { ok: false, car_id: car.car_id, registration: car.registration, error: result.error };
  }

  const dvla = result.data;
  const { error } = await supabase
    .from("cars")
    .update({
      mot: dvla.motStatus ?? null,
      tax_status: dvla.taxStatus ?? null,
      tax_due_date: dvla.artEndDate ?? null,
      last_synced_at: new Date().toISOString(),
    })
    .eq("car_id", car.car_id);

  if (error) {
    return { ok: false, car_id: car.car_id, registration: car.registration, error: error.message };
  }

  return { ok: true, car_id: car.car_id };
}

export async function syncFleet(supabase: SupabaseClient, fetchFn: FetchFn = fetch) {
  const { data: cars, error: fetchError } = await supabase
    .from("cars")
    .select("car_id, registration")
    .not("registration", "is", null);

  if (fetchError) throw fetchError;

  const concurrency = Number(process.env.DVLA_SYNC_CONCURRENCY) || 4;
  const results = await runWithConcurrency(cars as Car[], concurrency, (car) =>
    syncOneCar(supabase, car, fetchFn)
  );

  return {
    updated: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  };
}
