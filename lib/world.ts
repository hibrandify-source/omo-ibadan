import { PRICES } from "./game/prices";
import type { BackgroundId } from "./game/backgrounds";
// World data — tile grid for the isometric diorama.
// Same 15 nodes as lib/game.ts MAP_NODES, laid out as walkable zones.
// Renderer-agnostic: this grid ports straight to Three.js later.

export type Landmark =
  | "gate" | "stalls" | "tower" | "hall" | "trees"
  | "buses" | "lake" | "houses";

export interface Zone {
  id: string; // matches MAP_NODES id
  gx: number; // grid x (tiles)
  gy: number; // grid y (tiles)
  w: number; // width in tiles
  d: number; // depth in tiles
  ground: string; // footprint tint
  landmark: Landmark;
  label: string;
}

export const GRID_W = 38;
export const GRID_H = 28;

// Compass-true layout (grounded in road surveys + OSM):
// north = UI/Sango/Bodija · center = old-city hills (Mapo/Oke-Are) ·
// west-center = Dugbe · south = Challenge/Molete + Ring arc ·
// far east = Iwo 5-leg roundabout + express spurs · far west = Eleyele lake.
export const ZONES: Zone[] = [
  { id: "ui-gate", gx: 15, gy: 2, w: 5, d: 3, ground: "#3f5a3a", landmark: "gate", label: "UI Gate" },
  { id: "sango", gx: 21, gy: 2, w: 5, d: 3, ground: "#4a4a42", landmark: "houses", label: "Sango" },
  { id: "samonda", gx: 17, gy: 6, w: 4, d: 3, ground: "#4a4a42", landmark: "houses", label: "Samonda" },
  { id: "bodija", gx: 13, gy: 9, w: 6, d: 4, ground: "#50503f", landmark: "stalls", label: "Bodija" },
  { id: "mokola", gx: 9, gy: 11, w: 5, d: 4, ground: "#4c4438", landmark: "houses", label: "Mokola" },
  { id: "dugbe", gx: 3, gy: 12, w: 5, d: 4, ground: "#4a4a42", landmark: "tower", label: "Dugbe" },
  { id: "agodi", gx: 19, gy: 9, w: 5, d: 4, ground: "#2f4a2e", landmark: "trees", label: "Agodi" },
  { id: "mapo", gx: 23, gy: 12, w: 6, d: 5, ground: "#4c3a2a", landmark: "hall", label: "Mapo" },
  { id: "oja-oba", gx: 22, gy: 18, w: 4, d: 3, ground: "#50503f", landmark: "stalls", label: "Oja Oba" },
  { id: "oje", gx: 27, gy: 18, w: 4, d: 3, ground: "#50503f", landmark: "houses", label: "Oje" },
  { id: "challenge", gx: 16, gy: 19, w: 4, d: 4, ground: "#4a4a42", landmark: "houses", label: "Challenge" },
  { id: "molete", gx: 12, gy: 23, w: 4, d: 3, ground: "#4a4a42", landmark: "houses", label: "Molete" },
  { id: "ring-road", gx: 6, gy: 20, w: 5, d: 3, ground: "#46463e", landmark: "houses", label: "Ring Road" },
  { id: "iwo-road", gx: 30, gy: 13, w: 6, d: 5, ground: "#4a4a42", landmark: "buses", label: "Iwo Road" },
  { id: "eleyele", gx: 1, gy: 18, w: 4, d: 4, ground: "#33473f", landmark: "lake", label: "Eleyele" },
];

/** Zone center in grid coords (for roads + labels). */
export function zoneCenter(z: Zone): { x: number; y: number } {
  return { x: z.gx + z.w / 2, y: z.gy + z.d / 2 };
}

/** Roads as typed corridors. Potholes 0-3 (survey: Bodija–Beere worst). */
export interface Road {
  pts: [number, number][];
  type: "express" | "dual" | "street";
  potholes: 0 | 1 | 2 | 3;
}

