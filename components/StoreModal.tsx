"use client";

// Walk-in store interior (scoped V1): step off the street into a market
// stall — trader greets you gendered, chop Mama Put's special, haggle,
// greet. Reuses the same economy; no new currency.
import { PRICES, naira } from "@/lib/game";

export default function StoreModal({
  stall,
  greeting,
  canChopSpecial,
  greeted,
  onChop,
  onSpecial,
  onGreet,
  onHaggle,
  onClose,
}: {
  stall: string;
  greeting: string;
  canChopSpecial: boolean;
  greeted: boolean;
  onChop: () => void;
  onSpecial: () => void;
  onGreet: () => void;
  onHaggle: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-charcoal/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm overflow-hidden rounded-3xl bg-cream shadow-2xl ring-1 ring-roof/20"
        onClick={(e) => e.stopPropagation()}
      >
        <svg viewBox="0 0 300 170" className="block h-auto w-full" role="img" aria-label={`${stall} interior`}>
          <rect x="0" y="0" width="300" height="170" fill="#3a2c1c" />
          {/* striped awning */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <rect key={i} x={i * 38} y="0" width="38" height="26" fill={i % 2 ? "#F2EDE4" : "#B33A3A"} />
          ))}
          {/* back shelves with goods */}
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <rect x="20" y={52 + r * 26} width="120" height="6" fill="#6b4226" />
              {[0, 1, 2, 3, 4].map((k) => (
                <g key={k}>
                  <rect x={28 + k * 23} y={38 + r * 26} width="14" height="14" rx="2" fill={["#E8A020", "#1F7A4D", "#c2185b", "#0e7a8a", "#8a4fb0"][(r + k) % 5]} />
                  <rect x={28 + k * 23} y={38 + r * 26} width="14" height="4" fill="#ffffff55" />
                </g>
              ))}
            </g>
          ))}
          {/* baskets */}
          <ellipse cx="180" cy="140" rx="22" ry="10" fill="#8a5a30" />
          <ellipse cx="180" cy="134" rx="16" ry="6" fill="#E8A020" />
          <ellipse cx="222" cy="144" rx="18" ry="9" fill="#8a5a30" />
          <ellipse cx="222" cy="139" rx="12" ry="5" fill="#B33A3A" />
          {/* hanging lantern */}
          <line x1="260" y1="26" x2="260" y2="48" stroke="#111" strokeWidth="2" />
          <circle cx="260" cy="56" r="9" fill="#FFE9B8" opacity="0.95" />
          <circle cx="260" cy="56" r="14" fill="#FFE9B8" opacity="0.2" />
          {/* trader */}
          <g transform="translate(196,118)">
            <ellipse cx="0" cy="30" rx="16" ry="4" fill="#00000055" />
            <path d="M-13,30 H13 L9,-2 H-9 Z" fill="#B33A3A" />
            <circle cx="0" cy="-10" r="9" fill="#5a3a26" />
            <ellipse cx="0" cy="-13" rx="11" ry="7" fill="#B33A3A" />
            <circle cx="10" cy="-11" r="3" fill="#B33A3A" />
          </g>
          {/* you */}
          <g transform="translate(52,128)">
            <ellipse cx="0" cy="30" rx="14" ry="4" fill="#00000055" />
            <path d="M-11,30 H11 L8,2 H-8 Z" fill="#1F7A4D" />
            <circle cx="0" cy="-6" r="8" fill="#3b2317" />
          </g>
          {/* counter */}
          <rect x="96" y="118" width="72" height="34" rx="3" fill="#6b4226" />
          <rect x="96" y="118" width="72" height="8" fill="#8a5a30" />
          <rect x="110" y="106" width="16" height="12" rx="2" fill="#E8A020" />
          <rect x="130" y="108" width="12" height="10" rx="2" fill="#1F7A4D" />
        </svg>
        <div className="p-5">
          <h3 className="font-display text-lg font-extrabold tracking-tight">🏪 {stall}</h3>
          <p className="mt-1 text-sm italic text-charcoal/70">“{greeting}”</p>
          <div className="mt-3 grid gap-2">
            <button onClick={onHaggle} className="rounded-2xl bg-charcoal px-4 py-2.5 text-sm font-bold text-cream">
              🧺 Haggle at the counter
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={onChop} className="rounded-2xl bg-cream px-4 py-2.5 text-sm font-bold ring-1 ring-roof/15">
                🍲 Chop {naira(PRICES.food.amalaPlate)}
              </button>
              {canChopSpecial && (
                <button onClick={onSpecial} className="rounded-2xl bg-mapo/25 px-4 py-2.5 text-sm font-bold ring-1 ring-mapo/40">
                  ⭐ Mama Special {naira(PRICES.food.mamaSpecial)}
                </button>
              )}
            </div>
            <button onClick={onGreet} disabled={greeted} className="rounded-2xl bg-cream px-4 py-2.5 text-sm font-bold ring-1 ring-roof/15 disabled:opacity-40">
              {greeted ? "✅ Greeted today" : "🙏 Greet trader (+1 Iwa)"}
            </button>
            <button onClick={onClose} className="text-center text-xs font-bold text-charcoal/50">
              Step back out →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
