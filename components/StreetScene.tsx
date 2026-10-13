"use client";

// A walkable street/compound scene drawn with the art kit, using the tilted
// street camera. Tap (or WASD/arrows) to walk; walls block you; stand near a
// door, exit or person to get an action. Static art is rendered once into
// cached sprites; each frame only depth-sorts and draws what moves.

import { useEffect, useMemo, useRef, useState } from "react";
import { G, K, TILT_STREET, setTilt, type Ctx, type Dir } from "@/lib/art/core";
import { drawBuilding, drawCivicHall, drawFence, drawGateArch, drawGenerator, drawKiosk, drawWaterTank } from "@/lib/art/buildings";
import { drawBench, drawLaterite, drawLawn, drawPalm, drawPaving, drawPole, drawRoad, drawSignboard, drawTree, drawUmbrellaStall } from "@/lib/art/ground";
import { drawBigGen, drawBooth, drawChickens, drawDrum, drawFlowers, drawHedge, drawPots, drawStall } from "@/lib/art/props";
import { CARS, drawCar } from "@/lib/art/vehicles";
import { drawControlTower, drawGolfGreen, drawLake, drawMall, drawMosque, drawPlane, drawSuya, drawTennisCourt, drawTower, drawWheelbarrow } from "@/lib/art/landmarks";
import { drawPerson, type PersonSpec } from "@/lib/art/people";
import { CAST } from "@/lib/art/cast";
import { partOfDay } from "@/lib/engine/clock";
import type { PropKind, SceneDef, SceneNpc } from "@/lib/scenes/types";
import { isBlocked, sceneBlockers, type Rect } from "@/lib/scenes/collision";

type Near =
  | { type: "door"; id: string; label: string }
  | { type: "exit"; id: string; to: string; label: string }
  | { type: "npc"; id: string; label: string };

interface Sprite {
  canvas: HTMLCanvasElement;
  /** world-screen metres of the sprite's top-left (x, y already tilted) */
  x0: number;
  y0: number;
  w: number;
  h: number;
  /** depth: ground y in world metres */
  sortY: number;
}


const WALK_SPEED = 1.5; // m/s

/** Zoom: closer on phones so people stay readable. */
const ppmFor = (w: number) => Math.max(22, Math.min(36, w / (w < 600 ? 15 : 22)));

/** Bounds of a prop's drawing around its origin, in screen metres. */
function propBounds(p: PropKind): [number, number, number, number] {
  switch (p.kind) {
    case "tree": return [-p.size * 1.4, -(2.2 + p.size * 1.4) * K - 0.5, p.size * 1.8, 1];
    case "palm": return [-2.5, -p.height * K - 2, 3, 1];
    case "pole": return [-1.2, -9 * K, 1.6, 0.6];
    case "kiosk": return [-0.8, -3 * K - 0.6, 3.6, 1.6];
    case "umbrella": return [-1.6, -3.2, 1.9, 1.2];
    case "signboard": return [-p.w / 2 - 0.3, -2.8 * K, p.w / 2 + 0.3, 0.5];
    case "tank": return [-1, -4.4 * K - 0.5, 1, 0.8];
    case "bench": return [-1, -0.9, 1, 0.4];
    case "car": return p.dir === "E" || p.dir === "W" ? [-3, -2.4, 3.2, 1.6] : [-1.4, -4.2, 1.4, 2.4];
    case "booth": return [-1.6, -4, 2.6, 1.2];
    case "biggen": return [-1.6, -2.6, 2, 0.8];
    case "hedge": return [-0.2, -1.4, p.w + 0.3, 0.5];
    case "flowers": return [-0.2, -0.9, p.w + 0.2, 0.2];
    case "stall": return [-(p.w ?? 2.8) / 2 - 0.4, -4.2, (p.w ?? 2.8) / 2 + 0.4, 0.5];
    case "plane": return [-12.5, -16, 14, 6.5];
    case "ctower": return [-3, -(12 + 4.6) * K - 1.5, 5.5, 1.5];
    case "tower": return [-1, -p.floors * 3.3 * K - 9, p.w + p.floors * 3.3 * K * 0.25 + 1, p.d * G + 0.6];
    case "mall": return [-1, -7.5 * K - 1.5, p.w + 3.5, p.d * G + 0.6];
    case "lake": return [-1, -1.6, p.w + 1, p.h * G + 0.6];
    case "mosque": return [-1, p.d * G - 13 * K - 2, p.w + 3.5, p.d * G + 0.6];
    case "tennis": return [-2.5, -2 * G - 1.6, 26.5, 13 * G + 0.6];
    case "golfgreen": return [-8, -2.6 * K - 1, 9.6, 4.6 * G];
    case "suya": return [-1.6, -2.8, 1.8, 0.7];
    case "barrow": return [-2.6, -1.9, 0.7, 0.6];
    case "civichall": return [-1.5, -(p.h + 5) * K - 2.5, p.w + 1.5 + p.h * 0.5, p.d * G + 3.2];
    case "gatearch": return [-p.span / 2 - 2, -6.2 * K - 1.8, p.span / 2 + 2.4, 0.8];
    default: return [-1, -1.5, 1, 0.5];
  }
}

