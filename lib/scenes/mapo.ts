// Mapo Hall: the colonial hall on Mapo hill, above the brown roofs of the old
// city. Couples come for pre-wedding photos, elders tell the history, and from
// the forecourt you can see roof after rusted roof all the way to Beere.

import { PAL } from "@/lib/art/palette";
import type { SceneDef } from "./types";

export const MAPO: SceneDef = {
  id: "mapo",
  name: "Mapo Hall",
  w: 56,
  h: 46,
  ground: { seed: 1301, grassy: 0.2 },
  roads: [{ x0: 0, x1: 56, y: 40.5, width: 6.6, wear: 0.7, seed: 29, markings: 0.3, gutters: true, crossings: [26.4] }],
  yards: [
    { x: 4, y: 3, w: 48, h: 24, surface: "lawn" },
    { x: 19, y: 19, w: 18, h: 9, surface: "paved" },
  ],
  buildings: [
    // the old city below the hill, packed roof to roof along the road
    { x: -2, y: 29, seed: 1401, spec: { w: 12, d: 6, h: 3, roof: "hip", wall: PAL.plaster[2], wallKind: "plaster", rust: 1, seed: 1401, notice: "THIS HOUSE IS NOT FOR SALE", openings: [{ x: 1.2, kind: "shutter" }, { x: 5.2, kind: "door", curtain: "#7a2a35" }, { x: 8.6, kind: "shutter" }] } },
    { x: 11, y: 29.5, seed: 1402, spec: { w: 12, d: 5.5, h: 3, roof: "gable", wall: PAL.plaster[4], wallKind: "plaster", rust: 0.95, seed: 1402, openings: [{ x: 1, kind: "louvre" }, { x: 5, kind: "door", curtain: "#2f5a8a" }, { x: 8.4, kind: "shutter" }] } },
    { x: 31, y: 29.5, seed: 1403, spec: { w: 11, d: 5.5, h: 3.1, roof: "shed", wall: PAL.plaster[5], wallKind: "plaster", rust: 0.9, seed: 1403, sign: { text: "MAPO PHOTO STUDIO", bg: "#2f6fb5", fg: "#f3efe4" }, openings: [{ x: 0.6, kind: "shopfront", width: 4.6 }, { x: 5.8, kind: "shopfront", width: 4.6 }] } },
    { x: 43, y: 29, seed: 1404, spec: { w: 14, d: 6, h: 3, roof: "hip", wall: PAL.plaster[1], wallKind: "plaster", rust: 1, seed: 1404, openings: [{ x: 1.2, kind: "shutter" }, { x: 6.2, kind: "door", curtain: "#3f6b3a" }, { x: 10.4, kind: "louvre" }] } },
  ],
  fences: [],
  props: [
    { x: 13, y: 4, spec: { kind: "civichall", w: 30, d: 12, h: 9, name: "MAPO HALL" }, seed: 1501 },
    { x: 16, y: 21.5, spec: { kind: "palm", height: 8.5 }, seed: 1502 },
    { x: 40, y: 21.5, spec: { kind: "palm", height: 8 }, seed: 1503 },
    { x: 7, y: 14, spec: { kind: "tree", size: 3 }, seed: 1504 },
    { x: 49, y: 13, spec: { kind: "tree", size: 2.8 }, seed: 1505 },
    { x: 22, y: 26.6, spec: { kind: "bench" } },
    { x: 34, y: 26.6, spec: { kind: "bench" } },
    { x: 8, y: 36.4, spec: { kind: "umbrella", colors: ["#d4402c", "#f2c230"], goods: "provisions" }, seed: 1506 },
    { x: 46, y: 36.6, spec: { kind: "signboard", text: "MAPO BUS STOP", bg: "#f3efe4", fg: "#1f3d8a", w: 2.8 } },
    { x: 20, y: 36.4, spec: { kind: "pole" } },
  ],
  doors: [
    { id: "mapo-view", x: 28, y: 27.4, label: "Look out over the brown roofs", radius: 1.6 },
  ],
  exits: [
    { id: "to-oja-oba", x: 1.2, y: 40.5, to: "oja-oba", label: "Walk down to Oja'ba", radius: 1.8 },
    { id: "to-beere", x: 54.8, y: 40.5, to: "beere", label: "Walk to Beere", radius: 1.8 },
    { id: "bus-stop", x: 46, y: 38, to: "map", label: "Bus stop: take a micra", radius: 1.6 },
  ],
  npcs: [
    {
      id: "Baba Itan",
      cast: "babaAde",
      at: {
        morning: { x: 24.5, y: 22, dir: "S", doing: "telling visitors the history" },
        afternoon: { x: 24.5, y: 22, dir: "S", doing: "resting in the shade" },
        evening: { x: 24.5, y: 22, dir: "S", doing: "watching the sunset" },
      },
      lines: {
        morning: [
          "The British built this hall in 1929. But Mapo hill was ours long before.",
          "Every new Olubadan is presented to the people here. You will see one day.",
          "From here you can see why they call Ibadan the city of brown roofs.",
        ],
        afternoon: ["Sit. Young people don't rest again. Everything is hurry."],
        evening: ["See the sun on the roofs. This is Ibadan, my child."],
        any: ["Ẹ kú àbọ̀."],
      },
    },
    {
      id: "Photographer",
      cast: "uiStudent",
      at: {
        morning: { x: 33, y: 23, dir: "W", doing: "shooting a pre-wedding" },
        afternoon: { x: 33, y: 23, dir: "W", doing: "shooting a pre-wedding" },
      },
      lines: { any: ["Golden hour is the best, but couples pay any hour. Move small to your left!"] },
    },
    {
      id: "Bride-to-be",
      cast: "owambeAunty",
      at: {
        morning: { x: 30, y: 24.2, dir: "S", doing: "posing for the camera" },
        afternoon: { x: 30, y: 24.2, dir: "S", doing: "posing for the camera" },
      },
      lines: { any: ["Our wedding is in December. You're invited if you buy aso-ebi!"] },
    },
  ],
  spawn: { x: 28, y: 37.2 },
  arrive: { x: 28, y: 37.2 },
};
