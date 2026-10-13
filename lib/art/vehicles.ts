// Omo Ibadan art kit — vehicles at real dimensions.
//
// Origin is the centre of the vehicle's footprint on the ground. "E" means
// the vehicle points right (we see its left/near side); "S" means it drives
// toward the viewer (we see the front and the top).

import { G, K, alpha, clipped, groundShadow, label, line, oval, poly, rrect, shade, type Ctx, type Dir } from "./core";
import { PAL } from "./palette";
import { drawPerson, type PersonSpec } from "./people";

export interface CarSpec {
  length: number;
  width: number;
  height: number;
  /** height of the window line */
  belt: number;
  /** bonnet length, boot length (0 = hatchback/van) */
  hood: number;
  trunk: number;
  /** horizontal run of the windscreen and rear glass */
  slopeF: number;
  slopeR: number;
  /** roof width as a fraction of body width */
  roofInset: number;
  body: string;
  roof?: string;
  /** a painted band along the side (commercial livery) */
  band?: string;
  wheel: number;
  /** extra side windows for buses */
  sideWindows?: number;
  dirt?: number;
  plate?: string;
  roofRack?: boolean;
}

export const CARS = {
  /** Nissan Micra K11 in Oyo commercial brown + yellow: the Ibadan taxi */
  micra: { length: 3.72, width: 1.59, height: 1.43, belt: 0.82, hood: 0.72, trunk: 0.18, slopeF: 0.55, slopeR: 0.32, roofInset: 0.86, body: PAL.commBrown, roof: PAL.commYellow, band: PAL.commYellow, wheel: 0.28, dirt: 0.35, plate: "IBD 412 OY" },
  /** Toyota Hiace commercial bus ("korope") */
  korope: { length: 4.7, width: 1.69, height: 1.98, belt: 1.02, hood: 0.32, trunk: 0, slopeF: 0.35, slopeR: 0.05, roofInset: 0.94, body: PAL.commYellow, roof: shade(PAL.commYellow, 0.08), band: PAL.commBrown, wheel: 0.3, sideWindows: 4, dirt: 0.45, plate: "BDJ 77 OY", roofRack: true },
  /** white interstate bus (Hiace-style) that runs Ibadan–Lagos/Ife/Abuja from Iwo Road */
  interstate: { length: 5.4, width: 1.88, height: 2.28, belt: 1.1, hood: 0.35, trunk: 0, slopeF: 0.4, slopeR: 0.05, roofInset: 0.94, body: "#f1efe8", roof: "#e9e6de", band: "#1f6b4a", wheel: 0.32, sideWindows: 5, dirt: 0.3, plate: "IWO 18 OY", roofRack: true },
  /** tired silver Corolla, the tokunbo everybody's uncle drives */
  corolla: { length: 4.42, width: 1.69, height: 1.39, belt: 0.84, hood: 1.0, trunk: 0.72, slopeF: 0.62, slopeR: 0.48, roofInset: 0.86, body: "#9aa1a6", wheel: 0.29, dirt: 0.25, plate: "KUT 503 OY" },
  /** black Camry "Muscle" */
  camry: { length: 4.8, width: 1.79, height: 1.44, belt: 0.88, hood: 1.15, trunk: 0.78, slopeF: 0.68, slopeR: 0.52, roofInset: 0.85, body: "#1d1f22", wheel: 0.3, dirt: 0.1, plate: "AKN 220 OY" },
  /** Alowonle family jeep (Lexus RX-style SUV) */
  jeep: { length: 4.85, width: 1.89, height: 1.72, belt: 1.05, hood: 0.95, trunk: 0.1, slopeF: 0.6, slopeR: 0.3, roofInset: 0.9, body: "#e9e6df", wheel: 0.36, dirt: 0.08, plate: "BDJ 001 AA" },
} satisfies Record<string, CarSpec>;

// ---------------------------------------------------------------- cars

function wheel(ctx: Ctx, x: number, y: number, r: number, side: boolean) {
  if (side) {
    oval(ctx, x, y, r, r * K);
    ctx.fillStyle = "#151413";
    ctx.fill();
    oval(ctx, x, y, r * 0.55, r * 0.55 * K);
    ctx.fillStyle = "#7c7d7b";
    ctx.fill();
    oval(ctx, x, y, r * 0.2, r * 0.2 * K);
    ctx.fillStyle = "#3a3a39";
    ctx.fill();
  } else {
    rrect(ctx, x - 0.11, y - r * K, 0.22, r * K + 0.02, 0.04);
    ctx.fillStyle = "#151413";
    ctx.fill();
  }
}

