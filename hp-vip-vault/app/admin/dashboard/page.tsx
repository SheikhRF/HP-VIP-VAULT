import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/navbar";

export const dynamic = "force-dynamic";

export default async function SimpleAdminPage() {
  const { sessionClaims } = await auth();
  const isAdmin = sessionClaims?.Role === "admin" || sessionClaims?.role === "admin";

  if (!isAdmin) return <div className="p-20 text-white">Unauthorized</div>;

  // Use the Secret Key to bypass all RLS restrictions
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  // Pulling everything from both tables
  const { data: cars } = await supabase.from("cars").select("*");
  const { data: trips } = await supabase.from("trips").select("*");

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black text-white pt-32 pb-20 px-10">
        <h1 className="text-4xl font-black italic uppercase mb-10 text-orange-500">
          System Raw Data <span className="text-white text-sm not-italic ml-4 opacity-50 font-mono">Bypassing RLS</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Table 1: All Cars */}
          <section className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-gray-500">Table: Cars ({cars?.length || 0})</h2>
            <div className="bg-[#111] border border-gray-800 rounded-3xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-[10px] font-mono">
                <thead className="bg-white/5 text-gray-400">
                  <tr>
                    <th className="p-4 border-b border-gray-800 uppercase">ID</th>
                    <th className="p-4 border-b border-gray-800 uppercase">Make/Model</th>
                    <th className="p-4 border-b border-gray-800 uppercase">Reg</th>
                    <th className="p-4 border-b border-gray-800 uppercase">Power</th>
                  </tr>
                </thead>
                <tbody>
                  {cars?.map((car) => (
                    <tr key={car.car_id} className="border-b border-gray-900 hover:bg-white/5">
                      <td className="p-4 text-orange-500 font-bold">{car.car_id}</td>
                      <td className="p-4">{car.make} {car.model}</td>
                      <td className="p-4">{car.registration || "—"}</td>
                      <td className="p-4">{car.engine_power || "—"}</td>
                    </tr>
                  ))}
                  {!cars?.length && <tr><td colSpan={4} className="p-10 text-center opacity-30">NO DATA IN CARS TABLE</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          {/* Table 2: All Trips */}
          <section className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-gray-500">Table: Trips ({trips?.length || 0})</h2>
            <div className="bg-[#111] border border-gray-800 rounded-3xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-[10px] font-mono">
                <thead className="bg-white/5 text-gray-400">
                  <tr>
                    <th className="p-4 border-b border-gray-800 uppercase">Car ID</th>
                    <th className="p-4 border-b border-gray-800 uppercase">Date</th>
                    <th className="p-4 border-b border-gray-800 uppercase">Mileage</th>
                    <th className="p-4 border-b border-gray-800 uppercase">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {trips?.map((trip, idx) => (
                    <tr key={idx} className="border-b border-gray-900 hover:bg-white/5">
                      <td className="p-4 text-orange-500 font-bold">{trip.car_id}</td>
                      <td className="p-4">{trip.start_date}</td>
                      <td className="p-4">{trip.mileage_before} → {trip.mileage_after || "..."}</td>
                      <td className="p-4">{trip.rating}/5</td>
                    </tr>
                  ))}
                  {!trips?.length && <tr><td colSpan={4} className="p-10 text-center opacity-30">NO DATA IN TRIPS TABLE</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}