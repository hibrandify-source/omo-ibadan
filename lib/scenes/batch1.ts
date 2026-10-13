// Dugbe (Cocoa House), Ring Road (the Palms), Eleyele (the reservoir),
// Agodi Gardens, Sango (the Polytechnic).

import type { SceneDef } from "./types";
import { busStop, houseRow, roadEnds } from "./build";

const dugbeStop = busStop(52, 41, "DUGBE");
export const DUGBE: SceneDef = {
  id: "dugbe",
  name: "Dugbe",
  w: 62,
  h: 48,
  ground: { seed: 3501, grassy: 0.03 },
  roads: [{ x0: 0, x1: 62, y: 41, width: 7.6, wear: 0.5, seed: 61, markings: 0.6, gutters: true, crossings: [30] }],
  yards: [{ x: 18, y: 16, w: 26, h: 18, surface: "paved" }],
  buildings: [
    ...houseRow(0, 18, 34, "mixed", 3510, ["BANK", "INSURANCE HOUSE"]),
    ...houseRow(44, 62, 34, "mixed", 3520, ["BOUTIQUE", "PHONES & LAPTOPS"]),
  ],
  fences: [],
  props: [
    { x: 22, y: 2, spec: { kind: "tower", w: 18, d: 14, floors: 26, name: "COCOA HOUSE" } },
    { x: 20, y: 31.4, spec: { kind: "palm", height: 8 }, seed: 3530 },
    { x: 42, y: 31.4, spec: { kind: "palm", height: 8 }, seed: 3531 },
    { x: 26, y: 37.2, spec: { kind: "car", car: "micra", dir: "E" } },
    { x: 36, y: 37.2, spec: { kind: "car", car: "camry", dir: "E" } },
    { x: 10, y: 36.6, spec: { kind: "umbrella", colors: ["#2f6fb5", "#f2efe6"], goods: "provisions" }, seed: 3532 },
    dugbeStop.prop,
  ],
  doors: [
    { id: "cocoa-look", x: 31, y: 17.4, label: "Look up at Cocoa House", radius: 2 },
    { id: "door-boutique", x: 52.4, y: 34.8, label: "Dugbe boutique", radius: 1.6 },
  ],
  exits: [dugbeStop.exit, ...roadEnds(62, 41, { to: "agbeni", label: "Walk to Agbeni" }, { to: "sabo", label: "Walk toward Sabo / Adamasingba" })],
  npcs: [
    {
      id: "Bank teller",
      cast: "banker",
      at: { morning: { x: 8, y: 35.2, dir: "S", doing: "heading into the banking hall" }, afternoon: { x: 8, y: 35.2, dir: "S", doing: "on lunch break" } },
      lines: { morning: ["Dugbe is where Ibadan's money sleeps. Every bank has a branch here."], any: ["Good day."] },
    },
    {
      id: "Cocoa House security",
      cast: "vioOfficer",
      at: { morning: { x: 34, y: 17.2, dir: "S", doing: "at the entrance" }, afternoon: { x: 34, y: 17.2, dir: "S", doing: "at the entrance" }, evening: { x: 34, y: 17.2, dir: "S", doing: "closing the gate" } },
      lines: {
        morning: ["Cocoa House was the first skyscraper in West Africa when it opened in 1965. Built with cocoa farmers' money."],
        afternoon: ["Offices only. Unless you have an appointment, admire it from here."],
        any: ["Good day."],
      },
    },
  ],
  spawn: { x: 31, y: 37 },
  arrive: { x: 31, y: 37 },
};

const ringStop = busStop(54, 40, "RING ROAD");
export const RING_ROAD: SceneDef = {
  id: "ring-road",
  name: "Ring Road",
  w: 62,
  h: 48,
  ground: { seed: 3601, grassy: 0.05 },
  roads: [{ x0: 0, x1: 62, y: 40, width: 9, wear: 0.3, seed: 63, markings: 0.8, gutters: true, crossings: [20, 44] }],
  yards: [{ x: 4, y: 15, w: 50, h: 19, surface: "paved" }],
  buildings: [...houseRow(54, 62, 32, "mixed", 3610, ["FILLING STATION SHOP"])],
  fences: [],
  props: [
    { x: 6, y: 3, spec: { kind: "mall", w: 44, d: 12, name: "THE PALMS" } },
    { x: 12, y: 22, spec: { kind: "car", car: "jeep", dir: "S" } },
    { x: 18, y: 22, spec: { kind: "car", car: "corolla", dir: "S" } },
    { x: 24, y: 22, spec: { kind: "car", car: "camry", dir: "S" } },
    { x: 36, y: 22, spec: { kind: "car", car: "micra", dir: "S" } },
    { x: 42, y: 22, spec: { kind: "car", car: "jeep", dir: "S" } },
    { x: 14, y: 30, spec: { kind: "car", car: "corolla", dir: "N" } },
    { x: 44, y: 30, spec: { kind: "car", car: "camry", dir: "N" } },
    { x: 4, y: 34.5, spec: { kind: "palm", height: 8 }, seed: 3620 },
    { x: 52, y: 34.5, spec: { kind: "palm", height: 8 }, seed: 3621 },
    ringStop.prop,
  ],
  doors: [
    { id: "door-boutique", x: 18, y: 15.6, label: "Shops at the Palms", radius: 1.8 },
    { id: "mall-cinema", x: 34, y: 15.6, label: "See a film at the cinema", radius: 1.8 },
  ],
  exits: [ringStop.exit, ...roadEnds(62, 40, { to: "challenge", label: "Drive the Ring Road toward Challenge" }, { to: "aleshinloye", label: "Walk to Aleshinloye" })],
  npcs: [
    {
      id: "Mall security",
      cast: "vioOfficer",
      at: { morning: { x: 30, y: 16.4, dir: "S", doing: "checking bags" }, afternoon: { x: 30, y: 16.4, dir: "S", doing: "checking bags" }, evening: { x: 30, y: 16.4, dir: "S", doing: "checking bags" } },
      lines: { any: ["Open your bag small. Thank you, enjoy your shopping."] },
    },
    {
      id: "Kemi",
      cast: "alowonleGirl",
      at: { afternoon: { x: 26, y: 18, dir: "E", doing: "carrying shopping bags" }, evening: { x: 26, y: 18, dir: "E", doing: "waiting for her ride" } },
      lines: { any: ["The Palms on Saturday is the only place to be seen in Ibadan."] },
    },
  ],
  spawn: { x: 30, y: 36 },
  arrive: { x: 30, y: 36 },
};

