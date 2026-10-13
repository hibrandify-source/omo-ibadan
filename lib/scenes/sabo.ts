// Sabo: the Hausa quarter by Adamasingba. Inside the wall, the Ibadan
// Recreation Club (clubhouse, tennis) and the Ibadan Golf Club next door;
// outside, Sabo Road, the central mosque and the evening suya spot.

import { PAL } from "@/lib/art/palette";
import type { SceneDef } from "./types";

export const SABO: SceneDef = {
  id: "sabo",
  name: "Sabo / Recreation Club",
  w: 62,
  h: 46,
  ground: { seed: 2201, grassy: 0.3 },
  roads: [{ x0: 0, x1: 62, y: 39.5, width: 6.6, wear: 0.6, seed: 41, markings: 0.4, gutters: true, crossings: [12, 30] }],
  yards: [
    { x: 0, y: 1, w: 38, h: 20, surface: "lawn" }, // club grounds
    { x: 38, y: 1, w: 24, h: 20, surface: "lawn" }, // golf
  ],
  buildings: [
    {
      x: 1, y: 2, seed: 2301,
      spec: {
        w: 18, d: 8, h: 4, roof: "hip", wall: "#f1ede4", wallKind: "plaster", rust: 0.4, seed: 2301,
        sign: { text: "IBADAN RECREATION CLUB", bg: "#1f3d6b", fg: "#f3efe4" },
        openings: [{ x: 1.4, kind: "louvre", width: 1.6 }, { x: 4.6, kind: "louvre", width: 1.6 }, { x: 8.2, kind: "door", width: 1.6 }, { x: 11.6, kind: "louvre", width: 1.6 }, { x: 14.8, kind: "louvre", width: 1.6 }],
      },
    },
    // Sabo Road shops opposite the mosque
    { x: 0, y: 25, seed: 2302, spec: { w: 14, d: 6, h: 3.2, roof: "shed", wall: PAL.plaster[5], wallKind: "plaster", rust: 0.85, seed: 2302, sign: { text: "KANO PROVISIONS", bg: "#2f8a4a", fg: "#f3efe4" }, openings: [{ x: 0.7, kind: "shopfront", width: 6 }, { x: 7.3, kind: "shopfront", width: 6 }] } },
    { x: 26, y: 25.5, seed: 2303, spec: { w: 12, d: 5.5, h: 3, roof: "hip", wall: PAL.plaster[2], wallKind: "plaster", rust: 0.95, seed: 2303, openings: [{ x: 1.2, kind: "shutter" }, { x: 5.4, kind: "door", curtain: "#2f5a8a" }, { x: 9, kind: "shutter" }] } },
  ],
  fences: [
    { x0: -1, x1: 63, y: 21.4, h: 2.2, wall: "#e2dccd", glassTop: false, seed: 61, gate: { x: 8, w: 4.4, color: "#2f4f3a", open: true } },
  ],
  props: [
    { x: 21, y: 4, spec: { kind: "tennis" } },
    { x: 52, y: 10, spec: { kind: "golfgreen" } },
    { x: 41, y: 17, spec: { kind: "tree", size: 3 }, seed: 2401 },
    { x: 60, y: 3, spec: { kind: "tree", size: 3.2 }, seed: 2402 },
    { x: 18.5, y: 18.5, spec: { kind: "palm", height: 8 }, seed: 2403 },
    { x: 44, y: 21.4, spec: { kind: "mosque", w: 12, d: 8 } },
    { x: 20, y: 31.2, spec: { kind: "suya" } },
    { x: 57, y: 20.2, spec: { kind: "signboard", text: "IBADAN GOLF CLUB", bg: "#2f6b4a", fg: "#f3efe4", w: 3.2 } },
    { x: 16, y: 36, spec: { kind: "pole" } },
    { x: 58, y: 36.2, spec: { kind: "signboard", text: "SABO BUS STOP", bg: "#f3efe4", fg: "#1f3d8a", w: 2.6 } },
  ],
  doors: [
    { id: "rec-tennis", x: 33, y: 15.6, label: "Play tennis (club guest fee)", radius: 1.8 },
    { id: "golf-caddie", x: 48.5, y: 13.4, label: "Caddie a round at the Golf Club", radius: 1.8 },
    { id: "suya", x: 20, y: 32.6, label: "Buy suya", radius: 1.6 },
  ],
  exits: [
    { id: "to-dugbe", x: 1.2, y: 39.5, to: "dugbe", label: "Walk toward Dugbe", radius: 1.8 },
    { id: "to-mokola", x: 60.8, y: 39.5, to: "mokola", label: "Walk toward Mokola", radius: 1.8 },
    { id: "bus-stop", x: 58, y: 37.4, to: "map", label: "Bus stop: take a micra", radius: 1.6 },
  ],
  npcs: [
    {
      id: "Coach Bisola",
      cast: "tennisPlayer",
      at: {
        morning: { x: 27, y: 9, dir: "E", doing: "coaching a junior" },
        afternoon: { x: 27, y: 9, dir: "E", doing: "hitting with a member" },
      },
      lines: {
        morning: ["Bend your knees! Watch the ball, not your opponent."],
        afternoon: ["Members only after four, but guests can pay for a session."],
        any: ["Good game."],
      },
    },
    {
      id: "Chief on the green",
      cast: "golfer",
      at: {
        morning: { x: 50, y: 11.6, dir: "E", doing: "lining up a putt" },
        afternoon: { x: 50, y: 11.6, dir: "E", doing: "arguing about his handicap" },
      },
      lines: {
        morning: ["Quiet, please. This putt is worth more than your rent."],
        afternoon: ["In my time, the course was full every weekend. Young people don't play again."],
        any: ["Mm."],
      },
    },
    {
      id: "Kabiru the caddie",
      cast: "caddie",
      at: {
        morning: { x: 47, y: 12.4, dir: "E", doing: "holding the Chief's bag" },
        afternoon: { x: 47, y: 12.4, dir: "E", doing: "waiting for a round" },
      },
      lines: {
        morning: ["Caddying pays better than you think. And you meet big men."],
        afternoon: ["Learn the course and the members will ask for you by name."],
        any: ["Sannu."],
      },
    },
    {
      id: "Mallam Audu",
      cast: "suyaMan",
      at: {
        evening: { x: 20, y: 30.4, dir: "S", doing: "turning sticks of suya" },
        night: { x: 20, y: 30.4, dir: "S", doing: "fanning the coals" },
      },
      awayNote: "Mallam Audu lights his suya grill in the evening.",
      lines: {
        evening: ["Suya! Fresh beef, kilishi, extra pepper. How many sticks?"],
        night: ["The best suya is after dark. Eat with onions and cabbage."],
        any: ["Sannu da zuwa."],
      },
    },
  ],
  spawn: { x: 10, y: 35.4 },
  arrive: { x: 10, y: 35.4 },
};
