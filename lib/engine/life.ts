// Omo Ibadan — the rules of the long life. Pure functions only: the play
// page calls these and applies what comes back.

import {
  CAL,
  LECTURES_PER_YEAR,
  LOVE,
  NYSC_ALLOWANCE,
  NYSC_STATES,
  REL_ORDER,
  SCHOOLS,
  SEASON_DAYS,
  STORYLETS,
  personById,
  upkeepFor,
  type Background,
  type BackgroundId,
  type LifeEvent,
  type LifeState,
  type Rel,
  type RelStage,
  type SeasonFocus,
  type SkillId,
  type StoryCond,
  type StoryFx,
} from "@/lib/game";
import { ageOn } from "./clock";

export const yearOf = (day: number) => Math.floor((Math.max(1, day) - 1) / 365);
export const doyOf = (day: number) => (Math.max(1, day) - 1) % 365;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const rank = (s: RelStage) => REL_ORDER.indexOf(s);
const ROMANTIC: RelStage[] = ["dating", "engaged", "married"];

/** Daily passive income from businesses you've started. */
export const BUSINESS_PER_DAY = { kiosk: 2_000, solar: 1_500 };

// ---- people ----

export function relOf(life: LifeState, id: string): Rel {
  return life.rel[id] ?? { bond: 0, stage: "stranger", lastDay: 0, since: 0 };
}

/** The person you're dating, engaged to or married to, if any. */
export function partnerOf(life: LifeState): string | null {
  let best: string | null = null;
  for (const [id, r] of Object.entries(life.rel)) {
    if (ROMANTIC.includes(r.stage) && (!best || rank(r.stage) > rank(life.rel[best].stage))) best = id;
  }
  return best;
}

/** Friend and close-friend stages follow the bond; romantic stages are chosen. */
function settleStage(r: Rel, day: number): Rel {
  if (ROMANTIC.includes(r.stage)) return r;
  const stage: RelStage = r.bond >= 45 ? "close" : r.bond >= 20 ? "friend" : "stranger";
  return stage === r.stage ? r : { ...r, stage, since: day };
}

export function bondWith(life: LifeState, id: string, delta: number, day: number, touch = true): LifeState {
  const r = relOf(life, id);
  const next = settleStage({ ...r, bond: clamp(r.bond + delta, 0, 100), lastDay: touch ? day : r.lastDay }, day);
  return { ...life, rel: { ...life.rel, [id]: next } };
}

function setStage(life: LifeState, id: string, stage: RelStage, day: number): LifeState {
  const r = relOf(life, id);
  return { ...life, rel: { ...life.rel, [id]: { ...r, stage, since: day, lastDay: day } } };
}

function milestone(life: LifeState, day: number, text: string): LifeState {
  return { ...life, milestones: [...life.milestones, { day, text }].slice(-60) };
}

function flag(life: LifeState, add: string[] = [], remove: string[] = []): LifeState {
  const set = new Set(life.flags);
  add.forEach((f) => set.add(f));
  remove.forEach((f) => set.delete(f));
  return { ...life, flags: [...set] };
}

/** Talking in the street: +3 bond, once a day per person. */
export function talkBond(life: LifeState, id: string, day: number): { life: LifeState; gained: number } {
  if (!personById(id)) return { life, gained: 0 };
  const r = relOf(life, id);
  if (r.lastDay === day && r.bond > 0) return { life, gained: 0 };
  return { life: bondWith(life, id, 3, day), gained: 3 };
}

/** Spend real time together. Partners grow a little faster. */
export function hangOut(life: LifeState, id: string, day: number): { life: LifeState; gained: number } {
  const p = personById(id);
  if (!p) return { life, gained: 0 };
  const gained = p.hangout.bond + (ROMANTIC.includes(relOf(life, id).stage) ? 3 : 0);
  return { life: bondWith(life, id, gained, day), gained };
}

export type LoveCheck = { ok: true } | { ok: false; why: string };

