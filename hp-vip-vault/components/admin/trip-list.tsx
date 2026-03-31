"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ArrowUpRight } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TripList({ initialTrips }: { initialTrips: any[] }) {
  const [trips, setTrips] = useState(initialTrips);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("trips")
      .select(`*, cars(make, model, plate), profiles(name)`)
      .order("created_at", { ascending: false })
      .range(trips.length, trips.length + 9);

    if (data) {
      setTrips([...trips, ...data]);
      if (data.length < 10) setHasMore(false);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
        <table className="w-full text-left">
          <tbody className="divide-y divide-white/5">
            {trips.map((trip) => (
              <tr key={trip.id} className="group hover:bg-white/[0.01] transition-colors">
                <td className="px-8 py-8">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Asset</p>
                  <p className="text-sm font-black italic uppercase text-white group-hover:text-orange-500 transition-colors">
                    {trip.cars?.make} {trip.cars?.model}
                  </p>
                </td>
                <td className="px-8 py-8">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Driver</p>
                  <p className="text-[10px] font-bold uppercase text-gray-400 italic">{trip.profiles?.name}</p>
                </td>
                <td className="px-8 py-8">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Distance</p>
                  <p className="text-sm font-black italic text-orange-500">
                    +{(trip.end_mileage || 0) - (trip.start_mileage || 0)} MI
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
          className="w-full py-6 bg-white/[0.02] border border-white/5 rounded-3xl text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 hover:text-white hover:border-orange-500/50 transition-all flex items-center justify-center gap-3"
        >
          {loading ? "Syncing..." : "Decrypt More Records"} <ArrowUpRight size={14} />
        </button>
      )}
    </div>
  );
}