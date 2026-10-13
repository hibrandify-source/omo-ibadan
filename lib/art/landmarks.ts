// Omo Ibadan art kit — landmark pieces: aircraft, control tower, mosque,
// tennis court, golf green, suya spot, porter's wheelbarrow.

import { G, K, alpha, groundShadow, label, line, oval, poly, rng, rrect, shade, type Ctx } from "./core";
import { PAL } from "./palette";

/** Regional turboprop parked on the apron, nose east. Origin = centre of the fuselage on the ground. */
export function drawPlane(ctx: Ctx, livery = "#1f6b4a") {
  const L = 22;
  const body = 2.6 * K; // fuselage diameter on screen
  const cy = -2.9 * K; // fuselage centre height
  groundShadow(ctx, 1, 0.3, L * 0.5, 3.5, 0.25);
  // far wing (behind fuselage), seen from above
  poly(ctx, [-1.5, cy + 0.2, 1.5, cy + 0.2, 0.2, cy - 13 * G, -2.4, cy - 13 * G]);
  ctx.fillStyle = shade("#e9e6de", -0.12);
  ctx.fill();
  // landing gear
  for (const x of [-1.2, 1.2]) {
    line(ctx, x, cy + body / 2, x, -0.4, "#3a3a3a", 0.12);
    oval(ctx, x, -0.35, 0.4, 0.35);
    ctx.fillStyle = "#151413";
    ctx.fill();
  }
  line(ctx, L / 2 - 2.5, cy + body / 2, L / 2 - 2.5, -0.3, "#3a3a3a", 0.1);
  oval(ctx, L / 2 - 2.5, -0.3, 0.3, 0.28);
  ctx.fillStyle = "#151413";
  ctx.fill();
  // tail fin + stabiliser
  poly(ctx, [-L / 2 + 0.6, cy - body / 2, -L / 2 + 3.6, cy - body / 2, -L / 2 + 1.6, cy - 4.4 * K, -L / 2 + 0.2, cy - 4.6 * K]);
  ctx.fillStyle = livery;
  ctx.fill();
  poly(ctx, [-L / 2 + 0.2, cy - 4.3 * K, -L / 2 + 3, cy - 4.3 * K, -L / 2 + 2.6, cy - 4.0 * K, -L / 2 + 0, cy - 4.0 * K]);
  ctx.fillStyle = shade(livery, -0.2);
  ctx.fill();
  // fuselage
  rrect(ctx, -L / 2, cy - body / 2, L, body, body / 2);
  const g = ctx.createLinearGradient(0, cy - body / 2, 0, cy + body / 2);
  g.addColorStop(0, "#fbfaf6");
  g.addColorStop(0.6, "#e6e3dc");
  g.addColorStop(1, "#bdb9b0");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.fillStyle = livery;
  ctx.fillRect(-L / 2 + 1, cy + 0.15, L - 3, 0.28);
  for (let x = -L / 2 + 3; x < L / 2 - 3.5; x += 0.85) {
    rrect(ctx, x, cy - 0.45, 0.32, 0.4, 0.12);
    ctx.fillStyle = "#2c383d";
    ctx.fill();
  }
  rrect(ctx, L / 2 - 1.6, cy - 0.7, 0.9, 0.42, 0.12); // cockpit
  ctx.fillStyle = "#2c383d";
  ctx.fill();
  rrect(ctx, L / 2 - 4.6, cy - 0.9, 0.8, 1.6, 0.1); // door
  ctx.strokeStyle = "#9a978f";
  ctx.lineWidth = 0.05;
  ctx.stroke();
  label(ctx, "IBADAN AIR", -1, cy - 0.85, 0.55, livery, 900);
  // near wing + engine with propeller
  poly(ctx, [-1.6, cy + 0.4, 1.6, cy + 0.4, 0.4, cy + 12 * G, -2.4, cy + 12 * G]);
  ctx.fillStyle = "#efece5";
  ctx.fill();
  ctx.strokeStyle = "#bdb9b0";
  ctx.stroke();
  rrect(ctx, 0.2, cy + 3.2 * G - 0.3, 2.4, 0.75, 0.3);
  ctx.fillStyle = "#e6e3dc";
  ctx.fill();
  line(ctx, 2.7, cy + 3.2 * G - 1.1, 2.7, cy + 3.2 * G + 1.0, alpha("#3a3a3a", 0.7), 0.1);
}

