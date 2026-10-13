// Omo Ibadan art kit — shared drawing helpers.
//
// One camera for the whole game: top-down, tilted toward the viewer. Ground
// x/y are metres; a thing's height z is drawn straight up the screen as
// z * K. Every draw function works in metres with its origin at the object's
// ground anchor; callers scale the context to pixels.

export type Ctx = CanvasRenderingContext2D;
export type Dir = "S" | "N" | "E" | "W"; // S = walking toward the viewer

/** Screen height per metre of real height. */
export const K = 0.9;

/**
 * Screen depth per metre of ground (north–south). 1 = looking almost straight
 * down; ~0.62 = a three-quarter street camera where walls and faces read
 * clearly. Draw functions take world metres and apply G themselves.
 */
export let G = 0.62;
export const TILT_STREET = 0.62;
export const TILT_AERIAL = 1;
export function setTilt(g: number) {
  G = g;
}

/** Move the origin to a ground point given in world metres. */
export function place(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.translate(x, y * G);
}

/** Deterministic random numbers (mulberry32), so a seed always looks the same. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function toRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: [number, number, number]): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Lighten (amt > 0) or darken (amt < 0) a colour; amt in -1..1. */
export function shade(hex: string, amt: number): string {
  const [r, g, b] = toRgb(hex);
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  return toHex([r + (t - r) * p, g + (t - g) * p, b + (t - b) * p]);
}

export function mix(a: string, b: string, t: number): string {
  const x = toRgb(a);
  const y = toRgb(b);
  return toHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
}

export function alpha(hex: string, a: number): string {
  const [r, g, b] = toRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

export function rrect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

export function poly(ctx: Ctx, pts: number[]) {
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.closePath();
}

export function oval(ctx: Ctx, cx: number, cy: number, rx: number, ry: number) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
}

export function fill(ctx: Ctx, color: string, outline?: string, lw = 0.02) {
  ctx.fillStyle = color;
  ctx.fill();
  if (outline) {
    ctx.strokeStyle = outline;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
}

/** Run `draw` clipped to the current path. */
export function clipped(ctx: Ctx, draw: () => void) {
  ctx.save();
  ctx.clip();
  draw();
  ctx.restore();
}

/** Soft ground shadow (sun from the upper left, so shadows fall right). cy/ry are ground metres. */
export function groundShadow(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, a = 0.28) {
  oval(ctx, cx + rx * 0.12, cy * G, rx, ry * G);
  ctx.fillStyle = `rgba(20,12,6,${a})`;
  ctx.fill();
}

export function line(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, color: string, w: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.stroke();
}

/** Text in metres (font size is a height in metres). */
export function label(ctx: Ctx, text: string, x: number, y: number, size: number, color: string, weight = 800, align: CanvasTextAlign = "center") {
  ctx.font = `${weight} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}
