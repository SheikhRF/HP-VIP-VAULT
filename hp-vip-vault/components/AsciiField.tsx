"use client";

import { useEffect, useRef } from "react";

export type AsciiVariant = "matrix-rain" | "telemetry-feed" | "ascii-car" | "ascii-hyperspeed";

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function randItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const RAIN_CHARS = "01KMPHRPM°ΔΣ/\\|:.=+-".split("");

const CAR_ART = [
  "      ______",
  "   __/  __  \\_____",
  "  |  __/    \\__   \\",
  " O|_/        \\_|  O",
];

const HEX = "0123456789ABCDEF";
function hexId(len: number) {
  let s = "";
  for (let i = 0; i < len; i++) s += HEX[Math.floor(Math.random() * 16)];
  return s;
}

function telemetryLine(): string {
  const generators = [
    () => `SPD   ${Math.round(rand(60, 320))} KM/H`,
    () => `RPM   ${Math.round(rand(900, 9200))}`,
    () => `TIRE_FL ${Math.round(rand(68, 112))}°C`,
    () => `TIRE_FR ${Math.round(rand(68, 112))}°C`,
    () => `OIL_PSI ${Math.round(rand(20, 85))}`,
    () => `BOOST ${rand(0, 24).toFixed(1)} PSI`,
    () => `G-FORCE ${rand(0, 2.4).toFixed(2)}`,
    () => `LAT ${rand(-90, 90).toFixed(4)}`,
    () => `LON ${rand(-180, 180).toFixed(4)}`,
    () => `FUEL  ${Math.round(rand(10, 100))}%`,
    () => `VIN::${hexId(8)}`,
    () => `CHASSIS_ID 0x${hexId(4)}`,
  ];
  return randItem(generators)();
}

type Drop = { y: number; speed: number };
type TelemetrySlot = { text: string; flash: number };
type CarInstance = { x: number; y: number; vx: number; vy: number; scale: number; opacity: number };
type WarpChar = { angle: number; radius: number; speed: number };

