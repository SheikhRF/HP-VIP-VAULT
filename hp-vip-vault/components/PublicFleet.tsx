"use client";

import { useState, useMemo } from "react";
import { Search, X, ChevronRight, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import CarCard from "./CarCard";


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
            <CarCard key={car.car_id} {...car} />
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