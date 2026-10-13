// Omo Ibadan art kit — people.
//
// A person is built from layers (body, clothes, hair, headwear, what they
// carry) at real proportions: an adult is ~1.7 m with a head about 1/7.5 of
// their height. Origin is the ground point between the feet.

import { K, alpha, clipped, groundShadow, line, oval, rrect, shade, type Ctx, type Dir } from "./core";
import { PAL } from "./palette";

export type Motif = "plain" | "wax" | "diamond" | "stripe" | "dots" | "asooke";
export interface Fabric {
  base: string;
  a: string;
  b: string;
  motif: Motif;
}

export type Outfit =
  | { kind: "buba-sokoto"; top: Fabric; bottom: Fabric }
  | { kind: "agbada"; robe: Fabric; under: Fabric }
  | { kind: "tee-jeans"; tee: string; jeans: string }
  | { kind: "shirt-trousers"; shirt: string; trousers: string }
  | { kind: "iro-buba"; buba: Fabric; iro: Fabric }
  | { kind: "gown"; dress: Fabric }
  | { kind: "school"; shirt: string; bottom: string; skirt: boolean }
  | { kind: "okada"; vest: string; shirt: string; trousers: string }
  | { kind: "suit"; jacket: string; shirt: string; tie: string; trousers: string };

export type Hair = "lowcut" | "bald" | "braids" | "afro" | "cornrows" | "grey";
export type Headwear = null | { kind: "gele" | "fila" | "headtie" | "cap"; fabric: Fabric };
export type Carry = null | "basin" | "tray-bread" | "baby" | "bag";

export interface PersonSpec {
  skin: string;
  /** standing height in metres */
  height: number;
  /** 0.85 slim … 1.3 heavy */
  build: number;
  age: "child" | "adult" | "elder";
  hair: Hair;
  headwear: Headwear;
  outfit: Outfit;
  shoes: string;
  carry: Carry;
}

export type Pose = "stand" | "walk" | "sit";

// ---------------------------------------------------------------- fabrics

/** Fill the current path with a fabric. Pattern is anchored to the person. */
export function paintFabric(ctx: Ctx, f: Fabric, x: number, y: number, w: number, h: number) {
  clipped(ctx, () => {
    ctx.fillStyle = f.base;
    ctx.fillRect(x, y, w, h);
    const step = 0.075;
    if (f.motif === "plain") return;
    if (f.motif === "asooke") {
      for (let yy = y; yy < y + h; yy += 0.05) {
        ctx.fillStyle = f.a;
        ctx.fillRect(x, yy, w, 0.012);
        ctx.fillStyle = alpha(f.b, 0.8);
        ctx.fillRect(x, yy + 0.022, w, 0.006);
      }
      return;
    }
    if (f.motif === "stripe") {
      ctx.strokeStyle = f.a;
      ctx.lineWidth = 0.018;
      for (let i = -h; i < w + h; i += 0.06) line(ctx, x + i, y, x + i + h, y + h, f.a, 0.018);
      return;
    }
    let row = 0;
    for (let yy = y; yy < y + h + step; yy += step, row++) {
      for (let xx = x + (row % 2 ? step / 2 : 0); xx < x + w + step; xx += step) {
        if (f.motif === "wax") {
          oval(ctx, xx, yy, 0.026, 0.026);
          ctx.fillStyle = f.a;
          ctx.fill();
          oval(ctx, xx, yy, 0.01, 0.01);
          ctx.fillStyle = f.b;
          ctx.fill();
        } else if (f.motif === "diamond") {
          ctx.beginPath();
          ctx.moveTo(xx, yy - 0.03);
          ctx.lineTo(xx + 0.022, yy);
          ctx.lineTo(xx, yy + 0.03);
          ctx.lineTo(xx - 0.022, yy);
          ctx.closePath();
          ctx.fillStyle = f.a;
          ctx.fill();
          oval(ctx, xx, yy, 0.007, 0.007);
          ctx.fillStyle = f.b;
          ctx.fill();
        } else {
          oval(ctx, xx, yy, 0.012, 0.012);
          ctx.fillStyle = row % 2 ? f.a : f.b;
          ctx.fill();
        }
      }
    }
  });
}

const plain = (c: string): Fabric => ({ base: c, a: c, b: c, motif: "plain" });

/** Darken the right-hand side of the current path (sun from the left). */
function sideShade(ctx: Ctx, cx: number, top: number, w: number, h: number, a = 0.16) {
  clipped(ctx, () => {
    const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
    g.addColorStop(0, "rgba(255,240,220,0.06)");
    g.addColorStop(0.55, "rgba(0,0,0,0)");
    g.addColorStop(1, `rgba(20,10,5,${a})`);
    ctx.fillStyle = g;
    ctx.fillRect(cx - w / 2, top, w, h);
  });
}

// ---------------------------------------------------------------- body plan

interface Body {
  head: number; // head height (m)
  headW: number;
  neck: number;
  torso: number;
  leg: number;
  shoulder: number;
  hip: number;
  // screen y of key points (standing)
  yHip: number;
  yShoulder: number;
  yNeckTop: number;
  headCy: number;
}

