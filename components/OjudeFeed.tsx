"use client";

const SEED = [
  { hood: "Bodija", text: "Ade just sprayed ₦50,000 at Bodija owambe! 💸", time: "2m" },
  { hood: "Agbowo", text: "UI vs Poly street ball Saturday — Agbowo dey ready ⚽", time: "9m" },
  { hood: "Iwo Road", text: "Micra full load 6/6 in 40s. Who fit beat am? 🚐", time: "14m" },
  { hood: "Beere", text: "Sunset for Mapo today too fine. Brown roofs 🌇", time: "31m" },
];

export default function OjudeFeed() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold">📣 Ojude Feed</h3>
        <span className="text-xs text-charcoal/50">async · no DMs in V1</span>
      </div>
      <div className="mt-3 space-y-2">
        {SEED.map((p, i) => (
          <div key={i} className="rounded-xl bg-cream p-3 text-sm">
            <span className="mr-2 rounded-full bg-roof/10 px-2 py-0.5 text-xs font-bold text-roof">{p.hood}</span>
            {p.text} <span className="text-xs opacity-50">· {p.time}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input disabled placeholder="Shout (V1 presets only) — free chat in V2" className="w-full rounded-full bg-cream px-4 py-2 text-sm opacity-60" />
        <button className="rounded-full bg-roof px-4 py-2 text-sm font-bold text-cream">Spray 💸</button>
      </div>
    </div>
  );
}
