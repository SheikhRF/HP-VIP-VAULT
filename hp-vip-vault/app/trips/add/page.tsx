"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CarFront, Calendar, Gauge, Star, NotepadText, ChevronLeft } from "lucide-react";

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

  // Only required fields (end_date + mileage_after can be optional if you want)
  const isInvalid = !carId || !formData.startDate || !formData.mileageBefore;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (isInvalid) {
      setErrorMsg("Please provide Car ID, Start Date, and Mileage Before.");
      return;
    }

    // Basic validation
    if (formData.endDate && formData.endDate < formData.startDate) {
      setErrorMsg("End Date cannot be before Start Date.");
      return;
    }

    const before = Number(formData.mileageBefore);
    const after = formData.mileageAfter ? Number(formData.mileageAfter) : null;

    if (!Number.isFinite(before) || before < 0) {
      setErrorMsg("Mileage Before must be a valid number.");
      return;
    }
    if (after !== null && (!Number.isFinite(after) || after < before)) {
      setErrorMsg("Mileage After must be greater than or equal to Mileage Before.");
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
          rating: formData.rating ? parseInt(formData.rating) : null,
          notes: formData.notes.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to log trip");

      router.push(`/cars/${carId}`);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-2xl bg-card border border-border rounded-xl p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <CarFront size={28} />
          Add Trip
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Car ID: <span className="text-primary font-mono">#{carId || "MISSING"}</span>
        </p>
      </header>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Dates */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Calendar size={16} className="text-muted-foreground" />
            Dates
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">
                End Date (optional)
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Mileage */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Gauge size={16} className="text-muted-foreground" />
            Mileage
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">
                Mileage Before
              </label>
              <input
                type="number"
                value={formData.mileageBefore}
                onChange={(e) => setFormData({ ...formData, mileageBefore: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 outline-none"
                placeholder="e.g. 45000"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">
                Mileage After (optional)
              </label>
              <input
                type="number"
                value={formData.mileageAfter}
                onChange={(e) => setFormData({ ...formData, mileageAfter: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 outline-none"
                placeholder="e.g. 45120"
              />
            </div>
          </div>
        </section>

        {/* Rating + Notes */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <NotepadText size={16} className="text-muted-foreground" />
            Notes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-muted-foreground mb-1">
                Rating (optional)
              </label>
              <div className="relative">
                <Star className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 outline-none appearance-none"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-muted-foreground mb-1">
                Trip Notes (optional)
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 outline-none resize-none"
                placeholder="Any issues, fuel, damage, warnings, etc."
              />
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={submitting || isInvalid}
          className="w-full bg-primary text-white rounded-xl px-4 py-4 font-bold uppercase tracking-widest hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Log Trip"}
        </button>
      </form>
    </div>
  );
}

export default function AddTripPage() {
  return (
    <main className="bg-background text-foreground px-6 py-12 flex flex-col items-center justify-center min-h-screen">
      <div className="mb-6 w-full max-w-2xl">
        <button
          onClick={() => window.history.back()}
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 text-sm font-semibold"
        >
          <ChevronLeft size={16} /> Back
        </button>
      </div>

      <Suspense
        fallback={
          <div className="text-primary animate-pulse text-sm font-semibold">
            Loading…
          </div>
        }
      >
        <TripForm />
      </Suspense>
    </main>
  );
}