function bodyPlan(p: PersonSpec, seat = 0): Body {
  const H = p.height;
  const child = p.age === "child";
  const head = H * (child ? 0.165 : 0.13);
  const headW = head * 0.8;
  const neck = H * 0.035;
  const torso = H * (child ? 0.29 : 0.3);
  const leg = H - head - neck - torso;
  const shoulder = (child ? 0.29 : 0.41) * p.build;
  const hip = (child ? 0.23 : 0.31) * p.build;
  const hipZ = seat > 0 ? seat : leg;
  const yHip = -hipZ * K;
  const yShoulder = yHip - torso * K;
  const yNeckTop = yShoulder - neck * K;
  const headCy = yNeckTop - (head * K) / 2;
  return { head, headW, neck, torso, leg, shoulder, hip, yHip, yShoulder, yNeckTop, headCy };
}

function outline(c: string) {
  return shade(c, -0.45);
}

// ---------------------------------------------------------------- clothes

interface TopShape {
  fabric: Fabric;
  /** how far below the hip the top reaches (m of height) */
  drop: number;
  /** width at the bottom edge relative to hips */
  flare: number;
  sleeve: "short" | "long" | "wide" | "none";
  sleeveFabric?: Fabric;
}

function topFor(o: Outfit): TopShape {
  switch (o.kind) {
    case "buba-sokoto": return { fabric: o.top, drop: 0.2, flare: 1.25, sleeve: "long" };
    case "agbada": return { fabric: o.robe, drop: 0.5, flare: 2.6, sleeve: "wide" };
    case "tee-jeans": return { fabric: plain(o.tee), drop: 0.03, flare: 1.05, sleeve: "short" };
    case "shirt-trousers": return { fabric: plain(o.shirt), drop: 0.02, flare: 1.02, sleeve: "short" };
    case "iro-buba": return { fabric: o.buba, drop: 0.08, flare: 1.15, sleeve: "short" };
    case "gown": return { fabric: o.dress, drop: 0, flare: 1.1, sleeve: "short" };
    case "school": return { fabric: plain(o.shirt), drop: 0.0, flare: 1.02, sleeve: "short" };
    case "okada": return { fabric: plain(o.shirt), drop: 0.03, flare: 1.05, sleeve: "long" };
    case "suit": return { fabric: plain(o.jacket), drop: 0.1, flare: 1.08, sleeve: "long" };
  }
}

/** Lower body: trousers/shorts/wrapper colours for legs, or a skirt shape. */
function lowerFor(o: Outfit): { legs: Fabric | null; skirt: Fabric | null; skirtTo: "knee" | "ankle"; shinsBare: boolean } {
  switch (o.kind) {
    case "buba-sokoto": return { legs: o.bottom, skirt: null, skirtTo: "ankle", shinsBare: false };
    case "agbada": return { legs: o.under, skirt: null, skirtTo: "ankle", shinsBare: false };
    case "tee-jeans": return { legs: plain(o.jeans), skirt: null, skirtTo: "ankle", shinsBare: false };
    case "shirt-trousers": return { legs: plain(o.trousers), skirt: null, skirtTo: "ankle", shinsBare: false };
    case "iro-buba": return { legs: null, skirt: o.iro, skirtTo: "ankle", shinsBare: false };
    case "gown": return { legs: null, skirt: o.dress, skirtTo: "ankle", shinsBare: false };
    case "school": return o.skirt
      ? { legs: null, skirt: plain(o.bottom), skirtTo: "knee", shinsBare: true }
      : { legs: plain(o.bottom), skirt: null, skirtTo: "knee", shinsBare: true };
    case "okada": return { legs: plain(o.trousers), skirt: null, skirtTo: "ankle", shinsBare: false };
    case "suit": return { legs: plain(o.trousers), skirt: null, skirtTo: "ankle", shinsBare: false };
  }
}

// ---------------------------------------------------------------- head

