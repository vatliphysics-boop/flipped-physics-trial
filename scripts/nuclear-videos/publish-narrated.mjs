/** Validate the complete staged collection before updating local served files. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { copyFile, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { RenderInternals } from "@remotion/renderer";
import { captionsVtt, FPS, LESSONS, timeline } from "./storyboards.mjs";

const root = resolve(import.meta.dirname, "../..");
const input = resolve(process.argv[2] || join(root, "tmp/nuclear-voice/rendered"));
const timing = JSON.parse(await readFile(resolve(process.argv[3] || join(root, "tmp/nuclear-voice/process-narration-timing.json")), "utf8"));
const destination = join(root, "public/videos/nuclear-lessons");
const backup = join(root, "tmp/nuclear-voice/backups", new Date().toISOString().replaceAll(":", "-"));
const binary = type => RenderInternals.getExecutablePath({ type, indent: false, logLevel: "error", binariesDirectory: null });
const ffprobe = process.env.FFPROBE_PATH || binary("ffprobe");
const ffmpeg = process.env.FFMPEG_PATH || binary("ffmpeg");
const metadata = {};
const files = [];
const quality = JSON.parse(await readFile(join(root, "tmp/nuclear-voice/media-signal-report.json"), "utf8"));

for (const code of Object.keys(LESSONS)) {
  const key = code.toLowerCase();
  const scenePlan = timeline(LESSONS[code], timing.lessons[code].scenes);
  const frames = scenePlan.at(-1).from + scenePlan.at(-1).duration;
  const file = join(input, `${key}.mp4`);
  const hash = createHash("sha256").update(await readFile(file)).digest("hex");
  assert.equal(quality.lessons?.[code]?.sha256, hash, `${code}: run voice/verify_media.py on the latest MP4 before publishing`);
  const probe = JSON.parse(execFileSync(ffprobe, ["-v", "error", "-show_streams", "-of", "json", file], { cwd: dirname(ffprobe), encoding: "utf8" }));
  const video = probe.streams.find(s => s.codec_type === "video");
  const audio = probe.streams.find(s => s.codec_type === "audio");
  assert(video?.codec_name === "h264" && video.width === 1920 && video.height === 1080 && video.avg_frame_rate === "30/1");
  assert.equal(Number(video.nb_frames), frames);
  assert(audio?.codec_name === "aac" && audio.channels === 1 && Number(audio.sample_rate) === 48000);
  assert.equal(Number(audio.start_time), 0);
  assert(Math.abs(Number(audio.duration) - frames / FPS) <= 1 / FPS);
  assert.equal(await readFile(join(input, `${key}.vi.vtt`), "utf8"), captionsVtt(scenePlan));
  assert((await readFile(join(input, `${key}.jpg`))).length > 1000);
  execFileSync(ffmpeg, ["-v", "error", "-xerror", "-i", file, "-f", "null", "-"], { cwd: dirname(ffmpeg), stdio: "pipe" });
  metadata[code] = { durationSeconds: frames / FPS, fps: FPS, width: 1920, height: 1080,
    audio: "aac", audioSampleRate: 48000, language: "vi-VN", voice: "Kim Thanh", engine: "VieNeu-TTS v3 Turbo",
    captions: scenePlan.reduce((sum, s) => sum + s.cues.length, 0) };
  for (const extension of ["mp4", "vi.vtt", "jpg"]) files.push(`${key}.${extension}`);
  console.log(`Validated ${code}: ${metadata[code].durationSeconds.toFixed(3)} s, H.264 + AAC`);
}

// All outputs passed before touching served assets. Keep original files for rollback.
await mkdir(backup, { recursive: true });
for (const file of files) {
  await copyFile(join(destination, file), join(backup, file));
  await copyFile(join(input, file), join(destination, `${file}.next`));
}
const replaced = [];
try {
  for (const file of files) {
    await rename(join(destination, `${file}.next`), join(destination, file));
    replaced.push(file);
  }
  await writeFile(join(root, "src/data/nuclear-video-metadata.json"), JSON.stringify(metadata, null, 2) + "\n");
} catch (error) {
  for (const file of replaced) await copyFile(join(backup, file), join(destination, file));
  throw error;
} finally {
  for (const file of files) await rm(join(destination, `${file}.next`), { force: true });
}
console.log(`Updated five local videos. Backup: ${backup}`);
