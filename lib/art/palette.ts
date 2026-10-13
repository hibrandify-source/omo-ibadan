// Omo Ibadan art kit — the realism palette.
//
// Colours are taken from what Ibadan actually looks like at street level:
// red laterite earth, rusted brown zinc, sun-faded plaster, dusty asphalt.
// Keep new art on these swatches so every scene matches.

export const PAL = {
  // ground
  laterite: "#9c5638",
  lateriteDark: "#7a4029",
  lateriteDust: "#bd7a52",
  dirtPath: "#a8704c",
  grass: "#6d7f3a",
  grassDry: "#9a924f",
  weed: "#5a6e2e",

  // roads
  asphalt: "#3d3b38",
  asphaltWorn: "#4d4a45",
  asphaltPatch: "#2e2c2a",
  asphaltCrack: "#24221f",
  laneWhite: "#d9d4c7",
  kerbYellow: "#d8b23a",
  concrete: "#b8b0a2",
  concreteDark: "#8e877b",
  gutterWater: "#3a3727",
  puddle: "#5b5a4c",

  // buildings
  zinc: "#8e8a82",
  zincNew: "#b9b8b2",
  rust: ["#7b3f22", "#93502a", "#a7612f", "#6a331f"],
  plaster: ["#e7dbc3", "#e2cdab", "#d8c7a4", "#cfd5cc", "#e5d1c0", "#d6c39b", "#c9cbb8"],
  block: "#9b968c",
  blockLine: "#827d73",
  fascia: "#5a3a24",
  wood: "#6b4428",
  woodDark: "#4a2d1a",
  steelBlue: "#3d5868",
  steelGreen: "#3f5e45",
  glass: "#2c383d",
  glassHi: "#6f8790",
  iron: "#1f1d1b",
  paintRed: "#a12a22",

  // nature
  tree: "#3c6630",
  treeDark: "#2c4d24",
  treeLight: "#55803d",
  palm: "#4f7a33",
  trunk: "#5b4330",

  // people
  skin: ["#3a2118", "#4a2b1f", "#5b3725", "#6c4430", "#80553a", "#93664a"],
  hair: "#141010",
  hairGrey: "#bfbab2",
  slipper: "#2a2523",

  // Oyo State commercial colours (brown + yellow, per the 2020 state directive)
  commBrown: "#5b3320",
  commYellow: "#e1b12c",
} as const;
