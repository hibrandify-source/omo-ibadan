"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import {
  ZONES, ROADS, GHOSTS, CROWDS, TRAFFIC, SKINS, CLOTHS,
  CROWD_CAP_SAVER, TRAFFIC_CAP_SAVER, DOORS,
  buildBlockers, zoneCenter, type Door,
} from "@/lib/world";
import { hash01 } from "@/lib/iso";
import type { Teleport } from "./IsoWorld";
import type { Rider } from "@/lib/useRiders";

// Grid tiles → world units (must match World3D mapping).
const T = 2;
const W2G = (x: number, z: number) => ({ gx: x / T + 19, gy: z / T + 14 });
const G2W = (gx: number, gy: number) => ({ x: (gx - 19) * T, z: (gy - 14) * T });

const WBLOCKS = buildBlockers().map((b) => ({
  x: (b.x - 19) * T,
  z: (b.y - 14) * T,
  w: b.w * T,
  d: b.d * T,
}));

function collide(p: { x: number; z: number }, r = 0.56) {
  p.x = Math.max(-39, Math.min(39, p.x));
  p.z = Math.max(-29, Math.min(29, p.z));
  for (const b of WBLOCKS) {
    const nx = Math.max(b.x, Math.min(b.x + b.w, p.x));
    const nz = Math.max(b.z, Math.min(b.z + b.d, p.z));
    const dx = p.x - nx;
    const dz = p.z - nz;
    const d2 = dx * dx + dz * dz;
    if (d2 < r * r) {
      if (d2 > 0.0001) {
        const d = Math.sqrt(d2);
        p.x = nx + (dx / d) * r;
        p.z = nz + (dz / d) * r;
      } else {
        p.z = b.z + b.d + r;
      }
    }
  }
}

function zoneAt(x: number, z: number): string {
  const { gx, gy } = W2G(x, z);
  for (const zn of ZONES) {
    if (gx >= zn.gx && gx <= zn.gx + zn.w && gy >= zn.gy && gy <= zn.gy + zn.d) return zn.id;
  }
  return "";
}

