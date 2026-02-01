"use client";

import { useState, useMemo } from "react";
import { Search, X, ChevronRight, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

type Car = {
  car_id: number;
  make: string | null;
  model: string | null;
  pictures: string[];
};

export default function PublicFleet({ initialCars }: { initialCars: Car[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  // --- FILTER PROTOCOL ---
  const filteredCars = useMemo(() => {
    return initialCars.filter((car) => {
      const searchStr = `${car.make} ${car.model}`.toLowerCase();
      return searchStr.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, initialCars]);

  return (
    <div className="w-full max-w-7xl space-y-12">
      
      {/* SEARCH BAR SECTION  */}
      
          <div className="relative">
            <Search 
              className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" 
              size={18} 
            />
            <input
              type="text"
              placeholder="INDENTIFY MAKE OR MODEL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#060606] border border-white/5 text-white font-mono text-xs h-16 rounded-2xl pl-16 pr-12 outline-none transition-all placeholder:text-gray-800 uppercase tracking-widest focus:ring-1 focus:ring-orange-500/50 focus:shadow-[0_0_25px_rgba(249,115,22,0.1)]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>

      {/* DYNAMIC GRID - UPDATED CARD BORDERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredCars.map((car) => (
          <Link
            key={car.car_id}
            href={`/cars/${car.car_id}`}
            className="group relative aspect-[4/5] bg-black border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-700 hover:border-orange-500/50 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(0,0,0,1)]"
          >
            {/* Image Layer with Grayscale Protocol */}
            <div className="absolute inset-0 z-0">
              {car.pictures?.[0] ? (
                <img
                  src={car.pictures[0]}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover grayscale-[0.8] group-hover:grayscale-0 transition-all duration-1000 brightness-50 group-hover:brightness-100"
                />
              ) : (
                <div className="w-full h-full bg-[#060606] flex items-center justify-center">
                  <span className="text-gray-900 font-black uppercase text-[10px] tracking-widest">Null Visuals</span>
                </div>
              )}
              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
            </div>

            {/* Footer Info Box */}
            <div className="absolute bottom-0 left-0 w-full p-8 z-10 translate-y-10 group-hover:translate-y-0 transition-transform duration-500 ease-out">
              <div className="space-y-1">
                <span className="text-[10px] text-orange-500 font-black uppercase tracking-[0.2em]">
                  {car.make}
                </span>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">
                  {car.model}
                </h2>
              </div>
              
              <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400">Review Specs</span>
                <ChevronRight size={14} className="text-orange-500" />
              </div>
            </div>

            {/* Inset Border Overlay for depth */}
            <div className="absolute inset-0 border border-white/5 pointer-events-none rounded-[2.5rem]" />
          </Link>
        ))}
      </div>

      {/* EMPTY STATE - VAULT STYLED */}
      {filteredCars.length === 0 && (
        <div className="py-40 text-center border border-dashed border-white/10 rounded-[3rem] bg-white/[0.01]">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-700 animate-pulse">
            Asset not recognized in current collection
          </p>
        </div>
      )}
    </div>
  );
}