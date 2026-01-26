"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Shadcn
import { Badge } from "@/components/ui/badge"; // Shadcn
import { Gauge, MapPin, Zap, ChevronRight, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function AssetIntelligenceCard({ car }: { car: any }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const isCritical = car.mot !== "Valid" || car.tax_status !== "Taxed";

  return (
    <Card 
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsFocused(true)}
      onMouseLeave={() => setIsFocused(false)}
      className="relative overflow-hidden bg-[#0a0a0a] border-white/5 rounded-[2.5rem] transition-all duration-300 group"
    >
      {/* ReactBits Spotlight Effect */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(249,115,22,0.15), transparent 40%)`,
        }}
      />

      <CardHeader className="pb-4 relative z-10">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-orange-500">{car.make}</p>
            <CardTitle className="text-2xl font-black italic uppercase tracking-tighter text-white">
              {car.model}
            </CardTitle>
          </div>
          {isCritical && <AlertTriangle className="text-red-500 animate-pulse" size={18} />}
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <MapPin size={10} />
          <span className="text-[9px] font-bold uppercase tracking-widest">{car.location || "Vault"}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest mb-1">Odometer</p>
            <p className="text-sm font-black italic text-white flex items-center gap-1">
              <Gauge size={12} className="text-orange-500" />
              {Number(car.mileage).toLocaleString()} <span className="text-[8px] opacity-40">MI</span>
            </p>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest mb-1">Power</p>
            <p className="text-sm font-black italic text-white flex items-center gap-1">
              <Zap size={12} className="text-orange-500" />
              {car.engine_power} <span className="text-[8px] opacity-40">HP</span>
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold uppercase text-gray-500 tracking-widest">MOT Compliance</span>
            <Badge variant={car.mot === "Valid" ? "secondary" : "destructive"} className="text-[8px] uppercase tracking-tighter">
              {car.mot || "UNKNOWN"}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold uppercase text-gray-500 tracking-widest">Tax Protocol</span>
            <span className={`text-[10px] font-black uppercase italic ${car.tax_status === "Taxed" ? "text-blue-500" : "text-orange-500"}`}>
              {car.tax_status || "N/A"}
            </span>
          </div>
        </div>

        <Link 
          href={`/cars/${car.car_id}`}
          className="flex items-center justify-center gap-2 w-full bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-orange-500 transition-all"
        >
          View Full Telemetry <ChevronRight size={14} />
        </Link>
      </CardContent>
    </Card>
  );
}