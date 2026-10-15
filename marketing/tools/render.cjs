// Render marketing/tools/posts.html to PNG/JPG files in marketing/launch.
//   node marketing/tools/render.cjs
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

const OUT = path.join(__dirname, "..", "launch");
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1700, height: 1500 }, deviceScaleFactor: 1 });
  await page.goto("file:///" + path.join(__dirname, "posts.html").replace(/\\/g, "/"));
  await page.evaluate(() => document.fonts.ready);
  await sleep(800);
  const shots = [
    ["slide-1", "01-cover.jpg"], ["slide-2", "02-two-lives.jpg"], ["slide-3", "03-real-streets.jpg"],
    ["slide-4", "04-micra-rush.jpg"], ["slide-5", "05-owambe.jpg"], ["slide-6", "06-your-story.jpg"],
    ["slide-7", "07-play-free.jpg"],
    ["profile", "profile-picture.png"], ["banner", "cover-banner-1500x500.jpg"],
    ["logo-light", "logo-horizontal-light.png"], ["logo-dark", "logo-horizontal-dark.png"],
  ];
  for (const [id, file] of shots) {
    const el = page.locator(`#${id}`);
    const jpg = file.endsWith(".jpg");
    await el.screenshot({ path: path.join(OUT, file), type: jpg ? "jpeg" : "png", ...(jpg ? { quality: 92 } : {}) });
  }
  await browser.close();
  console.log("rendered", shots.length, "files to", OUT);
})();
