"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  ZONES, ROADS, houseSpots, zoneCenter, type Door,
} from "@/lib/world";
import { hash01 } from "@/lib/iso";
import { makeSignTexture } from "@/lib/sign";
import Walk3D, { type WalkRefs } from "./Walk3D";
import { StreetRoads, Streetlights, Roadside, Billboards, Shelters, Junctions } from "./Streets3D";
import type { Teleport } from "./IsoWorld";
import type { RiderNet } from "@/lib/useRiders";

// Shared grid→world mapping + road ribbon builder (also used by Drive3D).
export const T = 2;
export const gx = (x: number) => (x - 19) * T;
export const gz = (y: number) => (y - 14) * T;

type Phase = "day" | "amber" | "night";

const PHASE_BG: Record<Phase, string> = { day: "#9fc3d8", amber: "#cf8a3a", night: "#0b0e1d" };
const PHASE_FOG: Record<Phase, string> = { day: "#cfe0da", amber: "#e8b96a", night: "#141a36" };
const PHASE_SUN: Record<Phase, string> = { day: "#fff4e0", amber: "#ffb84d", night: "#8fa3ff" };
const PHASE_SUN_I: Record<Phase, number> = { day: 1.35, amber: 1.1, night: 0.35 };
const PHASE_HEMI: Record<Phase, number> = { day: 0.9, amber: 0.7, night: 0.35 };

const ROOFS = ["#8a4f30", "#7A4A2B", "#96603a", "#83502e"];

export function roadRibbon(pts: [number, number][], halfW: number): THREE.BufferGeometry {
  const verts: number[] = [];
  const idx: number[] = [];
  pts.forEach(([px, py], i) => {
    const [qx, qy] = pts[Math.min(i + 1, pts.length - 1)];
    const [rx, ry] = pts[Math.max(i - 1, 0)];
    let dx = qx - rx;
    let dy = qy - ry;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    const nx = -dy * halfW * T;
    const nz = dx * halfW * T;
    const cx = gx(px);
    const cz = gz(py);
    verts.push(cx + nx, 0, cz + nz, cx - nx, 0, cz - nz);
    if (i > 0) {
      const b = i * 2;
      idx.push(b - 2, b - 1, b, b - 1, b + 1, b);
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function Houses() {
  const spots = useMemo(() => {
    const out: { x: number; z: number; w: number; d: number; h: number; roof: number }[] = [];
    for (const z of ZONES) {
      if (z.landmark !== "houses" && z.landmark !== "gate") continue;
      for (const s of houseSpots(z.id)) {
        out.push({ x: gx(s.gx + s.w / 2), z: gz(s.gy + s.d / 2), w: s.w * T, d: s.d * T, h: s.h * 0.28, roof: s.roof });
      }
    }
    return out;
  }, []);
  const bodyRef = useRef<THREE.InstancedMesh>(null!);
  const roofRef = useRef<THREE.InstancedMesh>(null!);
  const bodyGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const roofGeo = useMemo(() => new THREE.ConeGeometry(0.72, 1, 4), []);
  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.9 }), []);
  const roofMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.85, flatShading: true }), []);

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    const cBody = new THREE.Color("#E4D6BE");
    const cRoof = new THREE.Color();
    spots.forEach((s, i) => {
      dummy.position.set(s.x, s.h / 2, s.z);
      dummy.scale.set(s.w, s.h, s.d);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      bodyRef.current.setMatrixAt(i, dummy.matrix);
      bodyRef.current.setColorAt(i, cBody);
      dummy.position.set(s.x, s.h + (s.w * 0.32) / 2, s.z);
      dummy.scale.set(s.w * 0.78, s.w * 0.32, s.d * 0.78);
      dummy.rotation.set(0, Math.PI / 4, 0);
      dummy.updateMatrix();
      roofRef.current.setMatrixAt(i, dummy.matrix);
      roofRef.current.setColorAt(i, cRoof.set(ROOFS[s.roof % ROOFS.length]));
    });
    bodyRef.current.instanceMatrix.needsUpdate = true;
    roofRef.current.instanceMatrix.needsUpdate = true;
    if (bodyRef.current.instanceColor) bodyRef.current.instanceColor.needsUpdate = true;
    if (roofRef.current.instanceColor) roofRef.current.instanceColor.needsUpdate = true;
  }, [spots]);

  return (
    <group>
      <instancedMesh ref={bodyRef} args={[bodyGeo, bodyMat, spots.length]} />
      <instancedMesh ref={roofRef} args={[roofGeo, roofMat, spots.length]} />
    </group>
  );
}

