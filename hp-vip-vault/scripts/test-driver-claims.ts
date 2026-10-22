/**
 * REGRESSION TEST — driver role-claim logic
 * Guards isDriverOrAdminClaims in lib/auth/requireAdmin.ts: drivers AND
 * admins should pass (admins can access every page, including trip
 * logging/editing), plain users should not.
 *
 * Usage:
 *   npx tsx scripts/test-driver-claims.ts
 *
 * Pure logic only — no Clerk/Supabase calls, no network, no env vars needed.
 */

import { isDriverOrAdminClaims } from "../lib/auth/requireAdmin";

type Case = {
  name: string;
  claims: { role?: string; Role?: string } | null | undefined;
  expected: boolean;
};

const cases: Case[] = [
  { name: "lowercase role driver", claims: { role: "driver" }, expected: true },
  { name: "uppercase Role driver", claims: { Role: "driver" }, expected: true },
  { name: "uppercase Role admin (counts as driver too)", claims: { Role: "admin" }, expected: true },
  { name: "lowercase role admin (counts as driver too)", claims: { role: "admin" }, expected: true },
  { name: "lowercase role user", claims: { role: "user" }, expected: false },
  { name: "uppercase Role user", claims: { Role: "user" }, expected: false },
  { name: "empty claims object", claims: {}, expected: false },
  { name: "null claims", claims: null, expected: false },
  { name: "undefined claims", claims: undefined, expected: false },
];

let failures = 0;

for (const { name, claims, expected } of cases) {
  const actual = isDriverOrAdminClaims(claims);
  const pass = actual === expected;
  if (!pass) failures++;
  console.log(`${pass ? "PASS" : "FAIL"} - ${name}: expected ${expected}, got ${actual}`);
}

if (failures > 0) {
  console.error(`\n${failures} of ${cases.length} case(s) failed.`);
  process.exit(1);
}

console.log(`\nAll ${cases.length} cases passed.`);
