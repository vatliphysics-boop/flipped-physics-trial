import { spawnSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import sharp from "sharp";
import { FPS, LESSONS, timeline } from "../../scripts/nuclear-videos/storyboards.mjs";

const workspace = resolve(import.meta.dirname, "../..");
const fromRenderer = createRequire(join(workspace, "scripts/nuclear-videos/package.json"));
const { RenderInternals } = fromRenderer("@remotion/renderer");
const ffmpeg = RenderInternals.getExecutablePath({ type: "ffmpeg", indent: false, logLevel: "error", binariesDirectory: null });
const toPixels = async input => sharp(input).resize(96, 54).removeAlpha().raw().toBuffer();
function meanDifference(left, right) {
  return left.reduce((sum, value, index) => sum + Math.abs(value - right[index]), 0) / left.length;
}
function readFrame(path, frame) {
  const result = spawnSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-ss", String(frame / FPS), "-i", path, "-frames:v", "1", "-vf", "scale=480:270", "-f", "image2pipe", "-vcodec", "mjpeg", "pipe:1"], { cwd: dirname(ffmpeg) });
  if (result.status !== 0 || result.stdout.length < 1000) throw new Error(`Could not decode frame ${frame}: ${result.stderr.toString()}`);
  return result.stdout;
}
for (const code of process.argv.slice(2)) {
  const key = code.toLowerCase();
  const mp4 = join(workspace, "public/videos/nuclear-lessons", `${key}.mp4`);
  const evidence = join(import.meta.dirname, key);
  const scenes = timeline(LESSONS[code]);
  const frames = await readdir(join(evidence, "decoded"));
  const visual = {};
  for (const [index, scene] of scenes.entries()) {
    const decoded = join(evidence, "decoded", `shot-${String(scene.from / FPS).padStart(2, "0")}s.jpg`);
    const draft = join(evidence, "draft", `f${String(scene.from + scene.motionFrames - 1).padStart(4, "0")}.jpg`);
    const decodedPixels = await toPixels(decoded);
    const error = meanDifference(decodedPixels, await toPixels(draft));
    assert(error < 6, `${code} scene ${index + 1}: image differs from checked draft by ${error.toFixed(2)}`);
    visual[scene.from / FPS] = Number(error.toFixed(2));
    if (index > 0) {
      const before = await toPixels(readFrame(mp4, scene.from - 1));
      const after = await toPixels(readFrame(mp4, scene.from + 1));
      assert(meanDifference(before, after) > 1, `${code} expected a cut near ${scene.from / FPS}s`);
    }
  }
  assert(["start.jpg", "middle.jpg", "end.jpg"].every(f => frames.includes(f)));
  const metadata = JSON.parse(await readFile(join(evidence, "metadata.json")));
  console.log(code, metadata, "draft/output per-shot mean pixel difference", visual);
}
