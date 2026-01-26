import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/navbar";
import AssetIntelligenceCard from "@/components/admin/AssetIntelligenceCard";
import { Badge } from "@/components/ui/badge"; // Shadcn
import { Separator } from "@/components/ui/separator"; // Shadcn
import { ShieldAlert, Activity, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const { data: cars } = await supabase
    .from("cars")
    .select("*")
    .order("created_at", { ascending: false });

  const alerts = cars?.filter(c => c.mot !== "Valid" || c.tax_status !== "Taxed").length || 0;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black text-white pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* HUD Header */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-orange-500/50 text-orange-500 uppercase tracking-widest text-[8px] bg-orange-500/5">
                  <ShieldAlert className="mr-1" size={10} /> Root Access Active
                </Badge>
              </div>
              <h1 className="text-6xl font-black italic uppercase tracking-tighter">
                Mission <span className="text-orange-500">Control</span>
              </h1>
            </div>

            <div className="flex gap-8 pb-2">
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-1">Fleet Total</p>
                <p className="text-4xl font-black italic">{cars?.length || 0}</p>
              </div>
              <Separator orientation="vertical" className="h-12 bg-white/10" />
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-1">System Alerts</p>
                <p className="text-4xl font-black italic text-red-500">{alerts}</p>
              </div>
            </div>
          </div>

          {/* Asset Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars?.map((car) => (
              <AssetIntelligenceCard key={car.car_id} car={car} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}