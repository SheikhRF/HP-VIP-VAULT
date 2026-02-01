"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { 
  Plus, Loader2, Wind, Scaling, MapPin, Search, Database, Camera, X, ChevronLeft, PoundSterling, Gauge, ShieldAlert, CheckCircle2, Calendar 
} from "lucide-react";
import imageCompression from 'browser-image-compression'; 

export default function AddAssetForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    registration: "",
    location: "",
    price: null as number | null,
    mileage: null as number | null,
    selectedTrim: "",
    service_date: "",
  });

  const [trims, setTrims] = useState<any[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [loadingTrims, setLoadingTrims] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const completionPercentage = useMemo(() => {
    let score = 0;
    if (formData.make && formData.model && formData.selectedTrim) score += 40;
    if (formData.registration && formData.location && formData.price) score += 40;
    if (photos.length > 0) score += 20;
    return score;
  }, [formData, photos]);

  const section1Complete = !!(formData.make && formData.model && formData.selectedTrim);
  const section2Complete = !!(formData.registration && formData.location && formData.price);
  const section3Complete = photos.length > 0;

  const canFindTrims = formData.make.trim() && formData.model.trim();
  const canSubmit = section1Complete && section3Complete;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "number") {
      if (value === "" || value === "-") {
        setFormData(prev => ({ ...prev, [name]: null }));
        return;
      }
      const num = Number(value);
      if (!isNaN(num)) setFormData(prev => ({ ...prev, [name]: num }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  async function handleFindTrims() {
    setErrorMsg("");
    setTrims([]);
    setLoadingTrims(true);
    try {
      const params = new URLSearchParams({ make: formData.make.trim(), model: formData.model.trim() });
      if (formData.year.trim()) params.set("year", formData.year.trim());
      const res = await fetch(`/api/cars/trims?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search Protocol Failed");
      setTrims(data.trims || []);
    } catch (err: any) { setErrorMsg(err.message); }
    finally { setLoadingTrims(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const compressionOptions = { maxSizeMB: 0.8, maxWidthOrHeight: 1920, useWebWorker: true };
      const compressedPhotos = await Promise.all(photos.map(p => imageCompression(p, compressionOptions)));

      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k === "selectedTrim" ? "trim" : k, v?.toString() ?? ""));
      compressedPhotos.forEach(p => fd.append("photos", p));

      const res = await fetch("/api/cars", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Induction Protocol Failed");
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: any) { setErrorMsg(err.message); setSubmitting(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12 pb-20 max-w-4xl mx-auto">
      
      {/* HEADER WITH PROGRESS RING */}
      <div className="flex justify-between items-center border-b border-white/5 pb-8">
        <div className="flex items-center gap-6">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" 
                strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * completionPercentage) / 100}
                className="text-orange-500 transition-all duration-700 ease-out" strokeLinecap="round" />
            </svg>
            <span className="absolute text-[10px] font-black text-white">{Math.round(completionPercentage)}%</span>
          </div>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">Asset <span className="text-orange-500">Induction</span></h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-bold">New Vault Entry</p>
          </div>
        </div>
        <button type="button" onClick={() => router.back()} className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-all flex items-center gap-2">
          <ChevronLeft size={14} /> Cancel Session
        </button>
      </div>

      {/* 01. TECHNICAL IDENTITY */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.4em] flex items-center gap-2">
            <ShieldAlert size={14} /> Technical Identity
          </h3>
          {section1Complete && <CheckCircle2 size={16} className="text-green-500 animate-pulse" />}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
          <Field label="Make" name="make" value={formData.make} onChange={handleChange} />
          <Field label="Model" name="model" value={formData.model} onChange={handleChange} />
          <Field label="Year" name="year" value={formData.year} onChange={handleChange} />
          
          <div className="md:col-span-3 space-y-4 pt-2">
            <button 
              type="button" 
              onClick={handleFindTrims} 
              disabled={!canFindTrims || loadingTrims} 
              className="bg-white/[0.02] border border-white/5 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full hover:border-orange-500 transition-all disabled:opacity-20"
            >
              {loadingTrims ? "Scanning..." : "Search Trims"}
            </button>

            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase text-gray-500 ml-1">Trim Configuration</label>
              <select 
                name="selectedTrim" 
                value={formData.selectedTrim} 
                onChange={handleChange}
                className="w-full bg-[#060606] border border-white/5 text-white font-mono text-xs h-10 rounded-xl px-4 outline-none transition-all appearance-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50"
                >
                <option value="" className="bg-[#060606] text-gray-500">
                    {trims.length === 0 ? "Perform search first" : "Select Variant"}
                </option>
                
                {trims.map((t, i) => (
                    <option key={i} value={t.trim} className="bg-[#060606] text-white">
                    {t.trim}
                    </option>
                ))}
                </select>
            </div>
          </div>
        </div>
      </div>

      {/* 02. ADMINISTRATIVE DATA */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.4em] flex items-center gap-2">
            <Database size={14} /> Administrative Data
          </h3>
          {section2Complete && <CheckCircle2 size={16} className="text-green-500 animate-pulse" />}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
          <div className="space-y-1">
            <label className="text-[8px] font-black uppercase text-gray-500 ml-1">Registration</label>
            <Input 
              name="registration" 
              value={formData.registration} 
              onChange={handleChange} 
              maxLength={7}
              placeholder="AB12 CDE"
              className="bg-black border-orange-500/30 text-orange-500 font-black uppercase tracking-widest text-lg h-12 focus:border-orange-500 transition-colors" 
            />
          </div>
          <Field label="Location" name="location" value={formData.location} onChange={handleChange} icon={<MapPin size={8} />} />
          <Field label="Price (£)" name="price" type="number" value={formData.price ?? ""} onChange={handleChange} icon={<PoundSterling size={10} />} />
          <Field label="Mileage" name="mileage" type="number" value={formData.mileage ?? ""} onChange={handleChange} icon={<Gauge size={10} />} />
          <Field label="Service Date" name="service_date" type="date" value={formData.service_date ?? ""} onChange={handleChange} icon={<Calendar size={10} />} />
        </div>
      </div>

      {/* 03. VISUAL DOCUMENTATION */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.4em] flex items-center gap-2">
            <Camera size={14} /> Visual Documentation
          </h3>
          {section3Complete && <CheckCircle2 size={16} className="text-green-500 animate-pulse" />}
        </div>
        <div className="bg-white/[0.02] p-6 rounded-[2rem] border border-white/5 space-y-6">
          <div className="border-2 border-dashed border-white/5 rounded-[2rem] p-12 text-center hover:border-orange-500 transition-all group">
            <input type="file" multiple accept="image/*" className="hidden" id="photo-induct" onChange={e => e.target.files && setPhotos([...photos, ...Array.from(e.target.files)])} />
            <label htmlFor="photo-induct" className="cursor-pointer flex flex-col items-center gap-4">
              <Camera size={40} className="text-gray-600 " />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Induct Media Visuals ({photos.length})</span>
            </label>
          </div>
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-4 pt-2">
              {photos.map((file, i) => (
                <div key={i} className="relative w-24 h-24 rounded-2xl border border-orange-500/50 overflow-hidden shadow-2xl">
                  <img src={URL.createObjectURL(file)} className="object-cover w-full h-full" alt="pending" />
                  <button type="button" onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-black/80 rounded-full p-1 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="pt-10 border-t border-white/5 flex justify-end">
        <button type="submit" disabled={submitting || !canSubmit}
          className="bg-orange-500 text-black px-12 py-4 rounded-full font-black uppercase text-[11px] tracking-[0.3em] hover:scale-105 transition-all disabled:opacity-20 flex items-center gap-2 shadow-[0_0_40px_rgba(249,115,22,0.3)]">
          {submitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
          {submitting ? "Establishing Records..." : "Induct Asset"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, name, value, onChange, type = "text", icon }: any) {
  return (
    <div className="space-y-1 group">
      <label className="text-[8px] font-black uppercase text-gray-500 ml-1 flex items-center gap-1  transition-colors">
        {icon} {label}
      </label>
      <Input 
        type={type} 
        name={name} 
        value={value ?? ""} 
        onChange={onChange} 
        className="bg-black border-white/5 text-white font-mono text-xs h-9 focus:border-orange-500 transition-colors" 
      />
    </div>
  );
}