export function canAskOut(life: LifeState, id: string): LoveCheck {
  const p = personById(id);
  const r = relOf(life, id);
  if (!p?.romance) return { ok: false, why: "Not that kind of relationship." };
  if (partnerOf(life)) return { ok: false, why: "You're already with someone." };
  if (ROMANTIC.includes(r.stage)) return { ok: false, why: "You're already together." };
  if (r.bond < LOVE.askOutBond) return { ok: false, why: `Get closer first (bond ${r.bond}/${LOVE.askOutBond}).` };
  return { ok: true };
}

/** Ask someone out. Bond and Iwa both help; a no costs some bond. */
export function askOut(life: LifeState, id: string, day: number, iwa: number, rand: () => number = Math.random): { life: LifeState; yes: boolean } {
  if (!canAskOut(life, id).ok) return { life, yes: false };
  const r = relOf(life, id);
  const chance = clamp(0.45 + (r.bond - LOVE.askOutBond) / 50 + (iwa - 50) / 200, 0.15, 0.95);
  if (rand() < chance) {
    const next = milestone(setStage(life, id, "dating", day), day, `Started dating ${id}`);
    return { life: next, yes: true };
  }
  return { life: bondWith(life, id, -8, day), yes: false };
}

export function canPropose(life: LifeState, id: string, day: number, ola: number): LoveCheck {
  const r = relOf(life, id);
  if (r.stage !== "dating") return { ok: false, why: "You need to be dating first." };
  if (r.bond < LOVE.proposeBond) return { ok: false, why: `Your bond isn't there yet (${r.bond}/${LOVE.proposeBond}).` };
  if (day - r.since < LOVE.proposeDays) return { ok: false, why: `Too soon. Families want to see ${LOVE.proposeDays - (day - r.since)} more days.` };
  if (ola < LOVE.introduction) return { ok: false, why: `The introduction needs ₦${LOVE.introduction.toLocaleString()}.` };
  return { ok: true };
}

/** Propose, then the introduction: your family visits theirs with gifts. */
export function propose(life: LifeState, id: string, day: number, ola: number): { life: LifeState; cost: number } {
  if (!canPropose(life, id, day, ola).ok) return { life, cost: 0 };
  const next = milestone(bondWith(setStage(life, id, "engaged", day), id, 5, day), day, `Engaged to ${id}: introduction ceremony done`);
  return { life: next, cost: LOVE.introduction };
}

/** What the wedding costs you. Daddy pays half for an Alowonle in his good books. */
export function weddingCost(bg: BackgroundId, bond: number): number {
  return bg === "alowonle" && bond >= 60 ? LOVE.wedding / 2 : LOVE.wedding;
}

export function canWed(life: LifeState, id: string, ola: number, bg: BackgroundId, bond: number): LoveCheck {
  if (relOf(life, id).stage !== "engaged") return { ok: false, why: "You need to be engaged first." };
  const cost = weddingCost(bg, bond);
  if (ola < cost) return { ok: false, why: `The wedding needs ₦${cost.toLocaleString()}.` };
  return { ok: true };
}

export function wed(life: LifeState, id: string, day: number, ola: number, bg: BackgroundId, bond: number): { life: LifeState; cost: number } {
  if (!canWed(life, id, ola, bg, bond).ok) return { life, cost: 0 };
  const next = milestone(bondWith(setStage(life, id, "married", day), id, 10, day), day, `Married ${id}`);
  return { life: next, cost: weddingCost(bg, bond) };
}

// ---- storylets ----

export interface StoryCtx {
  day: number;
  bg: BackgroundId;
  ola: number;
  bond: number;
  careerId: string | null;
  /** title rung, from titleIndex() */
  title: number;
  life: LifeState;
}

