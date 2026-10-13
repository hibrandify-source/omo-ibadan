// Omo Ibadan — shared world data: homes and furniture, character swatches,
// shop doors and NPC lines. (The old isometric diorama data was removed when
// the city moved to the OpenStreetMap map and code-drawn scenes.)
import { PRICES } from "./game/prices";
import type { BackgroundId } from "./game/backgrounds";

// ---- Homes: empty decor → hustle to furnish → flat → duplex ----
// Every life starts in a sparse room. Furniture is bought with hustled Ola;
// each piece raises rest bonus. Moving up a tier costs a year's rent upfront
// plus agent and caution fees (see PRICES.housing).

export type HomeTier = "room" | "flat" | "duplex";

export interface HomePath {
  bgId: BackgroundId;
  room: string;
  flat: string;
  duplex: string;
  flatCost: number;
  duplexCost: number;
}

const RENT = PRICES.housing.rentYear;
const MOVE = PRICES.housing.moveCost;

export const HOME_PATHS: HomePath[] = [
  { bgId: "omo-iya-lobe", room: "Your corner of Mama's room, Beere", flat: "Self-contain, Oke-Ado", duplex: "Duplex, Iyaganku", flatCost: MOVE(RENT.selfContain), duplexCost: MOVE(RENT.jerichoDuplex) },
  { bgId: "alowonle", room: "Boys' quarters room, Daddy's house, Old Bodija", flat: "Your own flat, New Bodija", duplex: "Duplex, Jericho GRA", flatCost: MOVE(RENT.bodijaFlat), duplexCost: MOVE(RENT.jerichoDuplex) },
];

export interface Furniture {
  id: string;
  name: string;
  cost: number;
  rest: number; // extra energy when you rest/chop at home
  minTier: HomeTier;
  iwa: number; // hosting elders / keeping home grants Iwa
}

export const FURNITURE: Furniture[] = [
  { id: "mat", name: "Floor mat", cost: 0, rest: 0, minTier: "room", iwa: 0 },
  { id: "mattress", name: "Foam mattress", cost: PRICES.furniture.mattress, rest: 5, minTier: "room", iwa: 0 },
  { id: "fan", name: "Standing fan", cost: PRICES.furniture.fan, rest: 8, minTier: "room", iwa: 0 },
  { id: "rug", name: "Center rug", cost: PRICES.furniture.rug, rest: 4, minTier: "room", iwa: 1 },
  { id: "curtains", name: "Curtains", cost: PRICES.furniture.curtains, rest: 3, minTier: "room", iwa: 1 },
  { id: "shelf", name: "Bookshelf (exam +5% flavor)", cost: PRICES.furniture.shelf, rest: 4, minTier: "room", iwa: 2 },
  { id: "gen", name: "Small gen (NEPA-proof rest)", cost: PRICES.furniture.gen, rest: 12, minTier: "flat", iwa: 1 },
  { id: "tv", name: "TV + decoder", cost: PRICES.furniture.tv, rest: 10, minTier: "flat", iwa: 0 },
  { id: "fridge", name: "Fridge (chop cheaper)", cost: PRICES.furniture.fridge, rest: 12, minTier: "flat", iwa: 1 },
  { id: "sofa", name: "Sofa set (host elders)", cost: PRICES.furniture.sofa, rest: 8, minTier: "flat", iwa: 3 },
  { id: "ac", name: "AC (duplex flex)", cost: PRICES.furniture.ac, rest: 18, minTier: "duplex", iwa: 0 },
  { id: "dining", name: "Dining set (family feasts)", cost: PRICES.furniture.dining, rest: 10, minTier: "duplex", iwa: 4 },
];

export interface HomeSave {
  tier: HomeTier;
  furniture: string[]; // owned furniture ids (always includes "mat")
}

export function emptyHome(): HomeSave {
  return { tier: "room", furniture: ["mat"] };
}


