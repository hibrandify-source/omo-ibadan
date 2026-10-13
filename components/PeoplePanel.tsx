"use client";

// The people whose lives run alongside yours: friendship, love, marriage.

import { LOVE, REL_LABEL, STORY_PEOPLE, naira, type BackgroundId, type LifeState } from "@/lib/game";
import { canAskOut, canPropose, canWed, partnerOf, relOf, weddingCost } from "@/lib/engine/life";

export default function PeoplePanel({
  life,
  bgId,
  bond,
  ola,
  day,
  zone,
  daytime,
  onHangOut,
  onAskOut,
  onPropose,
  onWed,
}: {
  life: LifeState;
  bgId: BackgroundId;
  bond: number;
  ola: number;
  day: number;
  zone: string;
  daytime: boolean;
  onHangOut: (id: string) => void;
  onAskOut: (id: string) => void;
  onPropose: (id: string) => void;
  onWed: (id: string) => void;
}) {
  const partner = partnerOf(life);
  const people = STORY_PEOPLE.filter((p) => !p.backgrounds || p.backgrounds.includes(bgId));
  return (
    <div className="rounded-3xl bg-white p-5 shadow-[0_16px_40px_-20px_rgba(122,74,43,0.35)] ring-1 ring-roof/10">
      <h3 className="font-display text-lg font-extrabold tracking-tight">❤️ Your people</h3>
      <p className="text-xs text-charcoal/55">
        Greet them in the street, then spend real time together. Bonds fade if you disappear.
        {partner ? ` You're with ${partner}.` : ""}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {people.map((p) => {
          const r = relOf(life, p.id);
          const here = zone === p.zone;
          const known = r.bond > 0;
          const ask = canAskOut(life, p.id);
          const prop = canPropose(life, p.id, day, ola);
          const marry = canWed(life, p.id, ola, bgId, bond);
          const romantic = r.stage === "dating" || r.stage === "engaged" || r.stage === "married";
          return (
            <div key={p.id} className={`rounded-2xl p-3 ring-1 ${romantic ? "bg-roof/10 ring-roof/30" : "bg-cream ring-roof/10"}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-bold">{p.id}</div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${romantic ? "bg-roof text-white" : r.stage === "stranger" ? "bg-charcoal/10 text-charcoal/60" : "bg-agodi text-white"}`}>
                  {known ? REL_LABEL[r.stage] : "Not met"}
                </span>
              </div>
              <div className="text-[11px] text-charcoal/55">{p.zoneLabel}</div>
              <p className="mt-1 text-xs text-charcoal/70">{known ? p.blurb : `Find them at ${p.zoneLabel} and say hello.`}</p>
              {known && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-charcoal/10" aria-label={`Bond ${r.bond} of 100`}>
                  <div className={`h-full rounded-full ${romantic ? "bg-roof" : "bg-agodi"}`} style={{ width: `${r.bond}%` }} />
                </div>
              )}
              {known && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    onClick={() => onHangOut(p.id)}
                    disabled={!here || !daytime}
                    title={!here ? `Go to ${p.zoneLabel} first` : !daytime ? "Too late; try tomorrow" : undefined}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold ${here && daytime ? "bg-charcoal text-cream" : "bg-charcoal/10 text-charcoal/40"}`}
                  >
                    {p.hangout.label}{p.hangout.cost ? ` · ${naira(p.hangout.cost)}` : ""}
                  </button>
                  {p.romance && !romantic && !partner && (
                    <button
                      onClick={() => onAskOut(p.id)}
                      disabled={!ask.ok}
                      title={ask.ok ? undefined : ask.why}
                      className={`rounded-full px-3 py-1 text-[11px] font-bold ${ask.ok ? "bg-roof text-white" : "bg-charcoal/10 text-charcoal/40"}`}
                    >
                      💌 Ask out
                    </button>
                  )}
                  {r.stage === "dating" && (
                    <button
                      onClick={() => onPropose(p.id)}
                      disabled={!prop.ok}
                      title={prop.ok ? undefined : prop.why}
                      className={`rounded-full px-3 py-1 text-[11px] font-bold ${prop.ok ? "bg-roof text-white" : "bg-charcoal/10 text-charcoal/40"}`}
                    >
                      💍 Propose · introduction {naira(LOVE.introduction)}
                    </button>
                  )}
                  {r.stage === "engaged" && (
                    <button
                      onClick={() => onWed(p.id)}
                      disabled={!marry.ok}
                      title={marry.ok ? undefined : marry.why}
                      className={`rounded-full px-3 py-1 text-[11px] font-bold ${marry.ok ? "bg-roof text-white" : "bg-charcoal/10 text-charcoal/40"}`}
                    >
                      💒 Wedding · {naira(weddingCost(bgId, bond))}
                    </button>
                  )}
                </div>
              )}
              {known && p.romance && !romantic && !partner && !ask.ok && <p className="mt-1 text-[10px] text-charcoal/45">{ask.why}</p>}
              {r.stage === "dating" && !prop.ok && <p className="mt-1 text-[10px] text-charcoal/45">{prop.why}</p>}
              {r.stage === "engaged" && !marry.ok && <p className="mt-1 text-[10px] text-charcoal/45">{marry.why}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