/** Small airport control tower. Origin = centre of its base on the ground. */
export function drawControlTower(ctx: Ctx) {
  const shaftH = 12 * K;
  groundShadow(ctx, 2, 0.4, 3, 1.2, 0.25);
  rrect(ctx, -2.2, -3.2 * K, 4.4, 3.2 * K, 0.05);
  ctx.fillStyle = "#e6e0d2";
  ctx.fill();
  ctx.fillStyle = "#cfc8b8";
  ctx.fillRect(-1, -shaftH, 2, shaftH - 3.2 * K);
  ctx.fillStyle = "#b9b1a0";
  ctx.fillRect(0.6, -shaftH, 0.4, shaftH - 3.2 * K);
  // glass cab
  poly(ctx, [-2.2, -shaftH, 2.2, -shaftH, 1.8, -shaftH - 2.2, -1.8, -shaftH - 2.2]);
  ctx.fillStyle = "#4e6a74";
  ctx.fill();
  for (let i = -3; i <= 3; i++) line(ctx, i * 0.55, -shaftH, i * 0.48, -shaftH - 2.2, "#2d3a3f", 0.06);
  rrect(ctx, -2.4, -shaftH - 2.6, 4.8, 0.45, 0.06);
  ctx.fillStyle = "#e9e4d9";
  ctx.fill();
  line(ctx, 0, -shaftH - 2.6, 0, -shaftH - 4.4, "#3a3a3a", 0.06);
  oval(ctx, 0, -shaftH - 4.4, 0.15, 0.15);
  ctx.fillStyle = "#e0281c";
  ctx.fill();
}

/** A neighbourhood mosque: hall, green dome, one minaret. Origin NW corner of the hall. */
export function drawMosque(ctx: Ctx, w = 12, d = 9) {
  const h = 4.5 * K;
  const D = d * G;
  ctx.fillStyle = "rgba(25,12,6,0.22)";
  ctx.fillRect(w, 0.2, 3, D);
  // hall walls with arched windows
  ctx.fillStyle = "#f1ede4";
  ctx.fillRect(0, D - h, w, h);
  for (let x = 1; x < w - 1; x += 1.8) {
    ctx.beginPath();
    ctx.moveTo(x, D - 0.9);
    ctx.lineTo(x, D - h + 1.4);
    ctx.quadraticCurveTo(x + 0.45, D - h + 0.7, x + 0.9, D - h + 1.4);
    ctx.lineTo(x + 0.9, D - 0.9);
    ctx.closePath();
    ctx.fillStyle = "#2f6b4a";
    ctx.fill();
  }
  // flat roof and green dome
  ctx.fillStyle = "#d9d3c6";
  ctx.fillRect(0, -h, w, D);
  ctx.beginPath();
  ctx.ellipse(w / 2, D / 2 - h, w * 0.26, w * 0.26, 0, Math.PI, 0);
  ctx.closePath();
  const g = ctx.createLinearGradient(w / 4, 0, (w * 3) / 4, 0);
  g.addColorStop(0, "#3f9a63");
  g.addColorStop(1, "#1f6b4a");
  ctx.fillStyle = g;
  ctx.fill();
  line(ctx, w / 2, D / 2 - h - w * 0.26, w / 2, D / 2 - h - w * 0.26 - 0.9, "#c9a24a", 0.08);
  // minaret
  const mx = w - 1.2;
  const mh = 13 * K;
  ctx.fillStyle = "#f1ede4";
  ctx.fillRect(mx - 0.6, D - mh, 1.2, mh);
  ctx.fillStyle = "#d9d3c6";
  ctx.fillRect(mx - 0.9, D - mh * 0.72, 1.8, 0.3);
  ctx.beginPath();
  ctx.ellipse(mx, D - mh, 0.7, 0.9, 0, Math.PI, 0);
  ctx.fillStyle = "#1f6b4a";
  ctx.fill();
  // door
  rrect(ctx, w / 2 - 0.8, D - 2.4 * K, 1.6, 2.4 * K, 0.4);
  ctx.fillStyle = "#6b4428";
  ctx.fill();
}

