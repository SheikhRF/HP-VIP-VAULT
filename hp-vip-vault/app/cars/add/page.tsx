"use client";

import Navbar from "@/components/navbar";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type TrimOption = {
  make: string;
  model: string;
  generation?: string | null;
  generation_year_begin?: string | number | null;
  generation_year_end?: string | number | null;
  serie?: string | null;
  trim: string;
  trim_start_production_year?: number | null;
  trim_end_production_year?: number | null;
  car_type?: string | null;
};

type DetailsResponseTop = {
  make?: string;
  model?: string;
  trim?: string;
  specifications?: Record<string, string>;
};

const SPEC_KEYS: { label: string; key: string }[] = [
  { label: "Acceleration (0-100)", key: "Acceleration (0-100 km/h)" },
  { label: "Body type", key: "Body type" },
  { label: "Capacity", key: "Capacity" },
  { label: "Curb weight", key: "Curb weight" },
  { label: "Cylinder layout", key: "Cylinder layout" },
  { label: "Drive wheels", key: "Drive wheels" },
  { label: "Engine power", key: "Engine power" },
  { label: "Fuel tank capacity", key: "Fuel tank capacity" },
  { label: "Gearbox type", key: "Gearbox type" },
  { label: "Max speed", key: "Max speed" },
  { label: "Maximum torque", key: "Maximum torque" },
  { label: "Max trunk capacity", key: "Max trunk capacity" },
  { label: "Number of cylinders", key: "Number of cylinders" },
  { label: "Number of gear", key: "Number of gear" },
  { label: "Number of seater", key: "Number of seater" },
];

