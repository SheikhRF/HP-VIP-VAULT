import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/navbar";
import Link from "next/link"; // Added for navigation
import { ArrowLeft } from "lucide-react";
import UserRegistrySearch from "@/components/admin/UserRegistrySearch";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export default async function AdminUsersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // 1. Verify Admin Clearance
  const { data: currentUser } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (currentUser?.role !== "admin") {
    redirect("/dashboard");
  }

  // 2. Fetch All Profiles
  const { data: allUsers, error: userError } = await supabase
    .from("profiles")
    .select("*")
    .order("updated_at", { ascending: false });

  // 3. Fetch Trip Data to calculate counts
  const { data: allTrips } = await supabase
    .from("trips")
    .select("user_id");

  // 4. Merge Data
  const usersWithCounts = allUsers?.map((user) => {
    const count = allTrips?.filter((trip) => trip.user_id === user.id).length || 0;
    return { ...user, tripCount: count };
  });

  if (userError) {
    return <div className="text-white p-20 text-center font-black uppercase italic tracking-tighter">Failed to sync registry.</div>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <Link href="/admin/" className="flex items-center gap-2 text-gray-500 hover:text-orange-500 text-[9px] font-black uppercase tracking-widest transition-colors">
                <ArrowLeft size={12} /> Back to Hub
          </Link>

          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-12">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
                User <span className="text-orange-500 text-glow-orange">Registry</span>
              </h1>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.5em] ml-1">
                Authorized Personnel Directory • {usersWithCounts?.length || 0} Members
              </p>
            </div>
            
          </div>

          {/* USERS TABLE */}
          <UserRegistrySearch users={usersWithCounts ?? []} currentUserId={userId} />
        </div>
      </main>
    </>
  );
}