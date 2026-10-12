"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CompoundTemplate } from "./CompoundView";

function Chicken({ x, z, d }: { x: number; z: number; d: number }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((state) => {
    const t = state.clock.elapsedTime + d;
    ref.current.position.y = Math.abs(Math.sin(t * 3)) * 0.06;
    ref.current.rotation.y = Math.sin(t * 0.4) * 0.8;
  });
  return (
    <group ref={ref} position={[x, 0, z]}>
      <mesh position={[0, 0.28, 0]}>
        <sphereGeometry args={[0.28, 10, 8]} />
        <meshStandardMaterial color="#F2EDE4" roughness={0.9} />
      </mesh>
      <mesh position={[0.22, 0.45, 0]}>
        <sphereGeometry args={[0.15, 8, 6]} />
        <meshStandardMaterial color="#F2EDE4" roughness={0.9} />
      </mesh>
      <mesh position={[0.32, 0.45, 0]}>
        <coneGeometry args={[0.07, 0.14, 6]} />
        <meshStandardMaterial color="#E8A020" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Elder() {
  return (
    <group position={[-3.4, 0, 1.5]}>
      <mesh position={[0, 1.1, 0]}>
        <capsuleGeometry args={[0.4, 1.1, 3, 8]} />
        <meshStandardMaterial color="#EDE3D2" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.3, 0]}>
        <sphereGeometry args={[0.36, 10, 8]} />
        <meshStandardMaterial color="#5a3a26" roughness={0.8} />
      </mesh>
      <mesh position={[0.5, 0.9, 0.2]} rotation={[0.15, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1.6, 6]} />
        <meshStandardMaterial color="#5c3a24" roughness={0.9} />
      </mesh>
    </group>
  );
}

