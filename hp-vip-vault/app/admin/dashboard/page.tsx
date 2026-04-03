// app/admin/dashboard/page.tsx
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Activity, ArrowLeft } from "lucide-react";
import { SyncFleetButton } from "@/components/admin/SyncFleetButton";
import Link from "next/link";
import ServiceReminder from "@/components/admin/ServiceReminder";
import DashboardSearch from "@/components/admin/DashboardSearch";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const { data: cars } = await supabase.from("cars").select("*");
  const alerts = cars?.filter(c =>
    c.mot !== "Valid" && c.mot !== "No details held by DVLA" ||
    c.tax_status !== "Taxed" && c.tax_status !== "SORN" ||
    c.service_date !== null && new Date(c.service_date) < new Date()
  ).length || 0;

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
              <SyncFleetButton lastSync={lastSyncTimestamp || ""} />
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

          {/* SERVICE TELEMETRY */}
          <ServiceReminder cars={cars || []} />

          {/* SEARCH + ASSET GRID */}
          <DashboardSearch cars={cars || []} />
        </div>
      </main>
    </>
  );
}