const eleyeleStop = busStop(54, 40, "ELEYELE");
export const ELEYELE: SceneDef = {
  id: "eleyele",
  name: "Eleyele",
  w: 62,
  h: 48,
  ground: { seed: 3701, grassy: 0.4 },
  roads: [{ x0: 0, x1: 62, y: 40, width: 6.6, wear: 0.5, seed: 67, markings: 0.5, gutters: true, crossings: [32] }],
  yards: [{ x: 0, y: 0, w: 62, h: 24, surface: "lawn" }],
  buildings: [...houseRow(0, 22, 35, "mixed", 3710, ["FISH & CHIPS SPOT"]), ...houseRow(40, 62, 35, "mixed", 3720, ["FRESH FISH"])],
  fences: [],
  props: [
    { x: 4, y: 1, spec: { kind: "lake", w: 54, h: 19 } },
    { x: 10, y: 22, spec: { kind: "tree", size: 3 }, seed: 3730 },
    { x: 52, y: 23, spec: { kind: "tree", size: 3.2 }, seed: 3731 },
    { x: 26, y: 25, spec: { kind: "stall", goods: "fish" }, seed: 3732 },
    { x: 32, y: 25, spec: { kind: "stall", goods: "fish" }, seed: 3733 },
    { x: 37, y: 22.4, spec: { kind: "bench" } },
    eleyeleStop.prop,
  ],
  doors: [
    { id: "lake-rest", x: 34, y: 21.6, label: "Sit by the reservoir", radius: 1.8 },
    { id: "door-ojaoba", x: 29, y: 25.6, label: "Buy fresh fish", radius: 1.4 },
  ],
  exits: [eleyeleStop.exit, ...roadEnds(62, 40, null, { to: "jericho", label: "Walk to Jericho" })],
  npcs: [
    {
      id: "Fisherman",
      cast: "yamSeller",
      at: { morning: { x: 20, y: 21.4, dir: "N", doing: "mending his net" }, afternoon: { x: 20, y: 21.4, dir: "N", doing: "sorting the catch" } },
      lines: { morning: ["Tilapia and catfish, straight from the dam. The water feeds half of Ibadan."], any: ["Good day."] },
    },
    {
      id: "Fish seller",
      cast: "mamaPut",
      at: { morning: { x: 29, y: 24.1, dir: "S", doing: "scaling fish" }, afternoon: { x: 29, y: 24.1, dir: "S", doing: "frying fish" } },
      lines: { any: ["Fresh this morning. Smoke it or fry it, both sweet."] },
    },
  ],
  spawn: { x: 32, y: 36 },
  arrive: { x: 32, y: 36 },
};

