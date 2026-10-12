"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { HomeSave, HomeTier } from "@/lib/world";

const FLOOR_C: Record<HomeTier, string> = { room: "#c9a06a", flat: "#b78d55", duplex: "#a87f4b" };
const WALL_C = "#EDE3D2";

// furniture slots per tier: [x, z, floor(0|1)]
type Slot = [number, number, number?];
const LAYOUT: Record<HomeTier, Record<string, Slot>> = {
  room: {
    mat: [4.5, 3], mattress: [-3.5, -2.5], fan: [2.5, 0.5], rug: [0.5, 1],
    shelf: [-5, -3.2], tv: [2.5, -3.6], fridge: [5, -3.4], sofa: [-1.5, 2.8],
    gen: [-4.8, 2.6], dining: [0.5, -1], curtains: [0, -4.4], ac: [1, -4.4],
  },
  flat: {
    mat: [6.5, 2.5], mattress: [5.5, -2], fan: [-6, 0], rug: [-3, 0.8],
    shelf: [7, -3], tv: [-4, -3.6], fridge: [0, 3], sofa: [-4, 2.5],
    gen: [-7, 3], dining: [-1, -1], curtains: [-4, -4.4], ac: [5.5, -4.4],
  },
  duplex: {
    mat: [6.5, 2.5], mattress: [5.5, -2], fan: [-6, 0], rug: [-3, 0.8],
    shelf: [7, -3], tv: [-4, -3.6], fridge: [0, 3], sofa: [-4, 2.5],
    gen: [-7, 3.2], dining: [5, 0, 1], curtains: [-4, -4.4], ac: [5.5, -4.4],
  },
};

const DIMS: Record<HomeTier, { w: number; d: number; h: number; mid: number }> = {
  room: { w: 12, d: 9, h: 3.2, mid: 0 },
  flat: { w: 16, d: 9, h: 3.4, mid: 0 },
  duplex: { w: 16, d: 10, h: 7.2, mid: 3.6 },
};

function Fan({ pos, spin }: { pos: [number, number, number]; spin: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    if (spin) ref.current.rotation.y += dt * 9;
  });
  return (
    <group position={pos}>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.09, 0.14, 1.8, 8]} />
        <meshStandardMaterial color="#333333" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 0.12, 12]} />
        <meshStandardMaterial color="#333333" roughness={0.7} />
      </mesh>
      <group ref={ref} position={[0, 1.85, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]} position={[Math.sin((i * Math.PI * 2) / 3) * 0.55, 0, Math.cos((i * Math.PI * 2) / 3) * 0.55]}>
            <boxGeometry args={[0.75, 0.06, 0.22]} />
            <meshStandardMaterial color="#777777" roughness={0.6} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.14, 8, 8]} />
          <meshStandardMaterial color="#333333" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

