"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  ROADS, DRIVE_ROUTES, roadHalfW, roadsideSpots, BAY_NAMES,
} from "@/lib/world";
import { BILLBOARDS, JUNCTIONS, SHOP_FACES, ASPHALT, SIDEWALK, CURB, signalIsRed } from "@/lib/streets";
import { makeSignTexture } from "@/lib/sign";
import { polyLength, hash01 } from "@/lib/iso";
import { gx, gz, roadRibbon } from "./World3D";

// Local offset ribbon (lateral shift in tiles) for sidewalks/edge lines.
function ribbonOff(pts: [number, number][], halfW: number, off: number): THREE.BufferGeometry {
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
    const cx = px + -dy * off;
    const cy = py + dx * off;
    const nx = -dy * halfW * 2;
    const nz = dx * halfW * 2;
    const wx = (cx - 19) * 2;
    const wz = (cy - 14) * 2;
    verts.push(wx + nx, 0, wz + nz, wx - nx, 0, wz - nz);
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

function roadPoint(pts: [number, number][], t: number) {
  const total = polyLength(pts);
  const target = Math.max(0, Math.min(1, t)) * total;
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc + seg >= target) {
      const f = (target - acc) / (seg || 1);
      return {
        x: pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f,
        y: pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f,
        dx: (pts[i][0] - pts[i - 1][0]) / (seg || 1),
        dy: (pts[i][1] - pts[i - 1][1]) / (seg || 1),
      };
    }
    acc += seg;
  }
  const l = pts[pts.length - 1];
  return { x: l[0], y: l[1], dx: 1, dy: 0 };
}

export function StreetRoads() {
  const geos = useMemo(
    () =>
      ROADS.map((r) => {
        const hw = roadHalfW(r.type);
        return {
          walk: r.type !== "street" ? roadRibbon(r.pts, hw + 0.55) : null,
          geo: roadRibbon(r.pts, hw),
          median: r.type === "express" ? roadRibbon(r.pts, 0.12) : null,
          edges: r.type === "street" ? [] : [hw - 0.2, -(hw - 0.2)],
          potholes: Array.from({ length: r.potholes * 6 }, (_, k) => {
            const t = hash01("pot3d" + r.pts.length, k * 2 + 1);
            const p = roadPoint(r.pts, t);
            return { x: gx(p.x), z: gz(p.y), r: 0.35 + hash01("pot3d", k) * 0.35 };
          }),
        };
      }),
    []
  );
  const dashes = useMemo(() => {
    const out: { x: number; z: number; rot: number }[] = [];
    ROADS.forEach((r, ri) => {
      const len = polyLength(r.pts);
      const n = Math.floor(len / 1.15);
      for (let k = 0; k < n; k++) {
        const p = roadPoint(r.pts, (k + 0.5) / n);
        out.push({ x: gx(p.x), z: gz(p.y), rot: Math.atan2(p.dx, p.dy) + ri * 0 });
      }
    });
    return out;
  }, []);
  const dashRef = useRef<THREE.InstancedMesh>(null!);
  const dashGeo = useMemo(() => new THREE.BoxGeometry(0.22, 0.04, 1.05), []);
  const dashMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#F2EDE4", roughness: 0.9 }), []);
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    dashes.forEach((d, i) => {
      dummy.position.set(d.x, 0.07, d.z);
      dummy.rotation.set(0, d.rot, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      dashRef.current.setMatrixAt(i, dummy.matrix);
    });
    dashRef.current.instanceMatrix.needsUpdate = true;
  }, [dashes]);

  return (
    <group>
      {geos.map((g, i) => (
        <group key={i}>
          {g.walk && (
            <mesh geometry={g.walk} position={[0, 0.03, 0]}>
              <meshStandardMaterial color={SIDEWALK} roughness={1} />
            </mesh>
          )}
          <mesh geometry={g.geo} position={[0, 0.05, 0]}>
            <meshStandardMaterial color={ASPHALT} roughness={1} />
          </mesh>
          {g.median && (
            <mesh geometry={g.median} position={[0, 0.07, 0]}>
              <meshStandardMaterial color="#c9a24a" roughness={1} />
            </mesh>
          )}
          {g.edges.map((off, k) => (
            <EdgeLine key={k} pts={ROADS[i].pts} off={off} />
          ))}
          {g.potholes.map((p, k) => (
            <mesh key={k} position={[p.x, 0.07, p.z]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[p.r, 10]} />
              <meshStandardMaterial color="#0c0c0e" roughness={1} />
            </mesh>
          ))}
        </group>
      ))}
      <instancedMesh ref={dashRef} args={[dashGeo, dashMat, dashes.length]} />
    </group>
  );
}