export function condHolds(c: StoryCond | undefined, x: StoryCtx): boolean {
  if (!c) return true;
  const { life } = x;
  const age = ageOn(x.day);
  if (c.bg && !c.bg.includes(x.bg)) return false;
  if (c.minAge !== undefined && age < c.minAge) return false;
  if (c.maxAge !== undefined && age > c.maxAge) return false;
  if (c.edu && !c.edu.includes(life.edu.stage)) return false;
  if (c.school && life.edu.school !== c.school) return false;
  if (c.minScore !== undefined && (life.edu.score ?? 0) < c.minScore) return false;
  if (c.maxScore !== undefined && (life.edu.score ?? 0) > c.maxScore) return false;
  if (c.flags && !c.flags.every((f) => life.flags.includes(f))) return false;
  if (c.notFlags && c.notFlags.some((f) => life.flags.includes(f))) return false;
  if (c.rel) {
    const r = relOf(life, c.rel.id);
    if (c.rel.min && rank(r.stage) < rank(c.rel.min)) return false;
    if (c.rel.max && rank(r.stage) > rank(c.rel.max)) return false;
    if (c.rel.minBond !== undefined && r.bond < c.rel.minBond) return false;
  }
  const partner = partnerOf(life);
  const pr = partner ? relOf(life, partner) : null;
  if (c.partner !== undefined && !!partner !== c.partner) return false;
  if (c.partnerMin && (!pr || rank(pr.stage) < rank(c.partnerMin))) return false;
  if (c.partnerMaxBond !== undefined && (!pr || pr.bond > c.partnerMaxBond)) return false;
  if (c.partnerDays !== undefined && (!pr || x.day - pr.since < c.partnerDays)) return false;
  if (c.minOla !== undefined && x.ola < c.minOla) return false;
  if (c.minBond !== undefined && x.bond < c.minBond) return false;
  if (c.maxBond !== undefined && x.bond > c.maxBond) return false;
  if (c.minDay !== undefined && x.day < c.minDay) return false;
  if (c.doy) {
    const d = doyOf(x.day);
    if (d < c.doy[0] || d > c.doy[1]) return false;
  }
  if (c.career !== undefined && !!x.careerId !== c.career) return false;
  if (c.minTitle !== undefined && x.title < c.minTitle) return false;
  if (c.minChildren !== undefined && life.children < c.minChildren) return false;
  return true;
}

export function storyEligible(s: LifeEvent, x: StoryCtx): boolean {
  if (s.backgrounds && !s.backgrounds.includes(x.bg)) return false;
  const last = x.life.seen[s.id];
  if (last !== undefined) {
    if (s.once) return false;
    if (s.oncePerYear && yearOf(last) === yearOf(x.day)) return false;
    if (s.cooldown !== undefined && x.day - last < s.cooldown) return false;
  }
  if (!condHolds(s.when, x)) return false;
  return s.options.some((o) => condHolds(o.when, x));
}

/** Fill {tokens} and keep only the options that apply right now. */
export function fillStory(s: LifeEvent, x: StoryCtx): LifeEvent {
  const partner = partnerOf(x.life) ?? "your partner";
  const e = x.life.edu;
  const tokens: Record<string, string> = {
    partner,
    score: e.score !== null ? String(e.score) : "?",
    school: e.school ? SCHOOLS[e.school].name : "school",
    posting: e.posting ?? "a far",
    grade: e.grade ?? "a degree",
  };
  const fill = (t: string) => t.replace(/\{(\w+)\}/g, (m, k: string) => tokens[k] ?? m);
  return {
    ...s,
    title: fill(s.title),
    desc: fill(s.desc),
    options: s.options.filter((o) => condHolds(o.when, x)).map((o) => ({ ...o, label: fill(o.label), note: fill(o.note) })),
  };
}

/** A storylet that must be dealt with now (JAMB result, call-up, fees…). */
export function priorityStorylet(x: StoryCtx): LifeEvent | null {
  const s = STORYLETS.find((st) => st.priority && storyEligible(st, x));
  return s ? fillStory(s, x) : null;
}

