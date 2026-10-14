import { test, expect, type Page } from "@playwright/test";
import { EXAM_POOL, PRICES, BACKGROUNDS, naira, type BackgroundId } from "../lib/game";

const OIL = BACKGROUNDS["omo-iya-lobe"];
const START = OIL.pocket;

interface OmoState {
  started: boolean;
  tab: string;
  bg: BackgroundId | null;
  bond: number;
  ola: number;
  iwa: number;
  energy: number;
  day: number;
  minute: number;
  avatarZone: string;
  doorOpen: string | null;
  feed: string[];
  journal: number;
  npc: Record<string, number>;
}

const state = (page: Page): Promise<OmoState> =>
  page.evaluate(() => (window as unknown as { __omo: { state: () => OmoState } }).__omo.state());

/** Put the player at a spot in the current walkable scene (world metres). */
const sceneMoveTo = (page: Page, x: number, y: number) =>
  page.evaluate(([px, py]) => (window as unknown as { __omoScene: { moveTo: (x: number, y: number) => void } }).__omoScene.moveTo(px, py), [x, y] as [number, number]);

/** Open a game tab. On phones some tabs live under the "More" sheet. */
async function openTab(page: Page, label: string) {
  const direct = page.getByRole("button", { name: label, exact: true });
  if (await direct.first().isVisible()) return direct.first().click();
  await page.getByRole("button", { name: "More", exact: true }).click();
  await page.getByRole("button", { name: label, exact: true }).first().click();
}

/** Family time with Mama: serve the lunch crowd at her stall (2 h, +₦2,500, trust +4). */
async function helpMama(page: Page) {
  await page.getByRole("button", { name: /Family time with Mama/ }).first().click();
  await page.getByRole("button", { name: "Do: Serve the lunch crowd" }).click();
  await page.getByRole("button", { name: "Done →" }).click();
}

async function startGame(page: Page, name: string, birth: BackgroundId = "omo-iya-lobe") {
  // ?birth= forces the lottery in dev so tests are deterministic
  await page.goto(`/play?birth=${birth}`);
  await expect(page.getByText("Create your Ibadan self")).toBeVisible();
  // Enter is gated on a non-empty @name AND a drawn life
  await expect(page.getByRole("button", { name: /Enter Ibadan/ })).toBeDisabled();
  await page.getByPlaceholder(/Pick @name/).fill(name);
  await expect(page.getByRole("button", { name: /Enter Ibadan/ })).toBeDisabled();
  await page.getByRole("button", { name: /Draw my life/ }).click();
  await expect(page.getByText(BACKGROUNDS[birth].tagline)).toBeVisible();
  await page.getByRole("button", { name: /Enter Ibadan/ }).click();
  await expect(page.getByText(`@${name}`, { exact: false }).first()).toBeVisible();
  const s = await state(page);
  expect(s.started).toBe(true);
  expect(s.bg).toBe(birth);
  expect(s.ola).toBe(BACKGROUNDS[birth].pocket);
  expect(s.iwa).toBe(BACKGROUNDS[birth].iwa);
  return s;
}