export default function Compound3D({
  template,
  saver,
}: {
  template: CompoundTemplate;
  saver: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
      <div className="h-64">
        <Canvas
          dpr={saver ? 1 : [1, 1.5]}
          gl={{ antialias: !saver }}
          camera={{ fov: 42, near: 0.5, far: 200, position: [10, 8, 13] }}
        >
          <color attach="background" args={["#9fc3d8"]} />
          <hemisphereLight args={["#cfe8ff", "#5a4a30", 0.9]} />
          <directionalLight position={[10, 14, 8]} color="#fff2dc" intensity={1.25} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
            <planeGeometry args={[40, 30]} />
            <meshStandardMaterial color={template === "gra" ? "#3f5a3a" : "#8a6a42"} roughness={1} />
          </mesh>

          {template === "courtyard" && (
            <group>
              {[[-7, -3], [7, -3]].map(([x, z], i) => (
                <group key={i} position={[x, 0, z]}>
                  <mesh position={[0, 1.6, 0]}>
                    <boxGeometry args={[6, 3.2, 4]} />
                    <meshStandardMaterial color={i ? "#E4D6BE" : "#EDE3D2"} roughness={0.95} />
                  </mesh>
                  <mesh position={[0, 3.7, 0]} rotation={[0, Math.PI / 4, 0]}>
                    <coneGeometry args={[4.4, 1.6, 4]} />
                    <meshStandardMaterial color={i ? "#7A4A2B" : "#6b3f27"} roughness={0.95} flatShading />
                  </mesh>
                  <mesh position={[0, 1.1, 2.02]}>
                    <boxGeometry args={[1.2, 2.2, 0.15]} />
                    <meshStandardMaterial color="#5c3a24" roughness={0.9} />
                  </mesh>
                </group>
              ))}
              {/* well */}
              <mesh position={[2, 0.6, 2]}>
                <cylinderGeometry args={[1, 1.1, 1.2, 12]} />
                <meshStandardMaterial color="#8a8a8a" roughness={1} />
              </mesh>
              <mesh position={[2, 1.25, 2]}>
                <cylinderGeometry args={[0.85, 0.85, 0.15, 12]} />
                <meshStandardMaterial color="#1c2a3a" roughness={0.4} />
              </mesh>
              {[-0.9, 0.9].map((ox, i) => (
                <mesh key={i} position={[2 + ox, 1.8, 2]}>
                  <boxGeometry args={[0.18, 2.4, 0.18]} />
                  <meshStandardMaterial color="#6b4226" roughness={0.9} />
                </mesh>
              ))}
              <mesh position={[2, 3.1, 2]}>
                <coneGeometry args={[1.4, 0.9, 4]} />
                <meshStandardMaterial color="#B33A3A" roughness={0.9} flatShading />
              </mesh>
              {/* elders' tree */}
              <mesh position={[-3.4, 1.4, -1]}>
                <cylinderGeometry args={[0.3, 0.42, 2.8, 7]} />
                <meshStandardMaterial color="#4a2e1c" roughness={1} />
              </mesh>
              <mesh position={[-3.4, 3.6, -1]}>
                <icosahedronGeometry args={[2.2, 0]} />
                <meshStandardMaterial color="#1F7A4D" roughness={1} flatShading />
              </mesh>
              {/* clothesline */}
              {[[-4, 4], [0, 4]].map(([x, z], i) => (
                <mesh key={i} position={[x, 1.3, z]}>
                  <boxGeometry args={[0.12, 2.6, 0.12]} />
                  <meshStandardMaterial color="#555555" roughness={0.8} />
                </mesh>
              ))}
              <mesh position={[-2, 2.5, 4]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.03, 0.03, 4, 6]} />
                <meshStandardMaterial color="#777777" roughness={0.8} />
              </mesh>
              {["#3b5bd6", "#E8A020", "#B33A3A"].map((c, i) => (
                <mesh key={i} position={[-3.2 + i * 1.2, 2.1, 4]}>
                  <boxGeometry args={[0.8, 0.9, 0.08]} />
                  <meshStandardMaterial color={c} roughness={0.95} />
                </mesh>
              ))}
            </group>
          )}

          {template === "estate" && (
            <group>
              <mesh position={[0, 1.8, -4]}>
                <boxGeometry args={[16, 3.6, 3]} />
                <meshStandardMaterial color="#EDE3D2" roughness={0.95} />
              </mesh>
              <mesh position={[0, 3.9, -4]}>
                <boxGeometry args={[16.6, 0.5, 3.6]} />
                <meshStandardMaterial color="#6b3f27" roughness={0.95} />
              </mesh>
              {[-6, -2, 2, 6].map((x, i) => (
                <group key={i}>
                  <mesh position={[x, 1.1, -2.4]}>
                    <boxGeometry args={[1.4, 2.2, 0.15]} />
                    <meshStandardMaterial color="#5c3a24" roughness={0.9} />
                  </mesh>
                  <mesh position={[x + 2, 2.2, -2.42]}>
                    <boxGeometry args={[1.4, 1.2, 0.12]} />
                    <meshStandardMaterial color="#DCE9EC" emissive="#DCE9EC" emissiveIntensity={0.25} />
                  </mesh>
                </group>
              ))}
              {/* shared tap + buckets */}
              <mesh position={[3, 0.5, 3]}>
                <boxGeometry args={[0.3, 1, 0.3]} />
                <meshStandardMaterial color="#555555" roughness={0.7} />
              </mesh>
              <mesh position={[-0.7, 0.25, 3.4]}>
                <cylinderGeometry args={[0.4, 0.32, 0.5, 10]} />
                <meshStandardMaterial color="#3b82c4" roughness={0.8} />
              </mesh>
              <mesh position={[0.7, 0.25, 3.4]}>
                <cylinderGeometry args={[0.4, 0.32, 0.5, 10]} />
                <meshStandardMaterial color="#E8A020" roughness={0.8} />
              </mesh>
            </group>
          )}

          {template === "gra" && (
            <group>
              <mesh position={[0, 1.8, -3]}>
                <boxGeometry args={[8, 3.6, 5]} />
                <meshStandardMaterial color="#F2EDE4" roughness={0.95} />
              </mesh>
              <mesh position={[0, 4.1, -3]} rotation={[0, Math.PI / 4, 0]}>
                <coneGeometry args={[6, 1.8, 4]} />
                <meshStandardMaterial color="#7A4A2B" roughness={0.95} flatShading />
              </mesh>
              <mesh position={[0, 1.1, -0.4]}>
                <boxGeometry args={[1.4, 2.2, 0.15]} />
                <meshStandardMaterial color="#5c3a24" roughness={0.9} />
              </mesh>
              {/* fence + gold gate */}
              {Array.from({ length: 9 }).map((_, i) => (
                <mesh key={i} position={[-8 + i * 2, 0.8, 5]}>
                  <boxGeometry args={[0.18, 1.6, 0.18]} />
                  <meshStandardMaterial color="#444444" roughness={0.8} />
                </mesh>
              ))}
              <mesh position={[-8, 1.5, 5]}>
                <boxGeometry args={[16.4, 0.15, 0.15]} />
                <meshStandardMaterial color="#444444" roughness={0.8} />
              </mesh>
              <mesh position={[0.6, 1.1, 5]}>
                <boxGeometry args={[0.16, 2, 0.2]} />
                <meshStandardMaterial color="#E8A020" emissive="#E8A020" emissiveIntensity={0.35} />
              </mesh>
              <mesh position={[3.4, 1.1, 5]}>
                <boxGeometry args={[0.16, 2, 0.2]} />
                <meshStandardMaterial color="#E8A020" emissive="#E8A020" emissiveIntensity={0.35} />
              </mesh>
            </group>
          )}

          <Elder />
          <Chicken x={4.5} z={4.5} d={0} />
          <Chicken x={-5.5} z={5} d={1.4} />
          <Chicken x={0.5} z={6} d={2.6} />
        </Canvas>
      </div>
    </div>
  );
}
