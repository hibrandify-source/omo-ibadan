"use client";

// Micra Rush, drawn with the art kit in the street camera. The road is a real
// corridor straightened out: stops, distances and the mini-map path all come
// from OpenStreetMap; rules live in lib/engine/drive.

import { useEffect, useMemo, useRef, useState } from "react";
import { G, K, TILT_STREET, rng, setTilt, type Ctx } from "@/lib/art/core";
import { PAL } from "@/lib/art/palette";
import { drawBuilding, type BuildingSpec } from "@/lib/art/buildings";
import { drawLaterite, drawPalm, drawPole, drawSignboard, drawTrafficLight, drawTree, drawUmbrellaStall } from "@/lib/art/ground";
import { drawGoat } from "@/lib/art/props";
import { drawPerson } from "@/lib/art/people";
import { CAST } from "@/lib/art/cast";
import { CARS, drawCar, drawKeke, drawOkada } from "@/lib/art/vehicles";
import {
  autopilotInput, createDrive, pointOnPath, signalRed, stepDrive,
  type Corridor, type DriveState, type HazardKind,
} from "@/lib/engine/drive";

// world layout across the road (metres, y grows toward the viewer)
const FRONT_N = 9; // north building fronts
const ROAD_TOP = 11;
const MEDIAN = 18;
const KERB = 25;
const laneY = (lane: number) => 23.25 - lane * 3.5;
const VIEW_TOP = 1 * G - 5 * K; // screen metres at the top of the canvas
const VIEW_SPAN = 30 * G - VIEW_TOP; // screen metres from top to bottom

const SIGNS = [
  "PATENT MEDICINE STORE", "GOD IS GOOD MOTORS", "OLUWASEUN STORES", "PHONE ACCESSORIES", "VULCANIZER",
  "BARBING SALON", "BUKA · AMALA", "TAILORING & FASHION", "BUILDING MATERIALS", "POS · TRANSFER", "CHEMIST", "PRINTING PRESS",
];
const PEOPLE = ["marketWoman", "uiStudent", "babaAde", "breadSeller", "nursingMother", "mechanic", "tunde", "owambeAunty", "banker"];
const ONCOMING: (keyof typeof CARS | "keke" | "okada")[] = ["corolla", "keke", "korope", "okada", "camry", "micra", "jeep"];

interface Sprite { canvas: HTMLCanvasElement; x0: number; y0: number; w: number; h: number }
function makeSprite(pxPerM: number, b: [number, number, number, number], draw: (ctx: Ctx) => void): Sprite {
  const [x0, y0, x1, y1] = b;
  const cv = document.createElement("canvas");
  cv.width = Math.max(1, Math.ceil((x1 - x0) * pxPerM));
  cv.height = Math.max(1, Math.ceil((y1 - y0) * pxPerM));
  const ctx = cv.getContext("2d")!;
  ctx.scale(pxPerM, pxPerM);
  ctx.translate(-x0, -y0);
  draw(ctx);
  return { canvas: cv, x0, y0, w: x1 - x0, h: y1 - y0 };
}

type Roadside =
  | { kind: "building"; x: number; spec: BuildingSpec; template: number }
  | { kind: "tree" | "palm" | "pole" | "umbrella"; x: number; y: number; seed: number }
  | { kind: "stopsign"; x: number; y: number; text: string }
  | { kind: "person"; x: number; y: number; who: string; dir: "S" | "N" | "E" | "W" };

