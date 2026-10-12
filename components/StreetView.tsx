"use client";

// Neighbourhood street slice — the world between your compound and the city:
// Mama Put stall, kiosk, barber, viewing centre, IBEDC pole, okada park.
const SHOPS = [
  { name: "MAMA PUT", color: "#B33A3A", x: 8 },
  { name: "KIOSK", color: "#1F7A4D", x: 66 },
  { name: "BARBER", color: "#3b5bd6", x: 124 },
  { name: "VIEWING CENTRE", color: "#7A4A2B", x: 182 },
];

export default function StreetView({ onStepOut }: { onStepOut: () => void }) {
  return (
    <div>
      <svg viewBox="0 0 300 220" className="block h-auto w-full" role="img" aria-label="Your neighbourhood street">
        <defs>
          <linearGradient id="ssky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9fc3d8" />
            <stop offset="100%" stopColor="#F5D9A8" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="300" height="130" fill="url(#ssky)" />
        <circle cx="48" cy="30" r="13" fill="#FFE9B8" />
        {/* shops */}
        {SHOPS.map((s) => (
          <g key={s.name}>
            <rect x={s.x} y="70" width="52" height="62" fill="#EDE3D2" />
            <polygon points={`${s.x - 4},70 ${s.x + 26},56 ${s.x + 56},70`} fill={s.color} />
            <rect x={s.x + 8} y="96" width="36" height="36" fill="#5c3a24" />
            <rect x={s.x + 4} y="62" width="44" height="12" fill="#1C1917" />
            <text x={s.x + 26} y="71" fontSize="6.5" fill="#F5C518" fontWeight="bold" textAnchor="middle">{s.name}</text>
          </g>
        ))}
        {/* match glow at viewing centre */}
        <rect x="196" y="100" width="24" height="18" fill="#9fd8ef" opacity="0.85" />
        {/* road */}
        <rect x="0" y="132" width="300" height="46" fill="#24211d" />
        <line x1="0" y1="155" x2="300" y2="155" stroke="#F5D9A8" strokeWidth="2" strokeDasharray="10 10" />
        {/* IBEDC pole + tangled wires */}
        <rect x="262" y="60" width="8" height="118" fill="#4a3a28" />
        <line x1="250" y1="70" x2="282" y2="70" stroke="#4a3a28" strokeWidth="4" />
        <path d="M252,70 Q200,96 150,72 Q100,50 40,74" fill="none" stroke="#111" strokeWidth="1.6" />
        <path d="M254,70 Q210,104 150,80 Q95,58 40,80" fill="none" stroke="#111" strokeWidth="1.2" />
        {/* okada park */}
        <circle cx="60" cy="168" r="6" fill="none" stroke="#111" strokeWidth="2.5" />
        <circle cx="76" cy="168" r="6" fill="none" stroke="#111" strokeWidth="2.5" />
        <rect x="60" y="156" width="16" height="8" rx="2" fill="#B33A3A" />
        <circle cx="68" cy="150" r="3.4" fill="#3b2317" />
        <text x="68" y="186" fontSize="8" fill="#FAF6F0" fontWeight="bold" textAnchor="middle">OKADA</text>
        {/* passing micra */}
        <g className="cruise">
          <rect x="-46" y="140" width="42" height="12" rx="4" fill="#5A1F2B" />
          <rect x="-43" y="137" width="30" height="6" rx="2" fill="#F5C518" />
          <circle cx="-38" cy="153" r="4" fill="#111" />
          <circle cx="-14" cy="153" r="4" fill="#111" />
        </g>
        {/* Mama Put steam */}
        <circle cx="30" cy="60" r="3" fill="#ffffff88" />
        <circle cx="34" cy="52" r="4" fill="#ffffff55" />
        <circle cx="29" cy="44" r="5" fill="#ffffff33" />
      </svg>
      <button
        onClick={onStepOut}
        className="mt-2 w-full rounded-full bg-gradient-to-r from-mapo to-[#f5c04a] py-2.5 text-sm font-extrabold text-charcoal"
      >
        🚶 Step out — spawn at your home zone
      </button>
      <style>{`
        .cruise { animation: cruise 9s linear infinite; }
        @keyframes cruise { from { transform: translateX(0); } to { transform: translateX(360px); } }
        @media (prefers-reduced-motion: reduce) { .cruise { animation: none; } }
      `}</style>
    </div>
  );
}
