"use client";

import { useState } from "react";
import { X } from "lucide-react";
import ParticleField, { ParticleVariant } from "@/components/ParticleField";
import { Button } from "@/components/ui/button";

const VARIANTS: { id: ParticleVariant; name: string; blurb: string }[] = [
  { id: "ghost-fleet", name: "Ghost Fleet", blurb: "Drifting car silhouettes, extends the existing CarFront ghost-icon treatment" },
  { id: "night-drive", name: "Night Drive", blurb: "Headlight / taillight streaks, like distant traffic passing" },
  { id: "telemetry-grid", name: "Telemetry Grid", blurb: "Diagnostic node network with traveling data pulses" },
  { id: "lane-dash", name: "Rolling Odometer", blurb: "Road lane-marking dashes streaming past" },
  { id: "hybrid", name: "Hybrid", blurb: "Ghost Fleet + Night Drive layered together" },
];

function PreviewCard({ variant, name, blurb, opacity, onFullscreen }: {
  variant: ParticleVariant;
  name: string;
  blurb: string;
  opacity: number;
  onFullscreen: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-gray-800 bg-black h-[420px] flex flex-col">
      <ParticleField variant={variant} opacity={opacity} className="z-0" />
      <div className="relative z-10 flex flex-col h-full p-8">
        <div className="space-y-1">
          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">{name}</h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] max-w-xs">{blurb}</p>
        </div>

        {/* Sample content to judge legibility against */}
        <div className="mt-auto space-y-4">
          <div className="bg-[#1a1a1a]/90 border border-gray-800 rounded-2xl p-5 backdrop-blur-sm">
            <p className="text-[9px] text-orange-500 font-black uppercase tracking-[0.2em] mb-1">McLaren</p>
            <h4 className="text-xl font-black italic uppercase text-white tracking-tighter">765LT</h4>
          </div>
          <Button variant="vault" size="sm" onClick={onFullscreen} className="w-full">
            View Full Screen
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ParticleDemoClient() {
  const [opacity, setOpacity] = useState(1);
  const [fullscreen, setFullscreen] = useState<ParticleVariant | null>(null);

  const activeVariant = VARIANTS.find((v) => v.id === fullscreen);

  return (
    <main className="min-h-screen bg-background text-white px-6 pt-32 pb-20">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="space-y-2">
          <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
            Particle <span className="text-orange-500">Field</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">
            Internal design review — not linked from navigation
          </p>
        </header>

        <div className="flex items-center gap-4 bg-[#1a1a1a] border border-gray-800 rounded-2xl px-6 py-4 w-fit">
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Intensity</span>
          {[0.5, 1, 1.75].map((v) => (
            <button
              key={v}
              onClick={() => setOpacity(v)}
              className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border transition-colors ${
                opacity === v
                  ? "bg-orange-500 text-black border-orange-500"
                  : "text-gray-400 border-gray-800 hover:border-orange-500/50"
              }`}
            >
              {v === 0.5 ? "Lower" : v === 1 ? "Default" : "Higher"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {VARIANTS.map((v) => (
            <PreviewCard
              key={v.id}
              variant={v.id}
              name={v.name}
              blurb={v.blurb}
              opacity={opacity}
              onFullscreen={() => setFullscreen(v.id)}
            />
          ))}
        </div>
      </div>

      {fullscreen && activeVariant && (
        <div className="fixed inset-0 z-[100] bg-black">
          <ParticleField variant={fullscreen} opacity={opacity} />
          <button
            onClick={() => setFullscreen(null)}
            className="absolute top-8 right-8 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-[#1a1a1a] border border-gray-800 text-white hover:border-orange-500 transition-colors"
          >
            <X size={18} />
          </button>
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 space-y-4">
            <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.3em]">{activeVariant.name}</p>
            <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white leading-none">
              The <span className="text-orange-500">Collection</span>
            </h2>
          </div>
        </div>
      )}
    </main>
  );
}
