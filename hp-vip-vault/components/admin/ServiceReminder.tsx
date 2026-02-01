"use client";

import React, { useState, useMemo } from "react";
import { Calendar, CheckCircle2, Loader2, X, ChevronDown, ChevronUp, AlertTriangle, CalendarArrowUp } from "lucide-react";
import Link from "next/link";

export default function ServiceReminder({ cars }: { cars: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<{ id: number; reg: string } | null>(null);
  const [nextDate, setNextDate] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // --- TELEMETRY & CRITICAL CHECK ---
  const { reminders, hasCritical } = useMemo(() => {
    let criticalFound = false;
    const processed = cars
      .filter((car) => car.service_date)
      .map((car) => {
        const today = new Date();
        const dueDate = new Date(car.service_date);
        const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) criticalFound = true; // Trigger alert for closed state

        let statusColor = "text-green-500 border-green-500/20 bg-green-500/5";
        if (diffDays <= 7) statusColor = "text-red-500 border-red-500/20 bg-red-500/5 animate-pulse";
        else if (diffDays <= 30) statusColor = "text-orange-500 border-orange-500/20 bg-orange-500/5";

        return { ...car, diffDays, statusColor };
      })
      .sort((a, b) => a.diffDays - b.diffDays);

    return { reminders: processed, hasCritical: criticalFound };
  }, [cars]);

  const openServiceModal = (carId: number, registration: string) => {
    setSelectedCar({ id: carId, reg: registration });
    setNextDate(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleCommitService = async () => {
    if (!selectedCar || !nextDate) return;
    setIsUpdating(true);
    try {
      const fd = new FormData();
      fd.append("car_id", selectedCar.id.toString());
      fd.append("service_date", nextDate);
      const res = await fetch("/api/admin/update-car", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Link Failure");
      window.location.reload();
    } catch (err) {
      alert("System Error: Update failed.");
    } finally {
      setIsUpdating(false);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-500">
        {/* --- HEADER (VISIBLE ALWAYS) --- */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-xl ${hasCritical ? 'bg-orange-500 text-black animate-bounce' : 'bg-white/5 text-orange-500'}`}>
              {hasCritical ? <AlertTriangle size={18} /> : <Calendar size={18} />}
            </div>
            <div className="text-left">
              <h3 className="text-[10px] font-black uppercase text-white tracking-[0.4em]">Service Telemetry</h3>
              {hasCritical && (
                <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest mt-1">
                  ACTION REQUIRED
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{reminders.length} Assets</span>
            {isOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
          </div>
        </button>

        {/* --- DROPDOWN CONTENT --- */}
        <div className={`px-6 pb-6 space-y-3 overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="pt-4 border-t border-white/5 space-y-3">
            {reminders.map((car) => (
              <div key={car.car_id} className={`flex items-center justify-between p-4 rounded-2xl border ${car.statusColor}`}>
                <Link href={`/admin/cars/${car.car_id}`} className="flex flex-col gap-1 group">
                  <span className="text-[10px] font-black tracking-widest uppercase italic group-hover:text-white transition-colors">
                    {car.registration}
                  </span>
                  <span className="text-[9px] font-bold text-white/60 uppercase">{car.make} {car.model}</span>
                </Link>

                <div className="flex items-center gap-3">
                  <div className="text-right border-r border-white/10 pr-3 mr-1">
                    <p className="text-[10px] font-black uppercase">{car.diffDays < 0 ? "OVERDUE" : car.diffDays > 365 ? "Over a Year" : `${car.diffDays} Days`}</p>
                  </div>
                  <button onClick={() => openServiceModal(car.car_id, car.registration)} className="p-1 hover:scale-110 transition-transform text-white/80 hover:text-orange-500">
                    <CheckCircle2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- MODAL (Kept the same as previous) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 animate-in fade-in zoom-in duration-200">
            {/* Modal content from previous version */}
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-xl font-black italic uppercase text-white tracking-tighter">Service <span className="text-orange-500">Update</span></h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2 group">
                <label className="text-[8px] font-black uppercase text-gray-500 ml-1 group-focus-within:text-orange-500">Next Service Due Date</label>
                <input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/5 text-white font-mono text-xs h-12 rounded-2xl px-4 outline-none focus:ring-1 focus:ring-orange-500/50" />
              </div>
              <button onClick={handleCommitService} disabled={isUpdating} className="w-full bg-orange-500 text-black py-4 rounded-full font-black uppercase text-[11px] tracking-[0.3em] hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50">
                {isUpdating ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                {isUpdating ? "Committing..." : "Induct New Date"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}