import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/navbar";
import { ArrowRight, Car, User, Zap, Gauge, Calendar } from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function TripDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  // 1. ATTEMPT FETCH BY 'trip_id' (Matches your schema)
  let { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("trip_id", id)
    .single();

  // 2. FALLBACK FETCH BY 'id' (Just in case the column name differs)
  if (!trip) {
    const { data: fallback } = await supabase
      .from("trips")
      .select("*")
      .eq("id", id)
      .single();
    trip = fallback;
  }

  // 3. IF NO TRIP IS FOUND AT ALL
  if (!trip) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col items-center justify-center space-y-6">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-orange-500">Manifest Not Found</h1>
        <p className="text-gray-600 font-mono text-[10px] uppercase tracking-[0.5em]">UID: {id}</p>
        <Link href="/admin/trips" className="px-6 py-2 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
          Return to Archive
        </Link>
      </div>
    );
  }

  // 4. FETCH RELATED DATA SEPARATELY (The "Safe" Way)
  const { data: car } = await supabase.from("cars").select("*").eq("car_id", trip.car_id).single();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", trip.user_id).single();

  const distance = (Number(trip.mileage_after) || 0) - (Number(trip.mileage_before) || 0);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* NAVIGATION */}
          <Link href="/admin/trips" className="group text-[10px] font-black uppercase text-gray-600 hover:text-orange-500 transition-colors tracking-[0.3em] flex items-center gap-2">
            <ArrowRight size={12} className="rotate-180 transition-transform group-hover:-translate-x-1" /> Back to Archive
          </Link>

          {/* HEADER */}
          <div className="border-b border-white/5 pb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-4">
              <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[8px] font-black uppercase rounded-full tracking-widest">
                Sortie UID: {trip.trip_id || id}
              </span>
              <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
                Sortie <span className="text-orange-500 text-glow-orange">Report</span>
              </h1>
            </div>
            <div className="text-left md:text-right space-y-1">
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Log Date</p>
              <p className="text-2xl font-black italic uppercase italic">
                {new Date(trip.start_date || trip.created_at).toLocaleDateString(undefined, { 
                  year: 'numeric', month: 'long', day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* ASSET & PILOT GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CAR CARD */}
            <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] relative overflow-hidden group">
              <Car className="absolute -right-4 -top-4 text-white opacity-5 group-hover:opacity-10 transition-all" size={140} />
              <div className="relative z-10 space-y-4">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest italic">Deployed Asset</p>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">
                  {car ? `${car.make} ${car.model}` : "Asset Link Severed"}
                </h2>
                <div className="inline-block px-3 py-1 bg-white/5 rounded text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                  {car?.registration || "Unknown Plate"}
                </div>
              </div>
            </div>

            {/* DRIVER CARD */}
            <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] relative overflow-hidden group">
              <User className="absolute -right-4 -top-4 text-orange-500 opacity-5 group-hover:opacity-10 transition-all" size={140} />
              <div className="relative z-10 space-y-4">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest italic">Pilot in Command</p>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">
                  {profile?.name || "Unknown Identity"}
                </h2>
                <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">{profile?.email || "ID Redacted"}</p>
              </div>
            </div>
          </div>

          {/* TELEMETRY READOUT */}
          <div className="bg-white/[0.02] border border-white/5 p-12 rounded-[3rem] space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
              
              <div className="space-y-2">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Initial ODO</p>
                <p className="text-5xl font-black italic tracking-tighter">
                    {Number(trip.mileage_before).toLocaleString()} <span className="text-sm text-gray-700 not-italic uppercase">MI</span>
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
                <div className="py-4">
                  <span className="text-orange-500 font-black italic uppercase text-5xl tracking-tighter drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                    +{distance} MI
                  </span>
                </div>
                <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
              </div>

              <div className="space-y-2 text-center md:text-right">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Final ODO</p>
                <p className="text-5xl font-black italic tracking-tighter">
                    {Number(trip.mileage_after).toLocaleString()} <span className="text-sm text-gray-700 not-italic uppercase">MI</span>
                </p>
              </div>
            </div>

            {/* TRIP STATUS FOOTER */}
            <div className="pt-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} /> Log Timestamp
                  </p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider italic">
                    {new Date(trip.start_date || trip.created_at).toLocaleTimeString()} UTC
                  </p>
               </div>
               <div className="space-y-4 text-left md:text-right">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest flex items-center md:justify-end gap-2">
                    <Gauge size={12} /> System Status
                  </p>
                  <p className="text-xs font-bold text-orange-500 uppercase tracking-wider italic">
                    Telematics Verified
                  </p>
               </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}