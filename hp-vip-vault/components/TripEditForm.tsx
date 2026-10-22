"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CarFront, Calendar, Gauge, NotepadText, X, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/error-banner";
import Reveal from "@/components/Reveal";
import SpeedBackdrop from "@/components/SpeedBackdrop";

type Trip = {
  trip_id: number;
  car_id: number;
  start_date: string;
  end_date: string | null;
  mileage_before: number;
  mileage_after: number;
  rating: number;
  notes: string | null;
};

export default function TripEditForm({ trip }: { trip: Trip }) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    startDate: trip.start_date,
    endDate: trip.end_date ?? "",
    mileageBefore: String(trip.mileage_before ?? ""),
    mileageAfter: String(trip.mileage_after ?? ""),
    rating: String(trip.rating ?? 5),
    notes: trip.notes ?? "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isInvalid = !formData.startDate || !formData.mileageBefore;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (isInvalid) {
      setErrorMsg("Required: Start Date and Mileage Before.");
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
      const res = await fetch(`/api/trips/${trip.trip_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          car_id: trip.car_id,
          start_date: formData.startDate,
          end_date: formData.endDate || null,
          mileage_before: before,
          mileage_after: after,
          rating: parseInt(formData.rating),
          notes: formData.notes.trim() || null,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Uplink failed");

      router.push("/trips");
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "System Error: Failed to update trip");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    const confirmed = confirm("SYSTEM WARNING: You are about to delete this sortie record. This action is irreversible. Proceed?");
    if (!confirmed) return;

    setErrorMsg("");
    setDeleting(true);
    try {
      const res = await fetch(`/api/trips/${trip.trip_id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Delete failed");

      router.push("/trips");
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "System Error: Failed to delete trip");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="relative overflow-hidden bg-background text-foreground px-6 pt-32 pb-12 flex flex-col items-center justify-center min-h-screen">
      <SpeedBackdrop variant="corner" />
      <div className="mb-8 w-full max-w-2xl">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-3 text-gray-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.3em]"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1a1a1a] border border-gray-800 group-hover:border-orange-500 transition-all">
            <X size={16} />
          </div>
          <span>Cancel Edit</span>
        </button>
      </div>

      <Reveal className="hover-shine w-full max-w-2xl bg-[#1a1a1a] border border-gray-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <CarFront className="absolute -right-8 -top-8 text-white/5 animate-ghost-drift" size={200} />

        <header className="mb-10 relative z-10">
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
            Edit <span className="text-orange-500">Sortie</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mt-2 leading-none">
            Trip ID: <span className="text-orange-500 font-mono">#{trip.trip_id}</span>
          </p>
        </header>

        <div className="relative z-10 mb-8">
          <ErrorBanner message={errorMsg} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
          <section className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
              <Calendar size={14} className="text-orange-500" />
              01. Timeline
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-gray-500 ml-2">Start Date</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-black border-gray-800 rounded-2xl px-4 py-3 h-auto text-sm focus-visible:border-orange-500 focus-visible:ring-0"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-gray-500 ml-2">End Date</label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-black border-gray-800 rounded-2xl px-4 py-3 h-auto text-sm focus-visible:border-orange-500 focus-visible:ring-0"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
              <Gauge size={14} className="text-orange-500" />
              02. Mileage
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-gray-500 ml-2">Odometer Before</label>
                <Input
                  type="number"
                  value={formData.mileageBefore}
                  onChange={(e) => setFormData({ ...formData, mileageBefore: e.target.value })}
                  className="bg-black border-gray-800 rounded-2xl px-4 py-3 h-auto text-sm font-mono focus-visible:border-orange-500 focus-visible:ring-0"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-gray-500 ml-2">Odometer After</label>
                <Input
                  type="number"
                  value={formData.mileageAfter}
                  onChange={(e) => setFormData({ ...formData, mileageAfter: e.target.value })}
                  className="bg-black border-gray-800 rounded-2xl px-4 py-3 h-auto text-sm font-mono focus-visible:border-orange-500 focus-visible:ring-0"
                />
              </div>
            </div>
          </section>

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

          <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || submitting}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500/70 hover:text-red-400 transition-colors disabled:opacity-50"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              {deleting ? "Deleting..." : "Delete Sortie"}
            </button>

            <Button
              type="submit"
              variant="vault"
              disabled={submitting || deleting || isInvalid}
              className="hover-shine rounded-2xl px-10 py-5 text-[11px] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 shadow-[0_0_30px_rgba(249,115,22,0.3)]"
            >
              {submitting ? "Transmitting..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Reveal>
    </main>
  );
}