export const ROADS: Road[] = [
  // Ojoo–Sango–Mokola dual carriageway (past UI gate)
  { pts: [[18, -1], [23.5, 3.5], [17.5, 3.5], [11.5, 13]], type: "dual", potholes: 1 },
  // UI–Bodija–Secretariat–Beere street (roughest surveyed corridor)
  { pts: [[17.5, 3.5], [19, 7.5], [16, 11], [20, 12.5], [26, 14.5]], type: "street", potholes: 3 },
  // Mokola–Agodi link (Elizabeth Rd)
  { pts: [[11.5, 13], [16, 12], [21.5, 11]], type: "dual", potholes: 1 },
  // Dugbe–Oke-Ado–Molete
  { pts: [[5.5, 14], [11.5, 16], [18, 21], [14, 24.5]], type: "dual", potholes: 2 },
  // Ring Road arc: Iwo interchange → Challenge → south
  { pts: [[33, 15.5], [26, 18], [18, 21], [8.5, 21.5]], type: "express", potholes: 0 },
  // Oja'ba–Challenge street (old city)
  { pts: [[24, 19.5], [21, 20.5], [18, 21]], type: "street", potholes: 2 },
  // Agodi–Iwo Road link
  { pts: [[21.5, 11], [27, 12.5], [33, 15.5]], type: "dual", potholes: 1 },
  // Dugbe–Eleyele–Jericho
  { pts: [[5.5, 14], [4, 17], [3, 20]], type: "dual", potholes: 1 },
  // Sango–Poly–Eleyele street
  { pts: [[23.5, 3.5], [15, 9], [8, 15], [3, 20]], type: "street", potholes: 2 },
  // Lagos express spur (east off-grid) + Ife Rd spur
  { pts: [[33, 15.5], [39, 15.5]], type: "express", potholes: 0 },
  { pts: [[34, 17], [38, 22]], type: "dual", potholes: 1 },
  // Oja Oba–Agodi–Eleyele
  { pts: [[24, 19.5], [18, 21], [14, 19.5], [8, 20.5], [3, 20]], type: "street", potholes: 2 },
];

/** Legacy helper — kept for compat; prefer ROADS. */
export function buildRoads(): { x: number; y: number }[][] {
  return ROADS.map((r) => r.pts.map(([x, y]) => ({ x, y })));
}

// ---- Homes: empty decor → hustle to furnish → flat → duplex ----
// Every life starts in a sparse room. Furniture is bought with hustled Ola;
// each piece raises rest bonus. Moving up a tier costs a year's rent upfront
// plus agent and caution fees (see PRICES.housing).

export type HomeTier = "room" | "flat" | "duplex";

export interface HomePath {
  bgId: BackgroundId;
  room: string;
  flat: string;
  duplex: string;
  flatCost: number;
  duplexCost: number;
}

const RENT = PRICES.housing.rentYear;
const MOVE = PRICES.housing.moveCost;

export const HOME_PATHS: HomePath[] = [
  { bgId: "omo-iya-lobe", room: "Your corner of Mama's room, Beere", flat: "Self-contain, Oke-Ado", duplex: "Duplex, Iyaganku", flatCost: MOVE(RENT.selfContain), duplexCost: MOVE(RENT.jerichoDuplex) },
  { bgId: "alowonle", room: "Boys' quarters room, Daddy's house, Old Bodija", flat: "Your own flat, New Bodija", duplex: "Duplex, Jericho GRA", flatCost: MOVE(RENT.bodijaFlat), duplexCost: MOVE(RENT.jerichoDuplex) },
];

export interface Furniture {
  id: string;
  name: string;
  cost: number;
  rest: number; // extra energy when you rest/chop at home
  minTier: HomeTier;
  iwa: number; // hosting elders / keeping home grants Iwa
}

export const FURNITURE: Furniture[] = [
  { id: "mat", name: "Floor mat", cost: 0, rest: 0, minTier: "room", iwa: 0 },
  { id: "mattress", name: "Foam mattress", cost: PRICES.furniture.mattress, rest: 5, minTier: "room", iwa: 0 },
  { id: "fan", name: "Standing fan", cost: PRICES.furniture.fan, rest: 8, minTier: "room", iwa: 0 },
  { id: "rug", name: "Center rug", cost: PRICES.furniture.rug, rest: 4, minTier: "room", iwa: 1 },
  { id: "curtains", name: "Curtains", cost: PRICES.furniture.curtains, rest: 3, minTier: "room", iwa: 1 },
  { id: "shelf", name: "Bookshelf (exam +5% flavor)", cost: PRICES.furniture.shelf, rest: 4, minTier: "room", iwa: 2 },
  { id: "gen", name: "Small gen (NEPA-proof rest)", cost: PRICES.furniture.gen, rest: 12, minTier: "flat", iwa: 1 },
  { id: "tv", name: "TV + decoder", cost: PRICES.furniture.tv, rest: 10, minTier: "flat", iwa: 0 },
  { id: "fridge", name: "Fridge (chop cheaper)", cost: PRICES.furniture.fridge, rest: 12, minTier: "flat", iwa: 1 },
  { id: "sofa", name: "Sofa set (host elders)", cost: PRICES.furniture.sofa, rest: 8, minTier: "flat", iwa: 3 },
  { id: "ac", name: "AC (duplex flex)", cost: PRICES.furniture.ac, rest: 18, minTier: "duplex", iwa: 0 },
  { id: "dining", name: "Dining set (family feasts)", cost: PRICES.furniture.dining, rest: 10, minTier: "duplex", iwa: 4 },
];

