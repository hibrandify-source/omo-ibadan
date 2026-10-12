"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type ShopKind = "food" | "provisions" | "boutique" | "barber" | "viewing";

function Trader({ color, fem }: { color: string; fem: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((state) => {
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 1.4) * 0.04;
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.12;
  });
  return (
    <group ref={ref} position={[0, 0, -1.6]}>
      <mesh position={[0, 1.05, 0]}>
        <capsuleGeometry args={[0.42, 1.0, 3, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.15, 0]}>
        <sphereGeometry args={[0.36, 10, 8]} />
        <meshStandardMaterial color="#5a3a26" roughness={0.8} />
      </mesh>
      {fem ? (
        <mesh position={[0, 2.32, 0]} scale={[1.15, 0.7, 1.15]}>
          <sphereGeometry args={[0.5, 10, 8]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
      ) : (
        <mesh position={[0, 2.5, 0]}>
          <coneGeometry args={[0.4, 0.45, 10]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
      )}
      {/* counter */}
      <mesh position={[0, -0.35, 2.1]}>
        <boxGeometry args={[4.6, 1.1, 1]} />
        <meshStandardMaterial color="#6b4226" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.25, 2.1]}>
        <boxGeometry args={[4.6, 0.1, 1.1]} />
        <meshStandardMaterial color="#8a5a30" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Shelves({ kind }: { kind: ShopKind }) {
  if (kind === "barber") {
    return (
      <group>
        {/* barber chair + mirror + clippers shelf */}
        <mesh position={[-1.6, 0.55, 0.4]}>
          <boxGeometry args={[1.1, 0.5, 1.1]} />
          <meshStandardMaterial color="#B33A3A" roughness={0.8} />
        </mesh>
        <mesh position={[-1.6, 1.15, 0.4]}>
          <boxGeometry args={[1.1, 0.7, 0.25]} />
          <meshStandardMaterial color="#7a1f1f" roughness={0.8} />
        </mesh>
        <mesh position={[-1.6, 0.15, 0.4]}>
          <cylinderGeometry args={[0.45, 0.55, 0.3, 10]} />
          <meshStandardMaterial color="#333333" roughness={0.7} />
        </mesh>
        <mesh position={[1.8, 1.8, -2.85]}>
          <planeGeometry args={[2.2, 1.6]} />
          <meshStandardMaterial color="#9fd8ef" emissive="#9fd8ef" emissiveIntensity={0.35} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[3.1, 1 + i * 0.55, -1]}>
            <boxGeometry args={[0.9, 0.4, 0.5]} />
            <meshStandardMaterial color={["#E8A020", "#1F7A4D", "#3b5bd6"][i]} roughness={0.85} />
          </mesh>
        ))}
        <mesh position={[3.1, 2.9, -1]}>
          <boxGeometry args={[1, 0.15, 0.6]} />
          <meshStandardMaterial color="#6b4226" roughness={0.9} />
        </mesh>
      </group>
    );
  }
  if (kind === "viewing") {
    return (
      <group>
        {/* big screen + benches */}
        <mesh position={[0, 2.1, -2.85]}>
          <boxGeometry args={[4.6, 2.2, 0.25]} />
          <meshStandardMaterial color="#1C1917" roughness={0.6} />
        </mesh>
        <mesh position={[0, 2.1, -2.7]}>
          <planeGeometry args={[4.2, 1.8]} />
          <meshStandardMaterial color="#4a9e4a" emissive="#4a9e4a" emissiveIntensity={0.55} />
        </mesh>
        <mesh position={[0, 2.1, -2.68]}>
          <circleGeometry args={[0.35, 12]} />
          <meshBasicMaterial color="#F2EDE4" />
        </mesh>
        <mesh position={[0, 1.1, -2.68]}>
          <boxGeometry args={[2.6, 0.08, 0.05]} />
          <meshBasicMaterial color="#F2EDE4" />
        </mesh>
        {[-1.8, 0, 1.8].map((x, i) => (
          <mesh key={i} position={[x, 0.35, 0.6]}>
            <boxGeometry args={[1.4, 0.5, 0.6]} />
            <meshStandardMaterial color="#6b4226" roughness={0.9} />
          </mesh>
        ))}
      </group>
    );
  }
  const goods: string[][] =
    kind === "food"
      ? [["#E8A020", "#B33A3A", "#1F7A4D"], ["#8a4fb0", "#E8A020", "#c2185b"], ["#1F7A4D", "#0e7a8a", "#E8A020"]]
      : kind === "boutique"
        ? [["#c2185b", "#d4af37", "#046307"], ["#5b21b6", "#1e3a8a", "#0e7a8a"], ["#6d0f2c", "#0b5fa5", "#e9d8a6"]]
        : [["#3b82c4", "#E8A020", "#B33A3A"], ["#1F7A4D", "#8a4fb0", "#F2EDE4"], ["#0e7a8a", "#c2185b", "#3b5bd6"]];
  return (
    <group>
      {[0, 1, 2].map((r) => (
        <group key={r}>
          <mesh position={[-3.4, 1.1 + r * 0.9, -2.8]}>
            <boxGeometry args={[3, 0.12, 0.9]} />
            <meshStandardMaterial color="#6b4226" roughness={0.9} />
          </mesh>
          {goods[r].map((c, k) => (
            <mesh key={k} position={[-4.3 + k * 0.95, 1.45 + r * 0.9, -2.8]}>
              <boxGeometry args={[0.65, kind === "boutique" ? 0.7 : 0.55, 0.6]} />
              <meshStandardMaterial color={c} roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
      {/* right rail for boutique / pots for food */}
      {kind === "boutique" ? (
        <group>
          <mesh position={[3.4, 2.2, -2.6]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 3.4, 8]} />
            <meshStandardMaterial color="#8a8a8a" roughness={0.6} />
          </mesh>
          {["#c2185b", "#d4af37", "#046307"].map((c, i) => (
            <mesh key={i} position={[2.3 + i * 1.1, 1.5, -2.6]}>
              <boxGeometry args={[0.7, 1.1, 0.12]} />
              <meshStandardMaterial color={c} roughness={0.95} />
            </mesh>
          ))}
        </group>
      ) : (
        <group>
          {[2.6, 3.8].map((x, i) => (
            <group key={i} position={[x, 0, -2.2]}>
              <mesh position={[0, 0.55, 0]}>
                <cylinderGeometry args={[0.55, 0.45, 1.1, 12]} />
                <meshStandardMaterial color={i ? "#1C1917" : "#8a5a30"} roughness={0.9} />
              </mesh>
              <mesh position={[0, 1.15, 0]}>
                <cylinderGeometry args={[0.6, 0.6, 0.12, 12]} />
                <meshStandardMaterial color="#444444" roughness={0.8} />
              </mesh>
            </group>
          ))}
        </group>
      )}
    </group>
  );
}

const TITLES: Record<ShopKind, { name: string; blurb: string }> = {
  food: { name: "Mama Put's Kitchen", blurb: "Steam, pepper, generosity. Chop like family." },
  provisions: { name: "Kiosk Provisions", blurb: "Gala to detergent — small money, sorted life." },
  boutique: { name: "Samonda Boutique", blurb: "Aso-ebi on rails. Full rack lives in the Buy tab." },
  barber: { name: "Sharp Sharp Barbers", blurb: "Lowcut now, compliments all week." },
  viewing: { name: "Viewing Centre", blurb: "Match day, plastic chairs, maximum noise." },
};

export default function StoreInterior3D({
  shop,
  saver,
}: {
  shop: ShopKind;
  saver: boolean;
}) {
  const t = TITLES[shop];
  return (
    <div className="overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
      <div className="h-64">
        <Canvas
          dpr={saver ? 1 : [1, 1.5]}
          gl={{ antialias: !saver }}
          camera={{ fov: 46, near: 0.5, far: 100, position: [0, 2.6, 7.5] }}
        >
          <color attach="background" args={["#241a12"]} />
          <hemisphereLight args={["#ffe9c8", "#3a2c1c", 0.9]} />
          <pointLight position={[0, 3.4, 1]} color="#ffca7a" intensity={16} distance={18} />
          {/* floor + walls */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
            <planeGeometry args={[14, 12]} />
            <meshStandardMaterial color={shop === "boutique" ? "#8a6a4a" : "#6b5a44"} roughness={1} />
          </mesh>
          <mesh position={[0, 2, -3]}>
            <boxGeometry args={[11, 4, 0.3]} />
            <meshStandardMaterial color="#EDE3D2" roughness={0.95} />
          </mesh>
          <mesh position={[-5.5, 2, 1]}>
            <boxGeometry args={[0.3, 4, 9]} />
            <meshStandardMaterial color="#E4D6BE" roughness={0.95} />
          </mesh>
          <mesh position={[5.5, 2, 1]}>
            <boxGeometry args={[0.3, 4, 9]} />
            <meshStandardMaterial color="#E4D6BE" roughness={0.95} />
          </mesh>
          {/* hanging bulb */}
          <mesh position={[0, 3.5, 1]}>
            <sphereGeometry args={[0.2, 10, 8]} />
            <meshStandardMaterial color="#FFE9B8" emissive="#ffca7a" emissiveIntensity={1.4} />
          </mesh>
          <mesh position={[0, 3.9, 1]}>
            <cylinderGeometry args={[0.03, 0.03, 0.8, 6]} />
            <meshStandardMaterial color="#1C1917" roughness={0.8} />
          </mesh>
          {/* sign */}
          <mesh position={[0, 3.3, -2.8]}>
            <boxGeometry args={[5.6, 0.8, 0.15]} />
            <meshStandardMaterial color="#1C1917" roughness={0.85} />
          </mesh>
          <Shelves kind={shop} />
          {(shop === "food" || shop === "provisions" || shop === "boutique") && (
            <Trader color={shop === "food" ? "#B33A3A" : shop === "provisions" ? "#1F7A4D" : "#8a4fb0"} fem={shop !== "provisions"} />
          )}
          {shop === "barber" && <Trader color="#3b5bd6" fem={false} />}
          {shop === "viewing" && <Trader color="#7A4A2B" fem={true} />}
        </Canvas>
      </div>
      <div className="bg-charcoal px-4 py-2.5 text-cream">
        <div className="font-display text-sm font-extrabold">{t.name}</div>
        <div className="text-xs text-cream/60">{t.blurb}</div>
      </div>
    </div>
  );
}