function drawProp(ctx: Ctx, p: PropKind, seed: number, t: number) {
  switch (p.kind) {
    case "tree": return drawTree(ctx, p.size, seed);
    case "palm": return drawPalm(ctx, p.height, seed);
    case "pole": drawPole(ctx); return;
    case "kiosk": return drawKiosk(ctx, p.color, p.text, seed);
    case "umbrella": return drawUmbrellaStall(ctx, p.colors, p.goods, seed);
    case "signboard": return drawSignboard(ctx, p.text, p.bg, p.fg, p.w);
    case "tank": return drawWaterTank(ctx);
    case "bench": return drawBench(ctx);
    case "generator": return drawGenerator(ctx, p.running, t);
    case "pots": return drawPots(ctx, t);
    case "drum": return drawDrum(ctx, p.color);
    case "chickens": return drawChickens(ctx, p.n, t, seed);
    case "car": return drawCar(ctx, CARS[p.car], p.dir);
    case "booth": return drawBooth(ctx);
    case "biggen": return drawBigGen(ctx, p.running, t);
    case "hedge": return drawHedge(ctx, p.w, seed);
    case "flowers": return drawFlowers(ctx, p.w, seed);
    case "stall": return drawStall(ctx, p.goods, p.w ?? 2.8, 2.2, seed);
    case "plane": return drawPlane(ctx, p.livery);
    case "ctower": return drawControlTower(ctx);
    case "tower": return drawTower(ctx, p);
    case "mall": return drawMall(ctx, p);
    case "lake": return drawLake(ctx, p.w, p.h, seed);
    case "mosque": return drawMosque(ctx, p.w, p.d);
    case "tennis": return drawTennisCourt(ctx);
    case "golfgreen": return drawGolfGreen(ctx, t);
    case "suya": return drawSuya(ctx, t);
    case "barrow": return drawWheelbarrow(ctx, p.load);
    case "civichall": return drawCivicHall(ctx, { w: p.w, d: p.d, h: p.h, name: p.name, seed });
    case "gatearch": return drawGateArch(ctx, p.text, p.span, p.boom ?? true);
  }
}

const ANIMATED = new Set(["generator", "pots", "chickens", "biggen", "golfgreen", "suya"]);

function makeSprite(pxPerM: number, bounds: [number, number, number, number], draw: (ctx: Ctx) => void): Omit<Sprite, "sortY"> {
  const [x0, y0, x1, y1] = bounds;
  const cv = document.createElement("canvas");
  cv.width = Math.max(1, Math.ceil((x1 - x0) * pxPerM));
  cv.height = Math.max(1, Math.ceil((y1 - y0) * pxPerM));
  const ctx = cv.getContext("2d")!;
  ctx.scale(pxPerM, pxPerM);
  ctx.translate(-x0, -y0);
  draw(ctx);
  return { canvas: cv, x0, y0, w: x1 - x0, h: y1 - y0 };
}

