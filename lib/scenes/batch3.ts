// Ojoo (the expressway mouth), Moniya (the edge of the city), Akobo (new
// estates), Jericho (quiet GRA and the specialist hospital), Oje (old market).

import type { SceneDef } from "./types";
import { busStop, houseRow, roadEnds } from "./build";

const ojooStop = busStop(54, 40, "OJOO");
export const OJOO: SceneDef = {
  id: "ojoo",
  name: "Ojoo",
  w: 62,
  h: 48,
  ground: { seed: 5101, grassy: 0.08 },
  roads: [{ x0: 0, x1: 62, y: 40, width: 10, wear: 0.5, seed: 91, markings: 0.8, gutters: true, crossings: [30] }],
  yards: [{ x: 12, y: 12, w: 38, h: 22, surface: "dirt" }],
  buildings: [
    ...houseRow(0, 12, 34, "mixed", 5110, ["BUKA"]),
    ...houseRow(50, 62, 34, "mixed", 5120, ["SPARE PARTS"]),
    { x: 14, y: 4, seed: 5130, spec: { w: 34, d: 6, h: 3.4, roof: "shed", wall: "#e6dcc6", wallKind: "block", rust: 0.75, seed: 5130, storeys: 1, sign: { text: "OJOO PARK · OYO · OGBOMOSO · ILORIN", bg: "#2f8a4a", fg: "#f3efe4" }, openings: Array.from({ length: 5 }, (_, i) => ({ x: 1.2 + i * 6.6, kind: "shopfront" as const, width: 4.6 })) } },
  ],
  fences: [],
  props: [
    { x: 18, y: 18, spec: { kind: "car", car: "interstate", dir: "S" } },
    { x: 25, y: 18, spec: { kind: "car", car: "interstate", dir: "S" } },
    { x: 37, y: 18, spec: { kind: "car", car: "korope", dir: "S" } },
    { x: 44, y: 18, spec: { kind: "car", car: "korope", dir: "S" } },
    { x: 16, y: 30, spec: { kind: "stall", goods: "grains" }, seed: 5140 },
    { x: 44, y: 30, spec: { kind: "umbrella", colors: ["#2f8a4a", "#f2efe6"], goods: "provisions" }, seed: 5141 },
    { x: 22, y: 31, spec: { kind: "barrow", load: "sacks" } },
    ojooStop.prop,
  ],
  doors: [
    { id: "door-terminal", x: 31, y: 10.6, label: "Ojoo park: buses up north", radius: 2 },
    { id: "alabaru", x: 25, y: 29, label: "Load grain sacks onto the buses", radius: 1.6 },
  ],
  exits: [ojooStop.exit, ...roadEnds(62, 40, { to: "ui-gate", label: "Walk back toward UI" }, { to: "moniya", label: "Up the Oyo road to Moniya" })],
  npcs: [
    {
      id: "Ojoo loader",
      cast: "tout",
      at: { morning: { x: 31, y: 26, dir: "S", doing: "calling Ogbomoso passengers" }, afternoon: { x: 31, y: 26, dir: "S", doing: "tying loads on the roof" }, evening: { x: 31, y: 26, dir: "S", doing: "loading the night bus" } },
      lines: {
        morning: ["Oyo, Ogbomoso, Ilorin, Kaduna, Kano! The whole north starts from Ojoo."],
        any: ["The expressway begins here. Ibadan ends, Nigeria begins."],
      },
    },
    {
      id: "Grain seller",
      cast: "marketWoman",
      at: { morning: { x: 16, y: 29.1, dir: "S", doing: "measuring beans" }, afternoon: { x: 16, y: 29.1, dir: "S", doing: "bargaining over garri" } },
      lines: { any: ["Beans and maize come down from the north on those buses. Cheaper here than Bodija."] },
    },
  ],
  spawn: { x: 31, y: 36 },
  arrive: { x: 31, y: 36 },
};

