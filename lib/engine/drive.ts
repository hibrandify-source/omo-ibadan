// Omo Ibadan — Micra Rush rules. Pure simulation, no drawing.
//
// A run follows a real corridor (stops and road distances from the
// OpenStreetMap build), compressed so a 20 km corridor takes about a minute.
// The road is drawn straight; x is distance along it in game metres.
// Two eastbound lanes: 0 is the kerb lane (bus bays), 1 the outer lane.

import { rng } from "@/lib/art/core";

export interface Corridor {
  id: string;
  name: string;
  stops: string[];
  legKm: number[];
  /** real road path, flat [x0, y0, …] in map metres */
  path: number[];
}

/** Game metres per real kilometre. */
export const GAME_M_PER_KM = 35;
export const CAR_LEN = 3.7;
const CRUISE = 14;
const FAST = 20;
const SLOW = 5;
const RIDE_SPEED = 42; // as a passenger, time flies
const BAY_WINDOW = 9; // metres either side of the bay box
const DWELL = 2.4; // seconds stopped at a bay: long enough to see people climb in
const RIDE_DWELL = 0.6; // as a passenger the stops pass quickly

export type ObKind = "okada" | "keke" | "korope" | "goat" | "walker";
export type HazardKind = ObKind | "signal" | "vio";

export interface Obstacle {
  id: number;
  kind: ObKind;
  /** 0 kerb, 1 outer; walkers and goats move across (-1 … 2) */
  lane: number;
  x: number;
  speed: number;
  /** lanes per second, for things crossing the road */
  cross: number;
  hit: boolean;
  scattered: boolean;
}

export interface Bay {
  x: number;
  name: string;
  done: boolean;
  /** stopped inside the box (passengers board) */
  ok?: boolean;
  /** sim time of the stop, for the boarding animation */
  at?: number;
}
export interface Signal { x: number; offset: number; passed: boolean }

export interface DriveState {
  length: number;
  x: number;
  lane: number;
  laneTarget: 0 | 1;
  speed: number;
  t: number;
  dwell: number;
  bays: Bay[];
  signals: Signal[];
  checks: { x: number; passed: boolean }[];
  obstacles: Obstacle[];
  autopilot: boolean;
  finished: boolean;
}

export type DriveEvent =
  | { type: "hazard"; kind: HazardKind }
  | { type: "bay"; ok: boolean; name: string }
  | { type: "honk"; cleared: ObKind | null }
  /** STOP pressed but not in a bay: wrong lane, or the bay is still ahead */
  | { type: "stop-miss"; why: "lane" | "early"; dist: number }
  | { type: "finish" };

export interface DriveInput {
  gas: boolean;
  brake: boolean;
  laneTarget: 0 | 1;
  /** pressed this frame */
  stop: boolean;
  honk: boolean;
}

/** Red for 3.5 s of every 9 s, staggered per light. */
export const signalRed = (s: Signal, t: number) => ((t + s.offset) % 9) < 3.5;

export function createDrive(c: Corridor, stopNames: string[], opts: { autopilot: boolean; seed: number }): DriveState {
  const r = rng(opts.seed);
  const legs = c.legKm.map((k) => Math.max(60, k * GAME_M_PER_KM));
  const length = legs.reduce((a, b) => a + b, 0) + 40;
  const bays: Bay[] = [];
  const signals: Signal[] = [];
  let acc = 20;
  legs.forEach((leg, i) => {
    signals.push({ x: acc + leg * 0.5, offset: r() * 9, passed: false });
    acc += leg;
    bays.push({ x: acc, name: stopNames[i + 1] ?? "", done: false });
  });
  const obstacles: Obstacle[] = [];
  let id = 0;
  for (let x = 45; x < length - 30; x += 28 + r() * 34) {
    const roll = r();
    // keep the bay zones clear except for the odd korope loading
    const nearBay = bays.some((b) => Math.abs(b.x - x) < 25);
    const kind: ObKind = nearBay ? (roll < 0.5 ? "korope" : "walker") : roll < 0.38 ? "okada" : roll < 0.62 ? "keke" : roll < 0.78 ? "korope" : roll < 0.9 ? "walker" : "goat";
    const crossing = kind === "walker" || kind === "goat";
    obstacles.push({
      id: id++,
      kind,
      lane: crossing ? (r() < 0.5 ? -0.8 : 1.8) : kind === "korope" ? 0 : r() < 0.5 ? 0 : 1,
      x: nearBay && kind === "korope" ? x - 14 : x,
      speed: kind === "okada" ? 8 : kind === "keke" ? 6 : 0,
      cross: crossing ? (kind === "goat" ? 0.35 : 0.5) : 0,
      hit: false,
      scattered: false,
    });
  }
  // walkers start on the side they'll cross from
  for (const o of obstacles) if (o.cross && o.lane > 1) o.cross = -o.cross;
  return {
    length,
    x: 0,
    lane: 0,
    laneTarget: 0,
    speed: 0,
    t: 0,
    dwell: 0,
    bays,
    signals,
    checks: [{ x: Math.round(length * 0.55), passed: false }],
    obstacles,
    autopilot: opts.autopilot,
    finished: false,
  };
}

