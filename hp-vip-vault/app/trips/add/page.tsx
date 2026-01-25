"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CarFront, Calendar, Gauge, Star, NotepadText, ChevronLeft, ShieldCheck, X } from "lucide-react";

function TripForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pull car_id from URL: /trips/add?car_id=5
  const carId = searchParams.get("car_id") || "";

  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    mileageBefore: "",
    mileageAfter: "",
    rating: "5",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isInvalid = !carId || !formData.startDate || !formData.mileageBefore;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (isInvalid) {
      setErrorMsg("Required: Car ID, Start Date, and Mileage Before.");
      return;
    }

    const before = Number(formData.mileageBefore);
    const after = formData.mileageAfter ? Number(formData.mileageAfter) : null;

    if (after !== null && after < before) {
      setErrorMsg("Telemetry Error: Ending mileage must exceed starting mileage.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          car_id: parseInt(carId),
          start_date: formData.startDate,
          end_date: formData.endDate || null,
          mileage_before: before,
          mileage_after: after,
          rating: parseInt(formData.rating),
          notes: formData.notes.trim() || null,
        }),
      });

      if (!res.ok) throw new Error("Uplink failed");

      router.push(`/cars/${carId}`);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err?.message ?? "System Error: Failed to log trip");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-2xl bg-[#1a1a1a] border border-gray-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
      {/* Background Decorative Element */}
      <CarFront className="absolute -right-8 -top-8 text-white/5" size={200} />

      <header className="mb-10 relative z-10">
        <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
          Trip <span className="text-orange-500">Logger</span>
        </h1>
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mt-2 leading-none">
          Car ID: <span className="text-orange-500 font-mono">#{carId || "UNKN"}</span>
        </p>
      </header>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-2xl mb-8 text-[10px] font-black uppercase tracking-tight">
          Warning: {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
        {/* Timeline Section */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
            <Calendar size={14} className="text-orange-500" />
            01. Timeline
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-gray-500 ml-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-colors"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-gray-500 ml-2">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Telemetry Section */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
            <Gauge size={14} className="text-orange-500" />
            02. Mileage
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-gray-500 ml-2">Odometer Before</label>
              <input
                type="number"
                value={formData.mileageBefore}
                onChange={(e) => setFormData({ ...formData, mileageBefore: e.target.value })}
                className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-colors font-mono"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-gray-500 ml-2">Odometer After</label>
              <input
                type="number"
                value={formData.mileageAfter}
                onChange={(e) => setFormData({ ...formData, mileageAfter: e.target.value })}
                className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-colors font-mono"
              />
            </div>
          </div>
        </section>

        {/* Notes Section */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
            <NotepadText size={14} className="text-orange-500" />
            03. Trip Review
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <div className="md:col-span-1 space-y-1">
              <label className="text-[9px] uppercase font-bold text-gray-500 ml-2">Rating</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-sm outline-none appearance-none"
              >
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} Stars</option>)}
              </select>
            </div>
            <div className="md:col-span-3 space-y-1">
              <label className="text-[9px] uppercase font-bold text-gray-500 ml-2">Notes</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-colors resize-none"
                placeholder="Any issues, damage, warnings, etc."
              />
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={submitting || isInvalid}
          className="w-full bg-orange-500 text-black rounded-2xl py-5 font-black uppercase text-[11px] tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 shadow-[0_0_30px_rgba(249,115,22,0.3)] mt-4"
        >
          {submitting ? "Transmitting..." : "Sync Trip to Vault"}
        </button>
      </form>
    </div>
  );
}

export default function AddTripPage() {
  const router = useRouter();

  return (
    <main className="bg-background text-foreground px-6 py-12 flex flex-col items-center justify-center min-h-screen">
      {/* Integrated Back Button */}
      <div className="mb-8 w-full max-w-2xl">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-3 text-gray-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.3em]"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1a1a1a] border border-gray-800 group-hover:border-orange-500 transition-all">
            <X size={16} />
          </div>
          <span>Cancel Trip Entry</span>
        </button>
      </div>

      <Suspense fallback={<div className="text-orange-500 animate-pulse text-xs font-black italic tracking-widest uppercase">Connecting...</div>}>
        <TripForm />
      </Suspense>
    </main>
  );
}