export default function AsciiField({
  variant,
  density = 1,
  opacity = 1,
  className = "",
}: {
  variant: AsciiVariant;
  density?: number;
  opacity?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let paused = false;

    const fontSize = 13;
    const colWidth = fontSize * 0.75;
    let drops: Drop[] = [];
    let telemetrySlots: TelemetrySlot[] = [];
    let cars: CarInstance[] = [];
    let warpChars: WarpChar[] = [];

    function resize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, width, height);
      seed();
    }

    function seed() {
      if (variant === "matrix-rain") {
        const cols = Math.ceil(width / colWidth);
        drops = Array.from({ length: cols }, () => ({
          y: rand(-40, 0),
          speed: rand(0.15, 0.4),
        }));
      } else if (variant === "telemetry-feed") {
        const rows = Math.round(10 * density);
        telemetrySlots = Array.from({ length: rows }, () => ({ text: telemetryLine(), flash: 0 }));
      } else if (variant === "ascii-car") {
        const count = Math.max(2, Math.round(4 * density));
        cars = Array.from({ length: count }, () => ({
          x: rand(0, width),
          y: rand(0, height),
          vx: rand(-0.3, -0.1),
          vy: rand(0.02, 0.06),
          scale: rand(0.8, 1.6),
          opacity: rand(0.5, 1),
        }));
      } else if (variant === "ascii-hyperspeed") {
        const count = Math.round(60 * density);
        warpChars = Array.from({ length: count }, () => ({
          angle: rand(0, Math.PI * 2),
          radius: rand(0, 1),
          speed: rand(0.15, 0.3),
        }));
      }
    }

    function drawMatrixRain() {
      ctx!.fillStyle = `rgba(0,0,0,${0.18})`;
      ctx!.fillRect(0, 0, width, height);
      ctx!.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        const char = randItem(RAIN_CHARS);
        const x = i * colWidth;
        const y = d.y * fontSize;
        ctx!.fillStyle = `rgba(255,255,255,${0.9 * opacity})`;
        ctx!.fillText(char, x, y);
        ctx!.fillStyle = `rgba(249,115,22,${0.35 * opacity})`;
        ctx!.fillText(randItem(RAIN_CHARS), x, y - fontSize);
        d.y += d.speed;
        if (y > height && Math.random() > 0.97) d.y = rand(-20, 0);
      }
    }

    function drawTelemetryFeed() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.font = `${fontSize}px monospace`;
      ctx!.textAlign = "right";
      const originX = width - 24;
      const originY = 40;
      for (let i = 0; i < telemetrySlots.length; i++) {
        const slot = telemetrySlots[i];
        if (Math.random() < 0.0006 * density) {
          slot.text = telemetryLine();
          slot.flash = 1;
        }
        slot.flash *= 0.97;
        const alpha = (0.055 + slot.flash * 0.15) * opacity;
        ctx!.fillStyle = `rgba(249,115,22,${alpha})`;
        ctx!.fillText(slot.text, originX, originY + i * (fontSize + 6));
      }
      ctx!.textAlign = "left";
    }

    function drawAsciiCar() {
      ctx!.clearRect(0, 0, width, height);
      const lineHeight = fontSize * 0.95;
      for (const c of cars) {
        c.x += c.vx;
        c.y += c.vy;
        const artWidth = Math.max(...CAR_ART.map((l) => l.length)) * colWidth * c.scale;
        const artHeight = CAR_ART.length * lineHeight * c.scale;
        if (c.x < -artWidth) c.x = width + artWidth;
        if (c.y > height + artHeight) c.y = -artHeight;

        ctx!.save();
        ctx!.font = `${fontSize * c.scale}px monospace`;
        ctx!.fillStyle = `rgba(255,255,255,${0.12 * c.opacity * opacity})`;
        CAR_ART.forEach((line, i) => {
          ctx!.fillText(line, c.x, c.y + i * lineHeight * c.scale);
        });
        ctx!.restore();
      }
    }

    function drawAsciiHyperspeed() {
      ctx!.clearRect(0, 0, width, height);
      const originX = width * 0.5;
      const originY = height * 0.5;
      const maxRadius = Math.hypot(width, height) * 0.6;
      const glyphs = [".", ":", "-", "=", "/", "\\", "|"];

      for (const w of warpChars) {
        w.radius += w.speed * (0.25 + w.radius * 1.6) * 0.016 * 4;
        if (w.radius > 1) {
          w.radius = 0;
          w.angle = rand(0, Math.PI * 2);
        }
        const dist = w.radius * maxRadius;
        const x = originX + Math.cos(w.angle) * dist;
        const y = originY + Math.sin(w.angle) * dist;
        if (x < 0 || x > width || y < 0 || y > height) continue;

        const size = 8 + w.radius * 22;
        const alpha = Math.min(w.radius * 2, 1) * (1 - w.radius * 0.7) * 0.5 * opacity;
        const glyph = glyphs[Math.min(glyphs.length - 1, Math.floor(w.radius * glyphs.length))];
        const color = w.angle % 2 < 1 ? "255,255,255" : "249,115,22";
        ctx!.font = `${size}px monospace`;
        ctx!.fillStyle = `rgba(${color},${alpha})`;
        ctx!.fillText(glyph, x, y);
      }
    }

    function tick() {
      if (paused) {
        raf = requestAnimationFrame(tick);
        return;
      }
      if (variant === "matrix-rain") drawMatrixRain();
      else if (variant === "telemetry-feed") drawTelemetryFeed();
      else if (variant === "ascii-car") drawAsciiCar();
      else if (variant === "ascii-hyperspeed") drawAsciiHyperspeed();
      raf = requestAnimationFrame(tick);
    }

    const onVisibility = () => {
      paused = document.hidden;
    };

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);
    resize();
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [variant, density, opacity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`absolute inset-0 pointer-events-none motion-reduce:hidden ${className}`}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
