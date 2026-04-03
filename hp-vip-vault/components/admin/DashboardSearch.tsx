"use client";

import { useState, useMemo } from "react";
import { Search, X, CheckCircle2, AlertTriangle, Car } from "lucide-react";
import AssetIntelligenceCard from "@/components/admin/AssetIntelligenceCard";

type FilterType = "all" | "driveable" | "attention";

export default function DashboardSearch({ cars }: { cars: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const isDriveable = (car: any) => {
    const validMot = car.mot === "Valid" || car.mot === "No details held by DVLA";
    const validTax = car.tax_status === "Taxed";
    return validMot && validTax;
  };

  const needsAttention = (car: any) => !isDriveable(car);

  const filteredCars = useMemo(() => {
    let result = cars;

    // Apply filter
    if (activeFilter === "driveable") result = result.filter(isDriveable);
    if (activeFilter === "attention") result = result.filter(needsAttention);

    // Apply search on top of filter
    if (searchQuery) {
      result = result.filter((car) => {
        const searchStr = `${car.make} ${car.model} ${car.registration ?? ""}`.toLowerCase();
        return searchStr.includes(searchQuery.toLowerCase());
      });
    }

    return result;
  }, [searchQuery, activeFilter, cars]);

  const driveableCount = cars.filter(isDriveable).length;
  const attentionCount = cars.filter(needsAttention).length;

  const filters: { key: FilterType; label: string; count: number; icon: any; activeClass: string }[] = [
    {
      key: "all",
      label: "All Assets",
      count: cars.length,
      icon: Car,
      activeClass: "bg-white text-black border-white",
    },
    {
      key: "driveable",
      label: "Driveable",
      count: driveableCount,
      icon: CheckCircle2,
      activeClass: "bg-green-500/20 text-green-400 border-green-500/40",
    },
    {
      key: "attention",
      label: "Needs Attention",
      count: attentionCount,
      icon: AlertTriangle,
      activeClass: "bg-red-500/20 text-red-400 border-red-500/40",
    },
  ];

  return (
    <div className="space-y-6">

      {/* FILTER PILLS */}
      <div className="flex flex-wrap gap-3">
        {filters.map(({ key, label, count, icon: Icon, activeClass }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${
              activeFilter === key
                ? activeClass
                : "bg-white/[0.02] border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300"
            }`}
          >
            <Icon size={11} />
            {label}
            <span className={`ml-1 px-2 py-0.5 rounded-full text-[8px] font-black ${
              activeFilter === key ? "bg-black/20" : "bg-white/5"
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

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
      {(searchQuery || activeFilter !== "all") && (
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