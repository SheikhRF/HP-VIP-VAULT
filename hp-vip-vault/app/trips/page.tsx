import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/navbar";
import MyTripList from "@/components/MyTripList";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export default async function MyTripsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [{ data: rawTrips }, { data: allCars }] = await Promise.all([
    supabase.from("trips").select("*").eq("user_id", userId).order("start_date", { ascending: false }).limit(10),
    supabase.from("cars").select("car_id, make, model, registration"),
  ]);

  const initialTrips = (rawTrips || []).map((trip) => {
    const car = allCars?.find((c) => c.car_id === trip.car_id);
    return {
      ...trip,
      car_name: car ? `${car.make} ${car.model}` : "Asset Deleted",
      car_plate: car?.registration || "N/A",
    };
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
              My <span className="text-orange-500">Trips</span>
            </h1>
            <Link
              href="/cars"
              className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full font-black uppercase tracking-widest text-[9px] transition-all hover:bg-orange-500"
            >
              <Plus size={12} /> Log a Trip
            </Link>
          </div>

          <MyTripList initialTrips={initialTrips} />
        </div>
      </main>
    </>
  );
}
