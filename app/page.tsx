import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import HeroScene from "@/components/landing/HeroScene";
import Figures from "@/components/landing/Figures";
import MapPreview from "@/components/landing/MapPreview";
import { BACKGROUNDS, HOODS, TITLE_LADDER, naira } from "@/lib/game";
import { CITY } from "@/lib/map/ibadan";

const LOBE = BACKGROUNDS["omo-iya-lobe"];
const ALW = BACKGROUNDS.alowonle;
const DISTRICTS = CITY.districts.length;

const LIVES = [
  {
    bg: LOBE,
    who: [{ cast: "mamaBisi", dir: "S" as const }, { cast: "tunde", dir: "S" as const }],
    ground: "#c98a5c",
    figures: "Mama Bisi and your brother Tunde in the Beere compound",
    start: `${naira(LOBE.pocket)} in your pocket`,
    odds: "8 in 10 lives",
  },
  {
    bg: ALW,
    who: [{ cast: "mummy", dir: "S" as const }, { cast: "alowonleGirl", dir: "S" as const }, { cast: "gatemanMusa", dir: "S" as const }],
    ground: "#b9b0a0",
    figures: "Mummy, you, and Musa the gateman at the Old Bodija house",
    start: `${naira(ALW.pocket)}, a car, and ${naira(ALW.allowancePerWeek)} a week from Daddy (with conditions)`,
    odds: "2 in 10 lives",
  },
];

const STORY = [
  { age: "18", title: "School leaver", text: "WAEC done. The JAMB form comes out in January: register, read past questions, sit the exam at a CBT centre in Agbowo." },
  { age: "19", title: "UI, the Poly, or the market", text: "Score 240 for UI, 160 for the Poly, or choose the hustle. Fees every session, lectures to attend, carry-overs if you don't." },
  { age: "23", title: "NYSC", text: "Your call-up letter could say Oyo or Borno. Camp, a place of primary assignment, ₦77,000 a month, then passing out." },
  { age: "24+", title: "Work and your own place", text: "Twenty-five careers from micra driver to banker. Rent a self-contain, then a flat, then a duplex in Jericho." },
  { age: "Love", title: "Friends, love, family", text: "Ada at the UI gate, Tobi at the Poly, Oga Emeka at Gbagi. Ask out, introduction, wedding, naming ceremony." },
  { age: "28–38", title: "Your legacy", text: "Close the story and the city sings your oriki: what you built, who you loved, the name you left in the market." },
];

const FEATURES = [
  { e: "🚶", t: "Walk every street", d: `${DISTRICTS} districts drawn street by street: Mapo Hall, Cocoa House, Bodija market, UI gate, Iwo Road park, Agodi Gardens, the airport at Alakia.` },
  { e: "🚐", t: "Micra Rush", d: "Drive real corridors from OpenStreetMap. Stay in the kerb lane, stop in the bay, load passengers, dodge okadas and VIO." },
  { e: "👪", t: "Family time", d: "Serve the lunch crowd at Mama's stall or sit in on Daddy's site meeting. Their trust changes everything." },
  { e: "💃", t: "Owambe", d: "Aso-ebi, the Fuji band, the celebrant on the floor. Spray your money and dance; the money boy will gather it." },
  { e: "📱", t: "Fọ́nu Mi", d: "Texts from Mama, bank alerts, JAMB, IBEDC light-outs and your partner, arriving through the day." },
  { e: "⏩", t: "Live it in seasons", d: "Play day by day, or move on three months at a time with a focus: work, school, family or love." },
];

const FAQS = [
  { q: "E free?", a: "Yes. Omo Ibadan is free in your browser, on your phone or laptop. No download." },
  { q: "Do I need to download anything?", a: "No. Open Play, pick your @name, draw the life you're born into, and you're in Ibadan in under a minute." },
  { q: "Can I choose to be born rich?", a: "No, and that's the point. Like real life, the lottery decides: most people are born Omo Iya Lobe. Both lives can end well, or badly." },
  { q: "Which Ibadan areas are inside?", a: `All ${DISTRICTS}: Beere, Oja'ba, Mapo, Bodija, Old Bodija, UI gate, Agbowo, Samonda, Sango, Ojoo, Moniya, Mokola, Dugbe, Agodi, Eleyele, Jericho, Ring Road, Challenge, Molete, Oje, Iwo Road, Akobo, Alakia, Sabo, Gbagi, Agbeni and Aleshinloye. Distances come from the real road network.` },
  { q: "How do Ola and Iwa work?", a: "Ola is wealth: hustle, trade, work your way up. Iwa is character: keep promises, pay rent, send money home, don't overload your micra. Titles need both." },
  { q: "Do I need an account?", a: "No. Your game saves on your phone. Sign in with your email if you want a cloud save that follows you to another device." },
  { q: "Is the naira real money?", a: "No. All naira is virtual, for fun and ranking only. It cannot be withdrawn or cashed out." },
];

