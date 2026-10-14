// Omo Ibadan art kit — interiors (your room and shops), in the street camera.
//
// A room is drawn as a cutaway: back wall standing, floor in front, the side
// walls as thick dark edges, front wall removed. World metres: x across,
// y from the back wall toward the viewer.

import { G, K, alpha, clipped, groundShadow, label, line, oval, rng, rrect, shade, type Ctx } from "./core";
import { PAL } from "./palette";
import { drawPerson, FABRICS, type PersonSpec } from "./people";
import { drawBench } from "./ground";
import { drawGenerator } from "./buildings";
import { CAST } from "./cast";

export const ROOM_W = 7;
export const ROOM_D = 5;
export const ROOM_H = 2.8;

export type Floor = "cement" | "terrazzo" | "ceramic" | "tiles-red";

export interface Shell {
  wall: string;
  floor: Floor;
  window: boolean;
  curtains?: string;
  calendar?: boolean;
  photo?: boolean;
  sign?: { text: string; bg: string; fg: string };
  bulb?: boolean;
}

/** Height of the drawing in screen metres, for sizing canvases. */
export const roomScreenH = () => ROOM_D * G + ROOM_H * K + 0.6;

function drawFloor(ctx: Ctx, floor: Floor, seed: number) {
  const r = rng(seed);
  const W = ROOM_W, D = ROOM_D * G;
  const base = { cement: "#9a948a", terrazzo: "#c9c2b4", ceramic: "#e4dfd3", "tiles-red": "#9c4a32" }[floor];
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, D);
  if (floor === "cement") {
    for (let i = 0; i < 60; i++) {
      oval(ctx, r() * W, r() * D, 0.3 + r() * 0.8, 0.1 + r() * 0.3);
      ctx.fillStyle = alpha(r() < 0.5 ? "#7d776d" : "#aca59a", 0.25);
      ctx.fill();
    }
    for (let i = 0; i < 6; i++) line(ctx, r() * W, r() * D, r() * W, r() * D, "rgba(60,55,48,0.25)", 0.012);
  } else if (floor === "terrazzo") {
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = ["#8a8378", "#e9e3d6", "#6f6a61", "#b0a593"][i % 4];
      ctx.fillRect(r() * W, r() * D, 0.03, 0.02);
    }
    for (let x = 1; x < W; x += 1) line(ctx, x, 0, x, D, "rgba(90,80,70,0.25)", 0.015);
  } else {
    const t = 0.6;
    for (let x = 0; x < W; x += t) line(ctx, x, 0, x, D, "rgba(90,80,70,0.3)", 0.012);
    for (let y = 0; y < D; y += t * G) line(ctx, 0, y, W, y, "rgba(90,80,70,0.3)", 0.012);
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(r() * W, r() * D, 0.8, 0.12);
    }
  }
  // light falling in from the open front
  const g = ctx.createLinearGradient(0, 0, 0, D);
  g.addColorStop(0, "rgba(0,0,0,0.18)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, D);
}

