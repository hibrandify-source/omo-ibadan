// Capture game art (at 2x) for marketing posts. Run with the dev server on :3001.
//   node marketing/tools/capture.cjs
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

const OUT = path.join(__dirname, "..", "art");
const BASE = process.env.BASE || "http://localhost:3001";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });

async function openTab(page, label) {
  const direct = page.getByRole("button", { name: label, exact: true });
  if (await direct.first().isVisible()) return direct.first().click();
  await page.getByRole("button", { name: "More", exact: true }).click();
  await page.getByRole("button", { name: label, exact: true }).first().click();
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  // landing: hero skyline and the two families
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await sleep(5000);
  await page.locator("canvas").first().screenshot({ path: path.join(OUT, "hero.png") });
  // a taller, narrower skyline for portrait posts
  const tall = await browser.newPage({ viewport: { width: 900, height: 1000 }, deviceScaleFactor: 2.4 });
  await tall.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await tall.evaluate(() => { const c = document.querySelector("canvas"); c.style.height = "720px"; });
  await sleep(9200); // a moment when the traffic is spread out
  await tall.locator("canvas").first().screenshot({ path: path.join(OUT, "hero-tall.png") });
  await tall.close();
  await page.getByRole("img", { name: /Mama Bisi and your brother/ }).screenshot({ path: path.join(OUT, "lobe.png") });
  await page.getByRole("img", { name: /Mummy, you, and Musa/ }).screenshot({ path: path.join(OUT, "alowonle.png") });

  // the game
  await page.goto(`${BASE}/play?birth=omo-iya-lobe`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.getByPlaceholder(/Pick @name/).waitFor({ timeout: 120000 });
  await sleep(2500); // let the page hydrate before typing
  await page.getByPlaceholder(/Pick @name/).fill("Ayomide");
  await page.getByRole("button", { name: /Draw my life/ }).click();
  await page.getByRole("button", { name: /Enter Ibadan/ }).click();
  await page.locator("canvas").first().waitFor();
  await page.addStyleTag({ content: ".sticky{position:static!important}" });

  const street = async (zone, name, x, y, file) => {
    await page.evaluate((z) => window.__omo.goto(z), zone);
    const c = page.locator(`canvas[aria-label="${name}, walkable street"]`);
    await c.waitFor({ timeout: 60000 });
    await c.scrollIntoViewIfNeeded();
    await page.evaluate(([px, py]) => window.__omoScene.moveTo(px, py), [x, y]);
    await sleep(1800);
    await c.screenshot({ path: path.join(OUT, file) });
  };
  await street("oja-oba", "Oja'ba", 26, 24, "ojaoba.png");
  await street("mapo", "Mapo Hall", 28, 30, "mapo.png");
  await street("dugbe", "Dugbe", 31, 30, "dugbe.png");

  // Micra Rush mid-run
  await openTab(page, "🚐 Hustle");
  await sleep(800);
  for (let i = 0; i < 4; i++) await page.getByRole("button", { name: /^Load/ }).click();
  await page.getByRole("button", { name: /Depart hustle/ }).click();
  const road = page.getByRole("img", { name: /Micra Rush/ });
  await road.scrollIntoViewIfNeeded();
  await sleep(5000);
  await road.screenshot({ path: path.join(OUT, "micra.png") });

  // owambe, mid-spray
  await openTab(page, "💃 Owambe");
  const hall = page.getByRole("img", { name: /Owambe/ });
  await hall.scrollIntoViewIfNeeded();
  await sleep(1500);
  await page.getByRole("button", { name: /₦1,000/ }).click();
  await sleep(450);
  await hall.screenshot({ path: path.join(OUT, "owambe.png") });

  await browser.close();
  console.log("captured to", OUT);
})();
