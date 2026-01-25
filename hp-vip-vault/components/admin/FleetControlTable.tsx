// components/admin/FleetControlTable.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Gauge, Zap, FileWarning, CheckCircle2, ArrowRight } from "lucide-react";

export default function FleetControlTable({ initialCars }: { initialCars: any[] }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredFleet = useMemo(() => {
    return initialCars.filter(car => {
      const matchSearch = `${car.make} ${car.model}`.toLowerCase().includes(search.toLowerCase());
      if (activeFilter === "mot") return matchSearch && car.mot !== "Valid";
      if (activeFilter === "tax") return matchSearch && car.tax_status !== "Taxed";
      return matchSearch;
    });
  }, [search, activeFilter, initialCars]);

  return (
    <div className="space-y-6">
      {/* Search & Filter HUD */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-[#1a1a1a] p-4 rounded-3xl border border-gray-800">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
          <input 
            placeholder="SCAN ASSETS..." 
            className="w-full bg-black border border-gray-800 rounded-2xl px-12 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {["all", "mot", "tax"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                activeFilter === f 
                ? "bg-primary border-primary text-black" 
                : "bg-black border-gray-800 text-gray-500 hover:border-gray-600"
              }`}
            >
              {f === "all" ? "Full Fleet" : `${f} Status Alerts`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-black/40">
                <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Asset Identity</th>
                <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Output (HP)</th>
                <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">0-60 Velocity</th>
                <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Compliance</th>
                <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Tax Protocol</th>
                <th className="px-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredFleet.map((car) => (
                <tr key={car.car_id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex flex-col leading-tight">
                      <span className="text-[10px] text-primary font-black uppercase tracking-widest">{car.make}</span>
                      <span className="text-lg font-black italic text-white uppercase tracking-tighter">{car.model}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-white font-mono font-bold">
                      <Zap size={14} className="text-primary" />
                      {car.engine_power || "---"}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-white font-mono font-bold">
                      <Gauge size={14} className="text-primary" />
                      {car.acceleration_0_100 || "---"}s
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      car.mot === "Valid" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                    }`}>
                      {car.mot === "Valid" ? <CheckCircle2 size={10} /> : <FileWarning size={10} />}
                      MOT: {car.mot || "UNKNOWN"}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      car.tax_status === "Taxed" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" : "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                    }`}>
                      TAX: {car.tax_status || "UNKNOWN"}
                    </div>
                  </td>
                  <td className="px-8 text-right">
                    <Link href={`/cars/${car.car_id}`} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black border border-gray-800 text-gray-500 group-hover:border-primary group-hover:text-primary transition-all">
                      <ArrowRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}