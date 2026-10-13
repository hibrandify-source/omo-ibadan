// Omo Ibadan art kit — small yard props. Origin is the object's centre on the ground.

import { G, K, alpha, groundShadow, line, oval, rng, rrect, shade, type Ctx } from "./core";
import { PAL } from "./palette";
import { drawBuilding } from "./buildings";

/** Three-stone firewood fire with a big soup pot and a smaller one. */
export function drawPots(ctx: Ctx, t = 0) {
  groundShadow(ctx, 0.1, 0.1, 1.0, 0.5, 0.25);
  // ash patch + firewood
  oval(ctx, 0, 0, 0.9, 0.45 * G);
  ctx.fillStyle = "rgba(60,50,45,0.55)";
  ctx.fill();
  for (const [a, b] of [[-0.8, 0.2], [0.75, -0.1], [-0.2, 0.35]]) line(ctx, a, b * G, a * 0.2, 0, PAL.woodDark, 0.07);
  // glowing embers
  oval(ctx, -0.05, 0.02, 0.22, 0.08);
  ctx.fillStyle = `rgba(240,${120 + Math.round(Math.sin(t * 6) * 30)},40,0.85)`;
  ctx.fill();
  // big black pot on three stones
  for (const x of [-0.35, 0.35, 0]) {
    oval(ctx, x, (x === 0 ? 0.25 : -0.1) * G, 0.12, 0.08);
    ctx.fillStyle = "#6f665c";
    ctx.fill();
  }
  rrect(ctx, -0.42, -0.62 * K, 0.84, 0.5 * K, 0.18);
  ctx.fillStyle = "#1e1c1a";
  ctx.fill();
  oval(ctx, 0, -0.62 * K, 0.42, 0.2 * G + 0.05);
  ctx.fillStyle = "#2a2724";
  ctx.fill();
  oval(ctx, 0, -0.62 * K, 0.36, 0.16 * G + 0.04);
  ctx.fillStyle = "#c9a23a"; // gbegiri
  ctx.fill();
  // smaller pot of ewedu beside it
  rrect(ctx, 0.55, -0.34 * K, 0.42, 0.3 * K, 0.1);
  ctx.fillStyle = "#3a3633";
  ctx.fill();
  oval(ctx, 0.76, -0.34 * K, 0.21, 0.1 * G + 0.03);
  ctx.fillStyle = "#3f6b2a";
  ctx.fill();
  // steam
  for (let i = 0; i < 3; i++) {
    const k = (t * 0.5 + i / 3) % 1;
    oval(ctx, Math.sin(k * 6 + i) * 0.1, -0.7 * K - k * 1.1, 0.12 + k * 0.2, 0.08 + k * 0.12);
    ctx.fillStyle = `rgba(255,255,255,${0.35 * (1 - k)})`;
    ctx.fill();
  }
}

/** Plastic water drum with a lid. */
export function drawDrum(ctx: Ctx, color: string) {
  groundShadow(ctx, 0.05, 0.05, 0.38, 0.22, 0.25);
  const h = 0.9 * K;
  rrect(ctx, -0.32, -h, 0.64, h, 0.08);
  const g = ctx.createLinearGradient(-0.32, 0, 0.32, 0);
  g.addColorStop(0, shade(color, 0.15));
  g.addColorStop(0.5, color);
  g.addColorStop(1, shade(color, -0.35));
  ctx.fillStyle = g;
  ctx.fill();
  for (const y of [0.25, 0.55]) line(ctx, -0.32, -h * y, 0.32, -h * y, alpha(shade(color, -0.4), 0.6), 0.02);
  oval(ctx, 0, -h, 0.32, 0.32 * G * 0.6);
  ctx.fillStyle = shade(color, -0.2);
  ctx.fill();
  oval(ctx, 0, -h, 0.14, 0.14 * G * 0.6);
  ctx.fillStyle = shade(color, -0.45);
  ctx.fill();
}

/** Gateman's post: a small plastered hut with a zinc roof and a barred window. Origin centre. */
export function drawBooth(ctx: Ctx) {
  ctx.save();
  ctx.translate(-0.9, -0.8 * G);
  drawBuilding(ctx, {
    w: 1.8, d: 1.6, h: 2.4, roof: "hip", rise: 0.5, wall: PAL.plaster[3], wallKind: "plaster", rust: 0.6, seed: 77,
    openings: [{ x: 0.4, kind: "window", width: 0.9 }],
  });
  ctx.restore();
}

