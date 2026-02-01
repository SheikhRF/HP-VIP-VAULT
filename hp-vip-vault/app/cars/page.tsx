import { auth } from "@clerk/nextjs/server";
import { PlusCircle, ShieldAlert, Gauge } from "lucide-react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/navbar";
import PublicFleet from "@/components/PublicFleet";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const dynamic = "force-dynamic";

export default async function CarsPage() {
  const { sessionClaims } = await auth();
  const isAdmin = sessionClaims?.Role === "admin" || sessionClaims?.role === "admin";

  const { data, error } = await supabase
    .from("cars")
    .select("car_id, make, model, pictures")
    .order('car_id', { ascending: false });

  const cars = (data || []) as any[];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white px-6 py-12 flex flex-col items-center">
        
        {/* Header Section - Borders and Subtext Updated */}
        <div className="w-full max-w-7xl flex flex-col md:flex-row items-end justify-between mb-12 border-b border-white/5 pb-8 gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none text-white">
              The <span className="text-orange-500">Collection</span>
            </h1>
            {/* Subtext updated to strict Vault style */}
            <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.5em] ml-1">
              Active Vault Inventory
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
            <div className="flex items-center gap-3 bg-[#1a1a1a] border border-white/5 px-6 py-4 rounded-full opacity-50">
              <ShieldAlert size={18} className="text-gray-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Admin Only</span>
            </div>
          )}
        </div>

        {/* Error Handling - Border Updated */}
        {error && (
          <div className="w-full max-w-2xl bg-red-500/10 border border-red-500/20 p-6 rounded-3xl mb-12">
            <p className="text-red-500 font-black uppercase italic tracking-tight text-sm text-center">
              Uplink Interrupted: {error.message}
            </p>
          </div>
        )}

        {/* Client-Side Fleet Inventory */}
        {!error && cars && <PublicFleet initialCars={cars} />}

        {/* Global Empty State - Border Updated */}
        {!error && (!cars || cars.length === 0) && (
          <div className="text-center py-24 space-y-4">
            <Gauge size={48} className="mx-auto text-gray-800 animate-pulse" />
            <p className="text-gray-600 font-black uppercase tracking-[0.3em] text-[10px]">No records found in current vault.</p>
          </div>
        )}
      </main>
    </>
  );
}