function drawBackWall(ctx: Ctx, s: Shell, seed: number) {
  const r = rng(seed);
  const W = ROOM_W, H = ROOM_H * K;
  ctx.fillStyle = s.wall;
  ctx.fillRect(0, -H, W, H);
  // stains and hand marks near the floor
  for (let i = 0; i < 14; i++) {
    oval(ctx, r() * W, -r() * H, 0.3 + r() * 0.7, 0.15 + r() * 0.3);
    ctx.fillStyle = alpha(shade(s.wall, -0.15), 0.18);
    ctx.fill();
  }
  ctx.fillStyle = shade(s.wall, -0.3);
  ctx.fillRect(0, -0.15, W, 0.15); // skirting
  if (s.window) {
    const wx = 4.4, ww = 1.5, top = -2.1 * K, h = 1.1 * K;
    ctx.fillStyle = "#cfe0e6";
    ctx.fillRect(wx, top, ww, h);
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = i % 2 ? "rgba(120,150,160,0.35)" : "rgba(255,255,255,0.3)";
      ctx.fillRect(wx, top + (h * i) / 7, ww, h / 14);
    }
    for (let i = 1; i < 6; i++) line(ctx, wx + (ww * i) / 6, top, wx + (ww * i) / 6, top + h, PAL.iron, 0.025);
    ctx.strokeStyle = shade(s.wall, -0.45);
    ctx.lineWidth = 0.05;
    ctx.strokeRect(wx, top, ww, h);
    if (s.curtains) {
      for (const [cx, cw] of [[wx - 0.35, 0.55], [wx + ww - 0.2, 0.55]]) {
        rrect(ctx, cx, top - 0.15, cw, h + 0.45, 0.05);
        ctx.fillStyle = s.curtains;
        ctx.fill();
        for (let i = 1; i < 4; i++) line(ctx, cx + (cw * i) / 4, top - 0.1, cx + (cw * i) / 4, top + h + 0.25, alpha(shade(s.curtains, -0.35), 0.6), 0.015);
      }
      line(ctx, wx - 0.45, top - 0.15, wx + ww + 0.45, top - 0.15, "#6b5a45", 0.04);
    }
  }
  if (s.calendar) {
    // the church/politician calendar on every Ibadan wall
    rrect(ctx, 0.5, -2.35 * K, 0.6, 0.8, 0.02);
    ctx.fillStyle = "#f3efe4";
    ctx.fill();
    ctx.fillStyle = "#2f5aa8";
    ctx.fillRect(0.52, -2.33 * K, 0.56, 0.32);
    label(ctx, "2027", 0.8, -2.35 * K + 0.6, 0.12, "#a12a22", 900);
  }
  if (s.photo) {
    rrect(ctx, 1.5, -2.3 * K, 0.7, 0.55, 0.03);
    ctx.fillStyle = "#6b4428";
    ctx.fill();
    ctx.fillStyle = "#d9c9a8";
    ctx.fillRect(1.56, -2.3 * K + 0.06, 0.58, 0.43);
    oval(ctx, 1.75, -2.3 * K + 0.2, 0.06, 0.07);
    oval(ctx, 1.95, -2.3 * K + 0.2, 0.06, 0.07);
    ctx.fillStyle = PAL.skin[2];
    ctx.fill();
  }
  if (s.sign) {
    rrect(ctx, 2.2, -2.55 * K, 2.6, 0.45, 0.03);
    ctx.fillStyle = s.sign.bg;
    ctx.fill();
    label(ctx, s.sign.text, 3.5, -2.55 * K + 0.22, 0.24, s.sign.fg, 900);
  }
  if (s.bulb) {
    line(ctx, 3.5, -H, 3.5, -H + 0.35, "#222", 0.015);
    oval(ctx, 3.5, -H + 0.42, 0.07, 0.09);
    ctx.fillStyle = "#fff4cc";
    ctx.fill();
  }
}

function drawSideWalls(ctx: Ctx) {
  const H = ROOM_H * K, D = ROOM_D * G;
  ctx.fillStyle = "#3a2c22";
  ctx.fillRect(-0.25, -H - 0.2, 0.25, D + H + 0.2);
  ctx.fillRect(ROOM_W, -H - 0.2, 0.25, D + H + 0.2);
  ctx.fillRect(-0.25, -H - 0.2, ROOM_W + 0.5, 0.2);
}

// ---------------------------------------------------------------- furniture

type Item = { y: number; draw: () => void };

const at = (ctx: Ctx, x: number, y: number, f: () => void) => {
  ctx.save();
  ctx.translate(x, y * G);
  f();
  ctx.restore();
};

/** Where you sleep: the mat or mattress lies east–west along the left wall. */
const SLEEP_SPOT = { x: 0.25, y: 1.75, len: 1.85, depth: 1.2 };

/** Spots you drift between when you're up and about in your room. */
const WANDER: { x: number; y: number; face: "S" | "N" | "E" | "W" }[] = [
  { x: 1.5, y: 2.5, face: "N" }, // by the mat
  { x: 3.4, y: 2.3, face: "N" }, // looking out of the window
  { x: 4.5, y: 3.3, face: "S" },
  { x: 2.2, y: 3.5, face: "S" },
];
const WALK_SPEED = 0.7; // m/s
const PAUSE = 3; // s at each spot

