# City map data (OpenStreetMap)

`lib/map/ibadan.json` is generated from OpenStreetMap. Map data © OpenStreetMap
contributors, licensed under the [ODbL 1.0](https://opendatacommons.org/licenses/odbl/);
the in-game map shows the credit line, which the licence requires.

## Rebuild

```bash
mkdir -p scripts/osm/raw
for q in roads places districts extra; do
  curl -sS --max-time 240 -X POST \
    -H "User-Agent: omo-ibadan-mapbuild/0.1" -H "Accept: application/json" \
    --data-urlencode "data@scripts/osm/$q.overpassql" \
    https://overpass.kumi.systems/api/interpreter -o scripts/osm/raw/$q.json
done
node scripts/osm/build-map.cjs scripts/osm/raw
```

If an Overpass server answers with an HTML "too busy" page, try another mirror
(`overpass-api.de`, `overpass.private.coffee`).

## What the build does

- Projects coordinates to metres around 7.40° N, 3.90° E (x east, y south).
- Simplifies road polylines (motorway → tertiary) for drawing.
- Places each game district from a named landmark, a road end, or the median
  of OSM features carrying the district's name. Every district records its
  source; ones with no OSM data are marked `UNVERIFIED` and shown with "(?)".
- Computes the road-network distance between every pair of districts
  (Dijkstra on the full-resolution road graph). Fares and travel use these.

## Known gaps

- **Dr. Omololu Olunloyo Recreational Park** is not in OSM; it is placed in
  Alakia near Airport Road and shown with "(?)" until confirmed.
- **Agbeni market** is untagged; the district sits on Agbeni Road.

- **Oje** has no OSM data; its position is a placeholder east of Beere.
- **Mokola ↔ Dugbe** comes out at 4.3 km because the most direct link is a
  smaller road than the classes we fetch.
