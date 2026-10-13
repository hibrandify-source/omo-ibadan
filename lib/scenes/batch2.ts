// Mokola (the roundabout under Premier Hotel hill), Samonda (student lodges),
// Challenge (the junction and motor park), Molete, Agbowo (opposite UI).

import type { SceneDef } from "./types";
import { busStop, houseRow, roadEnds } from "./build";

const mokolaStop = busStop(54, 40, "MOKOLA");
export const MOKOLA: SceneDef = {
  id: "mokola",
  name: "Mokola",
  w: 62,
  h: 48,
  ground: { seed: 4101, grassy: 0.15 },
  roads: [{ x0: 0, x1: 62, y: 40, width: 8, wear: 0.5, seed: 81, markings: 0.6, gutters: true, crossings: [24] }],
  yards: [{ x: 18, y: 0, w: 26, h: 14, surface: "lawn" }],
  buildings: [
    ...houseRow(0, 18, 35, "mixed", 4110, ["PHARMACY", "BUKA"]),
    ...houseRow(44, 62, 35, "mixed", 4120, ["SUPERMARKET"]),
  ],
  fences: [],
  props: [
    { x: 24, y: 0, spec: { kind: "tower", w: 14, d: 8, floors: 10, name: "PREMIER HOTEL" } },
    { x: 19, y: 12, spec: { kind: "tree", size: 3 }, seed: 4130 },
    { x: 43, y: 12, spec: { kind: "tree", size: 3.2 }, seed: 4131 },
    { x: 22, y: 26, spec: { kind: "stall", goods: "tomato" }, seed: 4132 },
    { x: 28, y: 26, spec: { kind: "stall", goods: "yam" }, seed: 4133 },
    { x: 34, y: 26, spec: { kind: "stall", goods: "provisions" }, seed: 4134 },
    { x: 40, y: 31, spec: { kind: "umbrella", colors: ["#2f8a4a", "#f2efe6"], goods: "pepper" }, seed: 4135 },
    { x: 34, y: 37.4, spec: { kind: "car", car: "micra", dir: "W" } },
    mokolaStop.prop,
  ],
  doors: [
    { id: "premier-view", x: 31, y: 15.6, label: "Look up at Premier Hotel hill", radius: 2 },
    { id: "door-ojaoba", x: 28, y: 26.6, label: "Mokola market stalls", radius: 1.4 },
  ],
  exits: [mokolaStop.exit, ...roadEnds(62, 40, { to: "dugbe", label: "Walk down to Dugbe" }, { to: "sango", label: "Walk up Oyo Road to Sango" })],
  npcs: [
    {
      id: "Mokola trader",
      cast: "marketWoman",
      at: { morning: { x: 25, y: 25.1, dir: "S", doing: "arranging tomatoes" }, afternoon: { x: 25, y: 25.1, dir: "S", doing: "calling customers" } },
      lines: { any: ["Mokola market is small but it never sleeps. Tomato, yam, everything you need for the pot."] },
    },
    {
      id: "Okada at Mokola",
      cast: "okadaMan",
      at: { morning: { x: 46, y: 37.6, dir: "W", doing: "waiting for passengers" }, evening: { x: 46, y: 37.6, dir: "W", doing: "counting the day's money" } },
      lines: { any: ["Premier Hotel up that hill has seen presidents. Me, I only see the roundabout traffic."] },
    },
  ],
  spawn: { x: 30, y: 36 },
  arrive: { x: 30, y: 36 },
};

const samondaStop = busStop(6, 40, "SAMONDA");
export const SAMONDA: SceneDef = {
  id: "samonda",
  name: "Samonda",
  w: 62,
  h: 48,
  ground: { seed: 4201, grassy: 0.3 },
  roads: [{ x0: 0, x1: 62, y: 40, width: 6.6, wear: 0.6, seed: 83, markings: 0.4, gutters: true, crossings: [30] }],
  yards: [{ x: 14, y: 16, w: 34, h: 12, surface: "dirt" }],
  buildings: [
    ...houseRow(0, 30, 15, "mixed", 4210, []),
    ...houseRow(32, 62, 15, "mixed", 4215, ["LESSON CENTRE"]),
    ...houseRow(0, 22, 35, "mixed", 4220, ["CYBER CAFE", "SHAWARMA"]),
    ...houseRow(40, 62, 35, "mixed", 4230, ["LAUNDRY"]),
  ],
  fences: [],
  props: [
    { x: 16, y: 20, spec: { kind: "tank" } },
    { x: 46, y: 20, spec: { kind: "generator", running: true } },
    { x: 24, y: 23, spec: { kind: "drum", color: "#2f6fb5" } },
    { x: 28, y: 33, spec: { kind: "umbrella", colors: ["#f2c230", "#2f6fb5"], goods: "provisions" }, seed: 4240 },
    { x: 34, y: 22, spec: { kind: "tree", size: 2.8 }, seed: 4241 },
    samondaStop.prop,
  ],
  doors: [{ id: "lesson-tutor", x: 47, y: 15.6, label: "Teach a lesson at the lesson centre", radius: 1.6 }],
  exits: [samondaStop.exit, ...roadEnds(62, 40, { to: "sango", label: "Walk to Sango" }, { to: "ui-gate", label: "Walk to UI gate" })],
  npcs: [
    {
      id: "Final-year student",
      cast: "uiStudent",
      at: { morning: { x: 30, y: 21, dir: "S", doing: "fetching water" }, afternoon: { x: 18, y: 36.6, dir: "S", doing: "printing a seminar paper" }, evening: { x: 30, y: 21, dir: "S", doing: "reading under the bulb" } },
      lines: {
        morning: ["No water on campus again, so I moved here. Samonda rent is cheaper than hostel wahala."],
        evening: ["NEPA took light. Generator is running on the landlord's mercy."],
        any: ["How far?"],
      },
    },
    {
      id: "Lesson teacher",
      cast: "banker",
      at: { afternoon: { x: 47, y: 17.2, dir: "S", doing: "waiting for the pupils" }, evening: { x: 47, y: 17.2, dir: "S", doing: "marking scripts" } },
      lines: { any: ["Parents pay well for JAMB lessons. If your English and maths are sharp, come and teach."] },
    },
  ],
  spawn: { x: 30, y: 36 },
  arrive: { x: 30, y: 36 },
};

