"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SHOPS: { name: string; color: string; x: number }[] = [
  { name: "MAMA PUT", color: "#B33A3A", x: -10.5 },
  { name: "KIOSK", color: "#1F7A4D", x: -3.5 },
  { name: "BARBER", color: "#3b5bd6", x: 3.5 },
  { name: "VIEWING", color: "#7A4A2B", x: 10.5 },
];

function PassingMicra() {
  const ref = useRef<THREE.Group>(null!);
  useFrame((state) => {
    const t = (state.clock.elapsedTime % 9) / 9;
    ref.current.position.set(-32 + t * 64, 0, 1.5);
  });
  return (
    <group ref={ref}>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[1.9, 0.9, 4]} />
        <meshStandardMaterial color="#5A1F2B" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.3, -0.3]}>
        <boxGeometry args={[1.6, 0.85, 2.6]} />
        <meshStandardMaterial color="#F5C518" roughness={0.7} />
      </mesh>
      {[[-0.95, 1.2], [0.95, 1.2], [-0.95, -1.2], [0.95, -1.2]].map(([ox, oz], i) => (
        <mesh key={i} position={[ox, 0.35, oz]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.35, 0.35, 0.25, 10]} />
          <meshStandardMaterial color="#111111" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Steam({ x, y, z, d }: { x: number; y: number; z: number; d: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const t = (state.clock.elapsedTime * 0.5 + d) % 1;
    ref.current.position.set(x + Math.sin(t * 6) * 0.2, y + t * 1.6, z);
    const s = 0.5 + t * 0.9;
    ref.current.scale.set(s, s, s);
    (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - t);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.3, 8, 6]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.4} depthWrite={false} />
    </mesh>
  );
}

export default function Street3D({ saver }: { saver: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
      <div className="h-64">
        <Canvas
          dpr={saver ? 1 : [1, 1.5]}
          gl={{ antialias: !saver }}
          camera={{ fov: 45, near: 0.5, far: 200, position: [0, 7, 16] }}
        >
          <color attach="background" args={["#9fc3d8"]} />
          <hemisphereLight args={["#cfe8ff", "#5a4a30", 0.9]} />
          <directionalLight position={[8, 14, 10]} color="#fff2dc" intensity={1.2} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
            <planeGeometry args={[60, 30]} />
            <meshStandardMaterial color="#a8a094" roughness={1} />
          </mesh>
          {/* road */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 2]}>
            <planeGeometry args={[60, 7]} />
            <meshStandardMaterial color="#33302b" roughness={1} />
          </mesh>
          {[-1.2, 0, 1.2].map((ox, i) => (
            <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[ox, 0.04, 2]}>
              <planeGeometry args={[0.25, 7]} />
              <meshStandardMaterial color={i === 1 ? "#c9a24a" : "#F2EDE4"} roughness={0.9} />
            </mesh>
          ))}
          {/* shops */}
          {SHOPS.map((s) => (
            <group key={s.name} position={[s.x, 0, -5]}>
              <mesh position={[0, 1.8, 0]}>
                <boxGeometry args={[5.4, 3.6, 3.4]} />
                <meshStandardMaterial color="#EDE3D2" roughness={0.95} />
              </mesh>
              <mesh position={[0, 3.8, 0.4]}>
                <boxGeometry args={[6, 0.5, 4]} />
                <meshStandardMaterial color={s.color} roughness={0.9} />
              </mesh>
              <mesh position={[0, 1.5, 1.75]}>
                <boxGeometry args={[3, 1.8, 0.15]} />
                <meshStandardMaterial color="#5c3a24" roughness={0.9} />
              </mesh>
              <mesh position={[0, 4.6, 1.2]}>
                <boxGeometry args={[4.4, 0.9, 0.2]} />
                <meshStandardMaterial color="#1C1917" roughness={0.85} />
              </mesh>
            </group>
          ))}
          {/* Mama Put steam */}
          <Steam x={-10.5} y={3.4} z={-3} d={0} />
          <Steam x={-10.5} y={3.4} z={-3} d={0.5} />
          {/* IBEDC pole + sagging wires */}
          <mesh position={[13.5, 3.5, 0]}>
            <boxGeometry args={[0.35, 7, 0.35]} />
            <meshStandardMaterial color="#4a3a28" roughness={1} />
          </mesh>
          <mesh position={[13.5, 6.6, 0]}>
            <boxGeometry args={[2.4, 0.25, 0.25]} />
            <meshStandardMaterial color="#4a3a28" roughness={1} />
          </mesh>
          {[0, 1, 2].map((i) => {
            const curve = new THREE.QuadraticBezierCurve3(
              new THREE.Vector3(12.6 + i * 0.5, 6.6, -0.5 + i * 0.5),
              new THREE.Vector3(2, 4.6 + i * 0.2, 2),
              new THREE.Vector3(-14, 6.4, -4)
            );
            return (
              <mesh key={i} geometry={new THREE.TubeGeometry(curve, 12, 0.035, 5)}>
                <meshBasicMaterial color="#111111" />
              </mesh>
            );
          })}
          {/* okada park */}
          <group position={[-6, 0, 4.5]} rotation={[0, 0.4, 0]}>
            <mesh position={[0, 0.6, 0]}>
              <boxGeometry args={[0.6, 0.7, 1.6]} />
              <meshStandardMaterial color="#B33A3A" roughness={0.8} />
            </mesh>
            <mesh position={[0, 1.25, -0.2]}>
              <boxGeometry args={[0.5, 0.6, 0.5]} />
              <meshStandardMaterial color="#222831" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.35, 0.9]}>
              <cylinderGeometry args={[0.3, 0.3, 0.2, 10]} />
              <meshStandardMaterial color="#111111" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.35, -0.9]}>
              <cylinderGeometry args={[0.3, 0.3, 0.2, 10]} />
              <meshStandardMaterial color="#111111" roughness={0.9} />
            </mesh>
          </group>
          {/* you, stepping out */}
          <group position={[-1, 0, 5.5]}>
            <mesh position={[0, 1.15, 0]}>
              <capsuleGeometry args={[0.4, 1.2, 3, 8]} />
              <meshStandardMaterial color="#1F7A4D" roughness={0.85} />
            </mesh>
            <mesh position={[0, 2.45, 0]}>
              <sphereGeometry args={[0.36, 10, 8]} />
              <meshStandardMaterial color="#3b2317" roughness={0.8} />
            </mesh>
          </group>
          <PassingMicra />
        </Canvas>
      </div>
    </div>
  );
}