/** Tennis court (ground-flat, 24 × 11 m) with net and lights. Origin NW corner. */
export function drawTennisCourt(ctx: Ctx) {
  ctx.save();
  ctx.scale(1, G);
  ctx.fillStyle = "#3f7d5a";
  ctx.fillRect(-2, -2, 28, 15);
  ctx.fillStyle = "#2f6b8f";
  ctx.fillRect(0, 0, 24, 11);
  ctx.strokeStyle = "#f3f1ea";
  ctx.lineWidth = 0.08;
  ctx.strokeRect(0, 0, 24, 11);
  ctx.strokeRect(0, 1.37, 24, 8.26);
  line(ctx, 5.5, 1.37, 5.5, 9.63, "#f3f1ea", 0.08);
  line(ctx, 18.5, 1.37, 18.5, 9.63, "#f3f1ea", 0.08);
  line(ctx, 5.5, 5.5, 18.5, 5.5, "#f3f1ea", 0.08);
  ctx.restore();
  // net
  line(ctx, 12, -0.2, 12, 11 * G + 0.2, "#e9e6de", 0.06);
  line(ctx, 12, -1.0 * K, 12, 11 * G - 1.0 * K, "#2b2b2b", 0.04);
  for (const y of [0, 11 * G]) line(ctx, 12, y, 12, y - 1.0 * K, "#2b2b2b", 0.08);
}

/** A putting green with its flag and a sand bunker. Origin = the hole. */
export function drawGolfGreen(ctx: Ctx, t = 0) {
  oval(ctx, 0, 0, 7, 4.2 * G);
  ctx.fillStyle = "#7fb04a";
  ctx.fill();
  oval(ctx, 0, 0, 5.5, 3.2 * G);
  ctx.fillStyle = "#8fc055";
  ctx.fill();
  for (let i = 0; i < 6; i++) line(ctx, -5 + i * 2, -2 * G, -5.5 + i * 2, 2 * G, "rgba(255,255,255,0.08)", 0.5);
  oval(ctx, 6.5, 2.6 * G, 2.6, 1.3 * G);
  ctx.fillStyle = "#e6d3a3";
  ctx.fill();
  oval(ctx, 0, 0, 0.12, 0.07);
  ctx.fillStyle = "#1c1c1c";
  ctx.fill();
  line(ctx, 0, 0, 0, -2.3 * K, "#f2f1ec", 0.05);
  const wave = Math.sin(t * 3) * 0.1;
  poly(ctx, [0, -2.3 * K, 0.95, -2.12 * K + wave, 0, -1.95 * K]);
  ctx.fillStyle = "#d8322a";
  ctx.fill();
}

/** Suya spot: charcoal grill on a table, skewers, smoke, a lantern for the evening. Origin centre. */
export function drawSuya(ctx: Ctx, t = 0) {
  const r = rng(4);
  groundShadow(ctx, 0.2, 0.1, 1.1, 0.5, 0.25);
  rrect(ctx, -1, -0.8 * K - 0.5 * G, 2, 0.5 * G, 0.04);
  ctx.fillStyle = "#3a3633";
  ctx.fill();
  ctx.fillStyle = "#2b2826";
  ctx.fillRect(-1, -0.8 * K, 2, 0.8 * K);
  // glowing coals and sticks of beef
  for (let i = 0; i < 12; i++) {
    oval(ctx, -0.85 + r() * 1.7, -0.8 * K - 0.25 * G + (r() - 0.5) * 0.15, 0.06, 0.04);
    ctx.fillStyle = `rgba(240,${110 + Math.round(r() * 60)},40,${0.6 + 0.3 * Math.sin(t * 5 + i)})`;
    ctx.fill();
  }
  for (let i = 0; i < 7; i++) {
    const x = -0.8 + i * 0.27;
    line(ctx, x, -0.8 * K - 0.05, x + 0.1, -0.8 * K - 0.45 * G, "#c9a96e", 0.02);
    rrect(ctx, x - 0.03, -0.8 * K - 0.35 * G, 0.12, 0.16, 0.03);
    ctx.fillStyle = "#6b2f1a";
    ctx.fill();
  }
  for (let i = 0; i < 3; i++) {
    const k = (t * 0.5 + i / 3) % 1;
    oval(ctx, Math.sin(k * 5) * 0.2, -0.9 * K - k * 1.6, 0.18 + k * 0.3, 0.12 + k * 0.2);
    ctx.fillStyle = `rgba(200,200,200,${0.35 * (1 - k)})`;
    ctx.fill();
  }
  // hurricane lantern
  line(ctx, 0.85, -0.8 * K - 0.25 * G, 0.85, -0.8 * K - 0.25 * G - 0.4, "#555", 0.03);
  oval(ctx, 0.85, -0.8 * K - 0.25 * G - 0.5, 0.1, 0.13);
  ctx.fillStyle = "#ffd36b";
  ctx.fill();
}

