// Three more markets: Gbagi (wholesale city off the Ife road), Aleshinloye
// (big modern market off Ring Road), Agbeni (old market lane near Dugbe).

import { PAL } from "@/lib/art/palette";
import type { BuildingSpec } from "@/lib/art/buildings";
import type { Placed, PropKind, SceneDef } from "./types";

type Goods = Extract<PropKind, { kind: "stall" }>["goods"];

function stallRow(y: number, x0: number, goods: Goods[], gaps: number[], seed: number): Placed<PropKind>[] {
  return goods.flatMap((g, i) => (gaps.includes(i) ? [] : [{ x: x0 + i * 3.1, y, spec: { kind: "stall" as const, goods: g }, seed: seed + i }]));
}

/** A block of lock-up shops, each with its own painted sign. */
function shopBlock(x: number, y: number, signs: string[], seed: number, h = 3.2): Placed<BuildingSpec> {
  const w = signs.length * 5.2 + 0.6;
  return {
    x, y, seed,
    spec: {
      w, d: 6, h, roof: "shed", wall: PAL.plaster[seed % 7], wallKind: "plaster", rust: 0.75, seed,
      sign: { text: signs.join("  ·  "), bg: "#f2c230", fg: "#1d1b19" },
      openings: signs.map((_, i) => ({ x: 0.5 + i * 5.2, kind: "shopfront" as const, width: 4.6 })),
    },
  };
}

export const GBAGI: SceneDef = {
  id: "gbagi",
  name: "Gbagi Market",
  w: 62,
  h: 46,
  ground: { seed: 2501, grassy: 0.03 },
  roads: [{ x0: 0, x1: 62, y: 40, width: 7.2, wear: 0.6, seed: 43, markings: 0.5, gutters: true, crossings: [10, 31, 52] }],
  yards: [{ x: 0, y: 8, w: 62, h: 28, surface: "paved" }],
  buildings: [
    shopBlock(0, 2, ["ADEOLA TEXTILES", "LACE & GEORGE"], 2601),
    shopBlock(12, 2, ["WHOLESALE PROVISIONS", "CARTONS"], 2602),
    shopBlock(24, 2.5, ["BEVERAGES", "NOODLES & PASTA"], 2603),
    shopBlock(36, 2, ["SPRAY & SEQUINS", "ASO-OKE"], 2604),
    shopBlock(48, 2, ["PLASTICS", "KITCHENWARE"], 2605),
    shopBlock(2, 17, ["EMEKA & SONS", "BABY WEAR"], 2606),
    shopBlock(14, 17.5, ["RICE · BEANS", "GARRI"], 2607),
    shopBlock(36, 17, ["SHOES & BAGS", "ANKARA"], 2608),
    shopBlock(48, 17.5, ["DRINKS DEPOT", "SUGAR & SALT"], 2609),
  ],
  fences: [],
  props: [
    { x: 30, y: 31, spec: { kind: "car", car: "korope", dir: "E" } },
    { x: 44, y: 31.2, spec: { kind: "car", car: "interstate", dir: "W" } },
    { x: 12, y: 13.4, spec: { kind: "barrow", load: "sacks" } },
    { x: 33, y: 28.2, spec: { kind: "barrow", load: "cartons" } },
    { x: 56, y: 28, spec: { kind: "barrow", load: "sacks" } },
    { x: 6, y: 30, spec: { kind: "umbrella", colors: ["#2f6fb5", "#f2efe6"], goods: "provisions" }, seed: 2701 },
    { x: 54, y: 36.4, spec: { kind: "signboard", text: "GBAGI BUS STOP", bg: "#f3efe4", fg: "#1f3d8a", w: 2.6 } },
    { x: 20, y: 36.2, spec: { kind: "pole" } },
  ],
  doors: [
    { id: "door-ojaoba", x: 17.4, y: 24.2, label: "Buy wholesale stock", radius: 1.6 },
    { id: "alabaru", x: 34.5, y: 29.2, label: "Carry loads as alabaru", radius: 1.8 },
  ],
  exits: [
    { id: "to-iwo", x: 1.2, y: 40, to: "iwo-road", label: "Walk toward Iwo Road", radius: 1.8 },
    { id: "bus-stop", x: 54, y: 37.6, to: "map", label: "Bus stop: take a micra", radius: 1.6 },
  ],
  npcs: [
    {
      id: "Alhaja Textile",
      cast: "owambeAunty",
      at: {
        morning: { x: 4, y: 9, dir: "S", doing: "unrolling lace for a buyer" },
        afternoon: { x: 4, y: 9, dir: "S", doing: "counting bales" },
      },
      lines: {
        morning: ["Swiss lace, Austrian lace, George. Owambe is coming, buy in bulk."],
        any: ["Ẹ ǹlẹ́ o."],
      },
    },
    {
      id: "Oga Emeka",
      cast: "yamSeller",
      at: {
        morning: { x: 5, y: 24, dir: "S", doing: "checking a delivery" },
        afternoon: { x: 5, y: 24, dir: "S", doing: "on two phones at once" },
        evening: { x: 5, y: 24, dir: "S", doing: "locking up" },
      },
      lines: {
        morning: ["Carton price is the same everywhere. Service is what I sell."],
        afternoon: ["Take my card. When you open your own shop, buy from me."],
        any: ["My friend!"],
      },
    },
    {
      id: "Baba Alabaru",
      cast: "porter",
      at: {
        morning: { x: 31.5, y: 27.6, dir: "E", doing: "loading a korope" },
        afternoon: { x: 31.5, y: 27.6, dir: "E", doing: "resting on his barrow" },
      },
      lines: {
        morning: ["Each load is money. Strong back, small talk."],
        afternoon: ["You want work? Push this to the bus stop, I'll share the pay."],
        any: ["Ẹ kú iṣẹ́."],
      },
    },
  ],
  spawn: { x: 31, y: 36 },
  arrive: { x: 31, y: 36 },
};