/** Today's storylet: a priority one if any, otherwise a weighted random draw (with `chance`). */
export function pickStorylet(x: StoryCtx, rand: () => number, chance: number): LifeEvent | null {
  const urgent = priorityStorylet(x);
  if (urgent) return urgent;
  if (rand() >= chance) return null;
  const pool = STORYLETS.filter((s) => !s.priority && storyEligible(s, x));
  if (!pool.length) return null;
  const total = pool.reduce((t, s) => t + (s.weight ?? 1), 0);
  let pick = rand() * total;
  for (const s of pool) {
    pick -= s.weight ?? 1;
    if (pick < 0) return fillStory(s, x);
  }
  return fillStory(pool[pool.length - 1], x);
}

export function markSeen(life: LifeState, id: string, day: number): LifeState {
  return { ...life, seen: { ...life.seen, [id]: day } };
}

/** Apply a storylet option's effects on the long life. */
export function applyFx(life: LifeState, fx: StoryFx | undefined, day: number): LifeState {
  if (!fx) return life;
  let l = flag(life, fx.flag, fx.unflag);
  if (fx.edu) {
    const changed = fx.edu.stage !== undefined && fx.edu.stage !== l.edu.stage;
    l = {
      ...l,
      edu: {
        ...l.edu,
        ...(fx.edu.stage !== undefined ? { stage: fx.edu.stage } : {}),
        ...(fx.edu.school !== undefined ? { school: fx.edu.school } : {}),
        ...(fx.edu.posting !== undefined ? { posting: fx.edu.posting } : {}),
        extraYears: l.edu.extraYears + (fx.edu.extraYears ?? 0),
        startDay: changed ? day : l.edu.startDay,
      },
    };
  }
  for (const r of fx.rel ?? []) {
    const id = r.id === "@partner" ? partnerOf(l) : r.id;
    if (!id) continue;
    if (r.stage) l = setStage(l, id, r.stage, day);
    if (r.bond) l = bondWith(l, id, r.bond, day);
  }
  if (fx.children) l = { ...l, children: l.children + fx.children };
  if (fx.milestone) l = milestone(l, day, fx.milestone);
  return l;
}

// ---- the life calendar ----

export interface LifeDayInput {
  examPass: number;
  /** brain skill level */
  brain: number;
  rand?: () => number;
  /** relationships cool off when you don't see people (off during season skips) */
  decay?: boolean;
}

export interface LifeDayResult {
  life: LifeState;
  olaDelta: number;
  messages: string[];
  journal: string[];
}

/** UTME score out of 400: practice (exam hall answers) and brains, plus luck. */
export function jambScore(examPass: number, brain: number, rand: () => number): number {
  return Math.round(clamp(140 + brain * 22 + Math.min(examPass, 60) * 1.6 + rand() * 70, 80, 380));
}

export function gradeFor(school: "ui" | "poly", avg: number): string {
  const ui = school === "ui";
  if (avg >= 1.3) return ui ? "First Class" : "Distinction";
  if (avg >= 1.1) return ui ? "Second Class Upper" : "Upper Credit";
  if (avg >= 0.9) return ui ? "Second Class Lower" : "Lower Credit";
  return ui ? "Third Class" : "Pass";
}