export default function RoadRun({
  corridor,
  stopNames,
  autopilot,
  seed,
  weather,
  night,
  onHazard,
  onBay,
  onFinish,
  onHonk,
}: {
  corridor: Corridor;
  stopNames: string[];
  autopilot: boolean;
  seed: number;
  weather: "clear" | "rain";
  night: boolean;
  onHazard: (kind: HazardKind) => void;
  onBay: (ok: boolean, name: string) => void;
  onFinish: () => void;
  onHonk: (msg: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const miniRef = useRef<HTMLCanvasElement>(null);
  const sim = useRef<DriveState | null>(null);
  const input = useRef({ gas: false, brake: false, laneTarget: 0 as 0 | 1, stop: false, honk: false });
  const cb = useRef({ onHazard, onBay, onFinish, onHonk });
  cb.current = { onHazard, onBay, onFinish, onHonk };
  const [hud, setHud] = useState({ next: "", dist: 0, kmh: 0 });

  // everything along the road, generated once per run
  const roadside = useMemo<Roadside[]>(() => {
    const r = rng(seed * 7 + 3);
    const s = createDrive(corridor, stopNames, { autopilot, seed });
    const out: Roadside[] = [];
    // ten building designs reused along the road: each is drawn once, not once per building
    const templates: BuildingSpec[] = Array.from({ length: 10 }, () => {
      const w = 7 + r() * 8;
      const shop = r() < 0.55;
      return {
          w, d: 6, h: 3 + (r() < 0.2 ? 2.8 : 0), roof: shop ? "shed" : r() < 0.5 ? "hip" : "gable",
          wall: PAL.plaster[Math.floor(r() * PAL.plaster.length)], wallKind: r() < 0.15 ? "block" : "plaster",
          rust: 0.5 + r() * 0.5, seed: Math.floor(r() * 1e6), storeys: r() < 0.2 ? 2 : 1,
          sign: shop ? { text: SIGNS[Math.floor(r() * SIGNS.length)], bg: ["#f2c230", "#2f6fb5", "#f3efe4", "#2f8a4a"][Math.floor(r() * 4)], fg: "#1d1b19" } : undefined,
          openings: shop
            ? [{ x: 0.5, kind: "shopfront", width: w / 2 - 0.8 }, { x: w / 2 + 0.3, kind: "shopfront", width: w / 2 - 0.8 }]
            : [{ x: 1, kind: "louvre" }, { x: w / 2 - 0.45, kind: "door", curtain: "#7a2a35" }, { x: w - 2.2, kind: "louvre" }],
      };
    });
    for (let x = -30, last = -1; x < s.length + 60; ) {
      let t = Math.floor(r() * templates.length);
      if (t === last) t = (t + 1) % templates.length; // no two identical neighbours
      last = t;
      out.push({ kind: "building", x, spec: templates[t], template: t });
      x += templates[t].w + 0.6 + r() * 2;
    }
    for (let x = 0; x < s.length + 40; x += 9 + r() * 10) {
      const roll = r();
      out.push({ kind: roll < 0.3 ? "tree" : roll < 0.45 ? "palm" : roll < 0.7 ? "pole" : "umbrella", x, y: 27.6, seed: Math.floor(r() * 1e5) });
    }
    for (const b of s.bays) {
      out.push({ kind: "stopsign", x: b.x + 5, y: 27.4, text: b.name });
      for (let i = 0; i < 3; i++) out.push({ kind: "person", x: b.x - 3 + i * 2.2, y: 26.6 + r() * 0.8, who: PEOPLE[Math.floor(r() * PEOPLE.length)], dir: "S" });
    }
    for (let x = 10; x < s.length; x += 25 + r() * 40) out.push({ kind: "person", x, y: 10.2, who: PEOPLE[Math.floor(r() * PEOPLE.length)], dir: r() < 0.5 ? "E" : "W" });
    return out;
  }, [corridor, stopNames, autopilot, seed]);

  useEffect(() => {
    sim.current = createDrive(corridor, stopNames, { autopilot, seed });
    input.current = { gas: false, brake: false, laneTarget: 0, stop: false, honk: false };
  }, [corridor, stopNames, autopilot, seed]);

  // keyboard
  useEffect(() => {
    if (autopilot) return;
    const set = (e: KeyboardEvent, down: boolean) => {
      const el = document.activeElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      const k = e.key;
      if (k === "ArrowUp" || k === "w") { if (down) input.current.laneTarget = 1; }
      else if (k === "ArrowDown" || k === "s") { if (down) input.current.laneTarget = 0; }
      else if (k === "ArrowRight" || k === "d" || k === "g") input.current.gas = down;
      else if (k === "ArrowLeft" || k === "a" || k === "b") input.current.brake = down;
      else if (k === " ") { if (down) input.current.stop = true; }
      else if (k === "h") { if (down) input.current.honk = true; }
      else return;
      e.preventDefault();
    };
    const kd = (e: KeyboardEvent) => set(e, true);
    const ku = (e: KeyboardEvent) => set(e, false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, [autopilot]);

  // loop
  useEffect(() => {
    const cv = cvRef.current;
    const wrap = wrapRef.current;
    const mini = miniRef.current;
    if (!cv || !wrap || !mini) return;
    let raf = 0;
    let last = performance.now();
    let cacheKey = "";
    const sprites = new Map<number, Sprite>();
    let groundTile: Sprite | null = null;
    let hudT = 0;
    // rules run in fixed 1/60 s steps on real time, so slow frames never slow the game down
    const STEP = 1 / 60;
    let acc = 0;

    const frame = (now: number) => {
      const s = sim.current;
      if (!s) { raf = requestAnimationFrame(frame); return; }
      const dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      setTilt(TILT_STREET);

      // ---- rules
      acc += dt;
      const events = [];
      let first = true;
      while (acc >= STEP) {
        acc -= STEP;
        const inp = autopilot ? autopilotInput(s) : { ...input.current };
        if (!first) { inp.stop = false; inp.honk = false; }
        first = false;
        events.push(...stepDrive(s, inp, STEP));
      }
      if (!first) {
        input.current.stop = false;
        input.current.honk = false;
      }
      for (const e of events) {
        if (e.type === "hazard") cb.current.onHazard(e.kind);
        else if (e.type === "bay") cb.current.onBay(e.ok, e.name);
        else if (e.type === "honk") cb.current.onHonk(e.cleared ? `📯 PÒÒN!! The ${e.cleared} moves out of your lane. Conductor hails you.` : "📯 PÒÒN!! Nobody moved. Everybody looks at you.");
        else if (e.type === "finish") cb.current.onFinish();
      }
      hudT += dt;
      if (hudT > 0.2) {
        hudT = 0;
        const nb = s.bays.find((b) => !b.done);
        setHud({ next: nb?.name ?? "", dist: nb ? Math.max(0, Math.round(nb.x - s.x)) : 0, kmh: Math.round(s.speed * 3.6) });
      }

      // ---- canvas size and camera
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const W = wrap.clientWidth;
      const H = wrap.clientHeight;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
      }
      const ppm = H / VIEW_SPAN;
      const key = `${ppm.toFixed(2)}|${dpr}`;
      if (key !== cacheKey) {
        sprites.clear();
        cacheKey = key;
        // laterite is costly to draw; render one 40 m tile and repeat it
        groundTile = makeSprite(ppm * dpr, [0, 0, 40, 32 * G], (c) => drawLaterite(c, 0, 0, 40, 32, 5, 0.06));
      }
      const viewW = W / ppm;
      const left = s.x - viewW * 0.3;
      const t = s.t;

      const ctx = cv.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.save();
      ctx.scale(ppm, ppm);
      ctx.translate(-left, -VIEW_TOP);
      const at = (x: number, y: number, f: () => void) => { ctx.save(); ctx.translate(x, y * G); f(); ctx.restore(); };
      const visible = (x: number, pad = 18) => x > left - pad && x < left + viewW + pad;

      // ground: laterite, the carriageway, markings, bays, zebra crossings
      const gx0 = Math.floor(left / 40) * 40;
      for (let gx = gx0 - 40; gx < left + viewW + 40; gx += 40) ctx.drawImage(groundTile!.canvas, gx, 0, 40.05, groundTile!.h);
      ctx.save();
      ctx.scale(1, G);
      ctx.fillStyle = PAL.asphalt;
      ctx.fillRect(left - 5, ROAD_TOP, viewW + 10, KERB - ROAD_TOP);
      for (const y of [ROAD_TOP + 0.6, KERB - 0.6]) {
        ctx.fillStyle = "rgba(189,122,82,0.35)";
        ctx.fillRect(left - 5, y - 0.6, viewW + 10, 0.6);
      }
      const pr = rng(11);
      for (let x = gx0 - 40; x < left + viewW + 40; x += 13) {
        const k = pr();
        if (k < 0.5) { ctx.fillStyle = "rgba(46,44,42,0.9)"; ctx.fillRect(x + k * 6, ROAD_TOP + 1 + k * 11, 1.4 + k * 2, 0.9); }
      }
      for (let x = Math.floor(left / 6) * 6; x < left + viewW + 6; x += 6) {
        ctx.fillStyle = "rgba(217,212,199,0.55)";
        ctx.fillRect(x, 14.4, 3, 0.12);
        ctx.fillRect(x, 21.4, 3, 0.12);
      }
      ctx.fillStyle = "rgba(225,177,44,0.8)"; // double yellow median
      ctx.fillRect(left - 5, MEDIAN - 0.12, viewW + 10, 0.08);
      ctx.fillRect(left - 5, MEDIAN + 0.04, viewW + 10, 0.08);
      ctx.fillStyle = "#8e877b"; // kerb + gutter
      ctx.fillRect(left - 5, KERB, viewW + 10, 0.25);
      ctx.fillStyle = PAL.gutterWater;
      ctx.fillRect(left - 5, KERB + 0.25, viewW + 10, 0.45);
      ctx.fillStyle = PAL.concrete;
      ctx.fillRect(left - 5, KERB + 0.7, viewW + 10, 0.15);
      for (const b of s.bays) {
        if (!visible(b.x)) continue;
        ctx.strokeStyle = "rgba(225,177,44,0.95)";
        ctx.lineWidth = 0.18;
        ctx.strokeRect(b.x - 6, 21.7, 12, 3.1);
        ctx.fillStyle = "rgba(225,177,44,0.18)";
        ctx.fillRect(b.x - 6, 21.7, 12, 3.1);
      }
      for (const g of s.signals) {
        if (!visible(g.x)) continue;
        for (let y = ROAD_TOP + 0.3; y < KERB; y += 0.9) {
          ctx.fillStyle = "rgba(240,236,226,0.75)";
          ctx.fillRect(g.x + 2, y, 2.4, 0.5);
        }
      }
      ctx.restore();

      // north building fronts (cached sprites)
      roadside.forEach((it, i) => {
        if (it.kind !== "building" || !visible(it.x, it.spec.w + 4)) return;
        let sp = sprites.get(it.template);
        if (!sp) {
          const spec = it.spec;
          sp = makeSprite(ppm * dpr, [-1, -(spec.h + 3) * K - 1, spec.w + 1 + spec.h * 0.5, spec.d * G + 0.7], (c) => drawBuilding(c, spec));
          sprites.set(it.template, sp);
        }
        ctx.drawImage(sp.canvas, it.x + sp.x0, (FRONT_N - it.spec.d) * G + sp.y0, sp.w, sp.h);
      });

      // everything else, depth-sorted
      const items: { y: number; draw: () => void }[] = [];
      for (const it of roadside) {
        if (it.kind === "building" || !visible(it.x)) continue;
        items.push({
          y: it.y,
          draw: () => at(it.x, it.y, () => {
            if (it.kind === "tree") drawTree(ctx, 2.2, it.seed);
            else if (it.kind === "palm") drawPalm(ctx, 7, it.seed);
            else if (it.kind === "pole") drawPole(ctx);
            else if (it.kind === "umbrella") drawUmbrellaStall(ctx, ["#d4402c", "#f2c230"], "tomato", it.seed);
            else if (it.kind === "stopsign") drawSignboard(ctx, `${it.text} BUS STOP`, "#f3efe4", "#1f3d8a", 3.2);
            else if (it.kind === "person") drawPerson(ctx, CAST[it.who], it.dir, it.y < 12 ? "walk" : "stand", t * 6 + it.x);
          }),
        });
      }
      for (const g of s.signals) if (visible(g.x)) items.push({ y: 26.2, draw: () => at(g.x - 0.6, 26.2, () => drawTrafficLight(ctx, signalRed(g, t))) });
      for (const c of s.checks) {
        if (!visible(c.x)) continue;
        items.push({ y: 26.4, draw: () => at(c.x, 26.4, () => drawPerson(ctx, CAST.vioOfficer, "W", "stand")) });
        items.push({ y: 26.6, draw: () => at(c.x + 2.2, 26.6, () => drawSignboard(ctx, "VIO CHECK · STOP", "#2f4a2f", "#f3efe4", 2.4)) });
      }
      // oncoming traffic in the westbound lanes
      for (let i = 0; i < 9; i++) {
        const span = viewW + 60;
        const x = left + viewW + 30 - (((t * 15 + i * 23 + seed * 5) % span) + span) % span;
        const kind = ONCOMING[(i + seed) % ONCOMING.length];
        const y = i % 2 ? 12.75 : 16.25;
        items.push({
          y,
          draw: () => at(x, y, () => {
            if (kind === "keke") drawKeke(ctx, "W", [CAST.mechanic]);
            else if (kind === "okada") drawOkada(ctx, "W", CAST.okadaMan, CAST.marketWoman);
            else drawCar(ctx, CARS[kind], "W");
          }),
        });
      }
      for (const o of s.obstacles) {
        if (!visible(o.x) || o.hit && o.x < s.x - 10) continue;
        const y = laneY(o.lane);
        items.push({
          y,
          draw: () => at(o.x, y, () => {
            if (o.kind === "okada") drawOkada(ctx, "E", CAST.okadaMan, CAST.nursingMother);
            else if (o.kind === "keke") drawKeke(ctx, "E", [CAST.mechanic, CAST.uiStudent]);
            else if (o.kind === "korope") drawCar(ctx, CARS.korope, "E");
            else if (o.kind === "goat") drawGoat(ctx, t);
            else drawPerson(ctx, CAST.breadSeller, o.cross > 0 ? "N" : "S", "walk", t * 7);
          }),
        });
      }
      const py = laneY(s.lane);
      items.push({ y: py, draw: () => at(s.x, py, () => drawCar(ctx, CARS.micra, "E")) });
      items.sort((a, b) => a.y - b.y).forEach((i) => i.draw());

      // headlights at night
      if (night) {
        ctx.fillStyle = "rgba(10,18,45,0.5)";
        ctx.fillRect(left - 5, VIEW_TOP - 2, viewW + 10, VIEW_SPAN + 4);
        const hx = s.x + 1.9;
        const hy = py * G - 0.5;
        const grd = ctx.createLinearGradient(hx, 0, hx + 14, 0);
        grd.addColorStop(0, "rgba(255,240,190,0.45)");
        grd.addColorStop(1, "rgba(255,240,190,0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.moveTo(hx, hy - 0.3);
        ctx.lineTo(hx + 14, hy - 1.8);
        ctx.lineTo(hx + 14, hy + 1.2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      if (weather === "rain") {
        ctx.strokeStyle = "rgba(200,215,230,0.35)";
        ctx.lineWidth = 1;
        const rr = rng(Math.floor(t * 20));
        for (let i = 0; i < 70; i++) {
          const x = rr() * W, y = rr() * H;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - 4, y + 12);
          ctx.stroke();
        }
      }

      // ---- mini-map of the real route
      const m = mini.getContext("2d")!;
      const MW = mini.width, MH = mini.height;
      const p = corridor.path;
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (let i = 0; i < p.length; i += 2) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); y0 = Math.min(y0, p[i + 1]); y1 = Math.max(y1, p[i + 1]); }
      const sc = Math.min((MW - 16) / (x1 - x0 || 1), (MH - 16) / (y1 - y0 || 1));
      const mx = (v: number) => 8 + (v - x0) * sc + ((MW - 16) - (x1 - x0) * sc) / 2;
      const my = (v: number) => 8 + (v - y0) * sc + ((MH - 16) - (y1 - y0) * sc) / 2;
      m.clearRect(0, 0, MW, MH);
      m.fillStyle = "rgba(234,220,198,0.92)";
      m.fillRect(0, 0, MW, MH);
      m.strokeStyle = "#e49a4c";
      m.lineWidth = 4;
      m.lineJoin = "round";
      m.beginPath();
      m.moveTo(mx(p[0]), my(p[1]));
      for (let i = 2; i < p.length; i += 2) m.lineTo(mx(p[i]), my(p[i + 1]));
      m.stroke();
      const [cx, cy] = pointOnPath(p, s.x / s.length);
      m.beginPath();
      m.arc(mx(cx), my(cy), 5, 0, Math.PI * 2);
      m.fillStyle = "#5b3320";
      m.fill();
      m.strokeStyle = "#e1b12c";
      m.lineWidth = 2;
      m.stroke();

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [corridor, roadside, autopilot, night, weather, seed]);

  const hold = (k: "gas" | "brake") => ({
    onPointerDown: () => { input.current[k] = true; },
    onPointerUp: () => { input.current[k] = false; },
    onPointerLeave: () => { input.current[k] = false; },
  });

  return (
    <div>
      {/* at least ~24 m of road across on phones; desktop caps the height instead */}
      <div ref={wrapRef} style={{ aspectRatio: `24 / ${VIEW_SPAN.toFixed(2)}` }} className="relative max-h-[420px] w-full overflow-hidden rounded-2xl bg-[#7a4029] ring-1 ring-white/10">
        <canvas ref={cvRef} className="block h-full w-full" role="img" aria-label={`Micra Rush: ${corridor.name}`} />
        <canvas ref={miniRef} width={112} height={112} className="absolute right-2 top-2 h-[84px] w-[84px] rounded-xl ring-1 ring-charcoal/30 sm:h-[112px] sm:w-[112px]" aria-hidden />
        <div className="absolute left-2 top-2 rounded-xl bg-charcoal/80 px-3 py-1.5 text-[11px] font-bold text-cream">
          {hud.next ? <>Next stop <span className="text-mapo">{hud.next}</span> · {hud.dist} m</> : "Last leg"} · {hud.kmh} km/h
        </div>
      </div>
      {!autopilot && (
        <div className="mt-2 grid grid-cols-3 gap-2 select-none">
          <button onClick={() => { input.current.laneTarget = 1; }} className="rounded-xl bg-white/10 py-3 text-sm font-extrabold text-cream">▲ Outer lane</button>
          <button onClick={() => { input.current.stop = true; }} className="rounded-xl bg-mapo py-3 text-sm font-extrabold text-charcoal">STOP at bay</button>
          <button onClick={() => { input.current.laneTarget = 0; }} className="rounded-xl bg-white/10 py-3 text-sm font-extrabold text-cream">▼ Kerb lane</button>
          <button {...hold("brake")} className="rounded-xl bg-[#6b1f1f] py-3 text-sm font-extrabold text-cream">BRAKE</button>
          <button onClick={() => { input.current.honk = true; }} className="rounded-xl bg-[#e1b12c] py-3 text-sm font-extrabold text-charcoal">📯 PÒÒN!</button>
          <button {...hold("gas")} className="rounded-xl bg-agodi py-3 text-sm font-extrabold text-white">GAS</button>
        </div>
      )}
      {!autopilot && <p className="mt-1.5 text-center text-[11px] text-cream/50">Keys: ↑ ↓ change lane · → gas · ← brake · Space stop · H horn</p>}
    </div>
  );
}
