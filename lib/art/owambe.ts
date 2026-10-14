// Omo Ibadan art kit — an owambe at night: canopy and string lights, the Fuji
// band on a low stage, aso-ebi guests at their tables, the celebrant on the
// dance floor and naira notes underfoot. Same tilted camera as the streets.

import { G, K, groundShadow, label, line, oval, rng, rrect, shade, type Ctx } from "./core";
import { drawPaving } from "./ground";
import { drawPerson, FABRICS, type PersonSpec } from "./people";
import { CAST } from "./cast";
import { PAL } from "./palette";

export const OWAMBE_W = 16;
export const OWAMBE_D = 11;
/** screen metres above the back of the floor (backdrop, canopy, band) */
export const OWAMBE_TOP = 4.4 * K;
export const owambeScreenH = () => OWAMBE_D * G + OWAMBE_TOP + 0.3;

export interface Note { x: number; y: number; rot: number; color: string }
/** A note in the air: thrown from (x0, y0) at t0, lands at (x1, y1). */
export interface Flying { x0: number; y0: number; x1: number; y1: number; t0: number; rot: number; color: string }

export interface OwambeState {
  player: PersonSpec;
  /** the player is dancing hard until this time (s) */
  danceUntil: number;
  notes: Note[];
  flying: Flying[];
}

/** ₦1,000 brown-green, ₦500 blue-green, ₦200 blue-brown */
export const NOTE_COLORS = ["#7a6a3c", "#3f6f78", "#5a5274"];
export const FLIGHT = 1.1; // seconds in the air
export const DANCE_FLOOR = { x: 4.6, y: 4.2, w: 6.8, h: 4.2 };
export const PLAYER_SPOT = { x: 6.4, y: 6.6 };
export const CELEBRANT_SPOT = { x: 8.2, y: 6.0 };

// aso-ebi: the family's chosen fabric, worn by everyone close to the celebrant
const ASO = FABRICS.asoOkeWine;
const GUEST_W: PersonSpec = { ...CAST.owambeAunty, headwear: { kind: "gele", fabric: ASO }, outfit: { kind: "iro-buba", buba: FABRICS.laceWhite, iro: ASO } };
const GUEST_M: PersonSpec = { ...CAST.chief, headwear: { kind: "fila", fabric: ASO }, outfit: { kind: "agbada", robe: ASO, under: FABRICS.laceWhite } };
const CELEBRANT: PersonSpec = { ...CAST.mummy, headwear: { kind: "gele", fabric: FABRICS.asoOkeCream }, outfit: { kind: "iro-buba", buba: FABRICS.laceWhite, iro: FABRICS.asoOkeCream } };
const HUSBAND: PersonSpec = { ...CAST.chief, outfit: { kind: "agbada", robe: FABRICS.asoOkeCream, under: FABRICS.laceWhite }, headwear: { kind: "fila", fabric: FABRICS.asoOkeCream } };
const SINGER: PersonSpec = { ...CAST.chief, age: "adult", hair: "lowcut", headwear: { kind: "cap", fabric: FABRICS.waxGold }, outfit: { kind: "agbada", robe: FABRICS.waxGold, under: FABRICS.laceWhite } };
const DRUMMER: PersonSpec = { ...CAST.mechanic, outfit: { kind: "buba-sokoto", top: FABRICS.waxGreen, bottom: FABRICS.waxGreen }, headwear: { kind: "fila", fabric: FABRICS.waxGreen } };
const KEYS: PersonSpec = { ...CAST.uiStudent, outfit: { kind: "buba-sokoto", top: FABRICS.waxPurple, bottom: FABRICS.plainSky } };
const BOY: PersonSpec = { ...CAST.tunde, carry: "bag" };

const at = (ctx: Ctx, x: number, y: number, f: () => void) => {
  ctx.save();
  ctx.translate(x, y * G);
  f();
  ctx.restore();
};

/** Scatter of notes already on the floor when the party is warm. */
export function startingNotes(seed = 7, n = 26): Note[] {
  const r = rng(seed);
  return Array.from({ length: n }, () => ({
    x: DANCE_FLOOR.x + 0.4 + r() * (DANCE_FLOOR.w - 0.8),
    y: DANCE_FLOOR.y + 0.4 + r() * (DANCE_FLOOR.h - 0.8),
    rot: r() * Math.PI,
    color: NOTE_COLORS[Math.floor(r() * NOTE_COLORS.length)],
  }));
}

/** Where the money boy is at time t: circling the dance floor, bag in hand. */
export function gathererAt(t: number) {
  const a = t * 0.35;
  const cx = DANCE_FLOOR.x + DANCE_FLOOR.w / 2, cy = DANCE_FLOOR.y + DANCE_FLOOR.h / 2;
  return { x: cx + Math.cos(a) * (DANCE_FLOOR.w / 2 - 0.5), y: cy + Math.sin(a) * (DANCE_FLOOR.h / 2 - 0.5), dir: (Math.sin(a) > 0 ? "W" : "E") as "E" | "W" };
}