/**
 * A high-rise office tower (Cocoa House, 1965: the first skyscraper in West
 * Africa). Origin NW corner of its footprint.
 */
export function drawTower(ctx: Ctx, opts: { w: number; d: number; floors: number; name?: string }) {
  const { w, d, floors } = opts;
  const D = d * G;
  const fh = 3.3 * K; // floor height on screen
  const H = floors * fh;
  ctx.fillStyle = "rgba(25,12,6,0.25)";
  ctx.fillRect(w, 0.3, H * 0.25, D);
  // front face
  ctx.fillStyle = "#e6dfcf";
  ctx.fillRect(0, D - H, w, H);
  for (let f = 0; f < floors; f++) {
    const y = D - (f + 1) * fh;
    ctx.fillStyle = "#cfc6b2";
    ctx.fillRect(0, y + fh - 0.25, w, 0.25); // floor band
    for (let x = 0.5; x < w - 0.6; x += 1.4) {
      ctx.fillStyle = (f * 7 + Math.round(x)) % 9 === 0 ? "#f2d27a" : "#3a4a52"; // a few lit offices
      ctx.fillRect(x, y + 0.6, 0.9, fh - 1.1);
    }
  }
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(w * 0.7, D - H, w * 0.3, H);
  // roof slab, plant room and mast
  rrect(ctx, -0.3, D - H - D - 0.2, w + 0.6, D + 0.2, 0.05);
  ctx.fillStyle = "#bdb5a3";
  ctx.fill();
  ctx.fillStyle = "#d9d2c2";
  ctx.fillRect(w * 0.3, D - H - D - 2.2, w * 0.4, 2.2);
  line(ctx, w * 0.5, D - H - D - 2.2, w * 0.5, D - H - D - 7, "#555", 0.12);
  oval(ctx, w * 0.5, D - H - D - 7, 0.18, 0.18);
  ctx.fillStyle = "#e0281c";
  ctx.fill();
  if (opts.name) {
    rrect(ctx, w * 0.15, D - 4.4 * K, w * 0.7, 0.8, 0.04);
    ctx.fillStyle = "#5a3a24";
    ctx.fill();
    label(ctx, opts.name, w / 2, D - 4.4 * K + 0.4, 0.45, "#f3efe4", 900);
  }
  // ground-floor entrance
  ctx.fillStyle = "#2c383d";
  ctx.fillRect(w / 2 - 1.5, D - 2.6 * K, 3, 2.6 * K);
}

