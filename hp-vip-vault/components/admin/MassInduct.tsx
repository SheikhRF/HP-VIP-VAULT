"use client";

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import Link from "next/link";

type ParsedCar = {
  make: string;
  model: string;
  registration: string;
  valid: boolean;
  error?: string;
};

type ResultRow = ParsedCar & { status: "success" | "error"; message?: string };

export default function MassInductClient() {
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
        return { make, model, registration, valid: false, error: "Missing make, model or registration" };
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
  const invalidCount = parsedCars.filter(c => !c.valid).length;

  return (
    <div className="space-y-10">

      {/* FORMAT GUIDE */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 space-y-3">
        <p className="text-[9px] font-black uppercase tracking-widest text-orange-500">CSV Format Required</p>
        <code className="block text-xs font-mono text-gray-400 bg-black/40 px-4 py-3 rounded-xl">
          make,model,registration<br />
          Ferrari,F40,AB12CDE<br />
          Lamborghini,Huracan,XY21ZZZ
        </code>
        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">
          Header row is optional. Specs and images can be added later per asset.
        </p>
      </div>

      {/* DROP ZONE */}
      {parsedCars.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/10 rounded-[2.5rem] py-24 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-orange-500/40 hover:bg-white/[0.01] transition-all group"
        >
          <Upload size={32} className="text-gray-700 group-hover:text-orange-500 transition-colors" />
          <div className="text-center space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">
              Drop CSV file here or click to browse
            </p>
            <p className="text-[8px] font-black uppercase tracking-widest text-gray-700">.csv files only</p>
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

      {/* PREVIEW TABLE */}
      {parsedCars.length > 0 && !results && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FileText size={16} className="text-orange-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{fileName}</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-green-500">{validCount} valid</span>
              {invalidCount > 0 && (
                <span className="text-[9px] font-black uppercase tracking-widest text-red-500">{invalidCount} invalid</span>
              )}
            </div>
            <button onClick={handleClear} className="text-gray-600 hover:text-red-500 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden">
            <table className="w-full text-left">
              <thead className="border-b border-white/5 bg-white/[0.01]">
                <tr>
                  <th className="px-6 py-4 text-[8px] font-black uppercase text-gray-600 tracking-widest">Make</th>
                  <th className="px-6 py-4 text-[8px] font-black uppercase text-gray-600 tracking-widest">Model</th>
                  <th className="px-6 py-4 text-[8px] font-black uppercase text-gray-600 tracking-widest">Registration</th>
                  <th className="px-6 py-4 text-[8px] font-black uppercase text-gray-600 tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {parsedCars.map((car, i) => (
                  <tr key={i} className={!car.valid ? "opacity-40" : ""}>
                    <td className="px-6 py-4 text-xs font-black italic uppercase">{car.make || "—"}</td>
                    <td className="px-6 py-4 text-xs font-black italic uppercase">{car.model || "—"}</td>
                    <td className="px-6 py-4 text-xs font-mono text-orange-500">{car.registration || "—"}</td>
                    <td className="px-6 py-4">
                      {car.valid ? (
                        <span className="text-[8px] font-black uppercase tracking-widest text-green-500">Ready</span>
                      ) : (
                        <span className="text-[8px] font-black uppercase tracking-widest text-red-500">{car.error}</span>
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
            className="w-full py-6 bg-orange-500 text-black font-black uppercase tracking-widest text-sm rounded-[2rem] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(249,115,22,0.3)]"
          >
            {loading ? "Inducting Assets..." : `Induct ${validCount} Asset${validCount !== 1 ? "s" : ""} into Vault`}
          </button>
        </div>
      )}

      {/* RESULTS */}
      {results && (
        <div className="space-y-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden">
            <table className="w-full text-left">
              <thead className="border-b border-white/5 bg-white/[0.01]">
                <tr>
                  <th className="px-6 py-4 text-[8px] font-black uppercase text-gray-600 tracking-widest">Make</th>
                  <th className="px-6 py-4 text-[8px] font-black uppercase text-gray-600 tracking-widest">Model</th>
                  <th className="px-6 py-4 text-[8px] font-black uppercase text-gray-600 tracking-widest">Registration</th>
                  <th className="px-6 py-4 text-[8px] font-black uppercase text-gray-600 tracking-widest">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {results.map((car, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 text-xs font-black italic uppercase">{car.make}</td>
                    <td className="px-6 py-4 text-xs font-black italic uppercase">{car.model}</td>
                    <td className="px-6 py-4 text-xs font-mono text-orange-500">{car.registration}</td>
                    <td className="px-6 py-4">
                      {car.status === "success" ? (
                        <div className="flex items-center gap-2 text-green-500">
                          <CheckCircle2 size={12} />
                          <span className="text-[8px] font-black uppercase tracking-widest">Inducted</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-500">
                          <XCircle size={12} />
                          <span className="text-[8px] font-black uppercase tracking-widest">{car.message}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleClear}
              className="flex-1 py-5 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-[2rem] hover:bg-white/10 transition-all"
            >
              Induct More Assets
            </button>
            <Link
              href="/admin/dashboard"
              className="flex-1 py-5 bg-orange-500 text-black font-black uppercase tracking-widest text-[10px] rounded-[2rem] hover:scale-[1.01] transition-all text-center shadow-[0_0_20px_rgba(249,115,22,0.3)]"
            >
              View Fleet Status
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}