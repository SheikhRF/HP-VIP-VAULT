import { auth } from "@clerk/nextjs/server";
import { PlusCircle, ShieldAlert, ChevronRight, Gauge } from "lucide-react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/navbar";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const dynamic = "force-dynamic";

type Car = {
  car_id: number;
  make: string | null;
  model: string | null;
  pictures: string[];
};

export default async function CarsPage() {
  // Check user role - matches your 'Role' claim key
  const { sessionClaims } = await auth();
  const isAdmin = sessionClaims?.Role === "admin" || sessionClaims?.role === "admin";

  // Load cars from Supabase
  const { data, error } = await supabase
    .from("cars")
    .select("car_id, make, model, pictures")
    .order('car_id', { ascending: false });

  const cars = data as Car[] | null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white px-6 py-12 flex flex-col items-center">
        
        {/* Header Section */}
        <div className="w-full max-w-7xl flex flex-col md:flex-row items-end justify-between mb-12 border-b border-gray-800 pb-8 gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
              The <span className="text-orange-500">Collection</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] ml-1">
              Live Asset Inventory • HP.VIP
            </p>
          </div>

          {isAdmin ? (
            <Link
              href="/cars/add"
              className="group bg-orange-500 text-black rounded-full px-8 py-4 font-black uppercase tracking-tighter flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)]"
            >
              <PlusCircle size={20} strokeWidth={3} />
              Add New Car
            </Link>
          ) : (
            <div className="flex items-center gap-3 bg-[#1a1a1a] border border-gray-800 px-6 py-4 rounded-full opacity-50">
              <ShieldAlert size={18} className="text-gray-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Admin Only</span>
            </div>
          )}
        </div>

        {/* Error / Empty State Management */}
        {error && (
          <div className="w-full max-w-2xl bg-red-500/10 border border-red-500 p-6 rounded-3xl mb-12">
            <p className="text-red-500 font-black uppercase italic tracking-tight text-sm">Uplink Interrupted: {error.message}</p>
          </div>
        )}

        {!error && (!cars || cars.length === 0) && (
          <div className="text-center py-24 space-y-4">
            <Gauge size={48} className="mx-auto text-gray-800 animate-pulse" />
            <p className="text-gray-600 font-black uppercase tracking-[0.3em] text-xs">No cars detected in the vault.</p>
          </div>
        )}

        {/* Modern 4-Column Grid */}
        <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {cars?.map((car) => (
            <Link
              key={car.car_id}
              href={`/cars/${car.car_id}`}
              className="group relative aspect-[4/5] bg-[#1a1a1a] border border-gray-800 rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-orange-500/50 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(0,0,0,0.7)]"
            >
            
              {/* Image with Dynamic Grayscale */}
              <div className="absolute inset-0">
                {car.pictures?.[0] ? (
                  <img
                    src={car.pictures[0]}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover grayscale-[0.6] group-hover:grayscale-0 transition-all duration-700 brightness-75 group-hover:brightness-100"
                  />
                ) : (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <span className="text-gray-800 font-black uppercase text-[10px] tracking-widest">Image Missing</span>
                  </div>
                )}
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              </div>

              {/* Card Footer Info */}
              <div className="absolute bottom-0 left-0 w-full p-8 z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-orange-500 font-black uppercase tracking-widest leading-none">
                    {car.make}
                  </span>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">
                    {car.model}
                  </h2>
                </div>
                
                {/* Reveal on Hover Icon */}
                <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white">View Specs</span>
                  <ChevronRight size={14} className="text-orange-500" />
                </div>
              </div>
              
            </Link>
          
          ))}
        </div>
      </main>
    </>
  );
}