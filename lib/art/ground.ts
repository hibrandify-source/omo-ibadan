// Omo Ibadan art kit — ground, roads and street furniture.
//
// Ground is drawn flat (no height), in world metres; the public functions
// squash it by the camera tilt G. Roads here run along x.

import { G, K, alpha, clipped, groundShadow, label, line, oval, poly, rng, rrect, shade, type Ctx } from "./core";
import { PAL } from "./palette";

/** Run `draw` with ground y squashed by the camera tilt. */
function flat(ctx: Ctx, draw: () => void) {
  ctx.save();
  ctx.scale(1, G);
  draw();
  ctx.restore();
}

/** Bare laterite with scattered weeds and footpath wear. */
export function drawLaterite(ctx: Ctx, x: number, y: number, w: number, h: number, seed: number, grassy = 0.25) {
  flat(ctx, () => lateriteFlat(ctx, x, y, w, h, seed, grassy));
}

function lateriteFlat(ctx: Ctx, x: number, y: number, w: number, h: number, seed: number, grassy = 0.25) {
  const r = rng(seed);
  ctx.fillStyle = PAL.laterite;
  ctx.fillRect(x, y, w, h);
  // broad, faint tone shifts (damp vs dry earth)
  for (let i = 0; i < (w * h) / 40; i++) {
    oval(ctx, x + r() * w, y + r() * h, 2 + r() * 4, 1 + r() * 2);
    ctx.fillStyle = alpha(r() < 0.5 ? PAL.lateriteDark : PAL.lateriteDust, 0.08);
    ctx.fill();
  }
  // fine grain
  for (let i = 0; i < w * h * 2.5; i++) {
    ctx.fillStyle = alpha(r() < 0.5 ? PAL.lateriteDark : PAL.lateriteDust, 0.22);
    ctx.fillRect(x + r() * w, y + r() * h, 0.05 + r() * 0.08, 0.03 + r() * 0.04);
  }
  for (let i = 0; i < (w * h) * grassy; i++) {
    const gx = x + r() * w;
    const gy = y + r() * h;
    for (let j = 0; j < 5; j++) line(ctx, gx, gy, gx + (r() - 0.5) * 0.2, gy - 0.1 - r() * 0.12, r() < 0.5 ? PAL.weed : PAL.grassDry, 0.025);
  }
  // pebbles
  for (let i = 0; i < (w * h) / 1.5; i++) {
    oval(ctx, x + r() * w, y + r() * h, 0.03, 0.02);
    ctx.fillStyle = alpha("#d9b38f", 0.6);
    ctx.fill();
  }
}

export interface RoadSpec {
  x0: number;
  x1: number;
  /** centre line y */
  y: number;
  /** carriageway width (m); two lanes ≈ 7 m */
  width: number;
  /** 0 smooth … 1 Ibadan after rainy season */
  wear: number;
  seed: number;
  /** fraction of the centre dashes still visible */
  markings: number;
  gutters: boolean;
  /** slab crossings over the gutter (x positions) on the south side */
  crossings?: number[];
}

/** Tarred carriageway with worn edges, patches, cracks and open gutters. */
export function drawRoad(ctx: Ctx, s: RoadSpec) {
  flat(ctx, () => roadFlat(ctx, s));
}

