// District scene manifest: illustration-first world.
// Each district renders its painting; hotspots (doors, NPCs, gates) are % anchors over it.
// Portrait medallions are cropped FROM the scenes themselves so humans always match the art.
import RAW from "@/public/districts/opt/manifest.json";

interface DistImg {
  hero: string;
  small: string;
  blur: string;
  width: number;
  height: number;
  heroBytes: number;
}

const IMGS = RAW as Record<string, DistImg>;

export interface DoorAnchor {
  doorId: string;
  x: number; // % of scene width
  y: number; // % of scene height
}

export interface NpcAnchor {
  npcId: string;
  x: number;
  y: number;
  portrait?: string; // cropped from the scene itself
}

export interface DistrictSceneDef {
  id: string;
  img: DistImg;
  spawn: { x: number; y: number };
  walkBand: { top: number; bottom: number }; // tappable % y-range
  doors: DoorAnchor[];
  npcs: NpcAnchor[];
  gates: string[]; // neighbor district ids (edge travel)
}

const D = (
  id: string,
  spawn: [number, number],
  walkBand: [number, number],
  doors: DoorAnchor[],
  npcs: NpcAnchor[],
  gates: string[]
): DistrictSceneDef => ({
  id,
  img: IMGS[id],
  spawn: { x: spawn[0], y: spawn[1] },
  walkBand: { top: walkBand[0], bottom: walkBand[1] },
  doors,
  npcs,
  gates,
});

export const DISTRICT_SCENES: Record<string, DistrictSceneDef> = {
  // Bodija proof-of-concept: market stalls mid-frame, Mama Put bottom-left, micra mid-road.
  bodija: D(
    "bodija",
    [50, 80],
    [55, 93],
    [
      { doorId: "door-mamaput", x: 14, y: 70 },
      { doorId: "door-bodija", x: 55, y: 42 },
    ],
    [{ npcId: "Mama Put", x: 14, y: 78, portrait: "/districts/opt/mama-put.webp" }],
    ["ui-gate", "sango", "samonda"]
  ),
  // Remaining districts: full-bleed scene + travel gates; doors/NPC anchors land next.
  "ui-gate": D("ui-gate", [50, 78], [55, 93], [], [], ["bodija", "sango", "samonda"]),
  sango: D("sango", [50, 78], [55, 93], [], [], ["bodija", "ui-gate", "eleyele", "samonda"]),
  samonda: D("samonda", [50, 78], [55, 93], [], [], ["bodija", "ui-gate", "dugbe", "mokola"]),
  mokola: D("mokola", [50, 78], [55, 93], [], [], ["samonda", "dugbe", "agodi"]),
  dugbe: D("dugbe", [50, 78], [55, 93], [], [], ["samonda", "mokola", "mapo", "challenge"]),
  mapo: D("mapo", [50, 78], [55, 93], [], [], ["dugbe", "oja-oba", "oje"]),
  "oja-oba": D("oja-oba", [50, 78], [55, 93], [], [], ["mapo", "oje", "molete"]),
  oje: D("oje", [50, 78], [55, 93], [], [], ["mapo", "oja-oba", "iwo-road"]),
  agodi: D("agodi", [50, 78], [55, 93], [], [], ["mokola", "bodija"]),
  challenge: D("challenge", [50, 78], [55, 93], [], [], ["dugbe", "molete", "ring-road"]),
  molete: D("molete", [50, 78], [55, 93], [], [], ["challenge", "oja-oba", "ring-road"]),
  "ring-road": D("challenge", [50, 78], [55, 93], [], [], ["challenge", "molete", "iwo-road"]),
  "iwo-road": D("iwo-road", [50, 78], [55, 93], [], [], ["oje", "ring-road"]),
  eleyele: D("eleyele", [50, 78], [55, 93], [], [], ["sango"]),
};

export const sceneFor = (zone: string): DistrictSceneDef =>
  DISTRICT_SCENES[zone] ?? DISTRICT_SCENES["ui-gate"];
