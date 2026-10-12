"use client";

// Compound exterior templates: courtyard (Omo Iya Lobe's Beere family compound),
// gra (Alowonle's Old Bodija house), estate (face-me blocks, kept for later moves).
export type CompoundTemplate = "courtyard" | "estate" | "gra";

function Person({ x, y, s, color, skin, fem }: { x: number; y: number; s: number; color: string; skin: string; fem?: boolean }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx="0" cy="0" rx="7" ry="3" fill="#00000044" />
      <line x1="-2.4" y1="-8" x2="-2.4" y2="0" stroke="#241a12" strokeWidth="2.6" strokeLinecap="round" />
      <line x1="2.4" y1="-8" x2="2.4" y2="0" stroke="#241a12" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M-5.5,-8 H5.5 L4,-19 H-4 Z" fill={color} />
      <circle cx="0" cy="-23" r="4.4" fill={skin} />
      {fem ? (
        <g fill={color}>
          <ellipse cx="0" cy="-24.5" rx="5.4" ry="3.4" />
          <circle cx="4.6" cy="-25.5" r="1.6" />
        </g>
      ) : (
        <path d="M-4.4,-24.5 A4.4,4.4 0 0 1 4.4,-24.5 Z" fill={color} />
      )}
    </g>
  );
}

function Chicken({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx="0" cy="0" rx="5" ry="3.6" fill="#F2EDE4" />
      <circle cx="4.5" cy="-3" r="2.4" fill="#F2EDE4" />
      <polygon points="6.5,-3 9,-2 6.5,-1" fill="#E8A020" />
      <line x1="-2" y1="3" x2="-2" y2="6" stroke="#E8A020" strokeWidth="1.4" />
      <line x1="2" y1="3" x2="2" y2="6" stroke="#E8A020" strokeWidth="1.4" />
    </g>
  );
}

