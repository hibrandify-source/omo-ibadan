// IbadanLife — 38 billboards + 24 Eleyele lake plots (LagosLife parity).
// Rent with game naira; holder's name + emoji shown on the city map.

export interface Board { id: string; road: string; slot: number; price: number; days: number; }
export const BILLBOARD_PRICE = 100000;
export const LAKEPLOT_PRICE = 50000;
export const RENTAL_DAYS = 7;

const ROADS = ["Iwo Rd", "Ring Rd", "Challenge", "Mokola", "Dugbe", "Bodija", "UI Gate", "Eleyele Rd", "Molete", "Beere"];

export const BILLBOARDS: Board[] = Array.from({ length: 38 }, (_, i) => ({
  id: `board-${i + 1}`,
  road: ROADS[i % ROADS.length],
  slot: Math.floor(i / ROADS.length) + 1,
  price: BILLBOARD_PRICE,
  days: RENTAL_DAYS,
}));

export interface LakePlot { id: string; zone: string; price: number; days: number; }
export const LAKE_PLOTS: LakePlot[] = Array.from({ length: 24 }, (_, i) => ({
  id: `lake-${i + 1}`,
  zone: i % 2 ? "Eleyele North" : "Eleyele South",
  price: LAKEPLOT_PRICE,
  days: RENTAL_DAYS,
}));

export interface Holding { assetId: string; holder: string; emoji: string; expiresDay: number; }
export function isHeld(h: Holding[], assetId: string, day: number): Holding | undefined {
  return h.find((x) => x.assetId === assetId && x.expiresDay > day);
}