function EdgeLine({ pts, off }: { pts: [number, number][]; off: number }) {
  const geo = useMemo(() => {
    const verts: number[] = [];
    const idx: number[] = [];
    const N = 24;
    for (let i = 0; i <= N; i++) {
      const p = roadPoint(pts, i / N);
      const cx = p.x + -p.dy * off;
      const cy = p.y + p.dx * off;
      const hw = 0.05;
      const nx = -p.dy * hw * 2;
      const nz = p.dx * hw * 2;
      const wx = (cx - 19) * 2;
      const wz = (cy - 14) * 2;
      verts.push(wx + nx, 0, wz + nz, wx - nx, 0, wz - nz);
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
  }, [pts, off]);
  return (
    <mesh geometry={geo} position={[0, 0.065, 0]}>
      <meshStandardMaterial color={CURB} roughness={1} />
    </mesh>
  );
}

export function Streetlights() {
  const spots = useMemo(() => {
    const out: { x: number; z: number }[] = [];
    ROADS.forEach((r, ri) => {
      if (r.type === "street") return;
      const len = polyLength(r.pts);
      const n = Math.floor(len / 2.4);
      for (let k = 0; k < n; k++) {
        const p = roadPoint(r.pts, (k + 0.5) / n);
        const side = (k + ri) % 2 === 0 ? 1 : -1;
        const off = (roadHalfW(r.type) + 0.5) * side;
        out.push({ x: gx(p.x + -p.dy * off), z: gz(p.y + p.dx * off) });
      }
    });
    return out;
  }, []);
  const poleRef = useRef<THREE.InstancedMesh>(null!);
  const headRef = useRef<THREE.InstancedMesh>(null!);
  const poleGeo = useMemo(() => new THREE.BoxGeometry(0.22, 5.2, 0.22), []);
  const headGeo = useMemo(() => new THREE.SphereGeometry(0.32, 8, 6), []);
  const poleMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2c2c30", roughness: 0.8 }), []);
  const headMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#FFE9B8", emissive: "#ffca7a", emissiveIntensity: 1.1 }),
    []
  );
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    spots.forEach((s, i) => {
      dummy.position.set(s.x, 2.6, s.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      poleRef.current.setMatrixAt(i, dummy.matrix);
      dummy.position.set(s.x, 5.3, s.z);
      dummy.updateMatrix();
      headRef.current.setMatrixAt(i, dummy.matrix);
    });
    poleRef.current.instanceMatrix.needsUpdate = true;
    headRef.current.instanceMatrix.needsUpdate = true;
  }, [spots]);
  return (
    <group>
      <instancedMesh ref={poleRef} args={[poleGeo, poleMat, spots.length]} />
      <instancedMesh ref={headRef} args={[headGeo, headMat, spots.length]} />
    </group>
  );
}