/** Everything the calendar does to your long life on `day`. */
export function lifeDay(lifeIn: LifeState, day: number, input: LifeDayInput): LifeDayResult {
  const rand = input.rand ?? Math.random;
  let life = lifeIn;
  const out: LifeDayResult = { life, olaDelta: 0, messages: [], journal: [] };
  const e = life.edu;
  const doy = doyOf(day);

  if (e.stage === "registered" && doy >= CAL.jambExam) {
    const score = jambScore(input.examPass, input.brain, rand);
    life = milestone({ ...life, edu: { ...e, stage: "awaiting", score, startDay: day } }, day, `Sat JAMB UTME: ${score}/400`);
    out.messages.push("📝 JAMB day. Four hours at a CBT centre in Agbowo, one dead computer, one stubborn invigilator. Results in a week.");
  } else if (e.stage === "admitted" && doy >= CAL.resumption && day - e.startDay > 30) {
    life = milestone({ ...life, edu: { ...e, stage: "student", startDay: day, attended: 0, sessions: 0, gp: 0 } }, day, `Resumed at ${SCHOOLS[e.school ?? "ui"].name}`);
    out.messages.push(`🎒 Resumption at ${SCHOOLS[e.school ?? "ui"].short}. Attend lectures (the exam hall door) — ${LECTURES_PER_YEAR} a session or you carry over.`);
  } else if (e.stage === "student" && e.school && day > e.startDay && (day - e.startDay) % 365 === 0) {
    const ratio = Math.min(1.5, e.attended / LECTURES_PER_YEAR);
    let edu = { ...e, sessions: e.sessions + 1, gp: e.gp + ratio, attended: 0 };
    const needed = SCHOOLS[e.school].years + edu.extraYears;
    if (ratio < 1 && edu.extraYears < 2) {
      edu = { ...edu, extraYears: edu.extraYears + 1 };
      life = flag({ ...life, edu }, ["carryover-pending"]);
      out.journal.push(`Day ${day}: carried over courses. One more year.`);
    } else if (edu.sessions >= needed) {
      const grade = gradeFor(e.school, edu.gp / edu.sessions + input.brain * 0.03);
      edu = { ...edu, stage: "graduate", grade, startDay: day };
      life = milestone(flag({ ...life, edu }, ["just-graduated"]), day, `Graduated from ${SCHOOLS[e.school].name}: ${SCHOOLS[e.school].course}, ${grade}`);
    } else {
      life = { ...life, edu };
      out.messages.push(`📚 Session ${edu.sessions} of ${needed} done.`);
    }
  } else if (e.stage === "graduate" && day - e.startDay >= CAL.nyscWait && !life.flags.includes("callup-ready") && !life.flags.includes("just-graduated")) {
    const posting = NYSC_STATES[Math.floor(rand() * NYSC_STATES.length)];
    life = flag({ ...life, edu: { ...e, posting } }, ["callup-ready"]);
  } else if (e.stage === "nysc" && day > e.startDay) {
    const served = day - e.startDay;
    if (served >= CAL.nyscYear) {
      life = milestone(flag({ ...life, edu: { ...e, stage: "served", startDay: day } }, ["just-served"]), day, "Passed out of NYSC");
    } else if (served % 30 === 0) {
      out.olaDelta += NYSC_ALLOWANCE;
      out.messages.push(`🇳🇬 NYSC allowance landed: +₦${NYSC_ALLOWANCE.toLocaleString()}.`);
    }
  }

  // a baby arrives nine months after the good news
  const told = life.seen["expecting"];
  if (life.flags.includes("expecting") && !life.flags.includes("birth-due") && told !== undefined && day - told >= 270) {
    life = flag(life, ["birth-due"]);
    out.messages.push("👶 The baby has arrived!");
  }

  // businesses
  if (life.flags.includes("kiosk")) out.olaDelta += BUSINESS_PER_DAY.kiosk;
  if (life.flags.includes("solar-partner")) out.olaDelta += BUSINESS_PER_DAY.solar;

  // people you don't see drift: partners after 10 days, friends after 3 weeks
  if (input.decay !== false) {
    let rel = life.rel;
    for (const [id, r] of Object.entries(rel)) {
      const gap = day - r.lastDay;
      const romantic = ROMANTIC.includes(r.stage);
      if ((romantic && gap > 10 && gap % 3 === 0) || (!romantic && r.stage !== "stranger" && gap > 21 && gap % 7 === 0)) {
        rel = { ...rel, [id]: settleStage({ ...r, bond: Math.max(0, r.bond - 1) }, day) };
      }
    }
    life = { ...life, rel };
  }

  out.life = life;
  return out;
}

