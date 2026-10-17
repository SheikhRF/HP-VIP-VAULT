"use client";

import { useEffect, useRef } from "react";

export type ParticleVariant = "ghost-fleet" | "night-drive" | "telemetry-grid" | "lane-dash" | "hybrid";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  depth: number; // 0..1, used for parallax speed/size/alpha
  kind?: "head" | "tail"; // night-drive only
};

// Minimal car side-profile silhouette, drawn around (0,0) at unit scale.
function drawCarSilhouette(ctx: CanvasRenderingContext2D, scale: number) {
  ctx.beginPath();
  ctx.moveTo(-1, 0.25);
  ctx.bezierCurveTo(-1, -0.05, -0.75, -0.1, -0.55, -0.25);
  ctx.bezierCurveTo(-0.35, -0.42, 0.1, -0.42, 0.3, -0.28);
  ctx.bezierCurveTo(0.55, -0.3, 0.8, -0.18, 1, 0.05);
  ctx.lineTo(1, 0.25);
  ctx.closePath();
  ctx.fill();

  // wheels
  ctx.beginPath();
  ctx.arc(-0.55 * scale, 0.3 * scale, 0.18 * scale, 0, Math.PI * 2);
  ctx.arc(0.5 * scale, 0.3 * scale, 0.18 * scale, 0, Math.PI * 2);
  ctx.fill();
}

export default function ParticleField({
  variant,
  density = 1,
  opacity = 1,
  className = "",
}: {
  variant: ParticleVariant;
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
    let particles: Particle[] = [];
    let raf = 0;
    let paused = false;

    const baseCounts: Record<ParticleVariant, number> = {
      "ghost-fleet": 14,
      "night-drive": 26,
      "telemetry-grid": 22,
      "lane-dash": 30,
      hybrid: 18,
    };

    function resize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function rand(min: number, max: number) {
      return min + Math.random() * (max - min);
    }

    function seed() {
      const count = Math.round(baseCounts[variant] * density);
      particles = Array.from({ length: count }, () => {
        const depth = rand(0.3, 1);
        return {
          x: rand(0, width),
          y: rand(0, height),
          vx: rand(-0.12, -0.03) * depth,
          vy: rand(0.02, 0.08) * depth,
          size: rand(14, 34) * depth,
          rotation: rand(-0.08, 0.08),
          depth,
          kind: Math.random() > 0.5 ? "head" : "tail",
        };
      });
    }

    function wrap(p: Particle) {
      if (p.x < -60) p.x = width + 60;
      if (p.x > width + 60) p.x = -60;
      if (p.y < -60) p.y = height + 60;
      if (p.y > height + 60) p.y = -60;
    }

    function drawGhostFleet() {
      ctx!.fillStyle = "#ffffff";
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        wrap(p);
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rotation);
        ctx!.globalAlpha = (0.03 + p.depth * 0.05) * opacity;
        drawCarSilhouette(ctx!, p.size);
        ctx!.restore();
      }
    }

    function drawNightDrive() {
      for (const p of particles) {
        p.x += p.vx * 6;
        p.y += p.vy * 2;
        wrap(p);
        const color = p.kind === "head" ? "255,255,255" : "249,115,22";
        const len = 18 + p.depth * 26;
        const grad = ctx!.createLinearGradient(p.x, p.y, p.x - len, p.y + len * 0.15);
        grad.addColorStop(0, `rgba(${color},${(0.35 + p.depth * 0.25) * opacity})`);
        grad.addColorStop(1, `rgba(${color},0)`);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 1.5 + p.depth;
        ctx!.beginPath();
        ctx!.moveTo(p.x, p.y);
        ctx!.lineTo(p.x - len, p.y + len * 0.15);
        ctx!.stroke();
      }
    }

    type Node = { x: number; y: number };
    let nodes: Node[] = [];
    let pulses: { a: number; b: number; t: number }[] = [];

    function seedTelemetry() {
      const cols = 6;
      const rows = 4;
      nodes = [];
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          nodes.push({
            x: (width / (cols - 1)) * i + rand(-30, 30),
            y: (height / (rows - 1)) * j + rand(-30, 30),
          });
        }
      }
      pulses = Array.from({ length: Math.round(5 * density) }, () => ({
        a: Math.floor(rand(0, nodes.length)),
        b: Math.floor(rand(0, nodes.length)),
        t: rand(0, 1),
      }));
    }

    function drawTelemetryGrid() {
      ctx!.strokeStyle = `rgba(249,115,22,${0.06 * opacity})`;
      ctx!.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 180) {
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }
      ctx!.fillStyle = `rgba(249,115,22,${0.5 * opacity})`;
      for (const p of pulses) {
        p.t += 0.006;
        if (p.t > 1) {
          p.t = 0;
          p.a = Math.floor(rand(0, nodes.length));
          p.b = Math.floor(rand(0, nodes.length));
        }
        const a = nodes[p.a];
        const b = nodes[p.b];
        if (!a || !b) continue;
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        ctx!.beginPath();
        ctx!.arc(x, y, 2, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function drawLaneDash() {
      ctx!.fillStyle = `rgba(255,255,255,${0.06 * opacity})`;
      for (const p of particles) {
        p.x += p.vx * 4;
        p.y += p.vy * 4;
        wrap(p);
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(-0.4);
        ctx!.globalAlpha = (0.04 + p.depth * 0.06) * opacity;
        ctx!.fillRect(-14 * p.depth, -2, 28 * p.depth, 4);
        ctx!.restore();
      }
    }

    function tick() {
      if (paused) {
        raf = requestAnimationFrame(tick);
        return;
      }
      ctx!.clearRect(0, 0, width, height);
      if (variant === "ghost-fleet") drawGhostFleet();
      else if (variant === "night-drive") drawNightDrive();
      else if (variant === "telemetry-grid") drawTelemetryGrid();
      else if (variant === "lane-dash") drawLaneDash();
      else if (variant === "hybrid") {
        drawGhostFleet();
        drawNightDrive();
      }
      raf = requestAnimationFrame(tick);
    }

    const onVisibility = () => {
      paused = document.hidden;
    };

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);
    resize();
    if (variant === "telemetry-grid") seedTelemetry();
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
