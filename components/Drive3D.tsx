"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { DriveRoute } from "@/lib/world";
import { samplePolyline, polyLength, hash01 } from "@/lib/iso";
import { gx, gz, roadRibbon } from "@/lib/three-geo";
import { SIDEWALK, SHOP_FACES, signalIsRed } from "@/lib/streets";
import { engineSpeed, engineStart, engineStop, horn } from "@/lib/sound";
import { makeSignTexture } from "@/lib/sign";
import { BAY_NAMES } from "@/lib/world";
import type { HazardKind } from "./DriveStage";

interface Ob {
  s: number;
  lane: number;
  kind: "pothole" | "keke" | "okada";
  hit: boolean;
}

const LANE_W = 0.9;

// Offset ribbon in world coords (sidewalks / edge lines on corridors).
function worldRibbon(pts: [number, number][], halfW: number, off: number, y: number): THREE.BufferGeometry {
  const verts: number[] = [];
  const idx: number[] = [];
  const N = 40;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    let acc = 0;
    const total = polyLength(pts);
    const target = t * total;
    let px = pts[0][0];
    let py = pts[0][1];
    let dx = 1;
    let dy = 0;
    for (let k = 1; k < pts.length; k++) {
      const seg = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
      if (acc + seg >= target) {
        const f = (target - acc) / (seg || 1);
        px = pts[k - 1][0] + (pts[k][0] - pts[k - 1][0]) * f;
        py = pts[k - 1][1] + (pts[k][1] - pts[k - 1][1]) * f;
        dx = (pts[k][0] - pts[k - 1][0]) / (seg || 1);
        dy = (pts[k][1] - pts[k - 1][1]) / (seg || 1);
        break;
      }
      acc += seg;
    }
    const cx = px + -dy * off;
    const cy = py + dx * off;
    const nx = -dy * halfW * 2;
    const nz = dx * halfW * 2;
    const wx = (cx - 19) * 2;
    const wz = (cy - 14) * 2;
    verts.push(wx + nx, y, wz + nz, wx - nx, y, wz - nz);
    if (i > 0) {
      const b = i * 2;
      idx.push(b - 2, b - 1, b, b - 1, b + 1, b);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function DriveStreets({ route, saver, night }: { route: DriveRoute; saver: boolean; night: boolean }) {
  const walk = useMemo(() => worldRibbon(route.pts, 2.05, 0, 0.03), [route]);
  const edges = useMemo(() => [1.32, -1.32].map((off) => worldRibbon(route.pts, 0.07, off, 0.065)), [route]);
  const dashes = useMemo(() => {
    const out: { x: number; z: number; rot: number }[] = [];
    const len = polyLength(route.pts);
    const n = Math.floor(len / 1.15);
    for (let k = 0; k < n; k++) {
      const b = samplePolyline(route.pts, (k + 0.5) / n);
      out.push({ x: gx(b.x), z: gz(b.y), rot: Math.atan2(b.dx, b.dy) });
    }
    return out;
  }, [route]);
  const lamps = useMemo(() => {
    const out: { x: number; z: number }[] = [];
    const len = polyLength(route.pts);
    const n = Math.floor(len / 2.4);
    for (let k = 0; k < n; k++) {
      const b = samplePolyline(route.pts, (k + 0.5) / n);
      const side = k % 2 === 0 ? 1 : -1;
      out.push({ x: gx(b.x + -b.dy * 2.0 * side), z: gz(b.y + b.dx * 2.0 * side) });
    }
    return out;
  }, [route]);
  const shops = useMemo(() => {
    const out: { x: number; z: number; w: number; h: number; d: number; rot: number; face: number }[] = [];
    const len = polyLength(route.pts);
    const n = Math.floor(len / 2.6);
    for (let k = 0; k < n; k++) {
      const b = samplePolyline(route.pts, (k + 0.5) / n);
      const side = k % 2 === 0 ? 1 : -1;
      const off = 3.4 + hash01("ddshop" + route.id, k) * 1.6;
      out.push({
        x: gx(b.x + -b.dy * off * side),
        z: gz(b.y + b.dx * off * side),
        w: 2.2 + hash01("ddshop", k * 2 + 1) * 1.6,
        h: 2.6 + hash01("ddshop", k * 2 + 2) * 3.4,
        d: 2 + hash01("ddshop", k * 2 + 3) * 1.2,
        rot: Math.atan2(b.dx, b.dy),
        face: Math.floor(hash01("ddshop", k * 3 + 4) * SHOP_FACES.length) % SHOP_FACES.length,
      });
    }
    return out;
  }, [route]);
  const dashRef = useRef<THREE.InstancedMesh>(null!);
  const lampRef = useRef<THREE.InstancedMesh>(null!);
  const lampHeadRef = useRef<THREE.InstancedMesh>(null!);
  const shopRef = useRef<THREE.InstancedMesh>(null!);
  const dashGeo = useMemo(() => new THREE.BoxGeometry(0.22, 0.04, 1.05), []);
  const dashMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#F2EDE4", roughness: 0.9 }), []);
  const lampGeo = useMemo(() => new THREE.BoxGeometry(0.22, 5.2, 0.22), []);
  const lampMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2c2c30", roughness: 0.8 }), []);
  const headGeo = useMemo(() => new THREE.SphereGeometry(0.32, 8, 6), []);
  const headMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#FFE9B8", emissive: "#ffca7a", emissiveIntensity: night ? 2.2 : 1.1 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [night]
  );
  const shopGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const shopMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.95 }), []);
  useEffect(() => {
    const dummy = new THREE.Object3D();
    const c = new THREE.Color();
    dashes.forEach((d, i) => {
      dummy.position.set(d.x, 0.07, d.z);
      dummy.rotation.set(0, d.rot, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      dashRef.current.setMatrixAt(i, dummy.matrix);
    });
    dashRef.current.instanceMatrix.needsUpdate = true;
    lamps.forEach((s, i) => {
      dummy.position.set(s.x, 2.6, s.z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      lampRef.current.setMatrixAt(i, dummy.matrix);
      dummy.position.set(s.x, 5.3, s.z);
      dummy.updateMatrix();
      lampHeadRef.current.setMatrixAt(i, dummy.matrix);
    });
    lampRef.current.instanceMatrix.needsUpdate = true;
    lampHeadRef.current.instanceMatrix.needsUpdate = true;
    shops.forEach((s, i) => {
      dummy.position.set(s.x, s.h / 2, s.z);
      dummy.rotation.set(0, s.rot, 0);
      dummy.scale.set(s.w, s.h, s.d);
      dummy.updateMatrix();
      shopRef.current.setMatrixAt(i, dummy.matrix);
      shopRef.current.setColorAt(i, c.set(SHOP_FACES[s.face]));
    });
    shopRef.current.instanceMatrix.needsUpdate = true;
    if (shopRef.current.instanceColor) shopRef.current.instanceColor.needsUpdate = true;
  }, [dashes, lamps, shops]);
  const mid = samplePolyline(route.pts, 0.5);
  return (
    <group>
      <mesh geometry={walk} position={[0, 0, 0]}>
        <meshStandardMaterial color={SIDEWALK} roughness={1} />
      </mesh>
      {edges.map((g, i) => (
        <mesh key={i} geometry={g} position={[0, 0, 0]}>
          <meshStandardMaterial color="#F2EDE4" roughness={0.9} />
        </mesh>
      ))}
      <instancedMesh ref={dashRef} args={[dashGeo, dashMat, Math.max(1, dashes.length)]} />
      {!saver && (
        <group>
          <instancedMesh ref={lampRef} args={[lampGeo, lampMat, Math.max(1, lamps.length)]} />
          <instancedMesh ref={lampHeadRef} args={[headGeo, headMat, Math.max(1, lamps.length)]} />
        </group>
      )}
      <instancedMesh ref={shopRef} args={[shopGeo, shopMat, Math.max(1, shops.length)]} />
      <group position={[gx(mid.x + 4.5), 0, gz(mid.y + 2)]} rotation={[0, Math.atan2(mid.dx, mid.dy) + 0.5, 0]}>
        <mesh position={[-1.6, 3, 0]}>
          <boxGeometry args={[0.3, 6, 0.3]} />
          <meshStandardMaterial color="#3a3a3e" roughness={0.9} />
        </mesh>
        <mesh position={[1.6, 3, 0]}>
          <boxGeometry args={[0.3, 6, 0.3]} />
          <meshStandardMaterial color="#3a3a3e" roughness={0.9} />
        </mesh>
        <mesh position={[0, 7.2, 0]}>
          <boxGeometry args={[5.4, 2.4, 0.3]} />
          <meshStandardMaterial color="#1F7A4D" roughness={0.85} />
        </mesh>
        <mesh position={[0, 6.4, 0.17]}>
          <boxGeometry args={[5.4, 0.5, 0.1]} />
          <meshStandardMaterial color="#F2EDE4" roughness={0.85} />
        </mesh>
      </group>
    </group>
  );
}

export default function Drive3D({
  route,
  passengers,
  autopilot,
  saver,
  onHazard,
  onBay,
  onFinish,
  onWeak,
  phase,
  onHonk,
  weather,
}: {
  route: DriveRoute;
  passengers: number;
  autopilot: boolean;
  saver: boolean;
  onHazard: (kind: HazardKind) => void;
  onBay: (ok: boolean) => void;
  onFinish: () => void;
  onWeak: () => void;
  phase: "dusk" | "night";
  onHonk: (msg: string) => void;
  weather: "clear" | "rain";
}) {
  const [s, setS] = useState(0);
  const [lane, setLane] = useState(0);
  const [inBox, setInBox] = useState(false);
  const [walkers, setWalkers] = useState<{ id: number; fx: number; fz: number; tx: number; tz: number; t0: number; cloth: string }[]>([]);
  const walkId = useRef(0);
  const pauseRef = useRef(0);
  const brakeRef = useRef(false);
  const gasRef = useRef(false);
  const honkRef = useRef(0);
  const honkCd = useRef(0);
  const st = useRef({
    s: 0, lane: 0, obs: [] as Ob[], bayIdx: 0, vioIdx: 0,
    spawnT: 0, done: false, seed: Math.floor(Math.random() * 1000),
  });
  const laneMirror = useRef(0);
  const cb = useRef({ onHazard, onBay, onFinish, onHonk });
  cb.current = { onHazard, onBay, onFinish, onHonk };

  const duration = autopilot ? 10 : 26;
  const speed = 1 / duration;

  useEffect(() => {
    st.current = { s: 0, lane: 0, obs: [], bayIdx: 0, vioIdx: 0, spawnT: 0, done: false, seed: Math.floor(Math.random() * 1000) };
    laneMirror.current = 0;
    setS(0);
    setLane(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.id, autopilot]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (autopilot) return;
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowLeft" || e.key === "a") {
        setLane((l) => Math.max(-1, l - 1));
        laneMirror.current = Math.max(-1, laneMirror.current - 1);
      }
      if (e.key === "ArrowRight" || e.key === "d") {
        setLane((l) => Math.min(1, l + 1));
        laneMirror.current = Math.min(1, laneMirror.current + 1);
      }
      if (e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        stopPress();
      }
      if (e.key === "b" || e.key === "B") brakeRef.current = true;
      if (e.key === "g" || e.key === "G") gasRef.current = true;
      if (e.key === "h" || e.key === "H") honk();
    };
    const ku = (e: KeyboardEvent) => {
      if (e.key === "b" || e.key === "B") brakeRef.current = false;
      if (e.key === "g" || e.key === "G") gasRef.current = false;
    };
    window.addEventListener("keydown", h);
    window.addEventListener("keyup", ku);
    return () => {
      window.removeEventListener("keydown", h);
      window.removeEventListener("keyup", ku);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autopilot]);

  const honk = () => {
    if (autopilot) return;
    const now = performance.now();
    if (now - honkCd.current < 6000) return;
    honkCd.current = now;
    honkRef.current++;
    horn();
  };

  // engine loop lives as long as the run is mounted
  useEffect(() => {
    engineStart();
    return () => engineStop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopPress = () => {
    const c = st.current;
    if (c.done || c.bayIdx >= route.bays.length) return;
    const bay = route.bays[c.bayIdx];
    const ok = Math.abs(c.s - bay) < 0.009;
    c.bayIdx++;
    if (ok) {
      // halt at the bay: passengers board/alight visibly
      pauseRef.current = 1.6;
      const b = samplePolyline(route.pts, bay);
      const m = samplePolyline(route.pts, c.s);
      const fx = gx(b.x + -b.dy * 2.6);
      const fz = gz(b.y + b.dx * 2.6);
      const tx = gx(m.x);
      const tz = gz(m.y);
      const now = performance.now();
      const w1 = walkId.current++;
      const w2 = walkId.current++;
      setWalkers((w) => [
        ...w,
        { id: w1, fx, fz, tx, tz, t0: now, cloth: "#B33A3A" },
        { id: w2, fx: fx + 0.8, fz: fz + 0.5, tx, tz, t0: now + 450, cloth: "#1F7A4D" },
      ]);
      setTimeout(() => {
        setWalkers((w) => w.filter((x) => x.id !== w1 && x.id !== w2));
      }, 2400);
    }
    cb.current.onBay(ok);
  };

  const steer = (d: number) => {
    setLane((l) => {
      const n = Math.max(-1, Math.min(1, l + d));
      laneMirror.current = n;
      return n;
    });
  };

  const mid = useMemo(() => {
    const p = samplePolyline(route.pts, 0.5);
    return { x: gx(p.x), z: gz(p.y) };
  }, [route]);
  const ribbon = useMemo(() => roadRibbon(route.pts, 1.5), [route]);
  const staticPots = useMemo(
    () =>
      Array.from({ length: route.potholes * 8 }, (_, k) => {
        const t = hash01("d3pot" + route.id, k * 2 + 1);
        const b = samplePolyline(route.pts, t);
        const off = (hash01("d3pot" + route.id, k * 2 + 2) - 0.5) * 2.4;
        return { x: gx(b.x + -b.dy * off), z: gz(b.y + b.dx * off), r: 0.35 + hash01("d3pot", k) * 0.3 };
      }),
    [route]
  );
  const trees = useMemo(
    () =>
      saver
        ? []
        : Array.from({ length: 22 }, (_, k) => {
            const t = hash01("d3tree" + route.id, k * 2 + 1);
            const b = samplePolyline(route.pts, t);
            const side = hash01("d3tree" + route.id, k * 2 + 2) > 0.5 ? 1 : -1;
            const off = (3 + hash01("d3tree" + route.id, k * 3 + 3) * 4) * side;
            return {
              x: gx(b.x + -b.dy * off),
              z: gz(b.y + b.dx * off),
              s: 0.8 + hash01("d3tree" + route.id, k) * 0.8,
            };
          }),
    [route, saver]
  );

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl bg-black ring-1 ring-white/10" style={{ touchAction: "none" }}>
        <div className="h-[380px]">
          <Canvas
            dpr={saver ? 1 : [1, 1.5]}
            gl={{ antialias: !saver, powerPreference: "high-performance" }}
            camera={{ fov: 55, near: 0.5, far: 500, position: [0, 10, -14] }}
          >
            <color attach="background" args={[phase === "night" ? "#0b0e1d" : "#cf8a3a"]} />
            <fog attach="fog" args={[phase === "night" ? "#141a36" : "#e8b96a", 60, 170]} />
            <hemisphereLight args={["#ffe9c8", "#3a2c1c", phase === "night" ? 0.35 : 0.85]} />
            <directionalLight
              position={[24, 36, 14]}
              color={phase === "night" ? "#8fa3ff" : "#ffb84d"}
              intensity={phase === "night" ? 0.4 : 1.15}
            />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[mid.x, -0.05, mid.z]}>
              <planeGeometry args={[220, 220]} />
              <meshStandardMaterial color="#a8a094" roughness={1} />
            </mesh>
            <mesh geometry={ribbon} position={[0, 0.05, 0]}>
              <meshStandardMaterial color={weather === "rain" ? "#1e1c19" : "#24211d"} roughness={weather === "rain" ? 0.55 : 1} />
            </mesh>
            <DriveStreets route={route} saver={saver} night={phase === "night"} />
            {weather === "rain" && <DriveRain />}
            {staticPots.map((p, i) => (
              <mesh key={i} position={[p.x, 0.07, p.z]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[p.r, 10]} />
                <meshStandardMaterial color="#0c0c0e" roughness={1} />
              </mesh>
            ))}
            {trees.map((t, i) => (
              <group key={i} position={[t.x, 0, t.z]}>
                <mesh position={[0, 0.8 * t.s, 0]}>
                  <cylinderGeometry args={[0.14, 0.2, 1.6, 5]} />
                  <meshStandardMaterial color="#4a2e1c" roughness={1} />
                </mesh>
                <mesh position={[0, 2.2 * t.s, 0]}>
                  <icosahedronGeometry args={[1 * t.s, 0]} />
                  <meshStandardMaterial color="#1F7A4D" roughness={1} flatShading />
                </mesh>
              </group>
            ))}
            {route.bays.map((b, i) => (
              <BayPad key={i} route={route} t={b} name={(BAY_NAMES[route.id] ?? [])[i] ?? "BUS STOP"} />
            ))}
            {route.vio.map((v, i) => (
              <VioPost key={i} route={route} t={v} />
            ))}
            {route.signals.map((sg, i) => (
              <DriveSignal key={i} route={route} t={sg} idx={i} />
            ))}
            <Gantry
              route={route}
              t={0.5}
              lines={route.id === "mokola-iwo" ? ["CHALLENGE →", "IWO ROAD →"] : ["BODIJA →", "BEERE →"]}
            />
            <Cones route={route} />
            <Barriers route={route} />
            <Oncoming route={route} saver={saver} />
            <FinishArch route={route} label={route.endLabel} />
            <Sim
              route={route}
              passengers={passengers}
              autopilot={autopilot}
              speed={speed}
              st={st}
              laneMirror={laneMirror}
              cb={cb}
              setS={setS}
              setInBox={setInBox}
              setLane={setLane}
              onWeak={onWeak}
              pause={pauseRef}
              brake={brakeRef}
              gas={gasRef}
              honk={honkRef}
              night={phase === "night"}
            />
            {walkers.map((w) => (
              <BoardWalker key={w.id} w={w} />
            ))}
          </Canvas>
        </div>
        {/* cinematic vignette: full quality only */}
        {!saver && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(10,6,4,0.5) 100%)" }}
          />
        )}
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-mapo to-agodi transition-all" style={{ width: `${Math.round(s * 100)}%` }} />
      </div>
      {!autopilot && (
        <div className="space-y-2">
          <div className="mt-2 grid grid-cols-3 gap-2">
            <button onClick={() => steer(-1)} className="rounded-2xl bg-white/10 py-3 text-xl font-bold text-cream active:bg-white/20">◀</button>
            <button onClick={stopPress} className={`rounded-2xl py-3 text-sm font-extrabold ${inBox ? "bg-green-500 text-white" : "bg-mapo text-charcoal"}`}>
              STOP {inBox ? "🟢" : ""}
            </button>
            <button onClick={() => steer(1)} className="rounded-2xl bg-white/10 py-3 text-xl font-bold text-cream active:bg-white/20">▶</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onPointerDown={() => { brakeRef.current = true; }}
              onPointerUp={() => { brakeRef.current = false; }}
              onPointerLeave={() => { brakeRef.current = false; }}
              className="rounded-2xl bg-red-900/80 py-2.5 text-sm font-extrabold text-white active:bg-red-700"
            >
              BRAKE
            </button>
            <button onClick={honk} className="rounded-2xl bg-[#f5c04a] py-2.5 text-sm font-extrabold text-charcoal active:scale-95">
              📯 PÒÒN!
            </button>
            <button
              onPointerDown={() => { gasRef.current = true; }}
              onPointerUp={() => { gasRef.current = false; }}
              onPointerLeave={() => { gasRef.current = false; }}
              className="rounded-2xl bg-green-700/90 py-2.5 text-sm font-extrabold text-white active:bg-green-600"
            >
              GAS
            </button>
          </div>
          <p className="text-center text-[11px] text-cream/50">Hold BRAKE to crawl · GAS to fly (risk am) · PÒÒN! scatters traffic · B/G/H keys work too</p>
        </div>
      )}
      {autopilot && <p className="mt-2 text-center text-xs text-cream/60">Riding as passenger — driver dey handle am.</p>}
    </div>
  );
}