export interface HomeSave {
  tier: HomeTier;
  furniture: string[]; // owned furniture ids (always includes "mat")
}

export function emptyHome(): HomeSave {
  return { tier: "room", furniture: ["mat"] };
}

// ---- Walkable world: deterministic house spots (shared by renderer + collision) ----
import { hash01 } from "./iso";

export interface HouseSpot {
  gx: number;
  gy: number;
  w: number;
  d: number;
  h: number;
  roof: number; // index into roof palette
}

/** House footprints for houses/gate zones — same math everywhere. */
export function houseSpots(zoneId: string, n = 3): HouseSpot[] {
  const z = ZONES.find((x) => x.id === zoneId);
  if (!z) return [];
  return Array.from({ length: n }, (_, i) => ({
    gx: z.gx + 0.5 + hash01(z.id, i * 5 + 1) * Math.max(0.5, z.w - 2.6),
    gy: z.gy + 0.5 + hash01(z.id, i * 5 + 2) * Math.max(0.5, z.d - 2.6),
    w: 1.5 + hash01(z.id, i * 3 + 1) * 0.7,
    d: 1.5 + hash01(z.id, i * 3 + 2) * 0.7,
    h: 13 + hash01(z.id, i * 3 + 3) * 10,
    roof: Math.floor(hash01(z.id, i * 3 + 1) * 4) % 4,
  }));
}

export interface Blocker {
  x: number;
  y: number;
  w: number;
  d: number;
}

/** Solid rectangles avatars cannot walk through. Built once at load. */
export function buildBlockers(): Blocker[] {
  const out: Blocker[] = [];
  for (const z of ZONES) {
    if (z.landmark === "houses" || z.landmark === "gate") {
      for (const h of houseSpots(z.id)) out.push({ x: h.gx, y: h.gy, w: h.w, d: h.d });
    }
    const c = zoneCenter(z);
    if (z.landmark === "tower") out.push({ x: c.x - 0.9, y: c.y - 0.9, w: 1.8, d: 1.8 });
    if (z.landmark === "hall") out.push({ x: c.x - 1.7, y: c.y - 1.4, w: 3.4, d: 2.8 });
    if (z.landmark === "stalls") out.push({ x: z.gx + 0.6, y: z.gy + 0.7, w: 4.4, d: 3.6 });
    if (z.landmark === "lake") out.push({ x: c.x - 2.4, y: c.y - 1.4, w: 4.8, d: 2.8 });
    if (z.landmark === "buses") {
      // parked micras + white bus + roundabout island (walk around it)
      out.push({ x: c.x - 2.4, y: c.y + 1.6, w: 1.7, d: 0.9 });
      out.push({ x: c.x - 0.4, y: c.y + 1.6, w: 1.7, d: 0.9 });
      out.push({ x: c.x + 0.6, y: c.y + 1.5, w: 2.4, d: 1.0 });
      out.push({ x: c.x - 1.1, y: c.y - 1.7, w: 2.2, d: 2.2 });
    }
  }
  for (const s of roadsideSpots()) out.push({ x: s.x - s.w / 2, y: s.y - s.d / 2, w: s.w, d: s.d });
  return out;
}

/** Half-width in tiles by corridor type (renderer must use the same). */
export function roadHalfW(type: "express" | "dual" | "street"): number {
  return type === "express" ? 1.5 : type === "dual" ? 1.15 : 0.85;
}

// ---- Roadside shops: buildings facing the corridors (shared by renderer + collision) ----
import { polyLength } from "./iso";

export interface RoadsideSpec {
  x: number; // grid coords (center)
  y: number;
  w: number;
  d: number;
  h: number;
  face: number; // index into SHOP_FACES
  awn: boolean;
  rot: number; // radians, front faces road
}

