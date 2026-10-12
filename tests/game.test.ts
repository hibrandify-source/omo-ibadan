import { describe, expect, it } from "vitest";
import {
  BACKGROUNDS,
  drawBackground,
  backgroundFromLegacyArchetype,
  allowanceDue,
  upkeepFor,
  upcomingObligations,
  overdueObligations,
  eventsFor,
  LIFE_EVENTS,
  CAREERS,
  careerPay,
  entryLevel,
  grantXp,
  emptySkills,
  distanceKm,
  tripCost,
  moveInCost,
  HOMES,
  PRICES,
  naira,
  TITLE_LADDER,
} from "@/lib/game";
import { HOME_PATHS } from "@/lib/world";

const oil = BACKGROUNDS["omo-iya-lobe"];
const alw = BACKGROUNDS.alowonle;

describe("birth lottery", () => {
  it("draws Alowonle below the odds threshold and Omo Iya Lobe above it", () => {
    expect(drawBackground(() => 0.1)).toBe("alowonle");
    expect(drawBackground(() => 0.5)).toBe("omo-iya-lobe");
  });

  it("odds sum to 1 and roughly 1 in 5 lives are Alowonle", () => {
    expect(oil.odds + alw.odds).toBeCloseTo(1);
    let seed = 42;
    const rand = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
    let rich = 0;
    for (let i = 0; i < 10000; i++) if (drawBackground(rand) === "alowonle") rich++;
    expect(rich / 10000).toBeGreaterThan(0.17);
    expect(rich / 10000).toBeLessThan(0.23);
  });

  it("maps legacy archetype saves onto a background", () => {
    expect(backgroundFromLegacyArchetype("dugbe-bigboy")).toBe("alowonle");
    expect(backgroundFromLegacyArchetype("ui-student")).toBe("omo-iya-lobe");
    expect(backgroundFromLegacyArchetype(undefined)).toBe("omo-iya-lobe");
  });

  it("each life has a home path and real careers as connections", () => {
    for (const bg of [oil, alw]) {
      expect(HOME_PATHS.some((p) => p.bgId === bg.id)).toBe(true);
      for (const c of bg.connections) expect(CAREERS.some((x) => x.id === c)).toBe(true);
    }
  });
});

describe("Alowonle money comes with conditions", () => {
  it("pays the allowance only every 7th day and only while approval holds", () => {
    expect(allowanceDue(alw, 6, 80)).toBe(0);
    expect(allowanceDue(alw, 7, 80)).toBe(alw.allowancePerWeek);
    expect(allowanceDue(alw, 7, alw.allowanceMinBond - 1)).toBe(0);
    expect(allowanceDue(oil, 7, 100)).toBe(0);
  });

  it("burns fuel every day; Omo Iya Lobe has no upkeep", () => {
    expect(upkeepFor(alw)).toBe(PRICES.transport.carFuelPerDay);
    expect(upkeepFor(oil)).toBe(0);
  });
});

describe("obligations", () => {
  it("warns ahead of the due day and flags overdue ones until paid", () => {
    const rent = oil.obligations.find((o) => o.id === "mama-rent")!;
    expect(upcomingObligations(oil, rent.dueDay - 3, [], 2).map((o) => o.id)).not.toContain("mama-rent");
    expect(upcomingObligations(oil, rent.dueDay - 2, [], 2).map((o) => o.id)).toContain("mama-rent");
    expect(overdueObligations(oil, rent.dueDay, []).map((o) => o.id)).not.toContain("mama-rent");
    expect(overdueObligations(oil, rent.dueDay + 1, []).map((o) => o.id)).toContain("mama-rent");
    expect(overdueObligations(oil, rent.dueDay + 1, ["mama-rent"]).map((o) => o.id)).not.toContain("mama-rent");
  });

  it("a fresh Omo Iya Lobe can't cover everything at once — the pressure is real", () => {
    const total = oil.obligations.reduce((s, o) => s + o.amount, 0);
    expect(total).toBeGreaterThan(oil.pocket);
  });
});

describe("events", () => {
  it("filters background-only events to the right life", () => {
    const oilIds = eventsFor("omo-iya-lobe").map((e) => e.id);
    const alwIds = eventsFor("alowonle").map((e) => e.id);
    expect(oilIds).toContain("task-force");
    expect(oilIds).not.toContain("hangers-on");
    expect(alwIds).toContain("daddy-dinner");
    expect(alwIds).not.toContain("family");
    expect(oilIds).toContain("nepa");
    expect(alwIds).toContain("nepa");
  });

  it("every event has at least two choices", () => {
    for (const e of LIFE_EVENTS) expect(e.options.length).toBeGreaterThanOrEqual(2);
  });
});

describe("careers and skills", () => {
  it("connections start a life at level 2, otherwise level 1", () => {
    expect(entryLevel("banker", alw.connections)).toBe(2);
    expect(entryLevel("banker", oil.connections)).toBe(1);
    expect(entryLevel("market-trader", oil.connections)).toBe(2);
  });

  it("pay rises with every level", () => {
    for (const c of CAREERS) {
      for (let l = 2; l <= 5; l++) expect(careerPay(c.id, l)).toBeGreaterThan(careerPay(c.id, l - 1));
    }
  });

  it("grantXp levels up and carries leftover xp", () => {
    const { skills, leveled } = grantXp(emptySkills(), "hustle", 150);
    expect(leveled).toBe(true);
    expect(skills.hustle.level).toBe(1);
    expect(skills.hustle.xp).toBe(50);
  });
});

describe("prices and travel", () => {
  it("distances are symmetric with a 5 km fallback", () => {
    expect(distanceKm("bodija", "mokola")).toBe(distanceKm("mokola", "bodija"));
    expect(distanceKm("bodija", "bodija")).toBe(0);
    expect(distanceKm("nowhere", "elsewhere")).toBe(5);
  });

  it("trek is free, micra charges per km", () => {
    expect(tripCost("trek", 4).fare).toBe(0);
    expect(tripCost("micra", 4).fare).toBe(4 * PRICES.transport.micraFarePerKm);
  });

  it("moving costs more than a year's rent (agent + caution)", () => {
    for (const h of HOMES) expect(moveInCost(h.id)).toBeGreaterThan(h.rentPerYear);
  });

  it("market flip at the starting ask is profitable", () => {
    const m = PRICES.market;
    expect(m.askStart).toBeGreaterThan(m.stockBag);
    expect(m.askStart).toBeLessThanOrEqual(m.fairBase + 80 * m.moodStep);
  });

  it("formats naira with thousands separators", () => {
    expect(naira(15000)).toBe("₦15,000");
  });

  it("the title ladder no longer reuses 'Omo Iya Lobe'", () => {
    expect(TITLE_LADDER).not.toContain("Omo Iya Lobe");
  });
});