function drawHead(ctx: Ctx, p: PersonSpec, b: Body, dir: Dir, lean = 0) {
  const hx = lean;
  const cy = b.headCy;
  const ry = (b.head * K) / 2;
  const rx = dir === "E" || dir === "W" ? b.headW * 0.56 : b.headW / 2;
  const skinO = outline(p.skin);

  // afro and braids sit partly behind the head
  if (p.hair === "afro" && !p.headwear) {
    oval(ctx, hx - (dir === "E" ? 0.02 : 0), cy - ry * 0.35, rx * 1.55, ry * 1.25);
    ctx.fillStyle = PAL.hair;
    ctx.fill();
  }
  if (p.hair === "braids" && !p.headwear && dir !== "E" && dir !== "W") {
    for (let i = -4; i <= 4; i++) {
      const sx = hx + (i / 4) * rx * 0.95;
      line(ctx, sx, cy - ry * 0.2, sx + i * 0.004, cy + ry * 2.1, PAL.hair, 0.018);
    }
  }

  // neck
  rrect(ctx, hx - b.headW * 0.2, b.yNeckTop - 0.01, b.headW * 0.4, b.neck * K + 0.03, 0.02);
  ctx.fillStyle = shade(p.skin, -0.12);
  ctx.fill();

  // head
  oval(ctx, hx, cy, rx, ry);
  ctx.fillStyle = p.skin;
  ctx.fill();
  ctx.strokeStyle = skinO;
  ctx.lineWidth = 0.008;
  ctx.stroke();
  sideShade(ctx, hx, cy - ry, rx * 2, ry * 2, 0.22);

  // ears (front/back)
  if (dir === "S" || dir === "N") {
    for (const s of [-1, 1]) {
      oval(ctx, hx + s * rx * 0.98, cy + ry * 0.05, rx * 0.16, ry * 0.2);
      ctx.fillStyle = shade(p.skin, -0.08);
      ctx.fill();
    }
  }

  // face
  if (dir === "S") {
    const ey = cy - ry * 0.02;
    for (const s of [-1, 1]) {
      oval(ctx, hx + s * rx * 0.38, ey, rx * 0.14, ry * 0.07);
      ctx.fillStyle = "#efe6da";
      ctx.fill();
      oval(ctx, hx + s * rx * 0.38, ey, rx * 0.08, ry * 0.07);
      ctx.fillStyle = "#1a1210";
      ctx.fill();
      line(ctx, hx + s * rx * 0.2, ey - ry * 0.17, hx + s * rx * 0.55, ey - ry * 0.2, shade(p.skin, -0.55), 0.008);
    }
    oval(ctx, hx, cy + ry * 0.22, rx * 0.16, ry * 0.08);
    ctx.fillStyle = shade(p.skin, -0.25);
    ctx.fill();
    line(ctx, hx - rx * 0.22, cy + ry * 0.45, hx + rx * 0.22, cy + ry * 0.45, shade(p.skin, -0.45), 0.009);
  } else if (dir === "E" || dir === "W") {
    // nose + eye in profile (drawn for E; W is mirrored by the caller)
    ctx.beginPath();
    ctx.moveTo(hx + rx * 0.92, cy - ry * 0.05);
    ctx.lineTo(hx + rx * 1.12, cy + ry * 0.2);
    ctx.lineTo(hx + rx * 0.9, cy + ry * 0.28);
    ctx.closePath();
    ctx.fillStyle = p.skin;
    ctx.fill();
    oval(ctx, hx + rx * 0.55, cy - ry * 0.02, rx * 0.08, ry * 0.06);
    ctx.fillStyle = "#1a1210";
    ctx.fill();
    oval(ctx, hx - rx * 0.1, cy + ry * 0.05, rx * 0.14, ry * 0.2);
    ctx.fillStyle = shade(p.skin, -0.12);
    ctx.fill();
  }

  // hair (top of the head)
  if (!p.headwear || p.headwear.kind === "cap") {
    const hairCol = p.hair === "grey" || p.age === "elder" ? PAL.hairGrey : PAL.hair;
    if (p.hair !== "bald") {
      ctx.save();
      oval(ctx, hx, cy, rx * 1.03, ry * 1.03);
      ctx.clip();
      const back = dir === "N";
      const side = dir === "E" || dir === "W";
      ctx.beginPath();
      if (back) {
        ctx.rect(hx - rx * 1.2, cy - ry * 1.2, rx * 2.4, ry * 1.9);
      } else if (side) {
        ctx.moveTo(hx - rx * 1.2, cy + ry * 0.6);
        ctx.lineTo(hx - rx * 1.2, cy - ry * 1.2);
        ctx.lineTo(hx + rx * 1.2, cy - ry * 1.2);
        ctx.lineTo(hx + rx * 0.7, cy - ry * 0.55);
        ctx.quadraticCurveTo(hx + rx * 0.05, cy - ry * 0.6, hx + rx * 0.05, cy + ry * 0.15);
        ctx.lineTo(hx - rx * 0.3, cy + ry * 0.6);
      } else {
        ctx.moveTo(hx - rx * 1.2, cy - ry * 0.05);
        ctx.quadraticCurveTo(hx - rx * 0.9, cy - ry * 0.55, hx, cy - ry * 0.62);
        ctx.quadraticCurveTo(hx + rx * 0.9, cy - ry * 0.55, hx + rx * 1.2, cy - ry * 0.05);
        ctx.lineTo(hx + rx * 1.2, cy - ry * 1.3);
        ctx.lineTo(hx - rx * 1.2, cy - ry * 1.3);
      }
      ctx.closePath();
      ctx.fillStyle = hairCol;
      ctx.fill();
      if (p.hair === "cornrows") {
        for (let i = -3; i <= 3; i++) line(ctx, hx + i * rx * 0.25, cy - ry, hx + i * rx * 0.3, cy + (back ? ry * 0.7 : -ry * 0.4), shade(hairCol, 0.25), 0.006);
      }
      ctx.restore();
    } else {
      oval(ctx, hx - rx * 0.3, cy - ry * 0.55, rx * 0.25, ry * 0.12);
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fill();
    }
  }

  if (p.headwear) drawHeadwear(ctx, p.headwear, hx, cy, rx, ry, dir);
}