function Piece({ id, pos, y0 }: { id: string; pos: [number, number, number]; y0: number }) {
  const [x, , z] = [pos[0], pos[1], pos[2]];
  switch (id) {
    case "mat":
      return (
        <mesh position={[x, y0 + 0.06, z]}>
          <cylinderGeometry args={[0.9, 0.9, 0.12, 14]} />
          <meshStandardMaterial color="#7A4A2B" roughness={1} />
        </mesh>
      );
    case "mattress":
      return (
        <group position={[x, y0, z]}>
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[3.4, 0.7, 2.6]} />
            <meshStandardMaterial color="#3b5bd6" roughness={0.9} />
          </mesh>
          <mesh position={[-1.1, 0.8, 0]}>
            <boxGeometry args={[0.9, 0.25, 1.2]} />
            <meshStandardMaterial color="#F2EDE4" roughness={0.9} />
          </mesh>
        </group>
      );
    case "rug":
      return (
        <group position={[x, y0, z]}>
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[2.1, 2.1, 0.08, 20]} />
            <meshStandardMaterial color="#B33A3A" roughness={1} />
          </mesh>
          <mesh position={[0, 0.09, 0]}>
            <cylinderGeometry args={[1.4, 1.4, 0.08, 20]} />
            <meshStandardMaterial color="#F2EDE4" roughness={1} />
          </mesh>
        </group>
      );
    case "shelf":
      return (
        <group position={[x, y0, z]}>
          <mesh position={[0, 1.1, 0]}>
            <boxGeometry args={[1.2, 2.2, 0.5]} />
            <meshStandardMaterial color="#6b4226" roughness={0.9} />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[-0.2 + (i % 2) * 0.4, 0.6 + i * 0.65, 0.05]}>
              <boxGeometry args={[0.28, 0.55, 0.4]} />
              <meshStandardMaterial color={["#B33A3A", "#1F7A4D", "#E8A020"][i]} roughness={0.9} />
            </mesh>
          ))}
        </group>
      );
    case "tv":
      return (
        <group position={[x, y0, z]}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[2.2, 1, 0.8]} />
            <meshStandardMaterial color="#5c3a24" roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[2.4, 1.4, 0.25]} />
            <meshStandardMaterial color="#1C1917" roughness={0.6} />
          </mesh>
          <mesh position={[0, 1.5, 0.14]}>
            <planeGeometry args={[2.1, 1.1]} />
            <meshStandardMaterial color="#9fd8ef" emissive="#9fd8ef" emissiveIntensity={0.7} />
          </mesh>
        </group>
      );
    case "fridge":
      return (
        <group position={[x, y0, z]}>
          <mesh position={[0, 1.1, 0]}>
            <boxGeometry args={[1.1, 2.2, 1]} />
            <meshStandardMaterial color="#DCE9EC" roughness={0.5} />
          </mesh>
          <mesh position={[0.4, 1.3, 0.55]}>
            <boxGeometry args={[0.1, 0.5, 0.1]} />
            <meshStandardMaterial color="#8a9aa0" roughness={0.5} />
          </mesh>
        </group>
      );
    case "sofa":
      return (
        <group position={[x, y0, z]}>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[3.2, 0.8, 1.2]} />
            <meshStandardMaterial color="#1F7A4D" roughness={0.95} />
          </mesh>
          <mesh position={[0, 1, -0.5]}>
            <boxGeometry args={[3.2, 0.9, 0.35]} />
            <meshStandardMaterial color="#276e47" roughness={0.95} />
          </mesh>
          {[-1.5, 1.5].map((ax, i) => (
            <mesh key={i} position={[ax, 0.65, 0]}>
              <boxGeometry args={[0.35, 0.8, 1.2]} />
              <meshStandardMaterial color="#1F7A4D" roughness={0.95} />
            </mesh>
          ))}
        </group>
      );
    case "gen":
      return (
        <group position={[x, y0, z]}>
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[1.4, 0.9, 1]} />
            <meshStandardMaterial color="#c23b22" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.95, 0]}>
            <boxGeometry args={[1.2, 0.15, 0.8]} />
            <meshStandardMaterial color="#1C1917" roughness={0.8} />
          </mesh>
        </group>
      );
    case "ac":
      return (
        <group position={[x, y0, z]}>
          <mesh position={[0, 2.6, 0]}>
            <boxGeometry args={[1.8, 0.5, 0.5]} />
            <meshStandardMaterial color="#F2EDE4" roughness={0.6} />
          </mesh>
          <mesh position={[0, 2.42, 0.26]}>
            <planeGeometry args={[1.5, 0.12]} />
            <meshStandardMaterial color="#9fd8ef" emissive="#9fd8ef" emissiveIntensity={0.9} />
          </mesh>
        </group>
      );
    case "dining":
      return (
        <group position={[x, y0, z]}>
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[1.1, 1.1, 0.12, 16]} />
            <meshStandardMaterial color="#8a5a30" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.12, 0.16, 0.7, 8]} />
            <meshStandardMaterial color="#5c3a24" roughness={0.9} />
          </mesh>
          {[[-1.6, 0], [1.6, 0]].map(([sx, sz], i) => (
            <mesh key={i} position={[sx, 0.3, sz]}>
              <cylinderGeometry args={[0.35, 0.35, 0.6, 10]} />
              <meshStandardMaterial color="#3b5bd6" roughness={0.9} />
            </mesh>
          ))}
        </group>
      );
    case "curtains":
      return (
        <group position={[x, y0, z]}>
          {[-0.9, 0.9].map((cx, i) => (
            <mesh key={i} position={[cx, 1.9, 0]}>
              <boxGeometry args={[0.5, 1.6, 0.15]} />
              <meshStandardMaterial color="#B33A3A" roughness={0.95} />
            </mesh>
          ))}
          <mesh position={[0, 2.3, 0]}>
            <planeGeometry args={[1.4, 1.2]} />
            <meshStandardMaterial color="#FFE9B8" emissive="#FFE9B8" emissiveIntensity={0.8} />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}

