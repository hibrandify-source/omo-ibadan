// Omo Ibadan — the real city map, built from OpenStreetMap by
// scripts/osm/build-map.cjs. Coordinates are metres from a local origin
// (x east, y south). Map data © OpenStreetMap contributors, ODbL 1.0.

import RAW from "./ibadan.json";

export interface MapRoad {
  /** 0 motorway … 4 tertiary */
  c: number;
  /** index into roadNames, -1 if unnamed */
  n: number;
  /** flat [x0, y0, x1, y1, …] in metres */
  p: number[];
}

export interface MapDistrict {
  id: string;
  name: string;
  x: number;
  y: number;
  lat: number;
  lon: number;
  /** where the position came from; "UNVERIFIED…" when OSM had nothing */
  src: string;
}

export interface CityMapData {
  attribution: string;
  builtAt: string;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  roadClasses: string[];
  roadNames: string[];
  roads: MapRoad[];
  districts: MapDistrict[];
  landmarks: { name: string; x: number; y: number }[];
  roadKm: Record<string, number>;
  /** micra corridors: stops in order, road km per leg, real path for the mini-map */
  corridors: { id: string; name: string; stops: string[]; legKm: number[]; path: number[] }[];
}

export const CITY = RAW as CityMapData;

export const mapDistrict = (id: string): MapDistrict | undefined => CITY.districts.find((d) => d.id === id);

/** Road-network distance between two districts in km, or null if either isn't on the map. */
export function roadKm(a: string, b: string): number | null {
  if (a === b) return 0;
  const v = CITY.roadKm[`${a}|${b}`] ?? CITY.roadKm[`${b}|${a}`];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
