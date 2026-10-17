import Navbar from "@/components/navbar";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Plus, ChevronLeft, Gauge, Zap, Shield, Database, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import CarGallery from "@/components/CarGallery";
import Reveal from "@/components/Reveal";
import SpeedBackdrop from "@/components/SpeedBackdrop";
import GaugeDial from "@/components/GaugeDial";
import CountUp from "@/components/CountUp";

export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Missing Supabase Config");
  return createClient(url, key);
}

// Format price with commas
const formatPrice = (price: number | string | null) => {
  if (!price) return "POA";
  const num = typeof price === 'string' ? parseInt(price) : price;
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(num);
};

function SpecRow({ label, value }: { label: string; value: any }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-3 group hover:bg-white/[0.02] transition-colors px-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</span>
      <span className="text-xs font-bold text-white tracking-tight">{value}</span>
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

  // Fetch car data and trip intelligence in parallel — trips only needs
  // carId, not the car fetch's result, so there's no reason to serialize them.
  // A transient network hiccup to Supabase makes either promise *reject*
  // (not just resolve with an `error` field), which would otherwise crash
  // the whole Server Component render — catch it and retry once before
  // falling back, since these failures are typically momentary.
  const fetchCarAndTrips = () =>
    Promise.all([
      supabase.from("cars").select("*").eq("car_id", carId).single(),
      supabase.from("trips").select("rating").eq("car_id", carId),
    ]);

  const result = await fetchCarAndTrips().catch(() => fetchCarAndTrips().catch(() => null));

  const car = result ? result[0].data : null;
  const error = result ? result[0].error : true;
  const trips = result ? result[1].data : null;

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

  // Calculate Trip Stats
  const totalTrips = trips?.length || 0;
  const averageRating = totalTrips > 0 
    ? (trips!.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0) / totalTrips).toFixed(1)
    : "0.0";

  const pictures: string[] = Array.isArray(car.pictures) ? car.pictures : [];
  const title = `${car.make ?? ""} ${car.model ?? ""}`.trim() || "Asset";

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background text-foreground pb-20">
        {/* Header HUD */}
        <div className="relative overflow-hidden">
          <SpeedBackdrop variant="corner" intensity="subtle" />
          <Reveal className="max-w-7xl mx-auto px-6 pt-10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
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

            <Button asChild variant="vault" className="hover-shine px-8 py-4 gap-3 tracking-tighter shadow-[0_0_30px_rgba(249,115,22,0.4)]">
              <Link href={`/trips/add?car_id=${carId}`}>
                <Plus size={20} strokeWidth={3} />
                Add Trip
              </Link>
            </Button>
          </Reveal>
        </div>

        {/* Cinematic Gallery */}
        <CarGallery pictures={pictures} title={title} />

        {/* Technical Briefing Grid */}
        <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <Reveal delay={0} className="bg-[#1a1a1a] border border-gray-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <Database className="absolute -right-4 -top-4 text-white/5 animate-ghost-drift" size={160} />
                <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                    <div className="h-1 w-8 bg-primary" /> Technical Intelligence
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                    <SpecRow label="Acceleration (0-100km/h)" value={car.acceleration_0_100} />
                    <SpecRow label="Max Speed" value={car.max_speed} />
                    <SpecRow label="Engine Power" value={car.engine_power} />
                    <SpecRow label="Max Torque" value={car.max_torque} />
                    <SpecRow label="Engine Capacity" value={car.engine_capacity} />
                    <SpecRow label="Cylinder Layout" value={car.cylinder_layout} />
                    <SpecRow label="Cylinders" value={car.number_of_cylinders} />
                    <SpecRow label="Gearbox" value={car.gearbox_type} />
                    <SpecRow label="Gears" value={car.number_of_gears} />
                    <SpecRow label="Drive Wheels" value={car.drive_wheels} />
                </div>
            </Reveal>

            <Reveal delay={100} className="bg-[#1a1a1a] border border-gray-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <Activity className="absolute -right-4 -top-4 text-white/5 animate-ghost-drift" size={160} />
                <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3 text-white">
                    <div className="h-1 w-8 bg-primary" /> Chassis & Capacity
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                    <SpecRow label="Body type" value={car.body_type} />
                    <SpecRow label="Curb weight" value={car.curb_weight} />
                    <SpecRow label="Fuel capacity" value={car.fuel_tank_capacity} />
                    <SpecRow label="Trunk Capacity" value={car.max_trunk_capacity} />
                    <SpecRow label="Seating" value={car.number_of_seats} />
                </div>
            </Reveal>

            <Reveal delay={200} className="bg-[#1a1a1a] border border-gray-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3 text-primary">
                    <div className="h-1 w-8 bg-white" /> DVLA DATA
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                    <SpecRow label="MOT Status" value={car.mot} />
                    <SpecRow label="Tax status" value={car.tax_status} />
                    <SpecRow label="Tax due" value={car.tax_due_date} />
                    <SpecRow label="Manufacture Year" value={car.year_of_manufacture} />
                    <SpecRow label="Registration" value={car.registration} />
                </div>
            </Reveal>
          </div>

          {/* Sidebar: Financials & Identity Intelligence */}
          <div className="gap-8 grid flex flex-col items-start h-fit">
             <Reveal delay={200} className="hover-shine bg-primary p-10 rounded-[2.5rem] text-black shadow-[0_0_50px_rgba(249,115,22,0.2)] w-full">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-70">Valuation</p>
                <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-6">
                  {car.price ? (
                    <CountUp
                      value={Number(car.price)}
                      format={(n) => formatPrice(Math.round(n))}
                    />
                  ) : (
                    "POA"
                  )}
                </h3>
                <div className="space-y-4 border-t border-black/10 pt-6">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold uppercase tracking-widest">Odometer</span>
                        <span className="text-sm font-black italic">
                          <CountUp value={Number(car.mileage) || 0} /> MI
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold uppercase tracking-widest">Location</span>
                        <span className="text-sm font-black italic">{car.location ?? "VAULT"}</span>
                    </div>
                </div>
             </Reveal>

             <Reveal delay={300} className="hover-shine bg-primary p-10 rounded-[2.5rem] text-black shadow-[0_0_50px_rgba(249,115,22,0.2)] w-full">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-70">RATING</p>
                <GaugeDial value={Number(averageRating)} max={5} label={`${averageRating} / 5.0`} className="mb-2 max-w-[220px]" />
                <div className="space-y-4 border-t border-black/10 pt-6">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold uppercase tracking-widest">Total Trips</span>
                        <span className="text-sm font-black italic">
                          <CountUp value={totalTrips} /> {totalTrips === 1 ? "DRIVE" : "DRIVES"}
                        </span>
                    </div>
                </div>
             </Reveal>
          </div>

        </div>
      </main>
    </>
  );
}