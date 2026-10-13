// Build lib/map/ibadan.json from OpenStreetMap extracts.
//
//   node scripts/osm/build-map.cjs <raw-dir>
//
// <raw-dir> holds roads.json, places.json and districts.json, fetched with the
// .overpassql queries next to this script (see scripts/osm/README.md).
// Output: simplified road polylines in local metres, district anchors with
// where each came from, landmarks, and road-network distances between every
// pair of districts.
//
// Map data © OpenStreetMap contributors, ODbL 1.0.

const fs = require("fs");
const path = require("path");

const rawDir = process.argv[2];
if (!rawDir) {
  console.error("usage: node scripts/osm/build-map.cjs <raw-dir>");
  process.exit(1);
}
const load = (f) => JSON.parse(fs.readFileSync(path.join(rawDir, f), "utf8")).elements;
const roads = load("roads.json");
const places = load("places.json");
const named = load("districts.json");

// ---- projection: metres from a local origin, x east, y south (screen-style)
const LAT0 = 7.4;
const LON0 = 3.9;
const MX = 111320 * Math.cos((LAT0 * Math.PI) / 180);
const MY = 110574;
const proj = (lat, lon) => [Math.round((lon - LON0) * MX), Math.round(-(lat - LAT0) * MY)];

// ---- district anchors. Each says where its position came from.
const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
function cluster(re) {
  const pts = named
    .filter((e) => e.tags && e.tags.name && re.test(e.tags.name) && (!e.tags.highway || e.tags.highway === "bus_stop"))
    .map((e) => e.center || e);
  if (!pts.length) return null;
  return { lat: median(pts.map((p) => p.lat)), lon: median(pts.map((p) => p.lon)), n: pts.length };
}
function landmark(name) {
  const e = places.find((x) => x.tags && x.tags.name === name);
  return e ? e.center || e : null;
}
function roadEnd(name, which) {
  const pts = roads.filter((w) => w.tags.name === name).flatMap((w) => w.geometry);
  if (!pts.length) return null;
  return pts.reduce((a, b) => (which === "north" ? (b.lat > a.lat ? b : a) : b.lat < a.lat ? b : a));
}
function nearestOnRoad(roadName, to) {
  const pts = roads.filter((w) => w.tags.name === roadName).flatMap((w) => w.geometry);
  return pts.reduce((a, b) => (Math.hypot(b.lat - to.lat, b.lon - to.lon) < Math.hypot(a.lat - to.lat, a.lon - to.lon) ? b : a));
}

const ui = landmark("University of Ibadan");
const D = [
  // id, game name, how we locate it
  ["ui-gate", "UI Gate / Agbowo", () => ({ ...nearestOnRoad("Oyo Road", ui), src: "osm: Oyo Road point nearest the UI campus" })],
  ["agbowo", "Agbowo", () => ({ ...cluster(/agbowo/i), src: "osm: Agbowo-named features" })],
  ["bodija", "Bodija Market", () => ({ ...landmark("Bodija Market"), src: "osm: Bodija Market" })],
  ["old-bodija", "Old Bodija", () => ({ ...landmark("Old Bodija"), src: "osm: Old Bodija neighbourhood" })],
  ["samonda", "Samonda", () => ({ ...cluster(/samonda/i), src: "osm: Samonda-named features" })],
  ["sango", "Sango / Poly", () => ({ ...cluster(/sango/i), src: "osm: Sango-named features (Polytechnic Ibadan nearby)" })],
  ["ojoo", "Ojoo", () => ({ ...roadEnd("Ibadan-Ilorin Expressway", "south"), src: "osm: south end of the Ibadan–Ilorin Expressway" })],
  ["moniya", "Moniya", () => ({ ...cluster(/moniya/i), src: "osm: Moniya-named features" })],
  ["akobo", "Akobo", () => ({ ...cluster(/akobo/i), src: "osm: Akobo-named features" })],
  ["mokola", "Mokola", () => ({ ...cluster(/mokola/i), src: "osm: Mokola-named features" })],
  ["agodi", "Agodi Gardens", () => ({ ...landmark("Agodi Gardens"), src: "osm: Agodi Gardens" })],
  ["dugbe", "Dugbe / Cocoa House", () => ({ ...landmark("Cocoa House"), src: "osm: Cocoa House" })],
  ["jericho", "Jericho", () => ({ ...cluster(/jericho/i), src: "osm: Jericho-named features" })],
  ["eleyele", "Eleyele", () => ({ ...cluster(/eleyele/i), src: "osm: Eleyele-named features" })],
  ["mapo", "Mapo Hall", () => ({ ...landmark("Mapo Hall"), src: "osm: Mapo Hall" })],
  ["oja-oba", "Oja'ba", () => ({ ...landmark("Oja Oba Market"), src: "osm: Oja Oba Market" })],
  ["beere", "Beere", () => {
    const r = roads.find((w) => w.tags.name === "Beere Roundabout");
    const g = r.geometry;
    return { lat: g.reduce((s, p) => s + p.lat, 0) / g.length, lon: g.reduce((s, p) => s + p.lon, 0) / g.length, src: "osm: Beere Roundabout" };
  }],
  ["oje", "Oje Market", () => ({ lat: 7.3885, lon: 3.9075, src: "UNVERIFIED: no OSM data for Oje; placed east of Beere, confirm locally" })],
  ["molete", "Molete", () => ({ ...cluster(/molete/i), src: "osm: Molete-named features" })],
  ["challenge", "Challenge", () => ({ ...roadEnd("Challenge Road", "north"), src: "osm: north end of Challenge Road (Ring Road junction)" })],
  ["ring-road", "Ring Road / Palms", () => ({ ...landmark("Palms Shopping Mall"), src: "osm: Palms Shopping Mall" })],
  ["iwo-road", "Iwo Road", () => ({ ...roadEnd("Iwo Road", "south"), src: "osm: west end of Iwo Road (interchange)" })],
];

