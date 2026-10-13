// Old Bodija: Daddy's house, home of the Alowonle life. A wide 1950s-estate
// plot behind a high glass-topped fence: two-storey house, boys' quarters,
// paved driveway with the family jeep, big generator, gateman at the post.
// Outside, a quiet estate road with neighbours behind their own walls.

import { PAL } from "@/lib/art/palette";
import type { SceneDef } from "./types";

export const OLD_BODIJA: SceneDef = {
  id: "old-bodija",
  name: "Old Bodija",
  w: 60,
  h: 46,
  ground: { seed: 301, grassy: 0.3 },
  roads: [{ x0: 0, x1: 60, y: 37.5, width: 7.2, wear: 0.25, seed: 13, markings: 0.75, gutters: true, crossings: [24.6, 25.8] }],
  yards: [
    { x: 6, y: 18, w: 29, h: 12, surface: "paved" },
    { x: 35, y: 16, w: 19, h: 14, surface: "lawn" },
  ],
  buildings: [
    // neighbours' roofs behind the back wall
    { x: -2, y: 0, seed: 401, spec: { w: 15, d: 6, h: 3.2, roof: "hip", wall: PAL.plaster[3], wallKind: "plaster", rust: 0.5, seed: 401, openings: [{ x: 2, kind: "louvre" }, { x: 9, kind: "louvre" }] } },
    { x: 46, y: 0, seed: 402, spec: { w: 15, d: 6, h: 3.2, roof: "hip", wall: PAL.plaster[0], wallKind: "plaster", rust: 0.4, seed: 402, openings: [{ x: 2, kind: "louvre" }, { x: 9, kind: "louvre" }] } },
    // Daddy's house
    {
      x: 14, y: 7, seed: 410,
      spec: {
        w: 18, d: 11, h: 6.2, roof: "hip", wall: PAL.plaster[3], wallKind: "plaster", rust: 0.3, seed: 410, storeys: 2, dish: true,
        openings: [
          { x: 1.2, kind: "louvre", width: 1.6 }, { x: 4.4, kind: "louvre", width: 1.6 }, { x: 7.6, kind: "door", width: 1.3 },
          { x: 10.2, kind: "louvre", width: 1.6 }, { x: 13.2, kind: "louvre", width: 1.6 }, { x: 15.9, kind: "louvre", width: 1.4 },
        ],
      },
    },
    // boys' quarters for the house help and the gateman
    { x: 38, y: 9.5, seed: 411, spec: { w: 11, d: 5, h: 2.8, roof: "shed", rise: 0.35, wall: PAL.plaster[6], wallKind: "plaster", rust: 0.7, seed: 411, openings: [{ x: 1, kind: "door", width: 0.85, curtain: "#2f5a8a" }, { x: 3.2, kind: "louvre", width: 1 }, { x: 6, kind: "door", width: 0.85, curtain: "#7a2a35" }, { x: 8.4, kind: "louvre", width: 1 }] } },
  ],
  fences: [
    // the compound wall: high, glass on top, wide gate for the car
    { x0: 3, x1: 57, y: 30.6, h: 2.6, wall: PAL.plaster[0], glassTop: true, seed: 33, gate: { x: 24, w: 4.4, color: "#1f2622", open: true } },
    // the neighbours' wall across the road
    { x0: 0, x1: 60, y: 44.5, h: 2.4, wall: PAL.plaster[4], glassTop: true, seed: 34, gate: { x: 40, w: 3.6, color: "#3d5868" } },
  ],
  props: [
    { x: 21.5, y: 24, spec: { kind: "car", car: "jeep", dir: "S" } },
    { x: 10.5, y: 21.2, spec: { kind: "biggen", running: false } },
    { x: 31.2, y: 28.6, spec: { kind: "booth" } },
    { x: 36, y: 16.4, spec: { kind: "tank" } },
    { x: 38, y: 16.4, spec: { kind: "hedge", w: 14 }, seed: 5 },
    { x: 23.6, y: 19.8, spec: { kind: "flowers", w: 6.5 }, seed: 6 },
    { x: 15, y: 19.8, spec: { kind: "flowers", w: 4.6 }, seed: 7 },
    { x: 48.5, y: 26.5, spec: { kind: "tree", size: 3 }, seed: 11 },
    { x: 7.5, y: 28.4, spec: { kind: "palm", height: 7.5 }, seed: 12 },
    { x: 3, y: 33.4, spec: { kind: "palm", height: 8 }, seed: 13 },
    { x: 57, y: 33.4, spec: { kind: "palm", height: 7 }, seed: 14 },
    { x: 14, y: 33.2, spec: { kind: "pole" } },
    { x: 44, y: 33.2, spec: { kind: "pole" } },
  ],
  doors: [
    { id: "house", x: 22.25, y: 18.9, label: "Enter the house (your room)", radius: 1.4 },
    { id: "daddy-veranda", x: 18.3, y: 19.2, label: "Report to Daddy on the veranda", radius: 1.2 },
    { id: "car", x: 23.6, y: 24.2, label: "Drive out in your car", radius: 1.5 },
  ],
  exits: [
    { id: "to-bodija", x: 58.8, y: 37.5, to: "bodija", label: "Walk to Bodija Market", radius: 1.8 },
    { id: "to-agodi", x: 1.2, y: 37.5, to: "agodi", label: "Walk towards Agodi", radius: 1.8 },
  ],
  npcs: [
    {
      id: "Musa",
      cast: "gatemanMusa",
      at: {
        // in the open gateway, where gatemen actually sit
        morning: { x: 27.6, y: 31.1, dir: "S", doing: "opening the gate" },
        afternoon: { x: 27.6, y: 31.1, dir: "W", doing: "dozing in the gateway" },
        evening: { x: 27.6, y: 31.1, dir: "S", doing: "at his post" },
        night: { x: 27.6, y: 31.1, dir: "S", doing: "on night watch" },
      },
      lines: {
        morning: ["Good morning o. Oga has gone to site since six.", "The diesel is getting low o. Tell Oga."],
        afternoon: ["Ah, I was not sleeping. I was resting my eyes.", "Your cousin Kunle came again. I told him you are not around."],
        evening: ["Oga is back. He asked for you.", "NEPA took light at four. I put on the generator."],
        night: ["Lock your door well. I'm here till morning.", "Don't worry, nothing will pass this gate."],
        any: ["Ranka dede."],
      },
    },
    {
      id: "Chief Adeyemi",
      cast: "chief",
      at: { evening: { x: 18.3, y: 20.3, dir: "S", doing: "reading Tribune on the veranda" } },
      awayNote: "Daddy is at a site on Ring Road until evening.",
      lines: {
        evening: ["So what did you achieve today?", "My father built this house with his own hands. Remember that.", "That bank job, have you gone for the interview?"],
        any: ["Hmm."],
      },
    },
    {
      id: "Mummy",
      cast: "mummy",
      at: { evening: { x: 26.2, y: 20.6, dir: "W", doing: "on the phone about aso-ebi" } },
      awayNote: "Mummy is at her fabric shop in Gbagi until evening.",
      lines: {
        evening: ["Have you chosen your aso-ebi for my sixtieth?", "Your father is too hard on you. Eat first.", "Don't let Kunle talk you into anything."],
        any: ["My dear."],
      },
    },
    {
      id: "Kunle",
      cast: "cousinKunle",
      at: { afternoon: { x: 28.6, y: 32.4, dir: "W", doing: "waiting outside the gate" } },
      awayNote: "",
      lines: {
        afternoon: ["Cuz! Just the person. I have a POS business plan, hear me out.", "Lend me thirty thousand. By Friday it's double, I swear.", "Don't tell Uncle I came."],
        any: ["Cuz!"],
      },
    },
  ],
  spawn: { x: 22.25, y: 19.8 },
  arrive: { x: 26.2, y: 32.4 },
};
