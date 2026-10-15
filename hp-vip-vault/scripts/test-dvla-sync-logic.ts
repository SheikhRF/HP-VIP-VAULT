/**
 * REGRESSION TEST — DVLA sync concurrency, retry/backoff, and payload shape.
 * Pure in-memory logic only — no network calls, no env vars needed, no real
 * Supabase/DVLA access. Follows the same framework-free pattern as
 * scripts/test-admin-claims.ts.
 *
 * Usage:
 *   npx tsx scripts/test-dvla-sync-logic.ts
 */

import { runWithConcurrency } from "../lib/dvla/concurrencyLimiter";
import { fetchDvlaWithRetry, syncOneCar } from "../lib/dvla/syncFleet";

let failures = 0;

function check(name: string, pass: boolean, detail?: string) {
  if (!pass) failures++;
  console.log(`${pass ? "PASS" : "FAIL"} - ${name}${detail ? ` (${detail})` : ""}`);
}

function fakeResponse(status: number, body: unknown = {}, headers: Record<string, string> = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (key: string) => headers[key] ?? null },
    json: async () => body,
  } as unknown as Response;
}

async function testRetriesOnRateLimitThenSucceeds() {
  const statuses = [429, 429, 200];
  let calls = 0;
  const fetchFn = async () => fakeResponse(statuses[calls++], { motStatus: "Valid" });

  const result = await fetchDvlaWithRetry("AB12CDE", fetchFn as any);
  check("retries on 429 then succeeds", result.ok === true && calls === 3, `calls=${calls}`);
}

async function testNoRetryOnTerminalError() {
  let calls = 0;
  const fetchFn = async () => {
    calls++;
    return fakeResponse(404);
  };

  const result = await fetchDvlaWithRetry("AB12CDE", fetchFn as any);
  check("no retry on 404 (terminal)", result.ok === false && calls === 1, `calls=${calls}`);
}

async function testGivesUpAfterMaxAttempts() {
  let calls = 0;
  const fetchFn = async () => {
    calls++;
    return fakeResponse(429);
  };

  const result = await fetchDvlaWithRetry("AB12CDE", fetchFn as any);
  check("gives up after max attempts on repeated 429", result.ok === false && calls === 3, `calls=${calls}`);
}

async function testConcurrencyLimitRespected() {
  const items = Array.from({ length: 10 }, (_, i) => i);
  let running = 0;
  let maxRunning = 0;

  await runWithConcurrency(items, 3, async () => {
    running++;
    maxRunning = Math.max(maxRunning, running);
    await new Promise((r) => setTimeout(r, 5));
    running--;
  });

  check("concurrency limit respected", maxRunning <= 3, `maxRunning=${maxRunning}`);
}

async function testSyncOneCarPayloadShape() {
  let updatePayload: any = null;
  const fakeSupabase = {
    from() {
      return {
        update(payload: any) {
          updatePayload = payload;
          return { eq: async () => ({ error: null }) };
        },
      };
    },
  } as any;

  const fetchFn = async () =>
    fakeResponse(200, {
      motStatus: "Valid",
      taxStatus: "Taxed",
      artEndDate: "2026-01-01",
    });

  const result = await syncOneCar(fakeSupabase, { car_id: "1", registration: "AB12CDE" }, fetchFn as any);

  check("syncOneCar succeeds", result.ok === true);
  check(
    "update payload has exact expected fields",
    updatePayload &&
      updatePayload.mot === "Valid" &&
      updatePayload.tax_status === "Taxed" &&
      updatePayload.tax_due_date === "2026-01-01" &&
      typeof updatePayload.last_synced_at === "string",
    JSON.stringify(updatePayload)
  );
}

async function main() {
  await testRetriesOnRateLimitThenSucceeds();
  await testNoRetryOnTerminalError();
  await testGivesUpAfterMaxAttempts();
  await testConcurrencyLimitRespected();
  await testSyncOneCarPayloadShape();

  if (failures > 0) {
    console.error(`\n${failures} case(s) failed.`);
    process.exit(1);
  }
  console.log("\nAll cases passed.");
}

main();
