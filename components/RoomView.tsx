"use client";

import type { HomeSave, HomeTier } from "@/lib/world";

// Top-down cutaway room. Starts bare (mat only) and visibly fills
// as furniture is hustled. Floorplan grows per tier.
export default function RoomView({ home }: { home: HomeSave }) {
  const owned = (id: string) => home.furniture.includes(id);
  const tier: HomeTier = home.tier;
  const floor = tier === "room" ? "#c9a06a" : tier === "flat" ? "#b78d55" : "#a87f4b";
  const wall = "#5c3a24";

  return (
    <svg viewBox="0 0 300 220" className="block h-auto w-full" role="img" aria-label="Your room interior">
      {/* floor */}
      <rect x="8" y="8" width="284" height="204" rx="6" fill={floor} />
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={i} x1="8" y1={34 + i * 24} x2="292" y2={34 + i * 24} stroke="#00000022" strokeWidth="1" />
      ))}
      {/* flat divider: parlor | bedroom */}
      {tier !== "room" && (
        <g>
          <line x1="185" y1="8" x2="185" y2="150" stroke={wall} strokeWidth="8" />
          <rect x="178" y="150" width="14" height="30" fill={floor} />
          <text x="120" y="24" fontSize="9" fill="#ffffff88" fontWeight="bold" textAnchor="middle">PARLOR</text>
          <text x="240" y="24" fontSize="9" fill="#ffffff88" fontWeight="bold" textAnchor="middle">BEDROOM</text>
        </g>
      )}
      {/* duplex extras: stairs + balcony */}
      {tier === "duplex" && (
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={196 + i * 9} y1="150" x2={196 + i * 9} y2="180" stroke={wall} strokeWidth="3" />
          ))}
          <rect x="190" y="186" width="90" height="18" rx="3" fill="#8a6a42" />
          <text x="235" y="199" fontSize="9" fill="#fff" fontWeight="bold" textAnchor="middle">BALCONY</text>
        </g>
      )}
      {/* walls */}
      <rect x="8" y="8" width="284" height="204" rx="6" fill="none" stroke={wall} strokeWidth="10" />
      {/* door gap (bottom) */}
      <rect x="130" y="204" width="44" height="12" fill={floor} />
      <rect x="130" y="204" width="44" height="4" fill={wall} />
      {/* window (top) + light shaft + curtains */}
      <rect x="120" y="2" width="60" height="12" fill="#DCE9EC" stroke={wall} strokeWidth="3" />
      <polygon points="120,14 180,14 210,120 90,120" fill="#FFF6D8" opacity="0.35" />
      {owned("curtains") && (
        <g>
          <rect x="104" y="2" width="16" height="40" fill="#B33A3A" />
          <rect x="180" y="2" width="16" height="40" fill="#B33A3A" />
        </g>
      )}

      {/* furniture */}
      {owned("mat") && <rect x="230" y="170" width="40" height="14" rx="7" fill="#7A4A2B" />}
      {owned("rug") && <ellipse cx="120" cy="130" rx="52" ry="26" fill="#B33A3A" opacity="0.85" />}
      {owned("rug") && <circle cx="120" cy="130" r="34" fill="#F2EDE4" opacity="0.9" />}
      {owned("mattress") && (
        <g>
          <rect x="200" y="40" width="76" height="52" rx="8" fill="#3b5bd6" />
          <rect x="206" y="46" width="26" height="16" rx="4" fill="#F2EDE4" />
        </g>
      )}
      {owned("fan") && (
        <g>
          <line x1="60" y1="150" x2="60" y2="100" stroke="#333" strokeWidth="4" />
          <circle cx="60" cy="92" r="16" fill="none" stroke="#333" strokeWidth="2" />
          <g className="fan-spin" style={{ transformOrigin: "60px 92px" }}>
            <line x1="60" y1="92" x2="60" y2="80" stroke="#555" strokeWidth="3" />
            <line x1="60" y1="92" x2="70" y2="98" stroke="#555" strokeWidth="3" />
            <line x1="60" y1="92" x2="50" y2="98" stroke="#555" strokeWidth="3" />
          </g>
          <ellipse cx="60" cy="152" rx="12" ry="4" fill="#333" />
        </g>
      )}
      {owned("shelf") && (
        <g>
          <rect x="20" y="60" width="34" height="70" fill="#6b4226" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <line x1="20" y1={84 + i * 22} x2="54" y2={84 + i * 22} stroke="#3f2517" strokeWidth="2" />
              <rect x={24 + (i % 2) * 4} y={70 + i * 22} width="5" height="14" fill={["#B33A3A", "#1F7A4D", "#E8A020"][i]} />
              <rect x={31 + (i % 2) * 4} y={72 + i * 22} width="5" height="12" fill={["#E8A020", "#3b5bd6", "#F2EDE4"][i]} />
            </g>
          ))}
        </g>
      )}
      {owned("tv") && (
        <g>
          <rect x="90" y="36" width="52" height="34" rx="3" fill="#1C1917" />
          <rect x="94" y="40" width="44" height="22" fill="#9fd8ef" opacity="0.9" />
          <rect x="112" y="70" width="8" height="8" fill="#1C1917" />
          <rect x="100" y="78" width="32" height="4" fill="#1C1917" />
        </g>
      )}
      {owned("fridge") && (
        <g>
          <rect x="248" y="100" width="30" height="56" rx="3" fill="#DCE9EC" stroke="#8a9aa0" strokeWidth="2" />
          <line x1="248" y1="122" x2="278" y2="122" stroke="#8a9aa0" strokeWidth="2" />
          <rect x="272" y="106" width="3" height="10" fill="#8a9aa0" />
        </g>
      )}
      {owned("sofa") && (
        <g>
          <rect x="70" y="150" width="90" height="26" rx="8" fill="#1F7A4D" />
          <rect x="70" y="138" width="90" height="18" rx="8" fill="#276e47" />
          <rect x="62" y="148" width="12" height="28" rx="5" fill="#1F7A4D" />
        </g>
      )}
      {owned("gen") && (
        <g>
          <rect x="20" y="160" width="40" height="28" rx="4" fill="#c23b22" />
          <rect x="26" y="166" width="16" height="8" fill="#1C1917" />
          <line x1="52" y1="160" x2="58" y2="148" stroke="#333" strokeWidth="3" />
          <circle cx="60" cy="144" r="3" fill="#ffffff88" />
          <circle cx="64" cy="136" r="4.5" fill="#ffffff55" />
        </g>
      )}
      {owned("ac") && (
        <g>
          <rect x="200" y="14" width="60" height="16" rx="4" fill="#F2EDE4" stroke="#8a9aa0" strokeWidth="2" />
          <line x1="205" y1="26" x2="255" y2="26" stroke="#9fd8ef" strokeWidth="2" strokeDasharray="4 3" />
        </g>
      )}
      {owned("dining") && (
        <g>
          <ellipse cx="120" cy="80" rx="26" ry="16" fill="#6b4226" />
          <ellipse cx="120" cy="78" rx="26" ry="15" fill="#8a5a30" />
          <circle cx="86" cy="80" r="8" fill="#3b5bd6" />
          <circle cx="154" cy="80" r="8" fill="#3b5bd6" />
        </g>
      )}

      {/* empty-state whisper */}
      {home.furniture.length <= 1 && (
        <text x="150" y="115" fontSize="11" fill="#ffffffaa" fontStyle="italic" textAnchor="middle">
          Bare floor, big dreams — hustle to fill me.
        </text>
      )}
      <style>{`
        .fan-spin { animation: fanspin 1.1s linear infinite; }
        @keyframes fanspin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .fan-spin { animation: none; } }
      `}</style>
    </svg>
  );
}
