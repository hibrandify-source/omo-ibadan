// Walkable-scene collision: what blocks you, in world metres.

import type { PropKind, SceneDef } from "./types";

export interface Rect { x: number; y: number; w: number; h: number }

/** Ground footprint that blocks walking, relative to the prop's origin. */
export function propBlock(p: PropKind): Rect | null {
  switch (p.kind) {
    case "tree": return { x: -0.3, y: -0.3, w: 0.6, h: 0.6 };
    case "palm": return { x: -0.3, y: -0.3, w: 0.6, h: 0.6 };
    case "pole": return { x: -0.15, y: -0.15, w: 0.3, h: 0.3 };
    case "kiosk": return { x: 0, y: 0, w: 2.4, h: 1.4 };
    case "umbrella": return { x: -0.8, y: -0.4, w: 1.6, h: 0.8 };
    case "tank": return { x: -0.7, y: -0.6, w: 1.4, h: 1.2 };
    case "bench": return { x: -0.8, y: -0.25, w: 1.6, h: 0.5 };
    case "pots": return { x: -0.9, y: -0.5, w: 1.9, h: 1 };
    case "drum": return { x: -0.35, y: -0.35, w: 0.7, h: 0.7 };
    case "signboard": return { x: -p.w / 2, y: -0.1, w: p.w, h: 0.2 };
    case "car": return p.dir === "E" || p.dir === "W" ? { x: -2.4, y: -0.9, w: 4.8, h: 1.8 } : { x: -0.95, y: -2.4, w: 1.9, h: 4.8 };
    case "booth": return { x: -0.8, y: -0.7, w: 1.6, h: 1.4 };
    case "biggen": return { x: -1.3, y: -0.55, w: 2.6, h: 1.1 };
    case "hedge": return { x: 0, y: -0.4, w: p.w, h: 0.5 };
    case "flowers": return { x: 0, y: -0.6, w: p.w, h: 0.6 };
    case "stall": return { x: -(p.w ?? 2.8) / 2, y: -2.2, w: p.w ?? 2.8, h: 2.2 };
    default: return null;
  }
}

export function sceneBlockers(scene: SceneDef): Rect[] {
  const r: Rect[] = [];
  for (const b of scene.buildings) r.push({ x: b.x, y: b.y, w: b.spec.w, h: b.spec.d });
  for (const f of scene.fences) {
    const segs: [number, number][] = f.gate ? [[f.x0, f.gate.x], [f.gate.x + f.gate.w, f.x1]] : [[f.x0, f.x1]];
    for (const [a, b] of segs) if (b > a) r.push({ x: a, y: f.y - 0.2, w: b - a, h: 0.4 });
  }
  for (const p of scene.props) {
    const k = propBlock(p.spec);
    if (k) r.push({ x: p.x + k.x, y: p.y + k.y, w: k.w, h: k.h });
  }
  return r;
}

/** True if a person standing at (x, y) would overlap a wall, prop or the scene edge. */
export function isBlocked(scene: SceneDef, blockers: Rect[], x: number, y: number): boolean {
  return (
    x < 0.3 || y < 0.3 || x > scene.w - 0.3 || y > scene.h - 0.3 ||
    blockers.some((r) => x > r.x - 0.2 && x < r.x + r.w + 0.2 && y > r.y - 0.15 && y < r.y + r.h + 0.15)
  );
}

/**
 * Can you walk from `a` to `b`? Grid flood fill at 0.25 m, the same clearance
 * the player has. Used by tests to prove every door and exit is reachable.
 */
export function reachable(scene: SceneDef, a: { x: number; y: number }, b: { x: number; y: number }): boolean {
  const blockers = sceneBlockers(scene);
  const step = 0.25;
  const cols = Math.ceil(scene.w / step);
  const rows = Math.ceil(scene.h / step);
  const idx = (c: number, r: number) => r * cols + c;
  const seen = new Uint8Array(cols * rows);
  const start = [Math.round(a.x / step), Math.round(a.y / step)];
  const goal = [Math.round(b.x / step), Math.round(b.y / step)];
  const queue = [start];
  seen[idx(start[0], start[1])] = 1;
  while (queue.length) {
    const [c, r] = queue.pop()!;
    if (Math.abs(c - goal[0]) <= 1 && Math.abs(r - goal[1]) <= 1) return true;
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = c + dc, nr = r + dr;
      if (nc < 0 || nr < 0 || nc >= cols || nr >= rows || seen[idx(nc, nr)]) continue;
      seen[idx(nc, nr)] = 1;
      if (!isBlocked(scene, blockers, nc * step, nr * step)) queue.push([nc, nr]);
    }
  }
  return false;
}
