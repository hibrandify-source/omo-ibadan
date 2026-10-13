// Omo Ibadan art kit — buildings.
//
// Footprint origin is the north-west corner at ground level; the building
// spans x 0..w and y 0..d (metres). We see the roof and the south (front)
// wall. Ibadan's look comes from the roofs: corrugated zinc gone rust-brown.

import { G, K, alpha, clipped, label, line, mix as mixHex, oval, poly, rng, rrect, shade, type Ctx } from "./core";
import { PAL } from "./palette";

export type RoofKind = "hip" | "gable" | "shed" | "flat";

export interface Opening {
  /** distance from the west end of the front wall to the opening's left edge */
  x: number;
  kind: "door" | "window" | "louvre" | "shutter" | "shopfront";
  /** shopfront contents: shelves of packets (default) or a buka counter of soup pots */
  inside?: "goods" | "food";
  width?: number;
  /** door curtain colour (face-me-I-face-you rooms) */
  curtain?: string;
}

export interface BuildingSpec {
  w: number;
  d: number;
  /** wall height (m) */
  h: number;
  roof: RoofKind;
  /** ridge height above the wall plate */
  rise?: number;
  wall: string;
  wallKind: "plaster" | "block";
  /** 0 new … 1 completely rust-brown */
  rust: number;
  openings: Opening[];
  seed: number;
  /** painted notice on the front wall */
  notice?: string;
  sign?: { text: string; bg: string; fg: string };
  /** second storey: draw a balcony line + upper windows */
  storeys?: 1 | 2;
  dish?: boolean;
  tank?: boolean;
}

const OVERHANG = 0.45;

/**
 * One roof slope of corrugated zinc. Sheets are ~0.9 m wide and rust one by
 * one, so tone varies sheet to sheet; rust runs down the corrugations as
 * streaks. `ribs` is the corrugation direction on screen: "v" for slopes
 * facing the viewer/away, "h" for the hip ends.
 */
function roofSheet(ctx: Ctx, pts: number[], base: string, ribs: "v" | "h", rust: number, seed: number, light: number) {
  poly(ctx, pts);
  clipped(ctx, () => {
    const xs = pts.filter((_, i) => i % 2 === 0);
    const ys = pts.filter((_, i) => i % 2 === 1);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const r = rng(seed);
    ctx.fillStyle = shade(base, light);
    ctx.fillRect(minX, minY, maxX - minX, maxY - minY);

    // sheet-by-sheet tone (across the ribs), with lap joints along them
    const across = ribs === "v" ? [minX, maxX] : [minY, maxY];
    const along = ribs === "v" ? [minY, maxY] : [minX, maxX];
    const sheetW = ribs === "v" ? 0.9 : 0.9 * G;
    for (let a = across[0]; a < across[1]; a += sheetW) {
      const t = Math.min(1, rust * (0.55 + r() * 0.9));
      const tone = mixHex(PAL.zinc, PAL.rust[Math.floor(r() * PAL.rust.length)], t);
      ctx.fillStyle = alpha(shade(tone, light), 0.75);
      if (ribs === "v") ctx.fillRect(a, minY, sheetW, maxY - minY);
      else ctx.fillRect(minX, a, maxX - minX, sheetW);
      // where two sheet lengths overlap
      const lap = along[0] + (0.3 + r() * 0.4) * (along[1] - along[0]);
      if (ribs === "v") line(ctx, a, lap, a + sheetW, lap, "rgba(30,15,8,0.25)", 0.03);
      else line(ctx, lap, a, lap, a + sheetW, "rgba(30,15,8,0.25)", 0.03);
    }
    // corrugation ribs
    const step = ribs === "v" ? 0.11 : 0.11 * G;
    for (let a = across[0], i = 0; a < across[1]; a += step, i++) {
      const c = i % 2 ? "rgba(0,0,0,0.12)" : "rgba(255,240,220,0.07)";
      if (ribs === "v") line(ctx, a, minY, a, maxY, c, 0.035);
      else line(ctx, minX, a, maxX, a, c, 0.03);
    }
    // rust streaks running down the corrugations, from nail lines
    const streaks = Math.floor((maxX - minX) * (2 + rust * 8));
    for (let i = 0; i < streaks; i++) {
      const s = across[0] + r() * (across[1] - across[0]);
      const st = along[0] + r() * (along[1] - along[0]) * 0.7;
      const len = (0.3 + r() * 1.2) * (ribs === "v" ? 1 : K);
      const col = alpha(PAL.rust[3], 0.15 + rust * 0.3);
      if (ribs === "v") line(ctx, s, st, s, st + len, col, 0.04 + r() * 0.05);
      else line(ctx, st, s, st + len, s, col, 0.04 + r() * 0.05);
    }
    // a newer replacement sheet, only part of the slope
    if (r() < 0.55) {
      const a = across[0] + Math.floor(r() * ((across[1] - across[0]) / sheetW)) * sheetW;
      const st = along[0] + r() * (along[1] - along[0]) * 0.5;
      const len = (along[1] - along[0]) * (0.25 + r() * 0.3);
      ctx.fillStyle = alpha(shade(PAL.zincNew, light - 0.08), 0.6);
      if (ribs === "v") ctx.fillRect(a, st, sheetW, len);
      else ctx.fillRect(st, a, len, sheetW);
    }
  });
  ctx.strokeStyle = "rgba(30,15,8,0.55)";
  ctx.lineWidth = 0.03;
  poly(ctx, pts);
  ctx.stroke();
}