function pill(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function makeTag(main: string, sub?: string): THREE.Sprite {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = sub ? 72 : 48;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgba(12,9,6,0.62)";
  const h = sub ? 72 : 48;
  pill(g, 2, 2, 252, h - 4, 14);
  g.fill();
  g.textAlign = "center";
  g.fillStyle = "#FAF6F0";
  g.font = "700 26px Sora, sans-serif";
  g.fillText(main.slice(0, 18), 128, sub ? 30 : 32);
  if (sub) {
    g.fillStyle = "#E8A020";
    g.font = "700 20px Sora, sans-serif";
    g.fillText(sub.slice(0, 22), 128, 58);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 2;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(6.4, sub ? 1.8 : 1.2, 1);
  return sp;
}

export interface WalkRefs {
  keys: Set<string>;
  joy: { x: number; y: number; on: boolean };
  moved: boolean;
}

interface GhostRt { x: number; z: number; leg: number; dwell: number; walk: number; stuck: number }
interface CrowdRt {
  x: number; z: number; tx: number; tz: number; walk: number; moving: boolean;
  pause: number; speed: number; skin: number; cloth: number; gear: number; hf: number; stuck: number;
  zone: { gx: number; gy: number; w: number; d: number };
}

const PLAYER_SPEED = 10; // world units/sec

export default function Walk3D({
  playerName,
  playerTitle,
  avatarColor,
  fem,
  skin,
  gear,
  homeZone,
  teleport,
  onZoneEnter,
  refs,
  avatarPos,
  saver,
  phase,
  hood,
  net,
  onDoor,
}: {
  playerName: string;
  playerTitle: string;
  avatarColor: string;
  fem: boolean;
  skin: string;
  gear: "fila" | "gele" | "none" | "braids" | "afro";
  homeZone: string;
  teleport: Teleport | null;
  onZoneEnter: (id: string) => void;
  refs: React.MutableRefObject<WalkRefs>;
  avatarPos: React.MutableRefObject<{ x: number; z: number }>;
  saver: boolean;
  phase: "day" | "amber" | "night";
  hood: string;
  net: { ref: React.MutableRefObject<Map<string, Rider>>; version: number; send: (r: Omit<Rider, "id" | "at">) => void };
  onDoor: (door: Door | null) => void;
}) {
  const cb = useRef(onZoneEnter);
  cb.current = onZoneEnter;
  const doorCb = useRef(onDoor);
  doorCb.current = onDoor;
  const doorHere = useRef<string | null>(null);
  const [nearDoor, setNearDoor] = useState<string | null>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const netRef = useRef(net);
  netRef.current = net;
  const hoodRef = useRef(hood);
  hoodRef.current = hood;

  const home = useMemo(() => {
    const z = ZONES.find((zz) => zz.id === homeZone) ?? ZONES[0];
    const c = zoneCenter(z);
    const w = G2W(c.x, c.y + 1.2);
    return w;
  }, [homeZone]);

  const av = useRef({ ...home, tx: null as number | null, tz: null as number | null, walk: 0, moving: false });
  const zone = useRef("");
  const group = useRef<THREE.Group>(null!);
  const pArmL = useRef<THREE.Mesh>(null!);
  const pArmR = useRef<THREE.Mesh>(null!);
  const pLegL = useRef<THREE.Mesh>(null!);
  const pLegR = useRef<THREE.Mesh>(null!);

  const ghosts: GhostRt[] = useMemo(
    () =>
      GHOSTS.map((g) => {
        const w = G2W(g.pts[0][0], g.pts[0][1]);
        return { x: w.x, z: w.z, leg: 0, dwell: 2, walk: 0, stuck: 0 };
      }),
    []
  );
  const ghostPts = useMemo(() => GHOSTS.map((g) => g.pts.map(([a, b]) => G2W(a, b))), []);

  const crowd: CrowdRt[] = useMemo(() => {
    const out: CrowdRt[] = [];
    let ci = 0;
    for (const spec of CROWDS) {
      const z = ZONES.find((zz) => zz.id === spec.zone);
      if (!z) continue;
      for (let k = 0; k < spec.count; k++, ci++) {
        const px = z.gx + 0.5 + hash01("crowd", ci * 3 + 1) * Math.max(0.5, z.w - 1);
        const py = z.gy + 0.5 + hash01("crowd", ci * 3 + 2) * Math.max(0.5, z.d - 1);
        const w = G2W(px, py);
        out.push({
          x: w.x, z: w.z, tx: w.x, tz: w.z,
          walk: hash01("crowd", ci) * 6, moving: false, pause: hash01("crowd", ci * 5) * 5,
          speed: (0.8 + hash01("crowd", ci * 11) * 1.0) * T,
          skin: Math.floor(hash01("crowd", ci * 13) * SKINS.length) % SKINS.length,
          cloth: Math.floor(hash01("crowd", ci * 17) * CLOTHS.length) % CLOTHS.length,
          gear: Math.floor(hash01("crowd", ci * 19) * 4),
          hf: 0.9 + hash01("crowd", ci * 23) * 0.2,
          stuck: 0,
          zone: { gx: z.gx, gy: z.gy, w: z.w, d: z.d },
        });
      }
    }
    return out;
  }, []);

  const traffic = useMemo(() => TRAFFIC.map((v) => ({ ...v })), []);

  // teleport (Go home)
  useLayoutEffect(() => {
    if (!teleport) return;
    const w = G2W(teleport.x, teleport.y);
    av.current.x = w.x;
    av.current.z = w.z;
    av.current.tx = null;
    av.current.tz = null;
    avatarPos.current = { x: w.x, z: w.z };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teleport?.key]);

  // instanced bodies/heads/shadows/limbs/headgear for crowds + ghosts
  const bodyRef = useRef<THREE.InstancedMesh>(null!);
  const headRef = useRef<THREE.InstancedMesh>(null!);
  const shadRef = useRef<THREE.InstancedMesh>(null!);
  const armLRef = useRef<THREE.InstancedMesh>(null!);
  const armRRef = useRef<THREE.InstancedMesh>(null!);
  const legLRef = useRef<THREE.InstancedMesh>(null!);
  const legRRef = useRef<THREE.InstancedMesh>(null!);
  const filaRef = useRef<THREE.InstancedMesh>(null!);
  const geleRef = useRef<THREE.InstancedMesh>(null!);
  const handLRef = useRef<THREE.InstancedMesh>(null!);
  const handRRef = useRef<THREE.InstancedMesh>(null!);
  const shoeLRef = useRef<THREE.InstancedMesh>(null!);
  const shoeRRef = useRef<THREE.InstancedMesh>(null!);
  const braidRef = useRef<THREE.InstancedMesh>(null!);
  const afroRef = useRef<THREE.InstancedMesh>(null!);
  const bodyGeo = useMemo(() => new THREE.CapsuleGeometry(0.4, 1.2, 3, 8), []);
  const headGeo = useMemo(() => new THREE.SphereGeometry(0.36, 10, 8), []);
  const shadGeo = useMemo(() => new THREE.CircleGeometry(0.65, 12), []);
  const limbGeo = useMemo(() => new THREE.CapsuleGeometry(0.12, 0.65, 3, 6), []);
  const legGeo = useMemo(() => new THREE.CapsuleGeometry(0.15, 0.75, 3, 6), []);
  const filaGeo = useMemo(() => new THREE.ConeGeometry(0.4, 0.45, 10), []);
  const geleGeo = useMemo(() => new THREE.SphereGeometry(0.5, 10, 8), []);
  const handGeo = useMemo(() => new THREE.SphereGeometry(0.15, 8, 6), []);
  const shoeGeo = useMemo(() => new THREE.BoxGeometry(0.26, 0.16, 0.44), []);
  const braidGeo = useMemo(() => new THREE.ConeGeometry(0.3, 0.85, 8), []);
  const afroGeo = useMemo(() => new THREE.SphereGeometry(0.62, 10, 8), []);
  const pbrMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.9 }), []);
  const headMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.8 }), []);
  const legMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#222831", roughness: 0.9 }), []);
  const gearMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.85 }), []);
  const hairMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#14100c", roughness: 0.95 }), []);
  const shoeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#14100c", roughness: 0.9 }), []);
  const shadMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#000000", transparent: true, opacity: 0.28, depthWrite: false }),
    []
  );

  const total = crowd.length + GHOSTS.length;
  // gear per index: crowds cycle fila/gele/braids/afro, ghosts from fem
  const gearOf = useMemo(() => {
    const arr: ("fila" | "gele" | "none" | "braids" | "afro")[] = [];
    for (let i = 0; i < crowd.length; i++) {
      arr.push((["fila", "gele", "braids", "afro"] as const)[crowd[i].gear % 4]);
    }
    GHOSTS.forEach((gg) => arr.push(gg.fem ? "gele" : "fila"));
    return arr;
  }, [crowd]);
  useLayoutEffect(() => {
    const c = new THREE.Color();
    for (let i = 0; i < crowd.length; i++) {
      bodyRef.current.setColorAt(i, c.set(CLOTHS[crowd[i].cloth]));
      headRef.current.setColorAt(i, c.set(SKINS[crowd[i].skin]));
      armLRef.current.setColorAt(i, c.set(CLOTHS[crowd[i].cloth]));
      armRRef.current.setColorAt(i, c.set(CLOTHS[crowd[i].cloth]));
      handLRef.current.setColorAt(i, c.set(SKINS[crowd[i].skin]));
      handRRef.current.setColorAt(i, c.set(SKINS[crowd[i].skin]));
      filaRef.current.setColorAt(i, c.set(CLOTHS[crowd[i].cloth]));
      geleRef.current.setColorAt(i, c.set(CLOTHS[crowd[i].cloth]));
    }
    GHOSTS.forEach((g, gi) => {
      const i = crowd.length + gi;
      bodyRef.current.setColorAt(i, c.set(g.color));
      headRef.current.setColorAt(i, c.set(g.skin));
      armLRef.current.setColorAt(i, c.set(g.color));
      armRRef.current.setColorAt(i, c.set(g.color));
      handLRef.current.setColorAt(i, c.set(g.skin));
      handRRef.current.setColorAt(i, c.set(g.skin));
      filaRef.current.setColorAt(i, c.set(g.color));
      geleRef.current.setColorAt(i, c.set(g.color));
    });
    for (const r of [bodyRef, headRef, armLRef, armRRef, handLRef, handRRef, filaRef, geleRef]) {
      if (r.current.instanceColor) r.current.instanceColor.needsUpdate = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // name tags
  const tags = useMemo(() => {
    const arr: THREE.Sprite[] = [];
    GHOSTS.forEach((g) => arr.push(makeTag(g.name)));
    return arr;
  }, []);
  const playerTag = useMemo(() => makeTag(playerName, playerTitle), [playerName, playerTitle]);

  useFrame((state, rawDt) => {
    const dt = Math.min(0.05, rawDt);
    const a = av.current;
    const R = refs.current;
    const night = phaseRef.current === "night";

    // input → world axes (camera looks from +x+z; screen-right=(1,0,-1), screen-up=(-1,0,-1))
    const SQ = Math.SQRT1_2;
    let ix = 0;
    let iz = 0;
    const k = R.keys;
    if (k.has("w") || k.has("arrowup")) { ix += -SQ; iz += -SQ; }
    if (k.has("s") || k.has("arrowdown")) { ix += SQ; iz += SQ; }
    if (k.has("d") || k.has("arrowright")) { ix += SQ; iz += -SQ; }
    if (k.has("a") || k.has("arrowleft")) { ix += -SQ; iz += SQ; }
    if (R.joy.on) {
      // screen-right=(+x,-z), screen-up=(-x,-z): right*jx + up*(-jy)
      ix = SQ * R.joy.x + -SQ * -R.joy.y;
      iz = -SQ * R.joy.x + -SQ * -R.joy.y;
    }
    if (ix !== 0 || iz !== 0) {
      a.tx = null;
      a.tz = null;
      const len = Math.hypot(ix, iz) || 1;
      const sp = Math.min(1, len) * PLAYER_SPEED;
      a.x += (ix / len) * sp * dt;
      a.z += (iz / len) * sp * dt;
      a.moving = true;
      a.walk += dt * 10;
    } else if (a.tx !== null && a.tz !== null) {
      const dx = a.tx - a.x;
      const dz = a.tz - a.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.35) {
        a.tx = null;
        a.tz = null;
        a.moving = false;
      } else {
        a.x += (dx / dist) * PLAYER_SPEED * dt;
        a.z += (dz / dist) * PLAYER_SPEED * dt;
        a.moving = true;
        a.walk += dt * 10;
      }
    } else {
      a.moving = false;
    }
    collide(a);
    avatarPos.current.x = a.x;
    avatarPos.current.z = a.z;
    // broadcast presence (hook throttles + heartbeat)
    netRef.current.send({
      name: playerName,
      hood: hoodRef.current,
      x: a.x / 2 + 19,
      y: a.z / 2 + 14,
      moving: a.moving,
      top: avatarColor,
      skin,
      gear,
    });
    const az = zoneAt(a.x, a.z);
    if (az && az !== zone.current) {
      zone.current = az;
      cb.current(az);
    } else if (!az) zone.current = "";
    // door proximity (2.6 world units ≈ 1.3 tiles)
    {
      let best: Door | null = null;
      let bestD = 2.6;
      for (const d of DOORS) {
        const w = G2W(d.x, d.y);
        const dd = Math.hypot(a.x - w.x, a.z - w.z);
        if (dd < bestD) {
          bestD = dd;
          best = d;
        }
      }
      const key = best ? best.id : null;
      if (key !== doorHere.current) {
        doorHere.current = key;
        doorCb.current(best);
        setNearDoor(key);
      }
    }

    // ghosts
    GHOSTS.forEach((g, gi) => {
      const st = ghosts[gi];
      if (g.nightOnly && !night) return;
      if (st.dwell > 0) {
        st.dwell -= dt;
        st.stuck = 0;
        return;
      }
      const wpt = ghostPts[gi][st.leg % ghostPts[gi].length];
      const dx = wpt.x - st.x;
      const dz = wpt.z - st.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.8) {
        st.leg = (st.leg + 1) % ghostPts[gi].length;
        st.dwell = g.dwell;
        st.stuck = 0;
      } else {
        const ox = st.x;
        const oz = st.z;
        const sp = g.speed * T;
        st.x += (dx / dist) * sp * dt;
        st.z += (dz / dist) * sp * dt;
        st.walk += dt * 9;
        collide(st);
        if (Math.hypot(st.x - ox, st.z - oz) < sp * dt * 0.25) {
          st.stuck += dt;
          if (st.stuck > 2.5) {
            st.leg = (st.leg + 1) % ghostPts[gi].length;
            st.dwell = 1;
            st.stuck = 0;
          }
        } else st.stuck = 0;
      }
    });

    // crowds
    const cap = saver ? CROWD_CAP_SAVER : crowd.length;
    for (let i = 0; i < crowd.length; i++) {
      const c = crowd[i];
      if (i >= cap || (night && i % 5 !== 0)) {
        c.moving = false;
        continue;
      }
      if (c.pause > 0) {
        c.pause -= dt;
        c.moving = false;
        c.stuck = 0;
        continue;
      }
      const dx = c.tx - c.x;
      const dz = c.tz - c.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.5) {
        c.pause = 2 + hash01("crowd", i * 7 + Math.floor(state.clock.elapsedTime / 4)) * 7;
        const zn = c.zone;
        const wpt = G2W(
          zn.gx + 0.5 + hash01("crowd", i * 3 + 1 + Math.floor(state.clock.elapsedTime / 9)) * Math.max(0.5, zn.w - 1),
          zn.gy + 0.5 + hash01("crowd", i * 3 + 2 + Math.floor(state.clock.elapsedTime / 9)) * Math.max(0.5, zn.d - 1)
        );
        c.tx = wpt.x;
        c.tz = wpt.z;
        c.stuck = 0;
        c.moving = false;
      } else {
        const ox = c.x;
        const oz = c.z;
        c.x += (dx / dist) * c.speed * dt;
        c.z += (dz / dist) * c.speed * dt;
        c.walk += dt * 9;
        collide(c);
        c.moving = true;
        if (Math.hypot(c.x - ox, c.z - oz) < c.speed * dt * 0.25) {
          c.stuck += dt;
          if (c.stuck > 2) {
            c.tx = c.x + (hash01("crowd", i * 29 + Math.floor(state.clock.elapsedTime / 2)) - 0.5) * 8;
            c.tz = c.z + (hash01("crowd", i * 31 + Math.floor(state.clock.elapsedTime / 2)) - 0.5) * 8;
            c.stuck = 0;
          }
        } else c.stuck = 0;
      }
    }

    // traffic
    const tCap = saver ? 5 : traffic.length;
    traffic.forEach((v, i) => {
      if (i >= tCap) return;
      v.t = (v.t + v.speed * dt * v.dir + 1) % 1;
    });

    // write instance matrices
    const dummy = moduleDummy;
    let n = 0;
    const hide = () => {
      dummy.position.set(0, -50, 0);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(0.001, 0.001, 0.001);
      dummy.updateMatrix();
      bodyRef.current.setMatrixAt(n, dummy.matrix);
      headRef.current.setMatrixAt(n, dummy.matrix);
      shadRef.current.setMatrixAt(n, dummy.matrix);
      armLRef.current.setMatrixAt(n, dummy.matrix);
      armRRef.current.setMatrixAt(n, dummy.matrix);
      legLRef.current.setMatrixAt(n, dummy.matrix);
      legRRef.current.setMatrixAt(n, dummy.matrix);
      filaRef.current.setMatrixAt(n, dummy.matrix);
      geleRef.current.setMatrixAt(n, dummy.matrix);
      handLRef.current.setMatrixAt(n, dummy.matrix);
      handRRef.current.setMatrixAt(n, dummy.matrix);
      shoeLRef.current.setMatrixAt(n, dummy.matrix);
      shoeRRef.current.setMatrixAt(n, dummy.matrix);
      braidRef.current.setMatrixAt(n, dummy.matrix);
      afroRef.current.setMatrixAt(n, dummy.matrix);
      n++;
    };
    const put = (x: number, z: number, walk: number, moving: boolean, hf: number, gear: "fila" | "gele" | "none" | "braids" | "afro") => {
      const bob = moving ? Math.abs(Math.sin(walk)) * 0.14 : 0;
      const swing = moving ? Math.sin(walk) * 0.55 : 0;
      dummy.position.set(x, 1.35 * hf + bob, z);
      dummy.scale.set(hf, hf, hf);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      bodyRef.current.setMatrixAt(n, dummy.matrix);
      dummy.position.set(x, 2.62 * hf + bob, z);
      dummy.updateMatrix();
      headRef.current.setMatrixAt(n, dummy.matrix);
      dummy.position.set(x, 0.03, z);
      dummy.rotation.set(-Math.PI / 2, 0, 0);
      dummy.updateMatrix();
      shadRef.current.setMatrixAt(n, dummy.matrix);
      dummy.rotation.set(0, 0, 0);
      // arms (sleeves) swing opposite, legs counter-swing
      dummy.position.set(x - 0.5 * hf, 1.95 * hf + bob, z);
      dummy.rotation.set(swing, 0, 0);
      dummy.updateMatrix();
      armLRef.current.setMatrixAt(n, dummy.matrix);
      dummy.position.set(x + 0.5 * hf, 1.95 * hf + bob, z);
      dummy.rotation.set(-swing, 0, 0);
      dummy.updateMatrix();
      armRRef.current.setMatrixAt(n, dummy.matrix);
      dummy.position.set(x - 0.2 * hf, 0.75 * hf, z);
      dummy.rotation.set(-swing * 0.8, 0, 0);
      dummy.updateMatrix();
      legLRef.current.setMatrixAt(n, dummy.matrix);
      dummy.position.set(x + 0.2 * hf, 0.75 * hf, z);
      dummy.rotation.set(swing * 0.8, 0, 0);
      dummy.updateMatrix();
      legRRef.current.setMatrixAt(n, dummy.matrix);
      dummy.rotation.set(0, 0, 0);
      // hands ride the arm ends, shoes ride the leg ends
      const cL = Math.cos(swing);
      const sL = Math.sin(swing);
      dummy.position.set(x - 0.5 * hf, 1.95 * hf - 0.5 * hf * cL + bob, z - 0.5 * hf * sL);
      dummy.scale.set(hf, hf, hf);
      dummy.updateMatrix();
      handLRef.current.setMatrixAt(n, dummy.matrix);
      dummy.position.set(x + 0.5 * hf, 1.95 * hf - 0.5 * hf * cL + bob, z + 0.5 * hf * sL);
      dummy.updateMatrix();
      handRRef.current.setMatrixAt(n, dummy.matrix);
      const cG = Math.cos(swing * 0.8);
      const sG = Math.sin(swing * 0.8);
      dummy.position.set(x - 0.2 * hf, 0.75 * hf - 0.55 * hf * cG, z + 0.55 * hf * sG);
      dummy.updateMatrix();
      shoeLRef.current.setMatrixAt(n, dummy.matrix);
      dummy.position.set(x + 0.2 * hf, 0.75 * hf - 0.55 * hf * cG, z - 0.55 * hf * sG);
      dummy.updateMatrix();
      shoeRRef.current.setMatrixAt(n, dummy.matrix);
      // headgear
      const headTop = (px: number, py: number, pz: number, sx: number, sy: number, sz: number, rx: number, ref: React.MutableRefObject<THREE.InstancedMesh>) => {
        dummy.position.set(px, py, pz);
        dummy.rotation.set(rx, 0, 0);
        dummy.scale.set(sx, sy, sz);
        dummy.updateMatrix();
        ref.current.setMatrixAt(n, dummy.matrix);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(hf, hf, hf);
      };
      const H = (v: number) => v * hf;
      if (gear === "fila") headTop(x, 3.0 * hf + bob, z, hf, hf, hf, 0, filaRef);
      else headTop(0, -50, 0, 0.001, 0.001, 0.001, 0, filaRef);
      if (gear === "gele") headTop(x, 2.78 * hf + bob, z, H(1.15), H(0.72), H(1.15), 0, geleRef);
      else headTop(0, -50, 0, 0.001, 0.001, 0.001, 0, geleRef);
      if (gear === "braids") headTop(x, 2.72 * hf + bob, z - 0.28 * hf, hf, hf, hf, -0.35, braidRef);
      else headTop(0, -50, 0, 0.001, 0.001, 0.001, 0, braidRef);
      if (gear === "afro") headTop(x, 2.86 * hf + bob, z, H(1.25), H(0.95), H(1.25), 0, afroRef);
      else headTop(0, -50, 0, 0.001, 0.001, 0.001, 0, afroRef);
      n++;
    };
    for (let i = 0; i < crowd.length; i++) {
      const c = crowd[i];
      const vis = i < cap && !(night && i % 5 !== 0);
      if (!vis) {
        hide();
        continue;
      }
      put(c.x, c.z, c.walk, c.moving, c.hf, gearOf[i]);
    }
    GHOSTS.forEach((g, gi) => {
      if (g.nightOnly && !night) {
        hide();
        return;
      }
      const st = ghosts[gi];
      put(st.x, st.z, st.walk, st.dwell <= 0, 1, gearOf[crowd.length + gi]);
    });
    for (const r of [bodyRef, headRef, shadRef, armLRef, armRRef, legLRef, legRRef, filaRef, geleRef]) {
      r.current.instanceMatrix.needsUpdate = true;
    }

    // player group
    if (group.current) {
      group.current.position.set(a.x, a.moving ? Math.abs(Math.sin(a.walk)) * 0.14 : 0, a.z);
      group.current.rotation.z = a.moving ? Math.sin(a.walk) * 0.05 : 0;
      const sw = a.moving ? Math.sin(a.walk) * 0.55 : 0;
      if (pArmL.current) pArmL.current.rotation.x = sw;
      if (pArmR.current) pArmR.current.rotation.x = -sw;
      if (pLegL.current) pLegL.current.rotation.x = -sw * 0.8;
      if (pLegR.current) pLegR.current.rotation.x = sw * 0.8;
    }
  });

  const tapMove = (e: ThreeEvent<MouseEvent>) => {
    if (refs.current.moved) return;
    av.current.tx = e.point.x;
    av.current.tz = e.point.z;
  };

  const tCap = saver ? 5 : traffic.length;

  return (
    <group>
      {/* tap-to-move ground catcher */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} onClick={tapMove}>
        <planeGeometry args={[140, 120]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* player avatar: custom top + skin + headgear, swinging limbs */}
      <group ref={group} position={[av.current.x, 0, av.current.z]}>
        <mesh position={[0, 1.35, 0]}>
          <capsuleGeometry args={[0.4, 1.2, 3, 10]} />
          <meshStandardMaterial color={avatarColor} roughness={0.85} />
        </mesh>
        <mesh position={[0, 2.62, 0]}>
          <sphereGeometry args={[0.36, 12, 10]} />
          <meshStandardMaterial color={skin} roughness={0.8} />
        </mesh>
        <mesh ref={pArmL} position={[-0.5, 1.95, 0]}>
          <capsuleGeometry args={[0.12, 0.65, 3, 6]} />
          <meshStandardMaterial color={avatarColor} roughness={0.85} />
          <mesh position={[0, -0.5, 0]}>
            <sphereGeometry args={[0.15, 8, 6]} />
            <meshStandardMaterial color={skin} roughness={0.8} />
          </mesh>
        </mesh>
        <mesh ref={pArmR} position={[0.5, 1.95, 0]}>
          <capsuleGeometry args={[0.12, 0.65, 3, 6]} />
          <meshStandardMaterial color={avatarColor} roughness={0.85} />
          <mesh position={[0, -0.5, 0]}>
            <sphereGeometry args={[0.15, 8, 6]} />
            <meshStandardMaterial color={skin} roughness={0.8} />
          </mesh>
        </mesh>
        <mesh ref={pLegL} position={[-0.2, 0.75, 0]}>
          <capsuleGeometry args={[0.15, 0.75, 3, 6]} />
          <meshStandardMaterial color="#222831" roughness={0.9} />
          <mesh position={[0, -0.5, 0.08]}>
            <boxGeometry args={[0.26, 0.16, 0.42]} />
            <meshStandardMaterial color="#14100c" roughness={0.9} />
          </mesh>
        </mesh>
        <mesh ref={pLegR} position={[0.2, 0.75, 0]}>
          <capsuleGeometry args={[0.15, 0.75, 3, 6]} />
          <meshStandardMaterial color="#222831" roughness={0.9} />
          <mesh position={[0, -0.5, 0.08]}>
            <boxGeometry args={[0.26, 0.16, 0.42]} />
            <meshStandardMaterial color="#14100c" roughness={0.9} />
          </mesh>
        </mesh>
        {gear === "gele" ? (
          <group position={[0, 2.78, 0]}>
            <mesh scale={[1.15, 0.7, 1.15]}>
              <sphereGeometry args={[0.5, 12, 8]} />
              <meshStandardMaterial color={avatarColor} roughness={0.85} />
            </mesh>
            <mesh position={[0.48, 0.12, 0]}>
              <sphereGeometry args={[0.16, 8, 6]} />
              <meshStandardMaterial color={avatarColor} roughness={0.85} />
            </mesh>
          </group>
        ) : gear === "fila" ? (
          <mesh position={[0, 3.0, 0]}>
            <coneGeometry args={[0.4, 0.45, 10]} />
            <meshStandardMaterial color={avatarColor} roughness={0.85} />
          </mesh>
        ) : gear === "braids" ? (
          <mesh position={[0, 2.72, -0.28]} rotation={[-0.35, 0, 0]}>
            <coneGeometry args={[0.3, 0.85, 8]} />
            <meshStandardMaterial color="#14100c" roughness={0.95} />
          </mesh>
        ) : gear === "afro" ? (
          <mesh position={[0, 2.86, 0]} scale={[1.25, 0.95, 1.25]}>
            <sphereGeometry args={[0.62, 10, 8]} />
            <meshStandardMaterial color="#14100c" roughness={0.95} />
          </mesh>
        ) : (
          <mesh position={[0, 2.68, 0]}>
            <sphereGeometry args={[0.42, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
            <meshStandardMaterial color="#14100c" roughness={0.95} />
          </mesh>
        )}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.7, 12]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.28} depthWrite={false} />
        </mesh>
        <primitive object={playerTag} position={[0, 4.6, 0]} />
      </group>
      {/* crowds + ghosts, instanced */}
      <instancedMesh ref={bodyRef} args={[undefined, undefined, total]} frustumCulled={false}>
        <capsuleGeometry args={[0.4, 1.2, 3, 8]} />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={headRef} args={[undefined, undefined, total]} frustumCulled={false}>
        <sphereGeometry args={[0.36, 10, 8]} />
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={shadRef} args={[undefined, undefined, total]} frustumCulled={false}>
        <circleGeometry args={[0.65, 10]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.28} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={armLRef} args={[undefined, undefined, total]} frustumCulled={false}>
        <capsuleGeometry args={[0.12, 0.65, 3, 6]} />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={armRRef} args={[undefined, undefined, total]} frustumCulled={false}>
        <capsuleGeometry args={[0.12, 0.65, 3, 6]} />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={legLRef} args={[undefined, undefined, total]} frustumCulled={false}>
        <capsuleGeometry args={[0.15, 0.75, 3, 6]} />
        <meshStandardMaterial color="#222831" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={legRRef} args={[undefined, undefined, total]} frustumCulled={false}>
        <capsuleGeometry args={[0.15, 0.75, 3, 6]} />
        <meshStandardMaterial color="#222831" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={filaRef} args={[undefined, undefined, total]} frustumCulled={false}>
        <coneGeometry args={[0.4, 0.45, 10]} />
        <meshStandardMaterial roughness={0.85} />
      </instancedMesh>
      <instancedMesh ref={geleRef} args={[undefined, undefined, total]} frustumCulled={false}>
        <sphereGeometry args={[0.5, 12, 8]} />
        <meshStandardMaterial roughness={0.85} />
      </instancedMesh>
      <instancedMesh ref={handLRef} args={[undefined, undefined, total]} frustumCulled={false}>
        <sphereGeometry args={[0.15, 8, 6]} />
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={handRRef} args={[undefined, undefined, total]} frustumCulled={false}>
        <sphereGeometry args={[0.15, 8, 6]} />
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={shoeLRef} args={[undefined, undefined, total]} frustumCulled={false}>
        <boxGeometry args={[0.26, 0.16, 0.44]} />
        <meshStandardMaterial color="#14100c" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={shoeRRef} args={[undefined, undefined, total]} frustumCulled={false}>
        <boxGeometry args={[0.26, 0.16, 0.44]} />
        <meshStandardMaterial color="#14100c" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={braidRef} args={[undefined, undefined, total]} frustumCulled={false}>
        <coneGeometry args={[0.3, 0.85, 8]} />
        <meshStandardMaterial color="#14100c" roughness={0.95} />
      </instancedMesh>
      <instancedMesh ref={afroRef} args={[undefined, undefined, total]} frustumCulled={false}>
        <sphereGeometry args={[0.62, 10, 8]} />
        <meshStandardMaterial color="#14100c" roughness={0.95} />
      </instancedMesh>
      {/* seated townsfolk: market + park sitters */}
      <Seated />
      <DoorMarks nearId={nearDoor} />
      {/* ghost name tags */}
      {GHOSTS.map((g, gi) => (
        <GhostTag key={g.name} sprite={tags[gi]} ghosts={ghosts} gi={gi} nightOnly={!!g.nightOnly} night={phaseRef.current === "night"} />
      ))}
      {/* live hustlers from the broadcast channel */}
      <RemoteRiders net={netRef.current} />
      {/* traffic */}
      {traffic.map((v, i) => (
        <Vehicle key={i} v={v} hidden={i >= tCap} night={phase === "night"} />
      ))}
    </group>
  );
}

