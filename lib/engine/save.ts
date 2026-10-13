// Omo Ibadan — the one save format.
//
// Local storage and the cloud profile both store exactly this shape. Every
// load goes through migrateSave(), which upgrades old versions and replaces
// anything malformed with a safe default, so the rest of the game can trust
// what it gets back.

import {
  SKILLS,
  emptySkills,
  isBackgroundId,
  backgroundFromLegacyArchetype,
  type BackgroundId,
  type Gender,
  type HoodId,
  type SkillMap,
} from "@/lib/game";
import { emptyHome, type HomeSave } from "@/lib/world";

export const SAVE_VERSION = 3;
export const SAVE_KEY = "omo-ibadan-v1"; // key kept so existing players keep their saves

export type Gear = null | "fila" | "gele" | "none" | "braids" | "afro";
export type TravelMode = "micra" | "trek" | "car";
export type Weather = "clear" | "rain";

export interface Needs {
  hunger: number;
  fun: number;
  social: number;
  hygiene: number;
  toilet: number;
}

export interface SaveData {
  v: typeof SAVE_VERSION;
  /** ms epoch of the last real progress change; newer save wins on sync */
  savedAt: number;
  started: boolean;
  username: string;
  myCode: string;
  bgId: BackgroundId | null;
  gender: Gender;
  look: { skin: number; top: number; topEx: string | null; gear: Gear };
  trait: string | null;
  saver: boolean;
  // wallet + vitals
  ola: number;
  iwa: number;
  energy: number;
  needs: Needs;
  // family
  bond: number;
  paidObligations: string[];
  lastFamilyDay: number;
  // time
  day: number;
  actions: number;
  weather: Weather;
  eventId: string | null;
  // counters
  micraRuns: number;
  trades: number;
  examPass: number;
  exam: { day: number; paid: number };
  familyCount: number;
  rests: number;
  fullLoads: number;
  sprays: number;
  lastTerminalDay: number;
  // progress
  visits: string[];
  done: string[];
  claimedDaily: Record<number, string>;
  hoods: Record<HoodId, number>;
  myHood: HoodId;
  // world + home
  avatarZone: string;
  home: HomeSave;
  travelMode: TravelMode;
  wardrobe: string[];
  equipped: string | null;
  // people + memory
  npc: Record<string, { meets: number }>;
  journal: { day: number; text: string }[];
  shopGreets: Record<string, number>;
  viewDay: number;
  lastGreetDay: number;
  lastFreshDay: number;
  lastToiletDay: number;
  // careers
  skills: SkillMap;
  careerId: string | null;
  careerLevels: Record<string, number>;
  lastShiftDay: number;
  // real-world walking
  walkWeek: { key: string; steps: number };
  walkDay: { date: string; steps: number };
}

const HOOD_IDS: HoodId[] = ["bodija", "agbowo", "challenge", "iwo-road", "ojoo", "beere"];
const GEARS: Gear[] = [null, "fila", "gele", "none", "braids", "afro"];

export const startHoods = (): Record<HoodId, number> => ({
  bodija: 1200, agbowo: 1500, challenge: 900, "iwo-road": 1800, ojoo: 600, beere: 1100,
});

export function defaultSave(): SaveData {
  return {
    v: SAVE_VERSION,
    savedAt: 0,
    started: false,
    username: "",
    myCode: "",
    bgId: null,
    gender: "okunrin",
    look: { skin: 1, top: 1, topEx: null, gear: null },
    trait: null,
    saver: false,
    ola: 0,
    iwa: 50,
    energy: 80,
    needs: { hunger: 80, fun: 70, social: 70, hygiene: 75, toilet: 85 },
    bond: 60,
    paidObligations: [],
    lastFamilyDay: 0,
    day: 1,
    actions: 0,
    weather: "clear",
    eventId: null,
    micraRuns: 0,
    trades: 0,
    examPass: 0,
    exam: { day: 0, paid: 0 },
    familyCount: 0,
    rests: 0,
    fullLoads: 0,
    sprays: 0,
    lastTerminalDay: 0,
    visits: [],
    done: ["m1"],
    claimedDaily: {},
    hoods: startHoods(),
    myHood: "bodija",
    avatarZone: "ui-gate",
    home: emptyHome(),
    travelMode: "micra",
    wardrobe: [],
    equipped: null,
    npc: {},
    journal: [],
    shopGreets: {},
    viewDay: 0,
    lastGreetDay: 0,
    lastFreshDay: 0,
    lastToiletDay: 0,
    skills: emptySkills(),
    careerId: null,
    careerLevels: {},
    lastShiftDay: 0,
    walkWeek: { key: "", steps: 0 },
    walkDay: { date: "", steps: 0 },
  };
}

