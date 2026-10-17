"use client";

import { useEffect, useRef } from "react";

export type ParticleVariant =
  | "ghost-fleet"
  | "night-drive"
  | "telemetry-grid"
  | "rolling-road"
  | "speed-lines"
  | "checkered-drift"
  | "tire-tracks";

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

// Sleeker, more legible side-profile silhouette than a generic blob —
// drawn large and sparse so it actually reads as "car" at low opacity.
function drawCarSilhouette(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(-1, 0.3);
  ctx.lineTo(-0.9, 0.3);
  ctx.bezierCurveTo(-0.85, 0.05, -0.7, -0.05, -0.5, -0.12);
  ctx.bezierCurveTo(-0.35, -0.38, 0.05, -0.4, 0.25, -0.22);
  ctx.bezierCurveTo(0.45, -0.24, 0.65, -0.2, 0.8, -0.05);
  ctx.bezierCurveTo(0.92, -0.05, 1, 0.05, 1, 0.3);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.arc(-0.58, 0.32, 0.17, 0, Math.PI * 2);
  ctx.arc(0.6, 0.32, 0.17, 0, Math.PI * 2);
  ctx.fill();
}

type DriftParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  depth: number;
  kind?: "head" | "tail";
};

type WarpParticle = {
  angle: number;
  radius: number;
  speed: number;
  width: number;
};

type SpeedLine = {
  angle: number;
  length: number;
  flickerSeed: number;
  speed: number;
};

