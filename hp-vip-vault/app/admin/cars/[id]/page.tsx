import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/navbar";
import EditAssetForm from "@/components/admin/EditAssetForm";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminCarEditPage({ params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const { data: car } = await supabase.from("cars").select("*");

  if (!car) return <div className="p-20 text-white font-black uppercase text-center">Asset Not Found</div>;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black text-white pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
            <div className="space-y-4">
              <Link href="/admin/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-orange-500 text-[9px] font-black uppercase tracking-widest transition-colors">
                <ArrowLeft size={12} /> Back to Fleet
              </Link>
              <div className="space-y-1">
                <Badge variant="outline" className="border-orange-500 text-orange-500 text-[8px] uppercase tracking-[0.3em]">
                  <ShieldAlert className="mr-2" size={10} /> Override Mode Active
                </Badge>
                <h1 className="text-5xl font-black italic uppercase tracking-tighter">
                  {car.make} <span className="text-orange-500">{car.model}</span>
                </h1>
              </div>
            </div>
            <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Global ID</p>
                <p className="text-xs font-mono text-white mt-1">{car.car_id}</p>
            </div>
          </header>

          {/* This component handles the actual editing logic */}
          <EditAssetForm initialData={car} />
        </div>
      </main>
    </>
  );
}