function Trees() {
  const items = useMemo(() => {
    const out: { x: number; z: number; s: number }[] = [];
    const z = ZONES.find((zz) => zz.id === "agodi")!;
    for (let i = 0; i < 10; i++) {
      out.push({
        x: gx(z.gx + 0.6 + hash01("t3d", i * 2 + 1) * (z.w - 1.2)),
        z: gz(z.gy + 0.6 + hash01("t3d", i * 2 + 2) * (z.d - 1.2)),
        s: 0.8 + hash01("t3d", i) * 0.7,
      });
    }
    return out;
  }, []);
  const trunkRef = useRef<THREE.InstancedMesh>(null!);
  const topRef = useRef<THREE.InstancedMesh>(null!);
  const trunkGeo = useMemo(() => new THREE.CylinderGeometry(0.18, 0.24, 1.6, 5), []);
  const topGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  const trunkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#4a2e1c", roughness: 1 }), []);
  const topMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1F7A4D", roughness: 1, flatShading: true }), []);
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    items.forEach((t, i) => {
      dummy.position.set(t.x, 0.8 * t.s, t.z);
      dummy.scale.set(t.s, t.s, t.s);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      trunkRef.current.setMatrixAt(i, dummy.matrix);
      dummy.position.set(t.x, (1.6 + 0.8) * t.s, t.z);
      dummy.scale.set(1.1 * t.s, 1.1 * t.s, 1.1 * t.s);
      dummy.updateMatrix();
      topRef.current.setMatrixAt(i, dummy.matrix);
    });
    trunkRef.current.instanceMatrix.needsUpdate = true;
    topRef.current.instanceMatrix.needsUpdate = true;
  }, [items]);
  return (
    <group>
      <instancedMesh ref={trunkRef} args={[trunkGeo, trunkMat, items.length]} />
      <instancedMesh ref={topRef} args={[topGeo, topMat, items.length]} />
    </group>
  );
}


