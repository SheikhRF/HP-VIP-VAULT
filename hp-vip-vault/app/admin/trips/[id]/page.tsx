import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/navbar";
import { ArrowRight, Car, User, Zap, Gauge, Calendar, Star, FileText } from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function TripDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  // 1. Fetch trip (Checks 'trip_id' first, then 'id')
  let { data: trip } = await supabase.from("trips").select("*").eq("trip_id", id).single();
  if (!trip) {
    const { data: fallback } = await supabase.from("trips").select("*").eq("id", id).single();
    trip = fallback;
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center font-black uppercase italic tracking-tighter">
        Manifest Not Found in Vault
      </div>
    );
  }

  // 2. Fetch Linked Data
  const { data: car } = await supabase.from("cars").select("*").eq("car_id", trip.car_id).single();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", trip.user_id).single();

  const distance = (Number(trip.mileage_after) || 0) - (Number(trip.mileage_before) || 0);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          
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
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
               <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Driver Rating</p>
               <div className="flex items-center gap-1 text-orange-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < (trip.rating || 0) ? "currentColor" : "none"} className={i < (trip.rating || 0) ? "opacity-100" : "opacity-20"} />
                  ))}
                  <span className="ml-2 text-xl font-black italic">{trip.rating || 0}/5</span>
               </div>
            </div>
          </div>

          {/* ASSET & PILOT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] relative overflow-hidden group">
              <Car className="absolute -right-4 -top-4 text-white opacity-5" size={140} />
              <div className="relative z-10 space-y-4">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest italic">Deployed Asset</p>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">{car?.make} {car?.model}</h2>
                <div className="inline-block px-3 py-1 bg-white/5 rounded text-[10px] font-mono text-gray-400 uppercase tracking-widest">{car?.registration}</div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] relative overflow-hidden group">
              <User className="absolute -right-4 -top-4 text-orange-500 opacity-5" size={140} />
              <div className="relative z-10 space-y-4">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest italic">Pilot in Command</p>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">{profile?.name}</h2>
                <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">{profile?.email}</p>
              </div>
            </div>
          </div>

          {/* TELEMETRY READOUT */}
          <div className="bg-white/[0.02] border border-white/5 p-12 rounded-[3rem] space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
              <div className="space-y-2">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest italic">Departure: {new Date(trip.start_date).toLocaleDateString()}</p>
                <p className="text-5xl font-black italic tracking-tighter">
                    {Number(trip.mileage_before).toLocaleString()} <span className="text-sm text-gray-700">MI</span>
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
                <span className="text-orange-500 font-black italic uppercase text-5xl py-4 tracking-tighter drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                    +{distance} MI
                </span>
                <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
              </div>

              <div className="space-y-2 text-center md:text-right">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest italic">Arrival: {new Date(trip.end_date).toLocaleDateString()}</p>
                <p className="text-5xl font-black italic tracking-tighter">
                    {Number(trip.mileage_after).toLocaleString()} <span className="text-sm text-gray-700">MI</span>
                </p>
              </div>
            </div>

            {/* SORTIE NOTES */}
            <div className="pt-12 border-t border-white/5 space-y-6">
               <div className="flex items-center gap-3">
                  <FileText size={16} className="text-gray-600" />
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.4em]">Post-Sortie Observations</p>
               </div>
               <div className="bg-white/[0.01] border border-white/5 p-8 rounded-3xl">
                  <p className="text-lg font-medium text-gray-300 italic leading-relaxed tracking-tight">
                    {trip.notes ? `"${trip.notes}"` : "No observations recorded for this manifest."}
                  </p>
               </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}