const agodiStop = busStop(54, 40, "AGODI");
export const AGODI: SceneDef = {
  id: "agodi",
  name: "Agodi Gardens",
  w: 62,
  h: 48,
  ground: { seed: 3801, grassy: 0.4 },
  roads: [{ x0: 0, x1: 62, y: 40, width: 7.2, wear: 0.3, seed: 69, markings: 0.7, gutters: true, crossings: [30] }],
  yards: [{ x: 0, y: 0, w: 62, h: 27, surface: "lawn" }],
  buildings: [...houseRow(0, 14, 35, "rich", 3810, ["GOVERNMENT OFFICE"])],
  fences: [
    { x0: -1, x1: 63, y: 27.4, h: 1.8, wall: "#cfc8b8", glassTop: false, seed: 71, gate: { x: 26, w: 8, color: "#2f6b4a", open: true } },
  ],
  props: [
    { x: 30, y: 27.4, spec: { kind: "gatearch", text: "AGODI GARDENS", span: 8, boom: false } },
    { x: 34, y: 3, spec: { kind: "lake", w: 22, h: 10 } },
    { x: 6, y: 8, spec: { kind: "tree", size: 3.4 }, seed: 3830 },
    { x: 16, y: 14, spec: { kind: "tree", size: 3 }, seed: 3831 },
    { x: 26, y: 6, spec: { kind: "palm", height: 9 }, seed: 3832 },
    { x: 58, y: 20, spec: { kind: "tree", size: 3.2 }, seed: 3833 },
    { x: 22, y: 21, spec: { kind: "bench" } },
    { x: 40, y: 21, spec: { kind: "bench" } },
    { x: 24.5, y: 24.5, spec: { kind: "flowers", w: 11 }, seed: 3834 },
    agodiStop.prop,
  ],
  doors: [{ id: "agodi-picnic", x: 31, y: 19.6, label: "Picnic in Agodi Gardens", radius: 2 }],
  exits: [agodiStop.exit, ...roadEnds(62, 40, { to: "mokola", label: "Walk toward Mokola" }, { to: "bodija", label: "Walk toward Bodija" })],
  npcs: [
    {
      id: "Family at Agodi",
      cast: "nursingMother",
      at: { morning: { x: 18, y: 18, dir: "E", doing: "watching the children" }, afternoon: { x: 18, y: 18, dir: "E", doing: "sharing jollof from a cooler" } },
      lines: { any: ["Agodi is where Ibadan brings its children on Sundays. Bring yours one day."] },
    },
    {
      id: "Garden attendant",
      cast: "babaAde",
      at: { morning: { x: 30, y: 25, dir: "S", doing: "collecting gate fees" }, afternoon: { x: 30, y: 25, dir: "S", doing: "collecting gate fees" } },
      lines: { any: ["Gate fee is small. The gardens are big. Don't feed the animals."] },
    },
  ],
  spawn: { x: 30, y: 36 },
  arrive: { x: 30, y: 36 },
};

const sangoStop = busStop(6, 40, "SANGO");
export const SANGO: SceneDef = {
  id: "sango",
  name: "Sango / Poly",
  w: 62,
  h: 48,
  ground: { seed: 3901, grassy: 0.25 },
  roads: [{ x0: 0, x1: 62, y: 40, width: 7.2, wear: 0.6, seed: 73, markings: 0.5, gutters: true, crossings: [30, 50] }],
  yards: [{ x: 0, y: 0, w: 62, h: 26, surface: "lawn" }, { x: 25, y: 10, w: 10, h: 16, surface: "paved" }],
  buildings: [
    { x: 12, y: 1, seed: 3910, spec: { w: 36, d: 8, h: 6.4, roof: "flat", wall: "#ece6d8", wallKind: "plaster", rust: 0, seed: 3910, storeys: 2, sign: { text: "LECTURE THEATRE", bg: "#6b1f2e", fg: "#f3efe4" }, openings: Array.from({ length: 8 }, (_, i) => ({ x: 1.2 + i * 4.4, kind: "louvre" as const, width: 2 })) } },
    ...houseRow(42, 62, 36, "mixed", 3920, ["CYBER CAFE", "PHOTOCOPY · TYPING"]),
  ],
  fences: [
    { x0: -1, x1: 25.4, y: 26.4, h: 2.2, wall: "#e2dccd", glassTop: false, seed: 75 },
    { x0: 34.6, x1: 63, y: 26.4, h: 2.2, wall: "#e2dccd", glassTop: false, seed: 76 },
  ],
  props: [
    { x: 30, y: 26.4, spec: { kind: "gatearch", text: "THE POLYTECHNIC, IBADAN", span: 9.2 } },
    { x: 6, y: 18, spec: { kind: "tree", size: 3.2 }, seed: 3930 },
    { x: 52, y: 17, spec: { kind: "tree", size: 3 }, seed: 3931 },
    { x: 20, y: 31, spec: { kind: "umbrella", colors: ["#d4402c", "#f2c230"], goods: "provisions" }, seed: 3932 },
    sangoStop.prop,
  ],
  doors: [{ id: "exam-hall", x: 30, y: 21.4, label: "Into the Poly: lecture and exam halls", radius: 1.8 }],
  exits: [sangoStop.exit, ...roadEnds(62, 40, { to: "mokola", label: "Walk down Oyo Road to Mokola" }, { to: "ui-gate", label: "Walk up Oyo Road to UI" })],
  npcs: [
    {
      id: "Tobi",
      cast: "uiStudent",
      at: { morning: { x: 27, y: 29, dir: "S", doing: "late for a test" }, afternoon: { x: 46, y: 37.2, dir: "W", doing: "printing a project" }, evening: { x: 33, y: 30, dir: "W", doing: "waiting for a keke" } },
      lines: {
        morning: ["HND is the goal. ND first, then IT, then HND. Long road, but it leads somewhere."],
        afternoon: ["Our project defence is next week. This printer is my enemy."],
        any: ["Hey!"],
      },
    },
  ],
  spawn: { x: 30, y: 36 },
  arrive: { x: 30, y: 36 },
};
