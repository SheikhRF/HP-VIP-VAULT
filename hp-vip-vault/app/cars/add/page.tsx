"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera, Search, Database, Gauge, PoundSterling } from "lucide-react";

type TrimOption = {
  make: string;
  model: string;
  generation?: string | null;
  serie?: string | null;
  trim: string;
  generation_year_begin?: string | number | null;
  generation_year_end?: string | number | null;
};

type DetailsResponseTop = {
  make?: string;
  model?: string;
  trim?: string;
  specifications?: Record<string, string>;
};

const SPEC_KEYS = [
  { label: "0-100 km/h", key: "Acceleration (0-100 km/h)" },
  { label: "Body Type", key: "Body type" },
  { label: "Power", key: "Engine power" },
  { label: "Max Speed", key: "Max speed" },
  { label: "Gearbox", key: "Gearbox type" },
  { label: "Drive", key: "Drive wheels" },
];

export default function AddCarPage() {
  const router = useRouter();

  // Core Fields
  const [registration, setRegistration] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [mileage, setMileage] = useState("");

  // Trims Flow
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [trims, setTrims] = useState<TrimOption[]>([]);
  const [selectedTrim, setSelectedTrim] = useState("");

  // UI State
  const [detailsTop, setDetailsTop] = useState<DetailsResponseTop | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [loadingTrims, setLoadingTrims] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const canFindTrims = make.trim() && model.trim();
  const canSubmit = make.trim() && model.trim() && selectedTrim.trim() && photos.length > 0;

  const trimOptions = useMemo(() => {
    return trims.map((t, idx) => {
      const years = t.generation_year_begin ? ` (${t.generation_year_begin}-${t.generation_year_end ?? "?"})` : "";
      const label = `${t.serie ? `${t.serie} — ` : ""}${t.trim}${years}`;
      return { key: `${t.trim}-${idx}`, value: t.trim, label };
    });
  }, [trims]);

  async function handleFindTrims() {
    setErrorMsg("");
    setTrims([]);
    setLoadingTrims(true);
    try {
      const params = new URLSearchParams({ make: make.trim(), model: model.trim() });
      if (year.trim()) params.set("year", year.trim());
      const res = await fetch(`/api/cars/trims?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fetch failed");
      setTrims(data.trims || []);
    } catch (err: any) { setErrorMsg(err.message); }
    finally { setLoadingTrims(false); }
  }

  async function handlePreviewDetails() {
    setLoadingDetails(true);
    try {
      const res = await fetch("/api/cars/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ make, model, trim: selectedTrim, year: year || null }),
      });
      const data = await res.json();
      setDetailsTop(data.top || null);
    } catch { setErrorMsg("Failed to load specs"); }
    finally { setLoadingDetails(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("make", make);
      fd.append("model", model);
      fd.append("trim", selectedTrim);
      if (registration) fd.append("registration", registration.toUpperCase().replace(/\s/g, ""));
      if (location) fd.append("location", location);
      if (price) fd.append("price", price);
      if (mileage) fd.append("mileage", mileage);
      photos.forEach(p => fd.append("photos", p));

      const res = await fetch("/api/cars", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Submission failed");
      router.push("/cars");
      router.refresh();
    } catch (err: any) { setErrorMsg(err.message); setSubmitting(false); }
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-6">
        {/* Back Button */}
        <button onClick={() => router.back()} className="group flex items-center gap-2 text-gray-500 hover:text-primary transition-all uppercase text-[10px] font-black tracking-widest">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-card border border-border group-hover:border-primary transition-all">
            <ChevronLeft size={16} />
          </div>
          <span>Cancel Session</span>
        </button>

        <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
          <header className="mb-10">
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">
              Car <span className="text-primary">Entry</span>
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-bold">New Vault Entry</p>
          </header>

          {errorMsg && <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-2xl mb-6 text-xs font-bold uppercase">{errorMsg}</div>}

          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* 1. Identity & Trim */}
            <section className="space-y-6">
              <h2 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Search size={14} /> 01. Technical Identity
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input placeholder="MAKE (e.g. Porsche)" className="bg-background border border-border rounded-2xl px-4 py-3 text-sm outline-none focus:border-primary" value={make} onChange={e => setMake(e.target.value)} />
                <input placeholder="MODEL (e.g. 911)" className="bg-background border border-border rounded-2xl px-4 py-3 text-sm outline-none focus:border-primary" value={model} onChange={e => setModel(e.target.value)} />
                <input placeholder="YEAR" className="bg-background border border-border rounded-2xl px-4 py-3 text-sm outline-none focus:border-primary" value={year} onChange={e => setYear(e.target.value)} />
              </div>
              <button type="button" onClick={handleFindTrims} disabled={!canFindTrims || loadingTrims} className="bg-[#1a1a1a] border border-gray-800 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full hover:border-primary transition-all">
                {loadingTrims ? "Scanning..." : "Search Trims"}
              </button>

              <select className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-sm outline-none focus:border-primary" value={selectedTrim} onChange={e => setSelectedTrim(e.target.value)} disabled={trims.length === 0}>
                <option value="">{trims.length === 0 ? "Perform search first" : "Select Trim Variant"}</option>
                {trimOptions.map(o => <option key={o.key} value={o.value}>{o.label}</option>)}
              </select>
            </section>

            {/* 2. Optional Metadata (Registration, Price, Mileage) */}
            <section className="space-y-6">
              <h2 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Database size={14} /> 02. Administrative Data
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[9px] uppercase text-gray-500 ml-2 font-bold">Plate / Registration</label>
                    <input placeholder="AB12 CDE" className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-sm outline-none" value={registration} onChange={e => setRegistration(e.target.value)} />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] uppercase text-gray-500 ml-2 font-bold">Location</label>
                    <input placeholder="Vault Location" className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-sm outline-none" value={location} onChange={e => setLocation(e.target.value)} />
                </div>
                <div className="relative space-y-1">
                    <label className="text-[9px] uppercase text-gray-500 ml-2 font-bold">Price (£)</label>
                    <PoundSterling className="absolute right-4 top-9 text-gray-600" size={16} />
                    <input type="number" placeholder="50000" className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-sm outline-none" value={price} onChange={e => setPrice(e.target.value)} />
                </div>
                <div className="relative space-y-1">
                    <label className="text-[9px] uppercase text-gray-500 ml-2 font-bold">Current Mileage</label>
                    <Gauge className="absolute right-4 top-9 text-gray-600" size={16} />
                    <input type="number" placeholder="1500" className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-sm outline-none" value={mileage} onChange={e => setMileage(e.target.value)} />
                </div>
              </div>
            </section>

            {/* 3. Media Upload */}
            <section className="space-y-6">
              <h2 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Camera size={14} /> 03. Visual Documentation
              </h2>
              <div className="border-2 border-dashed border-border rounded-[2rem] p-8 text-center hover:border-primary transition-all">
                <input type="file" multiple accept="image/*" className="hidden" id="photo-upload" onChange={e => e.target.files && setPhotos(Array.from(e.target.files))} />
                <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <Camera size={32} className="text-gray-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {photos.length > 0 ? `${photos.length} Files Selected` : "Drop Media or Click to Browse"}
                    </span>
                </label>
              </div>
            </section>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !canSubmit}
              className="w-full bg-primary text-black py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 shadow-[0_0_40px_rgba(249,115,22,0.2)]"
            >
              {submitting ? "Establishing Records..." : "Induct Asset into Vault"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}