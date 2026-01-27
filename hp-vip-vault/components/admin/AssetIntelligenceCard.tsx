// components/admin/AssetIntelligenceCard.tsx
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gauge, Zap, ChevronRight, AlertTriangle, ShieldCheck, Activity, Banknote, Coins, CreditCard} from "lucide-react";

export default function AssetIntelligenceCard({ car }: { car: any }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  // ReactBits Spotlight Logic
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  
  const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0, // Removes .00 for a cleaner look
  }).format(amount);
};

  const isCritical = car.mot !== "Valid" || car.tax_status !== "Taxed";

  return (
    <Card 
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className="relative overflow-hidden bg-[#0a0a0a] border-white/5 rounded-[2rem] transition-all duration-500 group"
    >
      {/* ReactBits Spotlight Effect */}
      <div
        className="pointer-events-none absolute -inset-px transition duration-500 z-0"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(249,115,22,0.1), transparent 40%)`,
        }}
      />

      <CardHeader className="relative z-10 pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-orange-500 leading-none">
               {car.registration != "NULL" ? car.registration : "UNREGISTERED"}
            </p>
            <CardTitle className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none pt-1">
              {car.make} <span className="text-gray-400">{car.model}</span>
            </CardTitle>
          </div>
          {isCritical ? (
            <Badge variant="destructive" className="animate-pulse rounded-full p-1 px-2">
              <AlertTriangle size={12} className="mr-1" /> ALERT
            </Badge>
          ) : (
            <ShieldCheck className="text-green-500 opacity-50" size={20} />
          )}
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-6">
        {/* Telemetry Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5 group-hover:border-orange-500/20 transition-colors">
            <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest mb-1">Total Mileage</p>
            <p className="text-sm font-black italic text-white flex items-center gap-2">
              <Gauge size={14} className="text-orange-500" />
              {Number(car.mileage).toLocaleString() || "0"} <span className="text-[8px] opacity-30">MI</span>
            </p>
          </div>
          <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5 group-hover:border-orange-500/20 transition-colors">
            <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest mb-1">Price</p>
            <p className="text-sm font-black italic text-white flex items-center gap-2">
              <Banknote size={14} className="text-orange-500" />
              {formatCurrency(Number(car.price)) || "???"}
            </p>
          </div>
        </div>

        {/* DVLA Compliance HUD */}
        <div className="space-y-2 border-t border-white/5 pt-4">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
            <span className="text-gray-500 flex items-center gap-1"><Activity size={10}/> MOT Status</span>
            <span className={car.mot === "Valid" ? "text-green-500" : car.mot === "No details held by DVLA" ? "text-white-500" :"text-red-500 font-black"}>
              {car.mot || "UNKNOWN"}
            </span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
            <span className="text-gray-500 flex items-center gap-1"><ShieldCheck size={10}/> Tax Protocol</span>
            <span className={car.tax_status === "Taxed" ? "text-blue-500" : "text-orange-500 font-black"}>
              {car.tax_status || "UNKNOWN"}
            </span>
          </div>
        </div>

        <Link 
          href={`/cars/${car.car_id}`}
          className="flex items-center justify-center gap-2 w-full bg-white text-black py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-orange-500 hover:scale-[1.02] transition-all duration-300"
        >
          View Detailed Intel <ChevronRight size={14} />
        </Link>
      </CardContent>
    </Card>
  );
}