export function Roadside() {
  const spots = useMemo(() => roadsideSpots(), []);
  const bodyRef = useRef<THREE.InstancedMesh>(null!);
  const roofRef = useRef<THREE.InstancedMesh>(null!);
  const awnRef = useRef<THREE.InstancedMesh>(null!);
  const bodyGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const roofGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const awnGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.95 }), []);
  const roofMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 1 }), []);
  const awnMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#B3502e", roughness: 0.95 }), []);
  const awnCount = useMemo(() => spots.filter((s) => s.awn).length, [spots]);
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    const c = new THREE.Color();
    let ai = 0;
    spots.forEach((s, i) => {
      const x = gx(s.x);
      const z = gz(s.y);
      dummy.position.set(x, s.h / 2, z);
      dummy.rotation.set(0, s.rot, 0);
      dummy.scale.set(s.w * 2, s.h, s.d * 2);
      dummy.updateMatrix();
      bodyRef.current.setMatrixAt(i, dummy.matrix);
      bodyRef.current.setColorAt(i, c.set(SHOP_FACES[s.face % SHOP_FACES.length]));
      dummy.position.set(x, s.h + 0.15, z);
      dummy.scale.set(s.w * 2 + 0.3, 0.3, s.d * 2 + 0.3);
      dummy.updateMatrix();
      roofRef.current.setMatrixAt(i, dummy.matrix);
      roofRef.current.setColorAt(i, c.set("#4a3a2c").offsetHSL(0, 0, ((i * 37) % 10) / 200));
      if (s.awn) {
        dummy.position.set(x + Math.sin(s.rot) * (s.d * 2 / 2 + 0.4), 1.9, z + Math.cos(s.rot) * (s.d * 2 / 2 + 0.4));
        dummy.rotation.set(0, s.rot, 0);
        dummy.scale.set(s.w * 2 * 0.9, 0.12, 0.9);
        dummy.updateMatrix();
        awnRef.current.setMatrixAt(ai, dummy.matrix);
        ai++;
      }
    });
    bodyRef.current.instanceMatrix.needsUpdate = true;
    roofRef.current.instanceMatrix.needsUpdate = true;
    awnRef.current.instanceMatrix.needsUpdate = true;
    if (bodyRef.current.instanceColor) bodyRef.current.instanceColor.needsUpdate = true;
    if (roofRef.current.instanceColor) roofRef.current.instanceColor.needsUpdate = true;
  }, [spots]);
  return (
    <group>
      <instancedMesh ref={bodyRef} args={[bodyGeo, bodyMat, spots.length]} />
      <instancedMesh ref={roofRef} args={[roofGeo, roofMat, spots.length]} />
      <instancedMesh ref={awnRef} args={[awnGeo, awnMat, Math.max(1, awnCount)]} />
    </group>
  );
}

