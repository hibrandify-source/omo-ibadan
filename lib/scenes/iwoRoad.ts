// Iwo Road motor park: the busiest park in Ibadan. Interstate buses load for
// Lagos, Ife and Abuja under the terminal; koropes and micras queue in rows;
// touts call routes; Iya Sikirat's buka feeds everybody.

import { PAL } from "@/lib/art/palette";
import type { SceneDef } from "./types";

export const IWO_ROAD: SceneDef = {
  id: "iwo-road",
  name: "Iwo Road Park",
  w: 60,
  h: 44,
  ground: { seed: 1101, grassy: 0.02 },
  roads: [{ x0: 0, x1: 60, y: 37.5, width: 7.2, wear: 0.55, seed: 23, markings: 0.6, gutters: true, crossings: [28, 46] }],
  yards: [{ x: 1, y: 9, w: 58, h: 23 }],
  buildings: [
    { x: 0, y: 2.5, seed: 1201, spec: { w: 12, d: 6, h: 3.2, roof: "shed", wall: PAL.plaster[6], wallKind: "plaster", rust: 0.9, seed: 1201, sign: { text: "SPARE PARTS & TYRES", bg: "#f2c230", fg: "#1d1b19" }, openings: [{ x: 0.6, kind: "shopfront", width: 5 }, { x: 6.4, kind: "shopfront", width: 5 }] } },
    {
      x: 14, y: 1.5, seed: 1202,
      spec: {
        w: 26, d: 7.5, h: 6, roof: "hip", wall: PAL.plaster[3], wallKind: "plaster", rust: 0.55, seed: 1202, storeys: 2,
        sign: { text: "IWO ROAD MOTOR PARK · INTERSTATE", bg: "#1f6b4a", fg: "#f3efe4" },
        openings: [
          { x: 1, kind: "shopfront", width: 4 }, { x: 5.6, kind: "shopfront", width: 4 }, { x: 12.8, kind: "door", width: 1.6 },
          { x: 16.4, kind: "shopfront", width: 4 }, { x: 21, kind: "shopfront", width: 4 },
        ],
      },
    },
    { x: 42, y: 3, seed: 1203, spec: { w: 18, d: 5.5, h: 3, roof: "shed", wall: PAL.plaster[1], wallKind: "plaster", rust: 0.85, seed: 1203, sign: { text: "IYA SIKIRAT BUKA · AMALA", bg: "#f2c230", fg: "#7a1f14" }, openings: [{ x: 0.8, kind: "shopfront", width: 5.2, inside: "food" }, { x: 6.6, kind: "shopfront", width: 5.2, inside: "food" }, { x: 12.4, kind: "shopfront", width: 5 }] } },
  ],
  fences: [],
  props: [
    // interstate buses loading under the terminal
    { x: 18, y: 15, spec: { kind: "car", car: "interstate", dir: "S" } },
    { x: 22.5, y: 15, spec: { kind: "car", car: "interstate", dir: "S" } },
    { x: 31.5, y: 15, spec: { kind: "car", car: "interstate", dir: "S" } },
    { x: 36, y: 15, spec: { kind: "car", car: "interstate", dir: "S" } },
    // korope rank
    { x: 6, y: 24, spec: { kind: "car", car: "korope", dir: "S" } },
    { x: 10, y: 24, spec: { kind: "car", car: "korope", dir: "S" } },
    { x: 14, y: 24, spec: { kind: "car", car: "korope", dir: "S" } },
    { x: 18, y: 24, spec: { kind: "car", car: "korope", dir: "S" } },
    // micra rank
    { x: 37, y: 24, spec: { kind: "car", car: "micra", dir: "S" } },
    { x: 41, y: 24, spec: { kind: "car", car: "micra", dir: "S" } },
    { x: 45, y: 24, spec: { kind: "car", car: "micra", dir: "S" } },
    { x: 49, y: 24, spec: { kind: "car", car: "micra", dir: "S" } },
    { x: 53, y: 24, spec: { kind: "car", car: "micra", dir: "S" } },
    { x: 4, y: 15.5, spec: { kind: "umbrella", colors: ["#2f6fb5", "#f2efe6"], goods: "provisions" }, seed: 61 },
    { x: 55, y: 15, spec: { kind: "umbrella", colors: ["#d4402c", "#f2c230"], goods: "pepper" }, seed: 62 },
    { x: 10, y: 33.4, spec: { kind: "pole" } },
    { x: 40, y: 33.4, spec: { kind: "pole" } },
    { x: 54, y: 33.4, spec: { kind: "signboard", text: "IWO ROAD BUS STOP", bg: "#f3efe4", fg: "#1f3d8a", w: 3 } },
    { x: 27, y: 30, spec: { kind: "tree", size: 2.6 }, seed: 63 },
  ],
  doors: [
    { id: "door-terminal", x: 27.6, y: 9.8, label: "Enter the interstate terminal", radius: 1.6 },
    { id: "micra-rank", x: 45, y: 27.2, label: "Join the micra rank (Micra Rush)", radius: 2 },
  ],
  exits: [
    { id: "bus-stop", x: 54, y: 35, to: "map", label: "Bus stop: take a micra", radius: 1.8 },
    { id: "to-agodi", x: 1.2, y: 37.5, to: "agodi", label: "Walk toward Agodi", radius: 1.8 },
  ],
  npcs: [
    {
      id: "Iwo Tout",
      cast: "tout",
      at: {
        morning: { x: 26.5, y: 20.5, dir: "S", doing: "calling 'Ojoo! Ojoo! Mokola!'" },
        afternoon: { x: 26.5, y: 20.5, dir: "S", doing: "collecting park levy" },
        evening: { x: 26.5, y: 20.5, dir: "S", doing: "loading the last bus" },
        night: { x: 26.5, y: 20.5, dir: "S", doing: "sleeping on a bus seat" },
      },
      lines: {
        morning: ["Lagos! Lagos! One chance remain! Enter!", "Oga, you dey go Ife? Front seat dey."],
        afternoon: ["Every driver pays the levy. Even you, when you join the rank.", "Ojoo, Mokola, Challenge, enter quick quick!"],
        evening: ["Last bus to Lagos. After this one, tomorrow."],
        night: ["Park don close. Come back at five."],
        any: ["Where you dey go?"],
      },
    },
    {
      id: "Sani",
      cast: "mechanic",
      at: {
        morning: { x: 34.6, y: 24.5, dir: "E", doing: "wiping his micra" },
        afternoon: { x: 34.6, y: 24.5, dir: "E", doing: "waiting for a full load" },
        evening: { x: 34.6, y: 24.5, dir: "E", doing: "counting the day's money" },
      },
      lines: {
        morning: ["You want to drive? Bring your licence. Or at least your courage.", "Mokola to Iwo Road is my road. Twenty years."],
        afternoon: ["Never leave the park half empty. Fuel no be water."],
        evening: ["Today was small. Tomorrow will be better, insha Allah."],
        any: ["Ẹ ǹlẹ́."],
      },
    },
    {
      id: "Iya Sikirat",
      cast: "mamaPut",
      at: {
        morning: { x: 47, y: 9.4, dir: "S", doing: "dishing amala for drivers" },
        afternoon: { x: 47, y: 9.4, dir: "S", doing: "serving the lunch rush" },
        evening: { x: 47, y: 9.4, dir: "S", doing: "washing pots" },
      },
      lines: {
        morning: ["Drivers eat first, they have long road. Then you."],
        afternoon: ["Amala, ewedu, assorted meat. Sit down."],
        any: ["Customer!"],
      },
    },
  ],
  spawn: { x: 30, y: 31.5 },
  arrive: { x: 30, y: 31.5 },
};
