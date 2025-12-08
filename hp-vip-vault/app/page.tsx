"use client";

import Link from "next/link";
import Hyperspeed from "@/components/Hyperspeed";
  

export default function LandingPage() {
  return (
    <div className="relative w-full h-screen overflow">

      {/* Background Effect */}
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

      {/* UI Overlay */}
      <div className="absolute inset-0 flex items-start justify-center pt-40 pointer-events-none">

        <Link
          href="/home"
          className="
            pointer-events-auto
            text-center
            backdrop-blur-md
            border border-border/40
            rounded-xl
            px-10 py-6
            shadow-2xl
            justify-center
            items-center
            flex
            hover:bg-white/10
            transition
          "
        >
          <h1 className="text-5xl font-bold text-primary mb-6 drop-shadow-lg justify-center items-center flex pt-5">
          Enter the Vault
        </h1>
        </Link>
      </div>
    </div>
  );
}
