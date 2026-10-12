// Isometric engine core — pure math + canvas helpers, no React.
// Tile-grid data ports straight to Three.js later; rendering swaps.

export const TW = 64; // tile width px at scale 1
export const TH = 32; // tile height px at scale 1

export interface Cam {
  panX: number;
  panY: number;
  scale: number;
}

/** Grid (tile) coords → screen px. cx/cy = canvas center. */
export function project(
  gx: number,
  gy: number,
  cam: Cam,
  cx: number,
  cy: number
): { x: number; y: number } {
  const s = cam.scale;
  return {
    x: cx + (gx - gy) * (TW / 2) * s + cam.panX,
    y: cy + (gx + gy) * (TH / 2) * s + cam.panY,
  };
}

/** Depth key for painter's algorithm — draw low (x+y) first. */
export function depth(gx: number, gy: number): number {
  return gx + gy;
}

export interface Palette {
  top: string;
  left: string;
  right: string;
}

/** Filled diamond footprint for a rect of tiles. Returns corner points. */
export function footprint(
  ctx: CanvasRenderingContext2D,
  gx: number,
  gy: number,
  w: number,
  d: number,
  cam: Cam,
  cx: number,
  cy: number
): { x: number; y: number }[] {
  const p1 = project(gx, gy, cam, cx, cy);
  const p2 = project(gx + w, gy, cam, cx, cy);
  const p3 = project(gx + w, gy + d, cam, cx, cy);
  const p4 = project(gx, gy + d, cam, cx, cy);
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.lineTo(p4.x, p4.y);
  ctx.closePath();
  return [p1, p2, p3, p4];
}

/**
 * Iso box anchored at tile (gx,gy) with tile size w×d and pixel height h.
 * Anchor = front (south) corner so boxes stack correctly in depth order.
 */
export function drawBox(
  ctx: CanvasRenderingContext2D,
  gx: number,
  gy: number,
  w: number,
  d: number,
  h: number,
  pal: Palette,
  cam: Cam,
  cx: number,
  cy: number
) {
  const s = cam.scale;
  const hh = h * s;
  const a = project(gx, gy + d, cam, cx, cy); // front
  const b = project(gx + w, gy + d, cam, cx, cy); // right
  const c = project(gx + w, gy, cam, cx, cy); // back
  const e = project(gx, gy, cam, cx, cy); // left
  // left face (south-west edge: west -> front)
  ctx.fillStyle = pal.left;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(b.x, b.y - hh);
  ctx.lineTo(a.x, a.y - hh);
  ctx.closePath();
  ctx.fill();
  // right face (south-east edge: front -> east)
  ctx.fillStyle = pal.right;
  ctx.beginPath();
  ctx.moveTo(b.x, b.y);
  ctx.lineTo(c.x, c.y);
  ctx.lineTo(c.x, c.y - hh);
  ctx.lineTo(b.x, b.y - hh);
  ctx.closePath();
  ctx.fill();
  // top face
  ctx.fillStyle = pal.top;
  ctx.beginPath();
  ctx.moveTo(e.x, e.y - hh);
  ctx.lineTo(c.x, c.y - hh);
  ctx.lineTo(b.x, b.y - hh);
  ctx.lineTo(a.x, a.y - hh);
  ctx.closePath();
  ctx.fill();
}

/** Point-in-polygon hit test for click selection. */
export function inPoly(
  x: number,
  y: number,
  poly: { x: number; y: number }[]
): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;
    if (
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

/** Deterministic pseudo-random from string seed (stable layouts). */
export function hash01(seed: string, i: number): number {
  let h = 2166136261;
  const s = seed + ":" + i;
  for (let k = 0; k < s.length; k++) {
    h ^= s.charCodeAt(k);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13;
  return ((h >>> 0) % 1000) / 1000;
}

/** Total length of a grid polyline (tiles). */
export function polyLength(pts: [number, number][]): number {
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  }
  return total;
}

/** Point + tangent at fraction t (0..1) along a grid polyline. */
export function samplePolyline(
  pts: [number, number][],
  t: number
): { x: number; y: number; dx: number; dy: number } {
  const total = polyLength(pts);
  const target = Math.max(0, Math.min(1, t)) * total;
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc + seg >= target) {
      const f = seg === 0 ? 0 : (target - acc) / seg;
      return {
        x: pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f,
        y: pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f,
        dx: (pts[i][0] - pts[i - 1][0]) / (seg || 1),
        dy: (pts[i][1] - pts[i - 1][1]) / (seg || 1),
      };
    }
    acc += seg;
  }
  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  const seg = Math.hypot(last[0] - prev[0], last[1] - prev[1]) || 1;
  return { x: last[0], y: last[1], dx: (last[0] - prev[0]) / seg, dy: (last[1] - prev[1]) / seg };
}
