import { test, expect, type Page } from "@playwright/test";
import { EXAM_POOL } from "../lib/game";

interface OmoState {
  started: boolean;
  tab: string;
  ola: number;
  iwa: number;
  energy: number;
  day: number;
  avatarZone: string;
  nearDoor: string | null;
  doorOpen: string | null;
  feed: string[];
  journal: number;
  npc: Record<string, number>;
}

const state = (page: Page): Promise<OmoState> =>
  page.evaluate(() => (window as unknown as { __omo: { state: () => OmoState } }).__omo.state());

const teleport = (page: Page, x: number, y: number) =>
  page.evaluate(([px, py]) => (window as unknown as { __omo: { teleport: (x: number, y: number) => void } }).__omo.teleport(px, py), [x, y] as [number, number]);

async function startGame(page: Page, name: string) {
  await page.goto("/play");
  await expect(page.getByText("Create your Ibadan self")).toBeVisible();
  // Enter is gated on a non-empty @name
  await expect(page.getByRole("button", { name: /Enter Ibadan/ })).toBeDisabled();
  await page.getByPlaceholder(/Pick @name/).fill(name);
  await page.getByRole("button", { name: /Enter Ibadan/ }).click();
  await expect(page.getByText(`@${name}`, { exact: false }).first()).toBeVisible();
  const s = await state(page);
  expect(s.started).toBe(true);
  // ui-student default: 500 welcome + 300 base
  expect(s.ola).toBe(800);
  expect(s.iwa).toBe(60);
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
    await expect(page.getByText("₦800", { exact: true })).toBeVisible();
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
      await page.getByRole("button", { name: label }).click();
      expect((await state(page)).tab).toBe(id);
      await expect(page.getByText(body).first()).toBeVisible();
    }
  });

  test("market: buy Oja Oba, sell Bodija = deterministic profit + Mama Put remembers", async ({ page }) => {
    await startGame(page, "OjaTrader");
    await page.getByRole("button", { name: "🚐 Hustle" }).click();
    await page.getByRole("button", { name: /Buy Oja Oba/ }).click();
    let s = await state(page);
    expect(s.ola).toBe(400); // 800 - 400 stock
    await page.getByRole("button", { name: /Sell Bodija/ }).click();
    s = await state(page);
    expect(s.ola).toBe(1000); // 400 + 600 ask (fair: 650 + mood/10)
    expect(s.iwa).toBe(62);
    expect(s.npc["Mama Put"]).toBe(1);
    expect(s.feed[0]).toMatch(/Sold Bodija/);
  });

  test("micra ride: autopilot completes, fare deducted, touts remember", async ({ page }) => {
    await startGame(page, "MicraRider");
    await page.getByRole("button", { name: "🚐 Hustle" }).click();
    await page.getByRole("button", { name: "🧍 Ride" }).click();
    await page.getByRole("button", { name: /Board micra/ }).click();
    // 9s autopilot corridor; generous timeout for CI/dev hiccups
    await expect.poll(() => state(page).then((s) => s.ola), { timeout: 60_000 }).toBe(650);
    const s = await state(page);
    expect(s.iwa).toBe(61);
    expect(s.npc["Iwo Tout"]).toBe(1);
    expect(s.npc["Sani"]).toBe(1);
    expect(s.feed[0]).toMatch(/Rode micra/);
  });

  test("exam: correct answer pays, Ada remembers", async ({ page }) => {
    await startGame(page, "ExamBrain");
    await page.getByRole("button", { name: "📝 Exam" }).click();
    const correct = EXAM_POOL[0].options[EXAM_POOL[0].answer];
    await page.getByRole("button", { name: correct }).click();
    const s = await state(page);
    expect(s.ola).toBe(1050); // 800 + 250
    expect(s.iwa).toBe(63);
    expect(s.npc["Ada"]).toBe(1);
    expect(s.feed[0]).toMatch(/Exam correct/);
  });

  test("door: walk-up to Mama Put's stall opens the store in place", async ({ page }) => {
    await startGame(page, "DoorWaka");
    // map tab is default; hop to Bodija then step onto the stall mat (% coords)
    await page.evaluate(() => (window as unknown as { __omo: { goto: (z: string) => void } }).__omo.goto("bodija"));
    await teleport(page, 14, 74);
    const chip = page.getByRole("button", { name: /Mama Put's Stall — step inside, no tabs/ });
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
    expect(s.ola).toBe(650); // 800 - 150 chop
    expect(s.feed[0]).toMatch(/Amala \+ gbegiri/);
    await page.getByRole("button", { name: /Step out/ }).first().click();
  });

  test("missions + journal: trade then claim Bodija trader, Itan records it", async ({ page }) => {
    await startGame(page, "ItanScribe");
    await page.getByRole("button", { name: "🚐 Hustle" }).click();
    await page.getByRole("button", { name: /Buy Oja Oba/ }).click();
    await page.getByRole("button", { name: /Sell Bodija/ }).click();
    await page.getByRole("button", { name: "📖 Itan" }).click();
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
    await page.getByRole("button", { name: "🚐 Hustle" }).click();
    await page.getByRole("button", { name: /Buy Oja Oba/ }).click();
    await page.getByRole("button", { name: /Sell Bodija/ }).click();
    await page.getByRole("button", { name: "📣 Ojude" }).click();
    await expect(page.getByText("People — who knows your name")).toBeVisible();
    await expect(page.getByText("Mama Put")).toBeVisible();
    const s = await state(page);
    expect(s.npc["Mama Put"]).toBe(1);
  });

  test("progress survives reload via local save", async ({ page }) => {
    await startGame(page, "ReloadChap");
    await page.getByRole("button", { name: "🚐 Hustle" }).click();
    await page.getByRole("button", { name: /Buy Oja Oba/ }).click();
    // force a render + save flush before reloading
    await expect.poll(() => state(page).then((s) => s.ola)).toBe(400);
    await page.reload();
    await expect(page.getByText("@ReloadChap", { exact: false }).first()).toBeVisible();
    const s = await state(page);
    expect(s.started).toBe(true);
    expect(s.ola).toBe(400);
  });

  test("no uncaught errors from load through first hustle", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (e) => pageErrors.push(e.message));
    await startGame(page, "CleanRun");
    await page.getByRole("button", { name: "🚐 Hustle" }).click();
    await page.getByRole("button", { name: /Buy Oja Oba/ }).click();
    await page.getByRole("button", { name: /Sell Bodija/ }).click();
    await page.getByRole("button", { name: "📖 Itan" }).click();
    expect(pageErrors).toEqual([]);
  });
});
