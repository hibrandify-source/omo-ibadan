// Omo Ibadan — walkable street/compound scenes, drawn with the art kit.
// Everything is in world metres: x east, y south, origin at the scene's NW corner.

import type { BuildingSpec, FenceSpec } from "@/lib/art/buildings";
import type { RoadSpec } from "@/lib/art/ground";
import type { DayPart } from "@/lib/engine/clock";

export type PropKind =
  | { kind: "tree"; size: number }
  | { kind: "palm"; height: number }
  | { kind: "tank" }
  | { kind: "generator"; running: boolean }
  | { kind: "umbrella"; colors: [string, string]; goods: "tomato" | "pepper" | "onion" | "provisions" }
  | { kind: "bench" }
  | { kind: "kiosk"; color: string; text: string }
  | { kind: "pole" }
  | { kind: "signboard"; text: string; bg: string; fg: string; w: number }
  | { kind: "pots" } // Mama's soup pots on firewood
  | { kind: "drum"; color: string } // water drum
  | { kind: "chickens"; n: number }
  | { kind: "car"; car: "micra" | "korope" | "interstate" | "corolla" | "camry" | "jeep"; dir: "S" | "N" | "E" | "W" }
  | { kind: "booth" } // gateman's post
  | { kind: "biggen"; running: boolean } // soundproof house generator
  | { kind: "hedge"; w: number }
  | { kind: "flowers"; w: number }
  | { kind: "civichall"; w: number; d: number; h: number; name: string } // origin NW corner
  | { kind: "gatearch"; text: string; span: number } // origin centre of the gateway
  | { kind: "stall"; goods: "pepper" | "tomato" | "onion" | "yam" | "fabric" | "grains" | "fish" | "soup" | "provisions"; w?: number };

export interface Placed<T> {
  x: number;
  y: number;
  spec: T;
  seed?: number;
}

export interface SceneSpot {
  id: string;
  x: number;
  y: number;
  /** text on the action chip, e.g. "Enter your room" */
  label: string;
  /** how close you must stand (m) */
  radius?: number;
}

export interface SceneExit extends SceneSpot {
  /** district id on the city map, or "map" to open the map */
  to: string;
}

export interface SceneNpc {
  id: string;
  /** key into CAST */
  cast: string;
  /** where they are at each part of the day; absent parts mean "away" */
  at: Partial<Record<DayPart, { x: number; y: number; dir: "S" | "N" | "E" | "W"; doing?: string }>>;
  /** what they say when you talk to them, by part of day (falls back to `any`) */
  lines: Partial<Record<DayPart | "any", string[]>>;
  /** where they are when not here, for the feed */
  awayNote?: string;
}

export interface SceneDef {
  id: string;
  name: string;
  w: number;
  h: number;
  ground: { seed: number; grassy: number };
  roads: RoadSpec[];
  /** yards and compounds: swept dirt (default), interlocking paving, or lawn */
  yards: { x: number; y: number; w: number; h: number; surface?: "dirt" | "paved" | "lawn" }[];
  buildings: Placed<BuildingSpec>[];
  fences: FenceSpec[];
  props: Placed<PropKind>[];
  doors: SceneSpot[];
  exits: SceneExit[];
  npcs: SceneNpc[];
  spawn: { x: number; y: number };
  /** where you appear when arriving from the map */
  arrive: { x: number; y: number };
}