function roadFlat(ctx: Ctx, s: RoadSpec) {
  const r = rng(s.seed);
  const top = s.y - s.width / 2;
  const bot = s.y + s.width / 2;
  const len = s.x1 - s.x0;

  // laterite shoulders with tyre ruts
  lateriteFlat(ctx, s.x0, top - 1.6, len, 1.6, s.seed + 11, 0.05);
  lateriteFlat(ctx, s.x0, bot, len, 1.6, s.seed + 12, 0.05);

  // asphalt with a ragged edge
  ctx.beginPath();
  ctx.moveTo(s.x0, top);
  for (let x = s.x0; x <= s.x1; x += 0.6) ctx.lineTo(x, top + (r() - 0.3) * 0.18 * s.wear);
  ctx.lineTo(s.x1, bot);
  for (let x = s.x1; x >= s.x0; x -= 0.6) ctx.lineTo(x, bot + (r() - 0.7) * 0.18 * s.wear);
  ctx.closePath();
  clipped(ctx, () => {
    ctx.fillStyle = PAL.asphalt;
    ctx.fillRect(s.x0, top - 1, len, s.width + 2);
    // polished wheel tracks
    for (const lane of [-1, 1]) {
      for (const off of [-0.8, 0.8]) {
        ctx.fillStyle = alpha(PAL.asphaltWorn, 0.55);
        ctx.fillRect(s.x0, s.y + lane * s.width * 0.25 + off - 0.25, len, 0.5);
      }
    }
    // dust blown on from the shoulders
    for (const edge of [top, bot]) {
      const g = ctx.createLinearGradient(0, edge, 0, edge + (edge === top ? 0.9 : -0.9));
      g.addColorStop(0, alpha(PAL.lateriteDust, 0.55));
      g.addColorStop(1, alpha(PAL.lateriteDust, 0));
      ctx.fillStyle = g;
      ctx.fillRect(s.x0, Math.min(edge, edge + (edge === top ? 0.9 : -0.9)), len, 0.9);
    }
    // patches (squarish, darker)
    for (let i = 0; i < len * 0.05 * (0.5 + s.wear); i++) {
      const px = s.x0 + r() * len;
      const py = top + r() * s.width;
      ctx.fillStyle = alpha(PAL.asphaltPatch, 0.85);
      ctx.fillRect(px, py, 0.8 + r() * 1.8, 0.6 + r() * 1.2);
    }
    // cracks
    for (let i = 0; i < len * 0.15 * s.wear; i++) {
      let cx = s.x0 + r() * len;
      let cy = top + r() * s.width;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      for (let k = 0; k < 5; k++) {
        cx += (r() - 0.5) * 0.7;
        cy += (r() - 0.5) * 0.4;
        ctx.lineTo(cx, cy);
      }
      ctx.strokeStyle = alpha(PAL.asphaltCrack, 0.7);
      ctx.lineWidth = 0.03;
      ctx.stroke();
    }
    // faded centre dashes
    for (let x = s.x0 + 1; x < s.x1; x += 6) {
      if (r() > s.markings) continue;
      ctx.fillStyle = alpha(PAL.laneWhite, 0.25 + r() * 0.35);
      ctx.fillRect(x, s.y - 0.06, 3, 0.12);
    }
  });

  if (s.gutters) {
    gutterFlat(ctx, s.x0, s.x1, top - 1.0, s.seed + 21, []);
    gutterFlat(ctx, s.x0, s.x1, bot + 0.4, s.seed + 22, s.crossings ?? []);
  }
}

/** Open concrete drain, 0.6 m wide, with litter in the water. */
export function drawGutter(ctx: Ctx, x0: number, x1: number, y: number, seed: number, crossings: number[]) {
  flat(ctx, () => gutterFlat(ctx, x0, x1, y, seed, crossings));
}

function gutterFlat(ctx: Ctx, x0: number, x1: number, y: number, seed: number, crossings: number[]) {
  const r = rng(seed);
  const w = 0.6;
  // concrete lips either side
  ctx.fillStyle = PAL.concrete;
  ctx.fillRect(x0, y - 0.12, x1 - x0, 0.12);
  ctx.fillRect(x0, y + w, x1 - x0, 0.12);
  // the channel: far wall lit, near wall in shadow, murky water at the bottom
  ctx.fillStyle = shade(PAL.concreteDark, -0.05);
  ctx.fillRect(x0, y, x1 - x0, w * 0.4);
  ctx.fillStyle = PAL.gutterWater;
  ctx.fillRect(x0, y + w * 0.4, x1 - x0, w * 0.6);
  const g = ctx.createLinearGradient(0, y + w * 0.4, 0, y + w);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = g;
  ctx.fillRect(x0, y + w * 0.4, x1 - x0, w * 0.6);
  // litter collects in clumps, not evenly
  for (let x = x0; x < x1; x += 2 + r() * 5) {
    const n = 2 + Math.floor(r() * 6);
    for (let i = 0; i < n; i++) {
      rrect(ctx, x + r() * 0.8, y + w * 0.45 + r() * w * 0.4, 0.1 + r() * 0.1, 0.06, 0.02);
      ctx.fillStyle = r() < 0.6 ? "rgba(225,230,232,0.75)" : r() < 0.5 ? "rgba(40,40,40,0.75)" : "rgba(60,110,170,0.7)";
      ctx.fill();
    }
  }
  for (let x = x0; x < x1; x += 1.0) line(ctx, x, y - 0.12, x, y, alpha(PAL.concreteDark, 0.6), 0.02);
  for (const cx of crossings) {
    // concrete slab bridging the drain at a gate or shop
    ctx.fillStyle = shade(PAL.concrete, 0.08);
    ctx.fillRect(cx, y - 0.15, 1.4, w + 0.3);
    ctx.strokeStyle = PAL.concreteDark;
    ctx.lineWidth = 0.03;
    ctx.strokeRect(cx, y - 0.15, 1.4, w + 0.3);
  }
}

