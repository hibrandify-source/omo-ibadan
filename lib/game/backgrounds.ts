// Omo Ibadan — the birth lottery.
//
// Every life is drawn once: Omo Iya Lobe (a soup seller's child from the old
// city) or Alowonle (born into money in Bodija). Neither is easy mode.
// Omo Iya Lobe fights for every naira but has a community behind them.
// Alowonle has capital and access, but money comes with conditions, upkeep,
// and people who want a share.

import { PRICES } from "./prices";

export type BackgroundId = "omo-iya-lobe" | "alowonle";

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  blurb: string;
}

export interface Obligation {
  id: string;
  title: string;
  amount: number;
  dueDay: number;
  blurb: string;
}

export interface Background {
  id: BackgroundId;
  name: string;
  meaning: string;
  tagline: string;
  story: string;
  /** chance of drawing this life */
  odds: number;
  pocket: number;
  iwa: number;
  energy: number;
  /** starting family bond (Mama's trust / Daddy's approval), 0..100 */
  bond: number;
  bondLabel: string;
  homeZone: string;
  homeLabel: string;
  compound: "courtyard" | "gra";
  outfit: string;
  hasCar: boolean;
  /** paid every 7 days while bond >= allowanceMinBond */
  allowancePerWeek: number;
  allowanceMinBond: number;
  /** naira drained every in-game day */
  dailyUpkeep: { label: string; amount: number }[];
  family: FamilyMember[];
  obligations: Obligation[];
  /** careers this life can enter at level 2 through family connections */
  connections: string[];
  strengths: string[];
  pressures: string[];
}

export const BACKGROUNDS: Record<BackgroundId, Background> = {
  "omo-iya-lobe": {
    id: "omo-iya-lobe",
    name: "Omo Iya Lobe",
    meaning: "Child of the soup seller",
    tagline: "Mama's pot raised you. Now it's your turn.",
    story:
      "You grew up in a family compound in Beere, under the brown roofs, helping Mama sell gbegiri and ewedu at Oja'ba. Money is short, the landlord is impatient, and your younger brother's school fees are due. But the whole street knows your name.",
    odds: 0.8,
    pocket: 15000,
    iwa: 65,
    energy: 85,
    bond: 70,
    bondLabel: "Mama's trust",
    homeZone: "beere",
    homeLabel: "Family compound room, Beere",
    compound: "courtyard",
    outfit: "#7A4A2B",
    hasCar: false,
    allowancePerWeek: 0,
    allowanceMinBond: 0,
    dailyUpkeep: [],
    family: [
      { id: "mama", name: "Mama Bisi", role: "Iya Lobe", blurb: "Sells gbegiri and ewedu at Oja'ba. Knows every trader by name." },
      { id: "tunde", name: "Tunde", role: "Younger brother", blurb: "SS3 at a public school in Mapo. WAEC is coming." },
      { id: "baba-landlord", name: "Baba Ade", role: "Landlord", blurb: "Patient until he isn't." },
    ],
    obligations: [
      { id: "mama-rent", title: "Mama's rent balance", amount: 60000, dueDay: 10, blurb: "Baba Ade gave Mama till the end of the month for the balance." },
      { id: "waec-fees", title: "Tunde's WAEC fees", amount: 30000, dueDay: 14, blurb: "Registration closes soon. Tunde won't ask twice." },
    ],
    connections: ["amala-cook", "market-trader"],
    strengths: [
      "Mama's network: traders at Oja'ba and Bodija give you work",
      "High Iwa: elders and neighbours vouch for you",
      "Street sense: you know which corner sells what",
    ],
    pressures: [
      "Mama's rent balance and Tunde's school fees",
      "No safety net: one bad week hurts",
      "Every day you don't help at the stall, Mama notices",
    ],
  },

  alowonle: {
    id: "alowonle",
    name: "Alowonle",
    meaning: "One who has money at home",
    tagline: "Daddy knows people. Daddy also has plans for you.",
    story:
      "You live in your father's house in Old Bodija, with a gateman, a generator that never sleeps, and a car with your name on the papers. Daddy pays your allowance, as long as you stay on his good side. Cousins call more than friends do, and everyone expects you to be somebody.",
    odds: 0.2,
    pocket: 250000,
    iwa: 45,
    energy: 80,
    bond: 55,
    bondLabel: "Daddy's approval",
    homeZone: "old-bodija",
    homeLabel: "Family house, Old Bodija",
    compound: "gra",
    outfit: "#3b5bd6",
    hasCar: true,
    allowancePerWeek: 60000,
    allowanceMinBond: 40,
    dailyUpkeep: [{ label: "Car fuel", amount: PRICES.transport.carFuelPerDay }],
    family: [
      { id: "daddy", name: "Chief Adeyemi", role: "Father", blurb: "Contractor. Built half of Ring Road's plazas. Expects a successor." },
      { id: "mummy", name: "Mummy", role: "Mother", blurb: "Runs a fabric business at Gbagi. Hosts every owambe that matters." },
      { id: "kunle", name: "Cousin Kunle", role: "Cousin", blurb: "Always has a 'business idea'. Always needs a small loan." },
    ],
    obligations: [
      { id: "owambe-aso-ebi", title: "Mummy's 60th: aso-ebi + spray money", amount: 120000, dueDay: 12, blurb: "The whole family will be watching what you wear and spray." },
    ],
    connections: ["banker", "oil-exec"],
    strengths: [
      "Capital: a car, a big starting balance, a weekly allowance",
      "Connections: Daddy's name opens bank and depot doors",
      "Comfort: home is always stocked and powered",
    ],
    pressures: [
      "Allowance stops if Daddy's approval falls too low",
      "Daily car fuel and a lifestyle to keep up",
      "Low Iwa: people assume you're spoilt until you prove otherwise",
      "Relatives and hangers-on want their share",
    ],
  },
};

export const BACKGROUND_LIST: Background[] = Object.values(BACKGROUNDS);

/** Draw a life. `rand` is injectable so tests and debug overrides are deterministic. */
export function drawBackground(rand: () => number = Math.random): BackgroundId {
  return rand() < BACKGROUNDS.alowonle.odds ? "alowonle" : "omo-iya-lobe";
}

export function isBackgroundId(v: unknown): v is BackgroundId {
  return v === "omo-iya-lobe" || v === "alowonle";
}

/** Map pre-lottery archetype saves onto a background. */
export function backgroundFromLegacyArchetype(archId: string | undefined): BackgroundId {
  return archId === "dugbe-bigboy" ? "alowonle" : "omo-iya-lobe";
}

/** Allowance due on day `day`? Paid every 7th day while bond holds. */
export function allowanceDue(bg: Background, day: number, bond: number): number {
  if (bg.allowancePerWeek <= 0 || day % 7 !== 0) return 0;
  return bond >= bg.allowanceMinBond ? bg.allowancePerWeek : 0;
}

export function upkeepFor(bg: Background): number {
  return bg.dailyUpkeep.reduce((s, u) => s + u.amount, 0);
}

/** Obligations not yet paid and due on or before `day + warnDays`. */
export function upcomingObligations(bg: Background, day: number, paid: string[], warnDays = 3): Obligation[] {
  return bg.obligations.filter((o) => !paid.includes(o.id) && o.dueDay <= day + warnDays);
}

/** Obligations that have passed their due day unpaid. */
export function overdueObligations(bg: Background, day: number, paid: string[]): Obligation[] {
  return bg.obligations.filter((o) => !paid.includes(o.id) && day > o.dueDay);
}
