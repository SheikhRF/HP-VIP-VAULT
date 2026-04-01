"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ArrowUpRight, Route } from "lucide-react";

// Use Anon Key for client component
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TripList({ initialTrips }: { initialTrips: any[] }) {
  const [trips, setTrips] = useState(initialTrips);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTrips.length >= 10);

  const loadMore = async () => {
    setLoading(true);
    
    // Fetch next batch
    const { data: rawData } = await supabase
      .from("trips")
      .select("*")
      .order("created_at", { ascending: false })
      .range(trips.length, trips.length + 9);

    if (rawData && rawData.length > 0) {
      // Since we need names, we do a quick parallel fetch for metadata
      const [cars, profiles] = await Promise.all([
        supabase.from("cars").select("id, make, model, plate"),
        supabase.from("profiles").select("id, name")
      ]);

      const formatted = rawData.map(trip => {
        const car = cars.data?.find(c => c.id === trip.car_id);
        const user = profiles.data?.find(p => p.id === trip.user_id);
        return {
          ...trip,
          car_name: car ? `${car.make} ${car.model}` : "Asset Deleted",
          car_plate: car?.plate || "N/A",
          user_name: user?.name || "Unknown Driver"
        };
      });

      setTrips(prev => [...prev, ...formatted]);
      if (rawData.length < 10) setHasMore(false);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
        <table className="w-full text-left">
          <tbody className="divide-y divide-white/5">
            {trips.map((trip) => (
              <tr key={trip.id} className="group hover:bg-white/[0.01] transition-all">
                <td className="px-8 py-8">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Asset</p>
                  <p className="text-sm font-black italic uppercase text-white group-hover:text-orange-500 transition-colors">
                    {trip.car_name}
                  </p>
                  <p className="text-[9px] font-mono text-gray-700 uppercase">{trip.car_plate}</p>
                </td>
                <td className="px-8 py-8">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Driver</p>
                  <p className="text-[10px] font-bold uppercase text-gray-400 italic">{trip.user_name}</p>
                </td>
                <td className="px-8 py-8">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Distance</p>
                  <p className="text-sm font-black italic text-orange-500">
                    +{Number(trip.end_mileage) - Number(trip.start_mileage)} MI
                  </p>
                </td>
                <td className="px-8 py-8 text-right">
                   <p className="text-[10px] font-black text-gray-700 uppercase italic">
                     {new Date(trip.created_at).toLocaleDateString()}
                   </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <button 
          onClick={loadMore}
          disabled={loading}
          className="w-full py-8 bg-white/[0.01] border border-dashed border-white/5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 hover:text-white hover:border-orange-500/50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          {loading ? "Decrypting Records..." : "Show More Deployments"} <ArrowUpRight size={14} />
        </button>
      )}
    </div>
  );
}