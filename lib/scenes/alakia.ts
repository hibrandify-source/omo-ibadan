// Alakia: Ibadan Airport on Airport Road, and the Dr. Omololu Olunloyo
// Recreational Park nearby. (The park's exact spot isn't in OpenStreetMap;
// it sits here by the airport road as the game's owner described.)

import { PAL } from "@/lib/art/palette";
import type { SceneDef } from "./types";

export const ALAKIA: SceneDef = {
  id: "alakia",
  name: "Alakia / Airport",
  w: 64,
  h: 46,
  ground: { seed: 1901, grassy: 0.35 },
  roads: [{ x0: 0, x1: 64, y: 40, width: 7.2, wear: 0.3, seed: 37, markings: 0.8, gutters: true, crossings: [14, 50] }],
  yards: [
    { x: 0, y: 1, w: 37, h: 20, surface: "paved" }, // apron
    { x: 0, y: 30, w: 30, h: 5, surface: "paved" }, // taxi rank
    { x: 38, y: 1, w: 26, h: 23, surface: "lawn" }, // park
  ],
  buildings: [
    {
      x: 2, y: 22, seed: 2001,
      spec: {
        w: 24, d: 8, h: 5, roof: "flat", wall: "#ece8de", wallKind: "plaster", rust: 0, seed: 2001,
        sign: { text: "IBADAN AIRPORT", bg: "#1f6b4a", fg: "#f3efe4" },
        openings: [{ x: 1.5, kind: "window", width: 3 }, { x: 5.5, kind: "window", width: 3 }, { x: 10.5, kind: "door", width: 3 }, { x: 15, kind: "window", width: 3 }, { x: 19.5, kind: "window", width: 3 }],
      },
    },
  ],
  fences: [
    // airside: only through the terminal
    { x0: -1, x1: 2, y: 21.2, h: 2.4, wall: "#d9d3c6", glassTop: true, seed: 51 },
    { x0: 26, x1: 38, y: 21.2, h: 2.4, wall: "#d9d3c6", glassTop: true, seed: 52 },
    // the park's railing, with its gate
    { x0: 38, x1: 65, y: 24.2, h: 1.6, wall: "#cfc8b8", glassTop: false, seed: 53, gate: { x: 47, w: 6, color: "#2f6b4a", open: true } },
  ],
  props: [
    // parked close to the fence so you can see it from the viewing spot
    { x: 14, y: 16.5, spec: { kind: "plane" } },
    { x: 32.5, y: 15.5, spec: { kind: "ctower" } },
    { x: 50, y: 24.2, spec: { kind: "gatearch", text: "OMOLOLU OLUNLOYO PARK", span: 6, boom: false } },
    { x: 42, y: 8, spec: { kind: "tree", size: 3 }, seed: 2101 },
    { x: 58, y: 6, spec: { kind: "tree", size: 3.4 }, seed: 2102 },
    { x: 61, y: 18, spec: { kind: "palm", height: 8 }, seed: 2103 },
    { x: 45, y: 16, spec: { kind: "bench" } },
    { x: 55, y: 16, spec: { kind: "bench" } },
    { x: 46.5, y: 20.5, spec: { kind: "flowers", w: 7 }, seed: 2104 },
    { x: 8, y: 33.4, spec: { kind: "car", car: "corolla", dir: "E" } },
    { x: 18, y: 33.4, spec: { kind: "car", car: "camry", dir: "E" } },
    { x: 34, y: 36.2, spec: { kind: "signboard", text: "ALAKIA BUS STOP", bg: "#f3efe4", fg: "#1f3d8a", w: 2.8 } },
  ],
  doors: [
    { id: "airport-terminal", x: 14.5, y: 30.8, label: "Departure hall", radius: 1.8 },
    { id: "airport-watch", x: 32, y: 22, label: "Watch the planes", radius: 1.8 },
    { id: "park-relax", x: 50, y: 17.4, label: "Relax in the park", radius: 2 },
  ],
  exits: [
    { id: "to-iwo", x: 1.2, y: 40, to: "iwo-road", label: "Head toward Iwo Road", radius: 1.8 },
    { id: "bus-stop", x: 34, y: 37.6, to: "map", label: "Bus stop: take a micra", radius: 1.6 },
  ],
  npcs: [
    {
      id: "Airport taxi",
      cast: "mechanic",
      at: {
        morning: { x: 11.5, y: 34.4, dir: "S", doing: "waiting for the Lagos flight" },
        afternoon: { x: 11.5, y: 34.4, dir: "S", doing: "waiting for the Abuja flight" },
        evening: { x: 11.5, y: 34.4, dir: "S", doing: "polishing his Corolla" },
      },
      lines: {
        morning: ["Airport taxi! Bodija six thousand, Ring Road eight. No shaking."],
        afternoon: ["Flights are few here; when one lands, we all eat."],
        any: ["Taxi?"],
      },
    },
    {
      id: "Park keeper",
      cast: "babaAde",
      at: {
        morning: { x: 52, y: 12, dir: "S", doing: "sweeping the paths" },
        afternoon: { x: 52, y: 12, dir: "S", doing: "watching the children" },
        evening: { x: 52, y: 12, dir: "S", doing: "locking up soon" },
      },
      lines: {
        morning: ["Keep the park clean. Pure water nylon goes in the bin, not the grass."],
        afternoon: ["Families come on Sundays. Today is quiet. Sit, rest."],
        evening: ["We close at seven. Finish your gist."],
        any: ["Ẹ kú ìjókòó."],
      },
    },
    {
      id: "Family on a day out",
      cast: "nursingMother",
      at: { afternoon: { x: 44, y: 14.5, dir: "E", doing: "picnicking with the children" } },
      lines: { any: ["We come here when we need air. Ibadan is too noisy sometimes."] },
    },
  ],
  spawn: { x: 36, y: 36.6 },
  arrive: { x: 36, y: 36.6 },
};