function drawNote(ctx: Ctx, rot: number, color: string) {
  ctx.save();
  ctx.scale(1, G);
  ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.fillRect(-0.16, -0.07, 0.32, 0.14);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillRect(-0.12, -0.04, 0.08, 0.08);
  ctx.restore();
}

function drawTable(ctx: Ctx) {
  groundShadow(ctx, 0, 0, 0.8, 0.3, 0.25);
  // white cloth to the floor
  rrect(ctx, -0.75, -0.75 * K, 1.5, 0.75 * K, 0.1);
  ctx.fillStyle = "#ece7dc";
  ctx.fill();
  oval(ctx, 0, -0.75 * K, 0.75, 0.75 * G);
  ctx.fillStyle = "#f6f2ea";
  ctx.fill();
  // a cooler of jollof, bottles, a pack of small chops
  rrect(ctx, -0.3, -0.75 * K - 0.28, 0.32, 0.26, 0.05);
  ctx.fillStyle = "#c0392b";
  ctx.fill();
  for (const [x, c] of [[0.2, "#2f7a3a"], [0.35, "#7a2a1a"]] as [number, string][]) {
    rrect(ctx, x, -0.75 * K - 0.32, 0.07, 0.3, 0.03);
    ctx.fillStyle = c;
    ctx.fill();
  }
}

function drawSpeaker(ctx: Ctx) {
  groundShadow(ctx, 0, 0, 0.45, 0.18, 0.3);
  rrect(ctx, -0.4, -1.6 * K, 0.8, 1.6 * K, 0.04);
  ctx.fillStyle = "#1b1a1a";
  ctx.fill();
  for (const [y, r] of [[-1.25, 0.2], [-0.55, 0.28]] as [number, number][]) {
    oval(ctx, 0, y * K, r, r);
    ctx.fillStyle = "#3a3838";
    ctx.fill();
    oval(ctx, 0, y * K, r * 0.4, r * 0.4);
    ctx.fillStyle = "#0e0e0e";
    ctx.fill();
  }
}

function drawTalkingDrum(ctx: Ctx, beat: number) {
  // dundun: hourglass drum under the left arm, laced with leather cords
  ctx.save();
  ctx.translate(-0.28, -1.0 * K);
  ctx.rotate(-0.2);
  ctx.fillStyle = "#8a5a30";
  ctx.beginPath();
  ctx.moveTo(-0.32, -0.16);
  ctx.quadraticCurveTo(0, -0.06, 0.32, -0.16);
  ctx.lineTo(0.32, 0.16);
  ctx.quadraticCurveTo(0, 0.06, -0.32, 0.16);
  ctx.closePath();
  ctx.fill();
  for (let i = -3; i <= 3; i++) line(ctx, -0.3, i * 0.045, 0.3, -i * 0.045, "rgba(240,230,210,0.6)", 0.012);
  ctx.restore();
  // the curved stick
  line(ctx, 0.15, -1.1 * K, 0.0, -1.25 * K - beat * 0.12, "#4a2f1e", 0.035);
}

function drawSakara(ctx: Ctx, beat: number) {
  // sakara: round clay frame drum on the lap
  oval(ctx, 0.05, -0.55 * K, 0.22, 0.22 * G + 0.04);
  ctx.fillStyle = "#b07a45";
  ctx.fill();
  oval(ctx, 0.05, -0.55 * K - 0.02, 0.17, 0.17 * G);
  ctx.fillStyle = "#e6d3b0";
  ctx.fill();
  line(ctx, 0.25, -0.75 * K, 0.1, -0.6 * K - beat * 0.1, "#4a2f1e", 0.03);
}

function drawKeyboard(ctx: Ctx) {
  line(ctx, -0.45, 0, -0.2, -0.85 * K, "#222", 0.04);
  line(ctx, 0.45, 0, 0.2, -0.85 * K, "#222", 0.04);
  rrect(ctx, -0.6, -0.95 * K, 1.2, 0.16, 0.03);
  ctx.fillStyle = "#151515";
  ctx.fill();
  for (let i = 0; i < 14; i++) {
    ctx.fillStyle = "#f2f0ea";
    ctx.fillRect(-0.55 + i * 0.079, -0.95 * K + 0.03, 0.07, 0.09);
  }
}

function drawMicStand(ctx: Ctx) {
  line(ctx, 0.3, 0, 0.3, -1.45 * K, "#222", 0.03);
  line(ctx, 0.3, -1.45 * K, 0.12, -1.5 * K, "#222", 0.03);
  oval(ctx, 0.1, -1.5 * K, 0.05, 0.05);
  ctx.fillStyle = "#555";
  ctx.fill();
}