/** A shopping mall: long glass front, brand-free signage, canopy. Origin NW corner. */
export function drawMall(ctx: Ctx, opts: { w: number; d: number; name: string }) {
  const { w, d, name } = opts;
  const D = d * G;
  const h = 7.5 * K;
  ctx.fillStyle = "rgba(25,12,6,0.22)";
  ctx.fillRect(w, 0.3, 3, D);
  ctx.fillStyle = "#d9d6cf";
  ctx.fillRect(0, -h, w, D); // roof
  for (let x = 2; x < w - 2; x += 6) {
    rrect(ctx, x, -h + D * 0.3, 1.6, 1.0, 0.05);
    ctx.fillStyle = "#c2bfb7";
    ctx.fill();
  }
  ctx.fillStyle = "#f1efe9";
  ctx.fillRect(0, D - h, w, h);
  // glass shopfronts
  for (let x = 0.8; x < w - 1; x += 4.2) {
    const gr = ctx.createLinearGradient(x, 0, x + 3.6, 0);
    gr.addColorStop(0, "#5a7a86");
    gr.addColorStop(1, "#8fb0ba");
    ctx.fillStyle = gr;
    ctx.fillRect(x, D - 3.4 * K, 3.6, 3.2 * K);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(x + 0.3, D - 3.3 * K, 0.6, 3.0 * K);
  }
  ctx.fillStyle = "#c9322a";
  ctx.fillRect(0, D - h, w, 1.0);
  label(ctx, name, w / 2, D - h + 0.5, 0.6, "#f3efe4", 900);
  // canopy over the walkway
  ctx.fillStyle = "rgba(60,60,60,0.85)";
  ctx.fillRect(-0.2, D - 3.6 * K, w + 0.4, 0.2);
}

/** Open water (a reservoir or lake) with reeds at the edge. Flat; origin NW corner. */
export function drawLake(ctx: Ctx, w: number, h: number, seed = 1) {
  const r = rng(seed);
  ctx.save();
  ctx.scale(1, G);
  ctx.beginPath();
  ctx.moveTo(0, h * 0.3);
  ctx.quadraticCurveTo(w * 0.1, -h * 0.05, w * 0.4, 0.4);
  ctx.quadraticCurveTo(w * 0.8, -0.3, w, h * 0.25);
  ctx.quadraticCurveTo(w * 1.02, h * 0.8, w * 0.75, h);
  ctx.quadraticCurveTo(w * 0.35, h * 1.05, w * 0.05, h * 0.8);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#4b7f88");
  g.addColorStop(1, "#356a73");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "#7a6a45";
  ctx.lineWidth = 0.6;
  ctx.stroke();
  for (let i = 0; i < 40; i++) {
    const x = w * 0.1 + r() * w * 0.8, y = h * 0.15 + r() * h * 0.7;
    line(ctx, x, y, x + 0.8 + r() * 1.5, y, "rgba(255,255,255,0.18)", 0.06);
  }
  ctx.restore();
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2;
    const x = w / 2 + Math.cos(a) * w * 0.5, y = (h / 2 + Math.sin(a) * h * 0.5) * G;
    for (let k = 0; k < 4; k++) line(ctx, x + k * 0.08, y, x + k * 0.08 + (r() - 0.5) * 0.2, y - 0.6 - r() * 0.5, "#5a6e2e", 0.04);
  }
}

/** Porter's wheelbarrow loaded with sacks (alabaru). Origin = wheel on the ground; handles point west. */
export function drawWheelbarrow(ctx: Ctx, load: "sacks" | "cartons" = "sacks") {
  groundShadow(ctx, -0.6, 0.05, 1.0, 0.35, 0.25);
  oval(ctx, 0, -0.25, 0.25, 0.25);
  ctx.fillStyle = "#1c1c1c";
  ctx.fill();
  poly(ctx, [-1.4, -0.5, 0.1, -0.45, 0.3, -0.95, -1.5, -1.0]);
  ctx.fillStyle = "#4f7a8a";
  ctx.fill();
  line(ctx, -1.4, -0.55, -2.2, -0.75, "#5a4632", 0.06);
  line(ctx, -1.2, -0.5, -1.2, 0, "#3a3a3a", 0.05);
  for (let i = 0; i < 3; i++) {
    rrect(ctx, -1.35 + i * 0.5, -1.45 - (i % 2) * 0.12, 0.55, 0.55, 0.15);
    ctx.fillStyle = load === "sacks" ? (i % 2 ? "#e9e3d6" : "#d9cfb8") : (i % 2 ? "#b88a54" : "#a8794a");
    ctx.fill();
    if (load === "sacks") label(ctx, "GARRI", -1.07 + i * 0.5, -1.18 - (i % 2) * 0.12, 0.09, alpha(PAL.paintRed, 0.8), 900);
  }
}