export const ALESHINLOYE: SceneDef = {
  id: "aleshinloye",
  name: "Aleshinloye Market",
  w: 58,
  h: 46,
  ground: { seed: 2801, grassy: 0.03 },
  roads: [{ x0: 0, x1: 58, y: 40, width: 7.2, wear: 0.4, seed: 47, markings: 0.7, gutters: true, crossings: [14, 40] }],
  yards: [{ x: 0, y: 9, w: 58, h: 27, surface: "paved" }],
  buildings: [
    {
      x: 2, y: 1, seed: 2901,
      spec: {
        w: 38, d: 8, h: 6.4, roof: "flat", wall: "#e9e3d6", wallKind: "plaster", rust: 0, seed: 2901, storeys: 2,
        sign: { text: "ALESHINLOYE MARKET", bg: "#2f6fb5", fg: "#f3efe4" },
        openings: Array.from({ length: 7 }, (_, i) => ({ x: 0.8 + i * 5.3, kind: "shopfront" as const, width: 4.6 })),
      },
    },
    shopBlock(42, 3, ["COLD ROOM", "FROZEN FISH"], 2902, 3.4),
  ],
  fences: [],
  props: [
    ...stallRow(20, 6, ["tomato", "pepper", "onion", "yam", "grains", "fish", "tomato", "pepper", "grains", "onion", "provisions", "fish", "tomato", "yam", "pepper"], [7], 3000),
    { x: 28, y: 30.6, spec: { kind: "kiosk", color: "#2f8a4a", text: "PHONES · ACCESSORIES" }, seed: 3101 },
    { x: 8, y: 31, spec: { kind: "car", car: "korope", dir: "E" } },
    { x: 50, y: 30.4, spec: { kind: "umbrella", colors: ["#d4402c", "#f2c230"], goods: "tomato" }, seed: 3102 },
    { x: 46, y: 36.4, spec: { kind: "signboard", text: "ALESHINLOYE BUS STOP", bg: "#f3efe4", fg: "#1f3d8a", w: 3.2 } },
  ],
  doors: [
    { id: "door-ojaoba", x: 21.5, y: 20.6, label: "Buy foodstuff in bulk", radius: 1.4 },
    { id: "cold-room", x: 47.4, y: 9.8, label: "Work a shift at the cold room", radius: 1.6 },
  ],
  exits: [
    { id: "to-ring-road", x: 56.8, y: 40, to: "ring-road", label: "Walk to Ring Road", radius: 1.8 },
    { id: "to-jericho", x: 1.2, y: 40, to: "jericho", label: "Walk to Jericho", radius: 1.8 },
    { id: "bus-stop", x: 46, y: 37.6, to: "map", label: "Bus stop: take a micra", radius: 1.6 },
  ],
  npcs: [
    {
      id: "Madam Cold Room",
      cast: "mamaPut",
      at: {
        morning: { x: 45, y: 9.8, dir: "S", doing: "weighing frozen fish" },
        afternoon: { x: 45, y: 9.8, dir: "S", doing: "arguing with NEPA on the phone" },
        evening: { x: 45, y: 9.8, dir: "S", doing: "fuelling the generator" },
      },
      lines: {
        morning: ["Titus, kote, chicken, turkey. Everything frozen solid, no wahala."],
        afternoon: ["If light no come by four, I go on the big gen. Diesel is killing me."],
        evening: ["I need a strong hand to carry cartons. You want work?"],
        any: ["Customer!"],
      },
    },
    {
      id: "Phone guy",
      cast: "uiStudent",
      at: {
        morning: { x: 30, y: 33.2, dir: "S", doing: "fixing a cracked screen" },
        afternoon: { x: 30, y: 33.2, dir: "S", doing: "flashing a phone" },
      },
      lines: { any: ["Screen, battery, charging port. Come back in one hour."] },
    },
  ],
  spawn: { x: 29, y: 36 },
  arrive: { x: 29, y: 36 },
};