function drawHeadwear(ctx: Ctx, hw: NonNullable<Headwear>, hx: number, cy: number, rx: number, ry: number, dir: Dir) {
  const f = hw.fabric;
  const top = cy - ry;
  if (hw.kind === "gele") {
    // tall pleated fan: the signature Yoruba headwrap
    const wide = dir === "E" || dir === "W" ? 1.5 : 2.3;
    ctx.beginPath();
    ctx.moveTo(hx - rx * 1.08, cy - ry * 0.05);
    ctx.quadraticCurveTo(hx - rx * wide, top - ry * 0.2, hx - rx * (wide * 0.7), top - ry * 1.15);
    ctx.quadraticCurveTo(hx - rx * 0.2, top - ry * 1.55, hx + rx * 0.3, top - ry * 1.35);
    ctx.quadraticCurveTo(hx + rx * wide * 0.95, top - ry * 1.05, hx + rx * wide * 0.85, top - ry * 0.15);
    ctx.quadraticCurveTo(hx + rx * 1.2, cy - ry * 0.1, hx + rx * 1.08, cy - ry * 0.05);
    ctx.quadraticCurveTo(hx, cy - ry * 0.35, hx - rx * 1.08, cy - ry * 0.05);
    ctx.closePath();
    paintFabric(ctx, f, hx - rx * 3, top - ry * 2, rx * 6, ry * 3);
    ctx.strokeStyle = shade(f.base, -0.45);
    ctx.lineWidth = 0.008;
    ctx.stroke();
    // pleats
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      ctx.beginPath();
      ctx.moveTo(hx - rx * 0.9 + t * rx * 1.8, cy - ry * 0.25);
      ctx.quadraticCurveTo(hx - rx * 1.4 + t * rx * 2.8, top - ry * 0.4, hx - rx * 1.2 + t * rx * 2.6, top - ry * (1.0 + 0.25 * Math.sin(t * Math.PI)));
      ctx.strokeStyle = alpha(shade(f.base, -0.4), 0.55);
      ctx.lineWidth = 0.009;
      ctx.stroke();
    }
    // sheen
    ctx.beginPath();
    ctx.moveTo(hx - rx * 1.1, top - ry * 0.6);
    ctx.quadraticCurveTo(hx - rx * 0.2, top - ry * 1.3, hx + rx * 0.6, top - ry * 1.1);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 0.012;
    ctx.stroke();
    return;
  }
  if (hw.kind === "fila") {
    // soft cap flopped to one side
    ctx.beginPath();
    ctx.moveTo(hx - rx * 1.02, cy - ry * 0.12);
    ctx.quadraticCurveTo(hx - rx * 1.1, top - ry * 0.55, hx - rx * 0.1, top - ry * 0.65);
    ctx.quadraticCurveTo(hx + rx * 1.3, top - ry * 0.55, hx + rx * 1.45, top + ry * 0.35);
    ctx.quadraticCurveTo(hx + rx * 1.25, top + ry * 0.6, hx + rx * 1.02, cy - ry * 0.12);
    ctx.quadraticCurveTo(hx, cy - ry * 0.4, hx - rx * 1.02, cy - ry * 0.12);
    ctx.closePath();
    paintFabric(ctx, f, hx - rx * 2, top - ry, rx * 4, ry * 2);
    ctx.strokeStyle = shade(f.base, -0.45);
    ctx.lineWidth = 0.008;
    ctx.stroke();
    line(ctx, hx - rx * 1.0, cy - ry * 0.2, hx + rx * 1.0, cy - ry * 0.2, shade(f.base, -0.3), 0.014);
    return;
  }
  if (hw.kind === "headtie") {
    ctx.beginPath();
    ctx.moveTo(hx - rx * 1.08, cy - ry * 0.1);
    ctx.quadraticCurveTo(hx - rx * 1.2, top - ry * 0.5, hx, top - ry * 0.45);
    ctx.quadraticCurveTo(hx + rx * 1.2, top - ry * 0.5, hx + rx * 1.08, cy - ry * 0.1);
    ctx.quadraticCurveTo(hx, cy - ry * 0.35, hx - rx * 1.08, cy - ry * 0.1);
    ctx.closePath();
    paintFabric(ctx, f, hx - rx * 2, top - ry, rx * 4, ry * 2);
    oval(ctx, hx + rx * 0.7, top - ry * 0.35, rx * 0.3, ry * 0.18);
    ctx.fillStyle = shade(f.base, -0.1);
    ctx.fill();
    return;
  }
  // baseball cap
  ctx.beginPath();
  ctx.moveTo(hx - rx * 1.02, cy - ry * 0.25);
  ctx.quadraticCurveTo(hx, top - ry * 0.55, hx + rx * 1.02, cy - ry * 0.25);
  ctx.closePath();
  ctx.fillStyle = f.base;
  ctx.fill();
  if (dir === "S") {
    oval(ctx, hx, cy - ry * 0.25, rx * 1.05, ry * 0.18);
    ctx.fillStyle = shade(f.base, -0.25);
    ctx.fill();
  } else if (dir === "E" || dir === "W") {
    rrect(ctx, hx + rx * 0.6, cy - ry * 0.32, rx * 0.8, ry * 0.12, 0.01);
    ctx.fillStyle = shade(f.base, -0.25);
    ctx.fill();
  }
}

// ---------------------------------------------------------------- front/back

