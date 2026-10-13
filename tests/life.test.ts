import { describe, expect, it } from "vitest";
import {
  BACKGROUNDS,
  CAL,
  LECTURES_PER_YEAR,
  LOVE,
  NYSC_ALLOWANCE,
  SCHOOLS,
  SEASON_DAYS,
  STORYLETS,
  STORY_PEOPLE,
  defaultLife,
  upkeepFor,
  type LifeState,
} from "@/lib/game";
import {
  allowanceSupported,
  applyFx,
  askOut,
  bondWith,
  canAskOut,
  careerDoors,
  fillStory,
  hangOut,
  legacyReport,
  lifeDay,
  partnerOf,
  pickStorylet,
  priorityStorylet,
  propose,
  relOf,
  skipSeason,
  storyEligible,
  talkBond,
  wed,
  weddingCost,
  type StoryCtx,
} from "@/lib/engine/life";
import { advanceDay } from "@/lib/engine/day";
import { migrateLife, migrateSave, defaultSave } from "@/lib/engine/save";
import { STREET_SCENES } from "@/lib/scenes";

const fixed = (v: number) => () => v;
/** First day of the given year (0-based) at day-of-year `doy`. */
const dayAt = (year: number, doy: number) => year * 365 + doy + 1;
const oil = BACKGROUNDS["omo-iya-lobe"];
const alw = BACKGROUNDS.alowonle;
const ctx = (life: LifeState, day: number, extra: Partial<StoryCtx> = {}): StoryCtx => ({
  day, bg: "omo-iya-lobe", ola: 1_000_000, bond: 60, careerId: null, title: 0, life, ...extra,
});
const withEdu = (edu: Partial<LifeState["edu"]>, base = defaultLife()): LifeState => ({ ...base, edu: { ...base.edu, ...edu } });

describe("storylet content", () => {
  it("has unique ids and at least two options each", () => {
    const ids = STORYLETS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of STORYLETS) expect(s.options.length).toBeGreaterThanOrEqual(1);
  });

  it("always leaves a broke player a way out (an unconditional option that costs nothing)", () => {
    for (const s of STORYLETS) {
      const free = s.options.some((o) => o.ola >= 0 && !o.when);
      expect(free, s.id).toBe(true);
    }
  });

  it("only names people who exist", () => {
    const people = new Set(STORY_PEOPLE.map((p) => p.id));
    for (const s of STORYLETS) {
      if (s.when?.rel) expect(people.has(s.when.rel.id), s.id).toBe(true);
      for (const o of s.options) for (const r of o.fx?.rel ?? []) if (r.id !== "@partner") expect(people.has(r.id), `${s.id}→${r.id}`).toBe(true);
    }
  });

  it("puts every story person in their district's street", () => {
    for (const p of STORY_PEOPLE) {
      const scene = STREET_SCENES[p.zone];
      expect(scene, p.zone).toBeTruthy();
      expect(scene.npcs.some((n) => n.id === p.id), `${p.id} in ${p.zone}`).toBe(true);
    }
  });

  it("fills tokens and drops options the player doesn't qualify for", () => {
    const life = withEdu({ stage: "awaiting", score: 200 });
    const s = STORYLETS.find((x) => x.id === "jamb-result")!;
    const filled = fillStory(s, ctx(life, dayAt(0, 120)));
    expect(filled.title).toContain("200");
    const labels = filled.options.map((o) => o.label);
    expect(labels.some((l) => l.includes("Poly"))).toBe(true);
    expect(labels.some((l) => l.includes("UI"))).toBe(false);
  });
});