export default function Room3D({
  home,
  avatarColor,
  saver,
  zzz,
}: {
  home: HomeSave;
  avatarColor: string;
  saver: boolean;
  zzz?: boolean;
}) {
  const tier = home.tier;
  const dims = DIMS[tier];
  const lay = LAYOUT[tier];
  const owned = useMemo(() => new Set(home.furniture), [home.furniture]);
  const camPos: [number, number, number] =
    tier === "room" ? [10, 8.5, 13] : [13, 10, 16];

  return (
    <div className="overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
      <div className="h-72">
        <Canvas
          dpr={saver ? 1 : [1, 1.5]}
          gl={{ antialias: !saver }}
          camera={{ fov: 42, near: 0.5, far: 200, position: camPos }}
        >
          <color attach="background" args={["#171310"]} />
          <hemisphereLight args={["#ffe9c8", "#3a2c1c", 0.85]} />
          <directionalLight position={[8, 12, 10]} color="#ffe0b0" intensity={1.1} />
          <pointLight position={[0, dims.h - 0.6, 0]} color="#ffca7a" intensity={14} distance={22} />
          {/* floor + rug base */}
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[dims.w, 0.2, dims.d]} />
            <meshStandardMaterial color={FLOOR_C[tier]} roughness={1} />
          </mesh>
          {/* walls: back + sides (open dollhouse front) */}
          <mesh position={[0, dims.h / 2, -dims.d / 2]}>
            <boxGeometry args={[dims.w, dims.h, 0.3]} />
            <meshStandardMaterial color={WALL_C} roughness={0.95} />
          </mesh>
          <mesh position={[-dims.w / 2, dims.h / 2, 0]}>
            <boxGeometry args={[0.3, dims.h, dims.d]} />
            <meshStandardMaterial color={WALL_C} roughness={0.95} />
          </mesh>
          <mesh position={[dims.w / 2, dims.h / 2, 0]}>
            <boxGeometry args={[0.3, dims.h, dims.d]} />
            <meshStandardMaterial color={WALL_C} roughness={0.95} />
          </mesh>
          {/* flat divider with doorway */}
          {tier !== "room" && (
            <group>
              <mesh position={[-1.5, dims.h / 2, 0]}>
                <boxGeometry args={[7, dims.h, 0.25]} />
                <meshStandardMaterial color={WALL_C} roughness={0.95} />
              </mesh>
              <mesh position={[4.4, dims.h / 2, 0]}>
                <boxGeometry args={[3.2, dims.h, 0.25]} />
                <meshStandardMaterial color={WALL_C} roughness={0.95} />
              </mesh>
            </group>
          )}
          {/* duplex upper slab + stairs + railing */}
          {tier === "duplex" && (
            <group>
              <mesh position={[4, dims.mid, 0]}>
                <boxGeometry args={[8, 0.25, dims.d]} />
                <meshStandardMaterial color={FLOOR_C.flat} roughness={1} />
              </mesh>
              {[0, 1, 2, 3, 4].map((i) => (
                <mesh key={i} position={[-6.5, 0.35 + i * 0.65, -3 + i * 0.7]}>
                  <boxGeometry args={[2.2, 0.28, 0.75]} />
                  <meshStandardMaterial color="#8a6a42" roughness={1} />
                </mesh>
              ))}
              <mesh position={[4, dims.mid + 1.1, dims.d / 2 - 0.2]}>
                <boxGeometry args={[8, 0.12, 0.12]} />
                <meshStandardMaterial color="#5c3a24" roughness={0.9} />
              </mesh>
            </group>
          )}
          {/* furniture */}
          {Object.keys(lay).map((id) =>
            owned.has(id) ? (
              id === "fan" ? (
                <Fan key={id} pos={[lay[id][0], (lay[id][2] ? dims.mid : 0), lay[id][1]]} spin={!saver} />
              ) : (
                <Piece key={id} id={id} pos={[lay[id][0], 0, lay[id][1]]} y0={lay[id][2] ? dims.mid + 0.12 : 0} />
              )
            ) : null
          )}
          {/* auto-dressing by tier: frames, lamp, plant, kitchen (not purchasable) */}
          <mesh position={[-dims.w / 4, dims.h - 0.9, -dims.d / 2 + 0.18]}>
            <planeGeometry args={[1.6, 1.1]} />
            <meshStandardMaterial color="#0e7a8a" roughness={0.9} />
          </mesh>
          <mesh position={[-dims.w / 4, dims.h - 0.9, -dims.d / 2 + 0.16]}>
            <planeGeometry args={[1.2, 0.7]} />
            <meshStandardMaterial color="#F5C518" emissive="#F5C518" emissiveIntensity={0.25} />
          </mesh>
          {tier !== "room" && (
            <group>
              <mesh position={[dims.w / 4 + 1.5, dims.h - 0.9, -dims.d / 2 + 0.18]}>
                <planeGeometry args={[1.4, 1]} />
                <meshStandardMaterial color="#B33A3A" roughness={0.9} />
              </mesh>
              {/* floor lamp */}
              <mesh position={[-dims.w / 2 + 0.8, 0.9, dims.d / 2 - 0.8]}>
                <cylinderGeometry args={[0.08, 0.12, 1.8, 8]} />
                <meshStandardMaterial color="#333333" roughness={0.7} />
              </mesh>
              <mesh position={[-dims.w / 2 + 0.8, 1.95, dims.d / 2 - 0.8]}>
                <coneGeometry args={[0.55, 0.7, 12]} />
                <meshStandardMaterial color="#FFE9B8" emissive="#ffca7a" emissiveIntensity={0.9} />
              </mesh>
              {/* plant */}
              <mesh position={[dims.w / 2 - 0.9, 0.3, dims.d / 2 - 0.9]}>
                <cylinderGeometry args={[0.32, 0.26, 0.6, 10]} />
                <meshStandardMaterial color="#B3502e" roughness={0.9} />
              </mesh>
              <mesh position={[dims.w / 2 - 0.9, 1.1, dims.d / 2 - 0.9]}>
                <icosahedronGeometry args={[0.55, 0]} />
                <meshStandardMaterial color="#2c945f" roughness={1} flatShading />
              </mesh>
            </group>
          )}
          {tier === "duplex" && (
            <group>
              {/* kitchen counter + stools */}
              <mesh position={[-dims.w / 2 + 1.6, 0.55, -dims.d / 2 + 0.8]}>
                <boxGeometry args={[3.4, 1.1, 1]} />
                <meshStandardMaterial color="#8a8a8a" roughness={0.6} />
              </mesh>
              <mesh position={[-dims.w / 2 + 1.6, 1.12, -dims.d / 2 + 0.8]}>
                <boxGeometry args={[3.4, 0.08, 1]} />
                <meshStandardMaterial color="#DCE9EC" roughness={0.4} />
              </mesh>
              {[[-1, 1.8], [1, 1.8]].map(([ox, oz], i) => (
                <mesh key={i} position={[-dims.w / 2 + 1.6 + ox, 0.3, -dims.d / 2 + 0.8 + oz]}>
                  <cylinderGeometry args={[0.28, 0.28, 0.6, 10]} />
                  <meshStandardMaterial color="#3b5bd6" roughness={0.9} />
                </mesh>
              ))}
            </group>
          )}
          {/* hanging bulb */}
          <mesh position={[0, dims.h - 0.4, 0]}>
            <sphereGeometry args={[0.22, 10, 8]} />
            <meshStandardMaterial color="#FFE9B8" emissive="#ffca7a" emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[0, dims.h, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.8, 6]} />
            <meshStandardMaterial color="#1C1917" roughness={0.8} />
          </mesh>
          {/* resident (lies on bed + Zzz while resting) */}
          <group
            position={
              zzz
                ? [lay.mattress[0], 0.95, lay.mattress[1]]
                : [-dims.w / 2 + 1.2, 0, dims.d / 2 - 1.2]
            }
            rotation={[0, 0, zzz ? -Math.PI / 2 + 0.12 : 0]}
          >
            <mesh position={[0, zzz ? 0 : 1.15, 0]}>
              <capsuleGeometry args={[0.42, 1.0, 3, 10]} />
              <meshStandardMaterial color={avatarColor} roughness={0.85} />
            </mesh>
            <mesh position={[zzz ? 0.85 : 0, zzz ? 0.1 : 2.35, 0]}>
              <sphereGeometry args={[0.38, 12, 10]} />
              <meshStandardMaterial color="#3b2317" roughness={0.8} />
            </mesh>
          </group>
          {zzz && (
            <group position={[lay.mattress[0] + 0.4, 2.6, lay.mattress[1]]}>
              {["z", "z", "z"].map((t, i) => (
                <mesh key={i} position={[i * 0.55, i * 0.5, 0]}>
                  <sphereGeometry args={[0.22 - i * 0.04, 8, 6]} />
                  <meshBasicMaterial color="#BFE3EF" transparent opacity={0.9 - i * 0.2} />
                </mesh>
              ))}
            </group>
          )}
        </Canvas>
      </div>
    </div>
  );
}