const challengeStop = busStop(54, 40, "CHALLENGE");
export const CHALLENGE: SceneDef = {
  id: "challenge",
  name: "Challenge",
  w: 62,
  h: 48,
  ground: { seed: 4301, grassy: 0.04 },
  roads: [{ x0: 0, x1: 62, y: 40, width: 9, wear: 0.6, seed: 85, markings: 0.7, gutters: true, crossings: [18, 44] }],
  yards: [{ x: 14, y: 12, w: 34, h: 22, surface: "paved" }],
  buildings: [
    ...houseRow(0, 14, 34, "mixed", 4310, ["SPARE PARTS"]),
    ...houseRow(48, 62, 34, "mixed", 4320, ["BUKA"]),
    { x: 16, y: 4, seed: 4330, spec: { w: 30, d: 6, h: 3.4, roof: "shed", wall: "#e8dfcc", wallKind: "block", rust: 0.7, seed: 4330, storeys: 1, sign: { text: "CHALLENGE MOTOR PARK", bg: "#f2c230", fg: "#1d1b19" }, openings: Array.from({ length: 5 }, (_, i) => ({ x: 1 + i * 6, kind: "shopfront" as const, width: 4.4 })) } },
  ],
  fences: [],
  props: [
    { x: 20, y: 18, spec: { kind: "car", car: "korope", dir: "S" } },
    { x: 26, y: 18, spec: { kind: "car", car: "korope", dir: "S" } },
    { x: 36, y: 18, spec: { kind: "car", car: "interstate", dir: "S" } },
    { x: 42, y: 18, spec: { kind: "car", car: "micra", dir: "S" } },
    { x: 18, y: 31, spec: { kind: "kiosk", color: "#d4402c", text: "TICKETS" } },
    { x: 44, y: 31, spec: { kind: "umbrella", colors: ["#d4402c", "#f2efe6"], goods: "provisions" }, seed: 4340 },
    { x: 26, y: 37, spec: { kind: "car", car: "micra", dir: "E" } },
    challengeStop.prop,
  ],
  doors: [{ id: "micra-rank", x: 31, y: 28, label: "Drive a micra from the Challenge rank", radius: 2 }],
  exits: [challengeStop.exit, ...roadEnds(62, 40, { to: "molete", label: "Walk toward Molete" }, { to: "ring-road", label: "Drive the Ring Road toward the Palms" })],
  npcs: [
    {
      id: "Agbero",
      cast: "tout",
      at: { morning: { x: 31, y: 26, dir: "S", doing: "shouting destinations" }, afternoon: { x: 31, y: 26, dir: "S", doing: "collecting levies" }, evening: { x: 31, y: 26, dir: "S", doing: "loading the last bus" } },
      lines: {
        morning: ["Ijebu! Ijebu! Lagos one chance! Challenge is where Ibadan meets the south."],
        any: ["You go enter or you dey look? Move, make others pass."],
      },
    },
    {
      id: "Spare parts dealer",
      cast: "mechanic",
      at: { morning: { x: 7, y: 35.4, dir: "S", doing: "opening the shop" }, afternoon: { x: 7, y: 35.4, dir: "S", doing: "haggling over a brake pad" } },
      lines: { any: ["Tokunbo parts, original. If your micra breaks down, you know where to find me."] },
    },
  ],
  spawn: { x: 31, y: 36 },
  arrive: { x: 31, y: 36 },
};

