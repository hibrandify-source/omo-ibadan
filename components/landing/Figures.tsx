"use client";

// A small still of people from the game's cast, for the landing page cards.

import { useEffect, useRef } from "react";
import { TILT_STREET, setTilt } from "@/lib/art/core";
import { drawPerson } from "@/lib/art/people";
import { CAST } from "@/lib/art/cast";

export default function Figures({ who, ground, label }: { who: { cast: string; dir: "S" | "E" | "W" }[]; ground: string; label: string }) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    setTilt(TILT_STREET);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = cv.clientWidth, H = cv.clientHeight;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    const ctx = cv.getContext("2d")!;
    const ppm = H / 2.3;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = ground;
    ctx.fillRect(0, 0, W, H);
    ctx.scale(ppm, ppm);
    const span = W / ppm;
    const gap = Math.min(1.1, span / (who.length + 1));
    const x0 = span / 2 - (gap * (who.length - 1)) / 2;
    who.forEach((p, i) => {
      ctx.save();
      ctx.translate(x0 + i * gap, 2.05);
      drawPerson(ctx, CAST[p.cast], p.dir, "stand", 0);
      ctx.restore();
    });
  }, [who, ground]);
  return <canvas ref={cvRef} role="img" aria-label={label} className="block h-36 w-full" />;
}