export function Billboards() {
  const poleRef = useRef<THREE.InstancedMesh>(null!);
  const poleGeo = useMemo(() => new THREE.BoxGeometry(0.3, 6, 0.3), []);
  const poleMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3a3a3e", roughness: 0.9 }), []);
  const poles = useMemo(() => {
    const out: { x: number; z: number }[] = [];
    BILLBOARDS.forEach((b) => {
      const x = gx(b.x);
      const z = gz(b.y);
      const px = Math.cos(b.rotY) * 1.6;
      const pz = Math.sin(b.rotY) * 1.6;
      out.push({ x: x - px, z: z - pz }, { x: x + px, z: z + pz });
    });
    return out;
  }, []);
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    poles.forEach((p, i) => {
      dummy.position.set(p.x, 3, p.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      poleRef.current.setMatrixAt(i, dummy.matrix);
    });
    poleRef.current.instanceMatrix.needsUpdate = true;
  }, [poles]);
  return (
    <group>
      <instancedMesh ref={poleRef} args={[poleGeo, poleMat, poles.length]} />
      {BILLBOARDS.map((b, i) => (
        <group key={i} position={[gx(b.x), 0, gz(b.y)]} rotation={[0, b.rotY, 0]}>
          <mesh position={[0, 7.2, 0]}>
            <boxGeometry args={[5.4, 2.4, 0.3]} />
            <meshStandardMaterial color={b.bg} roughness={0.85} />
          </mesh>
          <mesh position={[0, 6.4, 0.17]}>
            <boxGeometry args={[5.4, 0.5, 0.1]} />
            <meshStandardMaterial color={b.accent} roughness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Shelters() {
  const bays = useMemo(() => {
    const out: { x: number; z: number; rot: number; name: string }[] = [];
    DRIVE_ROUTES.forEach((r) => {
      r.bays.forEach((t, bi) => {
        const p = roadPoint(r.pts, t);
        out.push({
          x: gx(p.x + -p.dy * 2.4),
          z: gz(p.y + p.dx * 2.4),
          rot: Math.atan2(p.dx, p.dy),
          name: (BAY_NAMES[r.id] ?? [])[bi] ?? "BUS STOP",
        });
      });
    });
    return out;
  }, []);
  const postRef = useRef<THREE.InstancedMesh>(null!);
  const roofRef = useRef<THREE.InstancedMesh>(null!);
  const benchRef = useRef<THREE.InstancedMesh>(null!);
  const postGeo = useMemo(() => new THREE.BoxGeometry(0.16, 2.4, 0.16), []);
  const roofGeo = useMemo(() => new THREE.BoxGeometry(3, 0.16, 1.8), []);
  const benchGeo = useMemo(() => new THREE.BoxGeometry(2.4, 0.35, 0.6), []);
  const postMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3a3a3e", roughness: 0.9 }), []);
  const roofMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#E8A020", roughness: 0.85 }), []);
  const benchMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#6b4226", roughness: 0.95 }), []);
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    bays.forEach((s, i) => {
      const cs = Math.cos(s.rot);
      const sn = Math.sin(s.rot);
      const off = (ax: number, az: number) => ({
        x: s.x + ax * cs - az * sn,
        z: s.z + ax * sn + az * cs,
      });
      const corners = [off(-1.3, -0.7), off(1.3, -0.7), off(-1.3, 0.7), off(1.3, 0.7)];
      corners.forEach((c, k) => {
        dummy.position.set(c.x, 1.2, c.z);
        dummy.rotation.set(0, s.rot, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        postRef.current.setMatrixAt(i * 4 + k, dummy.matrix);
      });
      dummy.position.set(s.x, 2.5, s.z);
      dummy.rotation.set(0, s.rot, 0);
      dummy.updateMatrix();
      roofRef.current.setMatrixAt(i, dummy.matrix);
      dummy.position.set(s.x, 0.45, s.z);
      dummy.updateMatrix();
      benchRef.current.setMatrixAt(i, dummy.matrix);
    });
    postRef.current.instanceMatrix.needsUpdate = true;
    roofRef.current.instanceMatrix.needsUpdate = true;
    benchRef.current.instanceMatrix.needsUpdate = true;
  }, [bays]);
  // zebra stripes at the same bays
  const zebraRef = useRef<THREE.InstancedMesh>(null!);
  const zebraGeo = useMemo(() => new THREE.BoxGeometry(0.5, 0.03, 3.2), []);
  const zebraMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#F2EDE4", roughness: 0.9 }), []);
  const zebraSpots = useMemo(() => {
    const out: { x: number; z: number; rot: number }[] = [];
    DRIVE_ROUTES.forEach((r) => {
      r.bays.forEach((t) => {
        const p = roadPoint(r.pts, t);
        for (let k = -2; k <= 2; k++) {
          out.push({
            x: gx(p.x + p.dx * k * 0.8),
            z: gz(p.y + p.dy * k * 0.8),
            rot: Math.atan2(p.dx, p.dy),
          });
        }
      });
    });
    return out;
  }, []);
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    zebraSpots.forEach((s, i) => {
      dummy.position.set(s.x, 0.075, s.z);
      dummy.rotation.set(0, s.rot, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      zebraRef.current.setMatrixAt(i, dummy.matrix);
    });
    zebraRef.current.instanceMatrix.needsUpdate = true;
  }, [zebraSpots]);
  return (
    <group>
      <instancedMesh ref={postRef} args={[postGeo, postMat, bays.length * 4]} />
      <instancedMesh ref={roofRef} args={[roofGeo, roofMat, bays.length]} />
      <instancedMesh ref={benchRef} args={[benchGeo, benchMat, bays.length]} />
      <instancedMesh ref={zebraRef} args={[zebraGeo, zebraMat, zebraSpots.length]} />
      {bays.map((s, i) => (
        <ShelterSign key={i} x={s.x} z={s.z} rot={s.rot} name={s.name} />
      ))}
    </group>
  );
}

function ShelterSign({ x, z, rot, name }: { x: number; z: number; rot: number; name: string }) {
  const tex = useMemo(() => makeSignTexture([name], { bg: "#14532d", font: 60, w: 512, h: 128 }), [name]);
  useEffect(() => () => { tex.dispose(); }, [tex]);
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <mesh position={[0, 3.4, 0]}>
        <boxGeometry args={[0.16, 1.6, 0.16]} />
        <meshStandardMaterial color="#3a3a3e" roughness={0.9} />
      </mesh>
      <mesh position={[0, 4.2, 0]}>
        <boxGeometry args={[2.8, 0.8, 0.12]} />
        <meshStandardMaterial color="#14532d" roughness={0.85} />
      </mesh>
      <mesh position={[0, 4.2, 0.08]}>
        <planeGeometry args={[2.6, 0.65]} />
        <meshBasicMaterial map={tex} transparent={false} />
      </mesh>
    </group>
  );
}

export function Junctions() {
  const reds = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const greens = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  useFrame(() => {
    const now = performance.now();
    for (let i = 0; i < 3; i++) {
      const red = signalIsRed(i, now);
      const rm = reds.current[i];
      const gm = greens.current[i];
      if (rm) {
        rm.emissive.set(red ? "#ff2222" : "#330000");
        rm.emissiveIntensity = red ? 1.6 : 0.2;
      }
      if (gm) {
        gm.emissive.set(red ? "#002200" : "#22ff44");
        gm.emissiveIntensity = red ? 0.2 : 1.6;
      }
    }
  });
  return (
    <group>
      {JUNCTIONS.map((j, i) => (
        <group key={i}>
          <mesh position={[gx(j.x), 0.04, gz(j.y)]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[j.r * 2, 24]} />
            <meshStandardMaterial color="#3a3733" roughness={1} />
          </mesh>
          <mesh position={[gx(j.x), 0.06, gz(j.y)]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[j.r * 2 - 0.35, j.r * 2, 24]} />
            <meshStandardMaterial color="#F2EDE4" roughness={0.9} />
          </mesh>
          {/* signal post: pole + red/green lamps, cycling */}
          <mesh position={[gx(j.x) + j.r * 2 + 0.4, 1.6, gz(j.y)]}>
            <boxGeometry args={[0.22, 3.2, 0.22]} />
            <meshStandardMaterial color="#2c2c30" roughness={0.8} />
          </mesh>
          <mesh position={[gx(j.x) + j.r * 2 + 0.4, 3.4, gz(j.y)]}>
            <boxGeometry args={[0.5, 1.4, 0.5]} />
            <meshStandardMaterial color="#1C1917" roughness={0.8} />
          </mesh>
          <mesh position={[gx(j.x) + j.r * 2 + 0.4, 3.75, gz(j.y) + 0.26]}>
            <sphereGeometry args={[0.2, 8, 6]} />
            <meshStandardMaterial
              ref={(m) => {
                reds.current[i] = m;
              }}
              color="#330000"
              roughness={0.6}
            />
          </mesh>
          <mesh position={[gx(j.x) + j.r * 2 + 0.4, 3.05, gz(j.y) + 0.26]}>
            <sphereGeometry args={[0.2, 8, 6]} />
            <meshStandardMaterial
              ref={(m) => {
                greens.current[i] = m;
              }}
              color="#002200"
              roughness={0.6}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
