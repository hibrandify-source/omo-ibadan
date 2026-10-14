import { describe, expect, it } from "vitest";
import { BACKGROUNDS, FAMILY_ACTIVITIES, defaultLife, type LifeEvent } from "@/lib/game";
import { CITY } from "@/lib/map/ibadan";
import { createDrive, stepDrive } from "@/lib/engine/drive";
import { phoneInbox } from "@/lib/engine/phone";
import { askOut, bondWith } from "@/lib/engine/life";
import { wanderAt } from "@/lib/art/interiors";

const corridor = CITY.corridors[0];
const names = corridor.stops.map((s) => s.toUpperCase());
const idle = { gas: false, brake: false, laneTarget: 0 as 0 | 1, stop: false, honk: false };

describe("Micra Rush stops", () => {
  it("says why STOP did nothing: wrong lane, or the bay is still ahead", () => {
    const s = createDrive(corridor, names, { autopilot: false, seed: 4 });
    const early = stepDrive(s, { ...idle, stop: true }, 1 / 60);
    expect(early).toContainEqual(expect.objectContaining({ type: "stop-miss", why: "early" }));
    s.lane = 1;
    s.laneTarget = 1;
    const lane = stepDrive(s, { ...idle, laneTarget: 1, stop: true }, 1 / 60);
    expect(lane).toContainEqual(expect.objectContaining({ type: "stop-miss", why: "lane" }));
  });

  it("a stop inside the bay is recorded with its time, and the micra waits long enough to board", () => {
    const s = createDrive(corridor, names, { autopilot: false, seed: 4 });
    s.x = s.bays[0].x;
    const ev = stepDrive(s, { ...idle, stop: true }, 1 / 60);
    expect(ev).toContainEqual({ type: "bay", ok: true, name: s.bays[0].name });
    expect(s.bays[0].ok).toBe(true);
    expect(s.bays[0].at).toBeGreaterThan(0);
    expect(s.dwell).toBeGreaterThanOrEqual(2);
  });
});

describe("your room", () => {
  it("you move between spots and pause at each, staying on the floor", () => {
    const seen = new Set<string>();
    let moving = 0;
    for (let t = 0; t < 60; t += 0.25) {
      const p = wanderAt(t);
      expect(p.x).toBeGreaterThan(0.5);
      expect(p.x).toBeLessThan(6.5);
      expect(p.y).toBeGreaterThan(1.8); // in front of the mat and the back-wall furniture
      expect(p.y).toBeLessThan(4.8);
      seen.add(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
      if (p.moving) moving++;
    }
    expect(seen.size).toBeGreaterThan(20);
    expect(moving).toBeGreaterThan(20);
  });
});

describe("family time", () => {
  it("has things to do by day and in the evening, for both lives", () => {
    for (const fam of Object.values(FAMILY_ACTIVITIES)) {
      expect(fam.list.some((a) => a.parts.includes("morning"))).toBe(true);
      expect(fam.list.some((a) => a.parts.includes("evening"))).toBe(true);
      expect(new Set(fam.list.map((a) => a.id)).size).toBe(fam.list.length);
    }
  });
});

describe("Fọ́nu Mi", () => {
  const base = { day: 3, minute: 6 * 60, bg: BACKGROUNDS["omo-iya-lobe"], paidObligations: [] as string[], life: defaultLife(), event: null as LifeEvent | null, weather: "clear" as const, feed: [] as string[] };

  it("fills up as the day goes on", () => {
    const dawn = phoneInbox(base);
    const evening = phoneInbox({ ...base, minute: 19 * 60 });
    expect(evening.length).toBeGreaterThan(dawn.length);
    expect(evening.some((m) => m.from.startsWith("Mama Put"))).toBe(true);
    expect(dawn.some((m) => m.from.startsWith("Mama Put"))).toBe(false);
    for (let i = 1; i < evening.length; i++) expect(evening[i - 1].at).toBeGreaterThanOrEqual(evening[i].at);
  });

  it("carries today's event, overdue bills and bank alerts", () => {
    const ev: LifeEvent = { id: "jamb-form", title: "📝 JAMB form is out", desc: "Registration is open.", options: [] };
    const box = phoneInbox({ ...base, day: 13, minute: 9 * 60, event: ev, feed: ["💳 Daddy's allowance landed: +₦40,000."], bg: BACKGROUNDS.alowonle });
    expect(box.find((m) => m.from === "JAMB")?.text).toContain("JAMB form");
    expect(box.some((m) => m.text.includes("overdue"))).toBe(true);
    expect(box.some((m) => m.from === "GTBank" && m.text.includes("₦40,000"))).toBe(true);
  });

  it("hears from your partner, and notices when you go quiet", () => {
    const life = askOut(bondWith(defaultLife(), "Ada", 70, 1), "Ada", "okunrin", 1, 60, () => 0).life;
    const close = phoneInbox({ ...base, day: 3, minute: 22 * 60, life });
    expect(close.find((m) => m.from === "Ada")?.text).not.toMatch(/quiet/);
    const far = phoneInbox({ ...base, day: 20, minute: 22 * 60, life });
    expect(far.find((m) => m.from === "Ada")?.text).toMatch(/quiet/);
  });
});

describe("walkers board bookkeeping", () => {
  it("the save remembers how much of this week's walking reached the board", async () => {
    const { migrateSave, defaultSave } = await import("@/lib/engine/save");
    expect(defaultSave().walkWeek.posted).toBe(0);
    const old = migrateSave({ ...defaultSave(), walkWeek: { key: "2027-01-04", steps: 80 } })!;
    expect(old.walkWeek).toEqual({ key: "2027-01-04", steps: 80, posted: 0 }); // older saves: nothing posted yet, so it catches up
    const kept = migrateSave({ ...defaultSave(), walkWeek: { key: "2027-01-04", steps: 900, posted: 500 } })!;
    expect(kept.walkWeek.posted).toBe(500);
  });
});
