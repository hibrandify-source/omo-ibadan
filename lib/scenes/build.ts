// Helpers for laying out district scenes: rows of houses and shops in the
// character of an area, and the usual road + bus stop + exits.

import { PAL } from "@/lib/art/palette";
import { rng } from "@/lib/art/core";
import type { BuildingSpec } from "@/lib/art/buildings";
import type { Placed, PropKind, SceneExit } from "./types";

export type Character = "old" | "mixed" | "rich";

/**
 * Buildings filling x0..x1 with their fronts on `front` (y). `signs` become
 * shopfronts with painted signboards, used in order; the rest are homes.
 */
export function houseRow(x0: number, x1: number, front: number, character: Character, seed: number, signs: string[] = []): Placed<BuildingSpec>[] {
  const r = rng(seed);
  const out: Placed<BuildingSpec>[] = [];
  let x = x0;
  let i = 0;
  let signIdx = 0;
  while (x < x1 - 6) {
    const shop = signIdx < signs.length && r() < 0.6;
    const w = Math.min(x1 - x, shop ? 9 + r() * 4 : 9 + r() * 6);
    const d = 5.5 + r() * 1.5;
    const h = character === "rich" ? (r() < 0.6 ? 6 : 3.4) : 3 + r() * 0.3;
    const s = seed + i * 13;
    const homeOpenings: BuildingSpec["openings"] = character === "old"
      ? [{ x: 1, kind: "shutter" }, { x: w / 2 - 0.45, kind: "door", curtain: ["#7a2a35", "#2f5a8a", "#3f6b3a", "#6b4a8a"][i % 4] }, { x: w - 2.2, kind: "shutter" }]
      : [{ x: 1, kind: "louvre", width: 1.4 }, { x: w / 2 - 0.5, kind: "door" }, { x: w - 2.5, kind: "louvre", width: 1.4 }];
    out.push({
      x,
      y: front - d,
      seed: s,
      spec: {
        w, d, h,
        roof: shop ? "shed" : character === "rich" ? "hip" : r() < 0.6 ? "hip" : "gable",
        wall: character === "rich" ? ["#efe6d6", "#e4ece6", "#f1ede4"][i % 3] : PAL.plaster[Math.floor(r() * PAL.plaster.length)],
        wallKind: character !== "rich" && r() < 0.12 ? "block" : "plaster",
        rust: character === "old" ? 0.9 + r() * 0.1 : character === "mixed" ? 0.55 + r() * 0.35 : 0.2 + r() * 0.25,
        seed: s,
        storeys: h > 5 ? 2 : 1,
        notice: character === "old" && !shop && r() < 0.3 ? "THIS HOUSE IS NOT FOR SALE" : undefined,
        sign: shop ? { text: signs[signIdx], bg: ["#f2c230", "#2f6fb5", "#f3efe4", "#2f8a4a"][signIdx % 4], fg: signIdx % 4 === 1 || signIdx % 4 === 3 ? "#f3efe4" : "#1d1b19" } : undefined,
        openings: shop
          ? [{ x: 0.5, kind: "shopfront", width: w / 2 - 0.8 }, { x: w / 2 + 0.3, kind: "shopfront", width: w / 2 - 0.8 }]
          : homeOpenings,
      },
    });
    if (shop) signIdx++;
    x += w + 0.4 + r() * 1.2;
    i++;
  }
  return out;
}

/** Bus stop signboard + its exit to the map. */
export function busStop(x: number, roadY: number, name: string): { prop: Placed<PropKind>; exit: SceneExit } {
  return {
    prop: { x, y: roadY - 4.2, spec: { kind: "signboard", text: `${name} BUS STOP`, bg: "#f3efe4", fg: "#1f3d8a", w: 3 } },
    exit: { id: "bus-stop", x, y: roadY - 2.6, to: "map", label: "Bus stop: take a micra", radius: 1.6 },
  };
}

/** Walking exits at the two ends of the road. */
export function roadEnds(w: number, roadY: number, west: { to: string; label: string } | null, east: { to: string; label: string } | null): SceneExit[] {
  const out: SceneExit[] = [];
  if (west) out.push({ id: `to-${west.to}`, x: 1.2, y: roadY, to: west.to, label: west.label, radius: 1.8 });
  if (east) out.push({ id: `to-${east.to}`, x: w - 1.2, y: roadY, to: east.to, label: east.label, radius: 1.8 });
  return out;
}
