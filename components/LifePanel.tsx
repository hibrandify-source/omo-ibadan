"use client";

// The long life at a glance: age, where you are in school, the season skip,
// milestones, and (from 28) writing your legacy.

import {
  LECTURES_PER_YEAR,
  LEGACY_MAX_AGE,
  LEGACY_MIN_AGE,
  SCHOOLS,
  SEASON_FOCUS,
  SKIP_FROM_DAY,
  type LifeState,
  type SeasonFocus,
} from "@/lib/game";

const STAGE_TEXT: Record<LifeState["edu"]["stage"], string> = {
  none: "School leaver: WAEC done. The JAMB form comes out every January.",
  registered: "Registered for JAMB. The exam is in April; practise at the UI exam hall.",
  awaiting: "Sat JAMB. Waiting for the result.",
  admitted: "Admitted. Resumption is in October.",
  student: "Student.",
  graduate: "Graduate, waiting for the NYSC call-up.",
  nysc: "Serving: NYSC service year.",
  served: "NYSC done. Certificate in hand.",
  dropped: "Chose the hustle over school.",
};

export default function LifePanel({
  age,
  day,
  life,
  eventPending,
  focus,
  onFocus,
  onSkip,
  onLegacy,
  onViewLegacy,
}: {
  age: number;
  day: number;
  life: LifeState;
  eventPending: boolean;
  focus: SeasonFocus;
  onFocus: (f: SeasonFocus) => void;
  onSkip: () => void;
  onLegacy: () => void;
  onViewLegacy: () => void;
}) {
  const e = life.edu;
  const school = e.school ? SCHOOLS[e.school] : null;
  const canSkip = day >= SKIP_FROM_DAY && !eventPending && !life.ended;
  return (
    <div className="rounded-3xl bg-charcoal p-5 text-cream ring-1 ring-white/10">
      <div className="text-[10px] font-extrabold tracking-[0.25em] text-mapo">ÌGBÉSÍ AYÉ · YOUR LIFE</div>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <div className="font-display text-xl font-extrabold">Age {age}</div>
        <div className="text-xs text-cream/60">Year {Math.floor((day - 1) / 365) + 1} of your story · closes at {LEGACY_MAX_AGE}</div>
      </div>
      <p className="mt-2 text-sm text-cream/80">
        {STAGE_TEXT[e.stage]}
        {e.score !== null && e.stage !== "none" && ` JAMB: ${e.score}/400.`}
        {school && (e.stage === "student" || e.stage === "admitted") && ` ${school.name} (${school.course}).`}
        {e.stage === "student" && ` Session ${e.sessions + 1} of ${(school?.years ?? 4) + e.extraYears} · lectures ${e.attended}/${LECTURES_PER_YEAR}.`}
        {e.grade && ` ${school?.course ?? ""} ${e.grade}.`}
        {e.stage === "nysc" && e.posting && ` Posted to ${e.posting}.`}
      </p>

      {life.ended ? (
        <div className="mt-4 rounded-2xl bg-white/10 p-3 text-sm">
          📜 Your story is written.{" "}
          <button onClick={onViewLegacy} className="font-bold text-mapo underline">Read your legacy</button>
        </div>
      ) : (
        <>
          <div className="mt-4 text-[11px] font-extrabold tracking-widest text-cream/60">MOVE ON A SEASON (~3 MONTHS)</div>
          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {SEASON_FOCUS.map((f) => (
              <button
                key={f.id}
                onClick={() => onFocus(f.id)}
                title={f.blurb}
                className={`rounded-xl px-2 py-2 text-xs font-bold ring-1 ${focus === f.id ? "bg-mapo text-charcoal ring-mapo" : "bg-white/5 text-cream/80 ring-white/10"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-cream/55">{SEASON_FOCUS.find((f) => f.id === focus)?.blurb}</p>
          <button
            onClick={onSkip}
            disabled={!canSkip}
            className={`mt-3 w-full rounded-full px-4 py-2.5 text-sm font-extrabold ${canSkip ? "bg-cream text-charcoal" : "bg-white/10 text-cream/40"}`}
          >
            {day < SKIP_FROM_DAY ? `Live day by day until Day ${SKIP_FROM_DAY}` : eventPending ? "Deal with what's in front of you first" : "⏩ Move on to the next season"}
          </button>
          {age >= LEGACY_MIN_AGE && (
            <button onClick={onLegacy} className="mt-2 w-full rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-cream ring-1 ring-white/20">
              📜 Close your story and write your legacy
            </button>
          )}
        </>
      )}

      {life.milestones.length > 0 && (
        <>
          <div className="mt-4 text-[11px] font-extrabold tracking-widest text-cream/60">MILESTONES</div>
          <ol className="mt-1.5 space-y-1 border-l border-white/15 pl-3">
            {[...life.milestones].reverse().slice(0, 8).map((m, i) => (
              <li key={`${m.day}-${i}`} className="text-xs text-cream/80">
                <span className="font-bold text-mapo">Day {m.day}</span> · {m.text}
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
