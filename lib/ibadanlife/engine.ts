// IbadanLife — save shape + action runner (needs + clock + wallet + skills).
// Renderer-agnostic; localStorage offline-first, server sync later.

import { FULL_NEEDS, applyNeedEffects, moodOf, tickNeeds, type Needs } from "./needs";
import { emptySkills, grantXp, type SkillId, type SkillMap } from "./skills";
import { CAREERS } from "./careers";
import { findPlace } from "./places";
import { HOMES, chargeRent, cheapestHome } from "./homes";
import { shouldChargeRent } from "./clock";
import { BIRTH_PACKAGES, type BirthLottery } from "./birth";

export interface LifeSave {
  v: 1;
  name: string;
  birth: BirthLottery;
  wallet: number;
  loanLeft: number;
  needs: Needs;
  skills: SkillMap;
  minutes: number;
  day: number;
  homeId: string;
  owed: number;
  lastRentKey: string;
  careerId: string | null;
  careerLevel: number;
  traits: string[];
  aspiration: string | null;
  perks: string[];
  startedAt: number;
}

export function newLife(name: string, birth: BirthLottery): LifeSave {
  const p = BIRTH_PACKAGES[birth];
  return {
    v: 1, name, birth,
    wallet: p.pocket, loanLeft: p.loanTotal,
    needs: { ...FULL_NEEDS }, skills: emptySkills(),
    minutes: 8 * 60, day: 1,
    homeId: p.homeId, owed: 0, lastRentKey: "",
    careerId: null, careerLevel: 1,
    traits: [], aspiration: null, perks: [],
    startedAt: Date.now(),
  };
}

export interface ActionResult {
  save: LifeSave;
  log: string[];
}

/** Do a place action by id. Handles cost/earn/needs/time/skills/mood pay. */
export function doAction(save: LifeSave, placeId: string, actionId: string, opts?: { lawPayMult?: number }): ActionResult {
  const log: string[] = [];
  const place = findPlace(placeId);
  const act = place?.actions.find((a) => a.id === actionId);
  if (!place || !act) return { save, log: ["That plan no dey again."] };
  if (act.needSkill) {
    const s = save.skills[act.needSkill.id];
    if (s.level < act.needSkill.level) {
      return { save, log: [`Need ${act.needSkill.id} lvl ${act.needSkill.level} (you: ${s.level}). Train first.`] };
    }
  }
  if (save.wallet < act.cost) return { save, log: [`₦${act.cost.toLocaleString()} needed. You hold ₦${save.wallet.toLocaleString()}. Hustle first.`] };

  let s: LifeSave = { ...save, wallet: save.wallet - act.cost };
  const t = tickNeeds(s.needs, act.minutes);
  s.needs = applyNeedEffects(t.needs, act.needs as Partial<Needs>);
  s.minutes += act.minutes;
  log.push(...t.warnings);

  if (act.skill) {
    const r = grantXp(s.skills, act.skill.id as SkillId, act.skill.xp);
    s.skills = r.skills;
    if (r.leveled) log.push(`⬆️ ${act.skill.id} → lvl ${s.skills[act.skill.id as SkillId].level}! Promotion door don open.`);
  }

  if (act.earn) {
    const mood = moodOf(s.needs);
    const mult = mood.payMult * (opts?.lawPayMult ?? 1);
    const got = Math.round(act.earn * mult);
    s.wallet += got;
    log.push(`${mood.label}: earned ₦${got.toLocaleString()} (${place.name} — ${act.name}). ${act.blurb}`);
  } else {
    log.push(`${act.name} @ ${place.name} · ${act.minutes}min · ${act.blurb}`);
  }
  return { save: s, log };
}

/** Work a shift at current career. */
export function workShift(save: LifeSave, opts?: { lawPayMult?: number }): ActionResult {
  if (!save.careerId) return { save, log: ["No job yet — open Fọ́nu → Jobs and apply."] };
  const c = CAREERS.find((x) => x.id === save.careerId)!;
  const lvl = c.levels[save.careerLevel - 1];
  const mood = moodOf(save.needs);
  const got = Math.round(lvl.pay * mood.payMult * (opts?.lawPayMult ?? 1));
  const t = tickNeeds(save.needs, 240);
  let s: LifeSave = {
    ...save,
    wallet: save.wallet + got,
    needs: applyNeedEffects(t.needs, { energy: -18, hunger: -14, hygiene: -10, bladder: -20, fun: -8, social: 4 }),
    minutes: save.minutes + 240,
  };
  const r = grantXp(s.skills, c.skill, 20);
  s.skills = r.skills;
  const log = [...t.warnings, `${mood.label}: shift as ${lvl.title} (${c.name}) paid ₦${got.toLocaleString()}. ${c.blurb}`];
  if (r.leveled) log.push(`⬆️ ${c.skill} → lvl ${s.skills[c.skill].level}! Ask for promotion.`);
  // promotion check
  const next = c.levels[save.careerLevel];
  if (next && s.skills[c.skill].level >= next.skillNeed) {
    s = { ...s, careerLevel: save.careerLevel + 1 };
    log.push(`🎉 PROMOTED → ${next.title}! New pay ₦${next.pay.toLocaleString()}/shift.`);
  }
  return { save: s, log };
}

/** Saturday tick + loan tick. Call on load + day change. */
export function saturdayTick(save: LifeSave, now = new Date()): ActionResult {
  const key = shouldChargeRent(save.lastRentKey, now);
  if (!key) return { save, log: [] };
  const r = chargeRent({ homeId: save.homeId, owed: save.owed, lastRentKey: save.lastRentKey }, save.wallet);
  let s: LifeSave = { ...save, wallet: r.wallet, owed: r.owed, lastRentKey: key };
  const log = [r.msg];
  if (r.evicted) {
    s = { ...s, homeId: cheapestHome({ homeId: save.homeId, owed: 0, lastRentKey: "" }), owed: 0 };
    log.push(`Packed out → ${HOMES.find((h) => h.id === s.homeId)?.name}. Furniture kept in storage.`);
  }
  if (s.loanLeft > 0 && save.birth === "lapo") {
    const pay = Math.min(s.wallet, 12000, s.loanLeft);
    s = { ...s, wallet: s.wallet - pay, loanLeft: s.loanLeft - pay };
    log.push(pay > 0 ? `LAPO loan: paid ₦${pay.toLocaleString()}, ₦${s.loanLeft.toLocaleString()} left.` : "LAPO loan unpaid this week — next week double pressure.");
  }
  return { save: s, log };
}

const KEY = "ibadan-life-v1";

export function loadLife(): LifeSave | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LifeSave) : null;
  } catch { return null; }
}

export function persistLife(s: LifeSave): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}