/** Does Daddy still pay the allowance? While you study or serve, or work in his circle. */
export function allowanceSupported(life: LifeState, bg: Background, careerId: string | null, day: number): boolean {
  if (life.flags.includes("daddys-firm")) return true;
  if (life.flags.includes("own-feet")) return false;
  if (careerId && bg.connections.includes(careerId)) return true;
  const s = life.edu.stage;
  if (s === "none") return ageOn(day) < 20;
  return s !== "served" && s !== "dropped";
}

// ---- season skips ----

export interface SeasonInput {
  day: number;
  bg: Background;
  ola: number;
  iwa: number;
  bond: number;
  careerId: string | null;
  careerSkill: SkillId | null;
  /** pay per shift at your current level */
  careerPay: number;
  title: number;
  life: LifeState;
  focus: SeasonFocus;
  examPass: number;
  brain: number;
  rand?: () => number;
}

export interface SeasonResult {
  /** the day you land on */
  toDay: number;
  days: number;
  olaDelta: number;
  iwaDelta: number;
  bondDelta: number;
  life: LifeState;
  xp: { skill: SkillId; amount: number }[];
  lines: string[];
  /** the storylet that cut the season short, if any */
  stoppedFor: string | null;
}

/** Weekly figures for a season, by focus. */
const SHIFTS: Record<SeasonFocus, number> = { work: 5, school: 1, family: 3, love: 3 };
const HUSTLE_WEEK: Record<SeasonFocus, number> = { work: 15_000, school: 3_000, family: 6_000, love: 6_000 };
const LECTURES_WEEK: Record<SeasonFocus, number> = { work: 0, school: 2, family: 0.5, love: 0.5 };
/** what living costs you per week outside the family's own pot */
const LIVING_WEEK: Record<BackgroundId, number> = { "omo-iya-lobe": 7_000, alowonle: 0 };

/**
 * Live a season in one go: up to SEASON_DAYS days, stopping early when a
 * priority storylet needs you (JAMB result, call-up, fees…).
 */