function drawFrontBack(ctx: Ctx, p: PersonSpec, b: Body, dir: "S" | "N", pose: Pose, phase: number) {
  const top = topFor(p.outfit);
  const low = lowerFor(p.outfit);
  const sitting = pose === "sit";
  const walk = pose === "walk";
  const liftL = walk ? Math.max(0, Math.sin(phase)) * 0.05 : 0;
  const liftR = walk ? Math.max(0, -Math.sin(phase)) * 0.05 : 0;
  const legW = 0.115 * p.build * (p.age === "child" ? 0.8 : 1);
  const footY = sitting ? -0.0 : 0;

  // legs
  const legX = b.hip * 0.27;
  const legTop = b.yHip - 0.02;
  for (const [s, lift] of [[-1, liftL], [1, liftR]] as const) {
    const lx = s * legX;
    const ankle = footY - 0.07 * K - lift * K;
    const legTopY = sitting ? b.yHip + 0.06 : legTop;
    const legColor = low.legs ? low.legs.base : p.skin;
    rrect(ctx, lx - legW / 2, legTopY, legW, ankle - legTopY, 0.03);
    if (low.legs) paintFabric(ctx, low.legs, lx - legW / 2, legTopY, legW, ankle - legTopY);
    else fillSkin(ctx, p.skin);
    if (low.shinsBare) {
      const knee = legTopY + (ankle - legTopY) * 0.48;
      rrect(ctx, lx - legW * 0.42, knee, legW * 0.84, ankle - knee, 0.02);
      fillSkin(ctx, p.skin);
      // socks
      rrect(ctx, lx - legW * 0.44, ankle - 0.07, legW * 0.88, 0.07, 0.01);
      ctx.fillStyle = "#f2efe8";
      ctx.fill();
    }
    ctx.strokeStyle = outline(legColor);
    ctx.lineWidth = 0.006;
    // feet: slippers/shoes
    oval(ctx, lx, -lift * K - 0.02, legW * 0.62, 0.035);
    ctx.fillStyle = p.shoes;
    ctx.fill();
  }

  // wrapper / gown skirt
  if (low.skirt) {
    const hemZ = low.skirtTo === "ankle" ? 0.09 : b.leg * 0.45;
    const hemY = sitting ? b.yHip + 0.12 : -hemZ * K;
    const wTop = b.hip * 1.05;
    const wHem = low.skirtTo === "ankle" ? b.hip * 0.95 : b.hip * 1.2;
    ctx.beginPath();
    ctx.moveTo(-wTop / 2, b.yHip - 0.04);
    ctx.lineTo(wTop / 2, b.yHip - 0.04);
    ctx.lineTo(wHem / 2 + (walk ? Math.sin(phase) * 0.02 : 0), hemY);
    ctx.lineTo(-wHem / 2 + (walk ? Math.sin(phase) * 0.02 : 0), hemY);
    ctx.closePath();
    paintFabric(ctx, low.skirt, -0.5, b.yHip - 0.1, 1, 1.2);
    ctx.strokeStyle = outline(low.skirt.base);
    ctx.lineWidth = 0.006;
    ctx.stroke();
    sideShade(ctx, 0, b.yHip, wTop * 1.2, hemY - b.yHip);
    if (p.outfit.kind === "iro-buba") {
      // the tucked wrapper fold at the waist
      line(ctx, -wTop * 0.45, b.yHip + 0.02, wTop * 0.3, b.yHip + 0.07, alpha(shade(low.skirt.base, -0.5), 0.7), 0.012);
    }
  }

  // agbada robe goes behind the arms but over the legs
  const sw = b.shoulder;
  const bottomY = (p.outfit.kind === "gown" ? -0.09 * K : b.yHip + top.drop * K);
  const bw = b.hip * top.flare;
  const isBack = dir === "N";

  if (p.carry === "baby" && !isBack) drawBaby(ctx, p, b, "front-peek");

  // torso / top garment
  ctx.beginPath();
  ctx.moveTo(-sw / 2, b.yShoulder + 0.05);
  ctx.quadraticCurveTo(-sw / 2, b.yShoulder - 0.005, -sw * 0.2, b.yShoulder - 0.012);
  ctx.lineTo(sw * 0.2, b.yShoulder - 0.012);
  ctx.quadraticCurveTo(sw / 2, b.yShoulder - 0.005, sw / 2, b.yShoulder + 0.05);
  ctx.lineTo(bw / 2, bottomY);
  ctx.lineTo(-bw / 2, bottomY);
  ctx.closePath();
  paintFabric(ctx, top.fabric, -bw, b.yShoulder - 0.05, bw * 2, bottomY - b.yShoulder + 0.1);
  ctx.strokeStyle = outline(top.fabric.base);
  ctx.lineWidth = 0.007;
  ctx.stroke();
  sideShade(ctx, 0, b.yShoulder - 0.02, Math.max(sw, bw) * 1.1, bottomY - b.yShoulder + 0.04);

  // garment details
  const o = p.outfit;
  if (!isBack) {
    if (o.kind === "suit") {
      ctx.beginPath();
      ctx.moveTo(-0.06, b.yShoulder);
      ctx.lineTo(0, b.yShoulder + 0.2);
      ctx.lineTo(0.06, b.yShoulder);
      ctx.closePath();
      ctx.fillStyle = o.shirt;
      ctx.fill();
      line(ctx, 0, b.yShoulder + 0.02, 0, b.yShoulder + 0.2, o.tie, 0.03);
    } else if (o.kind === "okada") {
      // reflective vest
      rrect(ctx, -sw * 0.42, b.yShoulder + 0.01, sw * 0.84, b.yHip - b.yShoulder + 0.02, 0.03);
      ctx.fillStyle = o.vest;
      ctx.fill();
      ctx.fillStyle = "rgba(235,235,225,0.85)";
      ctx.fillRect(-sw * 0.42, b.yShoulder + (b.yHip - b.yShoulder) * 0.55, sw * 0.84, 0.03);
      label(ctx, "OYO", 0, b.yShoulder + (b.yHip - b.yShoulder) * 0.3, 0.06, "#1d1b19");
    } else if (o.kind === "school") {
      line(ctx, 0, b.yShoulder, 0, b.yHip, alpha("#000000", 0.18), 0.006);
      ctx.fillStyle = "#3a5a2a";
      ctx.fillRect(sw * 0.12, b.yShoulder + 0.06, 0.05, 0.05); // badge
    } else if (o.kind === "buba-sokoto" || o.kind === "agbada") {
      // round neck opening with embroidery
      oval(ctx, 0, b.yShoulder + 0.01, 0.07, 0.035);
      ctx.strokeStyle = alpha(shade(top.fabric.base, 0.5), 0.9);
      ctx.lineWidth = 0.012;
      ctx.stroke();
      if (o.kind === "agbada") {
        rrect(ctx, -0.06, b.yShoulder + 0.03, 0.12, 0.22, 0.02);
        ctx.strokeStyle = alpha(shade(top.fabric.base, 0.55), 0.8);
        ctx.lineWidth = 0.008;
        ctx.stroke();
      }
    }
  }
  if (p.carry === "baby" && isBack) drawBaby(ctx, p, b, "back");

  // arms
  const armUp = p.carry === "basin" || p.carry === "tray-bread";
  const armLen = b.torso * 1.02;
  for (const s of [-1, 1]) {
    const sx = s * (sw / 2 - 0.035);
    const sy = b.yShoulder + 0.045;
    const swing = walk ? Math.sin(phase + (s > 0 ? Math.PI : 0)) * 0.035 : 0;
    const raised = armUp && s === 1;
    const hx = raised ? s * (sw / 2 + 0.02) : s * (sw / 2 + 0.03 + (top.sleeve === "wide" ? 0.12 : 0));
    const hy = raised ? b.headCy - b.head * K * 0.65 : sy + armLen * K + swing;
    const sleeveCol = top.sleeve === "none" ? p.skin : top.fabric.base;
    if (top.sleeve === "wide") {
      // agbada: the robe's sleeve is a big drape, hand peeks out at the bottom
      ctx.beginPath();
      ctx.moveTo(sx, sy - 0.03);
      ctx.lineTo(s * (sw / 2 + 0.24), sy + armLen * K * 0.95);
      ctx.lineTo(s * (sw / 2 - 0.02), sy + armLen * K);
      ctx.closePath();
      paintFabric(ctx, top.fabric, -1, sy - 0.1, 2, 1);
      ctx.strokeStyle = outline(top.fabric.base);
      ctx.lineWidth = 0.007;
      ctx.stroke();
      oval(ctx, s * (sw / 2 + 0.05), sy + armLen * K + 0.01, 0.035, 0.03);
      fillSkin(ctx, p.skin);
      continue;
    }
    const elbowT = top.sleeve === "short" ? 0.45 : 1;
    const ex = sx + (hx - sx) * elbowT;
    const ey = sy + (hy - sy) * elbowT;
    ctx.lineCap = "round";
    line(ctx, sx, sy, ex, ey, sleeveCol, 0.085 * p.build);
    if (elbowT < 1) line(ctx, ex, ey, hx, hy, p.skin, 0.068 * p.build);
    oval(ctx, hx, hy + 0.01, 0.035, 0.035);
    fillSkin(ctx, p.skin);
    ctx.lineCap = "butt";
  }

  drawHead(ctx, p, b, dir);
  if (p.carry === "basin" || p.carry === "tray-bread") drawHeadLoad(ctx, p, b);
  if (p.carry === "bag" && !isBack) {
    line(ctx, -sw * 0.35, b.yShoulder + 0.02, sw * 0.35, b.yHip - 0.02, "#2b2420", 0.015);
    rrect(ctx, sw * 0.3, b.yHip - 0.08, 0.14, 0.12, 0.02);
    ctx.fillStyle = "#4a3426";
    ctx.fill();
  }
}