function roadPoint(pts: [number, number][], t: number): { x: number; y: number; dx: number; dy: number } {
  const total = polyLength(pts);
  const target = Math.max(0, Math.min(1, t)) * total;
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc + seg >= target) {
      const f = (target - acc) / (seg || 1);
      return {
        x: pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f,
        y: pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f,
        dx: (pts[i][0] - pts[i - 1][0]) / (seg || 1),
        dy: (pts[i][1] - pts[i - 1][1]) / (seg || 1),
      };
    }
    acc += seg;
  }
  const l = pts[pts.length - 1];
  return { x: l[0], y: l[1], dx: 1, dy: 0 };
}

export function roadsideSpots(): RoadsideSpec[] {
  const out: RoadsideSpec[] = [];
  ROADS.forEach((r, ri) => {
    const len = polyLength(r.pts);
    const n = Math.floor(len / 2.3);
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n;
      const p = roadPoint(r.pts, t);
      const h1 = hash01("shop" + ri, k * 3 + 1);
      const h2 = hash01("shop" + ri, k * 3 + 2);
      const h3 = hash01("shop" + ri, k * 3 + 3);
      const side = k % 2 === 0 ? 1 : -1;
      const off = roadHalfW(r.type) + 1.8 + h1 * 1.6;
      const x = p.x + -p.dy * off * side;
      const y = p.y + p.dx * off * side;
      if (x < 0 || y < 0 || x > GRID_W || y > GRID_H) continue;
      let inside = false;
      for (const z of ZONES) {
        if (x > z.gx - 0.8 && x < z.gx + z.w + 0.8 && y > z.gy - 0.8 && y < z.gy + z.d + 0.8) {
          inside = true;
          break;
        }
      }
      if (inside) continue;
      out.push({
        x, y,
        w: 1.6 + h1 * 1.2,
        d: 1.6 + h2 * 0.8,
        h: 2.5 + h3 * 3.5,
        face: Math.floor(h2 * 10) % 10,
        awn: h3 > 0.55,
        rot: Math.atan2(p.dx, p.dy),
      });
    }
  });
  return out;
}

// ---- Avatars ----
export interface Ghost {
  name: string;
  color: string;
  skin: string;
  pts: [number, number][]; // waypoint loop in grid coords
  speed: number; // tiles/sec
  dwell: number; // pause secs at each point
  nightOnly?: boolean;
  fem?: boolean; // gele instead of fila
}

/** Scripted townsfolk — cheap alive feel, no server needed. */
export const GHOSTS: Ghost[] = [
  { name: "Mama Put", color: "#B33A3A", skin: "#5a3a26", pts: [[14, 13.9], [16.5, 13.9], [15, 14.6]], speed: 1.1, dwell: 7, fem: true },
  { name: "Baba Ade", color: "#1F7A4D", skin: "#3b2317", pts: [[17.5, 4.2], [23, 4.4], [19, 6.2]], speed: 1.0, dwell: 8 },
  { name: "Iwo Tout", color: "#E8A020", skin: "#3b2317", pts: [[30.5, 18.3], [33, 18.6], [35, 18.3]], speed: 2.2, dwell: 2 },
  { name: "Sani", color: "#3b5bd6", skin: "#5a3a26", pts: [[17, 20], [14, 23.5], [15.5, 21.5]], speed: 1.8, dwell: 3 },
  { name: "Ada", color: "#8a4fb0", skin: "#3b2317", pts: [[17.5, 4], [20, 10], [18, 7]], speed: 1.6, dwell: 4, fem: true },
  { name: "Elder", color: "#EDE3D2", skin: "#5a3a26", pts: [[24, 16.6], [26.5, 17.2]], speed: 0.7, dwell: 10 },
  { name: "Alaba", color: "#1F7A4D", skin: "#3b2317", pts: [[27.4, 19.5], [29.5, 19.5]], speed: 1.4, dwell: 5, fem: true },
  { name: "Guard", color: "#222831", skin: "#3b2317", pts: [[23, 17.2], [25.5, 18.2]], speed: 1.2, dwell: 6, nightOnly: true },
  { name: "Aunty", color: "#c2185b", skin: "#5a3a26", pts: [[30.5, 18.4], [32.6, 17.3], [31.2, 18.6]], speed: 1.3, dwell: 4, fem: true },
  { name: "Broda", color: "#0e7a8a", skin: "#3b2317", pts: [[34.8, 18.4], [33.9, 17.2], [34.2, 18.6]], speed: 1.5, dwell: 3 },
];

