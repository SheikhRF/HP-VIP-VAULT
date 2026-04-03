import Navbar from "@/components/navbar";
import MassInductClient from "@/components/admin/MassInduct";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MassInductPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto space-y-10">

          <Link href="/admin/" className="flex items-center gap-2 text-gray-500 hover:text-orange-500 text-[9px] font-black uppercase tracking-widest transition-colors">
            <ArrowLeft size={12} /> Back to Hub
          </Link>

          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
              Mass <span className="text-orange-500">Induct</span>
            </h1>
            <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.5em]">
              Bulk Asset Registration Protocol
            </p>
          </div>

          <MassInductClient />
        </div>
      </main>
    </>
  );
}