function dirt(ctx: Ctx, amount: number, x: number, y: number, w: number, h: number) {
  if (!amount) return;
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, "rgba(156,86,56,0)");
  g.addColorStop(1, `rgba(156,86,56,${0.55 * amount})`);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

/** Draw a car pointing E (W is mirrored). */
function carSide(ctx: Ctx, c: CarSpec) {
  const L = c.length;
  const W = c.width * G; // width runs into the screen, so it's squashed by the tilt
  const hl = L / 2;
  const yS = W / 2; // near side ground line
  const clear = 0.18;
  const beltY = -c.belt * K;
  const roofY = -c.height * K;
  const xf = hl - c.hood; // cabin front at belt
  const xr = -hl + c.trunk; // cabin rear at belt
  const rf = xf - c.slopeF; // roof front
  const rb = xr + c.slopeR; // roof rear
  const ri = (W / 2) * c.roofInset;
  const roofCol = c.roof ?? shade(c.body, 0.08);

  groundShadow(ctx, 0.1, c.width * 0.075, hl + 0.15, c.width * 0.62, 0.3);

  // top of the lower body (bonnet/boot plane)
  rrect(ctx, -hl, -W / 2 + beltY, L, W, 0.25);
  ctx.fillStyle = shade(c.body, 0.12);
  ctx.fill();
  // windscreen and rear glass seen from above
  poly(ctx, [xf, -W / 2 + beltY, xf, W / 2 + beltY, rf, ri + roofY, rf, -ri + roofY]);
  ctx.fillStyle = PAL.glass;
  ctx.fill();
  poly(ctx, [xr, -W / 2 + beltY, xr, W / 2 + beltY, rb, ri + roofY, rb, -ri + roofY]);
  ctx.fillStyle = shade(PAL.glass, 0.05);
  ctx.fill();
  // reflection streak on the windscreen
  poly(ctx, [xf - 0.08, -W / 4 + beltY, xf - 0.12, W / 4 + beltY, rf + 0.05, ri * 0.4 + roofY, rf + 0.08, -ri * 0.1 + roofY]);
  ctx.fillStyle = "rgba(200,220,225,0.18)";
  ctx.fill();

  // near side lower body
  rrect(ctx, -hl, yS + beltY, L, -beltY - clear * K, 0.18);
  ctx.fillStyle = c.body;
  ctx.fill();
  ctx.strokeStyle = shade(c.body, -0.5);
  ctx.lineWidth = 0.02;
  ctx.stroke();
  clipped(ctx, () => {
    if (c.band) {
      ctx.fillStyle = c.band;
      ctx.fillRect(-hl, yS + beltY + 0.12, L, 0.16);
    }
    // body shading: lighter shoulder, darker sill
    const g = ctx.createLinearGradient(0, yS + beltY, 0, yS - clear * K);
    g.addColorStop(0, "rgba(255,255,255,0.14)");
    g.addColorStop(0.5, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.28)");
    ctx.fillStyle = g;
    ctx.fillRect(-hl, yS + beltY, L, -beltY);
    dirt(ctx, c.dirt ?? 0, -hl, yS + beltY * 0.4, L, -beltY * 0.4);
  });

  // cabin side (windows + pillars)
  poly(ctx, [xr, yS + beltY, xf, yS + beltY, rf, ri + roofY, rb, ri + roofY]);
  ctx.fillStyle = shade(c.body, -0.05);
  ctx.fill();
  const inset = 0.06;
  const nWin = c.sideWindows ?? 2;
  const winTop = ri + roofY + 0.05;
  const winBot = yS + beltY - 0.04;
  for (let i = 0; i < nWin; i++) {
    const a = xr + 0.08 + ((xf - xr - 0.16) * i) / nWin;
    const b = xr + 0.08 + ((xf - xr - 0.16) * (i + 1)) / nWin - inset;
    // slant the first/last panes to follow the glass
    const ta = i === 0 ? Math.max(a, rb + 0.04) : a;
    const tb = i === nWin - 1 ? Math.min(b, rf - 0.04) : b;
    poly(ctx, [a, winBot, b, winBot, tb, winTop, ta, winTop]);
    ctx.fillStyle = PAL.glass;
    ctx.fill();
    poly(ctx, [a + 0.04, winBot - 0.02, a + 0.18, winBot - 0.02, ta + 0.22, winTop + 0.02, ta + 0.08, winTop + 0.02]);
    ctx.fillStyle = "rgba(190,210,215,0.16)";
    ctx.fill();
  }
  // door seams and handles
  for (const dx of nWin > 2 ? [xf - 0.9, xf - 1.9] : [xf - 0.05, (xf + xr) / 2]) {
    line(ctx, dx, yS + beltY + 0.02, dx, yS - clear * K - 0.04, shade(c.body, -0.45), 0.012);
    rrect(ctx, dx - 0.2, yS + beltY + 0.07, 0.11, 0.03, 0.01);
    ctx.fillStyle = shade(c.body, -0.3);
    ctx.fill();
  }

  // roof
  rrect(ctx, rb, -ri + roofY, rf - rb, ri * 2, 0.12);
  ctx.fillStyle = roofCol;
  ctx.fill();
  ctx.strokeStyle = shade(roofCol, -0.4);
  ctx.lineWidth = 0.015;
  ctx.stroke();
  if (c.roofRack) {
    for (let i = 0; i < 5; i++) line(ctx, rb + 0.3 + i * ((rf - rb - 0.6) / 4), -ri + roofY + 0.05, rb + 0.3 + i * ((rf - rb - 0.6) / 4), ri + roofY - 0.05, "#2a2826", 0.025);
  }

  // lights, mirror
  rrect(ctx, hl - 0.12, yS + beltY + 0.06, 0.1, 0.1, 0.02);
  ctx.fillStyle = "#f2e7c4";
  ctx.fill();
  rrect(ctx, -hl + 0.02, yS + beltY + 0.06, 0.08, 0.1, 0.02);
  ctx.fillStyle = "#b8231c";
  ctx.fill();
  oval(ctx, xf - 0.1, yS + beltY - 0.06, 0.07, 0.04);
  ctx.fillStyle = shade(c.body, -0.2);
  ctx.fill();

  // wheels, with dark arches
  const wx = hl - Math.max(0.62, c.wheel * 2.3);
  for (const x of [wx, -wx]) {
    oval(ctx, x, yS - c.wheel * K, c.wheel * 1.12, c.wheel * K * 1.12);
    ctx.fillStyle = "#1c1a18";
    ctx.fill();
    wheel(ctx, x, yS - c.wheel * K + 0.02, c.wheel, true);
  }
}

