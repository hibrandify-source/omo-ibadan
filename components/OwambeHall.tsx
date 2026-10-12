"use client";

import { useEffect, useState } from "react";
import { ensureAudio, fujiStart, fujiStop, coin, drumHit } from "@/lib/sound";
import { PRICES } from "@/lib/game";

// Owambe hall — OUR differentiator they don't have: live Fuji band,
// dance floor, spraying battles. Spraying is a money sink (fun keeps
// the economy honest) and feeds the hood + daily hunt.
function Dancer({ x, color, skin, delay, fem }: { x: number; color: string; skin: string; delay: number; fem?: boolean }) {
  return (
    <g transform={`translate(${x},0)`} className="ow-dance" style={{ animationDelay: `${delay}s` }}>
      <ellipse cx="0" cy="0" rx="9" ry="3.5" fill="#00000044" />
      <line x1="-3" y1="-10" x2="-4" y2="0" stroke="#241a12" strokeWidth="3.4" strokeLinecap="round" />
      <line x1="3" y1="-10" x2="4" y2="0" stroke="#241a12" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M-7,-10 H7 L5,-26 H-5 Z" fill={color} />
      <line x1="-7" y1="-20" x2="-13" y2="-30" stroke={color} strokeWidth="4" strokeLinecap="round" className="ow-arm" style={{ animationDelay: `${delay}s` }} />
      <line x1="7" y1="-20" x2="13" y2="-30" stroke={color} strokeWidth="4" strokeLinecap="round" className="ow-arm2" style={{ animationDelay: `${delay}s` }} />
      <circle cx="0" cy="-31" r="5.4" fill={skin} />
      {fem ? (
        <g fill={color}>
          <ellipse cx="0" cy="-33" rx="6.6" ry="4" />
          <circle cx="5.6" cy="-31.5" r="2" />
        </g>
      ) : (
        <path d="M-5.4,-32.5 A5.4,5.4 0 0 1 5.4,-32.5 Z" fill={color} />
      )}
    </g>
  );
}

