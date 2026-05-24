// Converts public/frames/*.png → public/frames/*.webp
// Run: node scripts/convert-frames.cjs

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const FRAMES_DIR = path.join(__dirname, "..", "public", "frames");
const QUALITY = 82;
const CONCURRENCY = 4;

async function convertFrame(file) {
  const input = path.join(FRAMES_DIR, file);
  const output = path.join(FRAMES_DIR, file.replace(".png", ".webp"));
  if (fs.existsSync(output)) return { file, skipped: true };
  await sharp(input).webp({ quality: QUALITY, effort: 4 }).toFile(output);
  const inSize  = fs.statSync(input).size;
  const outSize = fs.statSync(output).size;
  return { file, inSize, outSize, saved: ((1 - outSize / inSize) * 100).toFixed(1) };
}

async function main() {
  const files = fs.readdirSync(FRAMES_DIR).filter(f => f.endsWith(".png"));
  console.log(`Converting ${files.length} PNG frames to WebP (quality ${QUALITY})...`);

  let totalIn = 0, totalOut = 0;

  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const batch = files.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(convertFrame));
    for (const r of results) {
      if (r.skipped) { process.stdout.write("s"); continue; }
      totalIn  += r.inSize;
      totalOut += r.outSize;
      process.stdout.write(".");
    }
  }

  console.log(`\nDone. ${(totalIn/1e6).toFixed(1)} MB → ${(totalOut/1e6).toFixed(1)} MB (saved ${((1-totalOut/totalIn)*100).toFixed(1)}%)`);
}

main().catch(console.error);
