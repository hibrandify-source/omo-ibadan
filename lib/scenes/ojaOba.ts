// Oja'ba: the old king's market below Mapo hill. Rows of zinc-roofed stalls
// with lanes between them; Mama Bisi sells gbegiri and ewedu here by day,
// Iya Alata wholesales pepper, traders pack up when evening comes.

import { PAL } from "@/lib/art/palette";
import type { PropKind, Placed, SceneDef } from "./types";

type Goods = Extract<PropKind, { kind: "stall" }>["goods"];

/** A row of stalls whose fronts sit on y, leaving gaps (by index) for cross-lanes. */
function stallRow(y: number, goods: Goods[], gaps: number[], seed: number): Placed<PropKind>[] {
  const out: Placed<PropKind>[] = [];
  goods.forEach((g, i) => {
    if (gaps.includes(i)) return;
    out.push({ x: 4 + i * 3.1, y, spec: { kind: "stall", goods: g }, seed: seed + i });
  });
  return out;
}

const ROW_A: Goods[] = ["grains", "yam", "yam", "tomato", "onion", "grains", "fabric", "fabric", "pepper", "tomato", "fish", "grains", "onion", "yam", "pepper"];
const ROW_B: Goods[] = ["tomato", "pepper", "onion", "grains", "soup", "fish", "tomato", "grains", "pepper", "onion", "pepper", "fish", "fabric", "grains", "tomato"];
const ROW_C: Goods[] = ["fabric", "provisions", "grains", "onion", "tomato", "pepper", "yam", "provisions", "fish", "grains", "onion", "fabric", "tomato", "provisions", "pepper"];