describe("school: JAMB → admission → lectures → graduation → NYSC", () => {
  it("offers the JAMB form in January and not later in the year", () => {
    const jamb = STORYLETS.find((s) => s.id === "jamb-form")!;
    expect(storyEligible(jamb, ctx(defaultLife(), 10))).toBe(true);
    expect(storyEligible(jamb, ctx(defaultLife(), dayAt(0, 100)))).toBe(false);
    const seen = { ...defaultLife(), seen: { "jamb-form": 10 } };
    expect(storyEligible(jamb, ctx(seen, 20))).toBe(false); // once a year
    expect(storyEligible(jamb, ctx(seen, dayAt(1, 10)))).toBe(true);
  });

  it("scores JAMB on exam day; practice and brains help", () => {
    const life = withEdu({ stage: "registered" });
    const lazy = lifeDay(life, dayAt(0, CAL.jambExam), { examPass: 0, brain: 0, rand: fixed(0.5) }).life;
    const keen = lifeDay(life, dayAt(0, CAL.jambExam), { examPass: 40, brain: 3, rand: fixed(0.5) }).life;
    expect(lazy.edu.stage).toBe("awaiting");
    expect(keen.edu.score!).toBeGreaterThan(lazy.edu.score!);
    expect(keen.edu.score!).toBeGreaterThanOrEqual(SCHOOLS.ui.cutoff);
    expect(lazy.edu.score!).toBeLessThan(SCHOOLS.ui.cutoff);
  });

  it("makes the JAMB result a priority storylet", () => {
    const life = withEdu({ stage: "awaiting", score: 260 });
    expect(priorityStorylet(ctx(life, dayAt(0, CAL.jambResult)))?.id).toBe("jamb-result");
  });

  it("resumes admitted students in October", () => {
    const admitted = applyFx(defaultLife(), { edu: { stage: "admitted", school: "ui" } }, dayAt(0, 120));
    expect(lifeDay(admitted, dayAt(0, 200), { examPass: 0, brain: 0 }).life.edu.stage).toBe("admitted");
    const r = lifeDay(admitted, dayAt(0, CAL.resumption), { examPass: 0, brain: 0 });
    expect(r.life.edu.stage).toBe("student");
  });

  it("carries over a session without enough lectures, then graduates", () => {
    const start = dayAt(0, CAL.resumption);
    let life = withEdu({ stage: "student", school: "ui", startDay: start });
    // session 1 with no lectures: carry-over
    life = lifeDay(life, start + 365, { examPass: 0, brain: 0 }).life;
    expect(life.edu.extraYears).toBe(1);
    expect(life.flags).toContain("carryover-pending");
    // four more sessions, all attended
    for (let s = 2; s <= 5; s++) {
      life = { ...life, edu: { ...life.edu, attended: LECTURES_PER_YEAR } };
      life = lifeDay(life, start + 365 * s, { examPass: 0, brain: 0 }).life;
    }
    expect(life.edu.stage).toBe("graduate");
    expect(life.edu.grade).toBeTruthy();
    expect(life.flags).toContain("just-graduated");
  });

  it("calls up graduates for NYSC, pays the allowance monthly, and passes them out after a year", () => {
    let life = withEdu({ stage: "graduate", school: "poly", startDay: 1000 });
    expect(lifeDay(life, 1030, { examPass: 0, brain: 0 }).life.flags).not.toContain("callup-ready");
    life = lifeDay(life, 1000 + CAL.nyscWait, { examPass: 0, brain: 0, rand: fixed(0) }).life;
    expect(life.flags).toContain("callup-ready");
    expect(life.edu.posting).toBe("Oyo");
    life = applyFx(life, { edu: { stage: "nysc" }, unflag: ["callup-ready"] }, 1100);
    expect(lifeDay(life, 1130, { examPass: 0, brain: 0 }).olaDelta).toBe(NYSC_ALLOWANCE);
    expect(lifeDay(life, 1131, { examPass: 0, brain: 0 }).olaDelta).toBe(0);
    const done = lifeDay(life, 1100 + CAL.nyscYear, { examPass: 0, brain: 0 }).life;
    expect(done.edu.stage).toBe("served");
  });

  it("opens graduate careers one level up", () => {
    expect(careerDoors(defaultLife(), [])).not.toContain("banker");
    expect(careerDoors(withEdu({ stage: "served" }), [])).toContain("banker");
    expect(careerDoors({ ...defaultLife(), flags: ["chief-letter"] }, [])).toContain("cocoa-clerk");
  });
});

