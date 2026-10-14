"use client";

// Owambe · Fuji night, drawn with the street art kit (lib/art/owambe): the band
// on the stage, aso-ebi guests, the celebrant dancing. Spraying throws real
// notes over her head onto the floor; the money boy gathers them. Spraying is a
// money sink and feeds the hood + daily hunt.

import { useEffect, useRef } from "react";
import { ensureAudio, fujiStart, fujiStop, coin, drumHit } from "@/lib/sound";
import { PRICES } from "@/lib/game";
import { TILT_STREET, rng, setTilt } from "@/lib/art/core";
import type { PersonSpec } from "@/lib/art/people";
import {
  CELEBRANT_SPOT, FLIGHT, NOTE_COLORS, OWAMBE_TOP, OWAMBE_W, PLAYER_SPOT,
  drawOwambe, gathererAt, owambeScreenH, startingNotes, type OwambeState,
} from "@/lib/art/owambe";

/** notes thrown per spray: more money, more paper in the air */
const NOTES_FOR: Record<number, number> = { 1000: 5, 5000: 12, 10000: 20 };
const MAX_NOTES = 160;

export default function OwambeHall({
  ola,
  energy,
  player,
  onSpray,
  onDance,
}: {
  ola: number;
  energy: number;
  player: PersonSpec;
  onSpray: (amount: number) => void;
  onDance: () => void;
}) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const clock = useRef({ start: 0 });
  const scene = useRef<OwambeState>({ player, danceUntil: 0, notes: startingNotes(), flying: [] });
  scene.current.player = player;

  useEffect(() => {
    ensureAudio();
    fujiStart();
    return () => fujiStop();
  }, []);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    let raf = 0;
    clock.current.start = performance.now();
    let lastPick = 0;
    const frame = () => {
      setTilt(TILT_STREET);
      const t = (performance.now() - clock.current.start) / 1000;
      const s = scene.current;
      // landed notes join the floor; the money boy picks one up every second or so
      const landed = s.flying.filter((f) => t - f.t0 >= FLIGHT);
      if (landed.length) {
        s.notes.push(...landed.map((f) => ({ x: f.x1, y: f.y1, rot: f.rot, color: f.color })));
        s.flying = s.flying.filter((f) => t - f.t0 < FLIGHT);
        if (s.notes.length > MAX_NOTES) s.notes.splice(0, s.notes.length - MAX_NOTES);
      }
      if (t - lastPick > 1.2 && s.notes.length > 12) {
        lastPick = t;
        const g = gathererAt(t);
        let best = -1, dist = 1.2;
        s.notes.forEach((n, i) => {
          const d = Math.hypot(n.x - g.x, n.y - g.y);
          if (d < dist) { dist = d; best = i; }
        });
        if (best >= 0) s.notes.splice(best, 1);
      }

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = cv.clientWidth;
      const ppm = W / (OWAMBE_W + 0.6);
      const H = owambeScreenH() * ppm;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
        cv.style.height = `${H}px`;
      }
      const ctx = cv.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#120d1c";
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.scale(ppm, ppm);
      ctx.translate(0.3, OWAMBE_TOP + 0.2);
      drawOwambe(ctx, s, t);
      ctx.restore();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const spray = (amt: number) => {
    if (ola < amt) return;
    ensureAudio();
    coin();
    const t = (performance.now() - clock.current.start) / 1000;
    const r = rng(Math.floor(t * 1000));
    const n = NOTES_FOR[amt] ?? 6;
    for (let i = 0; i < n; i++) {
      scene.current.flying.push({
        x0: PLAYER_SPOT.x + 0.2,
        y0: PLAYER_SPOT.y,
        x1: CELEBRANT_SPOT.x + (r() - 0.5) * 2.4,
        y1: CELEBRANT_SPOT.y + (r() - 0.3) * 1.6,
        t0: t + i * 0.06,
        rot: r() * Math.PI,
        color: NOTE_COLORS[Math.floor(r() * NOTE_COLORS.length)],
      });
    }
    scene.current.danceUntil = t + 3;
    onSpray(amt);
  };
  const dance = () => {
    ensureAudio();
    drumHit();
    scene.current.danceUntil = (performance.now() - clock.current.start) / 1000 + 6;
    onDance();
  };
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-3xl bg-charcoal ring-1 ring-white/10">
        <canvas ref={cvRef} role="img" aria-label="Owambe: Fuji band, aso-ebi guests and the dance floor" className="block w-full" />
      </div>
      <div className="rounded-3xl bg-white p-4 ring-1 ring-roof/10">
        <div className="text-[10px] font-extrabold tracking-[0.25em] text-roof">SPRAYING BATTLE · MONEY SINK, BRAGGING RIGHTS</div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {PRICES.spray.map((amt) => (
            <button
              key={amt}
              onClick={() => spray(amt)}
              disabled={ola < amt}
              className="rounded-2xl bg-charcoal px-3 py-2.5 text-sm font-extrabold text-cream disabled:opacity-35"
            >
              💸 ₦{amt.toLocaleString()}
            </button>
          ))}
        </div>
        <button
          onClick={dance}
          disabled={energy < 10}
          className="mt-2 w-full rounded-2xl bg-mapo/25 px-4 py-2.5 text-sm font-extrabold ring-1 ring-mapo/40 disabled:opacity-40"
        >
          💃 Dance (10⚡ → +1 Iwa){energy < 10 ? " — rest first" : ""}
        </button>
        <p className="mt-2 text-[11px] text-charcoal/55">Half of every spray rains on your hood&apos;s turf. The band chop the rest — Fuji no be free.</p>
      </div>
    </div>
  );
}
