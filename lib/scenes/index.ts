// Walkable code-drawn scenes by district id. Districts without one still use
// the painted DistrictScene (or a placeholder) until theirs is built.

import { BEERE } from "./beere";
import type { SceneDef } from "./types";

export const STREET_SCENES: Record<string, SceneDef> = {
  beere: BEERE,
};

export const streetSceneFor = (zone: string): SceneDef | undefined => STREET_SCENES[zone];
