// Walkable code-drawn scenes, one per district on the map.

import { BEERE } from "./beere";
import { BODIJA } from "./bodija";
import { AGODI, DUGBE, ELEYELE, RING_ROAD, SANGO } from "./batch1";
import { AGBOWO, CHALLENGE, MOKOLA, MOLETE, SAMONDA } from "./batch2";
import { AKOBO, JERICHO, MONIYA, OJE, OJOO } from "./batch3";
import { ALAKIA } from "./alakia";
import { SABO } from "./sabo";
import { AGBENI, ALESHINLOYE, GBAGI } from "./markets2";
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
  alakia: ALAKIA,
  sabo: SABO,
  gbagi: GBAGI,
  aleshinloye: ALESHINLOYE,
  agbeni: AGBENI,
  dugbe: DUGBE,
  "ring-road": RING_ROAD,
  eleyele: ELEYELE,
  agodi: AGODI,
  sango: SANGO,
  mokola: MOKOLA,
  samonda: SAMONDA,
  challenge: CHALLENGE,
  molete: MOLETE,
  agbowo: AGBOWO,
  ojoo: OJOO,
  moniya: MONIYA,
  akobo: AKOBO,
  jericho: JERICHO,
  oje: OJE,
};

export const streetSceneFor = (zone: string): SceneDef | undefined => STREET_SCENES[zone];