function wallFace(ctx: Ctx, b: BuildingSpec) {
  const top = b.d - b.h * K;
  const r = rng(b.seed + 7);
  ctx.beginPath();
  ctx.rect(0, top, b.w, b.h * K);
  clipped(ctx, () => {
    ctx.fillStyle = b.wallKind === "block" ? PAL.block : b.wall;
    ctx.fillRect(0, top, b.w, b.h * K);
    if (b.wallKind === "block") {
      // 450 × 225 mm sandcrete blocks
      for (let row = 0, y = b.d; y > top; y -= 0.225 * K, row++) {
        line(ctx, 0, y, b.w, y, PAL.blockLine, 0.012);
        for (let x = row % 2 ? 0.225 : 0; x < b.w; x += 0.45) line(ctx, x, y, x, y - 0.225 * K, PAL.blockLine, 0.01);
      }
    } else {
      // plaster: blotchy fade, rain streaks under the eaves
      for (let i = 0; i < 18; i++) {
        oval(ctx, r() * b.w, top + r() * b.h * K, 0.4 + r() * 1.2, 0.2 + r() * 0.6);
        ctx.fillStyle = alpha(shade(b.wall, r() < 0.5 ? -0.08 : 0.05), 0.18);
        ctx.fill();
      }
      for (let i = 0; i < b.w * 2; i++) {
        const sx = r() * b.w;
        line(ctx, sx, top, sx + (r() - 0.5) * 0.05, top + (0.4 + r() * 1.2) * K, "rgba(70,50,35,0.13)", 0.04 + r() * 0.05);
      }
    }
    // red earth splashed up the bottom of the wall
    const g = ctx.createLinearGradient(0, b.d - 0.7 * K, 0, b.d);
    g.addColorStop(0, "rgba(156,86,56,0)");
    g.addColorStop(1, "rgba(140,72,44,0.65)");
    ctx.fillStyle = g;
    ctx.fillRect(0, b.d - 0.7 * K, b.w, 0.7 * K);
  });
  ctx.strokeStyle = shade(b.wallKind === "block" ? PAL.block : b.wall, -0.45);
  ctx.lineWidth = 0.025;
  ctx.strokeRect(0, top, b.w, b.h * K);
}

