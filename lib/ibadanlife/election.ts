// IbadanLife — weekly Olubadan-palace-style governor race (LagosLife parity).
// Winner sets one city-wide law for 7 days + ₦25,000/day allowance.

export interface Law { id: string; name: string; blurb: string; }
export const LAWS: Law[] = [
  { id: "transport-subsidy", name: "Transport Subsidy", blurb: "Danfo + keke fares half price." },
  { id: "min-wage", name: "Minimum Wage Raise", blurb: "All shift pay +15%." },
  { id: "market-levy-cut", name: "Market Levy Cut", blurb: "Trading profits +12%." },
  { id: "light-fund", name: "Light Fund", blurb: "NEPA events half as often." },
  { id: "owambe-tax", name: "Owambe Tax + Free Zones", blurb: "Owambe entry +50%, Agodi/U.I. fun +20%." },
];

export interface Candidate { name: string; lawId: string; votes: number; manager?: string; }

export function weeklyRaceKey(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export const CAMPAIGN_FEE = 50000;
export const GOV_ALLOWANCE_PER_DAY = 25000;

/** Sunday 8PM Lagos turnover. */
export function raceOver(now = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-NG", { timeZone: "Africa/Lagos", weekday: "short", hour: "numeric", hour12: false }).formatToParts(now);
  const wd = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hr = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  return wd === "Sun" && hr >= 20;
}