const moniyaStop = busStop(54, 40, "MONIYA");
export const MONIYA: SceneDef = {
  id: "moniya",
  name: "Moniya",
  w: 62,
  h: 48,
  ground: { seed: 5201, grassy: 0.6 },
  roads: [{ x0: 0, x1: 62, y: 40, width: 7, wear: 0.7, seed: 93, markings: 0.3, gutters: false, crossings: [] }],
  yards: [{ x: 0, y: 0, w: 62, h: 16, surface: "lawn" }, { x: 18, y: 20, w: 26, h: 14, surface: "dirt" }],
  buildings: [
    ...houseRow(0, 16, 35, "old", 5210, ["PROVISIONS"]),
    ...houseRow(46, 62, 35, "old", 5220, []),
    { x: 46, y: 18, seed: 5230, spec: { w: 10, d: 6, h: 2.6, roof: "flat", wall: "#b9b2a4", wallKind: "block", rust: 0, seed: 5230, storeys: 1, notice: "THIS LAND IS NOT FOR SALE", openings: [{ x: 1.2, kind: "window", width: 1.4 }, { x: 4.4, kind: "door" }, { x: 7.4, kind: "window", width: 1.4 }] } },
  ],
  fences: [],
  props: [
    { x: 6, y: 4, spec: { kind: "palm", height: 9 }, seed: 5240 },
    { x: 14, y: 8, spec: { kind: "palm", height: 8 }, seed: 5241 },
    { x: 30, y: 6, spec: { kind: "tree", size: 3.6 }, seed: 5242 },
    { x: 48, y: 9, spec: { kind: "palm", height: 9.5 }, seed: 5243 },
    { x: 22, y: 25, spec: { kind: "stall", goods: "yam" }, seed: 5244 },
    { x: 28, y: 25, spec: { kind: "stall", goods: "yam" }, seed: 5245 },
    { x: 36, y: 28, spec: { kind: "chickens", n: 5 } },
    { x: 40, y: 24, spec: { kind: "barrow", load: "sacks" } },
    moniyaStop.prop,
  ],
  doors: [
    { id: "farm-help", x: 30, y: 15.2, label: "Help on the farm for a day", radius: 2 },
    { id: "door-ojaoba", x: 25, y: 25.6, label: "Buy yams at farm price", radius: 1.4 },
  ],
  exits: [moniyaStop.exit, ...roadEnds(62, 40, { to: "ojoo", label: "Back down the Oyo road to Ojoo" }, null)],
  npcs: [
    {
      id: "Farmer",
      cast: "yamSeller",
      at: { morning: { x: 26, y: 15.4, dir: "S", doing: "sharpening his cutlass" }, afternoon: { x: 25, y: 24.1, dir: "S", doing: "selling yams from his farm" } },
      lines: {
        morning: ["Town is growing into my farm. Every year another estate. But yam still needs hands."],
        any: ["Moniya yam is the sweetest in Ibadan. Ask anybody."],
      },
    },
    {
      id: "Land agent",
      cast: "chief",
      at: { afternoon: { x: 44, y: 25.4, dir: "W", doing: "showing a plot" }, evening: { x: 44, y: 25.4, dir: "W", doing: "on the phone" } },
      lines: { any: ["Buy land in Moniya now, before the expressway brings everybody. In ten years, you'll thank me."] },
    },
  ],
  spawn: { x: 31, y: 36 },
  arrive: { x: 31, y: 36 },
};

