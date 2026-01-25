import Navbar from "@/components/navbar";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Plus, ChevronLeft, Gauge, Zap, Shield, Database } from "lucide-react";

export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Missing Supabase Config");
  return createClient(url, key);
}

function SpecRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-3 group hover:bg-white/[0.02] transition-colors px-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</span>
      <span className="text-xs font-bold text-white tracking-tight">{value ?? "—"}</span>
    </div>
  );
}

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ car_id: string }>;
}) {
  const { car_id } = await params;
  const carId = Number(car_id);
  const supabase = getSupabase();

  const { data: car, error } = await supabase
    .from("cars")
    .select("*")
    .eq("car_id", carId)
    .single();

  if (error || !car) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black italic uppercase text-primary">Asset Not Found</h1>
          <Link href="/cars" className="text-xs font-bold uppercase tracking-[0.3em] text-white underline underline-offset-8">Return to Vault</Link>
        </div>
      </main>
    );
  }

  const pictures: string[] = Array.isArray(car.pictures) ? car.pictures : [];
  const title = `${car.make ?? ""} ${car.model ?? ""}`.trim() || "Asset";

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background text-foreground pb-20">
        {/* Header HUD */}
        <div className="max-w-7xl mx-auto px-6 pt-10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Link href="/cars" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-primary transition-colors mb-4">
              <ChevronLeft size={14} /> Back to Collection
            </Link>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase text-white leading-none">
              {car.make} <span className="text-primary">{car.model}</span>
            </h1>
            <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span className="flex items-center gap-1"><Zap size={12} className="text-primary" /> {car.engine_power ?? "N/A"}</span>
              <span className="flex items-center gap-1"><Gauge size={12} className="text-primary" /> {car.max_speed ?? "N/A"}</span>
              <span className="flex items-center gap-1"><Shield size={12} className="text-primary" /> {car.registration ?? "UNREGISTERED"}</span>
            </div>
          </div>

          <Link
            href={`/trips/add?car_id=${carId}`}
            className="bg-primary text-black px-8 py-4 rounded-full font-black uppercase tracking-tighter flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(249,115,22,0.4)]"
          >
            <Plus size={20} strokeWidth={3} />
            Add Trip
          </Link>
        </div>

        {/* Cinematic Gallery */}
        <section className="w-full overflow-hidden py-4 border-y border-white/5 bg-black/20">
            <div className="flex gap-4 overflow-x-auto px-6 no-scrollbar snap-x">
                {pictures.map((url, i) => (
                    <div key={i} className="relative h-[300px] md:h-[450px] aspect-[16/10] rounded-[2rem] overflow-hidden border border-white/10 shrink-0 snap-center shadow-2xl">
                        <Image src={url} alt={`${title} ${i}`} fill className="object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700" unoptimized />
                    </div>
                ))}
            </div>
        </section>

        {/* Technical Briefing Grid */}
        <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Specifications */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <Database className="absolute -right-4 -top-4 text-white/5" size={160} />
                <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                    <div className="h-1 w-8 bg-primary" /> Technical Spec
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                    <SpecRow label="Acceleration (0–100)" value={car.acceleration_0_100} />
                    <SpecRow label="Body type" value={car.body_type} />
                    <SpecRow label="Engine capacity" value={car.engine_capacity} />
                    <SpecRow label="Cylinder layout" value={car.cylinder_layout} />
                    <SpecRow label="Max torque" value={car.max_torque} />
                    <SpecRow label="Fuel capacity" value={car.fuel_tank_capacity} />
                    <SpecRow label="Gearbox" value={car.gearbox_type} />
                    <SpecRow label="Curb weight" value={car.curb_weight} />
                </div>
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3 text-primary">
                    <div className="h-1 w-8 bg-white" /> DVLA DATA
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                    <SpecRow label="MOT Status" value={car.mot} />
                    <SpecRow label="Tax status" value={car.tax_status} />
                    <SpecRow label="Tax due" value={car.tax_due_date} />
                    <SpecRow label="Manufacture Year" value={car.year_of_manufacture} />
                </div>
            </div>
          </div>

          {/* Sidebar: Financials & Identity */}
          <div className="space-y-8">
             <div className="bg-primary p-10 rounded-[2.5rem] text-black shadow-[0_0_50px_rgba(249,115,22,0.2)]">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-70">Valuation</p>
                <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-6">{car.price ?? "POA"}</h3>
                <div className="space-y-4 border-t border-black/10 pt-6">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold uppercase tracking-widest">Odometer</span>
                        <span className="text-sm font-black italic">{car.mileage ?? "0"} MI</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold uppercase tracking-widest">Location</span>
                        <span className="text-sm font-black italic">{car.location ?? "VAULT"}</span>
                    </div>
                </div>
             </div>

          </div>

        </div>
      </main>
    </>
  );
}