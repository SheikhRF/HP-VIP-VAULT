"use client";

import { useState, useRef } from "react";
import Navbar from "@/components/navbar";
import { Upload, FileText, CheckCircle2, XCircle, ArrowLeft, Trash2, Cpu, Database } from "lucide-react";
import Link from "next/link";

type ParsedCar = {
  make: string;
  model: string;
  registration: string;
  valid: boolean;
  error?: string;
};

type ResultRow = ParsedCar & { status: "success" | "error"; message?: string };

export default function MassInductPage() {
  const [parsedCars, setParsedCars] = useState<ParsedCar[]>([]);
  const [results, setResults] = useState<ResultRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): ParsedCar[] => {
    const lines = text.trim().split("\n").filter(Boolean);
    const firstLine = lines[0].toLowerCase().replace(/\s/g, "");
    const hasHeader = firstLine.includes("make") || firstLine.includes("model") || firstLine.includes("reg");
    const dataLines = hasHeader ? lines.slice(1) : lines;

    return dataLines.map((line) => {
      const cols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
      const [make, model, registration] = cols;
      if (!make || !model || !registration) {
        return { make, model, registration, valid: false, error: "DATA_MISMATCH" };
      }
      return { make, model, registration: registration.toUpperCase().replace(/\s+/g, ""), valid: true };
    });
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    setResults(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setParsedCars(parseCSV(text));
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) handleFile(file);
  };

  const handleInduct = async () => {
    const validCars = parsedCars.filter(c => c.valid);
    if (validCars.length === 0) return;
    setLoading(true);

    const res = await fetch("/api/admin/mass-induct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cars: validCars }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.ok) {
      setResults(validCars.map(c => ({ ...c, status: "success" })));
    } else {
      setResults(validCars.map(c => ({ ...c, status: "error", message: data.error })));
    }
  };

  const handleClear = () => {
    setParsedCars([]);
    setResults(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validCount = parsedCars.filter(c => c.valid).length;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white pt-32 pb-20 px-6 font-sans">
        <div className="max-w-5xl mx-auto space-y-12">

          {/* SYSTEM BREADCRUMB */}
          <Link href="/admin" className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] transition-all group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Command Center
          </Link>

          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-12">
            <div className="space-y-4">
              <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-none">
                Mass <span className="text-orange-500 text-glow-orange">Induct</span>
              </h1>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.5em]">
                  Asset Registration Protocol 099-B
                </p>
              </div>
            </div>

            {/* FORMAT GUIDE BOX */}
            <div className="bg-[#0d0d0d] border border-white/5 rounded-3xl p-6 md:max-w-xs w-full group hover:border-orange-500/30 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                    <Database size={14} className="text-orange-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Structure Required</p>
                </div>
                <code className="block text-[11px] font-mono text-gray-500 leading-relaxed mb-2">
                    make,model,reg<br/>
                    Ferrari,F40,AB12CDE
                </code>
            </div>
          </div>

          {/* INITIAL STATE: DROP ZONE */}
          {parsedCars.length === 0 && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="relative group overflow-hidden border-2 border-dashed border-white/10 rounded-[3rem] py-32 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-orange-500/50 hover:bg-white/[0.01] transition-all duration-700"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-8 bg-white/5 rounded-full text-gray-700 group-hover:text-orange-500 group-hover:scale-110 transition-all duration-500">
                <Upload size={48} strokeWidth={1.5} />
              </div>
              <div className="text-center space-y-2 relative z-10">
                <p className="text-lg font-black italic uppercase tracking-tighter text-white">
                  Initialize Upload
                </p>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-600 group-hover:text-gray-400 transition-colors">
                  Drop CSV file or browse local directory
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          )}

          {/* PREVIEW & PROCESS STATE */}
          {parsedCars.length > 0 && !results && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-orange-500" />
                    <span className="text-xs font-black uppercase tracking-tighter italic">{fileName}</span>
                  </div>
                  <div className="h-4 w-[1px] bg-white/10" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-green-500 underline underline-offset-4">{validCount} Verified</span>
                </div>
                <button onClick={handleClear} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-500 transition-all">
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.01]">
                      <th className="px-8 py-5 text-[9px] font-black uppercase text-gray-600 tracking-[0.3em]">Make</th>
                      <th className="px-8 py-5 text-[9px] font-black uppercase text-gray-600 tracking-[0.3em]">Model</th>
                      <th className="px-8 py-5 text-[9px] font-black uppercase text-gray-600 tracking-[0.3em]">Registration</th>
                      <th className="px-8 py-5 text-[9px] font-black uppercase text-gray-600 tracking-[0.3em]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {parsedCars.map((car, i) => (
                      <tr key={i} className={`group hover:bg-white/[0.01] transition-colors ${!car.valid ? "bg-red-500/[0.02]" : ""}`}>
                        <td className="px-8 py-5 text-sm font-black italic uppercase text-white group-hover:text-orange-500 transition-colors">{car.make || "—"}</td>
                        <td className="px-8 py-5 text-sm font-black italic uppercase text-white">{car.model || "—"}</td>
                        <td className="px-8 py-5 text-sm font-mono text-gray-500 tracking-tighter">{car.registration || "—"}</td>
                        <td className="px-8 py-5">
                          {car.valid ? (
                            <span className="inline-block px-3 py-1 bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest rounded-full border border-green-500/20">Ready for Uplink</span>
                          ) : (
                            <span className="inline-block px-3 py-1 bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-widest rounded-full border border-red-500/20">{car.error}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleInduct}
                disabled={loading || validCount === 0}
                className="w-full py-8 bg-orange-500 text-black font-black uppercase tracking-[0.3em] text-xs rounded-[2rem] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(249,115,22,0.4)] flex items-center justify-center gap-3 group"
              >
                {loading ? (
                    <Cpu className="animate-spin" size={20} />
                ) : (
                    <>Commit {validCount} Assets to Vault</>
                )}
              </button>
            </div>
          )}

          {/* RESULTS STATE */}
          {results && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.01]">
                      <th className="px-8 py-5 text-[9px] font-black uppercase text-gray-600 tracking-[0.3em]">Identity</th>
                      <th className="px-8 py-5 text-[9px] font-black uppercase text-gray-600 tracking-[0.3em]">Registration</th>
                      <th className="px-8 py-5 text-[9px] font-black uppercase text-gray-600 tracking-[0.3em]">System Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {results.map((car, i) => (
                      <tr key={i} className="hover:bg-white/[0.01]">
                        <td className="px-8 py-5">
                            <p className="text-xs font-black italic uppercase text-white">{car.make} {car.model}</p>
                        </td>
                        <td className="px-8 py-5 text-sm font-mono text-gray-600">{car.registration}</td>
                        <td className="px-8 py-5">
                          {car.status === "success" ? (
                            <div className="flex items-center gap-3 text-green-400">
                              <CheckCircle2 size={14} className="drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Entry Confirmed</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 text-red-500">
                              <XCircle size={14} />
                              <span className="text-[10px] font-black uppercase tracking-widest">{car.message}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <button
                  onClick={handleClear}
                  className="flex-1 py-6 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-[2rem] hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  Induct New Batch
                </button>
                <Link
                  href="/admin/dashboard"
                  className="flex-1 py-6 bg-orange-500 text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-[2rem] hover:scale-[1.02] transition-all text-center shadow-[0_0_30px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2"
                >
                  Finalize & Exit Registry
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}