import Navbar from "@/components/navbar";
import { Send, Mail, MapPin, Globe, ShieldCheck } from "lucide-react";
import Link from "next/link";

// This is a Server Action
async function handleContactAction(formData: FormData) {
  "use server";
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  // Log to console or save to DB
  console.log("Received:", { name, email, message });
  
}

export default async function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Connection Intel */}
          <div className="space-y-10 order-2 lg:order-1">
            <header className="space-y-4">
              
              <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-tight">
                Get in <br /><span className="text-orange-500">Touch</span>
              </h1>
              <p className="text-gray-500 text-xs tracking-[0.2em] uppercase font-bold max-w-md leading-relaxed">
                Log your inquiry into the vault.
              </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: Mail, label: "Encryption", value: "info@horsepower.vip" },
              ].map((item, i) => (
                <div key={i} className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-[2rem] group hover:border-orange-500/50 transition-all">
                  <item.icon className="text-orange-500 mb-4" size={24} />
                  <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">{item.label}</p>
                  <p className="text-sm font-bold uppercase tracking-tight">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Transmission Form */}
          <div className="order-1 lg:order-2 relative">
            {/* Decorative Glow */}
            <div className="absolute -inset-4 bg-orange-500/5 rounded-[3rem] blur-3xl" />
            
            <form 
              action={handleContactAction}
              className="relative bg-[#1a1a1a] border border-gray-800 p-10 rounded-[2.5rem] shadow-2xl space-y-6"
            >
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest ml-1">Name</label>
                  <input 
                    name="name"
                    type="text" 
                    required
                    placeholder="IDENTIFY YOURSELF"
                    className="w-full bg-black border border-gray-800 rounded-2xl px-6 py-4 text-xs font-bold tracking-widest uppercase outline-none focus:border-orange-500 transition-all placeholder:text-gray-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest ml-1">Email</label>
                  <input 
                    name="email"
                    type="email" 
                    required
                    placeholder="EMAIL@VAULT.COM"
                    className="w-full bg-black border border-gray-800 rounded-2xl px-6 py-4 text-xs font-bold tracking-widest uppercase outline-none focus:border-orange-500 transition-all placeholder:text-gray-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest ml-1">Inquiry</label>
                  <textarea 
                    name="message"
                    rows={4}
                    required
                    placeholder="ENTER YOUR MESSAGE..."
                    className="w-full bg-black border border-gray-800 rounded-2xl px-6 py-4 text-xs font-bold tracking-widest uppercase outline-none focus:border-orange-500 transition-all resize-none placeholder:text-gray-900"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-orange-500 text-black py-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[11px] tracking-[0.3em] hover:bg-white transition-all shadow-[0_0_40px_rgba(249,115,22,0.2)]"
              >
                <Send size={16} /> Send
              </button>
            </form>
          </div>

        </div>

      </main>
    </>
  );
}