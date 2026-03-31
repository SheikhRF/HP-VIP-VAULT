import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/navbar";
import { Zap, Route, Car } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch Profile
  const { data: user } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center font-black uppercase italic tracking-tighter">
        Driver Identity Not Found in Vault
      </div>
    );
  }

  // 2. Fetch Trips with car details
  const { data: trips } = await supabase
    .from("trips")
    .select(`
      *,
      cars:car_id (make, model)
    `)
    .eq("user_id", id)
    .order("start_date", { ascending: false });

  // 3. Calculate stats from trips
  const totalMileage = trips?.reduce((acc: number, trip: any) => {
    return acc + (Number(trip.mileage_after || 0) - Number(trip.mileage_before || 0));
  }, 0) || 0;

  const uniqueCars = new Set(trips?.map((t: any) => t.car_id)).size;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
            <Link href="/admin/users" className="flex items-center gap-2 text-gray-500 hover:text-orange-500 text-[9px] font-black uppercase tracking-widest transition-colors">
                <ArrowLeft size={12} /> Back to User Registry
          </Link>  

          {/* HEADER */}
          <div className="space-y-4 border-b border-white/5 pb-12">
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
              {user.name.split(' ')[0]} <span className="text-orange-500">History</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.5em]">
              Driver File • {user.email}
            </p>
          </div>

          {/* TOTALS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard icon={<Zap size={20}/>} label="Total Distance" value={`${totalMileage} mi`} />
            <StatCard icon={<Route size={20}/>} label="Total Drives" value={trips?.length || 0} />
            <StatCard icon={<Car size={20}/>} label="Cars Driven" value={uniqueCars} />
          </div>

          {/* TRIP LOG */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em]">Deployment Log</h3>
            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
              {trips && trips.length > 0 ? (
                <table className="w-full text-left">
                  <thead className="bg-white/[0.01] border-b border-white/5">
                    <tr>
                      <th className="px-8 py-4 text-[8px] font-black uppercase text-gray-600 tracking-widest">Asset</th>
                      <th className="px-8 py-4 text-[8px] font-black uppercase text-gray-600 tracking-widest">Distance</th>
                      <th className="px-8 py-4 text-[8px] font-black uppercase text-gray-600 tracking-widest">Rating</th>
                      <th className="px-8 py-4 text-[8px] font-black uppercase text-gray-600 tracking-widest">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {trips.map((trip: any) => (
                      <tr key={trip.trip_id} className="hover:bg-white/[0.01]">
                        <td className="px-8 py-6">
                          <p className="text-xs font-black uppercase italic">
                            {trip.cars?.make} {trip.cars?.model}
                          </p>
                        </td>
                        <td className="px-8 py-6 text-xs font-bold text-orange-500 italic">
                          +{Number(trip.mileage_after) - Number(trip.mileage_before)} mi
                        </td>
                        <td className="px-8 py-6 text-xs font-black text-white">
                          {trip.rating}/5
                        </td>
                        <td className="px-8 py-6 text-[10px] text-gray-500 uppercase font-black">
                          {new Date(trip.start_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-8 py-16 text-center text-gray-600 font-black uppercase italic tracking-widest text-sm">
                  No drives logged yet
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </>
  );
}

function StatCard({ icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl space-y-4">
      <div className="text-orange-500">{icon}</div>
      <div>
        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black italic text-white uppercase">{value}</p>
      </div>
    </div>
  );
}