/** Position, facing and whether you're walking, at time t (s). */
export function wanderAt(t: number): { x: number; y: number; dir: "S" | "N" | "E" | "W"; moving: boolean } {
  const legs = WANDER.map((a, i) => {
    const b = WANDER[(i + 1) % WANDER.length];
    return { a, b, walk: Math.hypot(b.x - a.x, b.y - a.y) / WALK_SPEED };
  });
  const cycle = legs.reduce((s, l) => s + PAUSE + l.walk, 0);
  let k = t % cycle;
  for (const l of legs) {
    if (k < PAUSE) return { x: l.a.x, y: l.a.y, dir: l.a.face, moving: false };
    k -= PAUSE;
    if (k < l.walk) {
      const f = k / l.walk;
      const dx = l.b.x - l.a.x, dy = l.b.y - l.a.y;
      const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "E" : "W") : dy > 0 ? "S" : "N";
      return { x: l.a.x + dx * f, y: l.a.y + dy * f, dir, moving: true };
    }
    k -= l.walk;
  }
  return { x: WANDER[0].x, y: WANDER[0].y, dir: "S", moving: false };
}

function furnitureItems(ctx: Ctx, owned: Set<string>, t: number): Item[] {
  const items: Item[] = [];
  const add = (y: number, x: number, f: () => void) => items.push({ y, draw: () => at(ctx, x, y, f) });
  // raffia mat or foam mattress where you sleep, lying east–west on the floor
  // (SLEEP_SPOT: x from 0.25, south edge at y 1.75, 1.2 m deep)
  add(SLEEP_SPOT.y, SLEEP_SPOT.x, () => {
    const L = SLEEP_SPOT.len, D = SLEEP_SPOT.depth * G;
    if (owned.has("mattress")) {
      const h = 0.18 * K;
      groundShadow(ctx, L / 2, 0, L * 0.55, 0.12, 0.2);
      rrect(ctx, 0, -h - D, L, D + h, 0.06);
      ctx.fillStyle = "#e9e3d6";
      ctx.fill();
      clipped(ctx, () => {
        ctx.fillStyle = FABRICS.waxPurple.base;
        ctx.fillRect(0.45, -h - D, L - 0.45, D);
        for (let i = 0; i < 12; i++) {
          oval(ctx, 0.6 + (i % 6) * 0.25, -h - D + 0.12 + Math.floor(i / 6) * 0.3, 0.06, 0.05);
          ctx.fillStyle = FABRICS.waxPurple.a;
          ctx.fill();
        }
      });
      rrect(ctx, 0.06, -h - D + 0.08, 0.36, D - 0.16, 0.08); // pillow at the head (west) end
      ctx.fillStyle = "#f6f2ea";
      ctx.fill();
      ctx.fillStyle = shade("#e9e3d6", -0.15);
      ctx.fillRect(0, -h, L, h);
    } else {
      // ẹní: woven raffia mat flat on the bare floor
      rrect(ctx, 0, -D, L, D, 0.03);
      ctx.fillStyle = "#c9a96e";
      ctx.fill();
      for (let x = 0.06; x < L; x += 0.07) line(ctx, x, -D + 0.03, x, -0.03, "rgba(120,90,40,0.3)", 0.02);
      ctx.fillStyle = "#a8432f";
      ctx.fillRect(0.1, -D, 0.06, D);
      ctx.fillRect(L - 0.16, -D, 0.06, D);
      // folded wrapper for a pillow
      rrect(ctx, 0.2, -D + 0.12, 0.32, D - 0.24, 0.05);
      ctx.fillStyle = FABRICS.waxPurple.base;
      ctx.fill();
    }
  });
  if (owned.has("rug")) {
    add(-1, 2.4, () => {
      rrect(ctx, 0, 2.0 * G, 2.6, 1.6 * G, 0.05);
      ctx.fillStyle = "#7a2a35";
      ctx.fill();
      rrect(ctx, 0.15, 2.1 * G, 2.3, 1.4 * G, 0.04);
      ctx.strokeStyle = "#e9b22a";
      ctx.lineWidth = 0.04;
      ctx.stroke();
      oval(ctx, 1.3, 2.8 * G, 0.4, 0.25);
      ctx.strokeStyle = "#e9b22a";
      ctx.stroke();
    });
  }
  if (owned.has("fan")) {
    add(0.9, 2.55, () => {
      groundShadow(ctx, 0, 0, 0.25, 0.12, 0.2);
      oval(ctx, 0, 0, 0.22, 0.1);
      ctx.fillStyle = "#e9e6de";
      ctx.fill();
      line(ctx, 0, 0, 0, -1.2 * K, "#d9d6ce", 0.04);
      oval(ctx, 0, -1.3 * K, 0.28, 0.28);
      ctx.fillStyle = "rgba(230,230,225,0.6)";
      ctx.fill();
      ctx.strokeStyle = "#bdb9b0";
      ctx.lineWidth = 0.015;
      for (let i = 0; i < 3; i++) {
        const a = t * 18 + (i * Math.PI * 2) / 3;
        line(ctx, 0, -1.3 * K, Math.cos(a) * 0.24, -1.3 * K + Math.sin(a) * 0.24, "rgba(70,110,160,0.7)", 0.07);
      }
      oval(ctx, 0, -1.3 * K, 0.28, 0.28);
      ctx.stroke();
    });
  }
  if (owned.has("shelf")) {
    add(0.35, 5.0, () => {
      rrect(ctx, -0.55, -1.7 * K, 1.1, 1.7 * K, 0.03);
      ctx.fillStyle = PAL.wood;
      ctx.fill();
      for (let s = 0; s < 3; s++) {
        line(ctx, -0.5, -1.7 * K + 0.45 + s * 0.45, 0.5, -1.7 * K + 0.45 + s * 0.45, PAL.woodDark, 0.04);
        for (let b = 0; b < 7; b++) {
          ctx.fillStyle = ["#a12a22", "#2f5aa8", "#e9b22a", "#2f8a4a", "#f3efe4"][(b + s) % 5];
          ctx.fillRect(-0.45 + b * 0.13, -1.7 * K + 0.1 + s * 0.45, 0.1, 0.33);
        }
      }
    });
  }
  if (owned.has("tv")) {
    add(0.45, 3.5, () => {
      rrect(ctx, -0.7, -0.55 * K, 1.4, 0.55 * K, 0.03);
      ctx.fillStyle = PAL.woodDark;
      ctx.fill();
      rrect(ctx, -0.6, -0.55 * K - 0.75, 1.2, 0.72, 0.03);
      ctx.fillStyle = "#121212";
      ctx.fill();
      ctx.fillStyle = "#2f7a3a"; // football on the screen
      ctx.fillRect(-0.55, -0.55 * K - 0.7, 1.1, 0.62);
      line(ctx, 0, -0.55 * K - 0.7, 0, -0.55 * K - 0.08, "rgba(255,255,255,0.6)", 0.015);
      rrect(ctx, -0.25, -0.55 * K + 0.08, 0.5, 0.1, 0.02);
      ctx.fillStyle = "#333";
      ctx.fill();
    });
  }
  if (owned.has("fridge")) {
    add(0.5, 6.4, () => {
      rrect(ctx, -0.35, -1.6 * K, 0.7, 1.6 * K, 0.06);
      ctx.fillStyle = "#efeee8";
      ctx.fill();
      ctx.strokeStyle = "#bdbab2";
      ctx.lineWidth = 0.02;
      ctx.stroke();
      line(ctx, -0.35, -1.1 * K, 0.35, -1.1 * K, "#bdbab2", 0.02);
      line(ctx, 0.25, -1.4 * K, 0.25, -1.2 * K, "#9a978f", 0.03);
      line(ctx, 0.25, -0.9 * K, 0.25, -0.5 * K, "#9a978f", 0.03);
    });
  }
  if (owned.has("ac")) {
    add(0.02, 1.9, () => {
      rrect(ctx, -0.5, -2.45 * K, 1.0, 0.3, 0.05);
      ctx.fillStyle = "#f2f1ec";
      ctx.fill();
      line(ctx, -0.42, -2.45 * K + 0.22, 0.42, -2.45 * K + 0.22, "#c9c6bd", 0.02);
    });
  }
  if (owned.has("gen")) add(4.4, 6.3, () => drawGenerator(ctx, false, t));
  if (owned.has("dining")) {
    add(3.3, 5.6, () => {
      for (const [cx, cy] of [[-0.6, -0.5], [0.6, -0.5]]) chairBack(ctx, cx, cy * G);
      rrect(ctx, -0.8, -0.75 * K - 0.9 * G, 1.6, 0.9 * G, 0.04);
      ctx.fillStyle = "#7a4a2b";
      ctx.fill();
      for (const x of [-0.7, 0.7]) line(ctx, x, -0.75 * K, x, 0, PAL.woodDark, 0.05);
      oval(ctx, 0, -0.75 * K - 0.45 * G, 0.18, 0.08);
      ctx.fillStyle = "#e9dcc0";
      ctx.fill();
    });
  }
  if (owned.has("sofa")) {
    add(4.0, 3.2, () => {
      // seen from behind, facing the TV
      groundShadow(ctx, 0, 0, 1.2, 0.3, 0.25);
      rrect(ctx, -1.1, -0.85 * K, 2.2, 0.85 * K, 0.12);
      ctx.fillStyle = "#5b3a2a";
      ctx.fill();
      rrect(ctx, -1.15, -0.95 * K, 2.3, 0.25, 0.1);
      ctx.fillStyle = "#6b4a36";
      ctx.fill();
      for (const x of [-1.15, 0.95]) {
        rrect(ctx, x, -0.7 * K, 0.2, 0.7 * K, 0.06);
        ctx.fillStyle = "#4a2f22";
        ctx.fill();
      }
    });
  }
  return items;
}

