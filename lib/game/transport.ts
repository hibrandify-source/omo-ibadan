// Omo Ibadan — ways to move around the city.
import { PRICES } from "./prices";
import { roadKm } from "../map/ibadan";

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

/**
 * Distance by road between two districts, in km, measured along the real
 * OpenStreetMap road network (lib/map). Places not on the map fall back to 5 km.
 */
export function distanceKm(a: string, b: string): number {
  if (a === b) return 0;
  return roadKm(a, b) ?? 5;
}

export function tripCost(modeId: string, km: number): { fare: number; minutes: number } {
  const m = TRANSPORT.find((t) => t.id === modeId)!;
  return { fare: Math.round(m.perKm * km), minutes: Math.round(m.minPerKm * km) };
}