const akoboStop = busStop(54, 40, "AKOBO");
export const AKOBO: SceneDef = {
  id: "akobo",
  name: "Akobo",
  w: 62,
  h: 48,
  ground: { seed: 5301, grassy: 0.25 },
  roads: [{ x0: 0, x1: 62, y: 40, width: 6.4, wear: 0.4, seed: 95, markings: 0.3, gutters: true, crossings: [] }],
  yards: [{ x: 4, y: 3, w: 54, h: 24, surface: "paved" }],
  buildings: [
    ...houseRow(4, 58, 15, "rich", 5310, []),
    ...houseRow(0, 22, 35, "mixed", 5320, ["PROVISIONS", "POS · TRANSFERS"]),
    ...houseRow(40, 62, 35, "mixed", 5330, ["CHURCH"]),
  ],
  fences: [
    { x0: -1, x1: 63, y: 27, h: 2.2, wall: "#e8e2d4", glassTop: true, seed: 97, gate: { x: 27, w: 7, color: "#2f3a4a", open: true } },
  ],
  props: [
    { x: 30.5, y: 27, spec: { kind: "gatearch", text: "AKOBO ESTATE", span: 7 } },
    { x: 10, y: 20, spec: { kind: "car", car: "corolla", dir: "S" } },
    { x: 48, y: 20, spec: { kind: "car", car: "jeep", dir: "S" } },
    { x: 18, y: 22, spec: { kind: "flowers", w: 6 }, seed: 5340 },
    { x: 38, y: 22, spec: { kind: "flowers", w: 6 }, seed: 5341 },
    { x: 30, y: 33, spec: { kind: "umbrella", colors: ["#2f6fb5", "#f2efe6"], goods: "provisions" }, seed: 5342 },
    akoboStop.prop,
  ],
  doors: [{ id: "akobo-estate", x: 30.5, y: 25, label: "Ask the estate gateman about flats", radius: 1.8 }],
  exits: [akoboStop.exit, ...roadEnds(62, 40, { to: "bodija", label: "Walk toward Bodija" }, { to: "iwo-road", label: "Walk to Iwo Road" })],
  npcs: [
    {
      id: "Estate gateman",
      cast: "vioOfficer",
      at: { morning: { x: 33, y: 25.5, dir: "S", doing: "logging visitors" }, afternoon: { x: 33, y: 25.5, dir: "S", doing: "logging visitors" }, evening: { x: 33, y: 25.5, dir: "S", doing: "locking the gate at ten" } },
      lines: { any: ["Akobo is for people who want quiet. Light is better here, and the road is tarred all the way in."] },
    },
    {
      id: "Young banker",
      cast: "banker",
      at: { morning: { x: 25, y: 31, dir: "E", doing: "waiting for an Uber" }, evening: { x: 25, y: 31, dir: "W", doing: "back from work" } },
      lines: { any: ["Bodija rent was too much, so I moved to Akobo. Traffic to Ring Road is my new hobby."] },
    },
  ],
  spawn: { x: 30, y: 36 },
  arrive: { x: 30, y: 36 },
};

const jerichoStop = busStop(54, 40, "JERICHO");
export const JERICHO: SceneDef = {
  id: "jericho",
  name: "Jericho",
  w: 62,
  h: 48,
  ground: { seed: 5401, grassy: 0.5 },
  roads: [{ x0: 0, x1: 62, y: 40, width: 7, wear: 0.3, seed: 99, markings: 0.6, gutters: true, crossings: [30] }],
  yards: [{ x: 0, y: 0, w: 62, h: 28, surface: "lawn" }, { x: 24, y: 14, w: 14, h: 14, surface: "paved" }],
  buildings: [
    { x: 12, y: 3, seed: 5410, spec: { w: 38, d: 9, h: 6.4, roof: "hip", wall: "#f1ede4", wallKind: "plaster", rust: 0.2, seed: 5410, storeys: 2, sign: { text: "JERICHO SPECIALIST HOSPITAL", bg: "#2f6fb5", fg: "#f3efe4" }, openings: [...Array.from({ length: 4 }, (_, i) => ({ x: 1.4 + i * 4, kind: "louvre" as const, width: 2 })), { x: 17.6, kind: "door" as const }, ...Array.from({ length: 4 }, (_, i) => ({ x: 21.6 + i * 4, kind: "louvre" as const, width: 2 }))] } },
    ...houseRow(0, 22, 36, "rich", 5420, []),
    ...houseRow(42, 62, 36, "rich", 5430, ["PHARMACY"]),
  ],
  fences: [
    { x0: -1, x1: 24.4, y: 28, h: 1.6, wall: "#d8d2c4", glassTop: false, seed: 101 },
    { x0: 37.6, x1: 63, y: 28, h: 1.6, wall: "#d8d2c4", glassTop: false, seed: 102 },
  ],
  props: [
    { x: 4, y: 16, spec: { kind: "tree", size: 4 }, seed: 5440 },
    { x: 56, y: 18, spec: { kind: "tree", size: 3.8 }, seed: 5441 },
    { x: 16, y: 22, spec: { kind: "hedge", w: 7 } },
    { x: 40, y: 22, spec: { kind: "hedge", w: 7 } },
    { x: 28, y: 18, spec: { kind: "car", car: "camry", dir: "S" } },
    { x: 20, y: 24, spec: { kind: "bench" } },
    jerichoStop.prop,
  ],
  doors: [{ id: "clinic", x: 30.4, y: 12.6, label: "See a doctor at the hospital", radius: 1.8 }],
  exits: [jerichoStop.exit, ...roadEnds(62, 40, { to: "eleyele", label: "Walk to Eleyele" }, { to: "dugbe", label: "Walk to Dugbe" })],
  npcs: [
    {
      id: "Nurse",
      cast: "schoolGirl",
      at: { morning: { x: 34, y: 14, dir: "S", doing: "calling the next patient" }, afternoon: { x: 34, y: 14, dir: "S", doing: "on a short break" } },
      lines: { any: ["Bring your card. If you don't have one, registration is at the window. Don't eat street food before a blood test o."] },
    },
    {
      id: "Retired professor",
      cast: "babaAde",
      at: { morning: { x: 21, y: 25.6, dir: "S", doing: "reading the newspaper" }, evening: { x: 21, y: 25.6, dir: "S", doing: "taking his evening walk" } },
      lines: { any: ["Jericho was built for colonial officers. Now it's us retirees and the hospital. Quiet is the luxury."] },
    },
  ],
  spawn: { x: 31, y: 36 },
  arrive: { x: 31, y: 36 },
};

