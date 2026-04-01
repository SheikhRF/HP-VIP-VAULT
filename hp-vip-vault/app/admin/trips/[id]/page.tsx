import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/navbar";
import { Gauge, MapPin, Calendar, User, ArrowRight, Car, Zap } from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function TripDetailPage({ params }: { params: { id: string } }) {
  // 1. Fetch the specific trip and join with Car/Profile
  // Mapping to your specific schema: car_id and user_id
  const { data: trip } = await supabase
    .from("trips")
    .select(`
      *,
      cars:car_id (*),
      profiles:user_id (*)
    `)
    .eq("trip_id", params.id)
    .single();

  if (!trip) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center font-black uppercase italic tracking-tighter">
        Deployment Record Expired or Missing.
      </div>
    );
  }

  const distance = Number(trip.mileage_after) - Number(trip.mileage_before);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Breadcrumb / Back */}
          <Link href="/admin/trips" className="text-[10px] font-black uppercase text-gray-600 hover:text-orange-500 transition-colors tracking-[0.3em] flex items-center gap-2">
            <ArrowRight size={12} className="rotate-180" /> Back to Archive
          </Link>

          {/* Manifest Header */}
          <div className="border-b border-white/5 pb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-4">
              <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[8px] font-black uppercase rounded-full tracking-widest">
                Manifest UID: {trip.trip_id.slice(0, 8)}
              </span>
              <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
                Sortie <span className="text-orange-500 text-glow-orange">Report</span>
              </h1>
            </div>
            <div className="text-left md:text-right space-y-1">
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Execution Date</p>
              <p className="text-2xl font-black italic uppercase italic">
                {new Date(trip.start_date).toLocaleDateString(undefined, { 
                  year: 'numeric', month: 'long', day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Data Grid: Car & Pilot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] relative overflow-hidden group">
              <Car className="absolute -right-4 -top-4 text-white opacity-5 group-hover:opacity-10 transition-all" size={140} />
              <div className="relative z-10 space-y-4">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Deployed Asset</p>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">
                  {trip.cars?.make} {trip.cars?.model}
                </h2>
                <div className="inline-block px-3 py-1 bg-white/5 rounded text-[10px] font-mono text-gray-400">
                  {trip.cars?.registration}
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] relative overflow-hidden group">
              <User className="absolute -right-4 -top-4 text-orange-500 opacity-5 group-hover:opacity-10 transition-all" size={140} />
              <div className="relative z-10 space-y-4">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Pilot in Command</p>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">
                  {trip.profiles?.name}
                </h2>
                <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">{trip.profiles?.email}</p>
              </div>
            </div>
          </div>

          {/* Telemetry Visualizer */}
          <div className="bg-white/[0.02] border border-white/5 p-12 rounded-[3rem] space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
              
              <div className="space-y-2">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Start ODO</p>
                <p className="text-5xl font-black italic tracking-tighter">{Number(trip.mileage_before).toLocaleString()} <span className="text-sm text-gray-700 not-italic">MI</span></p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
                <div className="py-4">
                  <span className="text-orange-500 font-black italic uppercase text-4xl tracking-tighter drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                    +{distance} MI
                  </span>
                </div>
                <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
              </div>

              <div className="space-y-2 text-center md:text-right">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">End ODO</p>
                <p className="text-5xl font-black italic tracking-tighter">{Number(trip.mileage_after).toLocaleString()} <span className="text-sm text-gray-700 not-italic">MI</span></p>
              </div>
            </div>

            {/* Optional Description / Notes section */}
            <div className="pt-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} /> Log Timestamp
                  </p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider italic">
                    {new Date(trip.start_date).toLocaleTimeString()} UTC
                  </p>
               </div>
               <div className="space-y-4">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                    <Zap size={12} /> Efficiency Score
                  </p>
                  <p className="text-xs font-bold text-orange-500 uppercase tracking-wider italic">
                    Operational Excellence Confirmed
                  </p>
               </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}