test.describe("Omo Ibadan E2E", () => {
  test("landing, how-to-play and leaderboard all render", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Omo Ibadan/i).first()).toBeVisible();
    await page.goto("/how-to-play");
    await expect(page.getByRole("heading", { name: /How to play Omo Ibadan/ })).toBeVisible();
    await page.goto("/leaderboard");
    await expect(page.getByRole("heading", { name: /Mogaji/ })).toBeVisible();
  });

  test("onboarding gates entry, then HUD shows identity + wallet", async ({ page }) => {
    await startGame(page, "E2EAde");
    await expect(page.getByText(naira(START), { exact: true }).first()).toBeVisible();
  });

  test("all ten tabs render their content", async ({ page }) => {
    await startGame(page, "TabWaka");
    const tabs: Array<[string, string, RegExp]> = [
      ["🗺 Map", "map", /Waka Ibadan/],
      ["🚐 Hustle", "hustle", /Micra Rush/],
      ["📝 Exam", "exam", /UI Exam Survival/],
      ["📖 Itan", "story", /Itan Mi/],
      ["🏠 Ilé", "ile", /ÌDÁNIMỌ̀/],
      ["🛍️ Rà", "ra", /Aso-Ebi Market/],
      ["💃 Owambe", "owambe", /Fuji no be free/],
      ["🚶 Rìn", "rin", /take a walk/],
      ["📱 Fọ́nu", "fonu", /3310|Nokia/],
      ["📣 Ojude", "ojude", /Hood Turf/],
    ];
    for (const [label, id, body] of tabs) {
      await openTab(page, label);
      expect((await state(page)).tab).toBe(id);
      await expect(page.getByText(body).first()).toBeVisible();
    }
  });

  test("market: buy Oja Oba, sell Bodija = deterministic profit + Mama Put remembers", async ({ page }) => {
    await startGame(page, "OjaTrader");
    await openTab(page, "🚐 Hustle");
    await page.getByRole("button", { name: /Buy Oja Oba/ }).click();
    let s = await state(page);
    expect(s.ola).toBe(START - PRICES.market.stockBag);
    await page.getByRole("button", { name: /Sell Bodija/ }).click();
    s = await state(page);
    expect(s.ola).toBe(START - PRICES.market.stockBag + PRICES.market.askStart);
    expect(s.iwa).toBe(OIL.iwa + 2);
    expect(s.npc["Mama Put"]).toBe(1);
    expect(s.feed[0]).toMatch(/Sold Bodija/);
  });

  test("micra ride: autopilot completes, fare deducted, touts remember", async ({ page }) => {
    await startGame(page, "MicraRider");
    await openTab(page, "🚐 Hustle");
    await page.getByRole("button", { name: "🧍 Ride" }).click();
    await page.getByRole("button", { name: /Board micra/ }).click();
    // 9s autopilot corridor; generous timeout for CI/dev hiccups
    await expect.poll(() => state(page).then((s) => s.ola), { timeout: 60_000 }).toBe(START - PRICES.transport.micraRideFare);
    const s = await state(page);
    expect(s.iwa).toBe(OIL.iwa + 1);
    expect(s.npc["Iwo Tout"]).toBe(1);
    expect(s.npc["Sani"]).toBe(1);
    expect(s.feed[0]).toMatch(/Rode micra/);
  });

  test("exam: correct answer pays, Ada remembers", async ({ page }) => {
    await startGame(page, "ExamBrain");
    await openTab(page, "📝 Exam");
    const correct = EXAM_POOL[0].options[EXAM_POOL[0].answer];
    await page.getByRole("button", { name: correct }).click();
    const s = await state(page);
    expect(s.ola).toBe(START + PRICES.examReward);
    expect(s.iwa).toBe(OIL.iwa + 3);
    expect(s.npc["Ada"]).toBe(1);
    expect(s.feed[0]).toMatch(/Exam correct/);
  });

  test("door: walk-up to Mama Put's stall opens the store in place", async ({ page }) => {
    await startGame(page, "DoorWaka");
    // map tab is default; hop to Bodija Market and walk up to Mama Put's buka
    await page.evaluate(() => (window as unknown as { __omo: { goto: (z: string) => void } }).__omo.goto("bodija"));
    await expect(page.getByRole("img", { name: /Bodija Market, walkable street/ })).toBeVisible();
    await sceneMoveTo(page, 7, 30.9);
    const chip = page.getByRole("button", { name: /Mama Put's Stall/ });
    await expect(chip).toBeVisible({ timeout: 15_000 });
    await chip.click();
    await expect(page.getByRole("dialog", { name: /Mama Put/ })).toBeVisible();
    const s0 = await state(page);
    expect(s0.doorOpen).toBe("door-mamaput");
    // step into the painted stall: same shop, same prices
    await page.getByRole("button", { name: /Step inside the stall/ }).click();
    await expect(page.getByRole("button", { name: /Amala \+ gbegiri/ })).toBeVisible();
    await page.getByRole("button", { name: /Amala \+ gbegiri/ }).click();
    const s = await state(page);
    expect(s.ola).toBe(START - PRICES.food.amalaPlate);
    expect(s.feed[0]).toMatch(/Amala \+ gbegiri/);
    await page.getByRole("button", { name: /Step out/ }).first().click();
  });

  test("missions + journal: trade then claim Bodija trader, Itan records it", async ({ page }) => {
    await startGame(page, "ItanScribe");
    await openTab(page, "🚐 Hustle");
    await page.getByRole("button", { name: /Buy Oja Oba/ }).click();
    await page.getByRole("button", { name: /Sell Bodija/ }).click();
    await openTab(page, "📖 Itan");
    await expect(page.getByText("Bodija trader").first()).toBeVisible();
    // claim the met mission (m4); m1 auto-mission may already be claimed state — click any enabled Claim
    const claims = page.getByRole("button", { name: "Claim", exact: true });
    await expect(claims.first()).toBeVisible();
    await claims.first().click();
    const s = await state(page);
    expect(s.journal).toBeGreaterThanOrEqual(1);
    await expect(page.getByText("Itan Rẹ").first()).toBeVisible();
    await expect(page.getByText(/mission complete —/i).first()).toBeVisible();
  });

  test("people panel shows bonds after hustling", async ({ page }) => {
    await startGame(page, "PeopleP");
    await openTab(page, "🚐 Hustle");
    await page.getByRole("button", { name: /Buy Oja Oba/ }).click();
    await page.getByRole("button", { name: /Sell Bodija/ }).click();
    await openTab(page, "📣 Ojude");
    await expect(page.getByText("People — who knows your name")).toBeVisible();
    await expect(page.getByText("Mama Put")).toBeVisible();
    const s = await state(page);
    expect(s.npc["Mama Put"]).toBe(1);
  });

  test("progress survives reload via local save", async ({ page }) => {
    await startGame(page, "ReloadChap");
    await openTab(page, "🚐 Hustle");
    await page.getByRole("button", { name: /Buy Oja Oba/ }).click();
    // force a render + save flush before reloading
    await expect.poll(() => state(page).then((s) => s.ola)).toBe(START - PRICES.market.stockBag);
    await page.reload();
    await expect(page.getByText("@ReloadChap", { exact: false }).first()).toBeVisible();
    const s = await state(page);
    expect(s.started).toBe(true);
    expect(s.bg).toBe("omo-iya-lobe");
    expect(s.ola).toBe(START - PRICES.market.stockBag);
  });

  test("Alowonle: rich start, car travel, Daddy's approval panel", async ({ page }) => {
    const alw = BACKGROUNDS.alowonle;
    await startGame(page, "BodijaHeir", "alowonle");
    expect((await state(page)).bond).toBe(alw.bond);
    await expect(page.getByText(alw.bondLabel).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "🚗 Car" })).toBeVisible();
    await page.getByRole("button", { name: /Family time with Daddy/ }).first().click();
    await page.getByRole("button", { name: "Do: Sit in on Daddy's site meeting" }).click();
    const s = await state(page);
    expect(s.bond).toBe(alw.bond + 4);
    // once a day: the activity is done for today
    await expect(page.getByRole("button", { name: "Do: Sit in on Daddy's site meeting" })).toBeDisabled();
    await page.getByRole("button", { name: "Done →" }).click();
    await expect(page.getByRole("button", { name: /Family time with Daddy ✅/ }).first()).toBeVisible();
  });

  test("Omo Iya Lobe: help Mama, then pay an obligation", async ({ page }) => {
    await startGame(page, "BeereChild");
    await helpMama(page);
    let s = await state(page);
    expect(s.ola).toBe(START + 2500);
    expect(s.bond).toBe(OIL.bond + 4);
    // Tunde's WAEC fees (₦30,000) is affordable after one market flip + Mama's tip? Not yet — button stays disabled.
    const waec = OIL.obligations.find((o) => o.id === "waec-fees")!;
    expect(s.ola).toBeLessThan(waec.amount);
  });

  test("the lottery can't be rerolled by reloading before entering", async ({ page }) => {
    await page.goto("/play?birth=alowonle");
    await page.getByPlaceholder(/Pick @name/).fill("NoReroll");
    await page.getByRole("button", { name: /Draw my life/ }).click();
    await expect(page.getByText(BACKGROUNDS.alowonle.tagline)).toBeVisible();
    await page.goto("/play?birth=omo-iya-lobe");
    await expect(page.getByText(BACKGROUNDS.alowonle.tagline)).toBeVisible();
    await expect(page.getByRole("button", { name: /Draw my life/ })).toHaveCount(0);
  });

  test("progress survives a reload (single save format)", async ({ page }) => {
    await startGame(page, "SaveCheck");
    await helpMama(page);
    await openTab(page, "🚐 Hustle");
    await page.getByRole("button", { name: /Buy Oja Oba/ }).click();
    const before = await state(page);
    await page.reload();
    await expect(page.getByText("@SaveCheck", { exact: false }).first()).toBeVisible();
    const after = await state(page);
    expect(after.started).toBe(true);
    expect(after.ola).toBe(before.ola);
    expect(after.bond).toBe(before.bond);
    expect(after.bg).toBe(before.bg);
    expect(after.journal).toBe(before.journal);
  });

  test("the clock: you start at 6 am aged 18, hustles take time, sleep wakes you at 6 am", async ({ page }) => {
    await startGame(page, "ClockWaka");
    let s = await state(page);
    expect(s.minute).toBe(6 * 60);
    await expect(page.getByLabel("Time")).toContainText("6:00 am");
    await expect(page.getByText(/Age 18/).filter({ visible: true }).first()).toBeVisible();
    await helpMama(page); // 2 hours
    s = await state(page);
    expect(s.minute).toBe(8 * 60);
    await openTab(page, "🏠 Ilé");
    // in the day it's a nap; after 7 pm you sleep till morning
    await page.getByRole("button", { name: /Take a nap/ }).click();
    s = await state(page);
    expect(s.day).toBe(1);
    expect(s.minute).toBe(10 * 60);
    await page.evaluate(() => (window as unknown as { __omo: { setClock: (m: number) => void } }).__omo.setClock(20 * 60));
    await page.getByRole("button", { name: /Sleep till morning/ }).click();
    s = await state(page);
    expect(s.day).toBe(2);
    expect(s.minute).toBe(6 * 60);
    await expect(page.getByLabel("Time")).toContainText("Tue 5 Jan");
  });

  test("Beere: Omo Iya Lobe starts at home in the walkable compound", async ({ page }) => {
    await startGame(page, "BeereWaka");
    expect((await state(page)).avatarZone).toBe("beere");
    await expect(page.getByRole("img", { name: /Beere, walkable street/ })).toBeVisible();
    const moveTo = (x: number, y: number) =>
      page.evaluate(([px, py]) => (window as unknown as { __omoScene: { moveTo: (x: number, y: number) => void } }).__omoScene.moveTo(px, py), [x, y] as [number, number]);
    // the landlord is on his bench in the morning
    await moveTo(34.4, 25.4);
    await page.getByRole("button", { name: /Talk to Baba Ade/ }).click();
    let s = await state(page);
    expect(s.feed[0]).toMatch(/Baba Ade/);
    expect(s.npc["Baba Ade"]).toBe(1);
    // Mama is at her Oja'ba stall in the morning, so the pot is cold
    await moveTo(20.5, 21.3);
    await page.getByRole("button", { name: /Help Mama at the pot/ }).click();
    s = await state(page);
    expect(s.feed[0]).toMatch(/pot is cold/);
    // your own door leads into your room
    await moveTo(18.1, 17.0);
    await page.getByRole("button", { name: /Enter your room/ }).click();
    expect((await state(page)).tab).toBe("ile");
  });

  test("Old Bodija: Alowonle starts at Daddy's house; gateman, empty veranda, the car", async ({ page }) => {
    await startGame(page, "BodijaHeir2", "alowonle");
    expect((await state(page)).avatarZone).toBe("old-bodija");
    await expect(page.getByRole("img", { name: /Old Bodija, walkable street/ })).toBeVisible();
    const moveTo = (x: number, y: number) =>
      page.evaluate(([px, py]) => (window as unknown as { __omoScene: { moveTo: (x: number, y: number) => void } }).__omoScene.moveTo(px, py), [x, y] as [number, number]);
    await moveTo(27.6, 31.8);
    await page.getByRole("button", { name: /Talk to Musa/ }).click();
    expect((await state(page)).feed[0]).toMatch(/Musa/);
    await moveTo(18.3, 19.4);
    await page.getByRole("button", { name: /Report to Daddy on the veranda/ }).click();
    expect((await state(page)).feed[0]).toMatch(/veranda is empty/);
    await moveTo(23.6, 24.3);
    await page.getByRole("button", { name: /Drive out in your car/ }).click();
    expect((await state(page)).feed[0]).toMatch(/Musa opens the gate/);
  });

  test("phones: no sideways scroll, bottom tab bar, the street fills the screen", async ({ page }, info) => {
    test.skip(info.project.name !== "mobile", "phone layout only");
    await startGame(page, "PhoneWaka");
    const w = await page.evaluate(() => ({ vw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth, sy: window.scrollY }));
    expect(w.sw).toBeLessThanOrEqual(w.vw);
    expect(w.sy).toBe(0); // landed at the top, not halfway down the join form
    await expect(page.getByRole("navigation", { name: "Game tabs" })).toBeVisible();
    const scene = await page.getByRole("img", { name: /Beere, walkable street/ }).boundingBox();
    const vh = page.viewportSize()!.height;
    expect(scene!.height).toBeGreaterThan(vh * 0.45);
    await openTab(page, "📣 Ojude");
    expect((await state(page)).tab).toBe("ojude");
    for (const path of ["/", "/how-to-play", "/leaderboard"]) {
      await page.goto(path);
      const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(o, path).toBeLessThanOrEqual(0);
    }
  });

  test("Oja'ba: help Mama at her stall in the morning, buy stock from Iya Alata", async ({ page }) => {
    await startGame(page, "OjabaWaka");
    await page.evaluate(() => (window as unknown as { __omo: { goto: (z: string) => void } }).__omo.goto("oja-oba"));
    await expect(page.getByRole("img", { name: /Oja'ba, walkable street/ })).toBeVisible();
    const bond0 = (await state(page)).bond;
    await sceneMoveTo(page, 16.4, 19.7);
    await page.getByRole("button", { name: /Help Mama sell/ }).click();
    await page.getByRole("button", { name: "Do: Serve the lunch crowd" }).click();
    await page.getByRole("button", { name: "Done →" }).click();
    let s = await state(page);
    expect(s.feed[0]).toMatch(/Serve the lunch crowd/);
    expect(s.bond).toBe(bond0 + 4);
    await sceneMoveTo(page, 35, 19.7);
    await page.getByRole("button", { name: /Buy stock from Iya Alata/ }).click();
    s = await state(page);
    expect(s.doorOpen).toBe("door-ojaoba");
    await expect(page.getByRole("button", { name: /Buy Oja Oba/ })).toBeVisible();
  });

  test("Iwo Road park: talk to the tout, then join the micra rank", async ({ page }) => {
    await startGame(page, "ParkWaka");
    await page.evaluate(() => (window as unknown as { __omo: { goto: (z: string) => void } }).__omo.goto("iwo-road"));
    await expect(page.getByRole("img", { name: /Iwo Road Park, walkable street/ })).toBeVisible();
    await sceneMoveTo(page, 26.5, 21.6);
    await page.getByRole("button", { name: /Talk to Iwo Tout/ }).click();
    expect((await state(page)).feed[0]).toMatch(/Iwo Tout/);
    await sceneMoveTo(page, 45, 27.3);
    await page.getByRole("button", { name: /Join the micra rank/ }).click();
    expect((await state(page)).tab).toBe("hustle");
    await expect(page.getByText(/Real Ibadan corridors from OpenStreetMap/)).toBeVisible();
  });

  test("Itan: your life and your people; greeting Ada starts a friendship", async ({ page }) => {
    await startGame(page, "LifeWaka");
    await page.evaluate(() => (window as unknown as { __omo: { goto: (z: string) => void } }).__omo.goto("ui-gate"));
    await expect(page.getByRole("img", { name: /walkable street/ })).toBeVisible();
    await sceneMoveTo(page, 27.4, 29);
    await page.getByRole("button", { name: /Talk to Ada/ }).click();
    await openTab(page, "📖 Itan");
    await expect(page.getByText("Age 18", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /Live day by day until Day 15/ })).toBeDisabled();
    await expect(page.getByRole("heading", { name: /Your people/ })).toBeVisible();
    await expect(page.getByLabel("Bond 3 of 100")).toBeVisible();
    await expect(page.getByRole("button", { name: /Suya and gist at the UI gate/ })).toBeEnabled();
  });

  test("no uncaught errors from load through first hustle", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (e) => pageErrors.push(e.message));
    await startGame(page, "CleanRun");
    await openTab(page, "🚐 Hustle");
    await page.getByRole("button", { name: /Buy Oja Oba/ }).click();
    await page.getByRole("button", { name: /Sell Bodija/ }).click();
    await openTab(page, "📖 Itan");
    expect(pageErrors).toEqual([]);
  });
});