export default function StreetScene({
  scene,
  minute,
  player,
  entry,
  npcMeets,
  onDoor,
  onExit,
  onTalk,
}: {
  scene: SceneDef;
  minute: number;
  player: PersonSpec;
  /** change `key` to place the player: at their door ("spawn") or the gate ("arrive") */
  entry: { key: number; at: "spawn" | "arrive" };
  npcMeets: Record<string, number>;
  onDoor: (id: string) => void;
  onExit: (to: string) => void;
  onTalk: (npcId: string, line: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const pos = useRef({ ...scene.spawn });
  const target = useRef<{ x: number; y: number } | null>(null);
  const keys = useRef(new Set<string>());
  const facing = useRef<Dir>("S");
  const phase = useRef(0);
  const moving = useRef(false);
  const [near, setNear] = useState<Near | null>(null);
  const nearRef = useRef<Near | null>(null);
  const minuteRef = useRef(minute);
  minuteRef.current = minute;
  const playerRef = useRef(player);
  playerRef.current = player;

  // place the player on entry
  useEffect(() => {
    const p = entry.at === "spawn" ? scene.spawn : scene.arrive;
    pos.current = { ...p };
    target.current = null;
    facing.current = entry.at === "spawn" ? "S" : "N";
  }, [entry.key, entry.at, scene]);

  const blockers = useMemo<Rect[]>(() => sceneBlockers(scene), [scene]);

  const npcHere = (n: SceneNpc) => n.at[partOfDay(minuteRef.current)];

  // ---- render loop
  useEffect(() => {
    const cv = cvRef.current;
    const wrap = wrapRef.current;
    if (!cv || !wrap) return;
    setTilt(TILT_STREET);
    let raf = 0;
    let last = performance.now();
    let cache: { key: string; ground: Sprite; statics: Sprite[] } | null = null;

    const buildCache = (pxPerM: number) => {
      const ground = makeSprite(pxPerM, [0, 0, scene.w, scene.h * G], (ctx) => {
        drawLaterite(ctx, 0, 0, scene.w, scene.h, scene.ground.seed, scene.ground.grassy);
        for (const [i, y] of scene.yards.entries()) {
          if (y.surface === "paved") drawPaving(ctx, y.x, y.y, y.w, y.h, scene.ground.seed + i);
          else if (y.surface === "lawn") drawLawn(ctx, y.x, y.y, y.w, y.h, scene.ground.seed + i);
          else {
            ctx.fillStyle = "rgba(205,140,95,0.35)";
            ctx.fillRect(y.x, y.y * G, y.w, y.h * G);
          }
        }
        for (const r of scene.roads) drawRoad(ctx, r);
      });
      const statics: Sprite[] = [];
      for (const b of scene.buildings) {
        const s = b.spec;
        const s0 = makeSprite(pxPerM, [-1, -(s.h + 3) * K - 1, s.w + 1 + s.h * 0.5, s.d * G + 0.7], (ctx) => drawBuilding(ctx, s));
        statics.push({ ...s0, x0: b.x + s0.x0, y0: b.y * G + s0.y0, sortY: b.y + s.d });
      }
      for (const f of scene.fences) {
        const s0 = makeSprite(pxPerM, [f.x0 - 0.5, f.y * G - (f.h + 0.6) * K, f.x1 + 0.5, f.y * G + 0.4], (ctx) => drawFence(ctx, f));
        statics.push({ ...s0, sortY: f.y });
      }
      for (const p of scene.props) {
        if (ANIMATED.has(p.spec.kind)) continue;
        const spec = p.spec;
        if (spec.kind === "stall") {
          const w = spec.w ?? 2.8;
          for (const part of ["back", "front"] as const) {
            const s0 = makeSprite(pxPerM, propBounds(spec), (ctx) => drawStall(ctx, spec.goods, w, 2.2, p.seed ?? 1, part));
            statics.push({ ...s0, x0: p.x + s0.x0, y0: p.y * G + s0.y0, sortY: part === "back" ? p.y - 2.2 : p.y });
          }
          continue;
        }
        const s0 = makeSprite(pxPerM, propBounds(p.spec), (ctx) => drawProp(ctx, p.spec, p.seed ?? 1, 0));
        statics.push({ ...s0, x0: p.x + s0.x0, y0: p.y * G + s0.y0, sortY: p.y });
      }
      return { ground: { ...ground, sortY: -1 }, statics };
    };

    const blocked = (x: number, y: number) => isBlocked(scene, blockers, x, y);

    const step = (dt: number) => {
      let vx = 0, vy = 0;
      const k = keys.current;
      if (k.has("ArrowLeft") || k.has("a")) vx -= 1;
      if (k.has("ArrowRight") || k.has("d")) vx += 1;
      if (k.has("ArrowUp") || k.has("w")) vy -= 1;
      if (k.has("ArrowDown") || k.has("s")) vy += 1;
      if (vx || vy) target.current = null;
      else if (target.current) {
        const dx = target.current.x - pos.current.x;
        const dy = target.current.y - pos.current.y;
        const d = Math.hypot(dx, dy);
        if (d < 0.08) target.current = null;
        else { vx = dx / d; vy = dy / d; }
      }
      const len = Math.hypot(vx, vy);
      moving.current = len > 0;
      if (!len) return;
      vx /= len; vy /= len;
      const nx = pos.current.x + vx * WALK_SPEED * dt;
      const ny = pos.current.y + vy * WALK_SPEED * dt;
      // slide along walls
      if (!blocked(nx, ny)) pos.current = { x: nx, y: ny };
      else if (!blocked(nx, pos.current.y)) pos.current = { x: nx, y: pos.current.y };
      else if (!blocked(pos.current.x, ny)) pos.current = { x: pos.current.x, y: ny };
      else { target.current = null; moving.current = false; }
      facing.current = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? "E" : "W") : vy > 0 ? "S" : "N";
      phase.current += dt * 9;
    };

    const findNear = (): Near | null => {
      const p = pos.current;
      let best: Near | null = null;
      let bd = Infinity;
      const consider = (x: number, y: number, r: number, n: Near) => {
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < r && d < bd) { bd = d; best = n; }
      };
      for (const d of scene.doors) consider(d.x, d.y, d.radius ?? 1.4, { type: "door", id: d.id, label: d.label });
      for (const e of scene.exits) consider(e.x, e.y, e.radius ?? 1.6, { type: "exit", id: e.id, to: e.to, label: e.label });
      for (const n of scene.npcs) {
        const at = npcHere(n);
        if (at) consider(at.x, at.y, 1.7, { type: "npc", id: n.id, label: `Talk to ${n.id}${at.doing ? ` (${at.doing})` : ""}` });
      }
      return best;
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setTilt(TILT_STREET);
      step(dt);
      const nn = findNear();
      if (JSON.stringify(nn) !== JSON.stringify(nearRef.current)) {
        nearRef.current = nn;
        setNear(nn);
      }

      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const W = wrap.clientWidth;
      const H = wrap.clientHeight;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
      }
      const ppm = ppmFor(W);
      const key = `${ppm.toFixed(2)}|${dpr}`;
      if (!cache || cache.key !== key) cache = { key, ...buildCache(ppm * dpr) };

      // camera follows the player, clamped to the scene
      const viewW = W / ppm;
      const viewH = H / ppm;
      const camX = Math.max(viewW / 2, Math.min(scene.w - viewW / 2, pos.current.x));
      const camSY = Math.max(viewH / 2 - 1.5, Math.min(scene.h * G - viewH / 2, pos.current.y * G - 0.8));

      const ctx = cv.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#7a4029";
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.scale(ppm, ppm);
      ctx.translate(-camX, -camSY);
      const blit = (s: Sprite) => ctx.drawImage(s.canvas, s.x0, s.y0, s.w, s.h);
      blit(cache.ground);

      // depth-sorted world: cached statics + live things
      type Item = { y: number; draw: () => void };
      const items: Item[] = cache.statics.map((s) => ({ y: s.sortY, draw: () => blit(s) }));
      const t = now / 1000;
      for (const p of scene.props) {
        if (!ANIMATED.has(p.spec.kind)) continue;
        items.push({ y: p.y, draw: () => { ctx.save(); ctx.translate(p.x, p.y * G); drawProp(ctx, p.spec, p.seed ?? 1, t); ctx.restore(); } });
      }
      for (const n of scene.npcs) {
        const at = npcHere(n);
        const spec = CAST[n.cast];
        if (!at || !spec) continue;
        items.push({ y: at.y, draw: () => { ctx.save(); ctx.translate(at.x, at.y * G); drawPerson(ctx, spec, at.dir, "stand", 0); ctx.restore(); } });
      }
      const me = pos.current;
      items.push({
        y: me.y,
        draw: () => {
          ctx.save();
          ctx.translate(me.x, me.y * G);
          // a soft ring so you can always find yourself
          ctx.beginPath();
          ctx.ellipse(0, 0, 0.42, 0.42 * G, 0, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(245,197,24,0.9)";
          ctx.lineWidth = 0.05;
          ctx.stroke();
          drawPerson(ctx, playerRef.current, facing.current, moving.current ? "walk" : "stand", phase.current);
          ctx.restore();
        },
      });
      items.sort((a, b) => a.y - b.y);
      for (const it of items) it.draw();

      // name tags over people
      ctx.font = "800 0.32px system-ui, sans-serif";
      ctx.textAlign = "center";
      for (const n of scene.npcs) {
        const at = npcHere(n);
        if (!at) continue;
        const y = at.y * G - 2.2;
        ctx.lineWidth = 0.08;
        ctx.strokeStyle = "rgba(28,25,23,0.75)";
        ctx.strokeText(n.id, at.x, y);
        ctx.fillStyle = "#fff6e3";
        ctx.fillText(n.id, at.x, y);
      }
      // where you can go
      for (const e of scene.exits) {
        ctx.fillStyle = "rgba(245,197,24,0.85)";
        ctx.beginPath();
        ctx.ellipse(e.x, e.y * G, 0.5, 0.5 * G, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // light by time of day
      const m = minuteRef.current;
      const h = m / 60;
      let tint: string | null = null;
      if (h >= 5 && h < 7) tint = "rgba(255,190,140,0.12)";
      else if (h >= 17 && h < 19) tint = "rgba(255,140,60,0.14)";
      else if (h >= 19 && h < 21) tint = "rgba(55,40,90,0.3)";
      else if (h >= 21 || h < 5) tint = "rgba(10,18,45,0.5)";
      if (tint) {
        ctx.fillStyle = tint;
        ctx.fillRect(0, 0, W, H);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // input
    const toWorld = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      const W = r.width, H = r.height;
      const ppm = ppmFor(W);
      const viewW = W / ppm, viewH = H / ppm;
      const camX = Math.max(viewW / 2, Math.min(scene.w - viewW / 2, pos.current.x));
      const camSY = Math.max(viewH / 2 - 1.5, Math.min(scene.h * G - viewH / 2, pos.current.y * G - 0.8));
      return { x: camX + (e.clientX - r.left - W / 2) / ppm, y: (camSY + (e.clientY - r.top - H / 2) / ppm) / G };
    };
    const down = (e: PointerEvent) => {
      const w = toWorld(e);
      // tapping close to a spot walks you right onto it
      const spots = [...scene.doors, ...scene.exits];
      const hit = spots.find((s) => Math.hypot(s.x - w.x, s.y - w.y) < 1.2);
      target.current = hit ? { x: hit.x, y: hit.y + 0.2 } : w;
    };
    const kd = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "w", "a", "s", "d"].includes(e.key)) {
        keys.current.add(e.key);
        if (e.key.startsWith("Arrow")) e.preventDefault();
      }
    };
    const ku = (e: KeyboardEvent) => keys.current.delete(e.key);
    cv.addEventListener("pointerdown", down);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);

    // dev/test hook: read and set the player's position
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __omoScene: unknown }).__omoScene = {
        pos: () => ({ ...pos.current }),
        moveTo: (x: number, y: number) => { pos.current = { x, y }; target.current = null; },
      };
    }
    return () => {
      cancelAnimationFrame(raf);
      cv.removeEventListener("pointerdown", down);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, blockers]);

  const act = () => {
    const n = nearRef.current;
    if (!n) return;
    if (n.type === "door") onDoor(n.id);
    else if (n.type === "exit") onExit(n.to);
    else {
      const npc = scene.npcs.find((x) => x.id === n.id);
      if (!npc) return;
      const part = partOfDay(minuteRef.current);
      const lines = npc.lines[part] ?? npc.lines.any ?? ["…"];
      onTalk(npc.id, lines[(npcMeets[npc.id] ?? 0) % lines.length]);
    }
  };

  const away = scene.npcs.filter((n) => !n.at[partOfDay(minute)] && n.awayNote).map((n) => n.awayNote);

  return (
    <div>
      <div ref={wrapRef} className="relative h-[min(60svh,520px)] min-h-[320px] overflow-hidden rounded-2xl ring-1 ring-white/10 sm:h-[500px]">
        <canvas ref={cvRef} className="block h-full w-full touch-none" role="img" aria-label={`${scene.name}, walkable street`} />
        {near && (
          <button
            onClick={act}
            className="absolute bottom-3 left-1/2 max-w-[92%] -translate-x-1/2 truncate whitespace-nowrap rounded-full bg-mapo px-5 py-2.5 text-sm font-extrabold text-charcoal shadow-lg ring-2 ring-charcoal/20"
          >
            {near.type === "exit" ? "🚶 " : near.type === "npc" ? "💬 " : "🚪 "}
            {near.label}
          </button>
        )}
      </div>
      <p className="mt-2 text-[11px] text-cream/60">
        Tap to walk (or WASD / arrows). Stand by a door, gate or person to act.{away.length ? ` ${away.join(" ")}` : ""}
      </p>
    </div>
  );
}