// shared dummy for per-frame instance matrix writes
const moduleDummy = new THREE.Object3D();

// ground-sitting townsfolk (static): Bodija, Oja Oba, Iwo shelter, Agodi
const SITTERS: { gx: number; gy: number; cloth: string; skin: string; rot: number }[] = [
  { gx: 15, gy: 13.9, cloth: "#8a4fb0", skin: "#3b2317", rot: Math.PI },
  { gx: 24, gy: 21.3, cloth: "#0e7a8a", skin: "#5a3a26", rot: Math.PI },
  { gx: 31.5, gy: 18.1, cloth: "#c2185b", skin: "#3b2317", rot: -Math.PI / 2 },
  { gx: 14, gy: 20, cloth: "#455a64", skin: "#5a3a26", rot: 0.6 },
];

function Seated() {
  return (
    <group>
      {SITTERS.map((s, i) => (
        <group key={i} position={[(s.gx - 19) * 2, 0, (s.gy - 14) * 2]} rotation={[0, s.rot, 0]}>
          <mesh position={[0, 0.62, 0]}>
            <capsuleGeometry args={[0.4, 0.6, 3, 8]} />
            <meshStandardMaterial color={s.cloth} roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.5, 0.1]}>
            <sphereGeometry args={[0.38, 10, 8]} />
            <meshStandardMaterial color={s.skin} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.3, 0.55]}>
            <boxGeometry args={[0.9, 0.3, 0.7]} />
            <meshStandardMaterial color={s.cloth} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.7, 10]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.25} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Glowing door mats + labels. The near one flares amber.
