"use client";

import { useEffect, useRef, useState } from "react";

const FORMATTERS = {
  number: (n: number) => Math.round(n).toLocaleString(),
  currency: (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(
      Math.round(n)
    ),
};

export default function CountUp({
  value,
  duration = 1200,
  format = "number",
  className = "",
}: {
  value: number;
  duration?: number;
  format?: keyof typeof FORMATTERS;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [display, setDisplay] = useState(reducedMotion ? value : 0);
  const [triggered, setTriggered] = useState(reducedMotion);

  useEffect(() => {
    const node = ref.current;
    if (!node || triggered) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [triggered]);

  useEffect(() => {
    if (!triggered || reducedMotion) return;

    const start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(value * progress);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [triggered, value, duration, reducedMotion]);

  return (
    <span ref={ref} className={className}>
      {FORMATTERS[format](display)}
    </span>
  );
}
