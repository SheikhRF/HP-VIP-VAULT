import Navbar from "@/components/navbar";
import { Mail } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";

export default async function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white flex items-center justify-center p-6">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Column: Connection Intel */}
          <Reveal className="space-y-10 order-2 lg:order-1">
            <header className="space-y-4">

              <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-tight">
                Get in <br /><span className="text-orange-500">Touch</span>
              </h1>
              <p className="text-gray-400 text-xs tracking-[0.2em] uppercase font-bold max-w-md leading-relaxed">
                Log your inquiry into the vault.
              </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: Mail, label: "Encryption", value: "info@horsepower.vip" },
              ].map((item, i) => (
                <div key={i} className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-[2rem] group transition-all duration-500 hover:border-orange-500/50 hover:-translate-y-1">
                  <item.icon className="text-orange-500 mb-4 group-hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.6)] transition-all" size={24} />
                  <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest mb-1">{item.label}</p>
                  <p className="text-sm font-bold uppercase tracking-tight">{item.value}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Right Column: Transmission Form */}
          <Reveal delay={100} className="order-1 lg:order-2 relative">
            {/* Decorative Glow */}
            <div className="absolute -inset-4 bg-orange-500/5 rounded-[3rem] blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />

            <ContactForm />
          </Reveal>

        </div>

      </main>
    </>
  );
}