function chairBack(ctx: Ctx, x: number, y: number) {
  rrect(ctx, x - 0.2, y - 1.0 * K, 0.4, 0.55, 0.04);
  ctx.fillStyle = PAL.woodDark;
  ctx.fill();
}

// ---------------------------------------------------------------- public

export interface RoomScene {
  tier: "room" | "flat" | "duplex";
  furniture: string[];
  player: PersonSpec;
  sleeping: boolean;
  night: boolean;
}

/** Your room: tier decides walls and floor; furniture you own appears. */
export function drawRoom(ctx: Ctx, s: RoomScene, t: number) {
  const owned = new Set(s.furniture);
  const shell: Shell = {
    wall: s.tier === "room" ? "#d9c9a8" : s.tier === "flat" ? "#cfe0d8" : "#efe6d6",
    floor: s.tier === "room" ? "cement" : s.tier === "flat" ? "terrazzo" : "ceramic",
    window: true,
    curtains: owned.has("curtains") ? "#2f6b5a" : undefined,
    calendar: true,
    photo: s.tier !== "room",
    bulb: true,
  };
  drawFloor(ctx, shell.floor, 11);
  drawBackWall(ctx, shell, 12);
  const items = furnitureItems(ctx, owned, t);
  if (s.sleeping) {
    // lying on the mat, head on the pillow (west), a wrapper pulled up to the chest
    const feet = SLEEP_SPOT.x + SLEEP_SPOT.len - 0.12;
    const mid = SLEEP_SPOT.y - SLEEP_SPOT.depth / 2;
    const lift = owned.has("mattress") ? 0.18 * K : 0;
    items.push({
      y: SLEEP_SPOT.y + 0.01,
      draw: () => at(ctx, feet, mid, () => {
        ctx.translate(0, -lift);
        ctx.save();
        ctx.rotate(-Math.PI / 2);
        ctx.scale(1, 0.92);
        drawPerson(ctx, s.player, "S", "stand", 0);
        ctx.restore();
        const breathe = Math.sin(t * 1.6) * 0.012;
        rrect(ctx, -1.02, -0.24 - breathe, 1.06, 0.46 + breathe, 0.12);
        ctx.fillStyle = FABRICS.waxPurple.base;
        ctx.fill();
        for (let i = 0; i < 6; i++) {
          oval(ctx, -0.9 + i * 0.17, -0.05, 0.05, 0.04);
          ctx.fillStyle = FABRICS.waxPurple.a;
          ctx.fill();
        }
      }),
    });
  } else {
    const p = wanderAt(t);
    items.push({ y: p.y, draw: () => at(ctx, p.x, p.y, () => drawPerson(ctx, s.player, p.dir, p.moving ? "walk" : "stand", t * 7)) });
  }
  items.sort((a, b) => a.y - b.y).forEach((i) => i.draw());
  if (s.sleeping) {
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.6 + i / 3) % 1;
      label(ctx, "z", SLEEP_SPOT.x + 0.35 + k * 0.6, (SLEEP_SPOT.y - SLEEP_SPOT.depth / 2) * G - 0.4 - k * 1.2, 0.25 + k * 0.2, `rgba(255,255,255,${1 - k})`, 900);
    }
  }
  drawSideWalls(ctx);
  if (s.night || s.sleeping) {
    ctx.fillStyle = "rgba(10,18,45,0.45)";
    ctx.fillRect(-0.3, -ROOM_H * K - 0.3, ROOM_W + 0.6, roomScreenH() + 0.6);
  }
}

