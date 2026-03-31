/**
 * ONE-TIME MIGRATION SCRIPT
 * Syncs all existing Clerk users into the Supabase profiles table.
 *
 * Usage:
 *   1. npm install -g tsx   (if not already installed)
 *   2. npx tsx scripts/sync-clerk-users.ts
 *
 * Make sure your .env.local has:
 *   CLERK_SECRET_KEY=
 *   NEXT_PUBLIC_SUPABASE_URL=
 *   SUPABASE_SECRET_KEY=
 */

import { createClient } from "@supabase/supabase-js";
    

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

if (!CLERK_SECRET_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing environment variables. Check your .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fetchAllClerkUsers() {
  const allUsers: any[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const res = await fetch(
      `https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Clerk API error: ${res.status} ${await res.text()}`);
    }

    const users = await res.json();

    if (!Array.isArray(users) || users.length === 0) break;

    allUsers.push(...users);
    console.log(`  Fetched ${allUsers.length} users so far...`);

    if (users.length < limit) break;
    offset += limit;
  }

  return allUsers;
}

async function syncUsers() {
  console.log("🚀 Starting Clerk → Supabase user migration...\n");

  // 1. Fetch all users from Clerk
  console.log("📋 Fetching users from Clerk...");
  const clerkUsers = await fetchAllClerkUsers();
  console.log(`✅ Found ${clerkUsers.length} Clerk users\n`);

  if (clerkUsers.length === 0) {
    console.log("No users to sync.");
    return;
  }

  // 2. Map to profiles schema
  const profiles = clerkUsers.map((user) => {
    const firstName = user.first_name ?? "";
    const lastName = user.last_name ?? "";
    const fullName = `${firstName} ${lastName}`.trim() || "Unknown Member";
    const primaryEmail = user.email_addresses?.[0]?.email_address ?? null;

    return {
      id: user.id,
      name: fullName,
      email: primaryEmail,
      updated_at: new Date().toISOString(),
    };
  });

  // 3. Upsert in batches of 50
  const BATCH_SIZE = 50;
  let successCount = 0;
  let errorCount = 0;

  console.log(`📤 Upserting ${profiles.length} profiles into Supabase...`);

  for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
    const batch = profiles.slice(i, i + BATCH_SIZE);

    const { error } = await supabase
      .from("profiles")
      .upsert(batch, { onConflict: "id" });

    if (error) {
      console.error(`  ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error.message);
      errorCount += batch.length;
    } else {
      successCount += batch.length;
      console.log(`  ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} users synced`);
    }
  }

  // 4. Summary
  console.log("\n--- MIGRATION COMPLETE ---");
  console.log(`✅ Successfully synced: ${successCount} users`);
  if (errorCount > 0) {
    console.log(`❌ Failed: ${errorCount} users`);
  }
}

syncUsers().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});