/** Draw a car facing the viewer (S) or away (N). */
function carEnd(ctx: Ctx, c: CarSpec, facing: "S" | "N") {
  // length runs into the screen, so every length-wise measure is squashed by the tilt
  const L = c.length * G;
  const W = c.width;
  const hl = L / 2;
  const beltY = -c.belt * K;
  const roofY = -c.height * K;
  // near end is the front when facing S, the back when facing N
  const nearLen = (facing === "S" ? c.hood : c.trunk) * G;
  const farLen = (facing === "S" ? c.trunk : c.hood) * G;
  const nearSlope = (facing === "S" ? c.slopeF : c.slopeR) * G;
  const farSlope = (facing === "S" ? c.slopeR : c.slopeF) * G;
  const yNear = hl - nearLen; // cabin edge nearest viewer (at belt)
  const yFar = -hl + farLen;
  const rNear = yNear - nearSlope;
  const rFar = yFar + farSlope;
  const ri = (W / 2) * c.roofInset;
  const roofCol = c.roof ?? shade(c.body, 0.08);
  const clear = 0.18;

  groundShadow(ctx, 0.12, 0.1, W * 0.62, c.length * 0.31, 0.3);

  // lower body top plane
  rrect(ctx, -W / 2, -hl + beltY, W, L, 0.25);
  ctx.fillStyle = shade(c.body, 0.12);
  ctx.fill();
  ctx.strokeStyle = shade(c.body, -0.45);
  ctx.lineWidth = 0.018;
  ctx.stroke();
  // far glass, roof, near glass
  poly(ctx, [-W / 2 + 0.05, yFar + beltY, W / 2 - 0.05, yFar + beltY, ri, rFar + roofY, -ri, rFar + roofY]);
  ctx.fillStyle = shade(PAL.glass, 0.05);
  ctx.fill();
  rrect(ctx, -ri, rFar + roofY, ri * 2, rNear - rFar, 0.12);
  ctx.fillStyle = roofCol;
  ctx.fill();
  ctx.strokeStyle = shade(roofCol, -0.4);
  ctx.lineWidth = 0.015;
  ctx.stroke();
  if (c.roofRack) {
    for (let i = 0; i < 5; i++) line(ctx, -ri + 0.05, rFar + roofY + 0.3 + i * ((rNear - rFar - 0.6) / 4), ri - 0.05, rFar + roofY + 0.3 + i * ((rNear - rFar - 0.6) / 4), "#2a2826", 0.025);
  }
  poly(ctx, [-ri, rNear + roofY, ri, rNear + roofY, W / 2 - 0.05, yNear + beltY, -W / 2 + 0.05, yNear + beltY]);
  ctx.fillStyle = PAL.glass;
  ctx.fill();
  poly(ctx, [-ri * 0.6, rNear + roofY + 0.02, -ri * 0.1, rNear + roofY + 0.02, W * 0.05, yNear + beltY - 0.02, -W * 0.35, yNear + beltY - 0.02]);
  ctx.fillStyle = "rgba(200,220,225,0.18)";
  ctx.fill();
  if (c.band) {
    // the band shows along the bonnet edges from this angle
    ctx.fillStyle = alpha(c.band, 0.9);
    ctx.fillRect(-W / 2 + 0.02, yNear + beltY, 0.08, nearLen);
    ctx.fillRect(W / 2 - 0.1, yNear + beltY, 0.08, nearLen);
  }

  // near face
  const faceTop = hl + beltY;
  const faceH = -beltY - clear * K;
  rrect(ctx, -W / 2, faceTop, W, faceH, 0.16);
  ctx.fillStyle = shade(c.body, -0.06);
  ctx.fill();
  ctx.strokeStyle = shade(c.body, -0.5);
  ctx.lineWidth = 0.02;
  ctx.stroke();
  clipped(ctx, () => dirt(ctx, c.dirt ?? 0, -W / 2, faceTop + faceH * 0.5, W, faceH * 0.5));
  if (facing === "S") {
    rrect(ctx, -W * 0.22, faceTop + faceH * 0.22, W * 0.44, faceH * 0.28, 0.04);
    ctx.fillStyle = "#1e1d1b";
    ctx.fill();
    for (const s of [-1, 1]) {
      rrect(ctx, s * W * 0.38 - 0.13, faceTop + faceH * 0.18, 0.26, faceH * 0.2, 0.05);
      ctx.fillStyle = "#efe6c8";
      ctx.fill();
    }
  } else {
    for (const s of [-1, 1]) {
      rrect(ctx, s * W * 0.38 - 0.12, faceTop + faceH * 0.15, 0.24, faceH * 0.22, 0.04);
      ctx.fillStyle = "#a8201a";
      ctx.fill();
    }
  }
  // bumper + plate
  rrect(ctx, -W / 2 + 0.03, faceTop + faceH * 0.66, W - 0.06, faceH * 0.2, 0.06);
  ctx.fillStyle = shade(c.body, -0.3);
  ctx.fill();
  rrect(ctx, -0.26, faceTop + faceH * 0.52, 0.52, 0.12, 0.015);
  ctx.fillStyle = "#f3f1ea";
  ctx.fill();
  label(ctx, c.plate ?? "OY", 0, faceTop + faceH * 0.52 + 0.06, 0.07, "#2b4a8a", 800);

  // wheels peeking out
  for (const s of [-1, 1]) wheel(ctx, s * (W / 2 - 0.16), hl - clear * K + 0.03, c.wheel * 0.6, false);
  // mirrors
  for (const s of [-1, 1]) {
    oval(ctx, s * (W / 2 + 0.06), yNear + beltY - 0.05, 0.06, 0.04);
    ctx.fillStyle = shade(c.body, -0.2);
    ctx.fill();
  }
}