function DoorMarks({ nearId }: { nearId: string | null }) {
  const tags = useMemo(() => {
    const m = new Map<string, THREE.Sprite>();
    for (const d of DOORS) m.set(d.id, makeTag(d.label, "ENTER ↓"));
    return m;
  }, []);
  useEffect(
    () => () => {
      for (const t of tags.values()) {
        t.material.map?.dispose();
        t.material.dispose();
      }
    },
    [tags]
  );
  return (
    <group>
      {DOORS.map((d) => {
        const w = G2W(d.x, d.y);
        const open = nearId === d.id;
        return (
          <group key={d.id} position={[w.x, 0, w.z]}>
            <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[1.1, 20]} />
              <meshBasicMaterial color={open ? "#E8A020" : "#7A4A2B"} transparent opacity={open ? 0.9 : 0.5} depthWrite={false} />
            </mesh>
            {[-0.9, 0.9].map((ox, i) => (
              <mesh key={i} position={[ox, 1, 0]}>
                <boxGeometry args={[0.18, 2, 0.18]} />
                <meshStandardMaterial
                  color="#3a3a3e"
                  emissive={open ? "#E8A020" : "#000000"}
                  emissiveIntensity={open ? 0.9 : 0}
                  roughness={0.8}
                />
              </mesh>
            ))}
            <mesh position={[0, 2.1, 0]}>
              <boxGeometry args={[2, 0.25, 0.25]} />
              <meshStandardMaterial
                color="#3a3a3e"
                emissive={open ? "#E8A020" : "#000000"}
                emissiveIntensity={open ? 0.9 : 0}
                roughness={0.8}
              />
            </mesh>
            <primitive object={tags.get(d.id)!} position={[0, 3.4, 0]} />
          </group>
        );
      })}
    </group>
  );
}

