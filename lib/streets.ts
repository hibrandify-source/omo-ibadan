// Street furniture data — the LagosLife-style street language,
// placed on Ibadan geography: billboards at big junctions,
// bus shelters at real bays, junction pads where corridors meet.

export interface Billboard {
  x: number; // grid coords
  y: number;
  rotY: number; // facing
  bg: string; // panel color
  accent: string; // stripe color
}

export const BILLBOARDS: Billboard[] = [
  { x: 16, y: 10.2, rotY: 0.4, bg: "#E8A020", accent: "#B33A3A" }, // Bodija approach
  { x: 19.5, y: 20, rotY: -0.3, bg: "#1F7A4D", accent: "#F2EDE4" }, // Challenge
  { x: 31, y: 13.2, rotY: 0.9, bg: "#3b5bd6", accent: "#F5C518" }, // Iwo Road park
  { x: 6.5, y: 13, rotY: -0.7, bg: "#B33A3A", accent: "#F2EDE4" }, // Dugbe
];

export interface Junction {
  x: number;
  y: number;
  r: number; // tiles
}

export const JUNCTIONS: Junction[] = [
  { x: 18, y: 21, r: 2.2 }, // Challenge knot
  { x: 11.5, y: 13, r: 1.8 }, // Mokola (under flyover)
  { x: 20, y: 12.5, r: 1.6 }, // Secretariat/Total Garden
];

export const SHOP_FACES = [
  "#EDE3D2", "#F5C518", "#3b5bd6", "#c2185b", "#1F7A4D",
  "#E8A020", "#0e7a8a", "#F2EDE4", "#B33A3A", "#8a4fb0",
];

// Shared traffic-light cycle (visual posts + driving fines stay in sync).
// 12s period, 5s red, offset per junction.
export function signalIsRed(idx: number, nowMs: number): boolean {
  return ((nowMs + idx * 6000) % 12000) < 5000;
}

export const ASPHALT = "#33302b";
export const SIDEWALK = "#cfc6b4";
export const CURB = "#8f8674";
export const GROUND_URBAN = "#a8a094";
