"use client";

// Code-drawn interiors (your room, shops) in the street camera. Replaces the
// old three.js dollhouse and shop interiors.

import { useEffect, useRef } from "react";
import { K, TILT_STREET, setTilt } from "@/lib/art/core";
import { ROOM_H, ROOM_W, drawRoom, drawShop, roomScreenH, type RoomScene, type ShopKind } from "@/lib/art/interiors";

export default function InteriorView({ room, shop, label }: { room?: RoomScene; shop?: ShopKind; label: string }) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const roomRef = useRef(room);
  roomRef.current = room;

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    let raf = 0;
    const start = performance.now();
    const frame = () => {
      setTilt(TILT_STREET);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = cv.clientWidth;
      const ppm = W / (ROOM_W + 0.6);
      const H = roomScreenH() * ppm;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
        cv.style.height = `${H}px`;
      }
      const ctx = cv.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#1c1916";
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.scale(ppm, ppm);
      ctx.translate(0.3, ROOM_H * K + 0.4);
      const t = (performance.now() - start) / 1000;
      if (roomRef.current) drawRoom(ctx, roomRef.current, t);
      else if (shop) drawShop(ctx, shop, t);
      ctx.restore();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [shop]);

  return <canvas ref={cvRef} role="img" aria-label={label} className="block w-full rounded-2xl ring-1 ring-roof/15" />;
}