// ---- field readers: wrong type → default ----
type Raw = Record<string, unknown>;
const isObj = (v: unknown): v is Raw => typeof v === "object" && v !== null && !Array.isArray(v);
const num = (v: unknown, d: number) => (typeof v === "number" && Number.isFinite(v) ? v : d);
const clamp = (v: unknown, d: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, num(v, d)));
const str = (v: unknown, d: string) => (typeof v === "string" ? v : d);
const strOrNull = (v: unknown, d: string | null) => (typeof v === "string" ? v : v === null ? null : d);
const bool = (v: unknown, d: boolean) => (typeof v === "boolean" ? v : d);
const strArr = (v: unknown, d: string[]) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : d);
const numRecord = (v: unknown): Record<string, number> => {
  if (!isObj(v)) return {};
  const out: Record<string, number> = {};
  for (const [k, x] of Object.entries(v)) if (typeof x === "number" && Number.isFinite(x)) out[k] = x;
  return out;
};
const strRecord = (v: unknown): Record<string, string> => {
  if (!isObj(v)) return {};
  const out: Record<string, string> = {};
  for (const [k, x] of Object.entries(v)) if (typeof x === "string") out[k] = x;
  return out;
};

/**
 * Upgrade and validate any stored save. Returns null for input that isn't a
 * save at all. v1 (pre-lottery) saves get a background from their archetype
 * and their wallet scaled ×10 to the recalibrated prices.
 */
export function migrateSave(input: unknown): SaveData | null {
  if (!isObj(input)) return null;
  const s = input;
  const d = defaultSave();
  const version = num(s.v, 1);
  const legacy = version < 2;
  const started = bool(s.started, false);

  const bgId: BackgroundId | null = legacy
    ? started ? backgroundFromLegacyArchetype(str(s.archId, "")) : null
    : isBackgroundId(s.bgId) ? s.bgId : null;

  const look = isObj(s.look) ? s.look : {};
  const needs = isObj(s.needs) ? s.needs : {};
  const exam = isObj(s.exam) ? s.exam : {};
  const walkWeek = isObj(s.walkWeek) ? s.walkWeek : {};
  const walkDay = isObj(s.walkDay) ? s.walkDay : {};
  const home = isObj(s.home) ? s.home : {};

  const skills = emptySkills();
  if (isObj(s.skills)) {
    for (const sk of SKILLS) {
      const v = s.skills[sk.id];
      if (isObj(v) && typeof v.xp === "number" && typeof v.level === "number") skills[sk.id] = { xp: v.xp, level: v.level };
    }
  }

  const hoodsIn = numRecord(s.hoods);
  const hoods = startHoods();
  for (const h of HOOD_IDS) if (h in hoodsIn) hoods[h] = hoodsIn[h];

  const npc: Record<string, { meets: number }> = {};
  if (isObj(s.npc)) {
    for (const [k, v] of Object.entries(s.npc)) if (isObj(v) && typeof v.meets === "number") npc[k] = { meets: v.meets };
  }

  const journal = Array.isArray(s.journal)
    ? s.journal
        .filter((j): j is Raw => isObj(j) && typeof j.text === "string")
        .map((j) => ({ day: num(j.day, 1), text: j.text as string }))
        .slice(-50)
    : [];

  const claimedDaily: Record<number, string> = {};
  for (const [k, v] of Object.entries(strRecord(s.claimedDaily))) claimedDaily[Number(k)] = v;

  const ola = num(s.ola, 0);
  const tier = home.tier === "flat" || home.tier === "duplex" ? home.tier : "room";
  const travelMode: TravelMode = s.travelMode === "trek" || s.travelMode === "car" ? s.travelMode : "micra";

  return {
    v: SAVE_VERSION,
    savedAt: num(s.savedAt, 0),
    started,
    username: str(s.username, "").slice(0, 24),
    myCode: str(s.myCode, ""),
    bgId,
    gender: s.gender === "obinrin" ? "obinrin" : "okunrin",
    look: {
      skin: num(look.skin, 1),
      top: num(look.top, 1),
      topEx: strOrNull(look.topEx, null),
      gear: GEARS.includes(look.gear as Gear) ? (look.gear as Gear) : null,
    },
    trait: strOrNull(s.trait, null),
    saver: bool(s.saver, false),
    ola: Math.max(0, legacy && started ? ola * 10 : ola),
    iwa: clamp(s.iwa, d.iwa, 0, 100),
    energy: clamp(s.energy, d.energy, 0, 100),
    needs: {
      hunger: clamp(needs.hunger, d.needs.hunger, 0, 100),
      fun: clamp(needs.fun, d.needs.fun, 0, 100),
      social: clamp(needs.social, d.needs.social, 0, 100),
      hygiene: clamp(needs.hygiene, d.needs.hygiene, 0, 100),
      toilet: clamp(needs.toilet, d.needs.toilet, 0, 100),
    },
    bond: clamp(s.bond, d.bond, 0, 100),
    paidObligations: strArr(s.paidObligations, []),
    lastFamilyDay: num(s.lastFamilyDay, 0),
    day: Math.max(1, num(s.day, 1)),
    actions: Math.max(0, num(s.actions, 0)),
    weather: s.weather === "rain" ? "rain" : "clear",
    eventId: strOrNull(s.eventId, null),
    micraRuns: num(s.micraRuns, 0),
    trades: num(s.trades, 0),
    examPass: num(s.examPass, 0),
    exam: { day: num(exam.day, 0), paid: num(exam.paid, 0) },
    familyCount: num(s.familyCount, 0),
    rests: num(s.rests, 0),
    fullLoads: num(s.fullLoads, 0),
    sprays: num(s.sprays, 0),
    lastTerminalDay: num(s.lastTerminalDay, 0),
    visits: strArr(s.visits, []),
    done: strArr(s.done, d.done),
    claimedDaily,
    hoods,
    myHood: HOOD_IDS.includes(s.myHood as HoodId) ? (s.myHood as HoodId) : d.myHood,
    avatarZone: str(s.avatarZone, d.avatarZone),
    home: { tier, furniture: strArr(home.furniture, ["mat"]) },
    travelMode,
    wardrobe: strArr(s.wardrobe, []),
    equipped: strOrNull(s.equipped, null),
    npc,
    journal,
    shopGreets: numRecord(s.shopGreets),
    viewDay: num(s.viewDay, 0),
    lastGreetDay: num(s.lastGreetDay, 0),
    lastFreshDay: num(s.lastFreshDay, 0),
    lastToiletDay: num(s.lastToiletDay, 0),
    skills,
    careerId: strOrNull(s.careerId, null),
    careerLevels: numRecord(s.careerLevels),
    lastShiftDay: num(s.lastShiftDay, 0),
    walkWeek: { key: str(walkWeek.key, ""), steps: num(walkWeek.steps, 0) },
    walkDay: { date: str(walkDay.date, ""), steps: num(walkDay.steps, 0) },
  };
}