// ---- Crowds: ambient townsfolk density per zone (busy Ibadan) ----
export interface CrowdSpec {
  zone: string;
  count: number;
}

export const CROWDS: CrowdSpec[] = [
  { zone: "iwo-road", count: 7 },
  { zone: "bodija", count: 6 },
  { zone: "oja-oba", count: 4 },
  { zone: "ui-gate", count: 4 },
  { zone: "sango", count: 3 },
  { zone: "dugbe", count: 3 },
  { zone: "challenge", count: 3 },
  { zone: "samonda", count: 2 },
  { zone: "mokola", count: 2 },
  { zone: "mapo", count: 2 },
  { zone: "agodi", count: 2 },
  { zone: "molete", count: 2 },
  { zone: "oje", count: 1 },
  { zone: "ring-road", count: 1 },
  { zone: "eleyele", count: 1 },
];

export const CROWD_CAP_FULL = 43;
export const CROWD_CAP_SAVER = 15;

export const SKINS = ["#3b2317", "#5a3a26", "#2b1a10", "#6b4a2e", "#1f120a"];
export const CLOTHS = [
  "#B33A3A", "#1F7A4D", "#E8A020", "#3b5bd6", "#8a4fb0",
  "#EDE3D2", "#7A4A2B", "#0e7a8a", "#c2185b", "#455a64",
  "#2c945f", "#d9a914",
];

// ---- Ambient traffic: micras (two-tone), white buses, keke, okada ----
// Rule: NO yellow buses in Ibadan parks. White buses carry a stripe.
export type VehicleKind = "micra" | "bus" | "keke" | "okada";

export interface TrafficSpec {
  road: number; // index into ROADS
  t: number; // 0..1 start position
  speed: number; // loop fraction per sec
  dir: 1 | -1;
  kind: VehicleKind;
}

export const TRAFFIC: TrafficSpec[] = [
  { road: 0, t: 0.1, speed: 0.03, dir: 1, kind: "micra" },
  { road: 0, t: 0.6, speed: 0.025, dir: -1, kind: "bus" },
  { road: 1, t: 0.2, speed: 0.02, dir: 1, kind: "micra" },
  { road: 1, t: 0.7, speed: 0.018, dir: -1, kind: "keke" },
  { road: 3, t: 0.3, speed: 0.028, dir: 1, kind: "micra" },
  { road: 4, t: 0.15, speed: 0.035, dir: 1, kind: "bus" },
  { road: 4, t: 0.55, speed: 0.03, dir: -1, kind: "micra" },
  { road: 4, t: 0.8, speed: 0.04, dir: 1, kind: "okada" },
  { road: 6, t: 0.4, speed: 0.025, dir: -1, kind: "micra" },
  { road: 7, t: 0.5, speed: 0.02, dir: 1, kind: "bus" },
  { road: 9, t: 0.3, speed: 0.045, dir: 1, kind: "bus" },
  { road: 10, t: 0.6, speed: 0.03, dir: -1, kind: "okada" },
];

export const TRAFFIC_CAP_SAVER = 5;

// Bus-stop names per drive route (parallel to DRIVE_ROUTES bays).
export const BAY_NAMES: Record<string, string[]> = {
  "mokola-iwo": ["MOKOLA", "CHALLENGE", "IWO ROAD"],
  "ui-beere": ["U.I. GATE", "BODIJA", "BEERE"],
};

// ---- Drivable routes (top-down driving on real corridors) ----
export interface DriveRoute {
  id: string;
  name: string;
  short: string;
  pts: [number, number][];
  bays: number[]; // stop fractions
  vio: number[]; // checkpoint fractions
  signals: number[]; // traffic-light fractions (red runs fined)
  potholes: 0 | 1 | 2 | 3; // hazard density
  endLabel: string;
}