/** Interlocking paving stones, the rich compound's floor. */
export function drawPaving(ctx: Ctx, x: number, y: number, w: number, h: number, seed: number) {
  flat(ctx, () => {
    const r = rng(seed);
    ctx.fillStyle = "#9d958a";
    ctx.fillRect(x, y, w, h);
    for (let row = 0, yy = y; yy < y + h; yy += 0.22, row++) {
      for (let xx = x + (row % 2 ? 0.11 : 0); xx < x + w; xx += 0.22) {
        ctx.fillStyle = r() < 0.15 ? "#8a8278" : r() < 0.5 ? "#a8a094" : "#b1a99c";
        ctx.fillRect(xx + 0.015, yy + 0.015, 0.19, 0.19);
      }
    }
    ctx.strokeStyle = "#7d766c";
    ctx.lineWidth = 0.08;
    ctx.strokeRect(x, y, w, h);
  });
}

/** Mown lawn (carpet grass), slightly patchy. */
export function drawLawn(ctx: Ctx, x: number, y: number, w: number, h: number, seed: number) {
  flat(ctx, () => {
    const r = rng(seed);
    ctx.fillStyle = "#6f8f3e";
    ctx.fillRect(x, y, w, h);
    for (let i = 0; i < w * h * 1.5; i++) {
      ctx.fillStyle = r() < 0.5 ? "rgba(140,170,80,0.35)" : "rgba(70,95,40,0.35)";
      ctx.fillRect(x + r() * w, y + r() * h, 0.08, 0.05);
    }
    for (let i = 0; i < (w * h) / 30; i++) {
      oval(ctx, x + r() * w, y + r() * h, 0.6 + r(), 0.3 + r() * 0.5);
      ctx.fillStyle = "rgba(170,150,80,0.25)"; // dry patches
      ctx.fill();
    }
  });
}

/** Faded yellow-and-black speed bump across a road at x. */
export function drawSpeedBump(ctx: Ctx, x: number, y0: number, y1: number) {
  flat(ctx, () => {
    ctx.fillStyle = "#4a4743";
    ctx.fillRect(x, y0, 0.6, y1 - y0);
    for (let y = y0; y < y1; y += 0.5) {
      ctx.fillStyle = alpha(PAL.kerbYellow, 0.55);
      ctx.fillRect(x, y, 0.6, 0.25);
    }
  });
}

// ---------------------------------------------------------------- vegetation

