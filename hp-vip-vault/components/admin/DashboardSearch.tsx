"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import AssetIntelligenceCard from "@/components/admin/AssetIntelligenceCard";

export default function DashboardSearch({ cars }: { cars: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCars = useMemo(() => {
    if (!searchQuery) return cars;
    return cars.filter((car) => {
      const searchStr = `${car.make} ${car.model} ${car.registration}`.toLowerCase();
      return searchStr.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, cars]);

  return (
    <div className="space-y-6">
      {/* SEARCH BAR */}
      <div className="relative">
        <Search
          className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 transition-colors"
          size={18}
        />
        <input
          type="text"
          placeholder="IDENTIFY MAKE, MODEL OR REGISTRATION..."
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

      {/* RESULTS COUNT */}
      {searchQuery && (
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">
          {filteredCars.length} asset{filteredCars.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCars.map((car) => (
          <AssetIntelligenceCard key={car.car_id} car={car} />
        ))}
      </div>

      {/* EMPTY STATE */}
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