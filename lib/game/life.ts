// Omo Ibadan — the long life: school (JAMB → UI or the Poly → NYSC),
// the people you grow close to, marriage, children, and the legacy you leave.
//
// Types and content only; the rules live in lib/engine/life.ts.

import type { BackgroundId } from "./backgrounds";
import type { Gender } from "./content";

// ---- education ----

/**
 * none: school leaver (WAEC done) · registered: JAMB form bought ·
 * awaiting: sat JAMB, result pending · admitted: offered a place, waiting to resume ·
 * student · graduate: waiting for NYSC call-up · nysc: serving · served ·
 * dropped: chose the hustle over school
 */
export type EduStage = "none" | "registered" | "awaiting" | "admitted" | "student" | "graduate" | "nysc" | "served" | "dropped";
export type School = "ui" | "poly";

export interface Edu {
  stage: EduStage;
  school: School | null;
  /** JAMB UTME score, out of 400 */
  score: number | null;
  /** day the current stage began (resumption, graduation, camp) */
  startDay: number;
  /** lectures attended this session */
  attended: number;
  /** sessions completed */
  sessions: number;
  /** running grade points: each session adds attendance ÷ the lectures it needs (max 1.5) */
  gp: number;
  /** extra years from carry-overs or a deferred session */
  extraYears: number;
  grade: string | null;
  /** NYSC posting state */
  posting: string | null;
}

export const SCHOOLS: Record<School, { name: string; short: string; years: number; fees: number; cutoff: number; course: string }> = {
  // UI degree: four sessions. Poly: ND (2) + industrial training (1) + HND (2).
  ui: { name: "University of Ibadan", short: "UI", years: 4, fees: 100_000, cutoff: 240, course: "B.Sc." },
  poly: { name: "The Polytechnic, Ibadan", short: "the Poly", years: 5, fees: 75_000, cutoff: 160, course: "HND" },
};

/** Day-of-year (0 = 4 Jan) dates in the school calendar. */
export const CAL = {
  jambFormOpen: 0,
  jambFormClose: 60,
  jambExam: 110,
  jambResult: 117,
  resumption: 280,
  /** NYSC call-up comes this long after graduating */
  nyscWait: 60,
  nyscYear: 365,
};

/** Lectures a session needs before you can sit its exams. */
export const LECTURES_PER_YEAR = 25;
export const NYSC_ALLOWANCE = 77_000; // federal monthly allowance (2024 rate)
export const JAMB_FORM = 7_700;

export const NYSC_STATES = ["Oyo", "Lagos", "Kano", "Enugu", "Rivers", "Borno", "Kwara", "Abuja (FCT)", "Cross River", "Sokoto"];

// ---- people ----

export type RelStage = "stranger" | "friend" | "close" | "dating" | "engaged" | "married";
export const REL_ORDER: RelStage[] = ["stranger", "friend", "close", "dating", "engaged", "married"];
export const REL_LABEL: Record<RelStage, string> = {
  stranger: "Stranger",
  friend: "Friend",
  close: "Close friend",
  dating: "Dating",
  engaged: "Engaged",
  married: "Married",
};

export interface Rel {
  /** 0..100 */
  bond: number;
  stage: RelStage;
  /** last day you spent time together */
  lastDay: number;
  /** day the current stage began */
  since: number;
}

export interface Hangout {
  label: string;
  cost: number;
  minutes: number;
  bond: number;
  /** what it does for you */
  fun: number;
}

/** The people whose stories run alongside yours. `id` matches their scene NPC. */
export interface StoryPerson {
  id: string;
  zone: string;
  zoneLabel: string;
  gender: Gender;
  romance: boolean;
  blurb: string;
  hangout: Hangout;
  /** only appears for these lives */
  backgrounds?: BackgroundId[];
}