/** `lift` raises a window to an upper storey (metres). */
function opening(ctx: Ctx, b: BuildingSpec, o: Opening, lift = 0) {
  const floor = b.d;
  const r = rng(b.seed + Math.round(o.x * 100));
  if (o.kind === "door") {
    const w = o.width ?? 0.9;
    const h = 2.1 * K;
    rrect(ctx, o.x - 0.06, floor - h - 0.06, w + 0.12, h + 0.06, 0.01);
    ctx.fillStyle = shade(b.wall, -0.25);
    ctx.fill();
    if (o.curtain) {
      // open door with a cloth curtain drawn across: every face-me-I-face-you room
      ctx.fillStyle = "#1a1512";
      ctx.fillRect(o.x, floor - h, w, h);
      ctx.beginPath();
      ctx.moveTo(o.x, floor - h);
      for (let i = 0; i <= 6; i++) ctx.lineTo(o.x + (w * i) / 6, floor - h * (0.12 + (i % 2) * 0.02) - h * 0.0);
      ctx.lineTo(o.x + w, floor - h * 0.1);
      ctx.quadraticCurveTo(o.x + w * 0.5, floor - h * 0.05, o.x, floor - h * 0.1);
      ctx.closePath();
      ctx.fillStyle = o.curtain;
      ctx.fill();
      for (let i = 1; i < 5; i++) line(ctx, o.x + (w * i) / 5, floor - h, o.x + (w * i) / 5 + 0.02, floor - h * 0.12, alpha(shade(o.curtain, -0.4), 0.5), 0.012);
    } else {
      const steel = r() < 0.4;
      ctx.fillStyle = steel ? PAL.steelBlue : PAL.wood;
      ctx.fillRect(o.x, floor - h, w, h);
      for (const yy of [0.2, 0.55]) {
        ctx.strokeStyle = shade(steel ? PAL.steelBlue : PAL.wood, -0.35);
        ctx.lineWidth = 0.02;
        ctx.strokeRect(o.x + 0.1, floor - h + h * yy, w - 0.2, h * 0.3);
      }
      oval(ctx, o.x + w - 0.12, floor - h * 0.47, 0.03, 0.03);
      ctx.fillStyle = "#c9b27a";
      ctx.fill();
    }
    // concrete step
    ctx.fillStyle = PAL.concrete;
    ctx.fillRect(o.x - 0.15, floor, w + 0.3, 0.18);
    return;
  }
  if (o.kind === "shopfront") {
    const w = o.width ?? 2.4;
    const h = 2.3 * K;
    ctx.fillStyle = "#1c1916";
    ctx.fillRect(o.x, floor - h, w, h);
    // rolled-up steel shutter
    ctx.fillStyle = shade(PAL.steelGreen, 0.1);
    ctx.fillRect(o.x - 0.05, floor - h - 0.2, w + 0.1, 0.22);
    for (let i = 0; i < 4; i++) line(ctx, o.x - 0.05, floor - h - 0.18 + i * 0.05, o.x + w + 0.05, floor - h - 0.18 + i * 0.05, shade(PAL.steelGreen, -0.3), 0.01);
    if (o.inside === "food") {
      // buka counter: big pots of amala, gbegiri, ewedu and stew, plates stacked
      ctx.fillStyle = "#3a2a1e";
      ctx.fillRect(o.x, floor - h, w, h);
      ctx.fillStyle = PAL.wood;
      ctx.fillRect(o.x + 0.05, floor - 0.95 * K, w - 0.1, 0.95 * K - 0.02);
      const pots = ["#c9a23a", "#3f6b2a", "#b8331f", "#e9dcc0"];
      for (let i = 0; i < Math.floor(w / 0.75); i++) {
        const px = o.x + 0.4 + i * 0.75;
        rrect(ctx, px - 0.28, floor - 0.95 * K - 0.32, 0.56, 0.34, 0.08);
        ctx.fillStyle = "#26231f";
        ctx.fill();
        oval(ctx, px, floor - 0.95 * K - 0.32, 0.28, 0.08);
        ctx.fillStyle = pots[i % pots.length];
        ctx.fill();
      }
      for (let i = 0; i < 4; i++) {
        oval(ctx, o.x + w - 0.35, floor - 0.95 * K - 0.06 - i * 0.05, 0.22, 0.05);
        ctx.fillStyle = i % 2 ? "#f2efe6" : "#d9dcdc";
        ctx.fill();
      }
      ctx.fillStyle = PAL.concrete;
      ctx.fillRect(o.x - 0.2, floor, w + 0.4, 0.3);
      return;
    }
    // goods on shelves inside
    for (let s = 0; s < 3; s++) {
      line(ctx, o.x + 0.05, floor - h + 0.4 + s * 0.5, o.x + w - 0.05, floor - h + 0.4 + s * 0.5, PAL.wood, 0.04);
      for (let i = 0; i < w / 0.18; i++) {
        rrect(ctx, o.x + 0.08 + i * 0.18, floor - h + 0.22 + s * 0.5, 0.13, 0.17, 0.02);
        ctx.fillStyle = ["#d23b2a", "#f0c32e", "#2f6fb5", "#f4f1e6", "#2f8a4a"][Math.floor(r() * 5)];
        ctx.fill();
      }
    }
    ctx.fillStyle = PAL.concrete;
    ctx.fillRect(o.x - 0.2, floor, w + 0.4, 0.3);
    return;
  }
  // windows: sill at 0.9 m
  const w = o.width ?? 1.2;
  const h = 1.15 * K;
  const top = floor - (2.05 + lift) * K;
  ctx.fillStyle = shade(b.wall, -0.3);
  ctx.fillRect(o.x - 0.05, top - 0.05, w + 0.1, h + 0.1);
  if (o.kind === "shutter") {
    // old-city wooden shutters, often half open
    ctx.fillStyle = "#1a1512";
    ctx.fillRect(o.x, top, w, h);
    ctx.fillStyle = PAL.wood;
    ctx.fillRect(o.x, top, w * 0.5, h);
    for (let i = 1; i < 6; i++) line(ctx, o.x, top + (h * i) / 6, o.x + w * 0.5, top + (h * i) / 6, PAL.woodDark, 0.012);
  } else {
    ctx.fillStyle = PAL.glass;
    ctx.fillRect(o.x, top, w, h);
    if (o.kind === "louvre") {
      for (let i = 0; i < 7; i++) {
        ctx.fillStyle = i % 2 ? "rgba(170,195,200,0.22)" : "rgba(170,195,200,0.1)";
        ctx.fillRect(o.x, top + (h * i) / 7, w, h / 14);
      }
    }
    // net curtain behind
    ctx.fillStyle = "rgba(235,225,205,0.35)";
    ctx.fillRect(o.x + w * 0.55, top, w * 0.45, h);
  }
  // burglar-proof bars
  for (let i = 1; i < 6; i++) line(ctx, o.x + (w * i) / 6, top, o.x + (w * i) / 6, top + h, PAL.iron, 0.025);
  line(ctx, o.x, top + h * 0.5, o.x + w, top + h * 0.5, PAL.iron, 0.025);
  ctx.strokeStyle = PAL.iron;
  ctx.lineWidth = 0.03;
  ctx.strokeRect(o.x, top, w, h);
}

