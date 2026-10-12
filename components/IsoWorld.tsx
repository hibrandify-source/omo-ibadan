"use client";

import { useEffect, useRef, useState } from "react";
import { GRID_W, GRID_H, ZONES, GHOSTS, ROADS, CROWDS, TRAFFIC, SKINS, CLOTHS, CROWD_CAP_SAVER, TRAFFIC_CAP_SAVER, DOORS, houseSpots, buildBlockers, zoneCenter, type Door } from "@/lib/world";
import { project, footprint, drawBox, inPoly, hash01, type Cam } from "@/lib/iso";
import type { Rider } from "@/lib/useRiders";

type Phase = "day" | "amber" | "night";

const SKY: Record<Phase, [string, string]> = {
  day: ["#9fc3d8", "#dfe9d8"],
  amber: ["#7A4A2B", "#F5D9A8"],
  night: ["#0b0e1d", "#232c4e"],
};

const TINT: Record<Phase, string> = {
  day: "rgba(255,255,255,0)",
  amber: "rgba(232,160,32,0.10)",
  night: "rgba(8,10,30,0.42)",
};

const ROOF_TOPS = ["#8a4f30", "#7A4A2B", "#96603a", "#83502e"];
const BLOCKERS = buildBlockers();
const PLAYER_SPEED = 6.5; // tiles/sec

export interface Teleport {
  x: number;
  y: number;
  key: number;
}

interface GhostState {
  x: number;
  y: number;
  leg: number;
  dwell: number;
  walk: number;
  stuck: number;
}

export interface IsoWorldProps {
  active: string;
  onSelect: (id: string) => void;
  playerName: string;
  playerTitle: string;
  avatarColor: string;
  homeZone: string;
  teleport: Teleport | null;
  onZoneEnter: (id: string) => void;
  onDoor: (door: Door | null) => void;
  saver: boolean;
  onSaver: (v: boolean) => void;
  stageClass?: string;
  fem: boolean;
  weather: "clear" | "rain";
  net: { ref: React.MutableRefObject<Map<string, Rider>>; version: number };
  playerSkin: string;
  playerGear: "fila" | "gele" | "none" | "braids" | "afro";
}

