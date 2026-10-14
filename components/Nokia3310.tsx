"use client";

import { useState } from "react";
export interface PhoneLine { id: string; from: string; text: string; time?: string }

export default function Nokia3310({ sms, clock }: { sms: PhoneLine[]; clock: string }) {
  const [sel, setSel] = useState(0);
  const [buzz, setBuzz] = useState(false);

  const ping = () => {
    setBuzz(true);
    setTimeout(() => setBuzz(false), 400);
  };

  return (
    <div className="flex justify-center">
      <div
        className={`w-[280px] rounded-[36px] bg-gradient-to-b from-[#2b3a4a] via-[#1d2733] to-[#10161d] p-3 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.55)] ring-1 ring-white/10 transition-transform ${
          buzz ? "animate-[nokiaBuzz_0.4s_ease]" : ""
        }`}
        role="group"
        aria-label="Fonu Mi Nokia 3310"
      >
        {/* earpiece + brand */}
        <div className="flex flex-col items-center pt-1">
          <div className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-black/70" />
            <span className="h-1.5 w-1.5 rounded-full bg-black/70" />
            <span className="h-1.5 w-1.5 rounded-full bg-black/70" />
          </div>
          <div className="font-display mt-1 text-[11px] font-extrabold tracking-[0.3em] text-slate-300">
            NOKIA
          </div>
        </div>

        {/* screen bezel */}
        <div className="mx-2 mt-2 rounded-2xl bg-black/80 p-2 shadow-inner">
          {/* CLASSIC GREEN BACKLIGHT */}
          <div className="h-[240px] overflow-hidden rounded-xl bg-[#9ca66c] bg-gradient-to-b from-[#aeb877] via-[#9ca66c] to-[#8b955e] p-2 shadow-[inset_0_2px_8px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between font-mono text-[10px] font-bold text-[#1d260f]">
              <span>📶 🔋</span>
              <span>FỌ́NU MI</span>
              <span>{clock.replace(" ", "")}</span>
            </div>
            {sms.length === 0 && <div className="mt-6 text-center font-mono text-[11px] text-[#1a240e]/70">No messages yet today.</div>}
            <div className="mt-1 h-[196px] space-y-1.5 overflow-y-auto font-mono text-[11px] leading-tight text-[#1a240e]">
              {sms.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSel(i);
                    ping();
                  }}
                  className={`w-full rounded-md px-2 py-1.5 text-left transition ${
                    sel === i
                      ? "bg-[#1d260f] text-[#c8d199] shadow"
                      : "bg-[#b3bd7f]/60"
                  }`}
                >
                  <div className="flex justify-between text-[9px] font-bold opacity-80"><span>{s.from}</span>{s.time && <span>{s.time}</span>}</div>
                  <div className={sel === i ? "" : "line-clamp-2"}>{s.text}</div>
                </button>
              ))}
            </div>
            <div className="mt-1 text-center font-mono text-[9px] font-bold text-[#1d260f]/70">
              ─ Menu ─ Nàmes ─
            </div>
          </div>
        </div>

        {/* nav cluster */}
        <div className="mt-2 flex items-center justify-between px-4">
          <button onClick={ping} aria-label="Call" className="flex h-9 w-12 items-center justify-center rounded-full bg-gradient-to-b from-slate-600 to-slate-800 text-sm shadow active:scale-95">📞</button>
          <button onClick={ping} aria-label="Menu" className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-slate-500 to-slate-700 shadow-[0_4px_0_rgba(0,0,0,0.5)] ring-2 ring-slate-400/30 active:translate-y-0.5 active:shadow-none">
            <span className="h-6 w-6 rounded-full bg-slate-800 shadow-inner" />
          </button>
          <button onClick={ping} aria-label="End" className="flex h-9 w-12 items-center justify-center rounded-full bg-gradient-to-b from-slate-600 to-slate-800 text-sm shadow active:scale-95">🔴</button>
        </div>

        {/* keypad */}
        <div className="mx-4 mt-2 grid grid-cols-3 gap-1.5 pb-3">
          {["1", "2 abc", "3 def", "4 ghi", "5 jkl", "6 mno", "7 pqrs", "8 tuv", "9 wxyz", "*", "0 +", "#"].map((k) => (
            <button
              key={k}
              onClick={ping}
              className="rounded-full bg-gradient-to-b from-slate-100 via-slate-300 to-slate-400 py-1.5 font-mono text-[10px] font-bold text-slate-800 shadow-[0_2px_0_rgba(0,0,0,0.4)] active:translate-y-px active:shadow-none"
            >
              {k}
            </button>
          ))}
        </div>

        <style jsx>{`
          @keyframes nokiaBuzz {
            0%, 100% { transform: rotate(0); }
            25% { transform: rotate(-1.2deg); }
            75% { transform: rotate(1.2deg); }
          }
          @media (prefers-reduced-motion: reduce) {
            div { animation: none !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