function Landmarks({ night }: { night: boolean }) {
  const dugbe = zoneCenter(ZONES.find((z) => z.id === "dugbe")!);
  const mapo = zoneCenter(ZONES.find((z) => z.id === "mapo")!);
  const iwo = zoneCenter(ZONES.find((z) => z.id === "iwo-road")!);
  const mokola = zoneCenter(ZONES.find((z) => z.id === "mokola")!);
  const molete = zoneCenter(ZONES.find((z) => z.id === "molete")!);
  const ui = zoneCenter(ZONES.find((z) => z.id === "ui-gate")!);
  const windowMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#3a2c1c",
        emissive: new THREE.Color(night ? "#ffdf9e" : "#000000"),
        emissiveIntensity: night ? 1.4 : 0,
      }),
    [night]
  );
  const winSpots = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let f = 0; f < 7; f++)
      for (let w = 0; w < 2; w++)
        out.push([gx(dugbe.x - 0.35 + w * 0.7), 3 + f * 2.6, gz(dugbe.y + 0.75)]);
    return out;
  }, [dugbe.x, dugbe.y]);
  return (
    <group>
      {/* Cocoa House, Dugbe */}
      <mesh position={[gx(dugbe.x), 11, gz(dugbe.y)]}>
        <boxGeometry args={[3, 22, 3]} />
        <meshStandardMaterial color="#6b4a2e" roughness={0.9} />
      </mesh>
      <mesh position={[gx(dugbe.x), 22.4, gz(dugbe.y)]}>
        <boxGeometry args={[3.6, 0.8, 3.6]} />
        <meshStandardMaterial color="#2b1a12" roughness={1} />
      </mesh>
      {winSpots.map((p, i) => (
        <mesh key={i} position={p} material={windowMat}>
          <planeGeometry args={[0.5, 0.7]} />
        </mesh>
      ))}
      {/* Mapo hill + hall + Bower's */}
      <mesh position={[gx(mapo.x), 0.6, gz(mapo.y)]}>
        <cylinderGeometry args={[7, 8.5, 1.2, 12]} />
        <meshStandardMaterial color="#5a4128" roughness={1} />
      </mesh>
      <mesh position={[gx(mapo.x), 2.4, gz(mapo.y)]}>
        <boxGeometry args={[6.5, 2.4, 5]} />
        <meshStandardMaterial color="#EDE3D2" roughness={0.95} />
      </mesh>
      <mesh position={[gx(mapo.x), 4.2, gz(mapo.y)]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[4.6, 1.8, 4]} />
        <meshStandardMaterial color="#B33A3A" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[gx(mapo.x) + 4.6, 4.5, gz(mapo.y) - 3]}>
        <cylinderGeometry args={[0.5, 0.7, 9, 8]} />
        <meshStandardMaterial color="#EDE3D2" roughness={0.95} />
      </mesh>
      <mesh position={[gx(mapo.x) + 4.6, 9.4, gz(mapo.y) - 3]}>
        <coneGeometry args={[0.9, 1, 8]} />
        <meshStandardMaterial color="#B33A3A" roughness={0.9} />
      </mesh>
      {/* Iwo roundabout island + palm + parked micras + white bus */}
      <mesh position={[gx(iwo.x), 0.06, gz(iwo.y - 0.6)]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 3.6, 24]} />
        <meshStandardMaterial color="#24211d" roughness={1} />
      </mesh>
      <mesh position={[gx(iwo.x), 0.1, gz(iwo.y - 0.6)]}>
        <cylinderGeometry args={[2.2, 2.2, 0.2, 20]} />
        <meshStandardMaterial color="#1F7A4D" roughness={1} />
      </mesh>
      <mesh position={[gx(iwo.x), 1.2, gz(iwo.y - 0.6)]}>
        <cylinderGeometry args={[0.12, 0.16, 2.2, 6]} />
        <meshStandardMaterial color="#4a2e1c" roughness={1} />
      </mesh>
      <mesh position={[gx(iwo.x), 2.6, gz(iwo.y - 0.6)]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#2c945f" roughness={1} flatShading />
      </mesh>
      {[-2.4, -0.4].map((ox, i) => (
        <group key={i} position={[gx(iwo.x + ox), 0, gz(iwo.y + 1.6)]}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[3.4, 1, 1.8]} />
            <meshStandardMaterial color="#5A1F2B" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.25, 0]}>
            <boxGeometry args={[2.6, 0.9, 1.5]} />
            <meshStandardMaterial color="#F5C518" roughness={0.8} />
          </mesh>
        </group>
      ))}
      <group position={[gx(iwo.x + 1.8), 0, gz(iwo.y + 2)]}>
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[4.6, 1.6, 2]} />
          <meshStandardMaterial color="#F2EDE4" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.1, 0]}>
          <boxGeometry args={[4.7, 0.3, 2.05]} />
          <meshStandardMaterial color="#1F7A4D" roughness={0.8} />
        </mesh>
      </group>
      {/* Mokola flyover deck + pillars */}
      <mesh position={[gx(mokola.x), 2.2, gz(mokola.y - 0.6)]}>
        <boxGeometry args={[9, 0.7, 1.6]} />
        <meshStandardMaterial color="#3a3a3e" roughness={1} />
      </mesh>
      {[-2, 2].map((ox, i) => (
        <mesh key={i} position={[gx(mokola.x) + ox, 0.9, gz(mokola.y - 0.6)]}>
          <boxGeometry args={[0.7, 1.8, 0.9]} />
          <meshStandardMaterial color="#8a8a8a" roughness={1} />
        </mesh>
      ))}
      {/* Molete bridge */}
      <mesh position={[gx(molete.x), 1.4, gz(molete.y + 0.7)]}>
        <boxGeometry args={[7, 0.6, 1.4]} />
        <meshStandardMaterial color="#3a3a3e" roughness={1} />
      </mesh>
      {/* UI gate pillars + beam */}
      <mesh position={[gx(ui.x) - 2.6, 1.2, gz(ui.y)]}>
        <boxGeometry args={[0.8, 2.4, 0.8]} />
        <meshStandardMaterial color="#EDE3D2" roughness={0.95} />
      </mesh>
      <mesh position={[gx(ui.x) + 2.6, 1.2, gz(ui.y)]}>
        <boxGeometry args={[0.8, 2.4, 0.8]} />
        <meshStandardMaterial color="#EDE3D2" roughness={0.95} />
      </mesh>
      <mesh position={[gx(ui.x), 2.7, gz(ui.y)]}>
        <boxGeometry args={[6, 0.6, 0.8]} />
        <meshStandardMaterial color="#1F7A4D" roughness={0.9} />
      </mesh>
      {/* Eleyele lake */}
      <mesh position={[gx(3), 0.03, gz(20)]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.6, 24]} />
        <meshStandardMaterial color="#3b82c4" roughness={0.4} />
      </mesh>
    </group>
  );
}

