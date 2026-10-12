import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import { HOODS, TITLE_LADDER } from "@/lib/game";

// Landing hero panorama: hand-drawn SVG Ibadan skyline —
// brown roofs, Mapo Hill + hall, Cocoa House tower, amber dusk.
function Skyline() {
  const roofs = [
    { x: 0, w: 46, h: 26 }, { x: 40, w: 52, h: 34 }, { x: 86, w: 44, h: 24 },
    { x: 124, w: 56, h: 36 }, { x: 174, w: 48, h: 28 }, { x: 216, w: 54, h: 34 },
    { x: 264, w: 46, h: 26 }, { x: 304, w: 56, h: 36 }, { x: 354, w: 48, h: 28 },
    { x: 396, w: 52, h: 33 }, { x: 442, w: 48, h: 26 }, { x: 484, w: 56, h: 35 },
    { x: 534, w: 46, h: 27 }, { x: 574, w: 52, h: 34 },
  ];
  return (
    <svg viewBox="0 0 626 240" className="block h-auto w-full" role="img" aria-label="Ibadan brown roof skyline at dusk">
      <defs>
        <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#241610" />
          <stop offset="55%" stopColor="#7A4A2B" />
          <stop offset="82%" stopColor="#E8A020" />
          <stop offset="100%" stopColor="#F5D9A8" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="626" height="240" fill="url(#dusk)" />
      <circle cx="500" cy="150" r="26" fill="#FFE9B8" />
      <circle cx="500" cy="150" r="40" fill="#FFE9B8" opacity="0.25" />
      {/* Mapo hill + hall */}
      <ellipse cx="120" cy="205" rx="110" ry="42" fill="#3a2318" />
      <rect x="88" y="120" width="64" height="30" fill="#EDE3D2" />
      <polygon points="82,120 120,96 158,120" fill="#B33A3A" />
      <rect x="116" y="132" width="8" height="18" fill="#5c4232" />
      {/* Cocoa House tower */}
      <rect x="440" y="40" width="44" height="150" fill="#6b4a2e" stroke="#2b1a12" strokeWidth="2" />
      {Array.from({ length: 8 }).map((_, i) => (
        <g key={i}>
          {Array.from({ length: 4 }).map((_, j) => (
            <rect key={j} x={446 + j * 10} y={50 + i * 17} width="7" height="9" fill="#FFE9B8" opacity={i % 3 === 0 ? 0.95 : 0.45} />
          ))}
        </g>
      ))}
      <rect x="434" y="30" width="56" height="10" fill="#2b1a12" />
      {/* brown roofs */}
      {roofs.map((r, i) => (
        <g key={i}>
          <rect x={r.x} y={190 - r.h} width={r.w} height={r.h + 50} fill={i % 2 ? "#6b3f27" : "#7A4A2B"} />
          <polygon points={`${r.x - 4},${190 - r.h} ${r.x + r.w / 2},${176 - r.h} ${r.x + r.w + 4},${190 - r.h}`} fill="#3f2517" />
          {Array.from({ length: Math.floor(r.w / 14) }).map((_, k) => (
            <rect key={k} x={r.x + 6 + k * 14} y={198 - r.h} width="5" height="7" fill="#FFE9B8" opacity="0.75" />
          ))}
        </g>
      ))}
      {/* micra silhouette on road */}
      <rect x="0" y="228" width="626" height="12" fill="#1C1917" />
      <g transform="translate(300,222)">
        <path d="M-22 6 L-22 -2 Q-22 -5 -18 -5.5 L-11 -6 L-5.5 -12 L7 -12 L12.5 -6 L19.5 -5.5 Q22.5 -5 22.5 -1 L22.5 5 Q22.5 7 19.5 7 L-19 7 Q-22 7 -22 6 Z" fill="#5A1F2B" stroke="#0c0c0e" />
        <path d="M-18 -5.5 L-11 -6 L-5.5 -12 L7 -12 L12.5 -6 L19.5 -5.5 L19.5 -3.4 L-18 -3.4 Z" fill="#F5C518" />
        <circle cx="-12" cy="7" r="4.5" fill="#0c0c0e" /><circle cx="12" cy="7" r="4.5" fill="#0c0c0e" />
      </g>
    </svg>
  );
}

const FAQS = [
  { q: "E free?", a: "Yes. Omo Ibadan is free in your browser — phone or laptop, no download. Optional flex extras arrive in V2." },
  { q: "Do I need to download anything?", a: "No. Open /play, pick your @name, draw the life you're born into, and enter Ibadan in under a minute." },
  { q: "Which Ibadan areas are inside?", a: "15 nodes at launch: UI/Agbowo, Sango-Poly, Bodija, Mokola, Dugbe/Cocoa House, Mapo/Beere, Oja Oba, Oje, Agodi, Challenge, Molete, Ring Road, Iwo Road/Gbagi, Eleyele/Jericho." },
  { q: "How do Ola and Iwa work?", a: "Ola is wealth — hustle micra, trade market, pass exams. Iwa is character — keep promises, pay rent, send money home, no overload cheating. Titles need both." },
  { q: "Is the naira real money?", a: "No. All naira is virtual, for fun and ranking only. It cannot be withdrawn or cashed out." },
  { q: "Will it run on my low-end phone?", a: "That's the plan — our performance floor is 2GB RAM Android Go, with a quality toggle that cuts effects before it cuts gameplay." },
];

