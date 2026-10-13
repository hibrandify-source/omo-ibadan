"use client";

// The real Ibadan map, straight overhead (OpenStreetMap roads, district
// anchors and road distances from lib/map). Drag to pan, wheel/pinch or the
// buttons to zoom, tap a district to see the trip and travel.

import { useEffect, useMemo, useRef, useState } from "react";
import { CITY, mapDistrict, roadKm } from "@/lib/map/ibadan";
import { MAP_NODES } from "@/lib/game";

const ROAD_STYLE = [
  // motorway, trunk, primary, secondary, tertiary: [width m, min px, fill, casing]
  [24, 3.2, "#e49a4c", "#9c5a2c"],
  [20, 2.8, "#e9aa55", "#9c5a2c"],
  [15, 2.2, "#f3cf7a", "#b0875a"],
  [11, 1.6, "#f8e7bd", "#bba487"],
  [8, 1.0, "#fbf5ea", "#cdbca3"],
] as const;

const ZONE_COLOR: Record<string, string> = {
  academic: "#2f6fb5",
  heritage: "#a8432f",
  hustle: "#d39a1f",
  chill: "#2f7a4a",
};

interface View {
  cx: number; // world metres at canvas centre
  cy: number;
  ppm: number; // pixels per metre
}

export default function CityMap({
  current,
  fareFor,
  playable,
  onTravel,
}: {
  current: string;
  /** label for the trip from `current` to a district, e.g. "₦840 · micra" */
  fareFor: (id: string) => string;
  /** districts that have a walkable scene yet */
  playable: (id: string) => boolean;
  onTravel: (id: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const here = mapDistrict(current) ?? CITY.districts[0];
  const [view, setView] = useState<View>({ cx: here.x, cy: here.y, ppm: 0.06 });
  const [selected, setSelected] = useState<string | null>(null);
  const viewRef = useRef(view);
  viewRef.current = view;

  // re-centre when the player moves
  useEffect(() => {
    const d = mapDistrict(current);
    if (d) setView((v) => ({ ...v, cx: d.x, cy: d.y }));
    setSelected(null);
  }, [current]);

  const nodeInfo = useMemo(() => Object.fromEntries(MAP_NODES.map((n) => [n.id, n])), []);

  // ---- draw
  useEffect(() => {
    const cv = cvRef.current;
    const wrap = wrapRef.current;
    if (!cv || !wrap) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = wrap.clientWidth;
    const H = wrap.clientHeight;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    const ctx = cv.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const { cx, cy, ppm } = view;
    const sx = (x: number) => W / 2 + (x - cx) * ppm;
    const sy = (y: number) => H / 2 + (y - cy) * ppm;

    ctx.fillStyle = "#eadcc6";
    ctx.fillRect(0, 0, W, H);

    // roads: casings first, then fills, minor classes underneath
    for (const pass of ["casing", "fill"] as const) {
      for (let c = 4; c >= 0; c--) {
        const [wm, minPx, fillC, caseC] = ROAD_STYLE[c];
        const w = Math.max(minPx, wm * ppm);
        if (c === 4 && ppm < 0.025 && pass === "casing") continue;
        ctx.strokeStyle = pass === "casing" ? caseC : fillC;
        ctx.lineWidth = pass === "casing" ? w + 1.6 : w;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        for (const r of CITY.roads) {
          if (r.c !== c) continue;
          const p = r.p;
          ctx.moveTo(sx(p[0]), sy(p[1]));
          for (let i = 2; i < p.length; i += 2) ctx.lineTo(sx(p[i]), sy(p[i + 1]));
        }
        ctx.stroke();
      }
    }

    // main road names when zoomed in
    if (ppm > 0.09) {
      ctx.font = "700 11px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const done = new Set<number>();
      for (const r of CITY.roads) {
        if (r.c > 3 || r.n < 0 || done.has(r.n)) continue;
        // label the longest segment of the first way we meet with this name
        let best = 0, bx = 0, by = 0, ang = 0;
        for (let i = 2; i < r.p.length; i += 2) {
          const dx = r.p[i] - r.p[i - 2], dy = r.p[i + 1] - r.p[i - 1];
          const L = Math.hypot(dx, dy);
          if (L > best) { best = L; bx = (r.p[i] + r.p[i - 2]) / 2; by = (r.p[i + 1] + r.p[i - 1]) / 2; ang = Math.atan2(dy, dx); }
        }
        if (best * ppm < 90) continue;
        done.add(r.n);
        if (ang > Math.PI / 2) ang -= Math.PI;
        if (ang < -Math.PI / 2) ang += Math.PI;
        ctx.save();
        ctx.translate(sx(bx), sy(by));
        ctx.rotate(ang);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(255,250,240,0.9)";
        ctx.strokeText(CITY.roadNames[r.n], 0, 0);
        ctx.fillStyle = "#5a4330";
        ctx.fillText(CITY.roadNames[r.n], 0, 0);
        ctx.restore();
      }
    }

    // label placement: try right, left, above, below; skip if nothing fits
    const taken: [number, number, number, number][] = [];
    const fits = (x: number, y: number, w: number, h: number) =>
      !taken.some(([a, b, c, d]) => x < a + c && x + w > a && y < b + d && y + h > b);
    const place = (text: string, x: number, y: number, gap: number, font: string, must: boolean): [number, number] | null => {
      ctx.font = font;
      const w = ctx.measureText(text).width;
      const h = 13;
      const tries: [number, number][] = [[x + gap, y - h / 2], [x - gap - w, y - h / 2], [x - w / 2, y - gap - h], [x - w / 2, y + gap]];
      for (const [tx, ty] of tries) {
        if (fits(tx, ty, w, h)) { taken.push([tx, ty, w, h]); return [tx, ty + h / 2]; }
      }
      if (!must) return null;
      taken.push([tries[0][0], tries[0][1], w, h]);
      return [tries[0][0], y];
    };
    const halo = (text: string, at: [number, number], fillC: string, lw = 4) => {
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.lineWidth = lw;
      ctx.strokeStyle = "rgba(255,250,240,0.95)";
      ctx.strokeText(text, at[0], at[1]);
      ctx.fillStyle = fillC;
      ctx.fillText(text, at[0], at[1]);
    };

    // trip line to the selected district
    const sel = selected ? mapDistrict(selected) : null;
    if (sel && sel.id !== current) {
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = "rgba(28,25,23,0.75)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(sx(here.x), sy(here.y));
      ctx.lineTo(sx(sel.x), sy(sel.y));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // districts: pins first (current and selected last so they sit on top), then labels
    const visible = CITY.districts
      .filter((d) => {
        const x = sx(d.x), y = sy(d.y);
        return x > -60 && x < W + 60 && y > -30 && y < H + 30;
      })
      .sort((a, b) => Number(a.id === current || a.id === selected) - Number(b.id === current || b.id === selected));
    for (const d of visible) taken.push([sx(d.x) - 9, sy(d.y) - 9, 18, 18]);
    for (const d of visible) {
      const x = sx(d.x), y = sy(d.y);
      const zone = nodeInfo[d.id]?.zone ?? "hustle";
      const isHere = d.id === current;
      const isSel = d.id === selected;
      const unverified = d.src.startsWith("UNVERIFIED");
      const r = isHere ? 9 : isSel ? 8 : 6.5;
      if (isHere) {
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(245,197,24,0.35)";
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = playable(d.id) ? ZONE_COLOR[zone] : "#8f8273";
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isSel ? "#1c1917" : "#fffaf0";
      if (unverified) ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // labels: current and selected claim space first
    for (const d of [...visible].reverse()) {
      const isHere = d.id === current;
      const isSel = d.id === selected;
      const label = d.name + (d.src.startsWith("UNVERIFIED") ? " (?)" : "");
      const font = `${isHere || isSel ? 800 : 700} 12px system-ui, sans-serif`;
      const at = place(label, sx(d.x), sy(d.y), 12, font, isHere || isSel);
      if (at) halo(label, at, "#1c1917");
    }

    // landmarks, only where their names fit
    if (ppm > 0.05) {
      for (const l of CITY.landmarks) {
        const x = sx(l.x), y = sy(l.y);
        if (x < -40 || x > W + 40 || y < -20 || y > H + 20) continue;
        const font = "600 10px system-ui, sans-serif";
        const at = place(l.name, x, y, 7, font, false);
        if (!at) continue;
        ctx.fillStyle = "#5a4330";
        ctx.fillRect(x - 3, y - 3, 6, 6);
        halo(l.name, at, "#5a4330", 3);
      }
    }

    // attribution (required by the ODbL)
    ctx.font = "600 10px system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "rgba(28,25,23,0.65)";
    ctx.fillText("© OpenStreetMap contributors", W - 6, H - 4);
  }, [view, selected, current, here, nodeInfo, playable]);

  // ---- input: drag, wheel, pinch, tap
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const pts = new Map<number, { x: number; y: number }>();
    let moved = 0;
    let pinch0 = 0;
    const zoomAt = (factor: number, px: number, py: number) => {
      const v = viewRef.current;
      const r = cv.getBoundingClientRect();
      const ppm = Math.max(0.012, Math.min(0.6, v.ppm * factor));
      // keep the world point under the cursor fixed
      const wx = v.cx + (px - r.width / 2) / v.ppm;
      const wy = v.cy + (py - r.height / 2) / v.ppm;
      setView({ ppm, cx: wx - (px - r.width / 2) / ppm, cy: wy - (py - r.height / 2) / ppm });
    };
    const down = (e: PointerEvent) => {
      cv.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      moved = 0;
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        pinch0 = Math.hypot(a.x - b.x, a.y - b.y);
      }
    };
    const move = (e: PointerEvent) => {
      const prev = pts.get(e.pointerId);
      if (!prev) return;
      const now = { x: e.clientX, y: e.clientY };
      if (pts.size === 1) {
        const v = viewRef.current;
        moved += Math.abs(now.x - prev.x) + Math.abs(now.y - prev.y);
        setView({ ...v, cx: v.cx - (now.x - prev.x) / v.ppm, cy: v.cy - (now.y - prev.y) / v.ppm });
      }
      pts.set(e.pointerId, now);
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const r = cv.getBoundingClientRect();
        if (pinch0 > 0) zoomAt(d / pinch0, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
        pinch0 = d;
        moved = 99;
      }
    };
    const up = (e: PointerEvent) => {
      const was = pts.size;
      pts.delete(e.pointerId);
      if (was === 1 && moved < 6) {
        // tap: nearest district within 26 px
        const r = cv.getBoundingClientRect();
        const v = viewRef.current;
        const px = e.clientX - r.left, py = e.clientY - r.top;
        let best: string | null = null;
        let bd = 26;
        for (const d of CITY.districts) {
          const x = r.width / 2 + (d.x - v.cx) * v.ppm;
          const y = r.height / 2 + (d.y - v.cy) * v.ppm;
          const dd = Math.hypot(x - px, y - py);
          if (dd < bd) { bd = dd; best = d.id; }
        }
        setSelected(best);
      }
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = cv.getBoundingClientRect();
      zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top);
    };
    cv.addEventListener("pointerdown", down);
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerup", up);
    cv.addEventListener("pointercancel", up);
    cv.addEventListener("wheel", wheel, { passive: false });
    return () => {
      cv.removeEventListener("pointerdown", down);
      cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerup", up);
      cv.removeEventListener("pointercancel", up);
      cv.removeEventListener("wheel", wheel);
    };
  }, []);

  const sel = selected ? mapDistrict(selected) : null;
  const selNode = selected ? nodeInfo[selected] : null;
  const km = sel ? roadKm(current, sel.id) : null;
  const zoomBtn = (f: number, label: string, aria: string) => (
    <button
      aria-label={aria}
      onClick={() => {
        const r = cvRef.current?.getBoundingClientRect();
        if (!r) return;
        const v = viewRef.current;
        setView({ ...v, ppm: Math.max(0.012, Math.min(0.6, v.ppm * f)) });
      }}
      className="h-9 w-9 rounded-full bg-white text-lg font-bold text-charcoal shadow ring-1 ring-roof/20"
    >
      {label}
    </button>
  );

  return (
    <div>
      <div ref={wrapRef} className="relative h-[420px] overflow-hidden rounded-2xl ring-1 ring-roof/20 sm:h-[480px]">
        <canvas ref={cvRef} className="block h-full w-full touch-none" aria-label="Map of Ibadan" role="img" />
        <div className="absolute right-2 top-2 flex flex-col gap-1.5">
          {zoomBtn(1.4, "+", "Zoom in")}
          {zoomBtn(1 / 1.4, "−", "Zoom out")}
          <button
            aria-label="Centre on me"
            onClick={() => setView((v) => ({ ...v, cx: here.x, cy: here.y }))}
            className="h-9 w-9 rounded-full bg-white text-sm shadow ring-1 ring-roof/20"
          >
            📍
          </button>
        </div>
      </div>

      {sel ? (
        <div className="mt-3 rounded-2xl bg-cream p-3.5 ring-1 ring-roof/15">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-display text-base font-extrabold">{sel.name}</div>
              {selNode && <div className="text-xs text-charcoal/65">{selNode.blurb}</div>}
            </div>
            <button onClick={() => setSelected(null)} aria-label="Close" className="text-charcoal/50">✕</button>
          </div>
          {sel.id === current ? (
            <p className="mt-2 text-sm font-semibold">📍 You are here.</p>
          ) : (
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold ring-1 ring-roof/15">
                {km != null ? `${km} km by road` : "distance unknown"}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold ring-1 ring-roof/15">{fareFor(sel.id)}</span>
              <button
                onClick={() => onTravel(sel.id)}
                className="ml-auto rounded-full bg-charcoal px-4 py-2 text-sm font-extrabold text-cream"
              >
                Go to {sel.name} →
              </button>
            </div>
          )}
          {!playable(sel.id) && <p className="mt-2 text-xs text-charcoal/60">Street scene for {sel.name} is being built. You can travel there; the full street opens in this update.</p>}
          {sel.src.startsWith("UNVERIFIED") && <p className="mt-1 text-xs font-semibold text-roof">Position not confirmed from map data yet.</p>}
        </div>
      ) : (
        <p className="mt-2 text-xs text-charcoal/55">Tap a district to see the trip. Drag to move, pinch or use + / − to zoom.</p>
      )}
    </div>
  );
}
