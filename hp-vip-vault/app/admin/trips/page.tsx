import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/navbar";
import TripList from "@/components/admin/trip-list";
import { Zap, Star, History, ArrowLeft } from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

interface GainerStats {
  name: string;
  gain: number;
}

export const dynamic = "force-dynamic";

export default async function AdminTripsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // 1. Fetch Raw Data in Parallel
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [
    { data: rawTrips },
    { data: allCars },
    { data: allProfiles }
  ] = await Promise.all([
    supabase.from("trips").select("*").order("start_date", { ascending: false }),
    supabase.from("cars").select("*"),
    supabase.from("profiles").select("id, name")
  ]);

  // 2. Logic: Find Weekly Top Gainer
  let biggestGainer: GainerStats | null = null;
  let maxGain = 0;

  const weeklyTrips = rawTrips?.filter(t => new Date(t.start_date) > oneWeekAgo);

  weeklyTrips?.forEach(trip => {
    // Fixed: use mileage_after/mileage_before to match your schema
    const gain = (Number(trip.mileage_after) || 0) - (Number(trip.mileage_before) || 0);
    if (gain > maxGain) {
      maxGain = gain;
      const car = allCars?.find(c => c.car_id === trip.car_id);
      biggestGainer = {
        name: car ? `${car.make} ${car.model}` : "Unknown Asset",
        gain,
      };
    }
  });

  // Cast to fix TypeScript "never" inference on reassigned vars
  const gainer = biggestGainer as GainerStats | null;

  // 3. Logic: Highest Rated Asset
  const topRatedCar = allCars
    ?.slice()
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];

  // 4. Flatten Data for the Client Component
  const initialTrips = (rawTrips?.slice(0, 10) || []).map(trip => {
    const car = allCars?.find(c => c.car_id === trip.car_id);
    const user = allProfiles?.find(p => p.id === trip.user_id);
    return {
      ...trip,
      car_name: car ? `${car.make} ${car.model}` : "Deleted Asset",
      car_plate: car?.registration || "N/A",
      user_name: user?.name || "Unknown Driver",
    };
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <Link href="/admin/" className="flex items-center gap-2 text-gray-500 hover:text-orange-500 text-[9px] font-black uppercase tracking-widest transition-colors">
                <ArrowLeft size={12} /> Back to Hub
          </Link>
          <header className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
              Deployment <span className="text-orange-500">Archive</span>
            </h1>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Gainer Card */}
            <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] relative overflow-hidden group">
              <Zap className="absolute -right-6 -top-6 text-orange-500 opacity-5 group-hover:opacity-15 transition-all" size={180} />
              <div className="relative z-10 space-y-2">
                <p className="text-[8px] font-black text-orange-500 uppercase tracking-[0.4em]">Weekly Top Gainer</p>
                <h3 className="text-5xl font-black italic uppercase">
                  {gainer?.name || "No Sorties"}
                </h3>
                <p className="text-2xl font-black text-white italic uppercase">
                  +{gainer?.gain || 0}{" "}
                  <span className="text-gray-600 text-sm tracking-widest ml-2">Miles Gained</span>
                </p>
              </div>
            </div>

            {/* Top Rated Card */}
            <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] relative overflow-hidden group">
              <Star className="absolute -right-6 -top-6 text-white opacity-5 group-hover:opacity-15 transition-all" size={180} />
              <div className="relative z-10 space-y-2">
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.4em]">Highest Rated Asset</p>
                <h3 className="text-5xl font-black italic uppercase">
                  {topRatedCar ? `${topRatedCar.make} ${topRatedCar.model}` : "Pending Data"}
                </h3>
                <p className="text-2xl font-black text-orange-500 italic uppercase">
                  {topRatedCar?.rating || "0.0"}{" "}
                  <span className="text-gray-600 text-sm italic tracking-widest ml-2">Score</span>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8 pt-10">
            <div className="flex items-center gap-4">
              <History size={18} className="text-orange-500" />
              <h2 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.5em]">Operational History</h2>
            </div>
            <TripList initialTrips={initialTrips} />
          </div>

        </div>
      </main>
    </>
  );
}