type TireTrack = {
  offset: number; // phase offset 0..1
  cycle: number; // seconds per cycle
  x: number;
  y: number;
  curve: number; // curvature amount
  length: number;
  rotation: number;
};

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
    let raf = 0;
    let paused = false;
    const startTime = performance.now();

    let driftParticles: DriftParticle[] = [];
    let warpParticles: WarpParticle[] = [];
    let speedLines: SpeedLine[] = [];
    let tireTracks: TireTrack[] = [];
    let nodes: { x: number; y: number }[] = [];
    let pulses: { a: number; b: number; t: number }[] = [];

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

    function wrap(p: DriftParticle) {
      if (p.x < -80) p.x = width + 80;
      if (p.x > width + 80) p.x = -80;
      if (p.y < -80) p.y = height + 80;
      if (p.y > height + 80) p.y = -80;
    }

    function seed() {
      if (variant === "ghost-fleet") {
        const count = Math.max(3, Math.round(5 * density));
        driftParticles = Array.from({ length: count }, () => {
          const depth = rand(0.5, 1);
          return {
            x: rand(0, width),
            y: rand(0, height),
            vx: rand(-0.1, -0.035) * depth,
            vy: rand(0.015, 0.045) * depth,
            size: rand(70, 170) * depth,
            rotation: rand(-0.06, 0.06),
            depth,
          };
        });
      } else if (variant === "night-drive") {
        const count = Math.round(26 * density);
        driftParticles = Array.from({ length: count }, () => {
          const depth = rand(0.3, 1);
          return {
            x: rand(0, width),
            y: rand(0, height),
            vx: rand(-0.14, -0.04) * depth,
            vy: rand(0.02, 0.07) * depth,
            size: rand(14, 30) * depth,
            rotation: 0,
            depth,
            kind: Math.random() > 0.5 ? "head" : "tail",
          };
        });
      } else if (variant === "rolling-road") {
        const count = Math.round(36 * density);
        warpParticles = Array.from({ length: count }, () => ({
          angle: rand(-0.5, 0.5) + Math.PI / 2, // mostly downward spread
          radius: rand(0, 1),
          speed: rand(0.12, 0.22),
          width: rand(14, 26),
        }));
      } else if (variant === "speed-lines") {
        const count = Math.round(18 * density);
        speedLines = Array.from({ length: count }, () => ({
          angle: rand(0, Math.PI * 2),
          length: rand(120, 320),
          flickerSeed: rand(0, 100),
          speed: rand(0.4, 1.2),
        }));
      } else if (variant === "checkered-drift") {
        const count = Math.round(14 * density);
        driftParticles = Array.from({ length: count }, () => {
          const depth = rand(0.4, 1);
          return {
            x: rand(0, width),
            y: rand(0, height),
            vx: rand(-0.08, -0.02) * depth,
            vy: rand(0.015, 0.04) * depth,
            size: rand(18, 34) * depth,
            rotation: rand(0, Math.PI * 2),
            depth,
          };
        });
      } else if (variant === "tire-tracks") {
        const count = Math.round(6 * density);
        tireTracks = Array.from({ length: count }, () => ({
          offset: rand(0, 1),
          cycle: rand(4, 7),
          x: rand(width * 0.1, width * 0.9),
          y: rand(height * 0.15, height * 0.85),
          curve: rand(-60, 60),
          length: rand(120, 240),
          rotation: rand(-0.6, 0.6),
        }));
      } else if (variant === "telemetry-grid") {
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
    }

    function drawGhostFleet() {
      for (const p of driftParticles) {
        p.x += p.vx;
        p.y += p.vy;
        wrap(p);
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rotation);
        const baseAlpha = (0.09 + p.depth * 0.09) * opacity;
        ctx!.fillStyle = `rgba(255,255,255,${baseAlpha})`;
        ctx!.save();
        ctx!.scale(p.size, p.size);
        drawCarSilhouette(ctx!);
        ctx!.restore();
        // thin orange rim accent along the roofline for shape clarity
        ctx!.strokeStyle = `rgba(249,115,22,${baseAlpha * 0.9})`;
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.moveTo(-0.35 * p.size, -0.38 * p.size);
        ctx!.quadraticCurveTo(0.1 * p.size, -0.46 * p.size, 0.45 * p.size, -0.25 * p.size);
        ctx!.stroke();
        ctx!.restore();
      }
    }

    function drawNightDrive() {
      for (const p of driftParticles) {
        p.x += p.vx * 6;
        p.y += p.vy * 2;
        wrap(p);
        const color = p.kind === "head" ? "255,255,255" : "249,115,22";
        const len = 18 + p.depth * 26;
        const grad = ctx!.createLinearGradient(p.x, p.y, p.x - len, p.y + len * 0.15);
        grad.addColorStop(0, `rgba(${color},${(0.4 + p.depth * 0.3) * opacity})`);
        grad.addColorStop(1, `rgba(${color},0)`);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 1.5 + p.depth;
        ctx!.beginPath();
        ctx!.moveTo(p.x, p.y);
        ctx!.lineTo(p.x - len, p.y + len * 0.15);
        ctx!.stroke();
      }
    }

    function drawRollingRoad() {
      // Particles warp outward from a point above center, like a road
      // rushing under the viewer — gives the dashes real forward motion
      // instead of a flat diagonal drift.
      const originX = width * 0.5;
      const originY = height * 0.25;
      const maxRadius = Math.hypot(width, height) * 0.75;

      for (const p of warpParticles) {
        p.radius += p.speed * (0.3 + p.radius * 2);
        if (p.radius > 1) {
          p.radius = 0;
          p.angle = rand(-0.5, 0.5) + Math.PI / 2;
        }
        const dist = p.radius * maxRadius;
        const x = originX + Math.cos(p.angle) * dist;
        const y = originY + Math.sin(p.angle) * dist;
        const scale = 0.2 + p.radius * 1.4;
        const alpha = Math.min(p.radius * 1.8, 1) * (1 - p.radius) * 0.4 * opacity;
        if (alpha <= 0) continue;

        ctx!.save();
        ctx!.translate(x, y);
        ctx!.rotate(p.angle - Math.PI / 2);
        ctx!.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx!.fillRect((-p.width * scale) / 2, 0, p.width * scale, 5 * scale);
        ctx!.restore();
      }
    }

    function drawSpeedLines(elapsed: number) {
      const originX = width * 0.82;
      const originY = height * 1.05;
      for (const l of speedLines) {
        const flicker = 0.4 + 0.6 * Math.abs(Math.sin(elapsed * l.speed + l.flickerSeed));
        const x2 = originX + Math.cos(l.angle) * l.length;
        const y2 = originY + Math.sin(l.angle) * l.length;
        const grad = ctx!.createLinearGradient(originX, originY, x2, y2);
        grad.addColorStop(0, `rgba(249,115,22,0)`);
        grad.addColorStop(0.5, `rgba(255,255,255,${0.1 * flicker * opacity})`);
        grad.addColorStop(1, `rgba(255,255,255,0)`);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(originX, originY);
        ctx!.lineTo(x2, y2);
        ctx!.stroke();
      }
    }

    function drawCheckeredDrift() {
      for (const p of driftParticles) {
        p.x += p.vx;
        p.y += p.vy;
        wrap(p);
        const cell = p.size / 2;
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rotation);
        const alpha = (0.1 + p.depth * 0.08) * opacity;
        ctx!.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx!.fillRect(-cell, -cell, cell, cell);
        ctx!.fillRect(0, 0, cell, cell);
        ctx!.fillStyle = `rgba(249,115,22,${alpha * 0.8})`;
        ctx!.fillRect(0, -cell, cell, cell);
        ctx!.fillRect(-cell, 0, cell, cell);
        ctx!.restore();
      }
    }

    function easeInOutCubic(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function drawTireTracks(elapsed: number) {
      for (const t of tireTracks) {
        const localT = (elapsed / t.cycle + t.offset) % 1;
        let reveal = 0;
        let alpha = 0;
        if (localT < 0.25) {
          reveal = easeInOutCubic(localT / 0.25);
          alpha = 1;
        } else if (localT < 0.65) {
          reveal = 1;
          alpha = 1;
        } else {
          reveal = 1;
          alpha = 1 - easeInOutCubic((localT - 0.65) / 0.35);
        }
        if (alpha <= 0.01) continue;

        const points = 24;
        const visiblePoints = Math.max(2, Math.floor(points * reveal));
        ctx!.save();
        ctx!.translate(t.x, t.y);
        ctx!.rotate(t.rotation);
        ctx!.strokeStyle = `rgba(255,255,255,${0.14 * alpha * opacity})`;
        ctx!.lineWidth = 2.5;
        ctx!.lineCap = "round";
        ctx!.beginPath();
        for (let i = 0; i < visiblePoints; i++) {
          const pct = i / points;
          const px = pct * t.length;
          const py = Math.sin(pct * Math.PI * 1.4) * t.curve;
          if (i === 0) ctx!.moveTo(px, py);
          else ctx!.lineTo(px, py);
        }
        ctx!.stroke();
        ctx!.restore();
      }
    }

    function drawTelemetryGrid() {
      ctx!.strokeStyle = `rgba(249,115,22,${0.07 * opacity})`;
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
      ctx!.fillStyle = `rgba(249,115,22,${0.6 * opacity})`;
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
        ctx!.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function tick() {
      if (paused) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const elapsed = (performance.now() - startTime) / 1000;
      ctx!.clearRect(0, 0, width, height);
      if (variant === "ghost-fleet") drawGhostFleet();
      else if (variant === "night-drive") drawNightDrive();
      else if (variant === "telemetry-grid") drawTelemetryGrid();
      else if (variant === "rolling-road") drawRollingRoad();
      else if (variant === "speed-lines") drawSpeedLines(elapsed);
      else if (variant === "checkered-drift") drawCheckeredDrift();
      else if (variant === "tire-tracks") drawTireTracks(elapsed);
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