export const DRIVE_ROUTES: DriveRoute[] = [
  {
    id: "mokola-iwo",
    name: "Mokola → Challenge → Iwo Road",
    short: "Mokola–Iwo",
    pts: [[11.5, 13], [13.5, 15.5], [16, 18.5], [18, 21], [22, 19.8], [26, 18.2], [30, 16.5], [33, 15.5]],
    bays: [0.3, 0.6, 0.85],
    vio: [0.5],
    signals: [0.42, 0.72],
    potholes: 1,
    endLabel: "IWO ROUNDABOUT",
  },
  {
    id: "ui-beere",
    name: "UI → Bodija → Beere pothole run",
    short: "UI–Beere",
    pts: [[17.5, 3.5], [18.5, 6], [19, 7.5], [17, 9.5], [16, 11], [18, 12], [20, 12.5], [23, 13.5], [26, 14.5]],
    bays: [0.3, 0.65, 0.9],
    vio: [0.55],
    signals: [0.38, 0.68],
    potholes: 3,
    endLabel: "BEERE",
  },
];

// ---- In-world doors: walk up and step inside (no tabs needed) ----
export type DoorAction = "market" | "store-food" | "store-prov" | "store-omo" | "terminal" | "exam";

export interface Door {
  id: string;
  zone: string;
  x: number; // grid coords (door mat)
  y: number;
  label: string;
  action: DoorAction;
}

export const DOORS: Door[] = [
  { id: "door-bodija", zone: "bodija", x: 16, y: 13.6, label: "Bodija Stalls", action: "market" },
  { id: "door-ojaoba", zone: "oja-oba", x: 24, y: 22.6, label: "Oja Oba Stalls", action: "market" },
  { id: "door-oje", zone: "oje", x: 31.5, y: 19.5, label: "Oje Corner", action: "market" },
  { id: "door-mamaput", zone: "bodija", x: 11.5, y: 13.6, label: "Mama Put's Stall", action: "store-food" },
  { id: "door-kiosk", zone: "sango", x: 23.5, y: 6.2, label: "Kiosk", action: "store-prov" },
  { id: "door-boutique", zone: "dugbe", x: 19, y: 14.2, label: "Boutique", action: "store-omo" },
  { id: "door-terminal", zone: "iwo-road", x: 33, y: 18.8, label: "Iwo Terminal", action: "terminal" },
  { id: "door-uihall", zone: "ui-gate", x: 17.5, y: 6.4, label: "UI Exam Hall", action: "exam" },
  { id: "door-samonda", zone: "samonda", x: 19, y: 9.6, label: "Study Hall", action: "exam" },
];

// ---- NPC memory: tiers by meetings ----
export interface NpcDef {
  id: string; // ghost name key
  name: string;
  lines: [string, string, string, string]; // stranger, familiar, regular, family
}

export const NPCS: NpcDef[] = [
  {
    id: "Mama Put", name: "Mama Put",
    lines: [
      "“New face? Sit. Food dey, Bodija price.”",
      "“Ah, you again — extra meat small.”",
      "“My regular! I keep gbegiri hot for you.”",
      "“My own pikin. Eat free when rain falls.”",
    ],
  },
  {
    id: "Baba Ade", name: "Baba Ade",
    lines: [
      "“Rent na Friday. No story, new tenant.”",
      "“You dey try. Room still yours.”",
      "“Reliable tenant. I tell others about you.”",
      "“Family. Owe small? Pay when hustle land.”",
    ],
  },
  {
    id: "Iwo Tout", name: "Iwo Tout",
    lines: [
      "“Enter motoooo! Where you dey go?!”",
      "“My guy! Front seat reserved.”",
      "“Odogwu loader! Full load sure for you.”",
      "“Park royalty. VIO no fit touch your people.”",
    ],
  },
  {
    id: "Sani", name: "Sani Conductor",
    lines: [
      "“O wa o! Hold your change o!”",
      "“I sabi your stop already.”",
      "“Conductor-plus: I save window seat.”",
      "“Brother of the road. Free ride Fridays.”",
    ],
  },
  {
    id: "Ada", name: "Ada",
    lines: [
      "“You read for UI? Which department?”",
      "“Study buddy! Library 2pm?”",
      "“We don pass three exams together!”",
      "“Bestie for life. Convocation matching outfits.”",
    ],
  },
  {
    id: "Elder", name: "Mapo Elder",
    lines: [
      "“Dobale, ọmọ mi. Who be your people?”",
      "“I remember your face. Respectful child.”",
      "“Sit. Let me tell you about Oke Mapo.”",
      "“My own child. The ancestors know your name.”",
    ],
  },
  {
    id: "Alaba", name: "Alaba",
    lines: [
      "“Buy something, fine pikin.”",
      "“I give you trader price now.”",
      "“My best customer. First pick of new ankara.”",
      "“Sister/brother. Stall na your stall.”",
    ],
  },
];