const moleteStop = busStop(54, 40, "MOLETE");
export const MOLETE: SceneDef = {
  id: "molete",
  name: "Molete",
  w: 62,
  h: 48,
  ground: { seed: 4401, grassy: 0.06 },
  roads: [{ x0: 0, x1: 62, y: 40, width: 7.6, wear: 0.6, seed: 87, markings: 0.5, gutters: true, crossings: [30] }],
  yards: [{ x: 20, y: 18, w: 22, h: 16, surface: "dirt" }],
  buildings: [
    ...houseRow(0, 20, 34, "old", 4410, ["CEMENT · IRON RODS"]),
    ...houseRow(42, 62, 34, "old", 4420, ["ROOFING SHEETS"]),
    ...houseRow(0, 62, 14, "old", 4430, ["TILES & SANITARY"]),
  ],
  fences: [],
  props: [
    { x: 24, y: 24, spec: { kind: "barrow", load: "sacks" } },
    { x: 34, y: 22, spec: { kind: "barrow", load: "cartons" } },
    { x: 28, y: 30, spec: { kind: "car", car: "korope", dir: "E" } },
    { x: 38, y: 30, spec: { kind: "umbrella", colors: ["#2f6fb5", "#f2c230"], goods: "provisions" }, seed: 4440 },
    { x: 21, y: 20, spec: { kind: "pole" } },
    moleteStop.prop,
  ],
  doors: [{ id: "alabaru", x: 29, y: 25, label: "Load cement bags for the dealers", radius: 1.8 }],
  exits: [moleteStop.exit, ...roadEnds(62, 40, { to: "mapo", label: "Walk up toward Oke-Ado and Mapo" }, { to: "challenge", label: "Walk to Challenge" })],
  npcs: [
    {
      id: "Cement dealer",
      cast: "chief",
      at: { morning: { x: 10, y: 35.4, dir: "S", doing: "counting bags" }, afternoon: { x: 10, y: 35.4, dir: "S", doing: "on the phone with a contractor" } },
      lines: { any: ["Everybody building house in Ibadan passes through Molete. Cement price no dey come down."] },
    },
    {
      id: "Loader",
      cast: "porter",
      at: { morning: { x: 26, y: 26, dir: "E", doing: "carrying a bag of cement" }, afternoon: { x: 26, y: 26, dir: "E", doing: "resting on the sacks" } },
      lines: { any: ["Fifty kilos per bag. Carry ten and your back go tell you story."] },
    },
  ],
  spawn: { x: 30, y: 36 },
  arrive: { x: 30, y: 36 },
};

const agbowoStop = busStop(54, 40, "AGBOWO");
export const AGBOWO: SceneDef = {
  id: "agbowo",
  name: "Agbowo",
  w: 62,
  h: 48,
  ground: { seed: 4501, grassy: 0.1 },
  roads: [{ x0: 0, x1: 62, y: 40, width: 8, wear: 0.5, seed: 89, markings: 0.6, gutters: true, crossings: [20, 42] }],
  yards: [{ x: 4, y: 14, w: 54, h: 6, surface: "paved" }],
  buildings: [
    ...houseRow(0, 62, 14, "mixed", 4510, ["AGBOWO SHOPPING COMPLEX", "PRINTING · BINDING", "PHONE REPAIRS", "BOOKSHOP"]),
    ...houseRow(0, 24, 35, "mixed", 4520, ["BUKA", "CYBER CAFE"]),
    ...houseRow(38, 62, 35, "mixed", 4530, ["HOSTEL AGENT"]),
  ],
  fences: [],
  props: [
    { x: 28, y: 24, spec: { kind: "umbrella", colors: ["#d4402c", "#f2c230"], goods: "provisions" }, seed: 4540 },
    { x: 34, y: 28, spec: { kind: "suya" } },
    { x: 26, y: 31, spec: { kind: "kiosk", color: "#2f6fb5", text: "RECHARGE CARD" } },
    { x: 46, y: 37.4, spec: { kind: "car", car: "corolla", dir: "W" } },
    agbowoStop.prop,
  ],
  doors: [
    { id: "print-shop", x: 22, y: 14.6, label: "Work a shift at the printing shop", radius: 1.6 },
    { id: "door-mamaput", x: 8, y: 35.6, label: "Buka: eat amala", radius: 1.6 },
    { id: "suya", x: 34, y: 29.6, label: "Buy suya", radius: 1.4 },
  ],
  exits: [agbowoStop.exit, ...roadEnds(62, 40, { to: "ui-gate", label: "Walk to UI gate" }, { to: "bodija", label: "Walk to Bodija" })],
  npcs: [
    {
      id: "Printer boy",
      cast: "uiStudent",
      at: { morning: { x: 24, y: 16.2, dir: "S", doing: "binding projects" }, afternoon: { x: 24, y: 16.2, dir: "S", doing: "fixing the photocopier" } },
      lines: { any: ["Every UI final-year passes through Agbowo to bind their project. Sometimes we need extra hands."] },
    },
    {
      id: "Hostel agent",
      cast: "tout",
      at: { afternoon: { x: 40, y: 36, dir: "S", doing: "showing a room" }, evening: { x: 40, y: 36, dir: "S", doing: "on the phone" } },
      lines: { any: ["Self-contain, water dey, light dey. Agent fee is separate o."] },
    },
  ],
  spawn: { x: 30, y: 36 },
  arrive: { x: 30, y: 36 },
};
