"use client";

import Link from "next/link";
import Hyperspeed from "@/components/Hyperspeed";
import { Unlock } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Background Effect - Preserved exactly as requested */}
      <Hyperspeed
        effectOptions={{
          onSpeedUp: () => {},
          onSlowDown: () => {},
          distortion: "turbulentDistortion",
          length: 400,
          roadWidth: 10,
          islandWidth: 2,
          lanesPerRoad: 4,
          fov: 90,
          fovSpeedUp: 150,
          speedUp: 2,
          carLightsFade: 0.4,
          totalSideLightSticks: 20,
          lightPairsPerRoadWay: 40,
          shoulderLinesWidthPercentage: 0.05,
          brokenLinesWidthPercentage: 0.1,
          brokenLinesLengthPercentage: 0.5,
          lightStickWidth: [0.12, 0.5],
          lightStickHeight: [1.3, 1.7],
          movingAwaySpeed: [60, 80],
          movingCloserSpeed: [-120, -160],
          carLightsLength: [400 * 0.03, 400 * 0.2],
          carLightsRadius: [0.05, 0.14],
          carWidthPercentage: [0.3, 0.5],
          carShiftX: [-0.8, 0.8],
          carFloorSeparation: [0, 5],
          colors: {
            roadColor: 0x171717,
            islandColor: 0x262626,
            background: 0x000000,
            shoulderLines: 0xa3a3a3,
            brokenLines: 0xf97316,
            leftCars: [0xf97316, 0xfb923c, 0x92400e],
            rightCars: [0x525252, 0xa3a3a3, 0xf97316],
            sticks: 0xf97316,
          },
        }}
      />

      {/* Futuristic UI Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        

        <Link
          href="/home"
          className="
            group
            pointer-events-auto
            relative
            flex flex-col items-center justify-center
            transition-all duration-500
          "
        >
          {/* Animated Glow Ring */}
          <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-2xl group-hover:bg-orange-500/40 transition-all duration-500" />
          
          {/* The Button Body */}
          <div className="
            relative
            backdrop-blur-xl
            bg-black/40
            border border-white/10
            group-hover:border-orange-500/50
            rounded-full
            p-8 md:p-12
            flex flex-col items-center justify-center
            shadow-[0_0_50px_rgba(0,0,0,0.5)]
            transition-all duration-500
            hover:scale-105
          ">
            <Unlock 
                className="text-orange-500 mb-4 group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(249,115,22,0.8)] transition-all" 
                size={48} 
                strokeWidth={1.5}
            />
            
            <h1 className="text-xl md:text-2xl font-black italic tracking-[0.2em] text-white uppercase group-hover:text-orange-500 transition-colors">
             Unlock <span className="text-orange-500 group-hover:text-white">Vault</span>
            </h1>
          </div>
        </Link>
      </div>

    </div>
  );
}