export default function AddCarPage() {
  const router = useRouter();

  // DVLA + DB fields
  const [registration, setRegistration] = useState("");
  const [location, setLocation] = useState("");

  // trims flow fields
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

  // trims
  const [trims, setTrims] = useState<TrimOption[]>([]);
  const [selectedTrim, setSelectedTrim] = useState<string>("");

  // details preview
  const [detailsTop, setDetailsTop] = useState<DetailsResponseTop | null>(null);

  // photos
  const [photos, setPhotos] = useState<File[]>([]);

  // ui
  const [loadingTrims, setLoadingTrims] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const canFindTrims = make.trim() && model.trim();
  const canPreviewDetails = make.trim() && model.trim() && selectedTrim.trim();
  const canSubmit =
    make.trim() &&
    model.trim() &&
    selectedTrim.trim() &&
    photos.length > 0; // registration/location optional per your route

  const trimOptions = useMemo(() => {
    return trims.map((t, idx) => {
      const years =
        t.generation_year_begin || t.generation_year_end
          ? `${t.generation_year_begin ?? "?"}-${t.generation_year_end ?? "?"}`
          : "";
      const serie = t.serie ? `${t.serie} — ` : "";
      const label = `${serie}${t.trim}${years ? ` (${years})` : ""}`;
      return { key: `${t.trim}-${idx}`, value: t.trim, label };
    });
  }, [trims]);

  function normalizeReg(s: string) {
    return s.toUpperCase().replace(/\s+/g, "");
  }

  async function handleFindTrims() {
    setErrorMsg("");
    setDetailsTop(null);
    setSelectedTrim("");
    setTrims([]);

    if (!canFindTrims) {
      setErrorMsg("Please enter make and model first.");
      return;
    }

    setLoadingTrims(true);
    try {
      const params = new URLSearchParams();
      params.set("make", make.trim());
      params.set("model", model.trim());
      if (year.trim()) params.set("year", year.trim());

      const res = await fetch(`/api/cars/trims?${params.toString()}`, {
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data.error ?? "Failed to fetch trims");
        return;
      }

      const list = Array.isArray(data.trims) ? (data.trims as TrimOption[]) : [];
      if (list.length === 0) {
        setErrorMsg("No trims found for that make/model.");
        return;
      }

      setTrims(list);
    } finally {
      setLoadingTrims(false);
    }
  }

  async function handlePreviewDetails() {
    setErrorMsg("");
    setDetailsTop(null);

    if (!canPreviewDetails) {
      setErrorMsg("Select a trim first.");
      return;
    }

    setLoadingDetails(true);
    try {
      const res = await fetch("/api/cars/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          make: make.trim(),
          model: model.trim(),
          year: year.trim() || null,
          trim: selectedTrim,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data.error ?? "Failed to fetch details");
        return;
      }

      setDetailsTop(data.top ?? null);
    } finally {
      setLoadingDetails(false);
    }
  }

  function handlePhotoChange(files: FileList | null) {
    setErrorMsg("");
    if (!files) return;
    setPhotos(Array.from(files));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!canSubmit) {
      setErrorMsg("Please fill make/model, choose a trim, and upload at least 1 photo.");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();

      // required by your /api/cars route
      fd.append("make", make.trim());
      fd.append("model", model.trim());
      fd.append("trim", selectedTrim);

      // optional but now useful (DVLA)
      const reg = normalizeReg(registration.trim());
      if (reg) fd.append("registration", reg);

      // optional unless your DB enforces it
      if (location.trim()) fd.append("location", location.trim());

      // photos
      photos.forEach((file) => fd.append("photos", file));

      const res = await fetch("/api/cars", {
        method: "POST",
        body: fd,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(data.error ?? "Failed to add car");
        return;
      }

      router.push("/cars");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="bg-background text-foreground px-6 py-12 flex justify-center">
        <div className="w-full max-w-2xl bg-card border border-border rounded-xl p-6">
          <h1 className="text-2xl font-bold text-primary mb-2">Add a Car</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Upload photos, select the correct trim, and (optionally) provide the reg for DVLA status.
          </p>

          {errorMsg && (
            <div className="bg-red-500/20 border border-red-500 px-3 py-2 rounded-md mb-4 text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* DVLA / meta */}
            <section className="space-y-3">
              <h2 className="font-semibold">Registration & Location</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Registration (optional)</label>
                  <input
                    value={registration}
                    onChange={(e) => setRegistration(e.target.value)}
                    className="w-full bg-input border border-border rounded-md px-3 py-2 outline-none"
                    placeholder="AB12CDE"
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Location (optional)</label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-input border border-border rounded-md px-3 py-2 outline-none"
                    placeholder="London"
                    maxLength={30}
                  />
                </div>
              </div>
            </section>

            {/* Step 1: Inputs */}
            <section className="space-y-3">
              <h2 className="font-semibold">1) Find trims</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm mb-1">Make</label>
                  <input
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full bg-input border border-border rounded-md px-3 py-2 outline-none"
                    placeholder="Ferrari"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Model</label>
                  <input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-input border border-border rounded-md px-3 py-2 outline-none"
                    placeholder="458"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Year (optional)</label>
                  <input
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-input border border-border rounded-md px-3 py-2 outline-none"
                    placeholder="2014"
                    inputMode="numeric"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleFindTrims}
                disabled={loadingTrims || !canFindTrims}
                className="bg-primary text-primary-foreground rounded-md px-4 py-2 font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {loadingTrims ? "Finding trims..." : "Find trims"}
              </button>
            </section>

            {/* Step 2: Trim dropdown */}
            <section className="space-y-3">
              <h2 className="font-semibold">2) Select trim</h2>

              <select
                value={selectedTrim}
                onChange={(e) => setSelectedTrim(e.target.value)}
                disabled={trims.length === 0}
                className="w-full bg-input border border-border rounded-md px-3 py-2 outline-none disabled:opacity-50"
              >
                <option value="">
                  {trims.length === 0 ? "Find trims first" : "Choose a trim"}
                </option>
                {trimOptions.map((o) => (
                  <option key={o.key} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handlePreviewDetails}
                disabled={loadingDetails || !canPreviewDetails}
                className="bg-secondary text-secondary-foreground rounded-md px-4 py-2 font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {loadingDetails ? "Loading details..." : "Preview specs"}
              </button>
            </section>

            {/* Step 3: Preview key specs */}
            {detailsTop?.specifications && (
              <section className="space-y-3">
                <h2 className="font-semibold">Preview</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SPEC_KEYS.map(({ label, key }) => (
                    <div
                      key={key}
                      className="bg-background/40 border border-border rounded-lg p-3"
                    >
                      <div className="text-xs text-muted-foreground">{label}</div>
                      <div className="font-semibold">
                        {detailsTop.specifications?.[key] ?? "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Step 4: Photos */}
            <section className="space-y-3">
              <h2 className="font-semibold">3) Upload photos</h2>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handlePhotoChange(e.target.files)}
                className="block w-full text-sm"
              />

              {photos.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {photos.length} photo(s) selected
                </p>
              )}
            </section>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !canSubmit}
              className="w-full bg-primary text-primary-foreground rounded-md px-4 py-3 font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add Car"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