export default function OwambeHall({
  ola,
  energy,
  onSpray,
  onDance,
}: {
  ola: number;
  energy: number;
  onSpray: (amount: number) => void;
  onDance: () => void;
}) {
  const [bursts, setBursts] = useState<{ id: number; x: number; amt: number }[]>([]);
  useEffect(() => {
    ensureAudio();
    fujiStart();
    return () => fujiStop();
  }, []);
  const spray = (amt: number) => {
    if (ola < amt) return;
    ensureAudio();
    coin();
    const id = Date.now() + Math.random();
    const b = { id, x: 60 + Math.random() * 180, amt };
    setBursts((v) => [...v, b]);
    setTimeout(() => setBursts((v) => v.filter((x) => x.id !== id)), 1600);
    onSpray(amt);
  };
  const dance = () => {
    ensureAudio();
    drumHit();
    onDance();
  };
  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-3xl bg-charcoal text-cream ring-1 ring-white/10">
        <svg viewBox="0 0 300 190" className="block h-auto w-full" role="img" aria-label="Owambe hall: live band and dance floor">
          <defs>
            <linearGradient id="owbg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#241610" />
              <stop offset="100%" stopColor="#4a2c1c" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="300" height="190" fill="url(#owbg)" />
          {/* disco lights */}
          <polygon points="60,0 20,90 100,90" fill="#E8A020" opacity="0.18" />
          <polygon points="150,0 110,90 190,90" fill="#B33A3A" opacity="0.2" />
          <polygon points="240,0 200,90 280,90" fill="#1F7A4D" opacity="0.18" />
          {/* stage */}
          <rect x="0" y="96" width="300" height="10" fill="#6b4226" />
          {/* talking drum */}
          <g transform="translate(52,72)">
            <ellipse cx="0" cy="0" rx="16" ry="10" fill="#8a5a30" />
            <ellipse cx="-16" cy="0" rx="4" ry="10" fill="#EDE3D2" />
            <ellipse cx="16" cy="0" rx="4" ry="10" fill="#EDE3D2" />
            <line x1="-24" y1="-18" x2="-30" y2="-34" stroke="#5a3a26" strokeWidth="3" strokeLinecap="round" className="ow-drum" />
            <line x1="24" y1="-18" x2="30" y2="-34" stroke="#5a3a26" strokeWidth="3" strokeLinecap="round" className="ow-drum2" />
            <circle cx="0" cy="-30" r="7" fill="#3b2317" />
          </g>
          {/* trumpet */}
          <g transform="translate(128,66)">
            <circle cx="0" cy="-24" r="7" fill="#5a3a26" />
            <rect x="-2" y="-24" width="34" height="5" fill="#E8A020" />
            <polygon points="32,-28 42,-20 32,-12" fill="#E8A020" />
            <path d="M-9,-18 H9 L7,-2 H-7 Z" fill="#0e7a8a" />
          </g>
          {/* singer with mic */}
          <g transform="translate(208,64)">
            <path d="M-10,-16 H10 L8,2 H-8 Z" fill="#c2185b" />
            <circle cx="0" cy="-24" r="7.5" fill="#3b2317" />
            <line x1="10" y1="-20" x2="22" y2="-34" stroke="#111" strokeWidth="2.5" />
            <circle cx="23" cy="-36" r="4" fill="#333" />
          </g>
          {/* marquee */}
          <rect x="86" y="8" width="128" height="20" rx="10" fill="#1C1917" />
          <text x="150" y="22" fontSize="11" fill="#F5C518" fontWeight="bold" textAnchor="middle">OWAMBE · FUJI NIGHT</text>
          {/* dance floor */}
          <rect x="0" y="106" width="300" height="84" fill="#2b1d12" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={i * 50} y="106" width="50" height="84" fill={i % 2 ? "#ffffff08" : "#00000022"} />
          ))}
          <Dancer x={70} color="#c2185b" skin="#5a3a26" delay={0} fem />
          <Dancer x={130} color="#1F7A4D" skin="#3b2317" delay={0.4} />
          <Dancer x={190} color="#E8A020" skin="#3b2317" delay={0.8} fem />
          <Dancer x={248} color="#3b5bd6" skin="#5a3a26" delay={1.2} />
          {/* spray bursts */}
          {bursts.map((b) => (
            <g key={b.id} className="ow-burst" transform={`translate(${b.x},150)`}>
              <text y="0" fontSize="13" fill="#F5C518" fontWeight="bold" textAnchor="middle">₦{b.amt} 💸</text>
            </g>
          ))}
        </svg>
        <style>{`
          .ow-dance { animation: owdance 0.9s ease-in-out infinite; transform-box: fill-box; transform-origin: bottom center; }
          @keyframes owdance { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-7px) rotate(2deg); } }
          .ow-arm, .ow-arm2 { animation: owarm 0.45s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: top center; }
          .ow-arm2 { animation-delay: 0.2s; }
          @keyframes owarm { from { transform: rotate(-14deg); } to { transform: rotate(20deg); } }
          .ow-drum, .ow-drum2 { animation: owarm 0.3s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: bottom center; }
          .ow-drum2 { animation-delay: 0.15s; }
          .ow-burst { animation: owburst 1.5s ease-out forwards; }
          @keyframes owburst { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-46px); opacity: 0; } }
          @media (prefers-reduced-motion: reduce) { .ow-dance, .ow-arm, .ow-arm2, .ow-drum, .ow-drum2, .ow-burst { animation: none; } }
        `}</style>
      </div>
      <div className="rounded-3xl bg-white p-4 ring-1 ring-roof/10">
        <div className="text-[10px] font-extrabold tracking-[0.25em] text-roof">SPRAYING BATTLE · MONEY SINK, BRAGGING RIGHTS</div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {PRICES.spray.map((amt) => (
            <button
              key={amt}
              onClick={() => spray(amt)}
              disabled={ola < amt}
              className="rounded-2xl bg-charcoal px-3 py-2.5 text-sm font-extrabold text-cream disabled:opacity-35"
            >
              💸 ₦{amt.toLocaleString()}
            </button>
          ))}
        </div>
        <button
          onClick={dance}
          disabled={energy < 10}
          className="mt-2 w-full rounded-2xl bg-mapo/25 px-4 py-2.5 text-sm font-extrabold ring-1 ring-mapo/40 disabled:opacity-40"
        >
          💃 Dance (10⚡ → +1 Iwa){energy < 10 ? " — rest first" : ""}
        </button>
        <p className="mt-2 text-[11px] text-charcoal/55">Half of every spray rains on your hood's turf. The band chop the rest — Fuji no be free.</p>
      </div>
    </div>
  );
}