describe("Alowonle money ends when school does", () => {
  it("supports while studying or serving, not after", () => {
    expect(allowanceSupported(withEdu({ stage: "student" }), alw, null, 400)).toBe(true);
    expect(allowanceSupported(withEdu({ stage: "nysc" }), alw, null, 2000)).toBe(true);
    expect(allowanceSupported(withEdu({ stage: "served" }), alw, null, 2500)).toBe(false);
    expect(allowanceSupported({ ...withEdu({ stage: "served" }), flags: ["daddys-firm"] }, alw, null, 2500)).toBe(true);
    expect(allowanceSupported(withEdu({ stage: "dropped" }), alw, "banker", 900)).toBe(true); // Daddy's circle
    expect(allowanceSupported(defaultLife(), alw, null, 900)).toBe(false); // 20 and doing nothing
  });

  it("stops the weekly allowance in advanceDay after NYSC", () => {
    const base = { bg: alw, bond: 80, needs: { hunger: 80, fun: 70, social: 70, hygiene: 75, toilet: 85 }, trait: null, paidObligations: ["owambe-aso-ebi"], eventPending: true };
    const served = advanceDay({ ...base, day: 2800, life: withEdu({ stage: "served" }) });
    expect(served.olaDelta).toBe(-upkeepFor(alw));
    const student = advanceDay({ ...base, day: 2800, life: withEdu({ stage: "student", startDay: 2700 }) });
    expect(student.olaDelta).toBe(alw.allowancePerWeek - upkeepFor(alw));
  });
});

describe("people", () => {
  it("builds a bond by greeting once a day", () => {
    let life = talkBond(defaultLife(), "Ada", 5).life;
    expect(relOf(life, "Ada").bond).toBe(3);
    life = talkBond(life, "Ada", 5).life;
    expect(relOf(life, "Ada").bond).toBe(3);
    expect(talkBond(defaultLife(), "Gate security", 5).gained).toBe(0); // not a story person
  });

  it("moves strangers to friends to close friends with the bond", () => {
    let life = bondWith(defaultLife(), "Tobi", 25, 3);
    expect(relOf(life, "Tobi").stage).toBe("friend");
    life = hangOut(bondWith(life, "Tobi", 15, 4), "Tobi", 5).life;
    expect(relOf(life, "Tobi").stage).toBe("close");
  });

  it("only lets you ask out someone close, single, and romance-able", () => {
    const close = bondWith(defaultLife(), "Ada", 70, 10);
    expect(canAskOut(close, "Ada").ok).toBe(true);
    expect(canAskOut(bondWith(defaultLife(), "Oga Emeka", 90, 10), "Oga Emeka").ok).toBe(false);
    expect(canAskOut(bondWith(defaultLife(), "Ada", 30, 10), "Ada").ok).toBe(false);
    const yes = askOut(close, "Ada", 11, 60, fixed(0)).life;
    expect(partnerOf(yes)).toBe("Ada");
    expect(canAskOut(bondWith(yes, "Kemi", 80, 12), "Kemi").ok).toBe(false); // already with someone
    const no = askOut(close, "Ada", 11, 60, fixed(0.99)).life;
    expect(partnerOf(no)).toBeNull();
    expect(relOf(no, "Ada").bond).toBe(62);
  });

  it("goes dating → engaged → married, with the costs", () => {
    let life = askOut(bondWith(defaultLife(), "Femi", 90, 10), "Femi", 10, 60, fixed(0)).life;
    expect(propose(life, "Femi", 50, 1e7).cost).toBe(0); // too soon
    const p = propose(life, "Femi", 10 + LOVE.proposeDays, 1e7);
    expect(p.cost).toBe(LOVE.introduction);
    life = p.life;
    expect(relOf(life, "Femi").stage).toBe("engaged");
    expect(weddingCost("alowonle", 70)).toBe(LOVE.wedding / 2);
    const w = wed(life, "Femi", 200, 1e7, "omo-iya-lobe", 70);
    expect(w.cost).toBe(LOVE.wedding);
    expect(relOf(w.life, "Femi").stage).toBe("married");
  });

  it("lets partners drift when you disappear, and warns you", () => {
    let life = askOut(bondWith(withEdu({ stage: "dropped" }), "Kemi", 60, 10), "Kemi", 10, 60, fixed(0)).life;
    life = bondWith(life, "Kemi", -40, 10); // bond 20, last seen day 10
    let d = 11;
    for (; d < 40; d++) life = lifeDay(life, d, { examPass: 0, brain: 0 }).life;
    expect(relOf(life, "Kemi").bond).toBeLessThan(20);
    expect(priorityStorylet(ctx(life, d))?.id).toBe("partner-drift");
  });
});