const ojeStop = busStop(54, 40, "OJE");
export const OJE: SceneDef = {
  id: "oje",
  name: "Oje Market",
  w: 62,
  h: 48,
  ground: { seed: 5501, grassy: 0.02 },
  roads: [{ x0: 0, x1: 62, y: 40, width: 6, wear: 0.7, seed: 103, markings: 0.2, gutters: true, crossings: [] }],
  yards: [{ x: 6, y: 16, w: 50, h: 18, surface: "dirt" }],
  buildings: [
    ...houseRow(0, 62, 14, "old", 5510, ["ASO-OKE WEAVERS", "ADIRE"]),
    ...houseRow(0, 20, 35, "old", 5520, ["HERBS & NATIVE MEDICINE"]),
    ...houseRow(42, 62, 35, "old", 5530, []),
  ],
  fences: [],
  props: [
    { x: 12, y: 22, spec: { kind: "stall", goods: "fabric" }, seed: 5540 },
    { x: 18, y: 22, spec: { kind: "stall", goods: "fabric" }, seed: 5541 },
    { x: 24, y: 22, spec: { kind: "stall", goods: "grains" }, seed: 5542 },
    { x: 38, y: 22, spec: { kind: "stall", goods: "fabric" }, seed: 5543 },
    { x: 44, y: 22, spec: { kind: "stall", goods: "pepper" }, seed: 5544 },
    { x: 30, y: 31, spec: { kind: "umbrella", colors: ["#6b4a8a", "#f2c230"], goods: "onion" }, seed: 5545 },
    { x: 50, y: 30, spec: { kind: "chickens", n: 3 } },
    ojeStop.prop,
  ],
  doors: [
    { id: "aso-oke", x: 15, y: 14.6, label: "Watch the aso-oke weavers", radius: 1.8 },
    { id: "door-ojaoba", x: 18, y: 22.6, label: "Trade at Oje", radius: 1.4 },
  ],
  exits: [ojeStop.exit, ...roadEnds(62, 40, { to: "beere", label: "Walk to Beere" }, { to: "iwo-road", label: "Walk toward Iwo Road" })],
  npcs: [
    {
      id: "Aso-oke weaver",
      cast: "babaAde",
      at: { morning: { x: 20, y: 15.4, dir: "S", doing: "at the loom" }, afternoon: { x: 20, y: 15.4, dir: "S", doing: "at the loom" } },
      lines: { any: ["My father wove here, and his father. Every owambe in Ibadan wears cloth that passed through Oje."] },
    },
    {
      id: "Adire seller",
      cast: "clothSeller",
      at: { morning: { x: 15, y: 21.1, dir: "S", doing: "spreading adire" }, afternoon: { x: 15, y: 21.1, dir: "S", doing: "folding cloth" } },
      lines: { any: ["Indigo dye, done by hand. Not the factory print they sell in Gbagi. Feel it."] },
    },
  ],
  spawn: { x: 31, y: 36 },
  arrive: { x: 31, y: 36 },
};