export default function CompoundView({
  template,
  greeted,
  onGreet,
}: {
  template: CompoundTemplate;
  greeted: boolean;
  onGreet: () => void;
}) {
  return (
    <div>
      <svg viewBox="0 0 300 220" className="block h-auto w-full" role="img" aria-label="Your compound">
        <defs>
          <linearGradient id="csky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9fc3d8" />
            <stop offset="100%" stopColor="#F5D9A8" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="300" height="150" fill="url(#csky)" />
        <circle cx="252" cy="34" r="14" fill="#FFE9B8" />
        <rect x="0" y="150" width="300" height="70" fill={template === "gra" ? "#3f5a3a" : "#8a6a42"} />

        {template === "courtyard" && (
          <g>
            {/* facing houses left + right, open yard */}
            <rect x="8" y="70" width="70" height="82" fill="#EDE3D2" />
            <polygon points="4,70 43,44 82,70" fill="#6b3f27" />
            <rect x="30" y="110" width="18" height="42" fill="#5c3a24" />
            <rect x="222" y="70" width="70" height="82" fill="#E4D6BE" />
            <polygon points="218,70 257,44 296,70" fill="#7A4A2B" />
            <rect x="248" y="110" width="18" height="42" fill="#5c3a24" />
            {/* well */}
            <ellipse cx="150" cy="168" rx="18" ry="8" fill="#5c5c5c" />
            <ellipse cx="150" cy="165" rx="12" ry="5" fill="#1c2a3a" />
            <line x1="134" y1="168" x2="134" y2="132" stroke="#6b4226" strokeWidth="4" />
            <line x1="166" y1="168" x2="166" y2="132" stroke="#6b4226" strokeWidth="4" />
            <polygon points="130,132 150,118 170,132" fill="#B33A3A" />
            {/* elders' tree */}
            <line x1="105" y1="152" x2="105" y2="112" stroke="#4a2e1c" strokeWidth="6" />
            <circle cx="105" cy="100" r="22" fill="#1F7A4D" />
            <circle cx="88" cy="110" r="14" fill="#2c945f" />
            {/* clothesline */}
            <line x1="180" y1="152" x2="180" y2="120" stroke="#555" strokeWidth="2" />
            <line x1="240" y1="152" x2="240" y2="120" stroke="#555" strokeWidth="2" />
            <line x1="180" y1="122" x2="240" y2="122" stroke="#777" strokeWidth="1.5" />
            <rect x="192" y="122" width="12" height="16" fill="#3b5bd6" />
            <rect x="210" y="122" width="12" height="16" fill="#E8A020" />
            <rect x="228" y="122" width="10" height="14" fill="#B33A3A" />
          </g>
        )}

        {template === "estate" && (
          <g>
            {/* face-me block, corridor doors */}
            <rect x="20" y="60" width="260" height="92" fill="#EDE3D2" />
            <rect x="20" y="60" width="260" height="18" fill="#6b3f27" />
            {[0, 1, 2, 3].map((i) => (
              <g key={i}>
                <rect x={36 + i * 62} y="96" width="26" height="56" fill="#5c3a24" />
                <rect x={70 + i * 62} y="92" width="22" height="20" fill="#DCE9EC" stroke="#5c3a24" strokeWidth="2" />
              </g>
            ))}
            <rect x="20" y="150" width="260" height="6" fill="#8a7a5c" />
            {/* tap + buckets */}
            <rect x="140" y="168" width="10" height="20" fill="#555" />
            <ellipse cx="128" cy="190" rx="9" ry="5" fill="#3b82c4" />
            <ellipse cx="162" cy="190" rx="9" ry="5" fill="#E8A020" />
          </g>
        )}

        {template === "gra" && (
          <g>
            {/* duplex + fence + gate */}
            <rect x="90" y="60" width="120" height="92" fill="#F2EDE4" />
            <rect x="90" y="60" width="120" height="16" fill="#B33A3A" />
            <rect x="140" y="100" width="24" height="52" fill="#5c3a24" />
            {[0, 1].map((i) => (
              <rect key={i} x={104 + i * 70} y="88" width="26" height="24" fill="#DCE9EC" stroke="#5c3a24" strokeWidth="2" />
            ))}
            <rect x="150" y="34" width="60" height="40" fill="#E4D6BE" />
            <polygon points="146,34 180,14 214,34" fill="#7A4A2B" />
            <rect x="0" y="120" width="300" height="34" fill="none" stroke="#444" strokeWidth="3" />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((i) => (
              <line key={i} x1={8 + i * 20} y1="120" x2={8 + i * 20} y2="154" stroke="#444" strokeWidth="2.5" />
            ))}
            <rect x="126" y="118" width="48" height="36" fill="none" stroke="#E8A020" strokeWidth="4" />
          </g>
        )}

        {/* elder + you + chickens */}
        <Person x={template === "courtyard" ? 105 : 60} y={template === "courtyard" ? 152 : 176} s={1} color="#EDE3D2" skin="#5a3a26" />
        <text x={template === "courtyard" ? 105 : 60} y={template === "courtyard" ? 108 : 132} fontSize="9" fill="#1C1917" fontWeight="bold" textAnchor="middle">Elder</text>
        <Person x={template === "courtyard" ? 150 : 110} y={template === "courtyard" ? 176 : 188} s={1} color="#1F7A4D" skin="#3b2317" />
        <Chicken x={190} y={192} />
        <Chicken x={215} y={198} />
        <Chicken x={70} y={196} />
      </svg>
      <button
        onClick={onGreet}
        disabled={greeted}
        className="mt-2 w-full rounded-full bg-charcoal py-2.5 text-sm font-bold text-cream disabled:opacity-40"
      >
        {greeted ? "✅ Elder greeted today — Ẹ ṣeun, ọmọ mi." : "🙏 Dobale — greet the elder (+2 Iwa, once daily)"}
      </button>
    </div>
  );
}
