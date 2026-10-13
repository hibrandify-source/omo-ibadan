// Beere: Mama Bisi's compound and the street outside. Home of the
// Omo Iya Lobe life. A face-me-I-face-you block around a swept yard, a fence
// and gate onto the Beere road, neighbours packed in on both sides.

import { PAL } from "@/lib/art/palette";
import type { SceneDef } from "./types";

export const BEERE: SceneDef = {
  id: "beere",
  name: "Beere",
  w: 56,
  h: 40,
  ground: { seed: 101, grassy: 0.12 },
  roads: [{ x0: 0, x1: 56, y: 33, width: 6.6, wear: 0.85, seed: 11, markings: 0.3, gutters: true, crossings: [24.6, 40.6] }],
  yards: [{ x: 11, y: 16, w: 33, h: 10 }],
  buildings: [
    // back row: the old city is packed roof to roof
    { x: -3, y: 0, seed: 201, spec: { w: 14, d: 7, h: 3, roof: "hip", wall: PAL.plaster[2], wallKind: "plaster", rust: 1, seed: 201, openings: [{ x: 1.5, kind: "shutter" }, { x: 6.5, kind: "door", curtain: "#6b2a3a" }, { x: 10, kind: "louvre" }] } },
    { x: 12.5, y: 0.5, seed: 202, spec: { w: 9, d: 6, h: 3, roof: "gable", wall: PAL.plaster[4], wallKind: "plaster", rust: 0.9, seed: 202, openings: [{ x: 1, kind: "louvre" }, { x: 5.5, kind: "door" }] } },
    { x: 41, y: 0, seed: 203, spec: { w: 16, d: 7, h: 3, roof: "hip", wall: PAL.plaster[6], wallKind: "plaster", rust: 0.95, seed: 203, openings: [{ x: 1.2, kind: "shutter" }, { x: 5, kind: "door", curtain: "#2f5a3a" }, { x: 9, kind: "louvre" }, { x: 13, kind: "shutter" }] } },
    // Mama's compound: rooms facing the yard
    {
      x: 13, y: 8.5, seed: 210,
      spec: {
        w: 24, d: 7.5, h: 3.1, roof: "hip", wall: PAL.plaster[1], wallKind: "plaster", rust: 0.95, seed: 210,
        notice: "THIS HOUSE IS NOT FOR SALE",
        openings: [
          { x: 1.2, kind: "shutter" }, { x: 4.6, kind: "door", curtain: "#b8433a" }, { x: 6.6, kind: "louvre", width: 1.1 },
          { x: 9.6, kind: "door", curtain: "#2a5a8a" }, { x: 11.6, kind: "shutter" }, { x: 14.6, kind: "door", curtain: "#6b4a8a" },
          { x: 16.6, kind: "louvre", width: 1.1 }, { x: 19.6, kind: "door", curtain: "#3f6b3a" }, { x: 21.8, kind: "shutter", width: 1.0 },
        ],
      },
    },
    // shared kitchen/bathroom shed
    { x: 38, y: 13, seed: 211, spec: { w: 5, d: 3.5, h: 2.5, roof: "shed", rise: 0.3, wall: PAL.block, wallKind: "block", rust: 1, seed: 211, openings: [{ x: 0.8, kind: "door", width: 0.8 }, { x: 2.6, kind: "door", width: 0.8 }] } },
    // neighbours either side of the compound
    { x: 0, y: 10, seed: 220, spec: { w: 9.5, d: 7, h: 3, roof: "gable", wall: PAL.plaster[5], wallKind: "plaster", rust: 0.85, seed: 220, openings: [{ x: 1, kind: "louvre" }, { x: 4.2, kind: "door" }, { x: 6.8, kind: "louvre" }] } },
    {
      x: 45.5, y: 10, seed: 221,
      spec: { w: 10.5, d: 6.5, h: 3.2, roof: "shed", wall: PAL.plaster[0], wallKind: "plaster", rust: 0.8, seed: 221,
        sign: { text: "IYA BASIRA PROVISIONS", bg: "#f2c230", fg: "#7a1f14" },
        openings: [{ x: 0.6, kind: "shopfront", width: 4.2 }, { x: 5.6, kind: "shopfront", width: 4.2 }] },
    },
  ],
  fences: [
    { x0: 10, x1: 44.5, y: 26.2, h: 1.8, wall: PAL.plaster[3], glassTop: false, seed: 31, gate: { x: 24.2, w: 3.4, color: "#3d5868", open: true } },
  ],
  props: [
    { x: 20.5, y: 20, spec: { kind: "pots" } },
    { x: 30.5, y: 18.4, spec: { kind: "drum", color: "#2f6fb5" } },
    { x: 31.6, y: 18.6, spec: { kind: "drum", color: "#c9322a" } },
    { x: 26, y: 23.5, spec: { kind: "chickens", n: 4 } },
    { x: 41, y: 22.5, spec: { kind: "tree", size: 2.6 }, seed: 7 },
    { x: 34, y: 23.6, spec: { kind: "bench" } },
    { x: 14.5, y: 24.8, spec: { kind: "generator", running: false } },
    { x: 39.5, y: 27.6, spec: { kind: "kiosk", color: "#2f6fb5", text: "POS · RECHARGE" }, seed: 41 },
    { x: 7, y: 28.6, spec: { kind: "umbrella", colors: ["#d4402c", "#f2c230"], goods: "pepper" }, seed: 42 },
    { x: 4, y: 28.3, spec: { kind: "pole" } },
    { x: 33, y: 28.3, spec: { kind: "pole" } },
    { x: 51, y: 28.8, spec: { kind: "signboard", text: "BEERE BUS STOP", bg: "#f3efe4", fg: "#1f3d8a", w: 2.8 } },
  ],
  doors: [
    { id: "mama-room", x: 18.1, y: 16.9, label: "Enter your room", radius: 1.4 },
    { id: "mama-pot", x: 20.5, y: 21.2, label: "Help Mama at the pot", radius: 1.6 },
    { id: "shop", x: 48.5, y: 17.6, label: "Iya Basira's shop", radius: 1.6 },
  ],
  exits: [
    { id: "to-mapo", x: 1.2, y: 33, to: "mapo", label: "Walk to Mapo Hall", radius: 1.8 },
    { id: "bus-stop", x: 51, y: 30.2, to: "map", label: "Bus stop: take a micra", radius: 1.8 },
  ],
  npcs: [
    {
      id: "Mama Bisi",
      cast: "mamaBisi",
      at: {
        evening: { x: 21.6, y: 21.4, dir: "W", doing: "stirring the gbegiri" },
      },
      awayNote: "Mama is at her stall in Oja'ba until evening.",
      lines: {
        evening: ["Ọmọ mi, come and taste this gbegiri.", "Did you eat today? Don't lie to me.", "Tunde must pass this WAEC o."],
        any: ["Ọmọ mi."],
      },
    },
    {
      id: "Tunde",
      cast: "tunde",
      at: {
        afternoon: { x: 28.5, y: 21.5, dir: "W", doing: "kicking a ball" },
        evening: { x: 16.5, y: 19.6, dir: "S", doing: "reading for WAEC" },
      },
      awayNote: "Tunde is at school.",
      lines: {
        afternoon: ["Bros/sis, one match? Just one.", "Mama said I should sweep. I'm resting first."],
        evening: ["This chemistry no easy at all.", "If I pass WAEC I'm going to UI. Watch."],
        any: ["Hey."],
      },
    },
    {
      id: "Baba Ade",
      cast: "babaAde",
      at: {
        morning: { x: 34.4, y: 24.4, dir: "S", doing: "watching the gate" },
        afternoon: { x: 34.4, y: 24.4, dir: "S", doing: "listening to the radio" },
        evening: { x: 34.4, y: 24.4, dir: "S", doing: "watching the gate" },
      },
      awayNote: "Baba Ade has gone in for the night.",
      lines: {
        morning: ["Good morning. Greet me well, I'm your landlord.", "This rent balance, I'm counting days."],
        afternoon: ["Fresh FM says rain is coming. Pack your clothes."],
        evening: ["Lock the gate after nine. Thieves don't sleep."],
        any: ["Ẹ ǹlẹ́ o."],
      },
    },
  ],
  spawn: { x: 18.1, y: 17.8 },
  arrive: { x: 25.9, y: 28.6 },
};