function GhostTag({ sprite, ghosts, gi, nightOnly, night }: { sprite: THREE.Sprite; ghosts: { x: number; z: number }[]; gi: number; nightOnly: boolean; night: boolean }) {
  const ref = useRef<THREE.Sprite>(null!);
  useFrame(() => {
    const st = ghosts[gi];
    ref.current.position.set(st.x, 3.9, st.z);
    ref.current.visible = !(nightOnly && !night);
  });
  return <primitive ref={ref} object={sprite} />;
}

// Live hustlers from the broadcast channel. Positions lerp toward the
// latest packet (5Hz) so motion stays smooth between updates.
function RemoteRiders({ net }: { net: { ref: React.MutableRefObject<Map<string, Rider>>; version: number } }) {
  const riders = useMemo(() => [...net.ref.current.values()], [net.version]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <group>
      {riders.map((r) => (
        <RemoteRider key={r.id} rider={r} live={() => net.ref.current.get(r.id)} />
      ))}
    </group>
  );
}

function RemoteRider({
  rider,
  live,
}: {
  rider: Rider;
  live: () => Rider | undefined;
}) {
  const ref = useRef<THREE.Group>(null!);
  const tag = useMemo(() => makeTag(rider.name, rider.hood), [rider.name, rider.hood]);
  useEffect(() => () => {
    tag.material.map?.dispose();
    tag.material.dispose();
  }, [tag]);
  const wob = useRef(Math.random() * 6);
  useFrame((state, rawDt) => {
    const dt = Math.min(0.05, rawDt);
    const cur = live();
    if (!cur || !ref.current) return;
    const wx = (cur.x - 19) * 2;
    const wz = (cur.y - 14) * 2;
    const k = Math.min(1, dt * 6);
    ref.current.position.x += (wx - ref.current.position.x) * k;
    ref.current.position.z += (wz - ref.current.position.z) * k;
    wob.current += dt * (cur.moving ? 10 : 2);
    ref.current.position.y = cur.moving ? Math.abs(Math.sin(wob.current)) * 0.14 : Math.sin(wob.current) * 0.03;
    ref.current.rotation.z = cur.moving ? Math.sin(wob.current) * 0.05 : 0;
    void state;
  });
  return (
    <group ref={ref} position={[(rider.x - 19) * 2, 0, (rider.y - 14) * 2]}>
      <mesh position={[0, 1.35, 0]}>
        <capsuleGeometry args={[0.4, 1.2, 3, 8]} />
        <meshStandardMaterial color={rider.top} roughness={0.85} />
      </mesh>
      <mesh position={[0, 2.62, 0]}>
        <sphereGeometry args={[0.36, 10, 8]} />
        <meshStandardMaterial color={rider.skin} roughness={0.8} />
      </mesh>
      {rider.gear === "gele" ? (
        <mesh position={[0, 2.78, 0]} scale={[1.15, 0.72, 1.15]}>
          <sphereGeometry args={[0.5, 10, 8]} />
          <meshStandardMaterial color={rider.top} roughness={0.85} />
        </mesh>
      ) : rider.gear === "fila" ? (
        <mesh position={[0, 3.0, 0]}>
          <coneGeometry args={[0.4, 0.45, 10]} />
          <meshStandardMaterial color={rider.top} roughness={0.85} />
        </mesh>
      ) : rider.gear === "braids" ? (
        <mesh position={[0, 2.72, -0.28]} rotation={[-0.35, 0, 0]}>
          <coneGeometry args={[0.3, 0.85, 8]} />
          <meshStandardMaterial color="#14100c" roughness={0.95} />
        </mesh>
      ) : rider.gear === "afro" ? (
        <mesh position={[0, 2.86, 0]} scale={[1.25, 0.95, 1.25]}>
          <sphereGeometry args={[0.62, 10, 8]} />
          <meshStandardMaterial color="#14100c" roughness={0.95} />
        </mesh>
      ) : (
        <mesh position={[0, 2.68, 0]}>
          <sphereGeometry args={[0.42, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          <meshStandardMaterial color="#14100c" roughness={0.95} />
        </mesh>
      )}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 12]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <primitive object={tag} position={[0, 4.6, 0]} />
    </group>
  );
}

function Vehicle({
  v,
  hidden,
  night,
}: {
  v: { road: number; t: number; speed: number; dir: number; kind: string };
  hidden: boolean;
  night: boolean;
}) {
  const ref = useRef<THREE.Group>(null!);
  useFrame(() => {
    if (hidden) {
      ref.current.visible = false;
      return;
    }
    ref.current.visible = true;
    const pts = ROADS[v.road].pts;
    let acc = 0;
    const total = pts.reduce((a, p, i) => (i === 0 ? 0 : a + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1])), 0);
    const target = v.t * total;
    let px = pts[0][0];
    let py = pts[0][1];
    let dx = 1;
    let dz = 0;
    for (let i = 1; i < pts.length; i++) {
      const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (acc + seg >= target) {
        const f = (target - acc) / (seg || 1);
        px = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f;
        py = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f;
        dx = (pts[i][0] - pts[i - 1][0]) / (seg || 1);
        dz = (pts[i][1] - pts[i - 1][1]) / (seg || 1);
        break;
      }
      acc += seg;
    }
    ref.current.position.set((px - 19) * 2, 0, (py - 14) * 2);
    ref.current.rotation.y = Math.atan2(dx * v.dir, dz * v.dir);
  });
  if (v.kind === "bus") {
    return (
      <group ref={ref}>
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[2.2, 1.6, 4.8]} />
          <meshStandardMaterial color="#F2EDE4" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.1, 0]}>
          <boxGeometry args={[2.25, 0.3, 4.85]} />
          <meshStandardMaterial color="#1F7A4D" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.35, 0]}>
          <boxGeometry args={[2.0, 0.5, 4.2]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        {[-0.7, 0.7].map((ox, i) => (
          <mesh key={i} position={[ox, 0.9, 2.45]}>
            <sphereGeometry args={[0.14, 8, 6]} />
            <meshStandardMaterial color="#FFE9B8" emissive="#FFE9B8" emissiveIntensity={night ? 1.6 : 0.5} />
          </mesh>
        ))}
        {night && (
          <mesh position={[0, 0.8, 6.5]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[2.6, 9, 12, 1, true]} />
            <meshBasicMaterial color="#FFE9B8" transparent opacity={0.1} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
          </mesh>
        )}
      </group>
    );
  }
  if (v.kind === "micra") {
    return (
      <group ref={ref}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.8, 1, 3.6]} />
          <meshStandardMaterial color="#5A1F2B" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.25, -0.2]}>
          <boxGeometry args={[1.5, 0.9, 2.4]} />
          <meshStandardMaterial color="#F5C518" roughness={0.8} />
        </mesh>
        {[-0.6, 0.6].map((ox, i) => (
          <mesh key={i} position={[ox, 0.6, 1.85]}>
            <sphereGeometry args={[0.12, 8, 6]} />
            <meshStandardMaterial color="#FFE9B8" emissive="#FFE9B8" emissiveIntensity={night ? 1.6 : 0.5} />
          </mesh>
        ))}
        {night && (
          <mesh position={[0, 0.6, 5.5]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[2, 7, 12, 1, true]} />
            <meshBasicMaterial color="#FFE9B8" transparent opacity={0.12} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
          </mesh>
        )}
      </group>
    );
  }
  if (v.kind === "keke") {
    return (
      <group ref={ref}>
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[1.4, 1.2, 1.8]} />
          <meshStandardMaterial color="#22c55e" roughness={0.8} />
        </mesh>
      </group>
    );
  }
  return (
    <group ref={ref}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.6, 0.7, 1.6]} />
        <meshStandardMaterial color="#B33A3A" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.2, -0.2]}>
        <boxGeometry args={[0.5, 0.6, 0.5]} />
        <meshStandardMaterial color="#222831" roughness={0.9} />
      </mesh>
    </group>
  );
}
