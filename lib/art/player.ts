// Omo Ibadan art kit — turn the player's chosen look into a drawn person.

import { PAL } from "./palette";
import type { Fabric, PersonSpec } from "./people";

export interface PlayerLook {
  gender: "okunrin" | "obinrin";
  /** index into the onboarding skin swatches */
  skin: number;
  /** current top colour (wardrobe or swatch) */
  top: string;
  gear: "fila" | "gele" | "none" | "braids" | "afro";
}

// onboarding swatches (lib/world SKINS) map onto the art palette's skin tones
const SKIN_MAP = [PAL.skin[1], PAL.skin[3], PAL.skin[0], PAL.skin[4], PAL.skin[0]];

const fabric = (base: string): Fabric => ({ base, a: "#f2e6c9", b: "#1d1b19", motif: "wax" });

export function playerSpec(l: PlayerLook): PersonSpec {
  const skin = SKIN_MAP[l.skin] ?? PAL.skin[2];
  const f = fabric(l.top);
  const woman = l.gender === "obinrin";
  return {
    skin,
    height: woman ? 1.66 : 1.76,
    build: woman ? 0.98 : 1.0,
    age: "adult",
    hair: l.gear === "braids" ? "braids" : l.gear === "afro" ? "afro" : "lowcut",
    headwear: l.gear === "gele" ? { kind: "gele", fabric: f } : l.gear === "fila" ? { kind: "fila", fabric: f } : null,
    outfit: woman
      ? { kind: "iro-buba", buba: f, iro: { ...f, motif: "plain", base: "#2b2a3a" } }
      : { kind: "buba-sokoto", top: f, bottom: { base: "#2d2b29", a: "#2d2b29", b: "#2d2b29", motif: "plain" } },
    shoes: PAL.slipper,
    carry: null,
  };
}