/** Dancing: bob, sway and turn on the beat. */
function dancer(ctx: Ctx, p: PersonSpec, t: number, phase: number, hard: boolean) {
  const beat = t * (hard ? 2.6 : 1.8) + phase;
  const dirs = ["S", "E", "S", "W"] as const;
  const dir = dirs[Math.floor(beat / 2) % 4];
  const bob = Math.abs(Math.sin(beat * Math.PI)) * (hard ? 0.09 : 0.05);
  ctx.save();
  ctx.translate(0, -bob);
  ctx.rotate(Math.sin(beat * Math.PI) * (hard ? 0.07 : 0.04));
  drawPerson(ctx, p, dir, "walk", beat * 3);
  ctx.restore();
}

export function drawOwambe(ctx: Ctx, s: OwambeState, t: number) {
  const W = OWAMBE_W, D = OWAMBE_D;
  const beat = (Math.sin(t * Math.PI * 2.2) + 1) / 2;

  // night behind the canopy
  const sky = ctx.createLinearGradient(0, -OWAMBE_TOP, 0, 0);
  sky.addColorStop(0, "#120d1c");
  sky.addColorStop(1, "#2a1a24");
  ctx.fillStyle = sky;
  ctx.fillRect(-0.3, -OWAMBE_TOP - 0.3, W + 0.6, OWAMBE_TOP + 0.3);

  // the floor: interlocking paving, the dance floor marked out in tarpaulin-gold light
  drawPaving(ctx, 0, 0, W, D, 41);
  ctx.save();
  ctx.scale(1, G);
  ctx.fillStyle = "rgba(242,194,48,0.10)";
  ctx.fillRect(DANCE_FLOOR.x, DANCE_FLOOR.y, DANCE_FLOOR.w, DANCE_FLOOR.h);
  ctx.restore();

  // backdrop: wine and gold drapes with the banner
  for (let i = 0; i < 16; i++) {
    const x = i;
    ctx.fillStyle = i % 2 ? ASO.base : shade(ASO.base, -0.12);
    ctx.fillRect(x, -3.4 * K, 1, 3.4 * K);
    line(ctx, x + 0.5, -3.4 * K, x + 0.5, 0, "rgba(201,162,74,0.25)", 0.02);
  }
  rrect(ctx, 4.2, -3.25 * K, 7.6, 0.75, 0.06);
  ctx.fillStyle = "#f6efe0";
  ctx.fill();
  label(ctx, "MUMMY @ 60 · Ẹ KÚ ỌDÚN", 8, -3.25 * K + 0.32, 0.36, ASO.base, 900);
  label(ctx, "FUJI NIGHT · OWAMBE", 8, -3.25 * K + 0.62, 0.2, "#9a7b3a", 800);

  // stage platform
  ctx.fillStyle = "#3a2a22";
  ctx.fillRect(2.6, 0, 10.8, 2.6 * G);
  ctx.fillStyle = "#24170f";
  ctx.fillRect(2.6, 2.6 * G - 0.02, 10.8, 0.36 * K);

  // light cones from the stage
  for (const [x, c] of [[4, "rgba(232,160,32,0.10)"], [8, "rgba(179,58,58,0.10)"], [12, "rgba(31,122,77,0.10)"]] as [number, string][]) {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(x - 0.2, -3.5 * K);
    ctx.lineTo(x - 2.6, 9 * G);
    ctx.lineTo(x + 2.6, 9 * G);
    ctx.closePath();
    ctx.fill();
  }

  // everything that stands, back to front
  const items: { y: number; draw: () => void }[] = [];
  const put = (x: number, y: number, f: () => void) => items.push({ y, draw: () => at(ctx, x, y, f) });
  const lift = -0.36 * K; // standing on the stage
  put(3.2, 1.6, () => { ctx.translate(0, lift); drawSpeaker(ctx); });
  put(12.8, 1.6, () => { ctx.translate(0, lift); drawSpeaker(ctx); });
  put(5.0, 1.9, () => { ctx.translate(0, lift); drawPerson(ctx, DRUMMER, "S", "stand", 0); drawTalkingDrum(ctx, beat); });
  put(6.3, 2.0, () => { ctx.translate(0, lift); drawPerson(ctx, { ...DRUMMER, outfit: { kind: "buba-sokoto", top: FABRICS.waxGold, bottom: FABRICS.waxGold } }, "S", "sit", 0, 0.45); drawSakara(ctx, 1 - beat); });
  put(8.0, 2.1, () => { ctx.translate(0, lift - beat * 0.03); drawPerson(ctx, SINGER, "S", "stand", 0); drawMicStand(ctx); });
  put(10.3, 1.9, () => { ctx.translate(0, lift); drawKeyboard(ctx); });
  put(10.3, 1.7, () => { ctx.translate(0, lift); drawPerson(ctx, KEYS, "S", "stand", 0); });

  // guests at their tables, facing the dance floor
  const tables: [number, number, "E" | "W"][] = [[1.5, 5.0, "E"], [1.5, 8.6, "E"], [14.5, 5.0, "W"], [14.5, 8.6, "W"]];
  tables.forEach(([x, y, face], i) => {
    put(x, y, () => drawTable(ctx));
    const side = face === "E" ? -1 : 1;
    put(x + side * 0.15, y - 0.75, () => drawPerson(ctx, i % 2 ? GUEST_M : GUEST_W, "S", "sit", 0, 0.45));
    put(x - side * 0.95, y + 0.1, () => drawPerson(ctx, i % 2 ? GUEST_W : GUEST_M, face, "sit", 0, 0.45));
  });
  // food table at the front: coolers and trays
  put(8, 10.4, () => {
    groundShadow(ctx, 0, 0, 1.7, 0.3, 0.25);
    rrect(ctx, -1.6, -0.75 * K, 3.2, 0.75 * K, 0.04);
    ctx.fillStyle = "#ece7dc";
    ctx.fill();
    for (let i = 0; i < 4; i++) {
      rrect(ctx, -1.45 + i * 0.75, -0.75 * K - 0.32, 0.6, 0.3, 0.06);
      ctx.fillStyle = ["#c0392b", "#2f6fb5", "#c0392b", "#e9b22a"][i];
      ctx.fill();
    }
  });

  // notes on the floor
  for (const n of s.notes) items.push({ y: n.y - 0.5, draw: () => at(ctx, n.x, n.y, () => drawNote(ctx, n.rot, n.color)) });

  // the dance floor
  const hard = t < s.danceUntil;
  put(CELEBRANT_SPOT.x, CELEBRANT_SPOT.y, () => dancer(ctx, CELEBRANT, t, 0, true));
  put(9.8, 6.4, () => dancer(ctx, HUSBAND, t, 1.3, false));
  put(5.3, 5.2, () => dancer(ctx, GUEST_W, t, 0.6, false));
  put(PLAYER_SPOT.x, PLAYER_SPOT.y, () => dancer(ctx, s.player, t, 2.1, hard));
  const g = gathererAt(t);
  put(g.x, g.y, () => drawPerson(ctx, BOY, g.dir, "walk", t * 7));

  items.sort((a, b) => a.y - b.y).forEach((i) => i.draw());

  // notes in the air, thrown over the celebrant's head
  for (const f of s.flying) {
    const k = (t - f.t0) / FLIGHT;
    if (k < 0 || k > 1) continue;
    const x = f.x0 + (f.x1 - f.x0) * k + Math.sin(k * 9 + f.rot) * 0.15;
    const yFloor = (f.y0 + (f.y1 - f.y0) * k) * G;
    const height = Math.sin(k * Math.PI) * 1.4 + (1 - k) * 1.6;
    ctx.save();
    ctx.translate(x, yFloor - height * K);
    ctx.rotate(f.rot + k * 6);
    ctx.fillStyle = f.color;
    ctx.fillRect(-0.16, -0.07, 0.32, 0.14);
    ctx.restore();
  }

  // the canopy's front edge: white and gold valance with string lights
  ctx.fillStyle = "#f3efe4";
  ctx.fillRect(-0.3, -OWAMBE_TOP - 0.3, W + 0.6, 0.55);
  for (let x = 0; x < W; x += 0.5) {
    ctx.beginPath();
    ctx.arc(x + 0.25, -OWAMBE_TOP + 0.25, 0.25, 0, Math.PI);
    ctx.fillStyle = "#f3efe4";
    ctx.fill();
  }
  ctx.fillStyle = "#c9a24a";
  ctx.fillRect(-0.3, -OWAMBE_TOP + 0.2, W + 0.6, 0.05);
  for (let i = 0; i < 40; i++) {
    const x = 0.2 + i * 0.4;
    const y = -OWAMBE_TOP + 0.62 + Math.sin(i * 0.8) * 0.06;
    const on = (Math.sin(t * 3 + i * 1.7) + 1) / 2;
    oval(ctx, x, y, 0.06, 0.06);
    ctx.fillStyle = `rgba(255,${200 + Math.round(on * 40)},${120 + Math.round(on * 60)},${0.55 + on * 0.45})`;
    ctx.fill();
  }
  // canopy poles at the corners
  for (const x of [0.15, W - 0.15]) line(ctx, x, -OWAMBE_TOP + 0.3, x, D * G, PAL.concrete, 0.08);
}