/** What the autopilot does: kerb lane near bays, otherwise dodge, wait at reds. */
export function autopilotInput(s: DriveState): DriveInput {
  const next = s.bays.find((b) => !b.done);
  const nearBay = next && next.x - s.x < 70 && next.x - s.x > -BAY_WINDOW;
  let laneTarget: 0 | 1 = nearBay ? 0 : s.laneTarget;
  if (!nearBay) {
    const blocking = s.obstacles.find((o) => !o.cross && !o.scattered && o.x > s.x && o.x - s.x < 22 && Math.abs(o.lane - laneTarget) < 0.5);
    if (blocking) laneTarget = laneTarget === 0 ? 1 : 0;
  }
  const red = s.signals.find((g) => !g.passed && g.x - s.x > 0 && g.x - s.x < 14 && signalRed(g, s.t));
  const atBay = next && Math.abs(next.x - s.x) < 3 && s.lane < 0.3;
  return { gas: false, brake: !!red, laneTarget, stop: !!atBay, honk: false };
}

const sameLane = (a: number, b: number) => Math.abs(a - b) < 0.55;

export function stepDrive(s: DriveState, input: DriveInput, dt: number): DriveEvent[] {
  const ev: DriveEvent[] = [];
  if (s.finished) return ev;
  s.t += dt;
  s.laneTarget = input.laneTarget;
  const dl = s.laneTarget - s.lane;
  s.lane += Math.sign(dl) * Math.min(Math.abs(dl), 2.6 * dt);

  // speed
  let target = s.autopilot ? RIDE_SPEED : input.gas ? FAST : input.brake ? SLOW : CRUISE;
  if (s.autopilot && input.brake) target = 0;
  if (s.autopilot) {
    const next = s.bays.find((b) => !b.done);
    // as a passenger, the approach to each stop is brisk; the stop itself is real
    if (next && next.x - s.x < 40 && next.x - s.x > -2) target = Math.min(target, 9 + (next.x - s.x) * 1.4);
  }
  if (s.dwell > 0) {
    s.dwell -= dt;
    target = 0;
  }
  s.speed += (target - s.speed) * Math.min(1, dt * (target < s.speed ? 4 : 1.6));
  const x0 = s.x;
  s.x += s.speed * dt;

  // traffic moves; crossers walk across; scattered okadas peel off
  for (const o of s.obstacles) {
    o.x += o.speed * dt;
    if (o.cross) {
      // they wait at the kerb until you're close, like real people do
      if (o.x - s.x < 40) o.lane += o.cross * dt;
    }
    if (o.scattered) o.lane += (o.lane >= 1 ? 1 : -1) * dt * 1.5;
  }

  // collisions
  for (const o of s.obstacles) {
    if (o.hit || o.scattered) continue;
    if (o.lane < -0.6 || o.lane > 1.6) continue;
    if (Math.abs(o.x - s.x) < CAR_LEN * 0.8 && sameLane(o.lane, s.lane) && s.speed > 1) {
      o.hit = true;
      s.speed = Math.min(s.speed, 3);
      if (!s.autopilot) ev.push({ type: "hazard", kind: o.kind });
    }
  }

  // honk clears okadas and kekes just ahead in your lane
  if (input.honk) {
    const target = s.obstacles.find((o) => (o.kind === "okada" || o.kind === "keke") && !o.scattered && o.x > s.x && o.x - s.x < 26 && sameLane(o.lane, s.lane));
    if (target) target.scattered = true;
    ev.push({ type: "honk", cleared: target?.kind ?? null });
  }

  // traffic lights
  for (const g of s.signals) {
    if (g.passed || !(x0 < g.x && s.x >= g.x)) continue;
    g.passed = true;
    if (signalRed(g, s.t) && !s.autopilot) ev.push({ type: "hazard", kind: "signal" });
  }
  // VIO checkpoint
  for (const c of s.checks) {
    if (c.passed || !(x0 < c.x && s.x >= c.x)) continue;
    c.passed = true;
    if (!s.autopilot) ev.push({ type: "hazard", kind: "vio" });
  }

  // bus bays
  const bay = s.bays.find((b) => !b.done);
  if (bay) {
    if (input.stop && Math.abs(bay.x - s.x) < BAY_WINDOW && s.lane < 0.45) {
      bay.done = true;
      bay.ok = true;
      bay.at = s.t;
      s.dwell = s.autopilot ? RIDE_DWELL : DWELL;
      ev.push({ type: "bay", ok: true, name: bay.name });
    } else if (s.x > bay.x + BAY_WINDOW) {
      bay.done = true;
      ev.push({ type: "bay", ok: false, name: bay.name });
    } else if (input.stop && !s.autopilot) {
      ev.push({ type: "stop-miss", why: s.lane >= 0.45 ? "lane" : "early", dist: Math.round(bay.x - s.x) });
    }
  }

  if (s.x >= s.length) {
    s.finished = true;
    ev.push({ type: "finish" });
  }
  return ev;
}

/** Position along the real road path for a fraction 0..1 (for the mini-map). */
export function pointOnPath(path: number[], f: number): [number, number] {
  const seg: number[] = [];
  let total = 0;
  for (let i = 2; i < path.length; i += 2) {
    const d = Math.hypot(path[i] - path[i - 2], path[i + 1] - path[i - 1]);
    seg.push(d);
    total += d;
  }
  let want = Math.max(0, Math.min(1, f)) * total;
  for (let i = 0; i < seg.length; i++) {
    if (want <= seg[i]) {
      const k = seg[i] ? want / seg[i] : 0;
      return [path[i * 2] + (path[i * 2 + 2] - path[i * 2]) * k, path[i * 2 + 1] + (path[i * 2 + 3] - path[i * 2 + 1]) * k];
    }
    want -= seg[i];
  }
  return [path[path.length - 2], path[path.length - 1]];
}
