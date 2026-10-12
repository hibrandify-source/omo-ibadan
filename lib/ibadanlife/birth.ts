// IbadanLife — birth lottery (LagosLife parity).
// Nepo Baby vs LAPO Baby, Ibadan edition. Decided once per account.

export type BirthLottery = "nepo" | "lapo";

export interface BirthPackage {
  kind: BirthLottery;
  tagline: string;
  pocket: number;
  loanTotal: number;
  loanWeekly: number;
  homeId: string;
  hasCar: boolean;
}

export const BIRTH_PACKAGES: Record<BirthLottery, BirthPackage> = {
  nepo: {
    kind: "nepo", tagline: "Daddy knows people.",
    pocket: 500000, loanTotal: 0, loanWeekly: 0,
    homeId: "bodija-flat", hasCar: true,
  },
  lapo: {
    kind: "lapo", tagline: "Self-made hits different.",
    pocket: 60000, loanTotal: 72000, loanWeekly: 12000,
    homeId: "agbowo-room", hasCar: false,
  },
};

export function drawLottery(rand = Math.random): BirthLottery {
  return rand() < 0.18 ? "nepo" : "lapo"; // ~18% Nepo, like the street says
}