export default function Landing() {
  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden bg-charcoal text-cream">
        <HeroScene />
        <div className="mx-auto max-w-5xl px-4 pb-10 pt-8 sm:pt-10">
          <div className="text-[11px] font-extrabold tracking-[0.25em] text-mapo">🇳🇬 IBADAN · FREE IN YOUR BROWSER</div>
          <h1 className="font-display mt-3 max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Live your <span className="text-mapo">Ibadan</span> life.
          </h1>
          <p className="mt-4 max-w-xl text-base text-cream/75 sm:text-lg">
            Start at 18 under the brown roofs of Beere, or behind the gate of a Bodija mansion. Hustle micra on real roads,
            write JAMB, serve your NYSC, find love, raise a family, and leave a name the city remembers.
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
            <span className="rounded-full bg-white/10 px-3 py-1">📱 Made for phones</span>
            <span className="rounded-full bg-white/10 px-3 py-1">🎲 Born poor or born rich</span>
          </div>
        </div>
      </section>

      {/* TWO LIVES */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Two lives, one city.</h2>
        <p className="mt-2 max-w-xl text-sm text-charcoal/60">You don&apos;t choose where you&apos;re born. The lottery does. Neither life is easy mode.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {LIVES.map((l) => (
            <div key={l.bg.id} className="overflow-hidden rounded-3xl bg-white shadow-[0_16px_40px_-20px_rgba(122,74,43,0.35)] ring-1 ring-roof/10">
              <Figures who={l.who} ground={l.ground} label={l.figures} />
              <div className="p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-display text-xl font-extrabold">{l.bg.name}</div>
                  <span className="rounded-full bg-cream px-2.5 py-0.5 text-[11px] font-bold text-charcoal/60 ring-1 ring-roof/10">{l.odds}</span>
                </div>
                <div className="text-xs font-bold text-roof">{l.bg.meaning} · {l.bg.homeLabel}</div>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{l.bg.tagline}</p>
                <p className="mt-2 text-xs font-semibold text-charcoal/60">You start with {l.start}.</p>
                <ul className="mt-3 space-y-1 text-[13px] text-charcoal/70">
                  {l.bg.strengths.slice(0, 2).map((s) => <li key={s}>✅ {s}</li>)}
                  {l.bg.pressures.slice(0, 2).map((s) => <li key={s}>⚠️ {s}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* THE STORY */}
      <section className="border-y border-roof/10 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Your story, 18 to 38.</h2>
          <p className="mt-2 max-w-xl text-sm text-charcoal/60">Twenty years of an Ibadan life. Every choice shows up later.</p>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STORY.map((s) => (
              <li key={s.title} className="rounded-3xl bg-cream p-4 ring-1 ring-roof/10">
                <div className="text-[11px] font-extrabold tracking-widest text-roof">{s.age}</div>
                <div className="font-display mt-0.5 font-extrabold">{s.title}</div>
                <p className="mt-1 text-[13px] leading-relaxed text-charcoal/65">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* REAL IBADAN */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Real Ibadan, street by street.</h2>
        <p className="mt-2 max-w-xl text-sm text-charcoal/60">
          The map is built from OpenStreetMap: real roads, real distances, real fares. {DISTRICTS} districts, each one a street you can walk.
        </p>
        <div className="mt-5 overflow-hidden rounded-3xl bg-white p-3 ring-1 ring-roof/10 sm:p-4">
          <MapPreview />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((c) => (
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
            <p className="mt-1 text-sm text-cream/60">Pick your @name, draw your life, and you&apos;re inside in one minute.</p>
            <Link href="/play" className="mt-4 inline-block rounded-full bg-gradient-to-r from-mapo to-[#f5c04a] px-8 py-3 font-display font-extrabold text-charcoal">Play free now →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