export default function Landing() {
  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden bg-charcoal text-cream">
        <Skyline />
        <div className="mx-auto max-w-5xl px-4 pb-10 pt-8 sm:pt-12">
          <div className="text-[11px] font-extrabold tracking-[0.25em] text-mapo">🇳🇬 IBADAN · FREE IN YOUR BROWSER</div>
          <h1 className="font-display mt-3 max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Live your <span className="text-mapo">Ibadan</span> life.
          </h1>
          <p className="mt-4 max-w-xl text-base text-cream/75 sm:text-lg">
            Hustle micra from Mokola to Iwo Road, haggle Bodija market, survive IBEDC nights,
            chop Amala Skye, rep your hood — and become Mogaji with both wealth <i>and</i> character.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/play" className="rounded-full bg-gradient-to-r from-mapo to-[#f5c04a] px-7 py-3 font-display font-extrabold text-charcoal shadow-xl">
              Enter Ibadan — free →
            </Link>
            <Link href="/how-to-play" className="rounded-full border border-cream/25 px-7 py-3 font-bold text-cream/85 hover:bg-white/10">
              How to play
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-cream/55">
            <span className="rounded-full bg-white/10 px-3 py-1">✓ No download</span>
            <span className="rounded-full bg-white/10 px-3 py-1">✓ 2GB-Android friendly</span>
            <span className="rounded-full bg-white/10 px-3 py-1">🎲 Born poor or born rich</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Hustle. Chop. Light. Flex. Rank.</h2>
        <p className="mt-2 max-w-xl text-sm text-charcoal/60">One loop, every day in Ibadan. Two lives — Omo Iya Lobe or Alowonle — fifteen areas, two meters that matter.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { e: "🚐", t: "Hustle", d: "Ride or drive micra. Load fast at Iwo Road, dodge VIO, stop inside the box." },
            { e: "🧺", t: "Trade", d: "Buy low Oja Oba, haggle hard, sell high Bodija. Read customer mood." },
            { e: "📝", t: "Brain", d: "UI Exam Survival — proverbs, history, street sense. Pass to unlock jobs." },
            { e: "⚡", t: "Survive", d: "NEPA weeks, rent knocks, rain-locked Ring Road. Keep reserves, stay Omoluabi." },
            { e: "👑", t: "Rank", d: "Climb Omo Adugbo → Mogaji → Olubadan. Ola AND Iwa required." },
          ].map((c) => (
            <div key={c.t} className="rounded-3xl bg-white p-4 shadow-[0_16px_40px_-20px_rgba(122,74,43,0.35)] ring-1 ring-roof/10">
              <div className="text-2xl">{c.e}</div>
              <div className="font-display mt-1 font-extrabold">{c.t}</div>
              <div className="mt-1 text-[13px] leading-relaxed text-charcoal/65">{c.d}</div>
            </div>
          ))}
        </div>
        <AdSlot slot="landing-mid" />
      </section>

      {/* HOODS */}
      <section className="border-y border-roof/10 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Rep your hood.</h2>
          <p className="mt-2 max-w-xl text-sm text-charcoal/60">Six hoods, one weekly crown. Every naira you hustle counts for your people.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {HOODS.map((h) => (
              <div key={h.id} className="rounded-3xl bg-cream p-4 ring-1 ring-roof/10">
                <div className="font-display font-extrabold">{h.name}</div>
                <div className="mt-1 text-[13px] text-charcoal/60">{h.oriki}</div>
              </div>
            ))}
          </div>
          <Link href="/leaderboard" className="mt-5 inline-block rounded-full bg-charcoal px-6 py-2.5 text-sm font-bold text-cream">See the turf →</Link>
        </div>
      </section>

      {/* TITLES */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Titles are earned, not bought.</h2>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {TITLE_LADDER.map((t, i) => (
            <span key={t} className="flex items-center gap-2">
              <span className={`rounded-full px-4 py-2 text-sm font-bold ring-1 ${i === TITLE_LADDER.length - 1 ? "bg-gradient-to-r from-mapo to-[#f5c04a] text-charcoal ring-mapo" : "bg-white text-charcoal/75 ring-roof/15"}`}>{t}</span>
              {i < TITLE_LADDER.length - 1 && <span className="text-charcoal/30">→</span>}
            </span>
          ))}
        </div>
        <p className="mt-3 max-w-xl text-sm text-charcoal/60">No amount of Ola crowns you with low Iwa. Cheat the market or overload your micra and the elders will keep you at Omo Adugbo.</p>
      </section>

      {/* FAQ */}
      <section className="border-t border-roof/10 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h2 className="font-display text-2xl font-extrabold tracking-tight">Wetin you wan know?</h2>
          <div className="mt-5 space-y-2.5">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl bg-cream px-4 py-3 ring-1 ring-roof/10">
                <summary className="cursor-pointer text-sm font-bold">{f.q}</summary>
                <p className="mt-1.5 text-sm leading-relaxed text-charcoal/65">{f.a}</p>
              </details>
            ))}
          </div>
          <AdSlot slot="landing-faq" />
          <div className="mt-8 rounded-3xl bg-charcoal p-6 text-center text-cream sm:p-8">
            <div className="font-display text-xl font-extrabold sm:text-2xl">Ibadan dey wait for you.</div>
            <p className="mt-1 text-sm text-cream/60">Pick your look, your hood, your @name. You dey inside in one minute.</p>
            <Link href="/play" className="mt-4 inline-block rounded-full bg-gradient-to-r from-mapo to-[#f5c04a] px-8 py-3 font-display font-extrabold text-charcoal">Play free now →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
