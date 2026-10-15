// Omo Ibadan art kit — the landing view: dusk over the brown roofs of the old
// city, Mapo Hall on its hill, Cocoa House on the skyline, and a street in
// front with a micra, an okada and people heading home.
//
// Coordinates here are screen metres: x across, y down from the top of the
// view (HERO_H tall). Distant rows are drawn smaller, near ones larger.

import { G, TILT_STREET, rng, setTilt, type Ctx } from "./core";
import { PAL } from "./palette";
import { drawBuilding, drawCivicHall, type BuildingSpec } from "./buildings";
import { drawTower } from "./landmarks";
import { drawPalm, drawPole, drawUmbrellaStall } from "./ground";
import { drawPerson } from "./people";
import { CAST } from "./cast";
import { CARS, drawCar, drawKeke, drawOkada } from "./vehicles";

export const HERO_H = 14;
const HORIZON = 7.4;
const ROAD_TOP = 11.3;
const ROAD_BOT = 12.9;

function roofSpec(r: () => number): BuildingSpec {
  const w = 5.5 + r() * 5;
  return {
    w, d: 5.5 + r() * 2, h: 2.8 + (r() < 0.15 ? 2.6 : 0),
    roof: r() < 0.55 ? "hip" : "gable",
    wall: PAL.plaster[Math.floor(r() * PAL.plaster.length)],
    wallKind: r() < 0.2 ? "block" : "plaster",
    rust: 0.75 + r() * 0.25,
    seed: Math.floor(r() * 1e6),
    storeys: 1,
    openings: [{ x: 0.8, kind: "shutter" }, { x: w / 2 - 0.45, kind: "door" }, { x: w - 2, kind: "shutter" }],
  };
}

/** A row of houses whose fronts sit on screen line `base`, drawn at `scale`. */
function roofRow(ctx: Ctx, x0: number, x1: number, base: number, scale: number, seed: number) {
  const r = rng(seed);
  let x = x0 - r() * 4 * scale;
  while (x < x1) {
    const spec = roofSpec(r);
    ctx.save();
    ctx.translate(x, base - spec.d * G * scale + (r() - 0.5) * 0.25 * scale);
    ctx.scale(scale, scale);
    drawBuilding(ctx, spec);
    ctx.restore();
    x += (spec.w + 0.3 + r() * 1.2) * scale;
  }
}