/** Broad shade tree (mango/neem). Origin is the trunk base. */
export function drawTree(ctx: Ctx, size: number, seed: number) {
  const r = rng(seed);
  groundShadow(ctx, size * 0.4, 0.2, size * 1.1, size * 0.55, 0.3);
  rrect(ctx, -0.15, -2.2 * K, 0.3, 2.2 * K, 0.08);
  ctx.fillStyle = PAL.trunk;
  ctx.fill();
  const cy = -(2.2 + size * 0.7) * K;
  for (let i = 0; i < 16; i++) {
    const a = r() * Math.PI * 2;
    const d = r() * size * 0.65;
    oval(ctx, Math.cos(a) * d, cy + Math.sin(a) * d * 0.7, size * (0.38 + r() * 0.25), size * (0.32 + r() * 0.2));
    ctx.fillStyle = [PAL.treeDark, PAL.tree, PAL.treeLight][i < 5 ? 0 : i < 12 ? 1 : 2];
    ctx.fill();
  }
  // sunlit highlights upper left
  for (let i = 0; i < 6; i++) {
    oval(ctx, -size * 0.35 + r() * size * 0.4, cy - size * 0.35 + r() * size * 0.3, size * 0.18, size * 0.13);
    ctx.fillStyle = alpha("#8db15a", 0.45);
    ctx.fill();
  }
}

/** Oil palm. Origin is the trunk base. */
export function drawPalm(ctx: Ctx, height: number, seed: number) {
  const r = rng(seed);
  const topY = -height * K;
  groundShadow(ctx, 1.2, 0.2, 1.6, 0.5, 0.2);
  ctx.beginPath();
  ctx.moveTo(-0.18, 0);
  ctx.quadraticCurveTo(0.2, topY * 0.5, 0.05, topY);
  ctx.lineTo(0.25, topY);
  ctx.quadraticCurveTo(0.35, topY * 0.5, 0.18, 0);
  ctx.closePath();
  ctx.fillStyle = PAL.trunk;
  ctx.fill();
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + r() * 0.2;
    const L = 1.6 + r() * 0.8;
    const ex = 0.15 + Math.cos(a) * L;
    const ey = topY + Math.sin(a) * L * 0.55 + 0.4;
    ctx.beginPath();
    ctx.moveTo(0.15, topY);
    ctx.quadraticCurveTo(0.15 + Math.cos(a) * L * 0.5, topY + Math.sin(a) * L * 0.3 - 0.3, ex, ey);
    ctx.strokeStyle = i % 2 ? PAL.palm : shade(PAL.palm, -0.2);
    ctx.lineWidth = 0.12;
    ctx.stroke();
    for (let k = 1; k < 6; k++) {
      const t = k / 6;
      const px = 0.15 + (ex - 0.15) * t;
      const py = topY + (ey - topY) * t - Math.sin(t * Math.PI) * 0.3;
      line(ctx, px, py, px + Math.cos(a + 1.3) * 0.3, py + Math.sin(a + 1.3) * 0.2, alpha(PAL.palm, 0.8), 0.04);
      line(ctx, px, py, px + Math.cos(a - 1.3) * 0.3, py + Math.sin(a - 1.3) * 0.2, alpha(PAL.palm, 0.8), 0.04);
    }
  }
  oval(ctx, 0.15, topY + 0.1, 0.25, 0.18);
  ctx.fillStyle = "#8a3b1b"; // palm fruit bunch
  ctx.fill();
}

// ---------------------------------------------------------------- street furniture

/** Wooden electricity pole with a crossarm. Returns the wire attachment point. */
export function drawPole(ctx: Ctx, height = 8.5, lean = 0.08): { x: number; y: number } {
  const tx = lean;
  const ty = -height * K;
  groundShadow(ctx, 0.6, 0.1, 0.7, 0.12, 0.2);
  line(ctx, 0, 0, tx, ty, "#5a4632", 0.18);
  line(ctx, tx - 0.7, ty + 0.3, tx + 0.7, ty + 0.3, "#4a3828", 0.1);
  for (const dx of [-0.6, 0, 0.6]) {
    oval(ctx, tx + dx, ty + 0.22, 0.05, 0.07);
    ctx.fillStyle = "#c9c6bd";
    ctx.fill();
  }
  return { x: tx, y: ty + 0.3 };
}

/** Sagging wires between two poles, plus a few illegal tap lines. */
export function drawWires(ctx: Ctx, a: { x: number; y: number }, b: { x: number; y: number }, sag = 0.8) {
  for (const dy of [-0.06, 0, 0.06]) {
    ctx.beginPath();
    ctx.moveTo(a.x - 0.6, a.y + dy);
    ctx.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 + sag + dy * 4, b.x - 0.6, b.y + dy);
    ctx.strokeStyle = "rgba(20,18,16,0.85)";
    ctx.lineWidth = 0.025;
    ctx.stroke();
  }
}

