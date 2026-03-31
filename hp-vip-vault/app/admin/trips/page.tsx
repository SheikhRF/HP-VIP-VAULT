import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/navbar";
import TripList from "@/components/admin/trip-list";
import { Zap, Star, History } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminTripsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // 1. Get Weekly Stats (Manual Join for Stability)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { data: rawTrips } = await supabase
    .from("trips")
    .select("*")
    .gt("created_at", oneWeekAgo.toISOString());

  const { data: allCars } = await supabase.from("cars").select("*");

  // Find Biggest Gainer Logic
  let biggestGainer = null;
  let maxGain = 0;

  if (rawTrips && allCars) {
    rawTrips.forEach(trip => {
      const gain = (trip.end_mileage || 0) - (trip.start_mileage || 0);
      if (gain > maxGain) {
        maxGain = gain;
        const carMatch = allCars.find(c => c.id === trip.car_id);
        biggestGainer = { ...trip, car_name: carMatch ? `${carMatch.make} ${carMatch.model}` : "Unknown Asset" };
      }
    });
  }

  // 2. Highest Rated Car (Using 'rating' column or 'id' as fallback)
  const { data: topCar } = await supabase
    .from("cars")
    .select("*")
    .order("rating", { ascending: false }) // Ensure you have a 'rating' column in Supabase
    .limit(1)
    .single();

  // 3. Initial 10 Trips (Manual Join to ensure they show up)
  const { data: initialTripsRaw } = await supabase
    .from("trips")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: allProfiles } = await supabase.from("profiles").select("id, name");

  const initialTrips = initialTripsRaw?.map(trip => ({
    ...trip,
    car_details: allCars?.find(c => c.id === trip.car_id),
    user_name: allProfiles?.find(p => p.id === trip.user_id)?.name || "Unknown Driver"
  }));

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <header className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
              Deployment <span className="text-orange-500 text-glow-orange">Archive</span>
            </h1>
          </header>

          {/* TOP STATS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Biggest Gainer Card */}
            <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] relative overflow-hidden group">
              <Zap className="absolute -right-6 -top-6 text-orange-500 opacity-5 group-hover:opacity-15 transition-all" size={180} />
              <div className="relative z-10 space-y-2">
                <p className="text-[8px] font-black text-orange-500 uppercase tracking-[0.4em]">Weekly Top Gainer</p>
                <h3 className="text-5xl font-black italic uppercase">
                  {biggestGainer?.car_name || "No Sorties"}
                </h3>
                <p className="text-2xl font-black text-white italic">
                  +{maxGain} <span className="text-gray-600 text-sm italic">MILES GAINED</span>
                </p>
              </div>
            </div>

            {/* Highest Rated Card */}
            <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] relative overflow-hidden group">
              <Star className="absolute -right-6 -top-6 text-white opacity-5 group-hover:opacity-15 transition-all" size={180} />
              <div className="relative z-10 space-y-2">
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.4em]">Highest Rated Asset</p>
                <h3 className="text-5xl font-black italic uppercase">
                  {topCar ? `${topCar.make} ${topCar.model}` : "Pending Data"}
                </h3>
                <p className="text-2xl font-black text-orange-500 italic uppercase">
                   {topCar?.rating || "N/A"} <span className="text-gray-600 text-sm italic underline decoration-orange-500/50">Performance Score</span>
                </p>
              </div>
            </div>
          </div>

          {/* TRIP LIST */}
          <div className="space-y-8 pt-10">
             <div className="flex items-center gap-4">
               <History size={18} className="text-orange-500" />
               <h2 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.5em]">Full Operational History</h2>
             </div>
             
             <TripList initialTrips={initialTrips || []} />
          </div>

        </div>
      </main>
    </>
  );
}