/**
 * Rebuild a raw save from a cloud `profiles` row. v3 rows keep the whole save
 * in `progress`; older rows spread it across columns.
 */
export function rawFromCloudRow(row: Raw): Raw {
  const p = isObj(row.progress) ? row.progress : {};
  const updatedAt = Date.parse(str(row.updated_at, ""));
  if (num(p.v, 0) >= 3) return { ...p, savedAt: num(p.savedAt, Number.isFinite(updatedAt) ? updatedAt : 0) };
  const w = isObj(row.wallet) ? row.wallet : {};
  return {
    ...p,
    v: num(p.v, 1),
    started: true,
    savedAt: Number.isFinite(updatedAt) ? updatedAt : 0,
    username: row.username,
    bgId: row.arch_id,
    archId: row.arch_id,
    gender: row.gender,
    look: row.look,
    ola: w.ola,
    iwa: w.iwa,
    energy: w.energy,
    hoods: row.hoods,
    myHood: row.my_hood,
    wardrobe: row.wardrobe,
    equipped: row.equipped,
  };
}

/** Cloud row for a save. Columns are kept filled for older clients. */
export function cloudRowFor(userId: string, s: SaveData) {
  return {
    id: userId,
    username: s.username || "omo",
    arch_id: s.bgId ?? "omo-iya-lobe",
    gender: s.gender,
    look: s.look,
    wallet: { ola: s.ola, iwa: s.iwa, energy: s.energy },
    progress: s,
    hoods: s.hoods,
    my_hood: s.myHood,
    wardrobe: s.wardrobe,
    equipped: s.equipped,
    updated_at: new Date(s.savedAt || Date.now()).toISOString(),
  };
}

/**
 * Pick which save to play from: an unstarted save never beats a started one,
 * otherwise the most recent progress wins. Ties go to local.
 */
export function chooseSave(local: SaveData | null, cloud: SaveData | null): "local" | "cloud" {
  if (!cloud || !cloud.started) return "local";
  if (!local || !local.started) return "cloud";
  return cloud.savedAt > local.savedAt ? "cloud" : "local";
}

/** The save without its timestamp, as a stable string for change detection. */
export function saveBody(s: SaveData): string {
  const { savedAt: _ignored, ...rest } = s;
  void _ignored;
  return JSON.stringify(rest);
}
