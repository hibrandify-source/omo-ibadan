import { describe, expect, it } from "vitest";
import { BACKGROUNDS, EXAM_POOL, MAP_NODES, PRICES, distanceKm, emptySkills, grantXp, MAX_SKILL_LEVEL } from "@/lib/game";
import { mapDistrict, roadKm } from "@/lib/map/ibadan";
import {
  chooseSave,
  cloudRowFor,
  defaultSave,
  migrateSave,
  rawFromCloudRow,
  saveBody,
  SAVE_VERSION,
} from "@/lib/engine/save";
import { advanceDay, decayNeeds, examQuestion, titleFor, titleIndex } from "@/lib/engine/day";

const fixed = (...vals: number[]) => {
  let i = 0;
  return () => vals[Math.min(i++, vals.length - 1)];
};

describe("migrateSave", () => {
  it("rejects things that aren't saves", () => {
    expect(migrateSave(null)).toBeNull();
    expect(migrateSave("hello")).toBeNull();
    expect(migrateSave([1, 2])).toBeNull();
  });

  it("upgrades a v1 save: background from archetype, wallet ×10", () => {
    const s = migrateSave({ started: true, archId: "dugbe-bigboy", ola: 800, iwa: 60, username: "Ade" })!;
    expect(s.v).toBe(SAVE_VERSION);
    expect(s.bgId).toBe("alowonle");
    expect(s.ola).toBe(8000);
    expect(s.iwa).toBe(60);
  });

  it("keeps a v2 save's wallet as is", () => {
    const s = migrateSave({ v: 2, started: true, bgId: "omo-iya-lobe", ola: 15000 })!;
    expect(s.bgId).toBe("omo-iya-lobe");
    expect(s.ola).toBe(15000);
  });

  it("never multiplies twice: a migrated save round-trips unchanged", () => {
    const once = migrateSave({ started: true, archId: "x", ola: 100 })!;
    const twice = migrateSave(JSON.parse(JSON.stringify(once)))!;
    expect(twice.ola).toBe(1000);
    expect(saveBody(twice)).toBe(saveBody(once));
  });

  it("replaces malformed fields with defaults and clamps ranges", () => {
    const s = migrateSave({ v: 3, iwa: 999, energy: "lots", needs: { hunger: -5 }, myHood: "lekki", journal: [{ text: 1 }, { day: 2, text: "ok" }] })!;
    expect(s.iwa).toBe(100);
    expect(s.energy).toBe(defaultSave().energy);
    expect(s.needs.hunger).toBe(0);
    expect(s.myHood).toBe("bodija");
    expect(s.journal).toEqual([{ day: 2, text: "ok" }]);
  });
});

describe("cloud rows", () => {
  it("round-trips a v3 save through a profiles row", () => {
    const s = { ...defaultSave(), started: true, username: "Bisi", ola: 42000, savedAt: 1_700_000_000_000 };
    const row = JSON.parse(JSON.stringify(cloudRowFor("user-1", s)));
    const back = migrateSave(rawFromCloudRow(row))!;
    expect(saveBody(back)).toBe(saveBody(s));
    expect(back.savedAt).toBe(s.savedAt);
  });

  it("reads an old v2 row spread across columns", () => {
    const row = {
      username: "Tayo", arch_id: "alowonle", gender: "obinrin", wallet: { ola: 250000, iwa: 45, energy: 80 },
      progress: { v: 2, day: 5, bond: 50 }, my_hood: "agbowo", updated_at: "2026-10-01T10:00:00Z",
    };
    const s = migrateSave(rawFromCloudRow(row))!;
    expect(s.started).toBe(true);
    expect(s.bgId).toBe("alowonle");
    expect(s.ola).toBe(250000);
    expect(s.day).toBe(5);
    expect(s.myHood).toBe("agbowo");
    expect(s.savedAt).toBe(Date.parse("2026-10-01T10:00:00Z"));
  });
});

describe("chooseSave", () => {
  const started = (savedAt: number) => ({ ...defaultSave(), started: true, savedAt });
  it("newer progress wins, ties go to local", () => {
    expect(chooseSave(started(100), started(200))).toBe("cloud");
    expect(chooseSave(started(300), started(200))).toBe("local");
    expect(chooseSave(started(200), started(200))).toBe("local");
  });
  it("an unstarted save never beats a started one", () => {
    expect(chooseSave(defaultSave(), started(1))).toBe("cloud");
    expect(chooseSave(started(1), { ...defaultSave(), savedAt: 999 })).toBe("local");
    expect(chooseSave(started(1), null)).toBe("local");
  });
});