export type ShopKind = "food" | "provisions" | "boutique" | "barber" | "viewing";

const sitN = (ctx: Ctx, p: PersonSpec, x: number, y: number) => at(ctx, x, y, () => drawPerson(ctx, p, "N", "sit", 0, 0.45));

/** A shop interior with its keeper and customers. */
export function drawShop(ctx: Ctx, kind: ShopKind, t: number) {
  const r = rng(91);
  const shells: Record<ShopKind, Shell> = {
    food: { wall: "#e6cf9e", floor: "cement", window: false, calendar: true, sign: { text: "MAMA PUT", bg: "#f2c230", fg: "#7a1f14" }, bulb: true },
    provisions: { wall: "#cfd6cc", floor: "terrazzo", window: false, calendar: true, bulb: true },
    barber: { wall: "#c9d9e6", floor: "tiles-red", window: false, calendar: false, sign: { text: "GOD'S GRACE CUTZ", bg: "#2f5aa8", fg: "#f3efe4" }, bulb: true },
    viewing: { wall: "#3a3f4a", floor: "cement", window: false, sign: { text: "EPL LIVE · ₦500", bg: "#f3efe4", fg: "#a12a22" }, bulb: true },
    boutique: { wall: "#efe6d6", floor: "ceramic", window: true, curtains: "#7a2a35", photo: true, bulb: true },
  };
  drawFloor(ctx, shells[kind].floor, 21);
  drawBackWall(ctx, shells[kind], 22);
  const items: Item[] = [];
  const add = (y: number, x: number, f: () => void) => items.push({ y, draw: () => at(ctx, x, y, f) });

  if (kind === "food") {
    // Mama Put stands at the end of her counter, dishing out
    add(1.7, 6.0, () => drawPerson(ctx, CAST.mamaPut, "W", "stand"));
    add(1.3, 3.0, () => {
      // counter of pots
      rrect(ctx, -2.4, -0.95 * K - 0.7 * G, 4.8, 0.7 * G, 0.03);
      ctx.fillStyle = shade(PAL.wood, 0.1);
      ctx.fill();
      ctx.fillStyle = PAL.wood;
      ctx.fillRect(-2.4, -0.95 * K, 4.8, 0.95 * K);
      const cols = ["#c9a23a", "#3f6b2a", "#b8331f", "#efe6cf", "#7a4a2b"];
      cols.forEach((c, i) => {
        const x = -2.0 + i * 1.0;
        rrect(ctx, x - 0.32, -0.95 * K - 0.62, 0.64, 0.4, 0.08);
        ctx.fillStyle = "#26231f";
        ctx.fill();
        oval(ctx, x, -0.95 * K - 0.62, 0.32, 0.1);
        ctx.fillStyle = c;
        ctx.fill();
        for (let k = 0; k < 2; k++) {
          const s = (t * 0.5 + i * 0.2 + k / 2) % 1;
          oval(ctx, x + Math.sin(s * 6) * 0.08, -0.95 * K - 0.75 - s * 0.9, 0.08 + s * 0.15, 0.06 + s * 0.1);
          ctx.fillStyle = `rgba(255,255,255,${0.3 * (1 - s)})`;
          ctx.fill();
        }
      });
    });
    for (const [bx, by] of [[1.8, 3.0], [5.0, 3.0], [3.4, 4.4]]) {
      add(by, bx, () => drawBench(ctx, 1.8));
    }
    add(3.05, 1.4, () => drawPerson(ctx, CAST.okadaMan, "N", "sit", 0, 0.45));
    add(3.05, 2.2, () => drawPerson(ctx, CAST.uiStudent, "N", "sit", 0, 0.45));
    add(3.05, 5.2, () => drawPerson(ctx, CAST.mechanic, "N", "sit", 0, 0.45));
    add(4.45, 3.8, () => drawPerson(ctx, CAST.marketWoman, "N", "sit", 0, 0.45));
  } else if (kind === "provisions") {
    // shelves along the back wall, packed
    add(0.3, 0, () => {
      for (let s = 0; s < 4; s++) {
        line(ctx, 0.3, -2.3 * K + 0.5 + s * 0.48, 6.7, -2.3 * K + 0.5 + s * 0.48, PAL.wood, 0.05);
        for (let i = 0; i < 38; i++) {
          rrect(ctx, 0.35 + i * 0.165, -2.3 * K + 0.12 + s * 0.48, 0.13, 0.35, 0.015);
          ctx.fillStyle = ["#d23b2a", "#f0c32e", "#2f6fb5", "#f4f1e6", "#2f8a4a", "#6b2a3a"][Math.floor(r() * 6)];
          ctx.fill();
        }
      }
    });
    add(1.0, 3.2, () => drawPerson(ctx, { ...CAST.breadSeller, carry: null }, "S", "stand"));
    add(1.8, 3.2, () => {
      rrect(ctx, -2.2, -1.0 * K - 0.6 * G, 4.4, 0.6 * G, 0.03);
      ctx.fillStyle = "rgba(200,225,235,0.6)";
      ctx.fill();
      ctx.fillStyle = "#3d5868";
      ctx.fillRect(-2.2, -1.0 * K, 4.4, 1.0 * K);
      for (let i = 0; i < 9; i++) {
        rrect(ctx, -2.0 + i * 0.45, -1.0 * K - 0.5, 0.3, 0.3, 0.03);
        ctx.fillStyle = ["#f0c32e", "#d23b2a", "#f4f1e6"][i % 3];
        ctx.fill();
      }
    });
    add(3.8, 6.0, () => {
      rrect(ctx, -0.8, -0.85 * K - 0.7 * G, 1.6, 0.7 * G, 0.05);
      ctx.fillStyle = "#e9eef0";
      ctx.fill();
      ctx.fillStyle = "#d9dee0";
      ctx.fillRect(-0.8, -0.85 * K, 1.6, 0.85 * K);
      label(ctx, "COLD DRINKS", 0, -0.45 * K, 0.14, "#2f5aa8", 900);
    });
  } else if (kind === "barber") {
    add(0.05, 0, () => {
      rrect(ctx, 0.6, -2.2 * K, 5.8, 0.95, 0.03);
      ctx.fillStyle = "#b9d3dc";
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillRect(0.8, -2.2 * K + 0.1, 1.2, 0.75);
    });
    add(1.8, 2.6, () => {
      line(ctx, 0, 0, 0, -0.5 * K, "#222", 0.08);
      rrect(ctx, -0.35, -0.55 * K - 0.4, 0.7, 0.45, 0.06);
      ctx.fillStyle = "#1c1c1c";
      ctx.fill();
    });
    add(1.85, 2.6, () => drawPerson(ctx, CAST.tunde, "N", "sit", 0, 0.55));
    add(2.0, 3.4, () => drawPerson(ctx, CAST.uiStudent, "W", "stand"));
    add(3.9, 5.2, () => drawBench(ctx, 1.8));
    add(3.95, 4.8, () => drawPerson(ctx, CAST.okadaMan, "N", "sit", 0, 0.45));
    add(4.4, 1.0, () => drawGenerator(ctx, true, t));
  } else if (kind === "viewing") {
    add(0.05, 3.5, () => {
      const tv = -1.95 * K;
      rrect(ctx, -1.3, tv, 2.6, 1.3, 0.04);
      ctx.fillStyle = "#101010";
      ctx.fill();
      ctx.fillStyle = "#2f7a3a";
      ctx.fillRect(-1.2, tv + 0.08, 2.4, 1.14);
      line(ctx, 0, tv + 0.08, 0, tv + 1.22, "rgba(255,255,255,0.6)", 0.02);
      oval(ctx, 0, tv + 0.65, 0.25, 0.25);
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 0.02;
      ctx.stroke();
      oval(ctx, 0.4 + Math.sin(t) * 0.5, tv + 0.55, 0.04, 0.04);
      ctx.fillStyle = "#fff";
      ctx.fill();
    });
    const fans = [CAST.okadaMan, CAST.uiStudent, CAST.mechanic, CAST.banker, CAST.babaAde, CAST.yamSeller];
    [2.2, 3.4, 4.6].forEach((by, row) => {
      add(by, 3.5, () => drawBench(ctx, 5.2));
      for (let i = 0; i < 3; i++) {
        const p = fans[(row * 2 + i) % fans.length];
        items.push({ y: by + 0.05, draw: () => sitN(ctx, p, 1.8 + i * 1.6, by + 0.05) });
      }
    });
  } else {
    // boutique: racks of ankara and lace, mannequin, mirror
    for (const [rx, ry] of [[1.6, 1.4], [5.2, 1.4], [2.6, 3.4]]) {
      add(ry, rx, () => {
        line(ctx, -1.1, -1.7 * K, 1.1, -1.7 * K, "#8a8a88", 0.04);
        for (const x of [-1.05, 1.05]) line(ctx, x, 0, x, -1.7 * K, "#8a8a88", 0.04);
        const fabs = [FABRICS.waxGold, FABRICS.waxGreen, FABRICS.waxPurple, FABRICS.adireIndigo, FABRICS.laceWhite, FABRICS.asoOkeWine];
        for (let i = 0; i < 8; i++) {
          const f = fabs[(i + Math.round(rx)) % fabs.length];
          rrect(ctx, -0.95 + i * 0.25, -1.7 * K + 0.05, 0.22, 0.95, 0.03);
          ctx.fillStyle = f.base;
          ctx.fill();
          for (let k = 0; k < 4; k++) {
            oval(ctx, -0.84 + i * 0.25, -1.7 * K + 0.2 + k * 0.2, 0.04, 0.04);
            ctx.fillStyle = f.a;
            ctx.fill();
          }
        }
      });
    }
    add(2.0, 3.6, () => drawPerson(ctx, { ...CAST.owambeAunty, carry: null }, "S", "stand"));
    add(3.6, 5.6, () => drawPerson(ctx, CAST.clothSeller, "W", "stand"));
    add(0.05, 6.4, () => {
      rrect(ctx, -0.35, -2.2 * K, 0.7, 1.9 * K, 0.06);
      ctx.fillStyle = "#b9d3dc";
      ctx.fill();
      ctx.strokeStyle = "#c9a24a";
      ctx.lineWidth = 0.05;
      ctx.stroke();
    });
  }
  items.sort((a, b) => a.y - b.y).forEach((i) => i.draw());
  drawSideWalls(ctx);
}
