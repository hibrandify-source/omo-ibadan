"use client";

import { useEffect, useRef, useState } from "react";
import type { DriveRoute } from "@/lib/world";
import { BAY_NAMES } from "@/lib/world";
import { samplePolyline, polyLength, hash01 } from "@/lib/iso";
import { signalIsRed } from "@/lib/streets";
import { engineSpeed, engineStart, engineStop, horn } from "@/lib/sound";

export type HazardKind = "pothole" | "keke" | "okada" | "vio" | "signal";

interface Ob {
  s: number;
  lane: number;
  kind: Exclude<HazardKind, "vio">;
  hit: boolean;
  seed: number;
}

const PX = 24; // px per tile
const LANE_W = 0.9; // tiles

export default function DriveStage({
  route,
  passengers,
  autopilot,
  saver,
  onHazard,
  onBay,
  onFinish,
  onHonk,
  weather,
}: {
  route: DriveRoute;
  passengers: number;
  autopilot: boolean;
  saver: boolean;
  onHazard: (kind: HazardKind) => void;
  onBay: (ok: boolean) => void;
  onFinish: () => void;
  onHonk: (msg: string) => void;
  weather: "clear" | "rain";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(0);
  const [lane, setLane] = useState(0);
  const [inBox, setInBox] = useState(false);
  const st = useRef({
    s: 0, lane: 0, obs: [] as Ob[], bayIdx: 0, vioIdx: 0,
    spawnT: 0, done: false, seed: Math.floor(Math.random() * 1000),
  });
  const pauseRef = useRef(0);
  const walkers = useRef<{ fx: number; fy: number; tx: number; ty: number; t0: number; cloth: string }[]>([]);
  const weatherMirror = useRef(weather);
  weatherMirror.current = weather;
  const cb = useRef({ onHazard, onBay, onFinish, onHonk });
  cb.current = { onHazard, onBay, onFinish, onHonk };
  const honkCd = useRef(0);

  const honk = () => {
    if (autopilot) return;
    const now = performance.now();
    if (now - honkCd.current < 6000) return;
    honkCd.current = now;
    horn();
    const c = st.current;
    const target = c.obs
      .filter((o) => !o.hit && o.kind !== "pothole" && o.s > c.s && o.s - c.s < 0.07 && o.lane === c.lane)
      .sort((a, b) => a.s - b.s)[0];
    if (target) {
      target.hit = true;
      cb.current.onHonk(`📯 PÒÒN!! The ${target.kind} comot road sharply. Conductor hails you.`);
    } else {
      cb.current.onHonk("📯 PÒÒN!! Echo for empty road. Everybody look your face.");
    }
  };
  const laneMirror = useRef(0);
  const reduced =
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const totalLen = polyLength(route.pts);
  const duration = autopilot ? 9 : 24; // seconds for full route
  const speed = 1 / duration;

  // reset on route change
  useEffect(() => {
    st.current = { s: 0, lane: 0, obs: [], bayIdx: 0, vioIdx: 0, spawnT: 0, done: false, seed: Math.floor(Math.random() * 1000) };
    laneMirror.current = 0;
    setS(0);
    setLane(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.id, autopilot]);

  // engine loop lives as long as the run is mounted
  useEffect(() => {
    engineStart();
    return () => engineStop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keyboard
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (autopilot) return;
      if (e.key === "ArrowLeft" || e.key === "a") {
        setLane((l) => Math.max(-1, l - 1));
        laneMirror.current = Math.max(-1, laneMirror.current - 1);
      }
      if (e.key === "ArrowRight" || e.key === "d") {
        setLane((l) => Math.min(1, l + 1));
        laneMirror.current = Math.min(1, laneMirror.current + 1);
      }
      if (e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        stopPress();
      }
      if (e.key === "h" || e.key === "H") honk();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autopilot]);

  const stopPress = () => {
    const c = st.current;
    if (c.done || c.bayIdx >= route.bays.length) return;
    const bay = route.bays[c.bayIdx];
    const ok = Math.abs(c.s - bay) < 0.009;
    c.bayIdx++;
    if (ok) {
      // halt: two passengers visibly board from the shelter
      pauseRef.current = 1.6;
      const b = samplePolyline(route.pts, bay);
      const m = samplePolyline(route.pts, c.s);
      const now = performance.now();
      walkers.current.push(
        { fx: b.x + -b.dy * 2.6, fy: b.y + b.dx * 2.6, tx: m.x, ty: m.y, t0: now, cloth: "#B33A3A" },
        { fx: b.x + -b.dy * 2.6 + 0.4, fy: b.y + b.dx * 2.6 + 0.3, tx: m.x, ty: m.y, t0: now + 450, cloth: "#1F7A4D" }
      );
      setTimeout(() => {
        walkers.current = [];
      }, 2500);
    }
    cb.current.onBay(ok);
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let running = true;
    let W = 0;
    let H = 0;
    let last = performance.now();

    const resize = () => {
      const r = wrapRef.current!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, saver ? 1 : 1.5);
      W = Math.max(280, r.width);
      H = 380;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapRef.current!);
    const onVis = () => {
      running = !document.hidden;
      last = performance.now();
      if (running) loop();
    };
    document.addEventListener("visibilitychange", onVis);

    const loop = () => {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const c = st.current;
      if (c.done) return;

      // player steering feeds the sim (autopilot writes laneMirror itself)
      if (!autopilot) c.lane = laneMirror.current;

      // advance (bay halts + autopilot red-holds pause it)
      if (pauseRef.current > 0) {
        pauseRef.current -= dt;
      } else {
        const prevS = c.s;
        let held = false;
        if (autopilot) {
          for (let si = 0; si < route.signals.length; si++) {
            const sig = route.signals[si];
            if (sig > c.s && sig - c.s < 0.022 && signalIsRed(si, now)) {
              held = true;
              break;
            }
          }
        }
        if (!held) c.s = Math.min(1, c.s + speed * dt);
        engineSpeed(autopilot ? 0.3 : 0.4 + c.s * 0.4);
        if (!autopilot) {
          for (let si = 0; si < route.signals.length; si++) {
            const sig = route.signals[si];
            if (prevS < sig && c.s >= sig && signalIsRed(si, now)) {
              cb.current.onHazard("signal");
            }
          }
        }
      }
      setS(c.s);

      // autopilot: dodge + auto-stop
      if (autopilot) {
        const ahead = c.obs.filter((o) => !o.hit && o.s > c.s && o.s - c.s < 0.03 && o.lane === c.lane);
        if (ahead.length > 0) {
          const free = [-1, 0, 1].filter(
            (l) => !c.obs.some((o) => !o.hit && o.s > c.s && o.s - c.s < 0.04 && o.lane === l)
          );
          if (free.length > 0) {
            c.lane = free[0];
            setLane(free[0]);
            laneMirror.current = free[0];
          }
        }
        if (c.bayIdx < route.bays.length && Math.abs(c.s - route.bays[c.bayIdx]) < 0.004) {
          c.bayIdx++;
          cb.current.onBay(true);
        }
      }

      // spawn hazards (drive mode only)
      if (!autopilot) {
        c.spawnT -= dt;
        if (c.spawnT <= 0 && c.s < 0.94) {
          c.spawnT = 1.0;
          const r = hash01("spawn" + c.seed, Math.floor(c.s * 200));
          const lanePick = Math.floor(hash01("lane" + c.seed, Math.floor(c.s * 200) + 7) * 3) - 1;
          const wPot = 1 + route.potholes * 1.5;
          const roll = hash01("kind" + c.seed, Math.floor(c.s * 200) + 13) * (wPot + 4);
          const kind = roll < wPot ? "pothole" : roll < wPot + 2 ? "keke" : "okada";
          c.obs.push({ s: Math.min(0.99, c.s + 0.2 + r * 0.06), lane: lanePick, kind: kind as Ob["kind"], hit: false, seed: Math.floor(r * 999) });
        }
      }

      // bay window + vio checkpoints
      const bay = route.bays[c.bayIdx];
      setInBox(bay !== undefined && Math.abs(c.s - bay) < 0.009 && !autopilot);
      if (c.vioIdx < route.vio.length && c.s >= route.vio[c.vioIdx]) {
        c.vioIdx++;
        cb.current.onHazard("vio");
      }

      // collisions
      for (const o of c.obs) {
        if (!o.hit && Math.abs(o.s - c.s) < 0.004 && o.lane === c.lane) {
          o.hit = true;
          cb.current.onHazard(o.kind);
        }
      }
      c.obs = c.obs.filter((o) => o.s > c.s - 0.03);

      if (c.s >= 1) {
        c.done = true;
        cb.current.onFinish();
        return;
      }

      // ---- draw (north-up top-down) ----
      const me = samplePolyline(route.pts, c.s);
      const mx = W / 2;
      const my = H * 0.68;
      const toScreen = (wx: number, wy: number) => ({
        x: mx + (wx - (me.x + perp.x * c.lane * LANE_W)) * PX,
        y: my + (wy - (me.y + perp.y * c.lane * LANE_W)) * PX,
      });
      const perp = { x: -me.dy, y: me.dx };

      // urban ground
      ctx.fillStyle = "#a8a094";
      ctx.fillRect(0, 0, W, H);
      // roadside trees (seeded, static in world)
      const t0 = Math.max(0, c.s - 0.06);
      const t1 = Math.min(1, c.s + 0.24);
      if (!saver) {
        for (let k = 0; k < 26; k++) {
          const tt = t0 + hash01("side" + route.id, k * 2 + 1) * (t1 - t0);
          const side = hash01("side" + route.id, k * 2 + 2) > 0.5 ? 1 : -1;
          const off = (2.6 + hash01("side" + route.id, k * 3 + 3) * 3) * side;
          const base = samplePolyline(route.pts, tt);
          const p = toScreen(base.x + -base.dy * off, base.y + base.dx * off);
          if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) continue;
          ctx.fillStyle = k % 3 ? "#1F7A4D" : "#2c945f";
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5 + hash01("side" + route.id, k) * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // road ribbon (sidewalk underlay first, his-way streets)
      const N = 44;
      const band = (hw: number, color: string) => {
        const L: { x: number; y: number }[] = [];
        const R: { x: number; y: number }[] = [];
        for (let i = 0; i <= N; i++) {
          const tt = t0 + ((t1 - t0) * i) / N;
          const b = samplePolyline(route.pts, tt);
          L.push(toScreen(b.x + -b.dy * hw, b.y + b.dx * hw));
          R.push(toScreen(b.x - -b.dy * hw, b.y - b.dx * hw));
        }
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(L[0].x, L[0].y);
        for (const p of L) ctx.lineTo(p.x, p.y);
        for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i].x, R[i].y);
        ctx.closePath();
        ctx.fill();
      };
      band(2.05, "#cfc6b4");
      band(1.5, weatherMirror.current === "rain" ? "#1e1c19" : "#24211d");
      // lane dashes
      ctx.strokeStyle = "rgba(245,217,168,0.8)";
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 12]);
      for (const off of [-0.5, 0.5]) {
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const tt = t0 + ((t1 - t0) * i) / N;
          const b = samplePolyline(route.pts, tt);
          const p = toScreen(b.x + -b.dy * off, b.y + b.dx * off);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // static potholes from corridor density
      for (let k = 0; k < route.potholes * 8; k++) {
        const tt = hash01("rpot" + route.id, k * 2 + 1);
        if (tt < t0 || tt > t1) continue;
        const b = samplePolyline(route.pts, tt);
        const laneOff = (hash01("rpot" + route.id, k * 2 + 2) - 0.5) * 2.4;
        const p = toScreen(b.x + -b.dy * laneOff, b.y + b.dx * laneOff);
        ctx.fillStyle = "#0c0c0e";
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, 5, 3.4, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // bus bays (upcoming only) with real stop names
      const bayNames = BAY_NAMES[route.id] ?? [];
      route.bays.forEach((b, bi) => {
        if (b < t0 || b > t1 || bi < c.bayIdx) return;
        const base = samplePolyline(route.pts, b);
        const p = toScreen(base.x + -base.dy * 1.9, base.y + base.dx * 1.9);
        const near = Math.abs(c.s - b) < 0.02;
        ctx.strokeStyle = near ? "#22c55e" : "#E8A020";
        ctx.lineWidth = 3;
        ctx.strokeRect(p.x - 16, p.y - 12, 32, 24);
        ctx.fillStyle = near ? "#22c55e" : "#E8A020";
        ctx.font = "700 10px Sora, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("BUS STOP", p.x, p.y - 16);
        ctx.font = "800 11px Sora, sans-serif";
        ctx.fillStyle = "#1C1917";
        ctx.fillText(bayNames[bi] ?? "", p.x, p.y + 28);
        // cone slalom on the approach
        for (let k = 0; k < 4; k++) {
          const ct = Math.max(0, b - 0.016 + k * 0.005);
          if (ct < t0 || ct > t1) continue;
          const cb2 = samplePolyline(route.pts, ct);
          const side = (bi + k) % 2 === 0 ? 1 : -1;
          const cp = toScreen(cb2.x + -cb2.dy * 1.05 * side, cb2.y + cb2.dx * 1.05 * side);
          ctx.fillStyle = "#e8641e";
          ctx.beginPath();
          ctx.moveTo(cp.x, cp.y - 7);
          ctx.lineTo(cp.x - 5, cp.y + 5);
          ctx.lineTo(cp.x + 5, cp.y + 5);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#F2EDE4";
          ctx.fillRect(cp.x - 3, cp.y - 1, 6, 2.5);
        }
      });

      // overhead gantry with corridor boards
      {
        const gt = 0.5;
        if (gt > t0 && gt < t1) {
          const gb = samplePolyline(route.pts, gt);
          const gp = toScreen(gb.x, gb.y);
          const names = BAY_NAMES[route.id] ?? [];
          ctx.fillStyle = "#3a3a3e";
          ctx.fillRect(gp.x - 70, gp.y - 120, 8, 60);
          ctx.fillRect(gp.x + 62, gp.y - 120, 8, 60);
          ctx.fillRect(gp.x - 70, gp.y - 128, 140, 8);
          ctx.fillStyle = "#14532d";
          ctx.fillRect(gp.x - 64, gp.y - 118, 62, 26);
          ctx.fillRect(gp.x + 2, gp.y - 118, 62, 26);
          ctx.fillStyle = "#ffffff";
          ctx.font = "800 9px Sora, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(names[0] ?? route.short, gp.x - 33, gp.y - 102);
          ctx.fillText(names[names.length - 1] ?? "", gp.x + 33, gp.y - 102);
        }
      }

      // traffic signals (red runners get fined — same cycle as 3D posts)
      route.signals.forEach((sg, si) => {
        if (sg < t0 || sg > t1) return;
        const base = samplePolyline(route.pts, sg);
        const p = toScreen(base.x + -base.dy * -1.9, base.y + base.dx * -1.9);
        const red = signalIsRed(si, now);
        ctx.fillStyle = "#1C1917";
        ctx.fillRect(p.x - 5, p.y - 22, 10, 24);
        ctx.fillStyle = red ? "#ff2222" : "#330000";
        ctx.beginPath();
        ctx.arc(p.x, p.y - 15, 3.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = red ? "#002200" : "#22ff44";
        ctx.beginPath();
        ctx.arc(p.x, p.y - 5, 3.4, 0, Math.PI * 2);
        ctx.fill();
      });

      // boarding walkers: shelter → micra while halted
      for (const w of walkers.current) {
        const p = Math.min(1, (now - w.t0) / 1500);
        if (p < 0 || p >= 0.96) continue;
        const gx = w.fx + (w.tx - w.fx) * p;
        const gy = w.fy + (w.ty - w.fy) * p;
        const sp = toScreen(gx, gy);
        const fade = p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1;
        ctx.globalAlpha = fade;
        ctx.fillStyle = w.cloth;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y - 6, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#3b2317";
        ctx.beginPath();
        ctx.arc(sp.x, sp.y - 12, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // destination flag
      {
        const e = samplePolyline(route.pts, 1);
        const p = toScreen(e.x, e.y);
        if (p.y > -40 && p.y < H + 40) {
          ctx.fillStyle = "#E8A020";
          ctx.font = "800 11px Sora, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("🏁 " + route.endLabel, p.x, p.y - 14);
        }
      }

      // rain streaks while the rain event lives
      if (weatherMirror.current === "rain") {
        const t = now / 1000;
        ctx.strokeStyle = "rgba(188,214,255,0.55)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < 70; i++) {
          const rx = hash01("drain", i * 2 + 1) * W;
          const fall = ((t * 420 + hash01("drain", i * 2 + 2) * 480) % (H + 60)) - 30;
          ctx.moveTo(rx, fall);
          ctx.lineTo(rx - 5, fall + 16);
        }
        ctx.stroke();
      }

      // dynamic obstacles
      for (const o of c.obs) {
        const b = samplePolyline(route.pts, o.s);
        const p = toScreen(b.x + -b.dy * (o.lane * LANE_W), b.y + b.dx * (o.lane * LANE_W));
        if (p.y < -30 || p.y > H + 30) continue;
        if (o.hit) continue;
        if (o.kind === "pothole") {
          ctx.fillStyle = "#0c0c0e";
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, 8, 5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#555";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (o.kind === "keke") {
          ctx.fillStyle = "#22c55e";
          ctx.beginPath();
          ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#bfe8cd";
          ctx.fillRect(p.x - 5, p.y - 7, 10, 5);
        } else {
          ctx.fillStyle = "#B33A3A";
          ctx.beginPath();
          ctx.arc(p.x, p.y - 3, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#111";
          ctx.fillRect(p.x - 5, p.y + 1, 10, 3);
        }
      }

      // micra sprite — nose points along heading (no more sideways sliding)
      {
        const ang = Math.atan2(me.dy, me.dx);
        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(ang);
        const L = 38;
        const Wid = 20;
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(2, 2, L / 2, Wid / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // maroon body, yellow roof (plain rects = old-WebView safe)
        ctx.fillStyle = "#5A1F2B";
        ctx.fillRect(-L / 2, -Wid / 2, L, Wid);
        ctx.fillStyle = "#F5C518";
        ctx.fillRect(-L / 2 + 3, -Wid / 2 + 2, L - 14, Wid - 4);
        // windshield + rear window
        ctx.fillStyle = "#DCE9EC";
        ctx.fillRect(L / 2 - 11, -Wid / 2 + 3, 5, Wid - 6);
        ctx.fillRect(-L / 2 + 2, -Wid / 2 + 4, 3, Wid - 8);
        // white stripe
        ctx.fillStyle = "#F2EDE4";
        ctx.fillRect(-L / 2 + 2, -1.2, L - 4, 2.4);
        // headlights
        ctx.fillStyle = "#FFE9B8";
        ctx.beginPath();
        ctx.arc(L / 2 - 1, -Wid / 2 + 3, 2.2, 0, Math.PI * 2);
        ctx.arc(L / 2 - 1, Wid / 2 - 3, 2.2, 0, Math.PI * 2);
        ctx.fill();
        // wheels
        ctx.fillStyle = "#111";
        for (const [wx, wy] of [[-L / 4, -Wid / 2 - 1], [L / 4, -Wid / 2 - 1], [-L / 4, Wid / 2 + 1], [L / 4, Wid / 2 + 1]] as const) {
          ctx.beginPath();
          ctx.arc(wx, wy, 3.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        // passenger badge
        if (passengers > 0) {
          ctx.fillStyle = "#1C1917";
          ctx.beginPath();
          ctx.arc(mx + 24, my - 24, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#F5C518";
          ctx.font = "800 11px Sora, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(String(passengers), mx + 24, my - 20);
        }
      }

      void reduced;
    };

    loop();
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.id, autopilot, saver]);

  return (
    <div>
      <div ref={wrapRef} className="overflow-hidden rounded-2xl ring-1 ring-white/10">
        <canvas ref={canvasRef} className="block" />
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-mapo to-agodi transition-all" style={{ width: `${Math.round(s * 100)}%` }} />
      </div>
      {!autopilot && (
        <div className="space-y-2">
          <div className="mt-2 grid grid-cols-3 gap-2">
            <button
              onClick={() => { setLane((l) => Math.max(-1, l - 1)); laneMirror.current = Math.max(-1, laneMirror.current - 1); }}
              className="rounded-2xl bg-white/10 py-3 text-xl font-bold text-cream active:bg-white/20"
            >
              ◀
            </button>
            <button
              onClick={stopPress}
              className={`rounded-2xl py-3 text-sm font-extrabold ${inBox ? "bg-green-500 text-white" : "bg-mapo text-charcoal"}`}
            >
              STOP {inBox ? "🟢" : ""}
            </button>
            <button
              onClick={() => { setLane((l) => Math.min(1, l + 1)); laneMirror.current = Math.min(1, laneMirror.current + 1); }}
              className="rounded-2xl bg-white/10 py-3 text-xl font-bold text-cream active:bg-white/20"
            >
              ▶
            </button>
          </div>
          <button onClick={honk} className="w-full rounded-2xl bg-[#f5c04a] py-2 text-sm font-extrabold text-charcoal active:scale-[0.99]">
            📯 PÒÒN! — scatter traffic (H)
          </button>
        </div>
      )}
      {autopilot && <p className="mt-2 text-center text-xs text-cream/60">Riding as passenger — driver dey handle am.</p>}
    </div>
  );
}
