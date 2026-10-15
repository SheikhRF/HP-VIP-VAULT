/**
 * REGRESSION TEST — admin role-claim casing
 * Guards against the sessionClaims `role` vs `Role` casing bug that has
 * already broken admin checks in this project before (see commit history:
 * "fixes for roles case issue", "role fix for supabase sync").
 *
 * Usage:
 *   npx tsx scripts/test-admin-claims.ts
 *
 * Pure logic only — no Clerk/Supabase calls, no network, no env vars needed.
 */

import { isAdminClaims } from "../lib/auth/requireAdmin";

type Case = {
  name: string;
  claims: { role?: string; Role?: string } | null | undefined;
  expected: boolean;
};

const cases: Case[] = [
  { name: "lowercase role admin", claims: { role: "admin" }, expected: true },
  { name: "uppercase Role admin", claims: { Role: "admin" }, expected: true },
  { name: "lowercase role user", claims: { role: "user" }, expected: false },
  { name: "uppercase Role user", claims: { Role: "user" }, expected: false },
  { name: "empty claims object", claims: {}, expected: false },
  { name: "null claims", claims: null, expected: false },
  { name: "undefined claims", claims: undefined, expected: false },
];

let failures = 0;

for (const { name, claims, expected } of cases) {
  const actual = isAdminClaims(claims);
  const pass = actual === expected;
  if (!pass) failures++;
  console.log(`${pass ? "PASS" : "FAIL"} - ${name}: expected ${expected}, got ${actual}`);
}

if (failures > 0) {
  console.error(`\n${failures} of ${cases.length} case(s) failed.`);
  process.exit(1);
}

console.log(`\nAll ${cases.length} cases passed.`);
