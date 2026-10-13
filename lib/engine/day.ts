// Omo Ibadan — the day loop and other pure game rules.
//
// Nothing here touches React. The play page calls these and applies the
// result, which keeps the rules testable and safe under StrictMode (no side
// effects hidden inside state updaters).

import {
  EXAM_POOL,
  TITLE_LADDER,
  allowanceDue,
  defaultLife,
  naira,
  overdueObligations,
  upcomingObligations,
  upkeepFor,
  type Background,
  type LifeEvent,
  type LifeState,
  type QuizQ,
} from "@/lib/game";
import type { Needs } from "./save";
import { ageOn, calendarFor, isBirthday } from "./clock";
import { allowanceSupported, lifeDay, markSeen, pickStorylet } from "./life";

/** Chance a new day brings a life event. */
export const EVENT_CHANCE = 0.75;

export function decayNeeds(n: Needs, trait: string | null): Needs {
  return {
    hunger: Math.max(0, n.hunger - 12),
    fun: Math.max(0, n.fun - 10),
    social: Math.max(0, n.social - 10),
    hygiene: Math.max(0, n.hygiene - (trait === "cleanfreak" ? 6 : 12)),
    toilet: Math.max(0, n.toilet - 15),
  };
}

export interface DayInput {
  /** the day being entered */
  day: number;
  bg: Background;
  bond: number;
  needs: Needs;
  trait: string | null;
  paidObligations: string[];
  eventPending: boolean;
  rand?: () => number;
  // the long life (omit in old callers/tests: a fresh life is assumed)
  life?: LifeState;
  ola?: number;
  careerId?: string | null;
  examPass?: number;
  /** brain skill level */
  brain?: number;
  /** title rung, from titleIndex() */
  title?: number;
}

export interface DayResult {
  needs: Needs;
  olaDelta: number;
  iwaDelta: number;
  energyDelta: number;
  bondDelta: number;
  /** feed lines, oldest first */
  messages: string[];
  journal: string[];
  event: LifeEvent | null;
  life: LifeState;
}