/** Big soundproof house generator in its canopy. Origin centre. */
export function drawBigGen(ctx: Ctx, running = false, t = 0) {
  groundShadow(ctx, 0.2, 0.1, 1.6, 0.7, 0.28);
  const w = 2.6, d = 1.1 * G, h = 1.4 * K;
  ctx.fillStyle = "#2f5e8a";
  ctx.fillRect(-w / 2, d / 2 - h, w, h);
  rrect(ctx, -w / 2, -d / 2 - h, w, d, 0.05);
  ctx.fillStyle = "#3a6f9e";
  ctx.fill();
  for (let i = 0; i < 6; i++) line(ctx, -w / 2 + 0.3 + i * 0.12, d / 2 - h + 0.25, -w / 2 + 0.3 + i * 0.12, d / 2 - 0.25, "#1f3f5e", 0.04);
  ctx.strokeStyle = "#1b3550";
  ctx.lineWidth = 0.03;
  ctx.strokeRect(-w / 2, d / 2 - h, w, h);
  if (running) {
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.6 + i / 3) % 1;
      oval(ctx, w / 2 - 0.2 + k * 0.3, -d / 2 - h - k * 1.2, 0.12 + k * 0.2, 0.08 + k * 0.12);
      ctx.fillStyle = `rgba(80,80,80,${0.3 * (1 - k)})`;
      ctx.fill();
    }
  }
}

/** Clipped ixora hedge running along x from the origin. */
export function drawHedge(ctx: Ctx, w: number, seed = 3) {
  const r = rng(seed);
  const h = 0.9 * K;
  ctx.fillStyle = "rgba(20,12,6,0.2)";
  ctx.fillRect(0.1, -0.1, w, 0.35);
  rrect(ctx, 0, -h - 0.35 * G, w, h + 0.35 * G, 0.15);
  ctx.fillStyle = PAL.treeDark;
  ctx.fill();
  for (let x = 0.1; x < w; x += 0.18) {
    oval(ctx, x, -h - 0.2 * G + (r() - 0.5) * 0.1, 0.13, 0.1);
    ctx.fillStyle = r() < 0.5 ? PAL.tree : PAL.treeLight;
    ctx.fill();
    if (r() < 0.35) {
      oval(ctx, x + 0.05, -h - 0.25 * G, 0.05, 0.04);
      ctx.fillStyle = "#d8322a"; // ixora flowers
      ctx.fill();
    }
  }
}

/** A raised flower bed with a painted kerb. Origin at its west end. */
export function drawFlowers(ctx: Ctx, w: number, seed = 9) {
  const r = rng(seed);
  ctx.fillStyle = "#e9e3d6";
  ctx.fillRect(0, -0.6 * G - 0.12, w, 0.12);
  ctx.fillStyle = PAL.lateriteDark;
  ctx.fillRect(0, -0.6 * G, w, 0.6 * G);
  for (let x = 0.15; x < w; x += 0.3) {
    const cy = -0.3 * G - 0.15 + (r() - 0.5) * 0.15;
    oval(ctx, x, cy, 0.16, 0.12);
    ctx.fillStyle = PAL.tree;
    ctx.fill();
    oval(ctx, x + 0.04, cy - 0.08, 0.06, 0.05);
    ctx.fillStyle = ["#e9b22a", "#d8322a", "#f2efe6", "#b0479a"][Math.floor(r() * 4)];
    ctx.fill();
  }
}

/** A few chickens pecking around. */
export function drawChickens(ctx: Ctx, n: number, t = 0, seed = 5) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const bx = (r() - 0.5) * 3 + Math.sin(t * 0.4 + i) * 0.4;
    const by = (r() - 0.5) * 1.6;
    const peck = Math.max(0, Math.sin(t * 3 + i * 2));
    const face = Math.sin(t * 0.4 + i) > 0 ? 1 : -1;
    ctx.save();
    ctx.translate(bx, by * G);
    ctx.scale(face, 1);
    groundShadow(ctx, 0, 0, 0.18, 0.08, 0.2);
    const col = i % 3 === 0 ? "#8a4a2a" : "#efe9de";
    oval(ctx, 0, -0.18, 0.16, 0.11);
    ctx.fillStyle = col;
    ctx.fill();
    oval(ctx, 0.14, -0.27 + peck * 0.1, 0.07, 0.065);
    ctx.fillStyle = col;
    ctx.fill();
    oval(ctx, 0.15, -0.33 + peck * 0.1, 0.03, 0.025);
    ctx.fillStyle = "#c8261c";
    ctx.fill();
    line(ctx, 0.2, -0.27 + peck * 0.1, 0.25, -0.26 + peck * 0.1, "#e8a020", 0.025);
    line(ctx, -0.03, -0.08, -0.03, 0, "#e8a020", 0.015);
    line(ctx, 0.04, -0.08, 0.04, 0, "#e8a020", 0.015);
    ctx.restore();
  }
}
