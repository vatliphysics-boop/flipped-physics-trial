import { spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import sharp from "sharp";
import { FPS, LESSONS, timeline } from "../../scripts/nuclear-videos/storyboards.mjs";

const workspace = resolve(import.meta.dirname, "../..");
const fromRenderer = createRequire(join(workspace, "scripts/nuclear-videos/package.json"));
const { RenderInternals } = fromRenderer("@remotion/renderer");
const ffmpeg = RenderInternals.getExecutablePath({ type: "ffmpeg", indent: false, logLevel: "error", binariesDirectory: null });
const width = 240;
const height = 135;
const pixelCount = width * height;
async function readFrames(path, start, count) {
  const result = spawnSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-ss", String(start / FPS), "-i", path, "-frames:v", String(count),
    "-vf", `scale=${width}:${height}`, "-q:v", "2", "-f", "image2pipe", "-vcodec", "mjpeg", "pipe:1"], { cwd: dirname(ffmpeg), maxBuffer: 8 * 1024 * 1024 });
  assert.equal(result.status, 0, result.stderr.toString());
  const frames = [];
  const endMarker = Buffer.from([0xff, 0xd9]);
  let from = 0;
  while (from < result.stdout.length) {
    const end = result.stdout.indexOf(endMarker, from);
    assert(end > from, "JPEG frame missing end marker");
    frames.push(result.stdout.subarray(from, end + 2));
    from = end + 2;
  }
  assert.equal(frames.length, count);
  return Promise.all(frames.map(async frame => {
    const pixels = await sharp(frame).greyscale().raw().toBuffer();
    assert.equal(pixels.length, pixelCount);
    return pixels;
  }));
}
function delta(left, right) {
  let sum = 0;
  for (let i = 0; i < left.length; i++) sum += Math.abs(left[i] - right[i]);
  return sum / left.length;
}
function median(values) {
  return values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
}
for (const code of process.argv.slice(2)) {
  const key = code.toLowerCase();
  const mp4 = join(workspace, "public/videos/nuclear-lessons", `${key}.mp4`);
  const evidence = join(import.meta.dirname, key);
  const scenes = timeline(LESSONS[code]);
  const meta = JSON.parse(await readFile(join(evidence, "metadata.json")));
  assert.equal(meta.renderedMotionFrames, scenes.reduce((n, scene) => n + scene.motionFrames, 0));
  const results = [];
  for (const scene of scenes) {
    const frames = await readFrames(mp4, scene.from, scene.motionFrames);
    const reference = frames.at(-1);
    const fixedRegionDifference = frames.map(frame => Math.max(
      delta(frame.subarray(0, width * 17), reference.subarray(0, width * 17)),
      delta(frame.subarray(width * 113), reference.subarray(width * 113)),
    ));
    const damaged = fixedRegionDifference.flatMap((value, index) => value > 4 ? [index] : []);
    results.push({seconds:scene.from / FPS, frames:frames.length, maxDifference:Math.max(...fixedRegionDifference).toFixed(2), damaged});
  }
  await writeFile(join(evidence, "integrity.json"), JSON.stringify(results, null, 2) + "\n");
  console.log(code, JSON.stringify(results));
  if (results.some(scene => scene.damaged.length > 0)) process.exitCode = 1;
}
