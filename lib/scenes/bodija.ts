// Bodija Market: Ibadan's big food market on the Secretariat–UI road.
// Mama Put's amala buka by the road, two rows of foodstuff stalls, shops
// behind, micras and a korope pulled up at the stop.

import { PAL } from "@/lib/art/palette";
import type { PropKind, Placed, SceneDef } from "./types";

type Goods = Extract<PropKind, { kind: "stall" }>["goods"];

function stallRow(y: number, x0: number, goods: Goods[], gaps: number[], seed: number): Placed<PropKind>[] {
  const out: Placed<PropKind>[] = [];
  goods.forEach((g, i) => {
    if (gaps.includes(i)) return;
    out.push({ x: x0 + i * 3.1, y, spec: { kind: "stall", goods: g }, seed: seed + i });
  });
  return out;
}

export const BODIJA: SceneDef = {
  id: "bodija",
  name: "Bodija Market",
  w: 56,
  h: 42,
  ground: { seed: 801, grassy: 0.05 },
  roads: [{ x0: 0, x1: 56, y: 36, width: 7.2, wear: 0.5, seed: 19, markings: 0.6, gutters: true, crossings: [7.2, 27.6, 46] }],
  yards: [{ x: 1, y: 8, w: 54, h: 23 }],
  buildings: [
    { x: 0, y: 0.5, seed: 901, spec: { w: 16, d: 5.5, h: 3.3, roof: "shed", wall: PAL.plaster[0], wallKind: "plaster", rust: 0.8, seed: 901, sign: { text: "BODIJA PROVISIONS & DRINKS", bg: "#f2c230", fg: "#7a1f14" }, openings: [{ x: 0.8, kind: "shopfront", width: 6.6 }, { x: 8.6, kind: "shopfront", width: 6.6 }] } },
    { x: 17, y: 0, seed: 902, spec: { w: 12, d: 6, h: 3.4, roof: "hip", wall: PAL.plaster[3], wallKind: "plaster", rust: 0.6, seed: 902, sign: { text: "GOOD HEALTH PHARMACY", bg: "#2f8a4a", fg: "#f3efe4" }, openings: [{ x: 1.4, kind: "shopfront", width: 4.2 }, { x: 6.6, kind: "shopfront", width: 4.2 }] } },
    { x: 30, y: 0.5, seed: 903, spec: { w: 26, d: 5.5, h: 3.2, roof: "shed", wall: PAL.plaster[5], wallKind: "plaster", rust: 0.9, seed: 903, sign: { text: "MARKET ASSOCIATION · BODIJA", bg: "#f3efe4", fg: "#7a1f14" }, openings: [{ x: 1, kind: "shopfront", width: 5.6 }, { x: 7.4, kind: "shopfront", width: 5.6 }, { x: 13.8, kind: "shopfront", width: 5.6 }, { x: 20.2, kind: "shopfront", width: 5.2 }] } },
    // Mama Put's buka by the road
    { x: 1.5, y: 25.5, seed: 910, spec: { w: 11, d: 4.5, h: 3, roof: "shed", wall: PAL.plaster[1], wallKind: "plaster", rust: 0.85, seed: 910, sign: { text: "MAMA PUT · AMALA & GBEGIRI", bg: "#f2c230", fg: "#7a1f14" }, openings: [{ x: 0.7, kind: "shopfront", width: 4.4, inside: "food" }, { x: 5.9, kind: "shopfront", width: 4.4, inside: "food" }] } },
  ],
  fences: [],
  props: [
    ...stallRow(13.5, 4, ["grains", "grains", "yam", "yam", "tomato", "onion", "pepper", "fish", "grains", "tomato", "onion", "pepper", "yam", "fish", "grains", "tomato"], [8], 1000),
    ...stallRow(22, 16, ["tomato", "pepper", "pepper", "onion", "grains", "fish", "tomato", "onion", "pepper", "yam", "grains", "tomato"], [4], 1020),
    { x: 4, y: 31.2, spec: { kind: "bench" } },
    { x: 9.6, y: 31.2, spec: { kind: "bench" } },
    { x: 20, y: 33.9, spec: { kind: "car", car: "micra", dir: "E" } },
    { x: 26, y: 33.9, spec: { kind: "car", car: "micra", dir: "E" } },
    { x: 39, y: 33.8, spec: { kind: "car", car: "korope", dir: "W" } },
    { x: 52, y: 26.5, spec: { kind: "tree", size: 2.8 }, seed: 81 },
    { x: 14.5, y: 31.8, spec: { kind: "pole" } },
    { x: 44, y: 31.8, spec: { kind: "pole" } },
    { x: 48.5, y: 32, spec: { kind: "signboard", text: "BODIJA MARKET STOP", bg: "#f3efe4", fg: "#1f3d8a", w: 3.2 } },
    { x: 31, y: 27, spec: { kind: "umbrella", colors: ["#2f6fb5", "#f2efe6"], goods: "provisions" }, seed: 82 },
  ],
  doors: [
    { id: "door-mamaput", x: 7, y: 30.6, label: "Mama Put's Stall", radius: 1.6 },
    { id: "door-bodija", x: 31.5, y: 22.6, label: "Sell to the Bodija buyers", radius: 1.3 },
  ],
  exits: [
    { id: "to-old-bodija", x: 1.2, y: 36, to: "old-bodija", label: "Walk to Old Bodija", radius: 1.8 },
    { id: "to-agbowo", x: 54.8, y: 36, to: "agbowo", label: "Walk to Agbowo", radius: 1.8 },
    { id: "bus-stop", x: 48.5, y: 33.4, to: "map", label: "Bus stop: take a micra", radius: 1.6 },
  ],
  npcs: [
    {
      id: "Mama Put",
      cast: "mamaPut",
      at: {
        morning: { x: 5.2, y: 30.7, dir: "S", doing: "dishing amala" },
        afternoon: { x: 5.2, y: 30.7, dir: "S", doing: "serving the lunch crowd" },
        evening: { x: 5.2, y: 30.7, dir: "S", doing: "scraping the last pot" },
      },
      lines: {
        morning: ["Early customer! Amala is hot, gbegiri is ready.", "You look hungry. Sit down, I'll put extra meat."],
        afternoon: ["Lunch time is war here. Hold your plate well.", "Your Mama's gbegiri is good, but mine is better. Don't tell her."],
        evening: ["Only small ewedu remains. Come early tomorrow."],
        any: ["Customer!"],
      },
    },
    {
      id: "Alhaji Wholesale",
      cast: "yamSeller",
      at: {
        morning: { x: 31.5, y: 21.1, dir: "S", doing: "buying in bulk" },
        afternoon: { x: 31.5, y: 21.1, dir: "S", doing: "counting bags" },
      },
      lines: {
        morning: ["Bring your pepper here. Bodija price beats Oja'ba price.", "I buy by the bag, not by the cup."],
        afternoon: ["Restaurants in UI are buying today. Bring more."],
        any: ["Salaam."],
      },
    },
    {
      id: "Iya Elewa",
      cast: "iyaAlata",
      at: {
        morning: { x: 7.1, y: 12.6, dir: "S", doing: "measuring beans" },
        afternoon: { x: 7.1, y: 12.6, dir: "S", doing: "picking stones from beans" },
      },
      lines: {
        morning: ["Oloyin beans, honey beans. Cook it with dodo, you will thank me."],
        any: ["Ẹ ǹlẹ́ o."],
      },
    },
    {
      id: "Bread seller",
      cast: "breadSeller",
      at: {
        morning: { x: 22, y: 27.4, dir: "E", doing: "hawking Agege bread" },
        afternoon: { x: 36, y: 17.6, dir: "W", doing: "hawking Agege bread" },
      },
      lines: { any: ["Agege bread! Hot bread! Big loaf two thousand!"] },
    },
  ],
  spawn: { x: 28, y: 31.2 },
  arrive: { x: 28, y: 31.2 },
};
