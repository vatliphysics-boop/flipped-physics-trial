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
  const stats = [];
  for (const [index, scene] of scenes.entries()) {
    const active = await readFrames(mp4, scene.from + 18, 28);
    const deltas = active.slice(1).map((frame, i) => delta(active[i], frame));
    const even = median(deltas.filter((_, i) => i % 2 === 0));
    const odd = median(deltas.filter((_, i) => i % 2 === 1));
    assert(even > .001 && odd > .001, `${code}/${index + 1} low motion on one cadence: ${even} ${odd}`);
    const hold = await readFrames(mp4, scene.from + 90, 4);
    assert(delta(hold[0], hold[1]) < Math.max(even, odd), `${code}/${index + 1} expected hold`);
    let cut;
    if (index > 0) {
      const boundary = await readFrames(mp4, scene.from - 2, 5);
      cut = Math.max(...boundary.slice(1).map((frame, i) => delta(boundary[i], frame)));
      assert(cut > 1, `${code}/${index + 1} expected a cut`);
    }
    stats.push({ startSeconds: scene.from / FPS, rendered: scene.motionFrames, medianEvenDifference: even.toFixed(4), medianOddDifference: odd.toFixed(4), cutDifference: cut?.toFixed(2) });
  }
  await writeFile(join(evidence, "motion.json"), JSON.stringify(stats, null, 2) + "\n");
  console.log(code, JSON.stringify(stats));
}
