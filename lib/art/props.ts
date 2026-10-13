// Omo Ibadan art kit — small yard props. Origin is the object's centre on the ground.

import { G, K, alpha, groundShadow, line, oval, rng, rrect, shade, type Ctx } from "./core";
import { PAL } from "./palette";

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
