// app/admin/dashboard/page.tsx
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/navbar";
import AssetIntelligenceCard from "@/components/admin/AssetIntelligenceCard";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShieldAlert, Activity, ArrowLeft } from "lucide-react";
import { SyncFleetButton } from "@/components/admin/SyncFleetButton"; // New Import
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const { data: cars } = await supabase.from("cars").select("*");
  const alerts = cars?.filter(c => c.mot !== "Valid" || c.tax_status !== "Taxed").length || 0;

  const lastSyncTimestamp = cars?.reduce((oldest, car) => {
    if (!car.last_synced_at) return oldest;
    return new Date(car.last_synced_at) < new Date(oldest) ? car.last_synced_at : oldest;
  }, cars[0]?.last_synced_at || new Date().toISOString());
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          <Link href="/admin/" className="flex items-center gap-2 text-gray-500 hover:text-orange-500 text-[9px] font-black uppercase tracking-widest transition-colors">
                <ArrowLeft size={12} /> Back to Hub
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-4">
              <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
                Fleet <span className="text-orange-500">Status</span>
              </h1>
            </div>

            <div className="flex flex-wrap items-end gap-8 pb-2">
              {/* --- NEW SYNC BUTTON --- */}
              <SyncFleetButton lastSync={lastSyncTimestamp || ""}/>
              
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-1">Total Assets</p>
                <p className="text-4xl font-black italic">{cars?.length || 0}</p>
              </div>
              <Separator orientation="vertical" className="h-12 bg-white/10 hidden md:block" />
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-1">Critical Alerts</p>
                <p className="text-4xl font-black italic text-red-500">{alerts}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars?.map((car) => (
              <AssetIntelligenceCard key={car.car_id} car={car} />
            ))}
          </div>

          {(!cars || cars.length === 0) && (
            <div className="py-40 text-center border border-dashed border-white/10 rounded-[3rem] opacity-30">
                <Activity className="mx-auto mb-4 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Records Found</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}