const districts = D.map(([id, name, f]) => {
  const p = f();
  if (p.lat == null) throw new Error("no position for " + id);
  const [x, y] = proj(p.lat, p.lon);
  return { id, name, x, y, lat: +p.lat.toFixed(5), lon: +p.lon.toFixed(5), src: p.src };
});

// ---- road graph on the full-resolution geometry (shared vertices = junctions)
const CLASS = { motorway: 0, trunk: 1, primary: 2, secondary: 3, tertiary: 4, motorway_link: 0, trunk_link: 1, primary_link: 2 };
const key = (p) => `${p.lat.toFixed(7)},${p.lon.toFixed(7)}`;
const nodes = new Map(); // key -> {lat, lon, adj: Map(key -> metres)}
const metres = (a, b) => Math.hypot((a.lon - b.lon) * MX, (a.lat - b.lat) * MY);
for (const w of roads) {
  const g = w.geometry;
  for (let i = 0; i < g.length; i++) {
    const k = key(g[i]);
    if (!nodes.has(k)) nodes.set(k, { lat: g[i].lat, lon: g[i].lon, adj: new Map() });
    if (i > 0) {
      const a = nodes.get(key(g[i - 1]));
      const b = nodes.get(k);
      const d = metres(a, b);
      a.adj.set(k, d);
      if (w.tags.oneway !== "yes") b.adj.set(key(g[i - 1]), d);
      else b.adj.set(key(g[i - 1]), d * 1.15); // allow it, slightly penalised: game micras don't care about one-ways
    }
  }
}

// largest connected component only, so every district can reach every other
const keys = [...nodes.keys()];
const comp = new Map();
let best = null;
for (const k of keys) {
  if (comp.has(k)) continue;
  const id = comp.size;
  const stack = [k];
  const members = [];
  comp.set(k, id);
  while (stack.length) {
    const c = stack.pop();
    members.push(c);
    for (const n of nodes.get(c).adj.keys()) if (!comp.has(n)) { comp.set(n, id); stack.push(n); }
  }
  if (!best || members.length > best.length) best = members;
}
const main = new Set(best);

function snap(d) {
  let bk = null;
  let bd = Infinity;
  for (const k of main) {
    const n = nodes.get(k);
    const dd = metres(n, d);
    if (dd < bd) { bd = dd; bk = k; }
  }
  return { k: bk, off: bd };
}

function dijkstra(src) {
  return dijkstraFull(src).dist;
}

function dijkstraFull(src) {
  const dist = new Map([[src, 0]]);
  const prev = new Map();
  const done = new Set();
  // simple binary heap
  const heap = [[0, src]];
  const push = (it) => {
    heap.push(it);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };
  while (heap.length) {
    const [d, k] = pop();
    if (done.has(k)) continue;
    done.add(k);
    for (const [n, w] of nodes.get(k).adj) {
      const nd = d + w;
      if (nd < (dist.get(n) ?? Infinity)) { dist.set(n, nd); prev.set(n, k); push([nd, n]); }
    }
  }
  return { dist, prev };
}

const snaps = districts.map((d) => snap(d));