export const STORY_PEOPLE: StoryPerson[] = [
  {
    id: "Ada", zone: "ui-gate", zoneLabel: "UI gate", gender: "obinrin", romance: true,
    blurb: "Microbiology at UI, from Enugu, reads in the faculty when NEPA takes light. Funny once she trusts you.",
    hangout: { label: "Suya and gist at the UI gate", cost: 3000, minutes: 90, bond: 10, fun: 12 },
  },
  {
    id: "Tobi", zone: "sango", zoneLabel: "Sango / Poly", gender: "okunrin", romance: true,
    blurb: "Electrical engineering at the Poly. Fixes everyone's phone for free and dreams of a solar business.",
    hangout: { label: "Watch the match at a Sango viewing centre", cost: 1500, minutes: 120, bond: 10, fun: 15 },
  },
  {
    id: "Kemi", zone: "ring-road", zoneLabel: "the Palms, Ring Road", gender: "obinrin", romance: true,
    blurb: "Runs her mother's boutique account on Instagram. Knows every owambe before it's announced.",
    hangout: { label: "Small chops and a walk round the Palms", cost: 8000, minutes: 120, bond: 11, fun: 14 },
  },
  {
    id: "Femi", zone: "agbowo", zoneLabel: "Agbowo", gender: "okunrin", romance: true,
    blurb: "Runs the printing shop his uncle left him. Wants to study law part-time. Quietly reliable.",
    hangout: { label: "Amala at the Agbowo buka after closing", cost: 2500, minutes: 90, bond: 10, fun: 10 },
  },
  {
    id: "Oga Emeka", zone: "gbagi", zoneLabel: "Gbagi market", gender: "okunrin", romance: false,
    blurb: "Provisions wholesaler. Came to Ibadan with nothing in 1998. Likes young people who keep their word.",
    hangout: { label: "Help him count stock and learn the trade", cost: 0, minutes: 120, bond: 9, fun: 4 },
  },
  {
    id: "Chief on the green", zone: "sabo", zoneLabel: "Ibadan Golf Club", gender: "okunrin", romance: false,
    blurb: "Retired permanent secretary. Knows everyone at the Secretariat and at Cocoa House.",
    hangout: { label: "Walk nine holes and listen", cost: 0, minutes: 150, bond: 8, fun: 6 },
  },
  {
    id: "Coach Bisola", zone: "sabo", zoneLabel: "Recreation Club", gender: "obinrin", romance: false,
    blurb: "Former national junior tennis champion. Tough love, early mornings.",
    hangout: { label: "Early-morning hitting session", cost: 3000, minutes: 90, bond: 9, fun: 12 },
  },
  {
    id: "Tunde", zone: "beere", zoneLabel: "Beere", gender: "okunrin", romance: false, backgrounds: ["omo-iya-lobe"],
    blurb: "Your younger brother. WAEC this year. Looks at you to see what's possible.",
    hangout: { label: "Help him with WAEC maths", cost: 0, minutes: 90, bond: 10, fun: 4 },
  },
  {
    id: "Kunle", zone: "old-bodija", zoneLabel: "Old Bodija", gender: "okunrin", romance: false, backgrounds: ["alowonle"],
    blurb: "Your cousin. Always has a deal. Occasionally one of them works.",
    hangout: { label: "Hear out his latest business idea", cost: 0, minutes: 60, bond: 8, fun: 8 },
  },
];

export const personById = (id: string) => STORY_PEOPLE.find((p) => p.id === id);

/** Costs along the road to marriage. */
export const LOVE = {
  /** bond needed before you can ask someone out */
  askOutBond: 60,
  /** bond and days dating before a proposal */
  proposeBond: 85,
  proposeDays: 120,
  /** gifts, drinks and kola for the introduction to the family */
  introduction: 150_000,
  /** traditional engagement + reception, modest Ibadan scale */
  wedding: 1_500_000,
  /** a child is announced this long after the wedding */
  childAfter: 300,
  naming: 100_000,
};

// ---- the whole life ----

export interface LifeState {
  flags: string[];
  /** storylet id → day it last fired */
  seen: Record<string, number>;
  edu: Edu;
  rel: Record<string, Rel>;
  children: number;
  milestones: { day: number; text: string }[];
  /** season skips taken */
  seasons: number;
  /** legacy written; the game is over for this life */
  ended: boolean;
}

export function defaultLife(): LifeState {
  return {
    flags: [],
    seen: {},
    edu: { stage: "none", school: null, score: null, startDay: 0, attended: 0, sessions: 0, gp: 0, extraYears: 0, grade: null, posting: null },
    rel: {},
    children: 0,
    milestones: [],
    seasons: 0,
    ended: false,
  };
}

/** You can write your legacy from 28; at 38 the story closes. */
export const LEGACY_MIN_AGE = 28;
export const LEGACY_MAX_AGE = 38;
/** One season skip moves you on this many days. */
export const SEASON_DAYS = 91;
/** The first fortnight is lived day by day. */
export const SKIP_FROM_DAY = 15;

export type SeasonFocus = "work" | "school" | "family" | "love";
export const SEASON_FOCUS: { id: SeasonFocus; label: string; blurb: string }[] = [
  { id: "work", label: "💼 Work", blurb: "Every shift, every hustle. More money, less of everything else." },
  { id: "school", label: "📚 School", blurb: "Lectures, library, past questions. Keeps your grades up." },
  { id: "family", label: "👪 Family", blurb: "Show up at home. Bond and Iwa grow; money grows slower." },
  { id: "love", label: "❤️ Love", blurb: "Time for your partner and friends. Hearts grow; pockets don't." },
];
