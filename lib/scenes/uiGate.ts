// UI Gate: the University of Ibadan main gate on Oyo Road. Campus behind the
// arch (Trenchard Hall, old trees); students, security and photocopy stands
// at the gate; Agbowo across the road.

import { PAL } from "@/lib/art/palette";
import type { SceneDef } from "./types";

export const UI_GATE: SceneDef = {
  id: "ui-gate",
  name: "UI Gate",
  w: 60,
  h: 46,
  ground: { seed: 1601, grassy: 0.3 },
  roads: [
    // Oyo Road, between the gate and Agbowo
    { x0: 0, x1: 60, y: 30.5, width: 7.2, wear: 0.4, seed: 31, markings: 0.7, gutters: true, crossings: [27, 44] },
  ],
  yards: [
    { x: 2, y: 9, w: 56, h: 15, surface: "lawn" },
    { x: 25.5, y: 9, w: 9, h: 17, surface: "paved" },
  ],
  buildings: [
    {
      x: 14, y: 0.5, seed: 1701,
      spec: {
        w: 32, d: 8, h: 7, roof: "hip", wall: "#ece6d8", wallKind: "plaster", rust: 0.25, seed: 1701, storeys: 2,
        sign: { text: "TRENCHARD HALL", bg: "#1f3d6b", fg: "#f3efe4" },
        openings: [{ x: 2, kind: "louvre", width: 2 }, { x: 6, kind: "louvre", width: 2 }, { x: 10, kind: "louvre", width: 2 }, { x: 14.6, kind: "door", width: 2.8 }, { x: 20, kind: "louvre", width: 2 }, { x: 24, kind: "louvre", width: 2 }, { x: 28, kind: "louvre", width: 2 }],
      },
    },
    // Agbowo across Oyo Road: you see the backs of the shops and their roofs
    { x: 0, y: 37, seed: 1702, spec: { w: 14, d: 6, h: 3.2, roof: "shed", wall: PAL.plaster[5], wallKind: "plaster", rust: 0.9, seed: 1702, openings: [{ x: 2, kind: "window" }, { x: 8, kind: "window" }] } },
    { x: 15, y: 37.5, seed: 1703, spec: { w: 13, d: 5.5, h: 3, roof: "hip", wall: PAL.plaster[2], wallKind: "plaster", rust: 0.95, seed: 1703, openings: [{ x: 2, kind: "shutter" }, { x: 8, kind: "louvre" }] } },
    { x: 31, y: 37, seed: 1704, spec: { w: 15, d: 6, h: 3.2, roof: "shed", wall: PAL.block, wallKind: "block", rust: 0.6, seed: 1704, openings: [{ x: 2, kind: "window" }, { x: 9, kind: "window" }] } },
    { x: 47, y: 37.5, seed: 1705, spec: { w: 13, d: 5.5, h: 3, roof: "gable", wall: PAL.plaster[0], wallKind: "plaster", rust: 0.85, seed: 1705, openings: [{ x: 2, kind: "louvre" }, { x: 8, kind: "shutter" }] } },
  ],
  fences: [
    // the campus wall either side of the gate
    { x0: 0, x1: 25, y: 25.6, h: 2.2, wall: "#e2dccd", glassTop: false, seed: 41 },
    { x0: 35, x1: 60, y: 25.6, h: 2.2, wall: "#e2dccd", glassTop: false, seed: 42 },
  ],
  props: [
    { x: 30, y: 25.6, spec: { kind: "gatearch", text: "UNIVERSITY OF IBADAN", span: 9.2 } },
    { x: 37.2, y: 23.4, spec: { kind: "booth" } },
    { x: 6, y: 16, spec: { kind: "tree", size: 3.2 }, seed: 1801 },
    { x: 15, y: 19, spec: { kind: "tree", size: 2.8 }, seed: 1802 },
    { x: 46, y: 17, spec: { kind: "tree", size: 3.4 }, seed: 1803 },
    { x: 55, y: 20, spec: { kind: "tree", size: 2.6 }, seed: 1804 },
    { x: 22, y: 12, spec: { kind: "palm", height: 9 }, seed: 1805 },
    { x: 38, y: 12, spec: { kind: "palm", height: 9 }, seed: 1806 },
    { x: 12, y: 26.6, spec: { kind: "kiosk", color: "#2f6fb5", text: "PHOTOCOPY · BINDING" }, seed: 1807 },
    { x: 44, y: 26.6, spec: { kind: "kiosk", color: "#2f8a4a", text: "RECHARGE · POS" }, seed: 1808 },
    { x: 50, y: 34.6, spec: { kind: "umbrella", colors: ["#2f6fb5", "#f2efe6"], goods: "provisions" }, seed: 1809 },
    { x: 8, y: 34.6, spec: { kind: "signboard", text: "UI GATE BUS STOP", bg: "#f3efe4", fg: "#1f3d8a", w: 2.8 } },
  ],
  doors: [
    { id: "door-uihall", x: 30, y: 21, label: "Walk in to the exam hall", radius: 1.8 },
  ],
  exits: [
    { id: "to-agbowo", x: 58.8, y: 30.5, to: "agbowo", label: "Walk to Agbowo", radius: 1.8 },
    { id: "to-sango", x: 1.2, y: 30.5, to: "sango", label: "Walk down Oyo Road to Sango", radius: 1.8 },
    { id: "bus-stop", x: 8, y: 33.4, to: "map", label: "Bus stop: take a micra", radius: 1.6 },
  ],
  npcs: [
    {
      id: "Ada",
      cast: "uiStudent",
      at: {
        morning: { x: 27.4, y: 27.6, dir: "S", doing: "rushing to an 8 am lecture" },
        afternoon: { x: 13.5, y: 28.6, dir: "N", doing: "photocopying handouts" },
        evening: { x: 33, y: 27.8, dir: "W", doing: "waiting for a keke to Agbowo" },
      },
      lines: {
        morning: ["8 am lecture and the lecturer is never late. Run!", "Have you registered your courses? Portal closes Friday."],
        afternoon: ["This handout is ₦1,500 to photocopy. Exam is Monday."],
        evening: ["NEPA took light in hall again. I'm reading in the faculty tonight."],
        any: ["Hey!"],
      },
    },
    {
      id: "Gate security",
      cast: "vioOfficer",
      at: {
        morning: { x: 34.6, y: 24.6, dir: "S", doing: "checking IDs" },
        afternoon: { x: 34.6, y: 24.6, dir: "S", doing: "checking IDs" },
        evening: { x: 34.6, y: 24.6, dir: "S", doing: "waving cars in" },
        night: { x: 34.6, y: 24.6, dir: "S", doing: "on night duty" },
      },
      lines: {
        morning: ["ID card, please. No ID, no entry. Rules."],
        evening: ["After ten, only students and staff."],
        any: ["Good day."],
      },
    },
  ],
  spawn: { x: 30, y: 33.4 },
  arrive: { x: 30, y: 33.4 },
};