/** Everything that happens when a new day starts. */
export function advanceDay(input: DayInput): DayResult {
  const { day, bg, bond, trait, paidObligations } = input;
  const rand = input.rand ?? Math.random;
  const r: DayResult = {
    needs: decayNeeds(input.needs, trait),
    olaDelta: 0,
    iwaDelta: 0,
    energyDelta: 0,
    bondDelta: 0,
    messages: [`🌅 ${calendarFor(day).label}. New mercy, new hustle.`],
    journal: [],
    event: null,
    life: input.life ?? defaultLife(),
  };
  const careerId = input.careerId ?? null;
  const lifeR = lifeDay(r.life, day, { examPass: input.examPass ?? 0, brain: input.brain ?? 0, rand });
  r.life = lifeR.life;
  r.olaDelta += lifeR.olaDelta;
  r.messages.push(...lifeR.messages);
  r.journal.push(...lifeR.journal);
  if (isBirthday(day)) {
    const age = ageOn(day);
    r.messages.push(`🎂 You are ${age} today. Ẹ kú ọdún, ẹ kú ìyẹ́dún!`);
    r.journal.push(`Day ${day}: turned ${age}.`);
  }

  // background life: upkeep, allowance, obligations
  const upkeep = upkeepFor(bg);
  if (upkeep > 0) {
    r.olaDelta -= upkeep;
    r.messages.push(`⛽ ${bg.dailyUpkeep.map((u) => u.label).join(" + ")}: −${naira(upkeep)}.`);
  }
  if (bg.allowancePerWeek > 0 && day % 7 === 0) {
    const supported = allowanceSupported(r.life, bg, careerId, day);
    const paid = supported ? allowanceDue(bg, day, bond) : 0;
    if (!supported) {
      r.messages.push("💳 No allowance: Daddy only pays while you study or serve, or work in his circle.");
    } else if (paid > 0) {
      r.olaDelta += paid;
      r.messages.push(`💳 Daddy's allowance landed: +${naira(paid)}.`);
    } else {
      r.messages.push(`💳 No allowance this week. Daddy says you know what you did (approval ${bond}).`);
      r.journal.push(`Day ${day}: allowance stopped — Daddy's approval too low.`);
    }
  }
  for (const o of overdueObligations(bg, day, paidObligations)) {
    if (day === o.dueDay + 1) {
      r.bondDelta -= 15;
      r.iwaDelta -= 5;
      r.journal.push(`Day ${day}: missed ${o.title}.`);
      r.messages.push(`😞 ${o.title} is overdue. ${bg.bondLabel} −15, Iwa −5. You can still pay it.`);
    }
  }
  for (const o of upcomingObligations(bg, day, paidObligations, 2)) {
    if (o.dueDay >= day) r.messages.push(`📌 ${o.title}: ${naira(o.amount)} due by Day ${o.dueDay}.`);
  }

  // needs: crashes and warnings
  const before = input.needs;
  const dn = r.needs;
  if (before.hunger > 0 && dn.hunger === 0) {
    r.energyDelta -= 10;
    r.messages.push("🍲 Hunger crash! -10⚡. Ebi no be mate.");
  }
  if (before.toilet > 0 && dn.toilet === 0) {
    r.iwaDelta -= 3;
    r.messages.push("🚻 Embarrassment for public! Iwa -3. Toilet first next time.");
  }
  if (dn.hunger <= 15 && dn.hunger > 0) r.messages.push("🍲 Ebi dey wire you — find food before hustle pay suffers.");
  if (dn.fun <= 15) r.messages.push("🎉 Boredom — owambe or Agodi dey call.");
  if (dn.social <= 15) r.messages.push("👥 Lonely — gist for Ojude or greet somebody.");
  if (dn.hygiene <= 15) r.messages.push("🚿 Freshen up — body dey tell.");
  if (dn.toilet <= 15 && dn.toilet > 0) r.messages.push("🚻 Pressed — find toilet now.");

  if (!input.eventPending) {
    r.event = pickStorylet(
      { day, bg: bg.id, ola: Math.max(0, (input.ola ?? 0) + r.olaDelta), bond, careerId, title: input.title ?? 0, life: r.life },
      rand,
      EVENT_CHANCE,
    );
    if (r.event) r.life = markSeen(r.life, r.event.id, day);
  }
  return r;
}

// ---- exams ----

/** Paid correct answers per in-game day; after that Ada still teaches, but no pay. */
export const EXAM_PAID_PER_DAY = 5;

/** Deterministic shuffle of a question's options, seeded by its draw number. */
export function examQuestion(drawNo: number): { q: string; options: string[]; answer: number } {
  const base: QuizQ = EXAM_POOL[((drawNo % EXAM_POOL.length) + EXAM_POOL.length) % EXAM_POOL.length];
  const order = base.options.map((_, i) => i);
  // 32-bit integer LCG (Math.imul keeps it exact; float multiply would lose bits)
  let seed = Math.imul(drawNo + 1, 2654435761) >>> 0;
  for (let i = order.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
    const j = (seed >>> 16) % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { q: base.q, options: order.map((i) => base.options[i]), answer: order.indexOf(base.answer) };
}

// ---- titles ----

/** Wealth and character both have to climb; one alone won't make you Otun. */
const TITLE_OLA = [0, 500_000, 2_000_000, 10_000_000, 50_000_000];
const TITLE_IWA = [0, 55, 65, 75, 90];

export function titleIndex(ola: number, iwa: number): number {
  let wealth = 0;
  let character = 0;
  TITLE_OLA.forEach((t, i) => { if (ola >= t) wealth = i; });
  TITLE_IWA.forEach((t, i) => { if (iwa >= t) character = i; });
  return Math.min(wealth, character, TITLE_LADDER.length - 1);
}

export function titleFor(ola: number, iwa: number): (typeof TITLE_LADDER)[number] {
  return TITLE_LADDER[titleIndex(ola, iwa)];
}

// ---- interstate runs ----

/** Energy needed to board, and spent by, one interstate run. */
export const TERMINAL_ENERGY = 25;
