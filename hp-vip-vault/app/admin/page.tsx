import Link from "next/link";
import Navbar from "@/components/navbar";
import { 
  PlusSquare, 
  LayoutDashboard, 
  Route, 
  ChevronRight, 
  Activity,
  Users, // Added for User Management
  ShieldCheck
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminHub() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Hub Header */}
          <header className="space-y-4 text-center md:text-left">
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
              Admin <span className="text-orange-500 text-glow-orange">Hub</span>
            </h1>
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.5em] ml-1">
              System Command & Control
            </p>
          </header>

          {/* Core Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 01. Induction Gateway */}
            <Link href="/admin/induct-selection">
              <Card className="group relative overflow-hidden bg-[#0d0d0d] border-white/5 p-2 rounded-[2.5rem] hover:border-orange-500/50 transition-all duration-500 h-full">
                <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:opacity-20 group-hover:text-orange-500 transition-all">
                  <PlusSquare size={120} />
                </div>
                <CardHeader className="relative z-10 space-y-6 p-8">
                  <div className="h-12 w-12 bg-orange-500 text-black rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                    <PlusSquare size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-4xl font-black italic uppercase tracking-tighter text-white">Induct</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-2 leading-relaxed">
                      Initialize new asset registration. Syncs technical specs via official uplinks.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] pt-4">
                    Begin Induction <ChevronRight size={14} />
                  </div>
                </CardHeader>
              </Card>
            </Link>

            {/* 02. Status Gateway */}
            <Link href="/admin/dashboard">
              <Card className="group relative overflow-hidden bg-[#0d0d0d] border-white/5 p-2 rounded-[2.5rem] hover:border-orange-500/50 transition-all duration-500 h-full">
                <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:opacity-20 group-hover:text-orange-500 transition-all">
                  <Activity size={120} />
                </div>
                <CardHeader className="relative z-10 space-y-6 p-8">
                  <div className="h-12 w-12 bg-white text-black rounded-2xl flex items-center justify-center">
                    <LayoutDashboard size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-4xl font-black italic uppercase tracking-tighter text-white">Status</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-2 leading-relaxed">
                      Real-time fleet health. Monitor MOT expiry, tax status, and maintenance.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] pt-4">
                    Monitor Fleet <ChevronRight size={14} />
                  </div>
                </CardHeader>
              </Card>
            </Link>

            {/* 03. Trips Gateway */}
            <Link href="/admin/trips">
              <Card className="group relative overflow-hidden bg-[#0d0d0d] border-white/5 p-2 rounded-[2.5rem] hover:border-orange-500/50 transition-all duration-500 h-full">
                <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:opacity-20 group-hover:text-orange-500 transition-all">
                  <Route size={120} />
                </div>
                <CardHeader className="relative z-10 space-y-6 p-8">
                  <div className="h-12 w-12 bg-white text-black rounded-2xl flex items-center justify-center">
                    <Route size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-4xl font-black italic uppercase tracking-tighter text-white">Trips</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-2 leading-relaxed">
                      Review deployment history and track every journey taken by the collection.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] pt-4">
                    Check Journeys <ChevronRight size={14} />
                  </div>
                </CardHeader>
              </Card>
            </Link>

            {/* 04. NEW: User Management Gateway */}
            <Link href="/admin/users">
              <Card className="group relative overflow-hidden bg-[#0d0d0d] border-white/5 p-2 rounded-[2.5rem] hover:border-orange-500/50 transition-all duration-500 h-full">
                <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:opacity-20 group-hover:text-orange-500 transition-all">
                  <Users size={120} />
                </div>
                <CardHeader className="relative z-10 space-y-6 p-8">
                  <div className="h-12 w-12 bg-white text-black rounded-2xl flex items-center justify-center">
                    <Users size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-4xl font-black italic uppercase tracking-tighter text-white">Registry</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-2 leading-relaxed">
                      Manage authorized members, review access levels, and invite new drivers.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] pt-4">
                    Manage Members <ChevronRight size={14} />
                  </div>
                </CardHeader>
              </Card>
            </Link>

          </div>

          <section className="flex flex-col items-center pt-12 space-y-12">
            <div className="text-center">
              <p className="text-xl md:text-2xl font-black italic text-white uppercase tracking-tighter mb-2">
                “Drive the exceptional — <span className="text-orange-500 underline decoration-4 underline-offset-8">join the passion</span>.”
              </p>
            </div>
            
            <img 
              className="w-48 grayscale hover:grayscale-0 transition-all duration-700 hover:scale-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]" 
              src="/HP-VIP-logo-round.png" 
              alt="HP-VIP Logo" 
            />
          </section>
          
        </div>
      </main>
    </>
  );
}