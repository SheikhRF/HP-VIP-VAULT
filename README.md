# HP-VIP-VAULT

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Gauge, Calendar, Star, ChevronLeft } from "lucide-react";

function TripForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Automatically pull Car ID from URL (e.g., /trips/add?car_id=5)
  const carId = searchParams.get("car_id");

  // State
  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    mileageBefore: "",
    mileageAfter: "",
    rating: "5",
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Validation: Notes is the only optional field
  const isInvalid = !carId || !formData.startDate || !formData.endDate || !formData.mileageBefore || !formData.mileageAfter || !formData.rating;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    if (isInvalid) return setErrorMsg("All technical fields are mandatory.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          car_id: parseInt(carId as string),
          start_date: formData.startDate,
          end_date: formData.endDate,
          mileage_before: parseInt(formData.mileageBefore),
          mileage_after: parseInt(formData.mileageAfter),
          rating: parseInt(formData.rating),
          notes: formData.notes.trim() || null,
        }),
      });

      if (!res.ok) throw new Error("Check odometer values: After must be greater than Before.");
      
      router.push(`/cars/${carId}`);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-lg bg-[#1a1a1a] border border-gray-800 rounded-3xl p-8 shadow-2xl transition-all">
      <header className="mb-8 border-b border-gray-800 pb-6">
        <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase flex items-center gap-2">
          Trip <span className="text-orange-500 underline decoration-2 underline-offset-4">Log</span>
        </h1>
        <p className="text-[9px] text-gray-500 uppercase tracking-[0.3em] mt-1 font-bold">
          ID Ref: <span className="text-orange-500 font-mono">#{carId || "MISSING"}</span>
        </p>
      </header>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 text-[10px] font-black uppercase p-3 rounded-xl mb-6 tracking-tight">
          System Error: {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Logistics Group */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-gray-500 ml-1">Start Date</label>
            <input
              type="date"
              required
              className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-xs outline-none focus:border-orange-500 transition-colors"
              value={formData.startDate}
              onChange={e => setFormData({...formData, startDate: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-gray-500 ml-1">End Date</label>
            <input
              type="date"
              required
              className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-xs outline-none focus:border-orange-500 transition-colors"
              value={formData.endDate}
              onChange={e => setFormData({...formData, endDate: e.target.value})}
            />
          </div>
        </div>

        {/* Telemetry Group */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-gray-500 ml-1">Odometer Before</label>
            <input
              type="number"
              required
              placeholder="0"
              className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-xs outline-none focus:border-orange-500"
              value={formData.mileageBefore}
              onChange={e => setFormData({...formData, mileageBefore: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-gray-500 ml-1">Odometer After</label>
            <input
              type="number"
              required
              placeholder="0"
              className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-xs outline-none focus:border-orange-500"
              value={formData.mileageAfter}
              onChange={e => setFormData({...formData, mileageAfter: e.target.value})}
            />
          </div>
        </div>

        {/* Experience Selector */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase font-bold text-gray-500 ml-1">Experience Rating</label>
          <select
            required
            className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-xs outline-none appearance-none cursor-pointer"
            value={formData.rating}
            onChange={e => setFormData({...formData, rating: e.target.value})}
          >
            {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars — {n === 5 ? 'Exceptional' : 'Standard'}</option>)}
          </select>
        </div>

        {/* Optional Notes */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase font-bold text-gray-500 ml-1">Intel / Notes (Optional)</label>
          <textarea
            placeholder="Route details or maintenance alerts..."
            rows={2}
            className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-xs outline-none resize-none"
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
          />
        </div>

        <button
          type="submit"
          disabled={submitting || isInvalid}
          className="w-full bg-orange-500 text-black rounded-2xl py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
        >
          {submitting ? "Transmitting..." : "Sync to Vault"}
        </button>
      </form>
    </div>
  );
}

export default function AddTripPage() {
  return (
    <>
      <main className="min-h-[calc(100vh-64px)] bg-black flex flex-col items-center justify-center px-6 py-12">
        <div className="mb-6 w-full max-w-lg">
          <button onClick={() => window.history.back()} className="text-gray-600 hover:text-white transition-colors flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
            <ChevronLeft size={14} /> Back to Car
          </button>
        </div>
        <Suspense fallback={<div className="text-orange-500 animate-pulse uppercase text-xs font-black italic">Loading Data Stream...</div>}>
          <TripForm />
        </Suspense>
      </main>
    </>
  );
}