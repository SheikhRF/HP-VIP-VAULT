// app/admin/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/navbar";
import FleetControlTable from "@/components/admin/FleetControlTable";
import { ShieldAlert, Activity, Zap, Gauge, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const { sessionClaims } = await auth();
  const isAdmin = sessionClaims?.Role === "admin" || sessionClaims?.role === "admin";

  if (!isAdmin) {
    return (
      <main className="h-screen bg-black flex items-center justify-center">
        <h1 className="text-orange-500 font-black italic tracking-[0.5em] uppercase">Unauthorized Access</h1>
      </main>
    );
  }

  // Use Secret Key to bypass RLS and see all fleet data
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const { data: cars } = await supabase
    .from("cars")
    .select("*")
    .order("created_at", { ascending: false });

  // Quick Stats Logic
  const fleetCount = cars?.length || 0;
  const motAlerts = cars?.filter(c => c.mot !== "Valid").length || 0;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* HUD Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <header className="md:col-span-2">
              <div className="flex items-center gap-2 text-primary mb-2">
                <ShieldAlert size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Vault Administrator</span>
              </div>
              <h1 className="text-5xl font-black italic tracking-tighter uppercase text-white leading-none">
                Mission <span className="text-primary">Control</span>
              </h1>
            </header>

            <div className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-3xl flex flex-col justify-between">
              <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                <Activity size={10} /> Fleet Deployment
              </p>
              <p className="text-3xl font-black italic text-white mt-2">{fleetCount} <span className="text-xs text-gray-600 italic">Units</span></p>
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-3xl flex flex-col justify-between">
              <p className="text-[8px] text-red-500 uppercase font-black tracking-widest flex items-center gap-2">
                <ShieldAlert size={10} /> Compliance Alerts
              </p>
              <p className="text-3xl font-black italic text-red-500 mt-2">{motAlerts} <span className="text-xs text-gray-600 italic">Critical</span></p>
            </div>
          </div>

          {/* Interactive Control Table */}
          <FleetControlTable initialCars={cars || []} />
        </div>
      </main>
    </>
  );
}