export function skipSeason(input: SeasonInput): SeasonResult {
  const { bg, focus } = input;
  const rand = input.rand ?? Math.random;
  let life = input.life;
  let ola = input.ola;
  let olaDelta = 0;
  let stoppedFor: string | null = null;
  let lectures = 0;
  let d = input.day;
  const earned = { work: 0, business: 0, allowance: 0, nysc: 0, living: 0 };
  const student = () => life.edu.stage === "student";

  for (let i = 1; i <= SEASON_DAYS; i++) {
    d = input.day + i;
    const r = lifeDay(life, d, { examPass: input.examPass, brain: input.brain, rand, decay: false });
    life = r.life;
    const businessToday = (life.flags.includes("kiosk") ? BUSINESS_PER_DAY.kiosk : 0) + (life.flags.includes("solar-partner") ? BUSINESS_PER_DAY.solar : 0);
    earned.business += businessToday;
    earned.nysc += r.olaDelta - businessToday;
    let today = r.olaDelta;
    if (student()) {
      lectures += LECTURES_WEEK[focus] / 7;
      const whole = Math.floor(lectures);
      if (whole > 0) {
        lectures -= whole;
        life = { ...life, edu: { ...life.edu, attended: life.edu.attended + whole } };
      }
    }
    if (i % 7 === 0) {
      const shifts = student() && focus !== "work" ? Math.min(2, SHIFTS[focus]) : SHIFTS[focus];
      const work = input.careerId ? shifts * input.careerPay : HUSTLE_WEEK[focus];
      const living = LIVING_WEEK[bg.id] + upkeepFor(bg) * 7;
      const allowance = bg.allowancePerWeek > 0 && input.bond >= bg.allowanceMinBond && allowanceSupported(life, bg, input.careerId, d) ? bg.allowancePerWeek : 0;
      earned.work += work;
      earned.living += living;
      earned.allowance += allowance;
      today += work + allowance - living;
    }
    olaDelta += today;
    ola = Math.max(0, ola + today);
    const urgent = priorityStorylet({ day: d, bg: bg.id, ola, bond: input.bond, careerId: input.careerId, title: input.title, life });
    if (urgent) {
      stoppedFor = urgent.id;
      break;
    }
  }
  const days = d - input.day;
  const weeks = days / 7;

  // people: who you made time for
  const partner = partnerOf(life);
  let rel = { ...life.rel };
  for (const [id, r] of Object.entries(rel)) {
    if (r.stage === "stranger") continue;
    const isPartner = id === partner;
    const delta = focus === "love" ? (isPartner ? 15 : 5) : focus === "family" ? -3 : isPartner ? -8 : -5;
    rel = { ...rel, [id]: settleStage({ ...r, bond: clamp(r.bond + Math.round((delta * days) / SEASON_DAYS), 0, 100), lastDay: d }, d) };
  }
  life = { ...life, rel, seasons: life.seasons + 1 };

  const scale = days / SEASON_DAYS;
  const bondDelta = Math.round((focus === "family" ? 10 : focus === "work" ? -3 : 0) * scale);
  const iwaDelta = Math.round((focus === "family" ? 3 : 0) * scale);
  const xp: { skill: SkillId; amount: number }[] = [];
  const x = (skill: SkillId, amount: number) => xp.push({ skill, amount: Math.round(amount * scale) });
  if (focus === "work") x(input.careerSkill ?? "hustle", 60);
  if (focus === "school") x("brain", 60);
  if (focus === "family") x(bg.id === "omo-iya-lobe" ? "cooking" : "charisma", 30);
  if (focus === "love") x("charisma", 30);

  const n = (v: number) => `₦${Math.round(v).toLocaleString()}`;
  const lines = [`⏩ ${days} days (${Math.round(weeks)} weeks) pass, focused on ${focus}.`];
  if (earned.work) lines.push(`💼 ${input.careerId ? "Shifts" : "Hustles"} earned ${n(earned.work)}.`);
  if (earned.allowance) lines.push(`💳 Daddy's allowance: ${n(earned.allowance)}.`);
  if (earned.nysc) lines.push(`🇳🇬 NYSC allowance: ${n(earned.nysc)}.`);
  if (earned.business) lines.push(`🏪 Your business brought in ${n(earned.business)}.`);
  if (earned.living) lines.push(`🧾 Living costs: −${n(earned.living)}.`);
  if (bondDelta) lines.push(`👪 ${bg.bondLabel} ${bondDelta > 0 ? "+" : ""}${bondDelta}.`);
  if (partner) lines.push(focus === "love" ? `❤️ You and ${partner} grew closer.` : `💭 ${partner} missed you.`);
  if (stoppedFor) lines.push("⏸️ Something important came up, so the season stopped early.");

  return { toDay: d, days, olaDelta, iwaDelta, bondDelta, life, xp, lines, stoppedFor };
}

// ---- legacy ----

export interface LegacyInput {
  day: number;
  bg: Background;
  ola: number;
  iwa: number;
  bond: number;
  title: number;
  titleName: string;
  careerName: string | null;
  careerLevel: number;
  homeTier: string;
  visits: number;
  life: LifeState;
}

export interface Legacy {
  score: number;
  verdict: string;
  lines: string[];
  oriki: string;
}

