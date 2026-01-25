import Navbar from "@/components/navbar";
import { Shield, Zap, Target, Trophy, ChevronRight } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white flex flex-col items-center">
        
        {/* Header Section */}
        <section className="w-full max-w-7xl pt-32 pb-16 px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none mb-6">
            About <span className="text-orange-500">HORSEPOWER.VIP</span>
          </h1>
        </section>

        <div className="w-full max-w-5xl px-6 pb-24 space-y-20">
          
          {/* Main Blocks */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <p className="text-lg text-gray-400 font-medium leading-relaxed uppercase tracking-tight">
                <span className="text-white font-black italic">HORSEPOWER.VIP</span> is a luxury-driving collective dedicated to sharing the thrill 
                of exquisite performance vehicles.
              </p>
              <p className="text-sm text-gray-500 leading-loose border-l-2 border-orange-500 pl-6">
                We bring together hypercars, supercars, and sports cars — from legendary marques to hidden gems — giving enthusiasts 
                and collectors the opportunity to experience automotive excellence 
                in a bold, refined, and community-driven setting.
              </p>
            </div>
            <div className="space-y-6">
              <p className="text-sm text-gray-500 leading-loose">
                Whether you’re chasing speed, crafting memories, or simply indulging your 
                passion for fine machines, <span className="text-white font-bold italic uppercase">HORSEPOWER.VIP</span> exists to celebrate the beauty, 
                craftsmanship and emotion behind every engine.
              </p>
              <p className="text-sm text-gray-500 leading-loose">
                Our collection spans a wide range of performance cars, and with every vehicle we aim to deliver 
                an unmatched driving and ownership experience.
              </p>
            </div>
          </section>

          {/* What We Offer - Futuristic List Card */}
          <section className="relative">
            <div className="absolute -inset-4 bg-orange-500/5 rounded-[3rem] blur-3xl opacity-50" />
            <div className="relative bg-[#1a1a1a] border border-gray-800 p-10 md:p-14 rounded-[3rem] shadow-2xl">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-4">
                <div className="h-1 w-8 bg-orange-500" />
                What We Offer
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                {[
                  "Access to an exclusive curated collection of performance cars",
                  "Events, drives and experiences tailored for car enthusiasts",
                  "Vehicle history & data transparency via trusted APIs and records",
                  "A community built around passion, respect, and automotive culture"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 group">
                    <ChevronRight size={18} className="text-orange-500 mt-0.5 shrink-0 group-hover:translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300 leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Quote & Logo Section */}
          <section className="flex flex-col items-center pt-12 space-y-12">
            <div className="text-center">
              <p className="text-xl md:text-2xl font-black italic text-white uppercase tracking-tighter mb-2">
                “Drive the exceptional — <span className="text-orange-500 underline decoration-4 underline-offset-8">join the passion</span>.”
              </p>
            </div>
            
            <img 
              className="w-48 grayscale hover:grayscale-0 transition-all duration-700 hover:scale-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]" 
              src="HP-VIP-logo-round.png" 
              alt="HP-VIP Logo" 
            />
          </section>

        </div>

        {/* System Footer */}
        <footer className="w-full py-12 border-t border-gray-900 text-center">
          <p className="text-[9px] text-gray-800 font-black uppercase tracking-[0.6em]">
            HORSEPOWER.VIP 2026. 
          </p>
        </footer>
      </main>
    </>
  );
}