export function drawBuilding(ctx: Ctx, spec: BuildingSpec) {
  const rise = spec.rise ?? (spec.roof === "flat" ? 0 : Math.min(spec.d * 0.22, 1.5));
  const worldD = spec.d;
  // everything below works in screen depth: the footprint squashed by the camera tilt
  const b = { ...spec, d: spec.d * G };
  const roofBase = b.roof === "flat" ? b.h + 0.3 : b.h;
  const o = OVERHANG;

  // cast shadow to the right
  poly(ctx, [b.w, -o * 0.5, b.w + b.h * 0.45, 0.3, b.w + b.h * 0.45, b.d + 0.3, b.w, b.d]);
  ctx.fillStyle = "rgba(25,12,6,0.22)";
  ctx.fill();

  wallFace(ctx, b);
  for (const op of b.openings) opening(ctx, b, op);
  if (b.storeys === 2) {
    // upper floor: a window above every ground-floor opening that is not a shop
    for (const op of b.openings) if (op.kind !== "shopfront") opening(ctx, b, { ...op, kind: op.kind === "door" ? "louvre" : op.kind, width: op.kind === "door" ? 1.2 : op.width }, b.h / 2);
  }

  if (b.storeys === 2) {
    // floor band of a storey building
    ctx.fillStyle = shade(b.wall, -0.18);
    ctx.fillRect(0, b.d - b.h * K * 0.52, b.w, 0.12);
  }

  if (b.notice) label(ctx, b.notice, b.w / 2, b.d - b.h * K * 0.82, 0.24, alpha(PAL.paintRed, 0.85), 900);
  if (b.sign) {
    rrect(ctx, b.w * 0.1, b.d - b.h * K - 0.05, b.w * 0.8, 0.55, 0.03);
    ctx.fillStyle = b.sign.bg;
    ctx.fill();
    ctx.strokeStyle = shade(b.sign.bg, -0.4);
    ctx.lineWidth = 0.03;
    ctx.stroke();
    label(ctx, b.sign.text, b.w / 2, b.d - b.h * K + 0.22, 0.3, b.sign.fg, 900);
  }

  // roof
  const zy = -roofBase * K; // screen offset of the wall plate
  const ry = -(roofBase + rise) * K;
  const x0 = -o;
  const x1 = b.w + o;
  const y0 = -o * G;
  const y1 = b.d + o * G;
  const roofCol = mixRust(b.rust);
  if (b.roof === "flat") {
    rrect(ctx, x0 + o * 0.6, y0 + o * 0.6 + zy, b.w + o * 0.8, b.d + o * 0.8, 0.05);
    ctx.fillStyle = "#a59f93";
    ctx.fill();
    ctx.strokeStyle = "#6f6a61";
    ctx.lineWidth = 0.04;
    ctx.stroke();
    // parapet + stains
    ctx.fillStyle = "rgba(60,50,40,0.18)";
    ctx.fillRect(x0 + o, y0 + o + zy + 0.3, b.w * 0.5, b.d * 0.4);
  } else if (b.roof === "shed") {
    // single slope falling toward the front
    roofSheet(ctx, [x0, y0 + ry, x1, y0 + ry, x1, y1 + zy, x0, y1 + zy], roofCol, "v", b.rust, b.seed, 0);
  } else {
    const ridgeY = b.d / 2 + ry;
    const inset = b.roof === "hip" ? Math.min(worldD / 2, b.w / 2.2) : 0;
    // back slope
    roofSheet(ctx, [x0, y0 + zy, x1, y0 + zy, x1 - inset, ridgeY, x0 + inset, ridgeY], roofCol, "v", b.rust, b.seed + 1, 0.1);
    if (b.roof === "hip") {
      roofSheet(ctx, [x0, y0 + zy, x0 + inset, ridgeY, x0, y1 + zy], roofCol, "h", b.rust, b.seed + 2, 0.16);
      roofSheet(ctx, [x1, y0 + zy, x1 - inset, ridgeY, x1, y1 + zy], roofCol, "h", b.rust, b.seed + 3, -0.18);
    } else {
      // gable end walls show as triangles on the sides
      poly(ctx, [0, zy, 0, ridgeY, 0, b.d + zy]);
    }
    // front slope
    roofSheet(ctx, [x0 + inset, ridgeY, x1 - inset, ridgeY, x1, y1 + zy, x0, y1 + zy], roofCol, "v", b.rust, b.seed + 4, -0.04);
    // ridge cap
    line(ctx, x0 + inset, ridgeY, x1 - inset, ridgeY, shade(roofCol, -0.35), 0.09);
  }
  // fascia board under the front eave
  if (b.roof !== "flat") {
    ctx.fillStyle = PAL.fascia;
    ctx.fillRect(x0, y1 + zy, x1 - x0, 0.14);
  }

  if (b.dish) {
    oval(ctx, b.w * 0.75, b.d * 0.3 + ry + 0.2, 0.32, 0.26);
    ctx.fillStyle = "#d9d8d2";
    ctx.fill();
    ctx.strokeStyle = "#8d8c86";
    ctx.lineWidth = 0.02;
    ctx.stroke();
    line(ctx, b.w * 0.75, b.d * 0.3 + ry + 0.2, b.w * 0.75 + 0.25, b.d * 0.3 + ry + 0.05, "#55544f", 0.025);
  }
}