function DriveSignal({ route, t, idx }: { route: { pts: [number, number][] }; t: number; idx: number }) {
  const b = samplePolyline(route.pts, t);
  const px = gx(b.x + -b.dy * -2.1);
  const pz = gz(b.y + b.dx * -2.1);
  const red = useRef<THREE.MeshStandardMaterial>(null!);
  const grn = useRef<THREE.MeshStandardMaterial>(null!);
  useFrame(() => {
    const isRed = signalIsRed(idx, performance.now());
    if (red.current) {
      red.current.emissive.set(isRed ? "#ff2222" : "#330000");
      red.current.emissiveIntensity = isRed ? 1.6 : 0.2;
    }
    if (grn.current) {
      grn.current.emissive.set(isRed ? "#002200" : "#22ff44");
      grn.current.emissiveIntensity = isRed ? 0.2 : 1.6;
    }
  });
  return (
    <group position={[px, 0, pz]} rotation={[0, Math.atan2(b.dx, b.dy), 0]}>
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.22, 3.2, 0.22]} />
        <meshStandardMaterial color="#2c2c30" roughness={0.8} />
      </mesh>
      <mesh position={[0, 3.4, 0]}>
        <boxGeometry args={[0.5, 1.4, 0.5]} />
        <meshStandardMaterial color="#1C1917" roughness={0.8} />
      </mesh>
      <mesh position={[0, 3.75, 0.26]}>
        <sphereGeometry args={[0.2, 8, 6]} />
        <meshStandardMaterial ref={red} color="#330000" roughness={0.6} />
      </mesh>
      <mesh position={[0, 3.05, 0.26]}>
        <sphereGeometry args={[0.2, 8, 6]} />
        <meshStandardMaterial ref={grn} color="#002200" roughness={0.6} />
      </mesh>
    </group>
  );
}

