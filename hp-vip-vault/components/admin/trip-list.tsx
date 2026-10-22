"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link"; // Added for navigation

interface Trip {
  trip_id: number;
  car_name: string;
  car_plate: string;
  user_name: string;
  mileage_before: number;
  mileage_after: number;
  start_date: string;
}

export default function TripList({ initialTrips }: { initialTrips: Trip[] }) {
  const [trips, setTrips] = useState(initialTrips);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTrips.length >= 10);

  const loadMore = async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/trips?offset=${trips.length}&limit=10`);
      const data = await res.json();

      if (res.ok && data.trips?.length > 0) {
        setTrips((prev) => [...prev, ...data.trips]);
        if (data.trips.length < 10) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-white/5">
            {trips.map((trip) => (
              <tr
                key={trip.trip_id}
                className="group relative hover:bg-white/[0.01] transition-all cursor-pointer"
              >
                {/* THE HITBOX LINK:
                   This covers the entire <tr>. pointer-events-none is used on the
                   cells below so they don't block the click to this link.
                */}
                <td className="p-0">
                  <Link
                    href={`/admin/trips/${trip.trip_id}`}
                    className="absolute inset-0 z-0"
                  />
                </td>

                <td className="px-8 py-8 relative z-10 pointer-events-none">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Asset</p>
                  <p className="text-sm font-black italic uppercase text-white group-hover:text-orange-500 transition-colors">
                    {trip.car_name}
                  </p>
                  <p className="text-[9px] font-mono text-gray-700 uppercase">{trip.car_plate}</p>
                </td>

                <td className="px-8 py-8 relative z-10 pointer-events-none">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Driver</p>
                  <p className="text-[10px] font-bold uppercase text-gray-400 italic">{trip.user_name}</p>
                </td>

                <td className="px-8 py-8 relative z-10 pointer-events-none">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Distance</p>
                  <p className="text-sm font-black italic text-orange-500">
                    +{Number(trip.mileage_after) - Number(trip.mileage_before)} MI
                  </p>
                </td>

                <td className="px-8 py-8 text-right relative z-10 pointer-events-none">
                  <p className="text-[10px] font-black text-gray-700 uppercase italic">
                    {new Date(trip.start_date).toLocaleDateString()}
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