/** Zinc colour for a rust level 0..1. */
function mixRust(rust: number): string {
  return mixHex(PAL.zinc, PAL.rust[1], Math.max(0, Math.min(1, rust)));
}

// ---------------------------------------------------------------- landmarks

/**
 * A colonial civic hall (Mapo Hall): white walls, tall shuttered windows, a
 * columned portico with a pediment, wide steps. Origin NW corner of the
 * main block; the portico projects forward of the front wall.
 */
export function drawCivicHall(ctx: Ctx, opts: { w: number; d: number; h: number; name: string; seed: number }) {
  const { w, d, h, name, seed } = opts;
  drawBuilding(ctx, {
    w, d, h, roof: "hip", rise: 2.4, wall: "#efeae0", wallKind: "plaster", rust: 0.35, seed, storeys: 2,
    openings: Array.from({ length: Math.floor(w / 2.4) }, (_, i) => ({ x: 0.9 + i * 2.4, kind: "shutter" as const, width: 1.1 })),
  });
  const D = d * G;
  const pw = w * 0.36;
  const px = (w - pw) / 2;
  const front = D + 2.2 * G; // portico projects 2.2 m
  const colH = h * 0.86 * K;
  // steps
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = shade("#d9d4c8", -i * 0.04);
    ctx.fillRect(px - 0.6 - i * 0.3, front + i * 0.14, pw + 1.2 + i * 0.6, 0.16);
  }
  // portico floor and back shadow
  ctx.fillStyle = "#cfc9bc";
  ctx.fillRect(px, D, pw, front - D);
  // columns
  const n = 6;
  for (let i = 0; i < n; i++) {
    const cx = px + 0.3 + (i * (pw - 0.6)) / (n - 1);
    const g = ctx.createLinearGradient(cx - 0.22, 0, cx + 0.22, 0);
    g.addColorStop(0, "#fbf8f1");
    g.addColorStop(0.6, "#e3ddd0");
    g.addColorStop(1, "#bdb6a8");
    ctx.fillStyle = g;
    ctx.fillRect(cx - 0.22, front - colH, 0.44, colH);
    ctx.fillStyle = "#e9e4d9";
    ctx.fillRect(cx - 0.3, front - colH - 0.1, 0.6, 0.12);
    ctx.fillRect(cx - 0.3, front - 0.12, 0.6, 0.12);
  }
  // entablature + pediment
  const top = front - colH - 0.1;
  ctx.fillStyle = "#f3efe6";
  ctx.fillRect(px - 0.3, top - 0.55, pw + 0.6, 0.55);
  label(ctx, name, px + pw / 2, top - 0.28, 0.32, "#5a4330", 900);
  poly(ctx, [px - 0.4, top - 0.55, px + pw / 2, top - 0.55 - 1.6, px + pw + 0.4, top - 0.55]);
  ctx.fillStyle = "#f6f2ea";
  ctx.fill();
  ctx.strokeStyle = "#bdb6a8";
  ctx.lineWidth = 0.05;
  ctx.stroke();
  oval(ctx, px + pw / 2, top - 1.05, 0.32, 0.32); // crest roundel
  ctx.fillStyle = "#1f6b4a";
  ctx.fill();
}

