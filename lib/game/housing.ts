// Omo Ibadan — homes. Ibadan landlords collect a year upfront, plus agent
// and caution fees when you move in. Moving up a tier costs PRICES.housing.moveCost.

import { PRICES } from "./prices";

export interface Home {
  id: string;
  name: string;
  area: string;
  rentPerYear: number;
  blurb: string;
  hasBathroom: boolean;
  restBonus: number;
}

const R = PRICES.housing.rentYear;

export const HOMES: Home[] = [
  { id: "face-me-room", name: "Face-me-I-face-you room", area: "Beere / Agbowo", rentPerYear: R.faceMeRoom, blurb: "Shared toilet, shared gist, shared everything.", hasBathroom: false, restBonus: 18 },
  { id: "self-contain", name: "Self-contain", area: "Agbowo / Sango", rentPerYear: R.selfContain, blurb: "Your own door, your own toilet.", hasBathroom: true, restBonus: 25 },
  { id: "mini-flat", name: "Mini-flat", area: "Mokola / Oke-Ado", rentPerYear: R.miniFlat, blurb: "Own kitchen. IBEDC still decides.", hasBathroom: true, restBonus: 30 },
  { id: "bodija-flat", name: "3-bed flat", area: "New Bodija", rentPerYear: R.bodijaFlat, blurb: "Estate life. Water runs (mostly).", hasBathroom: true, restBonus: 40 },
  { id: "jericho-duplex", name: "Duplex", area: "Jericho GRA", rentPerYear: R.jerichoDuplex, blurb: "Borehole, gateman, quiet street.", hasBathroom: true, restBonus: 55 },
];

export function moveInCost(homeId: string): number {
  const h = HOMES.find((x) => x.id === homeId);
  return h ? PRICES.housing.moveCost(h.rentPerYear) : 0;
}