// Overhead gantry signs on the express corridors (like the real thing).
function WorldGantry({ x, y, rot, lines }: { x: number; y: number; rot: number; lines: [string, string] }) {
  const texL = useMemo(() => makeSignTexture([lines[0]], { bg: "#14532d", font: 54 }), [lines]);
  const texR = useMemo(() => makeSignTexture([lines[1]], { bg: "#14532d", font: 54 }), [lines]);
  useEffect(() => () => { texL.dispose(); texR.dispose(); }, [texL, texR]);
  return (
    <group position={[gx(x), 0, gz(y)]} rotation={[0, rot, 0]}>
      {[-3.4, 3.4].map((ox, i) => (
        <mesh key={i} position={[ox, 2.6, 0]}>
          <boxGeometry args={[0.35, 5.2, 0.35]} />
          <meshStandardMaterial color="#3a3a3e" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 5.4, 0]}>
        <boxGeometry args={[7.6, 0.5, 0.5]} />
        <meshStandardMaterial color="#3a3a3e" roughness={0.9} />
      </mesh>
      {[{ ox: -1.9, tex: texL }, { ox: 1.9, tex: texR }].map((bd, i) => (
        <group key={i} position={[bd.ox, 4.3, 0]}>
          <mesh>
            <boxGeometry args={[3.4, 1.5, 0.25]} />
            <meshStandardMaterial color="#14532d" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0, 0.14]}>
            <planeGeometry args={[3.2, 1.35]} />
            <meshBasicMaterial map={bd.tex} transparent={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Governor({ onWeak }: { onWeak: () => void }) {
  const ema = useRef(1 / 60);
  const bad = useRef(0);
  const fired = useRef(false);
  const cb = useRef(onWeak);
  cb.current = onWeak;
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.25);
    ema.current = ema.current * 0.95 + d * 0.05;
    if (ema.current > 0.055) bad.current += d;
    else bad.current = Math.max(0, bad.current - d * 2);
    if (bad.current > 3.5 && !fired.current) {
      fired.current = true;
      cb.current();
    }
  });
  return null;
}

export interface CamApi {
  tx: number;
  tz: number;
  dist: number;
  follow: boolean;
}

// Rain streaks around the camera target (only while raining).
function RainField({ avatarPos }: { avatarPos: React.MutableRefObject<{ x: number; z: number }> }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const COUNT = 220;
  const drops = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        ox: (hash01("rain", i * 3 + 1) - 0.5) * 50,
        oz: (hash01("rain", i * 3 + 2) - 0.5) * 50,
        y: hash01("rain", i * 3 + 3) * 26,
        sp: 22 + hash01("rain", i * 5) * 10,
      })),
    []
  );
  useFrame((_, rawDt) => {
    const dt = Math.min(0.05, rawDt);
    const dummy = rainDummy;
    const cx = avatarPos.current.x;
    const cz = avatarPos.current.z;
    drops.forEach((d, i) => {
      d.y -= d.sp * dt;
      if (d.y < 0) d.y = 26;
      dummy.position.set(cx + d.ox, d.y, cz + d.oz);
      dummy.rotation.set(0.12, 0, 0.08);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <boxGeometry args={[0.08, 1.3, 0.08]} />
      <meshBasicMaterial color="#bcd6ff" transparent opacity={0.45} depthWrite={false} />
    </instancedMesh>
  );
}

const rainDummy = new THREE.Object3D();

function Rig({
  cam,
  avatarPos,
}: {
  cam: React.MutableRefObject<CamApi>;
  avatarPos: React.MutableRefObject<{ x: number; z: number }>;
}) {
  const t = useRef(new THREE.Vector3(cam.current.tx, 0, cam.current.tz));
  const d = useRef(cam.current.dist);
  useFrame((state, dt) => {
    const k = Math.min(1, dt * 4);
    const want = cam.current.follow
      ? { x: avatarPos.current.x, z: avatarPos.current.z }
      : { x: cam.current.tx, z: cam.current.tz };
    t.current.lerp(new THREE.Vector3(want.x, 0, want.z), k);
    d.current += (cam.current.dist - d.current) * k;
    const dir = new THREE.Vector3(1, 1.05, 1).normalize();
    state.camera.position.copy(t.current).addScaledVector(dir, d.current);
    state.camera.lookAt(t.current);
  });
  return null;
}

export default function World3D({
  active,
  onSelect,
  saver,
  onWeak,
  playerName,
  playerTitle,
  avatarColor,
  fem,
  lookSkin,
  lookGear,
  homeZone,
  teleport,
  onZoneEnter,
  weather,
  hood,
  net,
  onDoor,
}: {
  active: string;
  onSelect: (id: string) => void;
  saver: boolean;
  onWeak: () => void;
  playerName: string;
  playerTitle: string;
  avatarColor: string;
  fem: boolean;
  lookSkin: string;
  lookGear: "fila" | "gele" | "none" | "braids" | "afro";
  homeZone: string;
  teleport: Teleport | null;
  onZoneEnter: (id: string) => void;
  weather: "clear" | "rain";
  hood: string;
  net: RiderNet;
  onDoor: (door: Door | null) => void;
}) {
  const [phase, setPhase] = useState<Phase>("amber");
  const [auto, setAuto] = useState(true);
  const [dist, setDist] = useState(46);
  const [followUi, setFollowUi] = useState(true);
  const [joy, setJoy] = useState({ x: 0, y: 0 });
  const drag = useRef<{ sx: number; sy: number; tx: number; tz: number; moved: boolean } | null>(null);
  const weak = useRef(onWeak);
  weak.current = onWeak;
  const sel = useRef(onSelect);
  sel.current = onSelect;
  const zcb = useRef(onZoneEnter);
  zcb.current = onZoneEnter;
  const moved = useRef(false);
  const walkRefs = useRef<WalkRefs>({ keys: new Set(), joy: { x: 0, y: 0, on: false }, moved: false });
  const avatarPos = useRef({ x: 0, z: 0 });
  const camApi = useRef<CamApi>(null as unknown as CamApi);
  if (!camApi.current) {
    const z = ZONES.find((zz) => zz.id === homeZone) ?? ZONES[0];
    camApi.current = { tx: gx(z.gx + z.w / 2), tz: gz(z.gy + z.d / 2), dist: 46, follow: true };
  }
  camApi.current.dist = dist;

  const reduced =
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // keyboard walk (ignored while typing)
  useEffect(() => {
    const dn = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      walkRefs.current.keys.add(e.key.toLowerCase());
    };
    const up = (e: KeyboardEvent) => walkRefs.current.keys.delete(e.key.toLowerCase());
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", dn);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const setFollow = (f: boolean) => {
    camApi.current.follow = f;
    setFollowUi(f);
  };

  const joyEnd = () => {
    walkRefs.current.joy = { x: 0, y: 0, on: false };
    setJoy({ x: 0, y: 0 });
  };

  return (
    <div>
      <div
        className="relative cursor-grab overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 active:cursor-grabbing"
        style={{ touchAction: "none", height: 420 }}
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          drag.current = { sx: e.clientX, sy: e.clientY, tx: camApi.current.tx, tz: camApi.current.tz, moved: false };
          moved.current = false;
          walkRefs.current.moved = false;
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.sx;
          const dy = e.clientY - d.sy;
          if (Math.abs(dx) + Math.abs(dy) > 6) {
            d.moved = true;
            moved.current = true;
            walkRefs.current.moved = true;
            if (camApi.current.follow) setFollow(false);
          }
          const k = dist / 500;
          camApi.current.tx = d.tx - dx * k;
          camApi.current.tz = d.tz - dy * k;
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onWheel={(e) => {
          setDist((dd) => Math.min(90, Math.max(20, dd * (e.deltaY > 0 ? 1.08 : 0.92))));
        }}
      >
        <div className="h-[420px] lg:h-[560px]">
        <Canvas
          dpr={saver ? 1 : [1, 1.75]}
          gl={{ antialias: !saver, powerPreference: "high-performance" }}
          camera={{ fov: 40, near: 0.5, far: 400, position: [40, 42, 40] }}
        >
          <color attach="background" args={[weather === "rain" ? "#5a6570" : PHASE_BG[phase]]} />
          <fog attach="fog" args={[weather === "rain" ? "#6a7683" : PHASE_FOG[phase], weather === "rain" ? 45 : 70, 190]} />
          <hemisphereLight args={["#cfe8ff", "#3a2c1c", PHASE_HEMI[phase] * (weather === "rain" ? 0.85 : 1)]} />
          <directionalLight
            position={[30, 42, 18]}
            color={new THREE.Color(weather === "rain" ? "#aebdd0" : PHASE_SUN[phase])}
            intensity={PHASE_SUN_I[phase] * (weather === "rain" ? 0.55 : 1)}
          />
          {/* ground: urban plate + Agodi green */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
            <planeGeometry args={[130, 110]} />
            <meshStandardMaterial color="#a8a094" roughness={1} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[gx(14), -0.03, gz(19.5)]}>
            <circleGeometry args={[8.5, 24]} />
            <meshStandardMaterial color="#2f4a2e" roughness={1} />
          </mesh>
          <StreetRoads />
          <Streetlights />
          <Roadside />
          <Billboards />
          <Shelters />
          <Junctions />
          <WorldGantry x={22} y={19.3} rot={0.35} lines={["RING ROAD →", "CHALLENGE →"]} />
          <WorldGantry x={35.5} y={15.5} rot={Math.PI / 2} lines={["IWO ROAD →", "LAGOS →"]} />
          <Houses />
          <Trees />
          <Landmarks night={phase === "night"} />
          {/* invisible tap planes per zone */}
          {ZONES.map((z) => (
            <mesh
              key={z.id}
              visible={false}
              position={[gx(z.gx + z.w / 2), 0.4, gz(z.gy + z.d / 2)]}
              onClick={() => {
                if (!moved.current) sel.current(z.id);
              }}
            >
              <planeGeometry args={[z.w * T, z.d * T]} />
            </mesh>
          ))}
          {/* selection ring */}
          {(() => {
            const z = ZONES.find((zz) => zz.id === active);
            if (!z) return null;
            return (
              <mesh
                position={[gx(z.gx + z.w / 2), 0.12, gz(z.gy + z.d / 2)]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <ringGeometry args={[Math.max(z.w, z.d) * T * 0.55, Math.max(z.w, z.d) * T * 0.55 + 0.5, 32]} />
                <meshBasicMaterial color="#E8A020" transparent opacity={0.95} side={THREE.DoubleSide} />
              </mesh>
            );
          })()}
          <Walk3D
            playerName={playerName}
            playerTitle={playerTitle}
            avatarColor={avatarColor}
            fem={fem}
            skin={lookSkin}
            gear={lookGear}
            homeZone={homeZone}
            teleport={teleport}
            onZoneEnter={(id) => zcb.current(id)}
            refs={walkRefs}
            avatarPos={avatarPos}
            saver={saver}
            phase={phase}
            hood={hood}
            net={net}
            onDoor={onDoor}
          />
          <Rig cam={camApi} avatarPos={avatarPos} />
          <Governor onWeak={() => weak.current()} />
          {weather === "rain" && <RainField avatarPos={avatarPos} />}
        </Canvas>
        </div>
        <div className="absolute left-3 top-3 flex gap-1.5">
          {(["day", "amber", "night"] as Phase[]).map((p) => (
            <button
              key={p}
              onClick={() => {
                setPhase(p);
                setAuto(false);
              }}
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
            onClick={() => setFollow(!followUi)}
            className={`rounded-full px-3 py-1 text-xs font-bold shadow ${followUi ? "bg-agodi text-white" : "bg-black/55 text-cream"}`}
          >
            📍 {followUi ? "following" : "follow"}
          </button>
        </div>
        {/* virtual joystick */}
        <div
          className="absolute bottom-12 left-3 h-24 w-24 rounded-full bg-black/35 shadow ring-1 ring-white/20"
          style={{ touchAction: "none" }}
          onPointerDown={(e) => {
            e.stopPropagation();
            (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
            const r = e.currentTarget.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            const max = 34;
            const len = Math.hypot(dx, dy) || 1;
            const cl = Math.min(1, len / max);
            const nx = (dx / len) * cl;
            const ny = (dy / len) * cl;
            walkRefs.current.joy = { x: nx, y: ny, on: true };
            setJoy({ x: nx * 26, y: ny * 26 });
          }}
          onPointerMove={(e) => {
            if (walkRefs.current.joy.on) {
              const r = e.currentTarget.getBoundingClientRect();
              const dx = e.clientX - (r.left + r.width / 2);
              const dy = e.clientY - (r.top + r.height / 2);
              const max = 34;
              const len = Math.hypot(dx, dy) || 1;
              const cl = Math.min(1, len / max);
              const nx = (dx / len) * cl;
              const ny = (dy / len) * cl;
              walkRefs.current.joy = { x: nx, y: ny, on: true };
              setJoy({ x: nx * 26, y: ny * 26 });
            }
          }}
          onPointerUp={joyEnd}
          onPointerCancel={joyEnd}
        >
          <div
            className="absolute left-1/2 top-1/2 h-11 w-11 rounded-full bg-cream/85 shadow"
            style={{ transform: `translate(calc(-50% + ${joy.x}px), calc(-50% + ${joy.y}px))` }}
          />
        </div>
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          <button onClick={() => setDist((d) => Math.min(90, d / 1.15))} className="h-9 w-9 rounded-full bg-black/55 text-lg font-bold text-cream shadow">+</button>
          <button onClick={() => setDist((d) => Math.max(20, d * 1.15))} className="h-9 w-9 rounded-full bg-black/55 text-lg font-bold text-cream shadow">−</button>
        </div>
        <div className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold text-cream/85 shadow">
          Drag to look · scroll to zoom · tap a district · 3D
        </div>
        {/* cinematic vignette: full quality only, saver stays clean */}
        {!saver && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse at center, transparent 58%, rgba(10,6,4,0.42) 100%)" }}
          />
        )}
        <NearbyChips avatarPos={avatarPos} />
      </div>
      <AutoPhase auto={auto && !saver && !reduced} onPhase={setPhase} />
    </div>
  );
}

function AutoPhase({ auto, onPhase }: { auto: boolean; onPhase: (p: Phase) => void }) {
  const cb = useRef(onPhase);
  cb.current = onPhase;
  useEffect(() => {
    if (!auto) return;
    const order: Phase[] = ["day", "amber", "night"];
    let i = 1;
    const t = setInterval(() => {
      cb.current(order[i % order.length]);
      i++;
    }, 40000);
    return () => clearInterval(t);
  }, [auto]);
  return null;
}

// Nearby-district chips ("Bodija · 40m" style), refreshed 1Hz from avatar pos.
function NearbyChips({ avatarPos }: { avatarPos: React.MutableRefObject<{ x: number; z: number }> }) {
  const [chips, setChips] = useState<{ label: string; m: number }[]>([]);
  useEffect(() => {
    const tick = () => {
      const ax = avatarPos.current.x / 2 + 19;
      const ay = avatarPos.current.z / 2 + 14;
      const ranked = ZONES.map((z) => {
        const cx = z.gx + z.w / 2;
        const cy = z.gy + z.d / 2;
        const dTiles = Math.max(0, Math.hypot(ax - cx, ay - cy) - Math.max(z.w, z.d) / 2);
        return { label: z.label, m: Math.round(dTiles * 25) };
      })
        .sort((a, b) => a.m - b.m)
        .slice(0, 3);
      setChips(ranked);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [avatarPos]);
  if (chips.length === 0) return null;
  return (
    <div className="absolute left-1/2 top-3 flex -translate-x-1/2 gap-1.5">
      {chips.map((c) => (
        <span key={c.label} className="rounded-full bg-black/55 px-3 py-1 text-[11px] font-bold text-cream shadow">
          📍 {c.label} · {c.m}m
        </span>
      ))}
    </div>
  );
}