function fillSkin(ctx: Ctx, skin: string) {
  ctx.fillStyle = skin;
  ctx.fill();
}

function label(ctx: Ctx, text: string, x: number, y: number, size: number, color: string) {
  ctx.font = `800 ${size}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function drawBaby(ctx: Ctx, p: PersonSpec, b: Body, mode: "back" | "front-peek") {
  const wrap: Fabric = { base: "#b8433a", a: "#f0c64a", b: "#2a3b6b", motif: "wax" };
  if (mode === "back") {
    // wrapper bundle tied across the back, baby's head above the shoulder
    oval(ctx, b.shoulder * 0.05, b.yShoulder + 0.03, 0.075, 0.065);
    ctx.fillStyle = shade(p.skin, 0.05);
    ctx.fill();
    oval(ctx, b.shoulder * 0.05, b.yShoulder + 0.0, 0.075, 0.04);
    ctx.fillStyle = PAL.hair;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, b.yShoulder + (b.yHip - b.yShoulder) * 0.6, b.shoulder * 0.5, (b.yHip - b.yShoulder) * 0.55, 0, 0, Math.PI * 2);
    paintFabric(ctx, wrap, -0.4, b.yShoulder, 0.8, 0.8);
    ctx.strokeStyle = outline(wrap.base);
    ctx.lineWidth = 0.007;
    ctx.stroke();
  } else {
    oval(ctx, -b.shoulder * 0.42, b.yShoulder - 0.015, 0.06, 0.055);
    ctx.fillStyle = shade(p.skin, 0.05);
    ctx.fill();
    oval(ctx, -b.shoulder * 0.42, b.yShoulder - 0.04, 0.06, 0.03);
    ctx.fillStyle = PAL.hair;
    ctx.fill();
  }
}

function drawHeadLoad(ctx: Ctx, p: PersonSpec, b: Body) {
  const top = b.headCy - (b.head * K) / 2;
  if (p.carry === "basin") {
    // aluminium basin heaped with oranges
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI;
      oval(ctx, Math.cos(a) * 0.17, top - 0.1 - Math.sin(a) * 0.05 - (i % 3) * 0.012, 0.035, 0.032);
      ctx.fillStyle = i % 4 === 0 ? "#d9781f" : "#e98d24";
      ctx.fill();
    }
    ctx.beginPath();
    ctx.moveTo(-0.24, top - 0.08);
    ctx.lineTo(0.24, top - 0.08);
    ctx.lineTo(0.17, top + 0.005);
    ctx.lineTo(-0.17, top + 0.005);
    ctx.closePath();
    const g = ctx.createLinearGradient(-0.24, 0, 0.24, 0);
    g.addColorStop(0, "#d9dcdc");
    g.addColorStop(0.4, "#f4f5f3");
    g.addColorStop(1, "#8e9393");
    ctx.fillStyle = g;
    ctx.fill();
    oval(ctx, 0, top - 0.08, 0.24, 0.035);
    ctx.strokeStyle = "#7b8080";
    ctx.lineWidth = 0.01;
    ctx.stroke();
    // head pad (oruka)
    oval(ctx, 0, top + 0.01, 0.07, 0.02);
    ctx.fillStyle = "#c9b28a";
    ctx.fill();
    return;
  }
  // wide wooden tray of bread loaves
  rrect(ctx, -0.32, top - 0.05, 0.64, 0.05, 0.01);
  ctx.fillStyle = PAL.wood;
  ctx.fill();
  for (let i = 0; i < 5; i++) {
    rrect(ctx, -0.29 + i * 0.12, top - 0.12, 0.1, 0.075, 0.03);
    ctx.fillStyle = "#c98a45";
    ctx.fill();
    ctx.strokeStyle = "#9a6330";
    ctx.lineWidth = 0.006;
    ctx.stroke();
  }
  // nylon cover sheen
  rrect(ctx, -0.31, top - 0.13, 0.62, 0.1, 0.03);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fill();
}

// ---------------------------------------------------------------- side (E)

function drawSide(ctx: Ctx, p: PersonSpec, b: Body, pose: Pose, phase: number) {
  const top = topFor(p.outfit);
  const low = lowerFor(p.outfit);
  const walk = pose === "walk";
  const sit = pose === "sit";
  const depth = 0.24 * p.build * (p.age === "child" ? 0.8 : 1);
  const lean = p.age === "elder" ? 0.06 : 0;
  const legW = 0.11 * p.build;
  const swing = walk ? Math.sin(phase) * 0.42 : 0;
  const legCol = low.legs ? low.legs.base : p.skin;

  // legs: far leg first (darker), near leg last
  const legsToDraw: [number, number][] = [[-swing, -0.18], [swing, 0]];
  for (const [ang, dk] of legsToDraw) {
    if (sit) {
      const kneeX = 0.36;
      line(ctx, 0, b.yHip, kneeX, b.yHip, shade(legCol, dk), legW);
      line(ctx, kneeX, b.yHip, kneeX + 0.04, -0.06 * K, shade(low.shinsBare ? p.skin : legCol, dk), legW * 0.9);
      oval(ctx, kneeX + 0.08, -0.03, 0.08, 0.03);
      ctx.fillStyle = p.shoes;
      ctx.fill();
      continue;
    }
    const fx = Math.sin(ang) * b.leg;
    const fy = b.yHip + Math.cos(ang) * b.leg * K;
    ctx.lineCap = "round";
    if (!low.skirt) line(ctx, 0, b.yHip, fx, fy - 0.05, shade(legCol, dk), legW);
    if (low.shinsBare && !low.skirt) {
      const kx = fx * 0.5;
      const ky = b.yHip + (fy - b.yHip) * 0.5;
      line(ctx, kx, ky, fx, fy - 0.05, shade(p.skin, dk), legW * 0.85);
    }
    ctx.lineCap = "butt";
    oval(ctx, fx + 0.05, fy - 0.025, 0.085, 0.03);
    ctx.fillStyle = shade(p.shoes, dk);
    ctx.fill();
  }

  if (low.skirt && !sit) {
    const hemY = low.skirtTo === "ankle" ? -0.09 * K : -b.leg * 0.45 * K;
    const sway = walk ? Math.sin(phase) * 0.05 : 0;
    ctx.beginPath();
    ctx.moveTo(-depth * 0.55, b.yHip - 0.04);
    ctx.lineTo(depth * 0.55, b.yHip - 0.04);
    ctx.lineTo(depth * 0.5 + sway + 0.04, hemY);
    ctx.lineTo(-depth * 0.5 + sway - 0.02, hemY);
    ctx.closePath();
    paintFabric(ctx, low.skirt, -0.5, b.yHip - 0.1, 1, 1.2);
    ctx.strokeStyle = outline(low.skirt.base);
    ctx.lineWidth = 0.006;
    ctx.stroke();
  }

  // far arm
  const armLen = b.torso * 1.0 * K;
  const aSwing = walk ? -Math.sin(phase) * 0.5 : 0;
  const sleeveCol = top.fabric.base;
  const sy = b.yShoulder + 0.04;
  ctx.lineCap = "round";
  if (top.sleeve !== "wide") line(ctx, lean, sy, lean - Math.sin(aSwing) * armLen, sy + Math.cos(aSwing) * armLen, shade(sleeveCol, -0.2), 0.075 * p.build);
  ctx.lineCap = "butt";

  // torso
  const bottomY = p.outfit.kind === "gown" ? -0.09 * K : b.yHip + top.drop * K;
  const flare = p.outfit.kind === "agbada" ? 0.5 : depth * (top.drop > 0.1 ? 0.65 : 0.5);
  ctx.beginPath();
  ctx.moveTo(lean - depth / 2, b.yShoulder);
  ctx.quadraticCurveTo(lean, b.yShoulder - 0.03, lean + depth / 2, b.yShoulder + 0.01);
  ctx.lineTo(flare, bottomY);
  ctx.lineTo(-flare, bottomY);
  ctx.closePath();
  paintFabric(ctx, top.fabric, -1, b.yShoulder - 0.1, 2, 2);
  ctx.strokeStyle = outline(top.fabric.base);
  ctx.lineWidth = 0.007;
  ctx.stroke();
  sideShade(ctx, 0, b.yShoulder, depth * 2, bottomY - b.yShoulder, 0.12);
  if (p.outfit.kind === "okada") {
    rrect(ctx, lean - depth * 0.45, b.yShoulder + 0.02, depth * 0.9, b.yHip - b.yShoulder, 0.02);
    ctx.fillStyle = p.outfit.vest;
    ctx.fill();
  }
  if (p.carry === "baby") {
    oval(ctx, lean - depth * 0.55, b.yShoulder + (b.yHip - b.yShoulder) * 0.5, depth * 0.45, (b.yHip - b.yShoulder) * 0.5);
    paintFabric(ctx, { base: "#b8433a", a: "#f0c64a", b: "#2a3b6b", motif: "wax" }, -1, b.yShoulder, 1, 1);
    oval(ctx, lean - depth * 0.5, b.yShoulder - 0.01, 0.06, 0.055);
    ctx.fillStyle = shade(p.skin, 0.05);
    ctx.fill();
  }

  drawHead(ctx, p, b, "E", lean);

  // near arm
  const armUp = p.carry === "basin" || p.carry === "tray-bread";
  ctx.lineCap = "round";
  if (top.sleeve === "wide") {
    ctx.beginPath();
    ctx.moveTo(lean - 0.05, sy - 0.02);
    ctx.lineTo(lean + 0.16, sy + armLen * 0.95);
    ctx.lineTo(lean - 0.2, sy + armLen);
    ctx.closePath();
    paintFabric(ctx, top.fabric, -1, sy - 0.1, 2, 1);
    ctx.strokeStyle = outline(top.fabric.base);
    ctx.lineWidth = 0.007;
    ctx.stroke();
  } else if (armUp) {
    line(ctx, lean, sy, lean + 0.02, b.headCy - b.head * K * 0.7, sleeveCol, 0.08 * p.build);
  } else {
    const hx = lean + Math.sin(aSwing) * armLen;
    const hy = sy + Math.cos(aSwing) * armLen;
    const short = top.sleeve === "short";
    const mx = lean + (hx - lean) * 0.45;
    const my = sy + (hy - sy) * 0.45;
    line(ctx, lean, sy, short ? mx : hx, short ? my : hy, sleeveCol, 0.08 * p.build);
    if (short) line(ctx, mx, my, hx, hy, p.skin, 0.065 * p.build);
    oval(ctx, hx, hy + 0.01, 0.034, 0.034);
    ctx.fillStyle = p.skin;
    ctx.fill();
  }
  ctx.lineCap = "butt";
  if (armUp) drawHeadLoad(ctx, p, b);
}

// ---------------------------------------------------------------- public

/**
 * Draw a person at the origin. `phase` drives the walk cycle (radians).
 * For `sit`, pass the seat height in metres.
 */
export function drawPerson(ctx: Ctx, p: PersonSpec, dir: Dir, pose: Pose = "stand", phase = 0, seat = 0.45) {
  const b = bodyPlan(p, pose === "sit" ? seat : 0);
  const bob = pose === "walk" ? Math.abs(Math.sin(phase)) * 0.015 : 0;
  if (pose !== "sit") groundShadow(ctx, 0, 0, 0.26 * p.build, 0.09);
  ctx.save();
  ctx.translate(0, -bob);
  if (dir === "W") ctx.scale(-1, 1);
  if (dir === "E" || dir === "W") drawSide(ctx, p, b, pose, phase);
  else drawFrontBack(ctx, p, b, dir, pose, phase);
  if (p.age === "elder" && pose !== "sit") {
    // walking stick
    const x = dir === "E" || dir === "W" ? 0.22 : b.shoulder / 2 + 0.06;
    line(ctx, x, b.yShoulder + b.torso * K * 0.95, x + 0.03, 0, PAL.woodDark, 0.022);
  }
  ctx.restore();
}

/** Ready-made Ibadan people for scenes and tests. */
export const FABRICS = {
  adireIndigo: { base: "#23345e", a: "#5f79b3", b: "#c9d3ea", motif: "diamond" } as Fabric,
  waxGold: { base: "#c6731e", a: "#2c2a6b", b: "#f2d24b", motif: "wax" } as Fabric,
  waxGreen: { base: "#1f6b4a", a: "#f0b829", b: "#b8321f", motif: "wax" } as Fabric,
  waxPurple: { base: "#5b2a6e", a: "#e88a2a", b: "#f6e3a6", motif: "dots" } as Fabric,
  asoOkeWine: { base: "#6b1f2e", a: "#c9a24a", b: "#e9dcc0", motif: "asooke" } as Fabric,
  asoOkeCream: { base: "#e6dcc3", a: "#9a7b3a", b: "#5b4a2a", motif: "asooke" } as Fabric,
  laceWhite: { base: "#efebe2", a: "#d9d2c4", b: "#c9c0b0", motif: "dots" } as Fabric,
  plainSky: { base: "#7fa7c9", a: "#7fa7c9", b: "#7fa7c9", motif: "plain" } as Fabric,
  stripeRed: { base: "#a8322a", a: "#e9d2b4", b: "#e9d2b4", motif: "stripe" } as Fabric,
};