// ---- Character swatches (onboarding) ----
export const SKINS = ["#3b2317", "#5a3a26", "#2b1a10", "#6b4a2e", "#1f120a"];
export const CLOTHS = [
  "#B33A3A", "#1F7A4D", "#E8A020", "#3b5bd6", "#8a4fb0",
  "#EDE3D2", "#7A4A2B", "#0e7a8a", "#c2185b", "#455a64",
  "#2c945f", "#d9a914",
];

// ---- In-world doors: walk up and step inside (no tabs needed) ----
export type DoorAction = "market" | "store-food" | "store-prov" | "store-omo" | "terminal" | "exam";

export interface Door {
  id: string;
  zone: string;
  x: number; // grid coords (door mat)
  y: number;
  label: string;
  action: DoorAction;
}

export const DOORS: Door[] = [
  { id: "door-bodija", zone: "bodija", x: 16, y: 13.6, label: "Bodija Stalls", action: "market" },
  { id: "door-ojaoba", zone: "oja-oba", x: 24, y: 22.6, label: "Oja Oba Stalls", action: "market" },
  { id: "door-oje", zone: "oje", x: 31.5, y: 19.5, label: "Oje Corner", action: "market" },
  { id: "door-mamaput", zone: "bodija", x: 11.5, y: 13.6, label: "Mama Put's Stall", action: "store-food" },
  { id: "door-kiosk", zone: "sango", x: 23.5, y: 6.2, label: "Kiosk", action: "store-prov" },
  { id: "door-boutique", zone: "dugbe", x: 19, y: 14.2, label: "Boutique", action: "store-omo" },
  { id: "door-terminal", zone: "iwo-road", x: 33, y: 18.8, label: "Iwo Terminal", action: "terminal" },
  { id: "door-uihall", zone: "ui-gate", x: 17.5, y: 6.4, label: "UI Exam Hall", action: "exam" },
  { id: "door-samonda", zone: "samonda", x: 19, y: 9.6, label: "Study Hall", action: "exam" },
];

// ---- NPC memory: tiers by meetings ----
export interface NpcDef {
  id: string; // ghost name key
  name: string;
  lines: [string, string, string, string]; // stranger, familiar, regular, family
}

export const NPCS: NpcDef[] = [
  {
    id: "Mama Put", name: "Mama Put",
    lines: [
      "“New face? Sit. Food dey, Bodija price.”",
      "“Ah, you again — extra meat small.”",
      "“My regular! I keep gbegiri hot for you.”",
      "“My own pikin. Eat free when rain falls.”",
    ],
  },
  {
    id: "Baba Ade", name: "Baba Ade",
    lines: [
      "“Rent na Friday. No story, new tenant.”",
      "“You dey try. Room still yours.”",
      "“Reliable tenant. I tell others about you.”",
      "“Family. Owe small? Pay when hustle land.”",
    ],
  },
  {
    id: "Iwo Tout", name: "Iwo Tout",
    lines: [
      "“Enter motoooo! Where you dey go?!”",
      "“My guy! Front seat reserved.”",
      "“Odogwu loader! Full load sure for you.”",
      "“Park royalty. VIO no fit touch your people.”",
    ],
  },
  {
    id: "Sani", name: "Sani Conductor",
    lines: [
      "“O wa o! Hold your change o!”",
      "“I sabi your stop already.”",
      "“Conductor-plus: I save window seat.”",
      "“Brother of the road. Free ride Fridays.”",
    ],
  },
  {
    id: "Ada", name: "Ada",
    lines: [
      "“You read for UI? Which department?”",
      "“Study buddy! Library 2pm?”",
      "“We don pass three exams together!”",
      "“Bestie for life. Convocation matching outfits.”",
    ],
  },
  {
    id: "Elder", name: "Mapo Elder",
    lines: [
      "“Dobale, ọmọ mi. Who be your people?”",
      "“I remember your face. Respectful child.”",
      "“Sit. Let me tell you about Oke Mapo.”",
      "“My own child. The ancestors know your name.”",
    ],
  },
  {
    id: "Alaba", name: "Alaba",
    lines: [
      "“Buy something, fine pikin.”",
      "“I give you trader price now.”",
      "“My best customer. First pick of new ankara.”",
      "“Sister/brother. Stall na your stall.”",
    ],
  },
];
