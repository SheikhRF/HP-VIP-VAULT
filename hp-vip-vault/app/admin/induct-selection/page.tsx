import Link from "next/link";
import Navbar from "@/components/navbar";
import { UserPlus, Layers, ArrowRight, ShieldCheck, Database } from "lucide-react";

export default function InductionGateway() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(249,115,22,0.1),transparent_50%)] pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-16 relative z-10">
          
          {/* Header */}
          <header className="space-y-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[8px] font-black uppercase tracking-[0.4em] mb-4">
              <ShieldCheck size={10} /> Secure Entry Authorized
            </div>
            <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-none">
              Asset <span className="text-orange-500 text-glow-orange">Induction</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.5em]">
              Select Registration Protocol
            </p>
          </header>

          {/* Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* OPTION 01: INDIVIDUAL */}
            <Link href="/cars/add" className="group">
              <div className="h-full bg-[#0d0d0d] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden transition-all duration-500 hover:border-orange-500/40 hover:translate-y-[-4px] shadow-2xl">
                {/* Decoration */}
                <UserPlus size={180} className="absolute -right-8 -bottom-8 text-white opacity-[0.02] group-hover:opacity-[0.05] group-hover:text-orange-500 transition-all duration-700 italic" />
                
                <div className="relative z-10 space-y-8">
                  <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-white group-hover:bg-orange-500 group-hover:text-black transition-all duration-500 shadow-xl">
                    <UserPlus size={28} />
                  </div>
                  
                  <div className="space-y-3">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter">Single <br/>Unit</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed max-w-[240px]">
                      Manual registration for high-value assets. Full spec control and immediate DVLA uplink.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] pt-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                    Initialize Protocol <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Link>

            {/* OPTION 02: MASS INDUCT */}
            <Link href="/admin/mass-induct" className="group">
              <div className="h-full bg-[#0d0d0d] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden transition-all duration-500 hover:border-orange-500/40 hover:translate-y-[-4px] shadow-2xl">
                {/* Decoration */}
                <Layers size={180} className="absolute -right-8 -bottom-8 text-orange-500 opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-700 italic" />
                
                <div className="relative z-10 space-y-8">
                  <div className="h-14 w-14 rounded-2xl bg-orange-500 flex items-center justify-center text-black transition-all duration-500 shadow-[0_0_30px_rgba(249,115,22,0.4)]">
                    <Layers size={28} />
                  </div>
                  
                  <div className="space-y-3">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Bulk <br/>Array</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed max-w-[240px]">
                      CSV data ingestion for fleet expansions. Process multiple VINs and registrations in a single batch.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] pt-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                    Uplink CSV <Database size={14} />
                  </div>
                </div>
              </div>
            </Link>

          </div>

          {/* Footer Warning */}
          <footer className="pt-12 text-center">
             <p className="text-[8px] font-black text-gray-700 uppercase tracking-[0.8em]">
               All system entries are timestamped and logged under admin credentials
             </p>
          </footer>
        </div>
      </main>
    </>
  );
}