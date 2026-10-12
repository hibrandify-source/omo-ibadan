// Omo Ibadan — ways to move around the city.
// Distances are hand-estimated for now; phase 3 replaces DISTANCES with
// route lengths computed from OpenStreetMap corridors.

import { PRICES } from "./prices";

export interface TransportMode {
  id: string;
  name: string;
  icon: string;
  perKm: number;
  minPerKm: number;
  energyCost: number;
  blurb: string;
}

export const TRANSPORT: TransportMode[] = [
  { id: "trek", name: "Trek", icon: "🚶", perKm: 0, minPerKm: 15, energyCost: 12, blurb: "Free, but slow. Long walks tire you out." },
  { id: "micra", name: "Micra / shared taxi", icon: "🚐", perKm: PRICES.transport.micraFarePerKm, minPerKm: 6, energyCost: 4, blurb: "Cheap shared rides. Wait for full load." },
  { id: "keke", name: "Keke", icon: "🛺", perKm: 150, minPerKm: 5, energyCost: 3, blurb: "Cuts small corners." },
  { id: "okada", name: "Okada", icon: "🏍️", perKm: 300, minPerKm: 3, energyCost: 5, blurb: "Fast. Hold on tight." },
  { id: "cab", name: "Ride-hailing cab", icon: "🚕", perKm: 600, minPerKm: 4, energyCost: 1, blurb: "AC and comfort, at a price." },
  { id: "car", name: "Your own car", icon: "🚗", perKm: 0, minPerKm: 3.5, energyCost: 2, blurb: "Fuel is paid daily, not per trip." },
];

/** Rough inter-district distances in km. Missing pairs fall back to 5 km. */
export const DISTANCES: Record<string, Record<string, number>> = {
  "bodija": { "mokola": 3, "dugbe": 5, "ui-gate": 2, "iwo-road": 9, "challenge": 7 },
  "mokola": { "dugbe": 3, "mapo": 6, "ui-gate": 4, "challenge": 5 },
  "dugbe": { "mapo": 4, "oja-oba": 4, "oje": 5, "challenge": 4, "ring-road": 5 },
  "iwo-road": { "challenge": 4, "molete": 6, "ring-road": 5, "bodija": 9 },
};

export function distanceKm(a: string, b: string): number {
  if (a === b) return 0;
  return DISTANCES[a]?.[b] ?? DISTANCES[b]?.[a] ?? 5;
}

export function tripCost(modeId: string, km: number): { fare: number; minutes: number } {
  const m = TRANSPORT.find((t) => t.id === modeId)!;
  return { fare: Math.round(m.perKm * km), minutes: Math.round(m.minPerKm * km) };
}
