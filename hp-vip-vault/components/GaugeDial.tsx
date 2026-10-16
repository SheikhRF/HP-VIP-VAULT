"use client";

import { useEffect, useRef, useState } from "react";

const RADIUS = 80;
const HALF_CIRCUMFERENCE = Math.PI * RADIUS;

export default function GaugeDial({
  value,
  max,
  label,
  className = "",
}: {
  value: number;
  max: number;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [visible, setVisible] = useState(reducedMotion);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  const needleAngle = -90 + ratio * 180;
  const dashOffset = visible ? HALF_CIRCUMFERENCE * (1 - ratio) : HALF_CIRCUMFERENCE;

  return (
    <div ref={ref} className={className}>
      <svg viewBox="0 0 200 110" className="w-full h-auto overflow-visible">
        {/* Track */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="rgba(0,0,0,0.15)"
          strokeWidth={12}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="black"
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={HALF_CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          style={{ transition: reducedMotion ? "none" : "stroke-dashoffset 1100ms ease-out" }}
        />
        {/* Needle */}
        <g
          style={{
            transform: `rotate(${visible ? needleAngle : -90}deg)`,
            transformOrigin: "100px 100px",
            transition: reducedMotion ? "none" : "transform 1100ms ease-out",
          }}
        >
          <line x1="100" y1="100" x2="100" y2="32" stroke="black" strokeWidth={3} strokeLinecap="round" />
          <circle cx="100" cy="100" r="6" fill="black" />
        </g>
      </svg>
      <div className="text-center -mt-2">
        <p className="text-[9px] font-black uppercase tracking-widest opacity-70">{label}</p>
      </div>
    </div>
  );
}
