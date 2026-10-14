"use client";

// Landing hero: dusk over Ibadan's brown roofs, drawn with the game's art kit.
// The backdrop is drawn once per size; only the street traffic animates.

import { useEffect, useRef } from "react";
import { TILT_STREET, setTilt } from "@/lib/art/core";
import { HERO_H, drawHeroBackdrop, drawHeroLive } from "@/lib/art/skyline";

export default function HeroScene() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let raf = 0;
    let backdrop: HTMLCanvasElement | null = null;
    let key = "";
    const start = performance.now();
    const frame = () => {
      setTilt(TILT_STREET);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = cv.clientWidth;
      const H = cv.clientHeight;
      const ppm = H / HERO_H;
      const viewW = W / ppm;
      const k = `${W}x${H}@${dpr}`;
      if (k !== key) {
        key = k;
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
        backdrop = document.createElement("canvas");
        backdrop.width = cv.width;
        backdrop.height = cv.height;
        const b = backdrop.getContext("2d")!;
        b.scale(ppm * dpr, ppm * dpr);
        drawHeroBackdrop(b, viewW);
      }
      const ctx = cv.getContext("2d")!;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (backdrop) ctx.drawImage(backdrop, 0, 0);
      ctx.setTransform(ppm * dpr, 0, 0, ppm * dpr, 0, 0);
      drawHeroLive(ctx, viewW, still ? 4 : (performance.now() - start) / 1000);
      if (!still) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const onResize = () => { if (still) raf = requestAnimationFrame(frame); };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return (
    <canvas
      ref={cvRef}
      role="img"
      aria-label="Dusk over Ibadan: rusty roofs of the old city, Mapo Hall on its hill, Cocoa House on the skyline, a micra and an okada on the road"
      className="block h-[260px] w-full sm:h-[380px] lg:h-[440px]"
    />
  );
}
