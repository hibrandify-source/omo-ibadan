// IbadanLife — 5 homes, Saturday 9AM rent (LagosLife parity, Ibadan areas).

export interface Home {
  id: string;
  name: string;
  area: string;
  weeklyRent: number;
  upfrontWeeks: number;
  blurb: string;
  hasBathroom: boolean;
  restBonus: number; // energy per rest
}

export const HOMES: Home[] = [
  { id: "agbowo-room", name: "Face-me-I-face-you, Agbowo", area: "UI/Agbowo", weeklyRent: 1200, upfrontWeeks: 3, blurb: "Student room. Bucket bath, loud neighbours, big dreams.", hasBathroom: false, restBonus: 18 },
  { id: "beere-room", name: "Room, Beere (brown roofs)", area: "Beere", weeklyRent: 2400, upfrontWeeks: 3, blurb: "Family house. Elders greet you daily.", hasBathroom: false, restBonus: 22 },
  { id: "mokola-flat", name: "Mini-flat, Mokola", area: "Mokola", weeklyRent: 6000, upfrontWeeks: 3, blurb: "Own kitchen. IBEDC still decides.", hasBathroom: true, restBonus: 30 },
  { id: "bodija-flat", name: "2-bed Flat, Bodija", area: "Bodija", weeklyRent: 12000, upfrontWeeks: 3, blurb: "Estate life. Water runs (mostly).", hasBathroom: true, restBonus: 40 },
  { id: "jericho-duplex", name: "Duplex, Jericho GRA", area: "Jericho", weeklyRent: 30000, upfrontWeeks: 3, blurb: "Big boy. Real bathroom, borehole, gate man.", hasBathroom: true, restBonus: 55 },
];

export interface RentState {
  homeId: string;
  /** arrears in naira */
  owed: number;
  lastRentKey: string;
}

/** Saturday charge: rent + light bill. Returns new owed + eviction flag. */
export function chargeRent(state: RentState, wallet: number): {
  wallet: number; owed: number; evicted: boolean; msg: string;
} {
  const home = HOMES.find((h) => h.id === state.homeId)!;
  const due = home.weeklyRent + 800; // + light/water levy
  let walletAfter = wallet;
  let owed = state.owed;
  const paid = Math.min(walletAfter, due + owed);
  walletAfter -= paid;
  owed = due + owed - paid;
  if (owed > home.weeklyRent * 2) {
    return { wallet: walletAfter, owed, evicted: true, msg: `Baba Landlord changed the locks. Owed ₦${owed.toLocaleString()} (>2 weeks). Packed out to a cheaper place.` };
  }
  if (owed > 0) return { wallet: walletAfter, owed, evicted: false, msg: `Rent due ₦${due.toLocaleString()}. Paid ₦${paid.toLocaleString()}, owing ₦${owed.toLocaleString()}. Pay from Fọ́nu → Bank before locks change.` };
  return { wallet: walletAfter, owed, evicted: false, msg: `Rent paid ₦${due.toLocaleString()} (rent + light). Roof secured. 🏠` };
}

export function cheapestHome(state: RentState): string {
  const idx = HOMES.findIndex((h) => h.id === state.homeId);
  return idx > 0 ? HOMES[idx - 1].id : HOMES[0].id;
}
