import Navbar from "@/components/navbar";
import { Shield, Activity, Users, Database, MapPin, Gauge, Lock } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto space-y-24">
          
          {/* THE IDENTITY */}
          <section className="max-w-4xl space-y-6">
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
              The <span className="text-orange-500">Vault</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.6em] ml-1">
              Digital Car Collection • HP.VIP
            </p>
            <p className="text-lg text-gray-400 max-w-2xl leading-relaxed font-bold mt-12">
              The Vault is a digital home for our car collection. It is a private space where we track every vehicle's details, location, and service in real-time.
            </p>
          </section>

          {/* DUAL PURPOSE GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* FOR THE DRIVERS   */}
            <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] space-y-6 transition-all hover:border-white/10  ">
              <div className="flex items-center gap-4 mb-4">
                <Users className="text-orange-500" size={28} />
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">For The <span className="text-orange-500">Drivers</span></h3>
              </div>
              <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Circle Access</p>
              <ul className="space-y-4 text-xs text-gray-500 uppercase tracking-widest font-bold">
                <li className="flex gap-3"><span className="text-orange-500">/</span> View accurate specs for every car in the collection.</li>
                <li className="flex gap-3"><span className="text-orange-500">/</span> Browse high-quality photos and history for each asset.</li>
                <li className="flex gap-3"><span className="text-orange-500">/</span> Check a car's stats and performance before you get behind the wheel.</li>
              </ul>
            </div>

            {/* FOR THE ADMINS */}
            <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] space-y-6 transition-all hover:border-white/10">
              <div className="flex items-center gap-4 mb-4">
                <Shield className="text-orange-500" size={28} />
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">For The <span className="text-orange-500">Admins</span></h3>
              </div>
              <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Management</p>
              <ul className="space-y-4 text-xs text-gray-500 uppercase tracking-widest font-bold">
                <li className="flex gap-3"><span className="text-orange-500">/</span> Keep track of exactly where every car is located.</li>
                <li className="flex gap-3"><span className="text-orange-500">/</span> Get alerts for Tax, MOT, and Service due dates.</li>
                <li className="flex gap-3"><span className="text-orange-500">/</span> Easily add new cars to the collection with verified data.</li>
              </ul>
            </div>
          </div>

          {/* DATA SOURCE INFO */}
          <div className="relative">
            <div className="border border-white/5 bg-white/[0.01] rounded-[2.5rem] p-12 overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="space-y-4 text-center md:text-left">
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter">Verified <span className="text-orange-500">Data</span></h2>
                  <p className="text-xs text-gray-600 font-bold uppercase tracking-[0.2em] max-w-md">
                    To keep things accurate, we pull technical specs directly from official automotive databases. This ensures the BHP, Torque, and engine sizes are always correct.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="px-8 py-5 bg-black/40 border border-white/5 rounded-2xl text-center">
                    <p className="text-[8px] text-gray-600 font-black uppercase mb-1">Status</p>
                    <p className="text-xs font-black italic text-orange-500">ONLINE</p>
                  </div>
                  <div className="px-8 py-5 bg-black/40 border border-white/5 rounded-2xl text-center">
                    <p className="text-[8px] text-gray-600 font-black uppercase mb-1">Uplink</p>
                    <p className="text-xs font-black italic text-white">ACTIVE</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <footer className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-600">
                HP.VIP // THE VAULT
              </p>
            </div>
            <p className="text-[9px] text-gray-700 font-bold uppercase tracking-widest text-center md:text-right">
              Access is limited to friends and authorized members.
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}