export const OJA_OBA: SceneDef = {
  id: "oja-oba",
  name: "Oja'ba",
  w: 54,
  h: 40,
  ground: { seed: 501, grassy: 0.04 },
  roads: [{ x0: 0, x1: 54, y: 34, width: 6.6, wear: 0.7, seed: 17, markings: 0.25, gutters: true, crossings: [26.4] }],
  yards: [{ x: 1, y: 7.5, w: 52, h: 22 }],
  buildings: [
    { x: -2, y: 0, seed: 601, spec: { w: 13, d: 5.5, h: 3, roof: "hip", wall: PAL.plaster[1], wallKind: "plaster", rust: 1, seed: 601, openings: [{ x: 1.4, kind: "shutter" }, { x: 5.5, kind: "door", curtain: "#6b2a3a" }, { x: 9, kind: "shutter" }] } },
    { x: 12, y: 0.5, seed: 602, spec: { w: 14, d: 5, h: 3.2, roof: "shed", wall: PAL.plaster[5], wallKind: "plaster", rust: 0.9, seed: 602, sign: { text: "ALHAJA'S PROVISIONS", bg: "#f2c230", fg: "#7a1f14" }, openings: [{ x: 0.8, kind: "shopfront", width: 5.6 }, { x: 7.4, kind: "shopfront", width: 5.6 }] } },
    { x: 27, y: 0, seed: 603, spec: { w: 12, d: 5.5, h: 3, roof: "hip", wall: PAL.plaster[2], wallKind: "plaster", rust: 0.95, seed: 603, notice: "NO URINATING HERE", openings: [{ x: 1.2, kind: "shutter" }, { x: 5, kind: "door" }, { x: 8.8, kind: "shutter" }] } },
    { x: 40, y: 0.5, seed: 604, spec: { w: 15, d: 5, h: 3.1, roof: "gable", wall: PAL.plaster[6], wallKind: "plaster", rust: 0.85, seed: 604, sign: { text: "OLUWASEUN FABRICS", bg: "#2f6fb5", fg: "#f3efe4" }, openings: [{ x: 1, kind: "shopfront", width: 6 }, { x: 8, kind: "shopfront", width: 6 }] } },
  ],
  fences: [],
  props: [
    ...stallRow(10.5, ROW_A, [7], 700),
    ...stallRow(19, ROW_B, [7], 720),
    ...stallRow(27.5, ROW_C, [7], 740),
    { x: 12.5, y: 23.2, spec: { kind: "umbrella", colors: ["#d4402c", "#f2c230"], goods: "tomato" }, seed: 51 },
    { x: 41.5, y: 14.8, spec: { kind: "umbrella", colors: ["#2f6fb5", "#f2efe6"], goods: "onion" }, seed: 52 },
    { x: 50.5, y: 23, spec: { kind: "tree", size: 2.4 }, seed: 53 },
    { x: 3, y: 30, spec: { kind: "pole" } },
    { x: 38, y: 30, spec: { kind: "pole" } },
    { x: 46, y: 30.4, spec: { kind: "signboard", text: "OJA'BA BUS STOP", bg: "#f3efe4", fg: "#1f3d8a", w: 2.8 } },
  ],
  doors: [
    { id: "help-mama-stall", x: 16.4, y: 19.6, label: "Help Mama sell", radius: 1.3 },
    { id: "door-ojaoba", x: 34.8, y: 19.6, label: "Buy stock from Iya Alata", radius: 1.3 },
  ],
  exits: [
    { id: "to-beere", x: 52.8, y: 34, to: "beere", label: "Walk to Beere", radius: 1.8 },
    { id: "to-mapo", x: 1.2, y: 34, to: "mapo", label: "Walk up to Mapo Hall", radius: 1.8 },
    { id: "bus-stop", x: 46, y: 31.6, to: "map", label: "Bus stop: take a micra", radius: 1.6 },
  ],
  npcs: [
    {
      id: "Mama Bisi",
      cast: "mamaBisi",
      at: {
        morning: { x: 16.4, y: 18.1, dir: "S", doing: "selling gbegiri and ewedu" },
        afternoon: { x: 16.4, y: 18.1, dir: "S", doing: "serving the lunch rush" },
      },
      awayNote: "Mama has packed up and gone home to Beere.",
      lines: {
        morning: ["Ọmọ mi! Hold this ladle, customers are coming.", "Two plates for that man. Gbegiri, not too much ewedu."],
        afternoon: ["Lunch rush. Bring more amala from the back.", "Count the money well. Don't give change twice."],
        any: ["Ọmọ mi."],
      },
    },
    {
      id: "Iya Alata",
      cast: "iyaAlata",
      at: {
        morning: { x: 34.8, y: 18.1, dir: "S", doing: "weighing pepper" },
        afternoon: { x: 34.8, y: 18.1, dir: "S", doing: "haggling with a buyer" },
        evening: { x: 34.8, y: 18.1, dir: "S", doing: "packing up" },
      },
      lines: {
        morning: ["Rodo, tatashe, shombo, all fresh from the north this morning.", "Buy a bag now; Bodija buyers pay more in the afternoon."],
        afternoon: ["My price is my price. Go and ask, you will come back."],
        evening: ["I'm packing. Come early tomorrow before the good ones finish."],
        any: ["Ẹ ǹlẹ́ o."],
      },
    },
    {
      id: "Baba Isu",
      cast: "yamSeller",
      at: {
        morning: { x: 7.1, y: 9.6, dir: "S", doing: "stacking yams" },
        afternoon: { x: 7.1, y: 9.6, dir: "S", doing: "fanning himself" },
      },
      lines: {
        morning: ["Abuja yam, big and dry. Pound it, it will draw."],
        afternoon: ["Business is slow today. Everybody is broke till month end."],
        any: ["Good day."],
      },
    },
    {
      id: "Sister Funke",
      cast: "clothSeller",
      at: {
        morning: { x: 38.1, y: 26.6, dir: "S", doing: "folding ankara" },
        afternoon: { x: 38.1, y: 26.6, dir: "S", doing: "showing a bride the new lace" },
      },
      lines: {
        morning: ["This one is Holland wax, original. Feel it.", "Owambe season is coming. Order your aso-ebi early."],
        afternoon: ["This lace is for the big owambe. You won't find it in Gbagi."],
        any: ["Hello dear."],
      },
    },
    {
      id: "Orange seller",
      cast: "marketWoman",
      at: {
        morning: { x: 24.5, y: 22.8, dir: "E", doing: "hawking oranges" },
        afternoon: { x: 30.5, y: 14.2, dir: "W", doing: "hawking oranges" },
      },
      lines: { any: ["Orange! Sweet orange! Five for five hundred!"] },
    },
  ],
  spawn: { x: 27, y: 30.4 },
  arrive: { x: 27, y: 30.4 },
};