export function drawCar(ctx: Ctx, c: CarSpec, dir: Dir) {
  ctx.save();
  if (dir === "W") ctx.scale(-1, 1);
  if (dir === "E" || dir === "W") carSide(ctx, c);
  else carEnd(ctx, c, dir);
  ctx.restore();
}

// ---------------------------------------------------------------- keke

export const KEKE = { body: PAL.commBrown, canopy: PAL.commYellow, trim: PAL.commYellow };

/** Bajaj-style tricycle ("keke"), 2.6 m long, open sides. */
export function drawKeke(ctx: Ctx, dir: Dir, riders: PersonSpec[] = []) {
  ctx.save();
  if (dir === "W") ctx.scale(-1, 1);
  const L = 2.63;
  const W = 1.3;
  const H = 1.7;
  if (dir === "E" || dir === "W") {
    groundShadow(ctx, 0.05, W * 0.08, 1.4, 0.7, 0.28);
    const Wd = W * G;
    const yS = Wd / 2;
    // canopy top (far edge first)
    rrect(ctx, -1.2, -Wd / 2 - H * K, 2.2, Wd, 0.18);
    ctx.fillStyle = shade(KEKE.canopy, 0.1);
    ctx.fill();
    // passengers on the bench
    riders.slice(1).forEach((r, i) => {
      ctx.save();
      ctx.translate(-0.55 + i * 0.32, yS - 0.25 * G);
      drawPerson(ctx, r, "E", "sit", 0, 0.62);
      ctx.restore();
    });
    // driver
    if (riders[0]) {
      ctx.save();
      ctx.translate(0.35, yS - 0.3 * G);
      drawPerson(ctx, riders[0], "E", "sit", 0, 0.7);
      ctx.restore();
    }
    // body tub: low on the sides, high cowl at the front
    ctx.beginPath();
    ctx.moveTo(-1.25, yS - 0.18 * K);
    ctx.lineTo(-1.25, yS - 0.75 * K);
    ctx.lineTo(0.6, yS - 0.75 * K);
    ctx.lineTo(0.95, yS - 1.15 * K);
    ctx.lineTo(1.28, yS - 1.12 * K);
    ctx.lineTo(1.3, yS - 0.2 * K);
    ctx.closePath();
    ctx.fillStyle = KEKE.body;
    ctx.fill();
    ctx.strokeStyle = shade(KEKE.body, -0.5);
    ctx.lineWidth = 0.02;
    ctx.stroke();
    ctx.fillStyle = KEKE.trim;
    ctx.fillRect(-1.25, yS - 0.5 * K, 1.9, 0.08);
    // windscreen
    poly(ctx, [0.95, yS - 1.15 * K, 1.2, yS - 1.12 * K, 1.1, yS - H * K + 0.04, 0.88, yS - H * K + 0.04]);
    ctx.fillStyle = alpha(PAL.glass, 0.85);
    ctx.fill();
    // canopy near edge + poles
    line(ctx, -1.15, yS - 0.75 * K, -1.15, yS - H * K, "#2b2522", 0.035);
    line(ctx, 0.95, yS - 1.1 * K, 0.95, yS - H * K, "#2b2522", 0.035);
    rrect(ctx, -1.25, yS - H * K - 0.06, 2.3, 0.14, 0.05);
    ctx.fillStyle = KEKE.canopy;
    ctx.fill();
    ctx.strokeStyle = shade(KEKE.canopy, -0.45);
    ctx.lineWidth = 0.015;
    ctx.stroke();
    // wheels: one at the front, a pair at the back
    wheel(ctx, 1.05, yS - 0.2 * K, 0.2, true);
    wheel(ctx, -0.95, yS - 0.2 * K, 0.21, true);
  } else {
    groundShadow(ctx, 0.05, 0.1, 0.75, 1.3, 0.28);
    const front = dir === "S";
    const hl = (L / 2) * G;
    // canopy roof seen from above
    rrect(ctx, -W / 2, -hl - H * K + (front ? 0.25 * G : 0), W, 2.2 * G, 0.18);
    ctx.fillStyle = KEKE.canopy;
    ctx.fill();
    ctx.strokeStyle = shade(KEKE.canopy, -0.45);
    ctx.lineWidth = 0.015;
    ctx.stroke();
    for (let i = 1; i < 5; i++) line(ctx, -W / 2 + 0.08, -hl - H * K + (0.25 + i * 0.42) * G, W / 2 - 0.08, -hl - H * K + (0.25 + i * 0.42) * G, alpha(shade(KEKE.canopy, -0.3), 0.5), 0.012);
    if (front) {
      // narrow nose with the single headlamp
      poly(ctx, [-0.35, hl - 1.15 * K, 0.35, hl - 1.15 * K, 0.4, hl - 0.2 * K, -0.4, hl - 0.2 * K]);
      ctx.fillStyle = KEKE.body;
      ctx.fill();
      ctx.strokeStyle = shade(KEKE.body, -0.5);
      ctx.lineWidth = 0.02;
      ctx.stroke();
      oval(ctx, 0, hl - 0.75 * K, 0.1, 0.08);
      ctx.fillStyle = "#efe6c8";
      ctx.fill();
      poly(ctx, [-0.42, hl - 1.15 * K, 0.42, hl - 1.15 * K, 0.5, hl - H * K + 0.1, -0.5, hl - H * K + 0.1]);
      ctx.fillStyle = alpha(PAL.glass, 0.85);
      ctx.fill();
      // the driver sits in the shade behind the windscreen
      if (riders.length) {
        oval(ctx, 0, hl - 1.45 * K, 0.13, 0.15);
        ctx.fillStyle = "rgba(20,14,10,0.55)";
        ctx.fill();
      }
      wheel(ctx, 0, hl - 0.18 * K, 0.2, false);
      for (const s of [-1, 1]) wheel(ctx, s * 0.6, -hl + 0.6 * G, 0.2, false);
    } else {
      rrect(ctx, -W / 2, hl - 0.8 * K, W, 0.6 * K, 0.08);
      ctx.fillStyle = KEKE.body;
      ctx.fill();
      ctx.fillStyle = KEKE.trim;
      ctx.fillRect(-W / 2, hl - 0.55 * K, W, 0.08);
      for (const s of [-1, 1]) {
        rrect(ctx, s * 0.45 - 0.08, hl - 0.75 * K, 0.16, 0.08, 0.02);
        ctx.fillStyle = "#a8201a";
        ctx.fill();
      }
      label(ctx, "GOD DEY", 0, hl - 0.35 * K, 0.11, "#f3e9cf");
      for (const s of [-1, 1]) wheel(ctx, s * 0.58, hl - 0.18 * K, 0.21, false);
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- okada

/** Commuter motorcycle (Bajaj Boxer-style) with rider and optional passenger. */
export function drawOkada(ctx: Ctx, dir: Dir, rider: PersonSpec, passenger?: PersonSpec) {
  ctx.save();
  if (dir === "W") ctx.scale(-1, 1);
  if (dir === "E" || dir === "W") {
    groundShadow(ctx, 0.05, 0.05, 1.0, 0.3, 0.28);
    const r = 0.3;
    const y = -r * K;
    // frame, tank, seat
    line(ctx, -0.65, y, 0.0, y - 0.25, "#222", 0.05);
    line(ctx, 0.0, y - 0.25, 0.65, y, "#222", 0.04);
    line(ctx, 0.55, y - 0.65, 0.65, y, "#555", 0.035); // fork
    rrect(ctx, -0.2, y - 0.42, 0.42, 0.18, 0.06); // tank
    ctx.fillStyle = "#b02a22";
    ctx.fill();
    rrect(ctx, -0.65, y - 0.38, 0.6, 0.09, 0.04); // long seat
    ctx.fillStyle = "#1c1a19";
    ctx.fill();
    rrect(ctx, -0.25, y - 0.12, 0.3, 0.16, 0.03); // engine
    ctx.fillStyle = "#4a4a48";
    ctx.fill();
    line(ctx, -0.2, y + 0.02, -0.8, y - 0.08, "#8b8c8a", 0.035); // exhaust
    if (passenger) {
      ctx.save();
      ctx.translate(-0.45, 0);
      drawPerson(ctx, passenger, "E", "sit", 0, 0.82);
      ctx.restore();
    }
    ctx.save();
    ctx.translate(-0.08, 0);
    drawPerson(ctx, rider, "E", "sit", 0, 0.82);
    ctx.restore();
    line(ctx, 0.42, y - 0.75, 0.6, y - 0.68, "#222", 0.03); // handlebar
    oval(ctx, 0.66, y - 0.58, 0.06, 0.07); // headlamp
    ctx.fillStyle = "#efe6c8";
    ctx.fill();
    for (const x of [-0.62, 0.66]) wheel(ctx, x, y, r, true);
  } else {
    groundShadow(ctx, 0.05, 0.05, 0.35, 0.9, 0.28);
    const front = dir === "S";
    if (passenger) {
      ctx.save();
      ctx.translate(0, -0.45 * G);
      drawPerson(ctx, passenger, dir, "sit", 0, 0.82);
      ctx.restore();
    }
    wheel(ctx, 0, (front ? -0.6 : 0.65) * G, 0.3, false);
    ctx.save();
    ctx.translate(0, 0);
    drawPerson(ctx, rider, dir, "sit", 0, 0.82);
    ctx.restore();
    if (front) {
      line(ctx, -0.36, -0.95, 0.36, -0.95, "#222", 0.03);
      oval(ctx, 0, -0.78, 0.08, 0.07);
      ctx.fillStyle = "#efe6c8";
      ctx.fill();
      wheel(ctx, 0, 0.62 * G, 0.3, false);
    } else {
      rrect(ctx, -0.1, -0.55, 0.2, 0.08, 0.02);
      ctx.fillStyle = "#a8201a";
      ctx.fill();
    }
  }
  ctx.restore();
}