/** A campus gate: two pillars, a beam with the name, a security post. Origin = centre of the gateway on the ground. */
export function drawGateArch(ctx: Ctx, text: string, span = 9) {
  const h = 6.2 * K;
  for (const x of [-span / 2 - 0.9, span / 2]) {
    ctx.fillStyle = "#c9c1b1";
    ctx.fillRect(x, -h, 0.9, h);
    ctx.fillStyle = "#b0a796";
    ctx.fillRect(x + 0.6, -h, 0.3, h);
    ctx.fillStyle = "rgba(25,12,6,0.22)";
    ctx.fillRect(x + 0.9, -0.1, 1.2, 0.35);
  }
  ctx.fillStyle = "#1f3d6b";
  ctx.fillRect(-span / 2 - 1.2, -h - 1.1, span + 2.4, 1.1);
  ctx.strokeStyle = "#c9a24a";
  ctx.lineWidth = 0.08;
  ctx.strokeRect(-span / 2 - 1.2, -h - 1.1, span + 2.4, 1.1);
  label(ctx, text, 0, -h - 0.55, 0.55, "#f3efe4", 900);
  // the boom barrier, raised
  line(ctx, span / 2 - 0.2, -1.0 * K, span / 2 - 1.4, -4.2 * K, "#d23b2a", 0.12);
  line(ctx, span / 2 - 0.5, -1.7 * K, span / 2 - 0.9, -2.9 * K, "#f2efe6", 0.12);
}

