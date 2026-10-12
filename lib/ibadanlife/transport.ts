// IbadanLife — 6 ways to move (LagosLife parity, go-slow built in).

export interface TransportMode {
  id: string;
  name: string;
  icon: string;
  /** naira per km */
  perKm: number;
  /** minutes per km (go-slow adjusted) */
  minPerKm: number;
  energyCost: number;
  blurb: string;
}

export const TRANSPORT: TransportMode[] = [
  { id: "trek", name: "Trek", icon: "🚶", perKm: 0, minPerKm: 15, energyCost: 12, blurb: "Free, but slow. Long walks tire you out." },
  { id: "danfo", name: "Danfo / Micra", icon: "🚐", perKm: 120, minPerKm: 6, energyCost: 4, blurb: "Cheap shared rides. Half price under Transport Subsidy law." },
  { id: "keke", name: "Keke", icon: "🛺", perKm: 150, minPerKm: 5, energyCost: 3, blurb: "Cuts small corners. Half price under subsidy." },
  { id: "okada", name: "Okada", icon: "🏍️", perKm: 250, minPerKm: 3, energyCost: 5, blurb: "Fast. Hold on tight." },
  { id: "cab", name: "Cab (AC + comfort)", icon: "🚕", perKm: 450, minPerKm: 4, energyCost: 1, blurb: "Comfort costs." },
  { id: "car", name: "Your own car", icon: "🚗", perKm: 100, minPerKm: 3.5, energyCost: 2, blurb: "Fuel only. Nepo start comes with one." },
];

/** Rough inter-district distances in km (Ibadan real-ish). */
export const DISTANCES: Record<string, Record<string, number>> = {
  "bodija": { "mokola": 3, "dugbe": 5, "ui-gate": 2, "iwo-road": 9, "challenge": 7 },
  "mokola": { "dugbe": 3, "mapo": 6, "ui-gate": 4, "challenge": 5 },
  "dugbe": { "mapo": 4, "oja-oba": 4, "oje": 5, "challenge": 4, "ring-road": 5 },
  "iwo-road": { "challenge": 4, "molete": 6, "ring-road": 5, "bodija": 9 },
};

export function tripCost(modeId: string, km: number, subsidyHalf: boolean): { fare: number; minutes: number } {
  const m = TRANSPORT.find((t) => t.id === modeId)!;
  let fare = Math.round(m.perKm * km);
  if (subsidyHalf && (modeId === "danfo" || modeId === "keke")) fare = Math.round(fare / 2);
  return { fare, minutes: Math.round(m.minPerKm * km) };
}
