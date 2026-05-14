/**
 * Extracts N frames from the hero video and saves them to public/frames/
 * Run with: node scripts/extract-frames.mjs
 */

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const VIDEO_PATH  = join(ROOT, "src/imports/Spinning_around_central_tree_202605051615.mp4");
const OUTPUT_DIR  = join(ROOT, "public/frames");
const NUM_FRAMES  = 90;
const QUALITY     = 85;  // JPEG quality (0-100)

async function main() {
  console.log("Loading ffmpeg wasm...");

  const ffmpeg = new FFmpeg();

  const coreURL = `file://${join(ROOT, "node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.js")}`;
  const wasmURL = `file://${join(ROOT, "node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.wasm")}`;

  await ffmpeg.load({ coreURL, wasmURL });

  console.log("Writing video to ffmpeg virtual FS...");
  const videoData = readFileSync(VIDEO_PATH);
  await ffmpeg.writeFile("input.mp4", videoData);

  // Get video duration via ffprobe-like probe
  let duration = 0;
  ffmpeg.on("log", ({ message }) => {
    const m = message.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
    if (m) duration = parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3]);
  });

  // Probe duration
  await ffmpeg.exec(["-i", "input.mp4"]).catch(() => {});
  console.log(`Video duration: ${duration.toFixed(2)}s`);

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`Extracting ${NUM_FRAMES} frames...`);

  // Extract exactly NUM_FRAMES frames evenly spaced
  // Using fps filter: fps=NUM_FRAMES/duration gives exactly NUM_FRAMES total
  const fps = NUM_FRAMES / duration;

  await ffmpeg.exec([
    "-i", "input.mp4",
    "-vf", `fps=${fps.toFixed(6)}`,
    "-vframes", String(NUM_FRAMES),
    "-q:v", String(Math.round(31 - (QUALITY / 100) * 30)), // ffmpeg quality scale inverted
    "-f", "image2",
    "frame_%03d.jpg",
  ]);

  // Read all generated frames and write to output dir
  let written = 0;
  for (let i = 1; i <= NUM_FRAMES; i++) {
    const name = `frame_${String(i).padStart(3, "0")}.jpg`;
    try {
      const data = await ffmpeg.readFile(name);
      const outPath = join(OUTPUT_DIR, name);
      writeFileSync(outPath, data);
      written++;
      if (i % 10 === 0) console.log(`  ${i}/${NUM_FRAMES} frames written`);
    } catch {
      console.warn(`  Warning: frame ${name} not found`);
    }
  }

  console.log(`\nDone! ${written} frames saved to public/frames/`);
  console.log("You can now deploy to Vercel — frames will be served as static assets.");
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
