"use client";

// Family time: pick what to do with Mama or Daddy right now.

import { FAMILY_ACTIVITIES, naira, type BackgroundId } from "@/lib/game";
import type { DayPart } from "@/lib/engine/clock";

export default function FamilyPanel({
  bgId,
  part,
  bond,
  bondLabel,
  energy,
  doneToday,
  onDo,
  onClose,
}: {
  bgId: BackgroundId;
  part: DayPart;
  bond: number;
  bondLabel: string;
  energy: number;
  /** activity ids already done today */
  doneToday: string[];
  onDo: (id: string) => void;
  onClose: () => void;
}) {
  const fam = FAMILY_ACTIVITIES[bgId];
  const evening = part === "evening";
  const now = fam.list.filter((a) => a.parts.includes(part));
  const later = fam.list.filter((a) => !a.parts.includes(part));
  const where = part === "night" ? "Everyone is asleep" : evening ? fam.evening : fam.day;
  return (
    <div role="dialog" aria-label="Family time" className="fixed inset-0 z-30 flex items-end justify-center bg-charcoal/70 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-3xl bg-cream shadow-2xl ring-1 ring-roof/20" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-charcoal px-4 py-3 text-cream">
          <div>
            <div className="text-[10px] font-extrabold tracking-[0.25em] text-mapo">FAMILY TIME · {fam.who.toUpperCase()}</div>
            <div className="font-display text-base font-extrabold">{where}</div>
          </div>
          <button onClick={onClose} className="shrink-0 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold">Done →</button>
        </div>
        <div className="space-y-3 p-4">
          <div>
            <div className="flex justify-between text-xs font-bold"><span>{bondLabel}</span><span>{bond}</span></div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-charcoal/10"><div className="h-full rounded-full bg-agodi" style={{ width: `${bond}%` }} /></div>
          </div>
          {part === "night" && <p className="rounded-2xl bg-white p-3 text-sm ring-1 ring-roof/10">It&apos;s late. Come back in the morning to help at the {bgId === "omo-iya-lobe" ? "stall" : "site"}, or in the evening at home.</p>}
          {now.map((a) => {
            const done = doneToday.includes(a.id);
            const tired = energy + a.energy < 5;
            return (
              <div key={a.id} className={`rounded-2xl p-3 ring-1 ${done ? "bg-agodi/10 ring-agodi/30" : "bg-white ring-roof/10"}`}>
                <div className="text-sm font-bold">{done ? "✅ " : ""}{a.label}</div>
                <p className="text-xs text-charcoal/65">{a.blurb}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-charcoal/60">
                    {a.minutes >= 60 ? `${a.minutes / 60}h` : `${a.minutes}m`} · {a.energy}⚡ · {bondLabel} +{a.bond}{a.tip ? ` · +${naira(a.tip)}` : ""}{a.skill ? ` · ${a.skill.id} +${a.skill.xp}` : ""}
                  </span>
                  <button
                    onClick={() => onDo(a.id)}
                    aria-label={`Do: ${a.label}`}
                    disabled={done || tired}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold ${done || tired ? "bg-charcoal/10 text-charcoal/40" : "bg-charcoal text-cream"}`}
                  >
                    {done ? "Done today" : tired ? "Too tired" : "Do this"}
                  </button>
                </div>
              </div>
            );
          })}
          {later.length > 0 && part !== "night" && (
            <p className="text-[11px] text-charcoal/55">
              {evening ? `In the day at ${fam.day}: ` : `This evening at home: `}
              {later.map((a) => a.label.toLowerCase()).join(" · ")}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