describe("advanceDay", () => {
  const base = {
    bond: 60,
    needs: { hunger: 80, fun: 70, social: 70, hygiene: 75, toilet: 85 },
    trait: null,
    paidObligations: [] as string[],
    eventPending: false,
  };

  it("decays needs and charges Alowonle's car fuel", () => {
    const r = advanceDay({ ...base, day: 2, bg: BACKGROUNDS.alowonle, rand: fixed(0.99) });
    expect(r.needs).toEqual(decayNeeds(base.needs, null));
    expect(r.olaDelta).toBe(-PRICES.transport.carFuelPerDay);
    expect(r.event).toBeNull();
  });

  it("pays the weekly allowance only while Daddy approves", () => {
    const ok = advanceDay({ ...base, day: 7, bg: BACKGROUNDS.alowonle, rand: fixed(0.99) });
    expect(ok.olaDelta).toBe(BACKGROUNDS.alowonle.allowancePerWeek - PRICES.transport.carFuelPerDay);
    const cut = advanceDay({ ...base, day: 7, bond: 10, bg: BACKGROUNDS.alowonle, rand: fixed(0.99) });
    expect(cut.olaDelta).toBe(-PRICES.transport.carFuelPerDay);
    expect(cut.journal[0]).toMatch(/allowance stopped/);
  });

  it("penalises a missed obligation once, the day after it falls due", () => {
    const bg = BACKGROUNDS["omo-iya-lobe"];
    const due = bg.obligations[0].dueDay;
    const r = advanceDay({ ...base, day: due + 1, bg, rand: fixed(0.99) });
    expect(r.bondDelta).toBeLessThan(0);
    const later = advanceDay({ ...base, day: due + 2, bg, rand: fixed(0.99) });
    expect(later.bondDelta).toBe(0);
  });

  it("draws a background event, but never on top of a pending one", () => {
    const r = advanceDay({ ...base, day: 2, bg: BACKGROUNDS["omo-iya-lobe"], rand: fixed(0.1, 0) });
    expect(r.event).not.toBeNull();
    const busy = advanceDay({ ...base, day: 2, bg: BACKGROUNDS["omo-iya-lobe"], eventPending: true, rand: fixed(0.1, 0) });
    expect(busy.event).toBeNull();
  });

  it("hunger crash costs energy", () => {
    const r = advanceDay({ ...base, needs: { ...base.needs, hunger: 10 }, day: 2, bg: BACKGROUNDS["omo-iya-lobe"], rand: fixed(0.99) });
    expect(r.needs.hunger).toBe(0);
    expect(r.energyDelta).toBe(-10);
  });
});

describe("examQuestion", () => {
  it("keeps the right answer attached to the right option", () => {
    for (let i = 0; i < EXAM_POOL.length * 3; i++) {
      const q = examQuestion(i);
      const src = EXAM_POOL[i % EXAM_POOL.length];
      expect(q.options[q.answer]).toBe(src.options[src.answer]);
      expect([...q.options].sort()).toEqual([...src.options].sort());
    }
  });

  it("is deterministic and doesn't always put the answer first", () => {
    expect(examQuestion(5)).toEqual(examQuestion(5));
    const positions = new Set(Array.from({ length: EXAM_POOL.length }, (_, i) => examQuestion(i).answer));
    expect(positions.size).toBeGreaterThan(1);
  });
});

describe("titles", () => {
  it("money alone or character alone doesn't climb", () => {
    expect(titleIndex(250_000, 45)).toBe(0); // Alowonle on day 1
    expect(titleIndex(100_000_000, 50)).toBe(0);
    expect(titleIndex(0, 100)).toBe(0);
  });
  it("both together do", () => {
    expect(titleIndex(600_000, 56)).toBe(1);
    expect(titleFor(60_000_000, 95)).toBe("Olubadan of Hustle");
  });
});

describe("city map (OpenStreetMap)", () => {
  it("every game district is on the map with a road distance to every other", () => {
    for (const a of MAP_NODES) {
      expect(mapDistrict(a.id), a.id).toBeDefined();
      for (const b of MAP_NODES) {
        if (a.id === b.id) continue;
        const km = roadKm(a.id, b.id);
        expect(km, `${a.id}→${b.id}`).not.toBeNull();
        expect(km!).toBeGreaterThan(0);
        expect(km!).toBeLessThan(40);
      }
    }
  });

  it("road distances match the real city", () => {
    expect(distanceKm("mapo", "oja-oba")).toBeLessThan(1.5); // next door in the old city
    expect(distanceKm("bodija", "ui-gate")).toBeLessThan(4);
    expect(distanceKm("iwo-road", "challenge")).toBeGreaterThan(7); // across town
    expect(distanceKm("ojoo", "moniya")).toBeGreaterThan(distanceKm("ojoo", "ui-gate"));
  });

  it("districts sit where they really are, relative to each other", () => {
    const d = (id: string) => mapDistrict(id)!;
    expect(d("ojoo").y).toBeLessThan(d("ui-gate").y); // Ojoo is north of UI
    expect(d("challenge").y).toBeGreaterThan(d("mapo").y); // Challenge is south of Mapo
    expect(d("iwo-road").x).toBeGreaterThan(d("dugbe").x); // Iwo Road is east of Dugbe
    expect(d("eleyele").x).toBeLessThan(d("bodija").x); // Eleyele is west of Bodija
  });
});

describe("grantXp", () => {
  it("stops at the level cap", () => {
    let sk = emptySkills();
    for (let i = 0; i < 200; i++) sk = grantXp(sk, "brain", 1000).skills;
    expect(sk.brain.level).toBe(MAX_SKILL_LEVEL);
    expect(grantXp(sk, "brain", 1000).leveled).toBe(false);
  });
});
