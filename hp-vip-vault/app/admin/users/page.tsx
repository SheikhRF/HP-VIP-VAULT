import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/navbar";
import GlowCopy from "@/components/ui/glow-copy";
import Link from "next/link"; // Added for navigation
import { Users, Shield, UserPlus, MoreHorizontal, Route, ArrowLeft } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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
          <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="px-8 py-6 text-[8px] font-black uppercase text-gray-500 tracking-[0.3em]">Identity</th>
                  <th className="px-8 py-6 text-[8px] font-black uppercase text-gray-500 tracking-[0.3em]">Clearance</th>
                  <th className="px-8 py-6 text-[8px] font-black uppercase text-gray-500 tracking-[0.3em]">Drives</th>
                  <th className="px-8 py-6 text-[8px] font-black uppercase text-gray-500 tracking-[0.3em]">Last Uplink</th>
                  <th className="px-8 py-6 text-[8px] font-black uppercase text-gray-500 tracking-[0.3em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usersWithCounts?.map((user) => (
                  <tr key={user.id} className="group relative hover:bg-white/[0.01] transition-colors cursor-pointer">
                    <td className="px-8 py-6 relative">
                      {/* Invisible link covering the row */}
                      <Link href={`/admin/users/${user.id}`} className="absolute inset-0 z-0" />
                      
                      <div className="flex flex-col relative z-10 pointer-events-none">
                        <span className="text-xs font-black uppercase italic text-white group-hover:text-orange-500 transition-colors mb-1">
                          {user.name}
                        </span>
                        {/* pointer-events-auto allows the GlowCopy button to work inside the row-link */}
                        <div className="pointer-events-auto">
                          <GlowCopy 
                            text={user.email} 
                            className="text-[10px] font-mono text-gray-600 uppercase tracking-tighter"
                          />
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-8 py-6 relative z-10 pointer-events-none">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                        user.role === 'admin' 
                          ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' 
                          : 'bg-white/5 border-white/10 text-gray-400'
                      }`}>
                        {user.role === 'admin' ? <Shield size={10} /> : <Users size={10} />}
                        {user.role}
                      </div>
                    </td>

                    <td className="px-8 py-6 relative z-10 pointer-events-none">
                      <div className="flex items-center gap-2">
                        <Route size={14} className="text-gray-700" />
                        <span className="text-sm font-black italic text-white">
                          {user.tripCount}
                        </span>
                        <span className="text-[8px] font-black uppercase text-gray-700 tracking-widest ml-1">Drives</span>
                      </div>
                    </td>

                    <td className="px-8 py-6 relative z-10 pointer-events-none">
                      <span className="text-[10px] font-bold text-gray-500 uppercase italic">
                        {new Date(user.updated_at).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="px-8 py-6 text-right relative z-10">
                       <button className="p-2 hover:bg-white/5 rounded-lg transition-all text-gray-600 hover:text-white relative z-20">
                         <MoreHorizontal size={16} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}