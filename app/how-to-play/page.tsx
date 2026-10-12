import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import { ARCHETYPES, ECONOMY, TITLE_LADDER } from "@/lib/game";

export const metadata = {
  title: "How to play — Omo Ibadan",
  description: "Learn the loop: hustle, trade, brain, survive, rank. Ola and Iwa explained.",
};

export default function HowToPlay() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-[11px] font-extrabold tracking-[0.25em] text-roof">GUIDE · 5 MIN READ</div>
      <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">How to play Omo Ibadan</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-charcoal/70">
        You land in Ibadan with a welcome ₦{ECONOMY.WELCOME_BONUS} plus your background base. From there, life is a loop:
        hustle for Ola, chop to keep energy, survive NEPA and rent, and grow both wealth and character until the city calls you Mogaji.
      </p>

      <div className="mt-6 space-y-3">
        {[
          { t: "1 · Pick who you are", d: "Choose one of 5 backgrounds — UI Student, Poly Hustler, Bodija Trader Pikin, Beere Omoluabi, Dugbe Big Boy. Each starts with different Ola, Iwa, energy, and a perk. Then pick Omo Ibadan (full Yoruba depth) or Ajala visitor mode (everything explained small-small)." },
          { t: "2 · Hustle micra", d: "Ride as a passenger for a calm cinematic trip, or drive: load up to 6, steer across 3 lanes, dodge keke, okada, potholes and VIO, and STOP inside the yellow box to collect fares. Overload pays more — until VIO catches you." },
          { t: "3 · Trade Bodija", d: "Buy stock cheap at Oja Oba (₦400), carry it to Bodija, read customer mood, and haggle: price too high and they walk away calling you ole. Sell fair and your Iwa grows." },
          { t: "4 · Pass exams", d: "UI Exam Survival quizzes you on Ibadan history, proverbs, and street sense. Each pass pays ₦250 + Iwa. Three passes complete a story mission." },
          { t: "5 · Survive the week", d: "Every 6 hustle actions is a new day. IBEDC blackouts, rain-locked Ring Road, Sunday family meetings, and Baba Ade's rent knock every 3rd day. Keep reserves — overspending early stalls you like real life." },
          { t: "6 · Rep your hood, earn titles", d: "All six hoods compete weekly; your earnings feed your hood's total. Titles run Omo Adugbo → Mogaji → Olubadan of Hustle — and no amount of Ola crowns you without 60+ Iwa." },
        ].map((s) => (
          <div key={s.t} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-roof/10">
            <div className="font-display font-extrabold">{s.t}</div>
            <p className="mt-1 text-sm leading-relaxed text-charcoal/65">{s.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl bg-charcoal p-5 text-cream">
        <div className="font-display font-extrabold">Starting backgrounds</div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {ARCHETYPES.map((a) => (
            <div key={a.id} className="rounded-2xl bg-white/[0.07] p-3 text-sm ring-1 ring-white/10">
              <div className="font-bold">{a.name}</div>
              <div className="text-xs text-cream/60">{a.desc}</div>
              <div className="mt-1 text-xs font-semibold text-mapo">₦{a.ola} · Iwa {a.iwa} · {a.perk}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-white p-5 ring-1 ring-roof/10">
        <div className="font-display font-extrabold">Title ladder</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {TITLE_LADDER.map((t) => (
            <span key={t} className="rounded-full bg-cream px-3 py-1.5 text-xs font-bold ring-1 ring-roof/15">{t}</span>
          ))}
        </div>
      </div>

      <AdSlot slot="guide-mid" />
      <Link href="/play" className="mt-6 inline-block rounded-full bg-gradient-to-r from-mapo to-[#f5c04a] px-8 py-3 font-display font-extrabold text-charcoal shadow">Enter Ibadan — free →</Link>
    </main>
  );
}