function BoardWalker({ w }: { w: { fx: number; fz: number; tx: number; tz: number; t0: number; cloth: string } }) {
  const ref = useRef<THREE.Group>(null!);
  const mat = useRef<THREE.MeshStandardMaterial>(null!);
  useFrame(() => {
    const p = Math.min(1, (performance.now() - w.t0) / 1500);
    const g = ref.current;
    if (!g) return;
    g.position.set(w.fx + (w.tx - w.fx) * p, Math.abs(Math.sin(p * 12)) * 0.12, w.fz + (w.tz - w.fz) * p);
    g.visible = p < 0.96;
    if (mat.current) mat.current.transparent = true, mat.current.opacity = p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1;
  });
  return (
    <group ref={ref}>
      <mesh position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.32, 0.8, 3, 8]} />
        <meshStandardMaterial ref={mat} color={w.cloth} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.85, 0]}>
        <sphereGeometry args={[0.3, 10, 8]} />
        <meshStandardMaterial color="#3b2317" roughness={0.8} />
      </mesh>
    </group>
  );
}

function DriveRain() {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const COUNT = 140;
  const drops = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        ox: (hash01("drain", i * 3 + 1) - 0.5) * 46,
        oz: (hash01("drain", i * 3 + 2) - 0.5) * 46,
        y: hash01("drain", i * 3 + 3) * 24,
        sp: 24 + hash01("drain", i * 5) * 12,
      })),
    []
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame((state, rawDt) => {
    const dt = Math.min(0.05, rawDt);
    const cx = state.camera.position.x;
    const cz = state.camera.position.z;
    drops.forEach((d, i) => {
      d.y -= d.sp * dt;
      if (d.y < 0) d.y = 24;
      dummy.position.set(cx + d.ox, d.y, cz + d.oz);
      dummy.rotation.set(0.1, 0, 0.06);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <boxGeometry args={[0.09, 1.4, 0.09]} />
      <meshBasicMaterial color="#bcd6ff" transparent opacity={0.5} depthWrite={false} />
    </instancedMesh>
  );
}

// Traffic cones lining bay approaches (dressing, off the driving lanes).
function Cones({ route }: { route: { pts: [number, number][]; id: string } }) {
  const spots = useMemo(() => {
    const out: { x: number; z: number }[] = [];
    (route as DriveRoute).bays.forEach((b, bi) => {
      for (let k = 0; k < 4; k++) {
        const p = samplePolyline(route.pts, Math.max(0, b - 0.016 + k * 0.005));
        const side = (bi + k) % 2 === 0 ? 1 : -1;
        out.push({ x: gx(p.x + -p.dy * 1.1 * side), z: gz(p.y + p.dx * 1.1 * side) });
      }
    });
    return out;
  }, [route]);
  const ref = useRef<THREE.InstancedMesh>(null!);
  const geo = useMemo(() => new THREE.ConeGeometry(0.32, 0.85, 10), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e8641e", roughness: 0.8 }), []);
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    spots.forEach((s, i) => {
      dummy.position.set(s.x, 0.42, s.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [spots]);
  return (
    <instancedMesh ref={ref} args={[geo, mat, Math.max(1, spots.length)]} frustumCulled={false}>
      <coneGeometry args={[0.32, 0.85, 10]} />
      <meshStandardMaterial color="#e8641e" roughness={0.8} />
    </instancedMesh>
  );
}

// Yellow/black barrier rails on the fast middle stretch.
function Barriers({ route }: { route: { pts: [number, number][]; id: string } }) {
  const spots = useMemo(() => {
    const out: { x: number; z: number; rot: number; yellow: boolean }[] = [];
    const len = polyLength(route.pts);
    const n = Math.floor(len / 1.1);
    for (let k = 0; k < n; k++) {
      const t = 0.3 + (0.4 * k) / Math.max(1, n - 1);
      if (t > 0.72) break;
      const p = samplePolyline(route.pts, t);
      for (const side of [1, -1]) {
        const off = 2.3 * side;
        out.push({
          x: gx(p.x + -p.dy * off),
          z: gz(p.y + p.dx * off),
          rot: Math.atan2(p.dx, p.dy),
          yellow: (k + (side > 0 ? 0 : 1)) % 2 === 0,
        });
      }
    }
    return out;
  }, [route]);
  const yRef = useRef<THREE.InstancedMesh>(null!);
  const bRef = useRef<THREE.InstancedMesh>(null!);
  const geo = useMemo(() => new THREE.BoxGeometry(0.28, 0.9, 1.05), []);
  const yMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#E8A020", roughness: 0.8 }), []);
  const bMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1C1917", roughness: 0.8 }), []);
  const yellows = useMemo(() => spots.filter((s) => s.yellow), [spots]);
  const blacks = useMemo(() => spots.filter((s) => !s.yellow), [spots]);
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    const fill = (ref: React.MutableRefObject<THREE.InstancedMesh>, list: typeof spots) => {
      list.forEach((s, i) => {
        dummy.position.set(s.x, 0.45, s.z);
        dummy.rotation.set(0, s.rot, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        ref.current.setMatrixAt(i, dummy.matrix);
      });
      ref.current.instanceMatrix.needsUpdate = true;
    };
    fill(yRef, yellows);
    fill(bRef, blacks);
  }, [yellows, blacks]);
  return (
    <group>
      <instancedMesh ref={yRef} args={[geo, yMat, Math.max(1, yellows.length)]} frustumCulled={false}>
        <boxGeometry args={[0.28, 0.9, 1.05]} />
        <meshStandardMaterial color="#E8A020" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={bRef} args={[geo, bMat, Math.max(1, blacks.length)]} frustumCulled={false}>
        <boxGeometry args={[0.28, 0.9, 1.05]} />
        <meshStandardMaterial color="#1C1917" roughness={0.8} />
      </instancedMesh>
    </group>
  );
}

// Oncoming traffic on the far shoulder lane (ambient, no collision).
function Oncoming({ route, saver }: { route: { pts: [number, number][]; id: string }; saver: boolean }) {
  const cars = useMemo(
    () => [
      { t: 0.15, speed: 0.028, kind: "micra" },
      { t: 0.45, speed: 0.022, kind: "bus" },
      { t: 0.7, speed: 0.032, kind: "car" },
      { t: 0.9, speed: 0.026, kind: "micra" },
    ],
    []
  );
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame((_, rawDt) => {
    const dt = Math.min(0.05, rawDt);
    cars.forEach((c, i) => {
      c.t -= (c.speed * dt) / 1;
      if (c.t < 0) c.t += 1;
      const b = samplePolyline(route.pts, c.t);
      const g = refs.current[i];
      if (!g) return;
      g.position.set(gx(b.x + -b.dy * -2.6), 0, gz(b.y + b.dx * -2.6));
      g.rotation.y = Math.atan2(-b.dx, -b.dy);
    });
  });
  if (saver) return null;
  return (
    <group>
      {cars.map((c, i) => (
        <group
          key={i}
          ref={(m) => {
            refs.current[i] = m;
          }}
        >
          {c.kind === "bus" ? (
            <group>
              <mesh position={[0, 0.8, 0]}>
                <boxGeometry args={[2.2, 1.6, 4.8]} />
                <meshStandardMaterial color="#F2EDE4" roughness={0.8} />
              </mesh>
              <mesh position={[0, 1.1, 0]}>
                <boxGeometry args={[2.25, 0.3, 4.85]} />
                <meshStandardMaterial color="#1F7A4D" roughness={0.8} />
              </mesh>
              <mesh position={[0, 0.9, -2.45]}>
                <sphereGeometry args={[0.16, 8, 6]} />
                <meshStandardMaterial color="#FFE9B8" emissive="#FFE9B8" emissiveIntensity={1.4} />
              </mesh>
            </group>
          ) : c.kind === "car" ? (
            <group>
              <mesh position={[0, 0.55, 0]}>
                <boxGeometry args={[1.8, 0.9, 4]} />
                <meshStandardMaterial color="#222831" roughness={0.6} />
              </mesh>
              <mesh position={[0, 1.2, -0.3]}>
                <boxGeometry args={[1.5, 0.7, 2]} />
                <meshStandardMaterial color="#3b4a63" roughness={0.5} />
              </mesh>
              <mesh position={[0, 0.6, -2.05]}>
                <sphereGeometry args={[0.15, 8, 6]} />
                <meshStandardMaterial color="#FFE9B8" emissive="#FFE9B8" emissiveIntensity={1.4} />
              </mesh>
            </group>
          ) : (
            <group>
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[1.8, 1, 3.6]} />
                <meshStandardMaterial color="#5A1F2B" roughness={0.8} />
              </mesh>
              <mesh position={[0, 1.25, 0.2]}>
                <boxGeometry args={[1.5, 0.9, 2.2]} />
                <meshStandardMaterial color="#F5C518" roughness={0.8} />
              </mesh>
              <mesh position={[0, 0.6, -1.85]}>
                <sphereGeometry args={[0.14, 8, 6]} />
                <meshStandardMaterial color="#FFE9B8" emissive="#FFE9B8" emissiveIntensity={1.4} />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  );
}

function BayPad({ route, t, name }: { route: { pts: [number, number][] }; t: number; name: string }) {
  const b = samplePolyline(route.pts, t);
  const px = gx(b.x + -b.dy * 2.6);
  const pz = gz(b.y + b.dx * 2.6);
  const rot = Math.atan2(b.dx, b.dy);
  const cx = gx(b.x);
  const cz = gz(b.y);
  const sign = useMemo(() => makeSignTexture([name, "BUS STOP"], { bg: "#14532d", font: 52 }), [name]);
  useEffect(() => () => { sign.dispose(); }, [sign]);
  return (
    <group>
      {/* zebra crossing over the road */}
      {[-1.6, -0.8, 0, 0.8, 1.6].map((o, i) => (
        <mesh key={i} position={[cx + b.dx * o, 0.075, cz + b.dy * o]} rotation={[-Math.PI / 2, 0, rot]}>
          <planeGeometry args={[0.5, 3.4]} />
          <meshStandardMaterial color="#F2EDE4" roughness={0.9} />
        </mesh>
      ))}
      {/* shelter: posts + amber roof + bench + name board */}
      <group position={[px, 0.06, pz]} rotation={[0, rot, 0]}>
        {[[-1.3, -0.7], [1.3, -0.7], [-1.3, 0.7], [1.3, 0.7]].map(([ox, oz], i) => (
          <mesh key={i} position={[ox, 1.2, oz]}>
            <boxGeometry args={[0.16, 2.4, 0.16]} />
            <meshStandardMaterial color="#3a3a3e" roughness={0.9} />
          </mesh>
        ))}
        <mesh position={[0, 2.5, 0]}>
          <boxGeometry args={[3, 0.16, 1.8]} />
          <meshStandardMaterial color="#E8A020" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[2.4, 0.35, 0.6]} />
          <meshStandardMaterial color="#6b4226" roughness={0.95} />
        </mesh>
        <mesh position={[0, 3.3, 0]}>
          <boxGeometry args={[3.2, 0.9, 0.15]} />
          <meshStandardMaterial color="#14532d" roughness={0.85} />
        </mesh>
        <mesh position={[0, 3.3, 0.09]}>
          <planeGeometry args={[3.0, 0.75]} />
          <meshBasicMaterial map={sign} transparent={false} />
        </mesh>
      </group>
    </group>
  );
}

function Gantry({ route, t, lines }: { route: { pts: [number, number][] }; t: number; lines: [string, string] }) {
  const b = samplePolyline(route.pts, t);
  const px = gx(b.x);
  const pz = gz(b.y);
  const rot = Math.atan2(b.dx, b.dy);
  const texL = useMemo(() => makeSignTexture([lines[0]], { bg: "#14532d", font: 54 }), [lines]);
  const texR = useMemo(() => makeSignTexture([lines[1]], { bg: "#14532d", font: 54 }), [lines]);
  useEffect(() => () => { texL.dispose(); texR.dispose(); }, [texL, texR]);
  const boards: { ox: number; tex: THREE.Texture }[] = [
    { ox: -1.9, tex: texL },
    { ox: 1.9, tex: texR },
  ];
  return (
    <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
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
      {boards.map((bd, i) => (
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

function VioPost({ route, t }: { route: { pts: [number, number][] }; t: number }) {
  const b = samplePolyline(route.pts, t);
  return (
    <group position={[gx(b.x + -b.dy * -2.1), 0, gz(b.y + b.dx * -2.1)]} rotation={[0, Math.atan2(b.dx, b.dy), 0]}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.4, 1, 2.4]} />
        <meshStandardMaterial color="#1e40af" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[0.5, 0.6, 1.2]} />
        <meshStandardMaterial color="#F2EDE4" emissive="#3b82c4" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

function FinishArch({ route, label }: { route: { pts: [number, number][] }; label: string }) {
  const b = samplePolyline(route.pts, 1);
  void label;
  return (
    <group position={[gx(b.x), 0, gz(b.y)]} rotation={[0, Math.atan2(b.dx, b.dy), 0]}>
      {[-2.2, 2.2].map((ox, i) => (
        <mesh key={i} position={[ox, 2, 0]}>
          <boxGeometry args={[0.4, 4, 0.4]} />
          <meshStandardMaterial color="#E8A020" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 4, 0]}>
        <boxGeometry args={[4.8, 0.8, 0.4]} />
        <meshStandardMaterial color="#E8A020" emissive="#E8A020" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function Sim({
  route,
  passengers,
  autopilot,
  speed,
  st,
  laneMirror,
  cb,
  setS,
  setInBox,
  setLane,
  onWeak,
  pause,
  brake,
  gas,
  honk,
  night,
}: {
  route: DriveRoute;
  passengers: number;
  autopilot: boolean;
  speed: number;
  st: React.MutableRefObject<{
    s: number; lane: number; obs: { s: number; lane: number; kind: "pothole" | "keke" | "okada"; hit: boolean }[];
    bayIdx: number; vioIdx: number; spawnT: number; done: boolean; seed: number;
  }>;
  laneMirror: React.MutableRefObject<number>;
  cb: React.MutableRefObject<{
    onHazard: (k: "pothole" | "keke" | "okada" | "vio" | "signal") => void;
    onBay: (ok: boolean) => void;
    onFinish: () => void;
    onHonk: (msg: string) => void;
  }>;
  setS: (v: number) => void;
  setInBox: (v: boolean) => void;
  setLane: (v: number) => void;
  onWeak: () => void;
  pause: React.MutableRefObject<number>;
  brake: React.MutableRefObject<boolean>;
  gas: React.MutableRefObject<boolean>;
  honk: React.MutableRefObject<number>;
  night: boolean;
}) {
  const mic = useRef<THREE.Group>(null!);
  const wheels = useRef<(THREE.Mesh | null)[]>([]);
  const lastHonk = useRef(0);
  const ema = useRef(1 / 60);
  const bad = useRef(0);
  const fired = useRef(false);
  const weak = useRef(onWeak);
  weak.current = onWeak;

  useFrame((state, rawDt) => {
    const dt = Math.min(0.05, rawDt);
    const d = Math.min(dt, 0.25);
    ema.current = ema.current * 0.95 + d * 0.05;
    if (ema.current > 0.055) bad.current += d;
    else bad.current = Math.max(0, bad.current - d * 2);
    if (bad.current > 3 && !fired.current) {
      fired.current = true;
      weak.current();
    }

    const c = st.current;
    if (c.done) return;
    if (!autopilot) c.lane = laneMirror.current;
    // horn: scatter the nearest keke/okada ahead in our lane
    if (honk.current > lastHonk.current) {
      lastHonk.current = honk.current;
      const target = c.obs
        .filter((o) => !o.hit && o.kind !== "pothole" && o.s > c.s && o.s - c.s < 0.07 && o.lane === c.lane)
        .sort((a, b) => a.s - b.s)[0];
      if (target) {
        target.hit = true;
        cb.current.onHonk(`📯 PÒÒN!! The ${target.kind} comot road sharply. Conductor hails you.`);
      } else {
        cb.current.onHonk("📯 PÒÒN!! Echo for empty road. Everybody look your face.");
      }
    }
    // bay halt: micra waits while passengers board
    if (pause.current > 0) {
      pause.current -= dt;
    } else {
      const prevS = c.s;
      let held = false;
      if (autopilot) {
        // autopilot respects red lights: hold before the line
        for (let si = 0; si < route.signals.length; si++) {
          const sig = route.signals[si];
          if (sig > c.s && sig - c.s < 0.022 && signalIsRed(si, performance.now())) {
            held = true;
            break;
          }
        }
      }
      if (!held) {
        const mult = autopilot ? 1 : brake.current ? 0.35 : gas.current ? 1.6 : 1;
        c.s = Math.min(1, c.s + speed * mult * dt);
        engineSpeed(autopilot ? 0.35 : 0.45 + c.s * 0.4 + (gas.current ? 0.45 : 0) - (brake.current ? 0.25 : 0));
      }
      // red-light runners get fined (drive mode only)
      if (!autopilot) {
        for (let si = 0; si < route.signals.length; si++) {
          const sig = route.signals[si];
          if (prevS < sig && c.s >= sig && signalIsRed(si, performance.now())) {
            cb.current.onHazard("signal");
          }
        }
      }
    }
    setS(c.s);

    if (autopilot) {
      const ahead = c.obs.filter((o) => !o.hit && o.s > c.s && o.s - c.s < 0.03 && o.lane === c.lane);
      if (ahead.length > 0) {
        const free = [-1, 0, 1].filter(
          (l) => !c.obs.some((o) => !o.hit && o.s > c.s && o.s - c.s < 0.04 && o.lane === l)
        );
        if (free.length > 0) {
          c.lane = free[0];
          setLane(free[0]);
          laneMirror.current = free[0];
        }
      }
      const bays = route.bays;
      if (c.bayIdx < bays.length && Math.abs(c.s - bays[c.bayIdx]) < 0.004) {
        c.bayIdx++;
        cb.current.onBay(true);
      }
    }

    if (!autopilot) {
      c.spawnT -= dt;
      if (c.spawnT <= 0 && c.s < 0.94) {
        c.spawnT = 1.0;
        const n = Math.floor(c.s * 200);
        const lanePick = Math.floor(hash01("d3lane" + c.seed, n + 7) * 3) - 1;
        const r = hash01("d3spawn" + c.seed, n);
        const wPot = 1 + route.potholes * 1.5;
        const roll = hash01("d3kind" + c.seed, n + 13) * (wPot + 4);
        const kind = roll < wPot ? "pothole" : roll < wPot + 2 ? "keke" : "okada";
        c.obs.push({ s: Math.min(0.99, c.s + 0.2 + r * 0.06), lane: lanePick, kind, hit: false });
      }
    }

    const bay = route.bays[c.bayIdx];
    setInBox(bay !== undefined && Math.abs(c.s - bay) < 0.009 && !autopilot);
    if (c.vioIdx < route.vio.length && c.s >= route.vio[c.vioIdx]) {
      c.vioIdx++;
      cb.current.onHazard("vio");
    }
    for (const o of c.obs) {
      if (!o.hit && Math.abs(o.s - c.s) < 0.004 && o.lane === c.lane) {
        o.hit = true;
        cb.current.onHazard(o.kind);
      }
    }
    c.obs = c.obs.filter((o) => o.s > c.s - 0.03);

    if (c.s >= 1) {
      c.done = true;
      cb.current.onFinish();
      return;
    }

    // micra transform
    const me = samplePolyline(route.pts, c.s);
    const mx = gx(me.x + -me.dy * (c.lane * LANE_W));
    const mz = gz(me.y + me.dx * (c.lane * LANE_W));
    const m = mic.current;
    m.position.set(mx, 0, mz);
    m.rotation.y = Math.atan2(me.dx, me.dy);
    for (const w of wheels.current) {
      if (w) w.rotation.x += dt * 9;
    }

    // chase camera
    const cam = state.camera;
    const hx = me.dx;
    const hz = me.dy;
    const want = new THREE.Vector3(mx - hx * 11, 8.5, mz - hz * 11);
    cam.position.lerp(want, Math.min(1, dt * 3.5));
    cam.lookAt(mx + hx * 6, 1, mz + hz * 6);
  });

  return (
    <group>
      {/* micra: maroon body, yellow cabin, face of travel */}
      <group ref={mic}>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[1.9, 0.9, 4]} />
          <meshStandardMaterial color="#5A1F2B" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.3, -0.3]}>
          <boxGeometry args={[1.6, 0.85, 2.6]} />
          <meshStandardMaterial color="#F5C518" roughness={0.7} />
        </mesh>
        {/* rooftop luggage when fully loaded, like the real park hustle */}
        {passengers >= 6 && (
          <group position={[0, 2.05, -0.5]}>
            <mesh position={[-0.4, 0, 0]}>
              <boxGeometry args={[0.8, 0.5, 1.1]} />
              <meshStandardMaterial color="#6b4226" roughness={0.9} />
            </mesh>
            <mesh position={[0.45, 0.05, 0.1]}>
              <boxGeometry args={[0.7, 0.4, 0.9]} />
              <meshStandardMaterial color="#3b82c4" roughness={0.85} />
            </mesh>
            <mesh position={[0.45, 0.32, 0.1]}>
              <boxGeometry args={[0.72, 0.08, 0.92]} />
              <meshStandardMaterial color="#F2EDE4" roughness={0.85} />
            </mesh>
          </group>
        )}
        <mesh position={[0, 1.25, 1.35]}>
          <boxGeometry args={[1.4, 0.6, 0.15]} />
          <meshStandardMaterial color="#DCE9EC" roughness={0.4} />
        </mesh>
        {[-0.75, 0.75].map((ox, i) => (
          <mesh key={i} position={[ox, 1.1, 2.02]}>
            <sphereGeometry args={[0.16, 8, 8]} />
            <meshStandardMaterial color="#FFE9B8" emissive="#FFE9B8" emissiveIntensity={1.2} />
          </mesh>
        ))}
        {/* headlight cones (apex at lamp, widening forward) */}
        {[-0.75, 0.75].map((ox, i) => (
          <mesh key={`c${i}`} position={[ox, 0.9, 6.5]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[1.7, 9, 12, 1, true]} />
            <meshBasicMaterial color="#FFE9B8" transparent opacity={night ? 0.3 : 0.13} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
        {[-0.75, 0.75].map((ox, i) => (
          <mesh key={i} position={[ox, 1.0, -2.02]}>
            <boxGeometry args={[0.25, 0.2, 0.1]} />
            <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.8} />
          </mesh>
        ))}
        {[[-0.95, 1.2], [0.95, 1.2], [-0.95, -1.2], [0.95, -1.2]].map(([ox, oz], i) => (
          <mesh
            key={i}
            position={[ox, 0.35, oz]}
            rotation={[0, 0, Math.PI / 2]}
            ref={(m) => {
              wheels.current[i] = m;
            }}
          >
            <cylinderGeometry args={[0.35, 0.35, 0.25, 10]} />
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
        ))}
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.4, 12]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.3} depthWrite={false} />
        </mesh>
      </group>
      {/* dynamic hazards */}
      {st.current.obs
        .filter((o) => !o.hit)
        .map((o, i) => (
          <HazardGlyph key={i} route={route} o={o} />
        ))}
    </group>
  );
}

function HazardGlyph({
  route,
  o,
}: {
  route: { pts: [number, number][] };
  o: { s: number; lane: number; kind: "pothole" | "keke" | "okada" };
}) {
  const b = samplePolyline(route.pts, o.s);
  const px = gx(b.x + -b.dy * (o.lane * LANE_W));
  const pz = gz(b.y + b.dx * (o.lane * LANE_W));
  if (o.kind === "pothole") {
    return (
      <mesh position={[px, 0.07, pz]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 10]} />
        <meshStandardMaterial color="#0c0c0e" roughness={1} />
      </mesh>
    );
  }
  if (o.kind === "keke") {
    return (
      <group position={[px, 0, pz]} rotation={[0, Math.atan2(b.dx, b.dy), 0]}>
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[1.4, 1.2, 1.8]} />
          <meshStandardMaterial color="#22c55e" roughness={0.8} />
        </mesh>
      </group>
    );
  }
  return (
    <group position={[px, 0, pz]} rotation={[0, Math.atan2(b.dx, b.dy), 0]}>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.7, 0.8, 1.7]} />
        <meshStandardMaterial color="#B33A3A" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.3, -0.2]}>
        <boxGeometry args={[0.55, 0.6, 0.55]} />
        <meshStandardMaterial color="#222831" roughness={0.9} />
      </mesh>
    </group>
  );
}