export const AGBENI: SceneDef = {
  id: "agbeni",
  name: "Agbeni Market",
  w: 54,
  h: 42,
  ground: { seed: 3201, grassy: 0.02 },
  roads: [{ x0: 0, x1: 54, y: 36.5, width: 6, wear: 0.8, seed: 53, markings: 0.15, gutters: true, crossings: [24] }],
  yards: [{ x: 0, y: 7, w: 54, h: 25 }],
  buildings: [
    { x: -1, y: 0.5, seed: 3301, spec: { w: 13, d: 6, h: 3, roof: "hip", wall: PAL.plaster[2], wallKind: "plaster", rust: 1, seed: 3301, openings: [{ x: 1.2, kind: "shutter" }, { x: 5.4, kind: "door", curtain: "#7a2a35" }, { x: 9.4, kind: "shutter" }] } },
    shopBlock(13, 1, ["ENAMEL & PLASTICS", "MATS"], 3302, 3),
    { x: 25, y: 0.5, seed: 3303, spec: { w: 14, d: 6, h: 3, roof: "gable", wall: PAL.plaster[1], wallKind: "plaster", rust: 1, seed: 3303, openings: [{ x: 1.2, kind: "shutter" }, { x: 6.2, kind: "door", curtain: "#2f5a8a" }, { x: 10.6, kind: "shutter" }] } },
    shopBlock(40, 1, ["AGBENI PROVISIONS", "BEADS"], 3304, 3),
  ],
  fences: [],
  props: [
    ...stallRow(15, 4, ["provisions", "grains", "pepper", "tomato", "fabric", "onion", "fish", "yam", "grains", "provisions", "pepper", "tomato", "fish", "onion", "grains"], [6], 3400),
    ...stallRow(25, 4, ["fabric", "provisions", "grains", "pepper", "onion", "tomato", "yam", "grains", "fish", "provisions", "fabric", "pepper", "onion", "tomato", "grains"], [6], 3420),
    { x: 50, y: 32.2, spec: { kind: "pole" } },
  ],
  doors: [
    { id: "door-ojaoba", x: 13.3, y: 15.6, label: "Buy foodstuff at Agbeni prices", radius: 1.3 },
  ],
  exits: [
    { id: "to-dugbe", x: 1.2, y: 36.5, to: "dugbe", label: "Walk to Dugbe", radius: 1.8 },
    { id: "to-oja-oba", x: 52.8, y: 36.5, to: "oja-oba", label: "Walk to Oja'ba", radius: 1.8 },
  ],
  npcs: [
    {
      id: "Iya Agbeni",
      cast: "iyaAlata",
      at: {
        morning: { x: 10.2, y: 14.1, dir: "S", doing: "selling pepper by the cup" },
        afternoon: { x: 10.2, y: 14.1, dir: "S", doing: "selling pepper by the cup" },
        evening: { x: 10.2, y: 14.1, dir: "S", doing: "packing up" },
      },
      lines: {
        morning: ["This market was here before your grandfather. Agbeni prices are honest prices."],
        afternoon: ["Ogunpa flood of 1980 took half of this market. We rebuilt. We always rebuild."],
        any: ["Ẹ ǹlẹ́ o."],
      },
    },
    {
      id: "Mat seller",
      cast: "clothSeller",
      at: { morning: { x: 23, y: 20, dir: "E", doing: "hawking raffia mats" }, afternoon: { x: 33, y: 20, dir: "W", doing: "hawking raffia mats" } },
      lines: { any: ["Ẹní! Raffia mat, cool to sleep on, cheap!"] },
    },
  ],
  spawn: { x: 24, y: 32 },
  arrive: { x: 24, y: 32 },
};