// ---------------------------------------------------------------- fences + gates

export interface FenceSpec {
  /** fence runs along x from x0 to x1 at ground y */
  x0: number;
  x1: number;
  y: number;
  h: number;
  /** `open`: leaves swung back against the wall, so you see through the gateway */
  gate?: { x: number; w: number; color: string; open?: boolean };
  glassTop?: boolean;
  wall: string;
  seed: number;
}

export function drawFence(ctx: Ctx, f: FenceSpec) {
  const fy = f.y * G;
  const top = fy - f.h * K;
  const segs: [number, number][] = f.gate ? [[f.x0, f.gate.x], [f.gate.x + f.gate.w, f.x1]] : [[f.x0, f.x1]];
  for (const [a, b] of segs) {
    if (b <= a) continue;
    // coping on top (seen from above), then the face
    ctx.fillStyle = shade(f.wall, 0.15);
    ctx.fillRect(a, top - 0.2 * G, b - a, 0.2 * G);
    ctx.fillStyle = f.wall;
    ctx.fillRect(a, top, b - a, f.h * K);
    const g = ctx.createLinearGradient(0, fy - 0.6 * K, 0, fy);
    g.addColorStop(0, "rgba(140,72,44,0)");
    g.addColorStop(1, "rgba(140,72,44,0.6)");
    ctx.fillStyle = g;
    ctx.fillRect(a, fy - 0.6 * K, b - a, 0.6 * K);
    // pillars every 3 m
    for (let x = a; x <= b; x += 3) {
      ctx.fillStyle = shade(f.wall, -0.1);
      ctx.fillRect(x - 0.12, top - 0.25, 0.24, f.h * K + 0.25);
    }
    if (f.glassTop) {
      const r = rng(f.seed);
      for (let x = a; x < b; x += 0.09) {
        poly(ctx, [x, top - 0.18, x + 0.03, top - 0.18 - 0.05 - r() * 0.08, x + 0.06, top - 0.18]);
        ctx.fillStyle = r() < 0.5 ? "rgba(120,170,140,0.9)" : "rgba(160,120,70,0.9)";
        ctx.fill();
      }
    }
    ctx.strokeStyle = shade(f.wall, -0.45);
    ctx.lineWidth = 0.02;
    ctx.strokeRect(a, top, b - a, f.h * K);
  }
  if (f.gate?.open) {
    // two leaves folded back, seen edge-on at either side of the gateway
    const { x, w, color } = f.gate;
    for (const lx of [x, x + w - 0.5]) {
      ctx.fillStyle = color;
      ctx.fillRect(lx, top - 0.1, 0.5, f.h * K + 0.1);
      for (let i = 1; i < 4; i++) line(ctx, lx + i * 0.12, top - 0.1, lx + i * 0.12, fy, shade(color, -0.25), 0.015);
      ctx.strokeStyle = shade(color, -0.5);
      ctx.lineWidth = 0.02;
      ctx.strokeRect(lx, top - 0.1, 0.5, f.h * K + 0.1);
    }
    // gate posts
    for (const px of [x - 0.15, x + w - 0.05]) {
      ctx.fillStyle = shade(f.wall, -0.15);
      ctx.fillRect(px, top - 0.3, 0.2, f.h * K + 0.3);
    }
  } else if (f.gate) {
    const { x, w, color } = f.gate;
    ctx.fillStyle = color;
    ctx.fillRect(x, top - 0.1, w, f.h * K + 0.1);
    for (let i = 1; i < w / 0.12; i++) line(ctx, x + i * 0.12, top - 0.1, x + i * 0.12, fy, shade(color, -0.25), 0.015);
    line(ctx, x + w / 2, top - 0.1, x + w / 2, fy, shade(color, -0.5), 0.03);
    // spikes on top of the gate
    for (let i = 0; i < w / 0.15; i++) poly(ctx, [x + i * 0.15, top - 0.1, x + i * 0.15 + 0.075, top - 0.28, x + i * 0.15 + 0.15, top - 0.1]);
    ctx.fillStyle = shade(color, -0.3);
    ctx.fill();
  }
}