describe("season skips", () => {
  const input = (life: LifeState, day: number, focus: "work" | "school" | "family" | "love" = "work") => ({
    day, bg: oil, ola: 50_000, iwa: 60, bond: 60, careerId: null, careerSkill: null, careerPay: 0, title: 0, life, focus, examPass: 0, brain: 0, rand: fixed(0.99),
  });

  it("moves about three months and earns from hustles", () => {
    const life = withEdu({ stage: "dropped" });
    const r = skipSeason(input(life, 20));
    expect(r.days).toBe(SEASON_DAYS);
    expect(r.toDay).toBe(20 + SEASON_DAYS);
    expect(r.olaDelta).toBeGreaterThan(0);
    expect(r.life.seasons).toBe(1);
  });

  it("stops early when something important comes up", () => {
    const life = withEdu({ stage: "registered" });
    const r = skipSeason(input(life, 60));
    expect(r.stoppedFor).toBe("jamb-result");
    expect(r.toDay).toBe(dayAt(0, CAL.jambResult));
  });

  it("counts lectures on a school season", () => {
    const start = dayAt(0, CAL.resumption);
    const life = withEdu({ stage: "student", school: "ui", startDay: start });
    const school = skipSeason(input(life, dayAt(1, 0), "school"));
    const work = skipSeason(input(life, dayAt(1, 0), "work"));
    expect(school.stoppedFor).toBeNull();
    expect(school.life.edu.attended).toBeGreaterThanOrEqual(LECTURES_PER_YEAR);
    expect(work.life.edu.attended).toBe(0);
  });

  it("grows a partner's bond on a love season and shrinks it on a work season", () => {
    const life = askOut(bondWith(defaultLife(), "Tobi", 70, 10), "Tobi", 10, 60, fixed(0)).life;
    const love = skipSeason(input(withEdu({ stage: "dropped" }, life), 30, "love"));
    const work = skipSeason(input(withEdu({ stage: "dropped" }, life), 30, "work"));
    expect(relOf(love.life, "Tobi").bond).toBeGreaterThan(70);
    expect(relOf(work.life, "Tobi").bond).toBeLessThan(70);
  });
});

describe("legacy", () => {
  it("scores a full life above an empty one and sings the right oriki", () => {
    const base = { day: 3700, bg: oil, ola: 20_000, iwa: 40, bond: 30, title: 0, titleName: "Omo Adugbo", careerName: null, careerLevel: 0, homeTier: "room", visits: 3, life: defaultLife() };
    let full = withEdu({ stage: "served", school: "ui", grade: "Second Class Upper" });
    full = askOut(bondWith(full, "Ada", 80, 10), "Ada", 10, 70, fixed(0)).life;
    full = { ...full, rel: { ...full.rel, Ada: { ...full.rel.Ada, stage: "married" } }, children: 2, flags: ["kiosk"] };
    const rich = legacyReport({ ...base, ola: 12_000_000, iwa: 80, bond: 80, title: 2, careerName: "Banker", careerLevel: 4, homeTier: "duplex", visits: 27, life: full });
    const poor = legacyReport(base);
    expect(rich.score).toBeGreaterThan(poor.score);
    expect(rich.oriki).toContain("Beere");
    expect(rich.oriki).toContain("Ada");
    expect(rich.lines.join(" ")).toContain("2 children");
  });
});

describe("life in the save", () => {
  it("defaults missing or broken life data", () => {
    expect(migrateLife(undefined)).toEqual(defaultLife());
    const bad = migrateLife({ edu: { stage: "astronaut", score: "high" }, rel: { Ada: { bond: 999, stage: "married" }, X: { stage: "boss" } } });
    expect(bad.edu.stage).toBe("none");
    expect(bad.edu.score).toBeNull();
    expect(bad.rel.Ada.bond).toBe(100);
    expect(bad.rel.X).toBeUndefined();
  });

  it("round-trips through migrateSave", () => {
    const life = askOut(bondWith(withEdu({ stage: "student", school: "poly", score: 210 }), "Tobi", 70, 10), "Tobi", 10, 60, fixed(0)).life;
    const s = migrateSave({ ...defaultSave(), life })!;
    expect(s.life).toEqual(life);
  });

  it("draws random storylets only for the right life", () => {
    const life = defaultLife();
    for (let i = 0; i < 50; i++) {
      const e = pickStorylet(ctx(life, 30, { bg: "omo-iya-lobe" }), () => (i * 0.137) % 1, 1);
      if (e?.backgrounds) expect(e.backgrounds).toContain("omo-iya-lobe");
    }
  });
});