// ---- micra corridors: real road paths through a chain of stops
const CORRIDORS = [
  { id: "mokola-iwo", name: "Mokola → Dugbe → Challenge → Iwo Road", stops: ["mokola", "dugbe", "challenge", "iwo-road"] },
  { id: "ui-beere", name: "UI Gate → Bodija → Agodi → Beere", stops: ["ui-gate", "bodija", "agodi", "beere"] },
];
function shortestPath(fromKey, toKey) {
  const { dist, prev } = dijkstraFull(fromKey);
  const path = [];
  for (let k = toKey; k; k = prev.get(k)) path.unshift(nodes.get(k));
  return { metres: dist.get(toKey), path };
}
const corridors = CORRIDORS.map((c) => {
  const idx = c.stops.map((id) => districts.findIndex((d) => d.id === id));
  const legs = [];
  let pts = [];
  for (let i = 0; i < idx.length - 1; i++) {
    const { metres, path } = shortestPath(snaps[idx[i]].k, snaps[idx[i + 1]].k);
    legs.push(Math.round(metres / 100) / 10);
    pts = pts.concat(path.map((p) => proj(p.lat, p.lon)));
  }
  return { id: c.id, name: c.name, stops: c.stops, legKm: legs, path: simplifyPts(pts, 15).flat() };
});
function simplifyPts(pts, tol) {
  return simplify(pts, tol);
}

const roadKm = {};
districts.forEach((a, i) => {
  const dist = dijkstra(snaps[i].k);
  districts.forEach((b, j) => {
    if (j <= i) return;
    const m = (dist.get(snaps[j].k) ?? NaN) + snaps[i].off + snaps[j].off;
    roadKm[`${a.id}|${b.id}`] = Math.round(m / 100) / 10;
  });
});

// ---- simplified polylines for drawing (Douglas–Peucker in metres)
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const [ax, ay] = pts[0];
  const [bx, by] = pts[pts.length - 1];
  let idx = 0;
  let dmax = 0;
  const L = Math.hypot(bx - ax, by - ay) || 1;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i];
    const d = Math.abs((by - ay) * px - (bx - ax) * py + bx * ay - by * ax) / L;
    if (d > dmax) { dmax = d; idx = i; }
  }
  if (dmax <= tol) return [pts[0], pts[pts.length - 1]];
  return [...simplify(pts.slice(0, idx + 1), tol).slice(0, -1), ...simplify(pts.slice(idx), tol)];
}
const names = [];
const nameIdx = (n) => {
  if (!n) return -1;
  let i = names.indexOf(n);
  if (i < 0) { names.push(n); i = names.length - 1; }
  return i;
};
const roadOut = roads.map((w) => {
  const cls = CLASS[w.tags.highway] ?? 4;
  const pts = simplify(w.geometry.map((p) => proj(p.lat, p.lon)), cls <= 2 ? 6 : 10);
  return { c: cls, n: nameIdx(w.tags.name), p: pts.flat() };
});

const LANDMARKS = ["Cocoa House", "Mapo Hall", "Oja Oba Market", "Agodi Gardens", "University College Hospital (UCH)", "The Polytechnic Ibadan", "Liberty Stadium", "Lekan Salami Stadium", "Palms Shopping Mall", "Gbagi New International Market", "Eleyele Reservoir", "Bodija Market"];
const landmarks = LANDMARKS.map((n) => {
  const p = landmark(n);
  if (!p) return null;
  const [x, y] = proj(p.lat, p.lon);
  return { name: n, x, y };
}).filter(Boolean);
landmarks.push({ name: "University of Ibadan", ...Object.fromEntries(proj(ui.lat, ui.lon).map((v, i) => [i ? "y" : "x", v])) });

const allX = roadOut.flatMap((r) => r.p.filter((_, i) => i % 2 === 0));
const allY = roadOut.flatMap((r) => r.p.filter((_, i) => i % 2 === 1));
const out = {
  attribution: "Map data © OpenStreetMap contributors, ODbL 1.0",
  builtAt: new Date().toISOString().slice(0, 10),
  origin: { lat: LAT0, lon: LON0 },
  bounds: { minX: Math.min(...allX), maxX: Math.max(...allX), minY: Math.min(...allY), maxY: Math.max(...allY) },
  roadClasses: ["motorway", "trunk", "primary", "secondary", "tertiary"],
  roadNames: names,
  roads: roadOut,
  districts,
  landmarks,
  roadKm,
  corridors,
};
const outPath = path.join(__dirname, "..", "..", "lib", "map", "ibadan.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out));
console.log(`wrote ${outPath}: ${(fs.statSync(outPath).size / 1024).toFixed(0)} KB, ${roadOut.length} roads, ${districts.length} districts, graph ${main.size}/${nodes.size} nodes`);
for (const [i, d] of districts.entries()) console.log(d.id.padEnd(10), `snap ${Math.round(snaps[i].off)} m`, d.src);
