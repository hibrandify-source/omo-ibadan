// Omo Ibadan art kit — a cast of everyday Ibadan people.

import { PAL } from "./palette";
import { FABRICS, type PersonSpec } from "./people";

const S = PAL.skin;

export const CAST: Record<string, PersonSpec> = {
  mamaBisi: {
    skin: S[2], height: 1.62, build: 1.25, age: "adult", hair: "lowcut",
    headwear: { kind: "headtie", fabric: FABRICS.waxGreen },
    outfit: { kind: "iro-buba", buba: FABRICS.waxGold, iro: FABRICS.waxGreen },
    shoes: PAL.slipper, carry: null,
  },
  marketWoman: {
    skin: S[1], height: 1.6, build: 1.15, age: "adult", hair: "lowcut",
    headwear: { kind: "headtie", fabric: FABRICS.stripeRed },
    outfit: { kind: "iro-buba", buba: FABRICS.laceWhite, iro: FABRICS.waxPurple },
    shoes: PAL.slipper, carry: "basin",
  },
  nursingMother: {
    skin: S[3], height: 1.64, build: 1.05, age: "adult", hair: "braids",
    headwear: null,
    outfit: { kind: "gown", dress: FABRICS.waxPurple },
    shoes: "#7a4a2b", carry: "baby",
  },
  owambeAunty: {
    skin: S[4], height: 1.66, build: 1.1, age: "adult", hair: "lowcut",
    headwear: { kind: "gele", fabric: FABRICS.asoOkeWine },
    outfit: { kind: "iro-buba", buba: FABRICS.laceWhite, iro: FABRICS.asoOkeWine },
    shoes: "#c9a24a", carry: "bag",
  },
  chief: {
    skin: S[1], height: 1.78, build: 1.22, age: "elder", hair: "grey",
    headwear: { kind: "fila", fabric: FABRICS.asoOkeCream },
    outfit: { kind: "agbada", robe: FABRICS.asoOkeCream, under: FABRICS.asoOkeCream },
    shoes: "#3a2a1c", carry: null,
  },
  babaAde: {
    skin: S[0], height: 1.72, build: 1.0, age: "elder", hair: "grey",
    headwear: { kind: "fila", fabric: FABRICS.adireIndigo },
    outfit: { kind: "buba-sokoto", top: FABRICS.adireIndigo, bottom: FABRICS.adireIndigo },
    shoes: PAL.slipper, carry: null,
  },
  okadaMan: {
    skin: S[1], height: 1.74, build: 1.0, age: "adult", hair: "lowcut",
    headwear: { kind: "cap", fabric: FABRICS.plainSky },
    outfit: { kind: "okada", vest: "#e8b21e", shirt: "#3f4a5a", trousers: "#2d2b29" },
    shoes: PAL.slipper, carry: null,
  },
  tunde: {
    skin: S[2], height: 1.58, build: 0.9, age: "child", hair: "lowcut", headwear: null,
    outfit: { kind: "school", shirt: "#f1efe8", bottom: "#2f6b3e", skirt: false },
    shoes: "#1c1a19", carry: "bag",
  },
  schoolGirl: {
    skin: S[3], height: 1.3, build: 0.9, age: "child", hair: "cornrows", headwear: null,
    outfit: { kind: "school", shirt: "#f1efe8", bottom: "#7a2a35", skirt: true },
    shoes: "#1c1a19", carry: null,
  },
  banker: {
    skin: S[4], height: 1.8, build: 1.0, age: "adult", hair: "lowcut", headwear: null,
    outfit: { kind: "suit", jacket: "#1f2a3d", shirt: "#f3f1ea", tie: "#8a1f2a", trousers: "#1f2a3d" },
    shoes: "#141210", carry: null,
  },
  uiStudent: {
    skin: S[5], height: 1.76, build: 0.92, age: "adult", hair: "afro", headwear: null,
    outfit: { kind: "tee-jeans", tee: "#2f6f8f", jeans: "#2d3d5a" },
    shoes: "#e9e6de", carry: "bag",
  },
  breadSeller: {
    skin: S[2], height: 1.55, build: 0.95, age: "adult", hair: "lowcut",
    headwear: { kind: "headtie", fabric: FABRICS.waxGold },
    outfit: { kind: "gown", dress: FABRICS.adireIndigo },
    shoes: PAL.slipper, carry: "tray-bread",
  },
  alowonleGirl: {
    skin: S[4], height: 1.7, build: 0.95, age: "adult", hair: "braids", headwear: null,
    outfit: { kind: "gown", dress: FABRICS.waxGold },
    shoes: "#c9a24a", carry: "bag",
  },
  mamaPut: {
    skin: S[3], height: 1.6, build: 1.3, age: "adult", hair: "lowcut",
    headwear: { kind: "headtie", fabric: FABRICS.stripeRed },
    outfit: { kind: "iro-buba", buba: FABRICS.waxGold, iro: FABRICS.adireIndigo },
    shoes: PAL.slipper, carry: null,
  },
  iyaAlata: {
    skin: S[1], height: 1.58, build: 1.2, age: "adult", hair: "lowcut",
    headwear: { kind: "headtie", fabric: FABRICS.waxPurple },
    outfit: { kind: "iro-buba", buba: FABRICS.stripeRed, iro: FABRICS.waxGreen },
    shoes: PAL.slipper, carry: null,
  },
  yamSeller: {
    skin: S[0], height: 1.72, build: 1.05, age: "adult", hair: "lowcut",
    headwear: { kind: "cap", fabric: FABRICS.plainSky },
    outfit: { kind: "shirt-trousers", shirt: "#8a6a3a", trousers: "#3a3530" },
    shoes: PAL.slipper, carry: null,
  },
  clothSeller: {
    skin: S[4], height: 1.64, build: 1.0, age: "adult", hair: "braids", headwear: null,
    outfit: { kind: "gown", dress: FABRICS.waxGreen },
    shoes: "#7a4a2b", carry: null,
  },
  suyaMan: {
    skin: S[2], height: 1.78, build: 0.95, age: "adult", hair: "lowcut",
    headwear: { kind: "fila", fabric: { base: "#f2efe6", a: "#c9a24a", b: "#c9a24a", motif: "dots" } },
    outfit: { kind: "buba-sokoto", top: { base: "#e9e3d6", a: "#e9e3d6", b: "#e9e3d6", motif: "plain" }, bottom: { base: "#e9e3d6", a: "#e9e3d6", b: "#e9e3d6", motif: "plain" } },
    shoes: PAL.slipper, carry: null,
  },
  golfer: {
    skin: S[3], height: 1.75, build: 1.15, age: "elder", hair: "grey",
    headwear: { kind: "cap", fabric: { base: "#f2f1ec", a: "#f2f1ec", b: "#f2f1ec", motif: "plain" } },
    outfit: { kind: "shirt-trousers", shirt: "#2f6fb5", trousers: "#d9cfb8" },
    shoes: "#f2f1ec", carry: null,
  },
  caddie: {
    skin: S[1], height: 1.72, build: 0.9, age: "adult", hair: "lowcut", headwear: null,
    outfit: { kind: "shirt-trousers", shirt: "#e1b12c", trousers: "#3a3530" },
    shoes: PAL.slipper, carry: "bag",
  },
  tennisPlayer: {
    skin: S[4], height: 1.7, build: 0.95, age: "adult", hair: "braids", headwear: null,
    outfit: { kind: "tee-jeans", tee: "#f2f1ec", jeans: "#f2f1ec" },
    shoes: "#f2f1ec", carry: null,
  },
  porter: {
    skin: S[0], height: 1.7, build: 1.05, age: "adult", hair: "lowcut", headwear: null,
    outfit: { kind: "shirt-trousers", shirt: "#8a7a5a", trousers: "#3a3530" },
    shoes: PAL.slipper, carry: null,
  },
  tout: {
    skin: S[1], height: 1.73, build: 0.95, age: "adult", hair: "lowcut",
    headwear: { kind: "cap", fabric: { base: "#c9322a", a: "#c9322a", b: "#c9322a", motif: "plain" } },
    outfit: { kind: "tee-jeans", tee: "#e9b22a", jeans: "#2d3d5a" },
    shoes: PAL.slipper, carry: null,
  },
  vioOfficer: {
    skin: S[1], height: 1.76, build: 1.1, age: "adult", hair: "lowcut",
    headwear: { kind: "cap", fabric: { base: "#2f4a2f", a: "#2f4a2f", b: "#2f4a2f", motif: "plain" } },
    outfit: { kind: "shirt-trousers", shirt: "#c9b98a", trousers: "#2f4a2f" },
    shoes: "#141210", carry: null,
  },
  gatemanMusa: {
    skin: S[2], height: 1.74, build: 0.92, age: "adult", hair: "lowcut",
    headwear: { kind: "cap", fabric: { base: "#e9e3d6", a: "#e9e3d6", b: "#e9e3d6", motif: "plain" } },
    outfit: { kind: "buba-sokoto", top: { base: "#d9cfb8", a: "#d9cfb8", b: "#d9cfb8", motif: "plain" }, bottom: { base: "#d9cfb8", a: "#d9cfb8", b: "#d9cfb8", motif: "plain" } },
    shoes: PAL.slipper, carry: null,
  },
  mummy: {
    skin: S[4], height: 1.68, build: 1.15, age: "adult", hair: "lowcut",
    headwear: { kind: "headtie", fabric: FABRICS.asoOkeWine },
    outfit: { kind: "iro-buba", buba: FABRICS.laceWhite, iro: FABRICS.asoOkeWine },
    shoes: "#c9a24a", carry: null,
  },
  cousinKunle: {
    skin: S[3], height: 1.77, build: 1.0, age: "adult", hair: "lowcut", headwear: null,
    outfit: { kind: "tee-jeans", tee: "#c9322a", jeans: "#2d3d5a" },
    shoes: "#f2efe8", carry: null,
  },
  mechanic: {
    skin: S[0], height: 1.75, build: 1.1, age: "adult", hair: "bald", headwear: null,
    outfit: { kind: "shirt-trousers", shirt: "#5b6b3a", trousers: "#3a3530" },
    shoes: PAL.slipper, carry: null,
  },
};
