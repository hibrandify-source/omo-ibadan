// Walkable code-drawn scenes by district id. Districts without one still use
// the painted DistrictScene (or a placeholder) until theirs is built.

import { BEERE } from "./beere";
import { BODIJA } from "./bodija";
import { MAPO } from "./mapo";
import { UI_GATE } from "./uiGate";
import { IWO_ROAD } from "./iwoRoad";
import { OJA_OBA } from "./ojaOba";
import { OLD_BODIJA } from "./oldBodija";
import type { SceneDef } from "./types";

export const STREET_SCENES: Record<string, SceneDef> = {
  beere: BEERE,
  "old-bodija": OLD_BODIJA,
  "oja-oba": OJA_OBA,
  bodija: BODIJA,
  "iwo-road": IWO_ROAD,
  mapo: MAPO,
  "ui-gate": UI_GATE,
};

export const streetSceneFor = (zone: string): SceneDef | undefined => STREET_SCENES[zone];