// ---------------------------------------------------------------- little structures

/** Steel container kiosk (recharge cards, provisions). Origin NW corner, 2.4 × 1.4 m. */
export function drawKiosk(ctx: Ctx, color: string, text: string, seed: number) {
  drawBuilding(ctx, {
    w: 2.4, d: 1.4, h: 2.2, roof: "shed", rise: 0.15, wall: color, wallKind: "plaster", rust: 0.55, seed,
    openings: [{ x: 0.3, kind: "shopfront", width: 1.8 }],
  });
  rrect(ctx, 0.15, 1.4 * G - 2.2 * K - 0.02, 2.1, 0.32, 0.02);
  ctx.fillStyle = "#f0c32e";
  ctx.fill();
  label(ctx, text, 1.2, 1.4 * G - 2.2 * K + 0.14, 0.2, "#1d1b19", 900);
}

/** Black plastic water tank on a steel stand. Origin is the stand's centre on the ground. */
export function drawWaterTank(ctx: Ctx) {
  const standH = 2.4;
  for (const [x, y] of [[-0.6, -0.5], [0.6, -0.5], [-0.6, 0.5], [0.6, 0.5]]) line(ctx, x, y * G, x, y * G - standH * K, "#3a3835", 0.06);
  line(ctx, -0.6, 0.5 - standH * K * 0.5, 0.6, 0.5 - standH * K * 0.5, "#3a3835", 0.04);
  const top = -(standH + 1.4) * K;
  rrect(ctx, -0.75, top, 1.5, 1.4 * K + 0.2, 0.25);
  const g = ctx.createLinearGradient(-0.75, 0, 0.75, 0);
  g.addColorStop(0, "#3c3c3a");
  g.addColorStop(0.35, "#232322");
  g.addColorStop(1, "#141413");
  ctx.fillStyle = g;
  ctx.fill();
  for (let i = 1; i < 5; i++) line(ctx, -0.75, top + i * 0.25, 0.75, top + i * 0.25, "rgba(255,255,255,0.05)", 0.03);
  oval(ctx, 0, top, 0.75, 0.75 * G);
  ctx.fillStyle = "#2e2e2c";
  ctx.fill();
  oval(ctx, 0, top, 0.25, 0.14);
  ctx.fillStyle = "#1a1a19";
  ctx.fill();
}

/** Small petrol generator ("I better pass my neighbour"). Origin centre on the ground. */
export function drawGenerator(ctx: Ctx, running = false, t = 0) {
  ctx.fillStyle = "rgba(25,12,6,0.25)";
  ctx.fillRect(-0.3, -0.05, 0.75, 0.25);
  rrect(ctx, -0.35, -0.55 * K, 0.7, 0.55 * K, 0.04);
  ctx.fillStyle = "#c2271c";
  ctx.fill();
  rrect(ctx, -0.35, -0.55 * K - 0.32, 0.7, 0.34, 0.06);
  ctx.fillStyle = "#d8352a";
  ctx.fill();
  ctx.strokeStyle = "#1c1a19";
  ctx.lineWidth = 0.03;
  ctx.strokeRect(-0.36, -0.58 * K, 0.72, 0.58 * K);
  rrect(ctx, -0.22, -0.35 * K, 0.3, 0.2, 0.03);
  ctx.fillStyle = "#2b2a28";
  ctx.fill();
  if (running) {
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.8 + i / 3) % 1;
      oval(ctx, 0.3 + k * 0.2, -0.6 - k * 0.8, 0.08 + k * 0.15, 0.06 + k * 0.1);
      ctx.fillStyle = `rgba(90,90,90,${0.35 * (1 - k)})`;
      ctx.fill();
    }
  }
}