/** Sky, hill, landmarks and the sea of roofs: drawn once, cached by the caller. */
export function drawHeroBackdrop(ctx: Ctx, viewW: number) {
  const cx = viewW / 2;
  // from this far away you see the city almost side-on, not from above
  setTilt(0.3);
  // dusk sky
  const sky = ctx.createLinearGradient(0, 0, 0, HORIZON + 1);
  sky.addColorStop(0, "#2b1733");
  sky.addColorStop(0.55, "#8a3b2e");
  sky.addColorStop(1, "#e08a3a");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, viewW, HORIZON + 2);
  // the sun going down behind the city
  const sx = cx + Math.min(14, viewW * 0.33), sy = HORIZON - 0.4;
  const glow = ctx.createRadialGradient(sx, sy, 0.2, sx, sy, 6);
  glow.addColorStop(0, "rgba(255,214,140,0.95)");
  glow.addColorStop(0.25, "rgba(255,170,90,0.45)");
  glow.addColorStop(1, "rgba(255,170,90,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(sx - 6, sy - 6, 12, 12);
  ctx.beginPath();
  ctx.arc(sx, sy, 1.1, 0, Math.PI * 2);
  ctx.fillStyle = "#ffe2a8";
  ctx.fill();

  // Cocoa House on the far skyline
  ctx.save();
  ctx.translate(cx + Math.min(9, viewW * 0.22), HORIZON + 0.35);
  ctx.scale(0.085, 0.085);
  ctx.translate(0, -14 * G);
  drawTower(ctx, { w: 18, d: 14, floors: 26 });
  ctx.restore();

  // Mapo hill with the hall on top
  ctx.fillStyle = "#5a3324";
  ctx.beginPath();
  ctx.moveTo(cx - 13, HORIZON + 1.2);
  ctx.bezierCurveTo(cx - 7, HORIZON - 0.6, cx - 4, HORIZON - 1.5, cx - 1.5, HORIZON - 1.5);
  ctx.bezierCurveTo(cx + 1, HORIZON - 1.5, cx + 4, HORIZON - 0.6, cx + 10, HORIZON + 1.2);
  ctx.closePath();
  ctx.fill();
  ctx.save();
  ctx.translate(cx - 4.2, HORIZON - 1.15 - 12 * G * 0.24); // sits into the crest, not on top of it
  ctx.scale(0.24, 0.24);
  drawCivicHall(ctx, { w: 22, d: 12, h: 6, name: "MAPO HALL", seed: 31 });
  ctx.restore();

  // the old city: rows of rusty roofs, far to near
  const rows: [number, number, number][] = [
    [HORIZON + 0.9, 0.22, 11], [HORIZON + 1.4, 0.26, 12], [HORIZON + 1.9, 0.3, 13],
    [HORIZON + 2.5, 0.35, 14], [HORIZON + 3.1, 0.4, 15], [HORIZON + 3.7, 0.46, 16],
  ];
  rows.forEach(([base, scale, seed], i) => {
    roofRow(ctx, -2, viewW + 2, base, scale, seed);
    // evening haze: the further, the hazier
    ctx.fillStyle = `rgba(150,70,55,${0.26 - i * 0.04})`;
    ctx.fillRect(0, HORIZON - 2.4, viewW, base + 0.2 - (HORIZON - 2.4));
  });
  // a few palms and poles among the roofs
  const r = rng(77);
  for (let i = 0; i < Math.ceil(viewW / 7); i++) {
    ctx.save();
    ctx.translate(r() * viewW, HORIZON + 2.2 + r() * 1.6);
    ctx.scale(0.4, 0.4);
    drawPalm(ctx, 7 + r() * 3, Math.floor(r() * 1e4));
    ctx.restore();
  }

  // the street: laterite verges and the tarred road
  ctx.fillStyle = PAL.laterite;
  ctx.fillRect(0, HORIZON + 3.8, viewW, ROAD_TOP - HORIZON - 3.8);
  ctx.fillStyle = PAL.asphalt;
  ctx.fillRect(0, ROAD_TOP, viewW, ROAD_BOT - ROAD_TOP);
  ctx.fillStyle = PAL.concreteDark;
  ctx.fillRect(0, ROAD_TOP - 0.08, viewW, 0.08);
  ctx.fillRect(0, ROAD_BOT, viewW, 0.08);
  for (let x = 0.5; x < viewW; x += 2.4) {
    ctx.fillStyle = "rgba(240,236,226,0.7)";
    ctx.fillRect(x, (ROAD_TOP + ROAD_BOT) / 2 - 0.04, 1.2, 0.08);
  }
  ctx.fillStyle = PAL.laterite;
  ctx.fillRect(0, ROAD_BOT + 0.08, viewW, HERO_H - ROAD_BOT);
  const rr = rng(5);
  for (let i = 0; i < viewW * 6; i++) {
    ctx.fillStyle = rr() < 0.5 ? "rgba(90,40,20,0.25)" : "rgba(220,150,100,0.2)";
    const y = rr() < 0.4 ? HORIZON + 3.8 + rr() * (ROAD_TOP - HORIZON - 3.8) : ROAD_BOT + 0.1 + rr() * (HERO_H - ROAD_BOT);
    ctx.fillRect(rr() * viewW, y, 0.06, 0.04);
  }
  // street furniture on the far verge
  for (let x = 3, i = 0; x < viewW; x += 11, i++) {
    ctx.save();
    ctx.translate(x, ROAD_TOP - 0.15);
    drawPole(ctx, 6.5);
    ctx.restore();
    if (i % 2 === 0) {
      ctx.save();
      ctx.translate(x + 4, ROAD_TOP - 0.25);
      drawUmbrellaStall(ctx, i % 4 === 0 ? ["#d4402c", "#f2c230"] : ["#2f6fb5", "#f2efe6"], i % 4 === 0 ? "tomato" : "provisions", i);
      ctx.restore();
    }
  }
  setTilt(TILT_STREET);
}

const WALKERS = [
  { who: "mamaBisi", speed: 0.9, y: 13.5, dir: 1, off: 0 },
  { who: "uiStudent", speed: 1.2, y: 13.75, dir: -1, off: 9 },
  { who: "breadSeller", speed: 0.8, y: 13.4, dir: 1, off: 17 },
  { who: "babaAde", speed: 0.7, y: 13.8, dir: -1, off: 27 },
  { who: "schoolGirl", speed: 1.1, y: 13.55, dir: 1, off: 36 },
] as const;

/** The live part: traffic on the road, people on the near verge. */
export function drawHeroLive(ctx: Ctx, viewW: number, t: number) {
  const span = viewW + 16;
  const wrap = (v: number) => ((v % span) + span) % span - 8;
  const lane1 = ROAD_TOP + 0.55, lane2 = ROAD_BOT - 0.25;
  const traffic: [number, () => void][] = [
    [lane1, () => { ctx.save(); ctx.translate(wrap(-t * 5.5 + 30), lane1); drawOkada(ctx, "W", CAST.okadaMan, CAST.marketWoman); ctx.restore(); }],
    [lane1, () => { ctx.save(); ctx.translate(wrap(-t * 4 + 4), lane1); drawKeke(ctx, "W", [CAST.mechanic]); ctx.restore(); }],
    [lane2, () => { ctx.save(); ctx.translate(wrap(t * 4.5), lane2); drawCar(ctx, CARS.micra, "E"); ctx.restore(); }],
    [lane2, () => { ctx.save(); ctx.translate(wrap(t * 4.5 + 22), lane2); drawCar(ctx, CARS.korope, "E"); ctx.restore(); }],
  ];
  traffic.sort((a, b) => a[0] - b[0]).forEach(([, f]) => f());
  const people = WALKERS.map((w) => ({ ...w, x: wrap(w.off + w.dir * t * w.speed) })).sort((a, b) => a.y - b.y);
  for (const p of people) {
    ctx.save();
    ctx.translate(p.x, p.y);
    drawPerson(ctx, CAST[p.who], p.dir > 0 ? "E" : "W", "walk", t * 6 + p.off);
    ctx.restore();
  }
}
