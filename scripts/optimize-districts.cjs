// One-off asset pipeline: district illustrations -> responsive WebP + blur placeholders + portrait crops.
// Run: node scripts/optimize-districts.mjs
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "public", "districts");
const OUT = path.join(SRC, "opt");
fs.mkdirSync(OUT, { recursive: true });

const DISTRICTS = ["mapo", "bodija", "iwo-road", "dugbe", "ui-gate", "sango", "samonda", "oja-oba", "oje", "agodi", "challenge", "molete", "mokola", "eleyele"];

// Portrait medallions cropped from the scenes themselves (fractions of width/height).
// Bodija (2048x1152 reference): Mama Put cooks bottom-left; traders mid-frame.
const CROPS = {
  bodija: [
    { id: "mama-put", left: 0.02, top: 0.6, w: 0.22, h: 0.36 },
    { id: "trader-obalende", left: 0.3, top: 0.42, w: 0.16, h: 0.3 },
    { id: "market-woman", left: 0.62, top: 0.45, w: 0.16, h: 0.3 },
  ],
};

(async () => {
  const manifest = {};
  for (const d of DISTRICTS) {
    const src = path.join(SRC, `${d}.jpeg.jpg`);
    if (!fs.existsSync(src)) {
      console.log(`SKIP ${d}: source missing`);
      continue;
    }
    const img = sharp(src);
    const meta = await img.metadata();
    // hero: 1600w webp q72; small: 800w webp q66; blur: 24px wide webp -> base64
    await sharp(src).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 72 }).toFile(path.join(OUT, `${d}-1600.webp`));
    await sharp(src).resize({ width: 800, withoutEnlargement: true }).webp({ quality: 66 }).toFile(path.join(OUT, `${d}-800.webp`));
    const blurBuf = await sharp(src).resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
    const heroBytes = fs.statSync(path.join(OUT, `${d}-1600.webp`)).size;
    manifest[d] = {
      hero: `/districts/opt/${d}-1600.webp`,
      small: `/districts/opt/${d}-800.webp`,
      blur: `data:image/webp;base64,${blurBuf.toString("base64")}`,
      width: meta.width,
      height: meta.height,
      heroBytes,
    };
    console.log(`${d}: ${meta.width}x${meta.height} -> ${(heroBytes / 1024).toFixed(0)}KB webp`);
    // portrait crops (256px webp)
    for (const c of CROPS[d] ?? []) {
      const left = Math.round(c.left * meta.width);
      const top = Math.round(c.top * meta.height);
      const w = Math.round(c.w * meta.width);
      const h = Math.round(c.h * meta.height);
      await sharp(src).extract({ left, top, width: w, height: h }).resize({ width: 256, height: 256, fit: "cover" }).webp({ quality: 70 }).toFile(path.join(OUT, `${c.id}.webp`));
      console.log(`  crop ${c.id}: ${left},${top} ${w}x${h}`);
    }
  }
  fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log("manifest.json written");
})().catch((e) => { console.error(e); process.exit(1); });