export default function IsoWorld({
  active,
  onSelect,
  playerName,
  playerTitle,
  avatarColor,
  homeZone,
  teleport,
  onZoneEnter,
  onDoor,
  saver,
  onSaver,
  stageClass,
  fem,
  weather,
  net,
  playerSkin,
  playerGear,
}: IsoWorldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const camRef = useRef<Cam>({ panX: 0, panY: -10, scale: 0.9 });
  const polysRef = useRef<{ id: string; poly: { x: number; y: number }[]; depth: number }[]>([]);
  const lightsRef = useRef<{ x: number; y: number }[]>([]);
  const avatarRef = useRef({ x: 4.5, y: 5, tx: null as number | null, ty: null as number | null, walk: 0, moving: false });
  const keysRef = useRef<Set<string>>(new Set());
  const joyRef = useRef({ x: 0, y: 0, on: false });
  const ghostsRef = useRef<GhostState[]>(GHOSTS.map((g) => ({ x: g.pts[0][0], y: g.pts[0][1], leg: 0, dwell: 2, walk: 0, stuck: 0 })));
  interface CrowdPerson { x: number; y: number; tx: number; ty: number; walk: number; moving: boolean; pause: number; speed: number; skin: number; cloth: number; gear: number; hf: number; stuck: number }
  const crowdRef = useRef<CrowdPerson[]>([]);
  const trafficRef = useRef(TRAFFIC.map((v) => ({ ...v })));
  // deterministic crowd init (positions inside their zones)
  if (crowdRef.current.length === 0) {
    let ci = 0;
    for (const spec of CROWDS) {
      const z = ZONES.find((zz) => zz.id === spec.zone);
      if (!z) continue;
      for (let k = 0; k < spec.count; k++, ci++) {
        const px = z.gx + 0.5 + hash01("crowd", ci * 3 + 1) * Math.max(0.5, z.w - 1);
        const py = z.gy + 0.5 + hash01("crowd", ci * 3 + 2) * Math.max(0.5, z.d - 1);
        crowdRef.current.push({
          x: px, y: py, tx: px, ty: py, walk: hash01("crowd", ci) * 6, moving: false, pause: hash01("crowd", ci * 5) * 5,
          speed: 0.8 + hash01("crowd", ci * 11) * 1.0,
          skin: Math.floor(hash01("crowd", ci * 13) * SKINS.length) % SKINS.length,
          cloth: Math.floor(hash01("crowd", ci * 17) * CLOTHS.length) % CLOTHS.length,
          gear: Math.floor(hash01("crowd", ci * 19) * 4),
          hf: 0.9 + hash01("crowd", ci * 23) * 0.2,
          stuck: 0,
        });
      }
    }
  }
  const zoneRef = useRef<string>("");
  const followRef = useRef(true);
  const lastDragRef = useRef(0);
  const [phase, setPhase] = useState<Phase>("amber");
  const [auto, setAuto] = useState(true);
  const [follow, setFollow] = useState(true);
  const [joy, setJoy] = useState({ x: 0, y: 0, on: false });
  const phaseRef = useRef<Phase>("amber");
  phaseRef.current = phase;
  const cbRef = useRef(onZoneEnter);
  cbRef.current = onZoneEnter;
  const doorCb = useRef(onDoor);
  doorCb.current = onDoor;
  const doorRef = useRef<string | null>(null);
  const dragRef = useRef<{ sx: number; sy: number; px: number; py: number; moved: boolean } | null>(null);
  const activeMirror = useRef(active);
  activeMirror.current = active;
  const weatherMirror = useRef(weather);
  weatherMirror.current = weather;
  const meMirror = useRef({ playerName, playerTitle, avatarColor, homeZone, fem, playerSkin, playerGear });
  meMirror.current = { playerName, playerTitle, avatarColor, homeZone, fem, playerSkin, playerGear };

  const reduced =
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // teleport (Go home button)
  useEffect(() => {
    if (!teleport) return;
    const a = avatarRef.current;
    a.x = teleport.x;
    a.y = teleport.y;
    a.tx = null;
    a.ty = null;
    followRef.current = true;
    setFollow(true);
  }, [teleport?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  // keyboard walk (ignored while typing)
  useEffect(() => {
    const dn = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      keysRef.current.add(e.key.toLowerCase());
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", dn);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // auto light cycle (paused in saver / reduced-motion)
  useEffect(() => {
    if (!auto || saver || reduced) return;
    const order: Phase[] = ["day", "amber", "night"];
    const t = setInterval(() => {
      setPhase((p) => order[(order.indexOf(p) + 1) % order.length]);
    }, 40000);
    return () => clearInterval(t);
  }, [auto, saver, reduced]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let running = true;
    let W = 0;
    let H = 0;
    let last = performance.now();

    const resize = () => {
      const r = wrapRef.current!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, saver ? 1 : 1.5);
      W = Math.max(280, r.width);
      H = wrapRef.current!.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapRef.current!);

    const onVis = () => {
      running = !document.hidden;
      last = performance.now();
      if (running) loop();
    };
    document.addEventListener("visibilitychange", onVis);

    const collide = (p: { x: number; y: number }) => {
      p.x = Math.max(-1.5, Math.min(GRID_W + 1.5, p.x));
      p.y = Math.max(-1.5, Math.min(GRID_H + 1.5, p.y));
      const r = 0.28;
      for (const b of BLOCKERS) {
        const nx = Math.max(b.x, Math.min(b.x + b.w, p.x));
        const ny = Math.max(b.y, Math.min(b.y + b.d, p.y));
        const dx = p.x - nx;
        const dy = p.y - ny;
        const d2 = dx * dx + dy * dy;
        if (d2 < r * r) {
          if (d2 > 0.0001) {
            const d = Math.sqrt(d2);
            p.x = nx + (dx / d) * r;
            p.y = ny + (dy / d) * r;
          } else {
            p.y = b.y + b.d + r;
          }
        }
      }
    };

    const zoneAt = (x: number, y: number): string => {
      for (const z of ZONES) {
        if (x >= z.gx && x <= z.gx + z.w && y >= z.gy && y <= z.gy + z.d) return z.id;
      }
      return "";
    };

    const drawPerson = (
      sx: number, sy: number, s: number,
      color: string, skin: string,
      tag: string | null, sub: string | null,
      walk: number, moving: boolean, dim: boolean, gear: "fila" | "gele" | "none" | "braids" | "afro"
    ) => {
      ctx.globalAlpha = dim ? 0.55 : 1;
      // shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(sx, sy, 7 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      const bob = moving && !reduced ? Math.abs(Math.sin(walk)) * 1.6 * s : 0;
      const step = moving && !reduced ? Math.sin(walk) * 3 * s : 0;
      // legs
      ctx.strokeStyle = "#241a12";
      ctx.lineWidth = Math.max(1.5, 2.6 * s);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(sx - 2.4 * s, sy - 8 * s - bob);
      ctx.lineTo(sx - 2.4 * s + step, sy);
      ctx.moveTo(sx + 2.4 * s, sy - 8 * s - bob);
      ctx.lineTo(sx + 2.4 * s - step, sy);
      ctx.stroke();
      // agbada body
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(sx - 5.5 * s, sy - 8 * s - bob);
      ctx.lineTo(sx + 5.5 * s, sy - 8 * s - bob);
      ctx.lineTo(sx + 4 * s, sy - 19 * s - bob);
      ctx.lineTo(sx - 4 * s, sy - 19 * s - bob);
      ctx.closePath();
      ctx.fill();
      // head + fila cap, gele wrap, or hair
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.arc(sx, sy - 23 * s - bob, 4.4 * s, 0, Math.PI * 2);
      ctx.fill();
      if (gear === "gele") {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(sx, sy - 24.5 * s - bob, 5.4 * s, 3.4 * s, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx + 4.6 * s, sy - 25.5 * s - bob, 1.6 * s, 0, Math.PI * 2);
        ctx.fill();
      } else if (gear === "fila") {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(sx, sy - 24.5 * s - bob, 4.4 * s, Math.PI, Math.PI * 2);
        ctx.fill();
      } else if (gear === "braids") {
        ctx.strokeStyle = "#14100c";
        ctx.lineWidth = Math.max(1.2, 2 * s);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(sx - 2.6 * s, sy - 26 * s - bob);
        ctx.lineTo(sx - 3.4 * s, sy - 16 * s - bob);
        ctx.moveTo(sx, sy - 26.5 * s - bob);
        ctx.lineTo(sx, sy - 15.5 * s - bob);
        ctx.moveTo(sx + 2.6 * s, sy - 26 * s - bob);
        ctx.lineTo(sx + 3.4 * s, sy - 16 * s - bob);
        ctx.stroke();
      } else if (gear === "afro") {
        ctx.fillStyle = "#14100c";
        ctx.beginPath();
        ctx.arc(sx, sy - 26 * s - bob, 6.4 * s, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = "#14100c";
        ctx.beginPath();
        ctx.arc(sx, sy - 24 * s - bob, 4.7 * s, Math.PI * 0.95, Math.PI * 2.05);
        ctx.fill();
      }
      if (tag) {
        ctx.font = `700 ${Math.max(9, 10 * s)}px Sora, sans-serif`;
        ctx.textAlign = "center";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(20,14,10,0.8)";
        ctx.strokeText(tag, sx, sy - 32 * s - bob);
        ctx.fillStyle = "#FAF6F0";
        ctx.fillText(tag, sx, sy - 32 * s - bob);
        if (sub) {
          ctx.font = `600 ${Math.max(8, 8.5 * s)}px Sora, sans-serif`;
          ctx.strokeText(sub, sx, sy - 22 * s - bob);
          ctx.fillStyle = "#E8A020";
          ctx.fillText(sub, sx, sy - 22 * s - bob);
        }
      }
      ctx.globalAlpha = 1;
    };

    const drawHouse = (
      spot: { gx: number; gy: number; w: number; d: number; h: number; roof: number },
      cx: number, cy: number, cam: Cam, night: boolean
    ) => {
      const top = ROOF_TOPS[spot.roof % ROOF_TOPS.length];
      drawBox(ctx, spot.gx, spot.gy, spot.w, spot.d, spot.h, { top, left: "#E4D6BE", right: "#C9B795" }, cam, cx, cy);
      if (night) {
        const p = project(spot.gx + spot.w / 2, spot.gy + spot.d + 0.05, cam, cx, cy);
        lightsRef.current.push({ x: p.x - 6 * cam.scale, y: p.y - spot.h * cam.scale * 0.45 });
        lightsRef.current.push({ x: p.x + 6 * cam.scale, y: p.y - spot.h * cam.scale * 0.45 });
      }
    };

    const drawTrees = (gx: number, gy: number, cx: number, cy: number, cam: Cam) => {
      for (let i = 0; i < 6; i++) {
        const tx = gx + 0.8 + hash01("agodi", i * 2 + 1) * 4.4;
        const ty = gy + 0.8 + hash01("agodi", i * 2 + 2) * 3.4;
        const p = project(tx, ty, cam, cx, cy);
        const s = cam.scale;
        ctx.strokeStyle = "#4a2e1c";
        ctx.lineWidth = Math.max(1.5, 3 * s);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y - 14 * s);
        ctx.stroke();
        ctx.fillStyle = i % 2 ? "#1F7A4D" : "#2c945f";
        ctx.beginPath();
        ctx.arc(p.x, p.y - 18 * s, 8 * s, 0, Math.PI * 2);
        ctx.arc(p.x - 6 * s, p.y - 13 * s, 5.5 * s, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawStalls = (gx: number, gy: number, cx: number, cy: number, cam: Cam) => {
      for (let r = 0; r < 2; r++) {
        for (let k = 0; k < 3; k++) {
          const sx = gx + 0.6 + k * 1.25;
          const sy = gy + 0.7 + r * 1.4;
          drawBox(ctx, sx, sy, 1, 1, 6, { top: "#F2EDE4", left: "#C9B795", right: "#B3A181" }, cam, cx, cy);
          const c = project(sx + 1, sy, cam, cx, cy);
          const l = project(sx, sy, cam, cx, cy);
          const bk = project(sx + 1, sy + 1, cam, cx, cy);
          const f = project(sx, sy + 1, cam, cx, cy);
          const topY = -6 * cam.scale;
          for (let sIdx = 0; sIdx < 4; sIdx++) {
            const t0 = sIdx / 4;
            const t1 = (sIdx + 1) / 4;
            const ax = (u: number, v: { x: number; y: number }, w2: { x: number; y: number }) => ({
              x: u * (v.x - w2.x) + w2.x,
              y: u * (v.y - w2.y) + w2.y,
            });
            ctx.fillStyle = (sIdx + r + k) % 2 ? "#B33A3A" : "#F2EDE4";
            ctx.beginPath();
            const pA = ax(t0, l, f);
            const pB = ax(t0, c, bk);
            const pC = ax(t1, c, bk);
            const pD = ax(t1, l, f);
            ctx.moveTo(pA.x, pA.y + topY);
            ctx.lineTo(pB.x, pB.y + topY);
            ctx.lineTo(pC.x, pC.y + topY);
            ctx.lineTo(pD.x, pD.y + topY);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
    };

    const drawZone = (z: (typeof ZONES)[number], cx: number, cy: number, cam: Cam, night: boolean) => {
      ctx.fillStyle = z.ground;
      const poly = footprint(ctx, z.gx, z.gy, z.w, z.d, cam, cx, cy);
      ctx.fill();
      polysRef.current.push({ id: z.id, poly, depth: z.gx + z.gy });

      if (z.landmark === "houses" || z.landmark === "gate") {
        for (const spot of houseSpots(z.id)) drawHouse(spot, cx, cy, cam, night);
      }
      if (z.landmark === "stalls") drawStalls(z.gx, z.gy, cx, cy, cam);
      if (z.landmark === "trees") drawTrees(z.gx, z.gy, cx, cy, cam);

      if (z.landmark === "tower") {
        const c = zoneCenter(z);
        drawBox(ctx, c.x - 0.7, c.y - 0.7, 1.4, 1.4, 62, { top: "#8a6a42", left: "#6b4a2e", right: "#54401f" }, cam, cx, cy);
        ctx.fillStyle = night || phaseRef.current === "amber" ? "#FFE9B8" : "#3a2c1c";
        for (let f = 0; f < 6; f++) {
          for (let ww = 0; ww < 2; ww++) {
            const p = project(c.x - 0.3 + ww * 0.6, c.y + 0.75, cam, cx, cy);
            ctx.fillRect(p.x - 2, p.y - (58 - f * 8) * cam.scale, 4, 5);
          }
        }
        drawBox(ctx, c.x - 0.9, c.y - 0.9, 1.8, 1.8, 4, { top: "#2b1a12", left: "#2b1a12", right: "#2b1a12" }, cam, cx, cy);
      }

      if (z.landmark === "hall") {
        const c = zoneCenter(z);
        ctx.fillStyle = "#5a4128";
        footprint(ctx, c.x - 2.6, c.y - 2.2, 5.2, 4.4, cam, cx, cy);
        ctx.fill();
        drawBox(ctx, c.x - 1.7, c.y - 1.4, 3.4, 2.8, 7, { top: "#EDE3D2", left: "#C9B795", right: "#B3A181" }, cam, cx, cy);
        const e = project(c.x - 1.7, c.y - 1.4, cam, cx, cy);
        const bb = project(c.x + 1.7, c.y + 1.4, cam, cx, cy);
        const cc = project(c.x + 1.7, c.y - 1.4, cam, cx, cy);
        const a2 = project(c.x - 1.7, c.y + 1.4, cam, cx, cy);
        const topY = -7 * cam.scale;
        ctx.fillStyle = "#B33A3A";
        ctx.beginPath();
        ctx.moveTo(e.x, e.y + topY);
        ctx.lineTo(cc.x, cc.y + topY);
        ctx.lineTo(bb.x, bb.y + topY);
        ctx.lineTo(a2.x, a2.y + topY);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#8a7a5c";
        ctx.lineWidth = Math.max(1, 1.5 * cam.scale);
        for (let k = 0; k < 4; k++) {
          const t = 0.2 + k * 0.2;
          const x0 = a2.x + (bb.x - a2.x) * t;
          ctx.beginPath();
          ctx.moveTo(x0, a2.y);
          ctx.lineTo(x0, a2.y + topY);
          ctx.stroke();
        }
      }

      if (z.landmark === "buses") {
        const c = zoneCenter(z);
        // Iwo Road park: 5-leg roundabout (island + ring) + parked micras + ONE white bus
        const rp = project(c.x, c.y - 0.6, cam, cx, cy);
        ctx.fillStyle = "#24211d";
        ctx.beginPath();
        ctx.ellipse(rp.x, rp.y, 34 * cam.scale, 17 * cam.scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = z.ground;
        ctx.beginPath();
        ctx.ellipse(rp.x, rp.y, 22 * cam.scale, 11 * cam.scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1F7A4D";
        ctx.beginPath();
        ctx.ellipse(rp.x, rp.y, 7 * cam.scale, 4 * cam.scale, 0, 0, Math.PI * 2);
        ctx.fill();
        // parked two-tone micras (maroon + yellow) — never yellow buses
        for (let k = 0; k < 2; k++) {
          const bx = c.x - 2.4 + k * 2.0;
          drawBox(ctx, bx, c.y + 1.6, 1.7, 0.9, 5, { top: "#5A1F2B", left: "#4a1823", right: "#3a1219" }, cam, cx, cy);
          drawBox(ctx, bx + 0.15, c.y + 1.75, 1.4, 0.6, 4, { top: "#F5C518", left: "#d9a914", right: "#c1910c" }, cam, cx, cy);
        }
        // white interstate bus with stripe + route board
        drawBox(ctx, c.x + 0.6, c.y + 1.5, 2.4, 1.0, 7, { top: "#F2EDE4", left: "#D8D2C4", right: "#C4BCA8" }, cam, cx, cy);
        const bp = project(c.x + 1.8, c.y + 2.55, cam, cx, cy);
        ctx.fillStyle = "#1F7A4D";
        ctx.fillRect(bp.x - 14 * cam.scale, bp.y - 3 * cam.scale, 28 * cam.scale, 2 * cam.scale);
      }

      // Mokola flyover: deck on pillars over the Ojoo–Sango–Mokola dual
      if (z.id === "mokola") {
        const c = zoneCenter(z);
        for (const px of [c.x - 1.2, c.x + 1.2]) {
          drawBox(ctx, px - 0.2, c.y - 0.6, 0.4, 0.4, 10, { top: "#8a8a8a", left: "#6f6f6f", right: "#5c5c5c" }, cam, cx, cy);
        }
        drawBox(ctx, c.x - 2.2, c.y - 0.9, 4.4, 0.7, 3, { top: "#3a3a3e", left: "#2c2c30", right: "#222226" }, cam, cx, cy);
        const mp = project(c.x, c.y - 0.55, cam, cx, cy);
        ctx.fillStyle = "#E8A020";
        ctx.font = `700 ${Math.max(8, 9 * cam.scale)}px Sora, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("MOKOLA FLYOVER", mp.x, mp.y - 14 * cam.scale);
      }

      // Molete interchange bridge (small)
      if (z.id === "molete") {
        const c = zoneCenter(z);
        drawBox(ctx, c.x - 1.8, c.y + 0.4, 3.6, 0.6, 5, { top: "#3a3a3e", left: "#2c2c30", right: "#222226" }, cam, cx, cy);
      }

      // Bower's Tower on Oke-Are (slim white tower beside Mapo hall)
      if (z.id === "mapo") {
        const c = zoneCenter(z);
        drawBox(ctx, c.x + 2.1, c.y - 1.9, 0.7, 0.7, 30, { top: "#EDE3D2", left: "#C9B795", right: "#B3A181" }, cam, cx, cy);
        drawBox(ctx, c.x + 1.95, c.y - 2.05, 1.0, 1.0, 2, { top: "#B33A3A", left: "#B33A3A", right: "#B33A3A" }, cam, cx, cy);
        const tp = project(c.x + 2.45, c.y - 1.55, cam, cx, cy);
        ctx.fillStyle = "#FAF6F0";
        ctx.font = `600 ${Math.max(8, 9 * cam.scale)}px Sora, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("BOWER'S", tp.x, tp.y - 32 * cam.scale);
      }

      if (z.landmark === "lake") {
        const c = zoneCenter(z);
        const p = project(c.x, c.y, cam, cx, cy);
        ctx.fillStyle = "#3b82c4";
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, z.w * 16 * cam.scale, z.d * 8 * cam.scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.beginPath();
        ctx.ellipse(p.x - 8 * cam.scale, p.y - 3 * cam.scale, z.w * 6 * cam.scale, z.d * 2.5 * cam.scale, -0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      if (z.landmark === "gate") {
        const c = zoneCenter(z);
        drawBox(ctx, c.x - 1.6, c.y - 0.3, 0.5, 0.6, 12, { top: "#EDE3D2", left: "#C9B795", right: "#B3A181" }, cam, cx, cy);
        drawBox(ctx, c.x + 1.1, c.y - 0.3, 0.5, 0.6, 12, { top: "#EDE3D2", left: "#C9B795", right: "#B3A181" }, cam, cx, cy);
        drawBox(ctx, c.x - 1.6, c.y - 0.5, 3.7, 0.5, 3, { top: "#1F7A4D", left: "#175c3a", right: "#12492e" }, cam, cx, cy);
      }

      // label
      const c = zoneCenter(z);
      const lp = project(c.x, c.y - z.d / 2 - 0.9, cam, cx, cy);
      ctx.font = `700 ${Math.max(9, 11 * cam.scale)}px Sora, sans-serif`;
      ctx.textAlign = "center";
      const sel = z.id === activeMirror.current;
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(20,14,10,0.75)";
      ctx.strokeText(z.label, lp.x, lp.y);
      ctx.fillStyle = sel ? "#E8A020" : "#FAF6F0";
      ctx.fillText(z.label, lp.x, lp.y);
      if (z.id === meMirror.current.homeZone) {
        ctx.font = `${Math.max(12, 15 * cam.scale)}px serif`;
        ctx.fillText("🏠", lp.x, lp.y - 16 * cam.scale);
      }

      if (sel) {
        ctx.strokeStyle = "#E8A020";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        poly.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.closePath();
        ctx.stroke();
      }
    };

    // home zone mirror (prop changes after mount)
    const homeZoneRef = { current: "" };

    const loop = () => {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const cam = camRef.current;
      const ph = phaseRef.current;
      const cx = W / 2;
      const cy = 46;
      const night = ph === "night";

      // --- move player ---
      const a = avatarRef.current;
      let mx = 0;
      let my = 0;
      const keys = keysRef.current;
      if (keys.has("a") || keys.has("arrowleft")) mx -= 1;
      if (keys.has("d") || keys.has("arrowright")) mx += 1;
      if (keys.has("w") || keys.has("arrowup")) my -= 1;
      if (keys.has("s") || keys.has("arrowdown")) my += 1;
      if (joyRef.current.on) {
        mx = joyRef.current.x;
        my = joyRef.current.y;
      }
      if (mx !== 0 || my !== 0) {
        a.tx = null;
        a.ty = null;
        const len = Math.hypot(mx, my) || 1;
        a.x += (mx / len) * PLAYER_SPEED * dt;
        a.y += (my / len) * PLAYER_SPEED * dt;
        a.moving = true;
        a.walk += dt * 11;
      } else if (a.tx !== null && a.ty !== null) {
        const dx = a.tx - a.x;
        const dy = a.ty - a.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 0.18) {
          a.tx = null;
          a.ty = null;
          a.moving = false;
        } else {
          a.x += (dx / dist) * PLAYER_SPEED * dt;
          a.y += (dy / dist) * PLAYER_SPEED * dt;
          a.moving = true;
          a.walk += dt * 11;
        }
      } else {
        a.moving = false;
      }
      collide(a);
      const az = zoneAt(a.x, a.y);
      if (az && az !== zoneRef.current) {
        zoneRef.current = az;
        cbRef.current(az);
      } else if (!az) {
        zoneRef.current = "";
      }
      // door proximity (1.3 tiles): nearest open door wins
      {
        let best: Door | null = null;
        let bestD = 1.3;
        for (const d of DOORS) {
          const dd = Math.hypot(a.x - d.x, a.y - d.y);
          if (dd < bestD) {
            bestD = dd;
            best = d;
          }
        }
        const key = best ? best.id : null;
        if (key !== doorRef.current) {
          doorRef.current = key;
          doorCb.current(best);
        }
      }

      // --- move ghosts (with stuck-timer: skip leg if blocked 2.5s) ---
      const gs = ghostsRef.current;
      GHOSTS.forEach((g, i) => {
        const st = gs[i];
        if (g.nightOnly && !night) return;
        if (st.dwell > 0) {
          st.dwell -= dt;
          st.stuck = 0;
          return;
        }
        const t = g.pts[st.leg % g.pts.length];
        const dx = t[0] - st.x;
        const dy = t[1] - st.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 0.4) {
          st.leg = (st.leg + 1) % g.pts.length;
          st.dwell = g.dwell;
          st.stuck = 0;
        } else {
          const ox = st.x;
          const oy = st.y;
          st.x += (dx / dist) * g.speed * dt;
          st.y += (dy / dist) * g.speed * dt;
          st.walk += dt * 9;
          collide(st as { x: number; y: number });
          if (Math.hypot(st.x - ox, st.y - oy) < g.speed * dt * 0.25) {
            st.stuck = (st.stuck ?? 0) + dt;
            if (st.stuck > 2.5) {
              st.leg = (st.leg + 1) % g.pts.length;
              st.dwell = 1;
              st.stuck = 0;
            }
          } else {
            st.stuck = 0;
          }
        }
      });

      // --- crowds: seeded townsfolk wandering their zones ---
      const crowdCap = saver ? CROWD_CAP_SAVER : 43;
      const crowd = crowdRef.current;
      let ci = 0;
      for (const spec of CROWDS) {
        const z = ZONES.find((zz) => zz.id === spec.zone);
        if (!z) continue;
        for (let k = 0; k < spec.count && ci < crowdCap; k++, ci++) {
          if (night && ci % 5 !== 0 && spec.zone !== "iwo-road") continue;
          const c = crowd[ci];
          if (c.pause > 0) {
            c.pause -= dt;
            c.stuck = 0;
          } else {
            const dx = c.tx - c.x;
            const dy = c.ty - c.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 0.25) {
              c.pause = 2 + hash01("crowd", ci * 7 + Math.floor(now / 4000)) * 7;
              c.tx = z.gx + 0.5 + hash01("crowd", ci * 3 + 1 + Math.floor(now / 9000)) * Math.max(0.5, z.w - 1);
              c.ty = z.gy + 0.5 + hash01("crowd", ci * 3 + 2 + Math.floor(now / 9000)) * Math.max(0.5, z.d - 1);
              c.stuck = 0;
            } else {
              const ox = c.x;
              const oy = c.y;
              c.x += (dx / dist) * c.speed * dt;
              c.y += (dy / dist) * c.speed * dt;
              c.walk += dt * 9;
              collide(c);
              if (Math.hypot(c.x - ox, c.y - oy) < c.speed * dt * 0.25) {
                c.stuck += dt;
                if (c.stuck > 2) {
                  c.tx = c.x + (hash01("crowd", ci * 29 + Math.floor(now / 2000)) - 0.5) * 4;
                  c.ty = c.y + (hash01("crowd", ci * 31 + Math.floor(now / 2000)) - 0.5) * 4;
                  c.stuck = 0;
                }
              } else {
                c.stuck = 0;
              }
            }
          }
          c.moving = c.pause <= 0;
        }
      }

      // --- ambient traffic on the corridors ---
      const traffic = trafficRef.current;
      const tCap = saver ? TRAFFIC_CAP_SAVER : traffic.length;
      traffic.forEach((v, i) => {
        if (i >= tCap) return;
        v.t = (v.t + v.speed * dt * v.dir + 1) % 1;
      });

      // --- follow cam ---
      if (followRef.current && now - lastDragRef.current > 300) {
        const s = cam.scale;
        const tpx = -(a.x - a.y) * 32 * s;
        const tpy = H * 0.55 - cy - (a.x + a.y) * 16 * s;
        const k = Math.min(1, dt * 3);
        cam.panX += (tpx - cam.panX) * k;
        cam.panY += (tpy - cam.panY) * k;
      }

      // --- draw ---
      const g2 = ctx.createLinearGradient(0, 0, 0, H);
      g2.addColorStop(0, SKY[ph][0]);
      g2.addColorStop(1, SKY[ph][1]);
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);
      if (ph !== "day") {
        ctx.fillStyle = "#FFE9B8";
        ctx.beginPath();
        ctx.arc(W - 60, 52, ph === "night" ? 10 : 16, 0, Math.PI * 2);
        ctx.fill();
      }
      if (night) {
        ctx.fillStyle = "#ffffff";
        for (let i = 0; i < 24; i++) {
          const sx = hash01("stars", i * 2 + 1) * W;
          const sy = hash01("stars", i * 2 + 2) * H * 0.4;
          ctx.globalAlpha = 0.3 + hash01("stars", i) * 0.5;
          ctx.fillRect(sx, sy, 1.5, 1.5);
        }
        ctx.globalAlpha = 1;
      }

      ctx.fillStyle = "#a8a094";
      footprint(ctx, -2, -2, GRID_W + 4, GRID_H + 4, cam, cx, cy);
      ctx.fill();

      // roads — typed corridors (express/dual/street) + surveyed potholes
      ROADS.forEach((road, ri) => {
        const w = road.type === "express" ? 14 : road.type === "dual" ? 11 : 8;
        const trace = () => {
          ctx.beginPath();
          road.pts.forEach(([gx, gy], i) => {
            const p = project(gx, gy, cam, cx, cy);
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
        };
        // sidewalk underlay, then asphalt, then markings
        ctx.strokeStyle = "#cfc6b4";
        ctx.lineWidth = (w + 3.2) * cam.scale;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        trace();
        ctx.stroke();
        ctx.strokeStyle = "#24211d";
        ctx.lineWidth = w * cam.scale;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        trace();
        ctx.stroke();
        if (road.type === "express") {
          // median
          ctx.strokeStyle = "#c9a24a";
          ctx.lineWidth = Math.max(1, 1.4 * cam.scale);
          trace();
          ctx.stroke();
        }
        ctx.strokeStyle = "rgba(245,217,168,0.7)";
        ctx.lineWidth = Math.max(1, 1.6 * cam.scale);
        ctx.setLineDash([7 * cam.scale, 7 * cam.scale]);
        trace();
        ctx.stroke();
        ctx.setLineDash([]);
        // potholes — dense on the rough Bodija–Beere corridor
        for (let k = 0; k < road.potholes * 6; k++) {
          const seg = Math.floor(hash01("pot" + ri, k * 2 + 1) * (road.pts.length - 1));
          const f = hash01("pot" + ri, k * 2 + 2);
          const [x0, y0] = road.pts[seg];
          const [x1, y1] = road.pts[seg + 1];
          const p = project(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, cam, cx, cy);
          const off = (hash01("pot" + ri, k * 3 + 3) - 0.5) * 8 * cam.scale;
          ctx.fillStyle = "#0c0c0e";
          ctx.beginPath();
          ctx.ellipse(p.x + off, p.y, (3 + hash01("pot" + ri, k) * 4) * cam.scale, 2.2 * cam.scale, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // merged depth list: zones + player + ghosts + crowds + traffic
      const sampleRoad = (pts: [number, number][], t: number) => {
        const segs: number[] = [0];
        let total = 0;
        for (let i = 1; i < pts.length; i++) {
          total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
          segs.push(total);
        }
        const target = t * total;
        for (let i = 1; i < pts.length; i++) {
          if (segs[i] >= target) {
            const f = (target - segs[i - 1]) / Math.max(0.001, segs[i] - segs[i - 1]);
            return {
              x: pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f,
              y: pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f,
            };
          }
        }
        return { x: pts[pts.length - 1][0], y: pts[pts.length - 1][1] };
      };
      type Item =
        | { kind: "zone"; z: (typeof ZONES)[number]; depth: number }
        | { kind: "player"; depth: number }
        | { kind: "ghost"; gi: number; depth: number }
        | { kind: "crowd"; ci: number; depth: number }
        | { kind: "rider"; rider: Rider; depth: number }
        | { kind: "door"; door: Door; depth: number }
        | { kind: "vehicle"; vi: number; depth: number };
      const items: Item[] = ZONES.map((z) => ({
        kind: "zone" as const,
        z,
        depth: z.gx + z.w / 2 + (z.gy + z.d / 2),
      }));
      items.push({ kind: "player", depth: a.x + a.y + 0.01 });
      for (const d of DOORS) {
        items.push({ kind: "door", door: d, depth: d.x + d.y + 0.015 });
      }
      for (const r of net.ref.current.values()) {
        items.push({ kind: "rider", rider: r, depth: r.x + r.y + 0.02 });
      }
      GHOSTS.forEach((gg, gi) => {
        if (gg.nightOnly && !night) return;
        const st = gs[gi];
        items.push({ kind: "ghost", gi, depth: st.x + st.y + 0.01 });
      });
      {
        let ci = 0;
        for (const spec of CROWDS) {
          for (let k = 0; k < spec.count && ci < crowdCap; k++, ci++) {
            if (night && ci % 5 !== 0 && spec.zone !== "iwo-road") continue;
            const c = crowd[ci];
            items.push({ kind: "crowd", ci, depth: c.x + c.y + 0.005 });
          }
        }
      }
      traffic.forEach((v, vi) => {
        if (vi >= tCap) return;
        const pos = sampleRoad(ROADS[v.road].pts, v.t);
        items.push({ kind: "vehicle", vi, depth: pos.x + pos.y + 0.02 });
      });
      // stash vehicle positions for the draw pass
      const vpos = traffic.map((v) => sampleRoad(ROADS[v.road].pts, v.t));
      items.sort((p, q) => p.depth - q.depth);

      polysRef.current = [];
      lightsRef.current = [];
      for (const it of items) {
        if (it.kind === "zone") {
          drawZone(it.z, cx, cy, cam, night);
        } else if (it.kind === "player") {
          const p = project(a.x, a.y, cam, cx, cy);
          const me = meMirror.current;
          drawPerson(p.x, p.y, cam.scale, me.avatarColor, me.playerSkin, me.playerName, me.playerTitle, a.walk, a.moving, false, me.playerGear);
        } else if (it.kind === "door") {
          const d = (it as { kind: string; depth: number; door: Door }).door;
          const p = project(d.x, d.y, cam, cx, cy);
          const s = cam.scale;
          const open = doorRef.current === d.id;
          ctx.fillStyle = open ? "rgba(232,160,32,0.85)" : "rgba(232,160,32,0.4)";
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, 11 * s, 5.5 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = open ? "#FFE9B8" : "#E8A020";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y - 8 * s, 7 * s, Math.PI, Math.PI * 2);
          ctx.stroke();
          ctx.font = `800 ${Math.max(8, 9 * s)}px Sora, sans-serif`;
          ctx.textAlign = "center";
          ctx.lineWidth = 3;
          ctx.strokeStyle = "rgba(20,14,10,0.8)";
          ctx.strokeText(open ? `▼ ENTER: ${d.label}` : d.label, p.x, p.y - 20 * s);
          ctx.fillStyle = open ? "#FFE9B8" : "#F5D9A8";
          ctx.fillText(open ? `▼ ENTER: ${d.label}` : d.label, p.x, p.y - 20 * s);
        } else if (it.kind === "rider") {
          const r = (it as { kind: string; depth: number; rider: Rider }).rider;
          const p = project(r.x, r.y, cam, cx, cy);
          drawPerson(p.x, p.y, cam.scale, r.top, r.skin, r.name, r.hood, 0, r.moving, false, r.gear);
        } else if (it.kind === "ghost") {
          const gg = GHOSTS[it.gi];
          const st = gs[it.gi];
          const p = project(st.x, st.y, cam, cx, cy);
          drawPerson(p.x, p.y, cam.scale, gg.color, gg.skin, gg.name, null, st.walk, st.dwell <= 0, false, gg.fem ? "gele" : "fila");
        } else if (it.kind === "crowd") {
          const c = crowd[it.ci];
          const p = project(c.x, c.y, cam, cx, cy);
          drawPerson(p.x, p.y, cam.scale * c.hf, CLOTHS[c.cloth], SKINS[c.skin], null, null, c.walk, c.moving, false, (["fila", "gele", "braids", "afro"] as const)[c.gear % 4]);
        } else {
          const v = traffic[it.vi];
          const pos = vpos[it.vi];
          const p = project(pos.x, pos.y, cam, cx, cy);
          const s = cam.scale;
          if (v.kind === "bus") {
            // white interstate bus, green stripe, dark windows — never yellow
            ctx.fillStyle = "rgba(0,0,0,0.25)";
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, 13 * s, 4 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#F2EDE4";
            ctx.fillRect(p.x - 12 * s, p.y - 10 * s, 24 * s, 8 * s);
            ctx.fillStyle = "#334155";
            ctx.fillRect(p.x - 10 * s, p.y - 9 * s, 20 * s, 3 * s);
            ctx.fillStyle = "#1F7A4D";
            ctx.fillRect(p.x - 12 * s, p.y - 4 * s, 24 * s, 2 * s);
          } else if (v.kind === "micra") {
            ctx.fillStyle = "rgba(0,0,0,0.25)";
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, 9 * s, 3 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#5A1F2B";
            ctx.fillRect(p.x - 8 * s, p.y - 7 * s, 16 * s, 6 * s);
            ctx.fillStyle = "#F5C518";
            ctx.fillRect(p.x - 8 * s, p.y - 7 * s, 16 * s, 2.6 * s);
          } else if (v.kind === "keke") {
            ctx.fillStyle = "#22c55e";
            ctx.beginPath();
            ctx.arc(p.x, p.y - 4 * s, 5 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#111";
            ctx.beginPath();
            ctx.arc(p.x - 3 * s, p.y, 1.8 * s, 0, Math.PI * 2);
            ctx.arc(p.x + 3 * s, p.y, 1.8 * s, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = "#B33A3A";
            ctx.beginPath();
            ctx.arc(p.x, p.y - 5 * s, 3 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#111";
            ctx.fillRect(p.x - 1 * s, p.y - 3 * s, 2 * s, 3 * s);
          }
        }
      }

      // tap-to-move target pin
      if (a.tx !== null && a.ty !== null) {
        const p = project(a.tx, a.ty, cam, cx, cy);
        ctx.strokeStyle = "#E8A020";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (night) {
        ctx.fillStyle = "#FFD98a";
        for (const l of lightsRef.current.slice(0, saver ? 20 : 200)) {
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          ctx.arc(l.x, l.y, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      if (!saver && !reduced) {
        const t = now / 1000;
        ctx.fillStyle = "rgba(240,235,225,0.5)";
        for (let k = 0; k < 3; k++) {
          const bx = [10, 21, 30][k];
          const by = [9, 15, 20][k];
          const p = project(bx, by, cam, cx, cy);
          const rise = ((t * 8 + k * 22) % 44) * cam.scale;
          ctx.globalAlpha = Math.max(0, 0.45 - rise / 120);
          ctx.beginPath();
          ctx.arc(p.x + Math.sin(t + k * 2) * 4, p.y - 20 * cam.scale - rise, (3 + rise / 14) * cam.scale, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      ctx.fillStyle = TINT[ph];
      ctx.fillRect(0, 0, W, H);
      // rain streaks while the rain event lives
      if (weatherMirror.current === "rain") {
        const t = performance.now() / 1000;
        ctx.strokeStyle = "rgba(188,214,255,0.55)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < 90; i++) {
          const rx = hash01("irain", i * 2 + 1) * W;
          const fall = ((t * 420 + hash01("irain", i * 2 + 2) * 480) % (H + 60)) - 30;
          ctx.moveTo(rx, fall);
          ctx.lineTo(rx - 5, fall + 16);
        }
        ctx.stroke();
        ctx.fillStyle = "rgba(20,26,54,0.18)";
        ctx.fillRect(0, 0, W, H);
      }
      const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.max(W, H) * 0.75);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(10,6,4,0.35)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
    };

    // start avatar at their home zone
    const hz = ZONES.find((z) => z.id === meMirror.current.homeZone) ?? ZONES[0];
    const hc = zoneCenter(hz);
    avatarRef.current.x = hc.x;
    avatarRef.current.y = hc.y + 1.2;
    zoneRef.current = hz.id;

    loop();
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saver, reduced]);

  const gridFromScreen = (clientX: number, clientY: number) => {
    const r = canvasRef.current!.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;
    const cam = camRef.current;
    const cx = r.width / 2;
    const cy = 46;
    const s = cam.scale;
    const aa = (x - cx - cam.panX) / (32 * s);
    const bb = (y - cy - cam.panY) / (16 * s);
    return { gx: (aa + bb) / 2, gy: (bb - aa) / 2 };
  };

  const pick = (clientX: number, clientY: number) => {
    const r = canvasRef.current!.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;
    const sorted = [...polysRef.current].sort((a, b) => b.depth - a.depth);
    for (const z of sorted) {
      if (inPoly(x, y, z.poly)) {
        onSelect(z.id);
        return;
      }
    }
  };

  const joyMove = (e: React.PointerEvent, base: DOMRect) => {
    const dx = e.clientX - (base.left + base.width / 2);
    const dy = e.clientY - (base.top + base.height / 2);
    const max = 34;
    const len = Math.hypot(dx, dy) || 1;
    const cl = Math.min(1, len / max);
    // screen dx maps to grid +x+y mix; joystick right = east-ish: (+x, slight +y)
    const nx = (dx / len) * cl;
    const ny = (dy / len) * cl;
    joyRef.current = { x: nx + ny * 0.5, y: ny * 1.4 - nx * 0.2, on: true };
    setJoy({ x: nx * 26, y: ny * 26, on: true });
  };

  return (
    <div>
      <div
        ref={wrapRef}
        className={`relative ${stageClass ?? "h-[360px] sm:h-[440px]"} cursor-grab touch-none overflow-hidden rounded-2xl ring-1 ring-white/10 active:cursor-grabbing`}
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          dragRef.current = { sx: e.clientX, sy: e.clientY, px: camRef.current.panX, py: camRef.current.panY, moved: false };
        }}
        onPointerMove={(e) => {
          const d = dragRef.current;
          if (!d) return;
          const dx = e.clientX - d.sx;
          const dy = e.clientY - d.sy;
          if (Math.abs(dx) + Math.abs(dy) > 6) d.moved = true;
          if (d.moved) {
            camRef.current.panX = d.px + dx;
            camRef.current.panY = d.py + dy;
            lastDragRef.current = performance.now();
            if (followRef.current) {
              followRef.current = false;
              setFollow(false);
            }
          }
        }}
        onPointerUp={(e) => {
          const d = dragRef.current;
          dragRef.current = null;
          if (d && !d.moved) {
            const g = gridFromScreen(e.clientX, e.clientY);
            const t = {
              x: Math.max(-1.5, Math.min(GRID_W + 1.5, g.gx)),
              y: Math.max(-1.5, Math.min(GRID_H + 1.5, g.gy)),
            };
            avatarRef.current.tx = t.x;
            avatarRef.current.ty = t.y;
            if (!followRef.current) {
              followRef.current = true;
              setFollow(true);
            }
            pick(e.clientX, e.clientY);
          }
        }}
        onWheel={(e) => {
          e.preventDefault();
          camRef.current.scale = Math.min(1.6, Math.max(0.55, camRef.current.scale * (e.deltaY > 0 ? 0.92 : 1.08)));
        }}
      >
        <canvas ref={canvasRef} className="block" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {(["day", "amber", "night"] as Phase[]).map((p) => (
            <button
              key={p}
              onClick={() => { setPhase(p); setAuto(false); }}
              className={`rounded-full px-3 py-1 text-xs font-bold shadow ${phase === p ? "bg-mapo text-charcoal" : "bg-black/55 text-cream"}`}
            >
              {p === "day" ? "☀️" : p === "amber" ? "🌇" : "🌙"} {p}
            </button>
          ))}
          {!auto && (
            <button onClick={() => setAuto(true)} className="rounded-full bg-black/55 px-3 py-1 text-xs font-bold text-cream shadow">
              ▶ auto
            </button>
          )}
          <button
            onClick={() => {
              const f = !followRef.current;
              followRef.current = f;
              setFollow(f);
            }}
            className={`rounded-full px-3 py-1 text-xs font-bold shadow ${follow ? "bg-agodi text-white" : "bg-black/55 text-cream"}`}
          >
            📍 {follow ? "following" : "follow"}
          </button>
        </div>
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          <button onClick={() => { camRef.current.scale = Math.min(1.6, camRef.current.scale * 1.15); }} className="h-9 w-9 rounded-full bg-black/55 text-lg font-bold text-cream shadow">+</button>
          <button onClick={() => { camRef.current.scale = Math.max(0.55, camRef.current.scale / 1.15); }} className="h-9 w-9 rounded-full bg-black/55 text-lg font-bold text-cream shadow">−</button>
          <button onClick={() => { camRef.current.panX = 0; camRef.current.panY = -10; camRef.current.scale = 0.9; followRef.current = true; setFollow(true); }} className="h-9 rounded-full bg-black/55 px-3 text-xs font-bold text-cream shadow">Reset</button>
        </div>
        {/* virtual joystick */}
        <div
          className="absolute bottom-3 left-3 h-24 w-24 rounded-full bg-black/35 shadow ring-1 ring-white/20"
          style={{ touchAction: "none" }}
          onPointerDown={(e) => {
            (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
            joyMove(e, e.currentTarget.getBoundingClientRect());
          }}
          onPointerMove={(e) => {
            if (joyRef.current.on) joyMove(e, e.currentTarget.getBoundingClientRect());
          }}
          onPointerUp={() => {
            joyRef.current = { x: 0, y: 0, on: false };
            setJoy({ x: 0, y: 0, on: false });
          }}
          onPointerCancel={() => {
            joyRef.current = { x: 0, y: 0, on: false };
            setJoy({ x: 0, y: 0, on: false });
          }}
        >
          <div
            className="absolute left-1/2 top-1/2 h-11 w-11 rounded-full bg-cream/85 shadow"
            style={{ transform: `translate(calc(-50% + ${joy.x}px), calc(-50% + ${joy.y}px))` }}
          />
        </div>
        <div className="absolute bottom-3 left-28 hidden rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold text-cream/85 shadow sm:block">
          WASD walk · drag to look · tap to go
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-charcoal/50">Walkable Ibadan · WASD + joystick + tap · quality in ⚙️ settings</span>
        <span className={`rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${saver ? "bg-agodi text-white ring-agodi" : "bg-white text-charcoal/60 ring-roof/15"}`}>
          {saver ? "● Saver ON" : "○ Full quality"}
        </span>
      </div>
    </div>
  );
}