export function legacyReport(i: LegacyInput): Legacy {
  const { life } = i;
  const edu = life.edu;
  const partner = partnerOf(life);
  const married = partner ? relOf(life, partner).stage === "married" : false;
  const wealth = i.ola >= 50_000_000 ? 25 : i.ola >= 10_000_000 ? 20 : i.ola >= 2_000_000 ? 14 : i.ola >= 500_000 ? 8 : 3;
  const character = Math.round(i.iwa / 4);
  const school = edu.stage === "served" ? 15 : edu.stage === "nysc" || edu.stage === "graduate" ? 12 : edu.stage === "student" ? 6 : 0;
  const business = (life.flags.includes("kiosk") ? 4 : 0) + (life.flags.includes("solar-partner") ? 4 : 0);
  const family = (married ? 10 : 0) + Math.min(8, life.children * 4) + Math.round(i.bond / 10);
  const work = i.careerLevel * 3;
  const home = i.homeTier === "duplex" ? 6 : i.homeTier === "flat" ? 3 : 0;
  const friends = Object.values(life.rel).filter((r) => r.stage !== "stranger").length;
  const score = clamp(wealth + character + school + business + family + work + home + i.title * 4 + (life.flags.includes("chief") ? 5 : 0) + Math.min(9, Math.floor(i.visits / 3)) + Math.min(6, friends), 0, 130);
  const verdict = score >= 90 ? "Àgbà Ibadan: a life the city will remember" : score >= 70 ? "Omoluabi: a good name, well earned" : score >= 50 ? "A life well lived" : score >= 30 ? "Still rising when the story closed" : "A hard road, walked honestly";

  const lines = [
    `🎂 Age ${ageOn(i.day)}, ${Math.floor(i.day / 365)} years after you turned 18.`,
    `💰 ₦${i.ola.toLocaleString()} to your name · Iwa ${i.iwa} · ${i.titleName}.`,
    edu.grade ? `🎓 ${edu.school ? SCHOOLS[edu.school].name : ""}, ${edu.grade}${edu.stage === "served" ? ", NYSC done" : ""}.` : edu.stage === "dropped" ? "🧺 Chose the market over the lecture hall." : "📚 Never finished school.",
    i.careerName ? `💼 ${i.careerName}, level ${i.careerLevel}.` : "💼 Lived by the hustle.",
    married ? `💍 Married to ${partner}${life.children ? `, ${life.children} ${life.children === 1 ? "child" : "children"}` : ""}.` : partner ? `❤️ With ${partner}.` : "🕊️ Unmarried.",
    `🧑🏾‍🤝‍🧑🏾 ${friends} people who'd come to your house in a crisis.`,
  ];

  const origin = i.bg.id === "omo-iya-lobe" ? "Child of the soup seller from Beere" : "Child of the house in Old Bodija";
  const verses = [origin];
  if (edu.stage === "served" || edu.stage === "graduate") verses.push(`who walked through the gates of ${edu.school ? SCHOOLS[edu.school].short : "school"}`);
  if (life.flags.includes("kiosk")) verses.push("whose kiosk Oga Emeka stocked on trust");
  if (life.flags.includes("solar-partner")) verses.push("who brought light to the shops of Sango");
  if (life.flags.includes("tunde-sponsor")) verses.push("who lifted their brother up the ladder");
  if (married) verses.push(`whose house ${partner} calls home`);
  if (life.flags.includes("chief")) verses.push("who wears the beaded cap of the compound");
  verses.push(i.iwa >= 70 ? "Omo Ibadan, whose name is still good in the market" : "Omo Ibadan, who learned the city the hard way");

  return { score, verdict, lines, oriki: verses.join(",\n") + "." };
}

// ---- doors that open ----

/** Careers a degree (or HND) lets you enter one level up. */
const GRADUATE_CAREERS = ["ui-researcher", "nurse", "cocoa-clerk", "banker", "tech-dev", "journalist", "oil-exec", "teacher"];

export const hasDegree = (life: LifeState) => ["graduate", "nysc", "served"].includes(life.edu.stage);

/** Careers you enter at level 2: family connections, plus what school and the Chief's letter open. */
export function careerDoors(life: LifeState, connections: readonly string[]): string[] {
  const doors = new Set(connections);
  if (hasDegree(life)) GRADUATE_CAREERS.forEach((c) => doors.add(c));
  if (life.flags.includes("chief-letter")) ["cocoa-clerk", "banker"].forEach((c) => doors.add(c));
  return [...doors];
}