/** Big market umbrella, seen from above, over a table of produce. Origin = pole base. */
export function drawUmbrellaStall(ctx: Ctx, colors: [string, string], goods: "tomato" | "pepper" | "onion" | "provisions", seed: number) {
  const r = rng(seed);
  // table
  rrect(ctx, -0.8, -0.8 * K - 0.35, 1.6, 0.7, 0.04);
  ctx.fillStyle = PAL.wood;
  ctx.fill();
  line(ctx, -0.7, -0.8 * K + 0.3, -0.7, 0.3, PAL.woodDark, 0.05);
  line(ctx, 0.7, -0.8 * K + 0.3, 0.7, 0.3, PAL.woodDark, 0.05);
  // goods heaped in enamel bowls / baskets
  for (let i = 0; i < 4; i++) {
    const bx = -0.6 + i * 0.4;
    const by = -0.8 * K - 0.05;
    oval(ctx, bx, by, 0.16, 0.08);
    ctx.fillStyle = goods === "provisions" ? "#2f6fb5" : "#c9b07a";
    ctx.fill();
    for (let k = 0; k < 7; k++) {
      oval(ctx, bx + (r() - 0.5) * 0.2, by - 0.04 - r() * 0.08, 0.045, 0.04);
      ctx.fillStyle = goods === "tomato" ? "#c8261c" : goods === "pepper" ? (r() < 0.5 ? "#d8321f" : "#e9b22a") : goods === "onion" ? "#b7643f" : ["#f2efe6", "#e9c22c", "#d23b2a"][k % 3];
      ctx.fill();
    }
  }
  // umbrella canopy (8 alternating panels)
  const cy = -2.3 * K;
  line(ctx, 0, 0, 0, cy, "#3a3633", 0.04);
  groundShadow(ctx, 0.5, 0.1, 1.4, 0.7, 0.18);
  for (let i = 0; i < 8; i++) {
    const a0 = (i / 8) * Math.PI * 2;
    const a1 = ((i + 1) / 8) * Math.PI * 2;
    poly(ctx, [0, cy - 0.3, Math.cos(a0) * 1.3, cy + Math.sin(a0) * 1.3 * G, Math.cos(a1) * 1.3, cy + Math.sin(a1) * 1.3 * G]);
    ctx.fillStyle = shade(colors[i % 2], Math.sin(a0 + 0.4) * -0.12);
    ctx.fill();
  }
  oval(ctx, 0, cy - 0.3, 0.06, 0.05);
  ctx.fillStyle = "#2a2826";
  ctx.fill();
}

/** Wooden bench. Origin centre on the ground. */
export function drawBench(ctx: Ctx, w = 1.6) {
  rrect(ctx, -w / 2, -0.45 * K - 0.12, w, 0.28, 0.03);
  ctx.fillStyle = shade(PAL.wood, 0.12);
  ctx.fill();
  for (const x of [-w / 2 + 0.1, w / 2 - 0.1]) line(ctx, x, -0.45 * K + 0.1, x, 0.05, PAL.woodDark, 0.06);
}

/** Painted roadside signboard on two legs. */
export function drawSignboard(ctx: Ctx, text: string, bg: string, fg: string, w = 2.2) {
  for (const x of [-w / 2 + 0.2, w / 2 - 0.2]) line(ctx, x, 0, x, -2.4 * K, "#3f3a35", 0.06);
  rrect(ctx, -w / 2, -2.6 * K, w, 0.9 * K, 0.03);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = shade(bg, -0.4);
  ctx.lineWidth = 0.03;
  ctx.stroke();
  // sun-faded at the top
  ctx.fillStyle = "rgba(255,245,225,0.15)";
  ctx.fillRect(-w / 2, -2.6 * K, w, 0.25);
  label(ctx, text, 0, -2.6 * K + 0.45 * K, 0.26, fg, 900);
}
