import { spawn } from "node:child_process";
import { link, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderFrames, renderStill, RenderInternals, selectComposition } from "@remotion/renderer";
import { captionsVtt, FPS, LESSONS, sceneRenderFrames, timeline } from "./storyboards.mjs";

const here = import.meta.dirname;
const root = resolve(here, "../..");
const { values: options, positionals } = parseArgs({
  allowPositionals: true,
  options: { draft: { type: "boolean" }, timing: { type: "string" }, output: { type: "string" }, "qa-dir": { type: "string" } },
});
const draft = options.draft;
const timingPath = options.timing ? resolve(options.timing) : null;
const timing = timingPath ? JSON.parse(await readFile(timingPath, "utf8")) : null;
if (timingPath && (timing?.fps !== FPS || !timing.lessons)) throw new Error(`Manifest lời đọc phải có lessons và fps=${FPS}.`);
const outputDir = options.output ? resolve(options.output) : join(root, timing ? "tmp/nuclear-voice/rendered" : "tmp/nuclear-video-review/rendered-silent");
const qaDir = options["qa-dir"] ? resolve(options["qa-dir"]) : join(root, timing ? "tmp/nuclear-voice/review" : "tmp/nuclear-video-review");
const codes = positionals.length ? [...new Set(positionals.map(code => code.toUpperCase()))] : Object.keys(timing?.lessons ?? LESSONS);
if (codes.some(code => !Object.hasOwn(LESSONS, code))) throw new Error("Chỉ chọn B21, B22, B23, B24 hoặc B25.");
if (codes.length === 0) throw new Error("Chưa có bài nào để dựng.");

const browserExecutable = process.env.CHROME_PATH || null;
const concurrency = Number(process.env.REMOTION_CONCURRENCY || 4);
const port = process.env.REMOTION_PORT ? Number(process.env.REMOTION_PORT) : undefined;
if (port !== undefined && (!Number.isInteger(port) || port < 1024 || port > 65535)) throw new Error("REMOTION_PORT không hợp lệ.");
const binary = (type) => RenderInternals.getExecutablePath({ type, indent: false, logLevel: "error", binariesDirectory: null });
const ffmpeg = process.env.FFMPEG_PATH || binary("ffmpeg");
const ffprobe = process.env.FFPROBE_PATH || binary("ffprobe");

function command(file, params, capture = false) {
  return new Promise((resolveCommand, reject) => {
    const process = spawn(file, params, { cwd: dirname(file), stdio: ["ignore", capture ? "pipe" : "inherit", "inherit"] });
    let stdout = "";
    if (capture) process.stdout.on("data", data => { stdout += data; });
    process.once("error", reject);
    process.once("close", (code, signal) => code === 0 ? resolveCommand(stdout) : reject(new Error(`${file} failed (${code ?? signal})`)));
  });
}

async function probe(file) {
  return JSON.parse(await command(ffprobe, ["-v", "error", "-show_streams", "-show_format", "-of", "json", file], true));
}

async function prepareLesson(code) {
  const voice = timing?.lessons[code];
  if (timing && (!voice?.audioFile || !Array.isArray(voice.scenes))) throw new Error(`${code} chưa có manifest lời đọc và WAV.`);
  const scenes = timeline(LESSONS[code], voice?.scenes);
  const audioFile = voice ? resolve(dirname(timingPath), voice.audioFile) : null;
  if (audioFile) {
    const { streams } = await probe(audioFile);
    const audio = streams.find(stream => stream.codec_type === "audio");
    const totalFrames = scenes.at(-1).from + scenes.at(-1).duration;
    const seconds = Number(audio?.duration);
    const sampleRate = Number(audio?.sample_rate);
    if (!audio || !Number.isFinite(seconds) || !Number.isFinite(sampleRate) ||
        Math.abs(seconds - totalFrames / FPS) > Math.max(2 / sampleRate, 0.00001)) {
      throw new Error(`${code} · WAV không khớp tổng thời lượng ${totalFrames} khung hình.`);
    }
  }
  return { scenes, audioFile, narrationScenes: voice?.scenes ?? null };
}

async function qaFrames(code, scenes, common) {
  const folder = join(qaDir, code.toLowerCase(), draft ? "draft" : "frames");
  await mkdir(folder, { recursive: true });
  const sampleFrames = new Set([0, Math.floor(common.composition.durationInFrames / 2), common.composition.durationInFrames - 1]);
  for (const scene of scenes) {
    sampleFrames.add(scene.from + Math.floor(scene.motionFrames / 2));
    sampleFrames.add(scene.from + scene.motionFrames - 1);
    if (scene.resultFrame !== null) sampleFrames.add(scene.from + scene.resultFrame);
    for (const cue of scene.cues) sampleFrames.add(scene.from + cue.from);
  }
  for (const frame of [...sampleFrames].sort((a, b) => a - b)) {
    await renderStill({ ...common, frame, output: join(folder, `f${String(frame).padStart(4, "0")}.jpg`), imageFormat: "jpeg", jpegQuality: 91, scale: 0.5 });
  }
  console.log(`${code} · ${sampleFrames.size} ảnh kiểm tra trong ${folder}`);
}

async function renderLesson(code, scenes, common, audioFile) {
  const key = code.toLowerCase();
  const temporary = await mkdtemp(join(qaDir, `${key}-render-`));
  try {
    const cached = join(temporary, "motion");
    await mkdir(cached);
    // Compute every 30 fps frame during motion. Only the intentional reading
    // hold can reuse a still. There is no alternate-frame render mode.
    const framesByScene = scenes.map(sceneRenderFrames);
    const renderedFrames = framesByScene.flat();
    const motionCount = scenes.reduce((sum, scene) => sum + scene.motionFrames, 0);
    const cachedFrame = (frame) => join(cached, `${frame}.jpg`);
    await renderFrames({
      ...common,
      outputDir: null,
      frames: renderedFrames,
      concurrency,
      imageFormat: "jpeg",
      jpegQuality: 94,
      muted: true,
      onStart: () => console.log(`${code} · render ${motionCount} khung chuyển động và ${renderedFrames.length - motionCount} khung đổi phụ đề`),
      onFrameUpdate: done => { if (done % 120 === 0) console.log(`${code} · ${done}/${renderedFrames.length}`); },
      onFrameBuffer: (buffer, frame) => writeFile(cachedFrame(frame), buffer),
    });

    // Number every output frame. Hard links hold a rendered still without
    // duplicating JPEG storage. The image demuxer uses one exact 30 fps tick
    // per image, so cue changes never depend on rounded concat durations.
    const sequence = join(temporary, "sequence");
    await mkdir(sequence);
    for (const [index, frames] of framesByScene.entries()) {
      const scene = scenes[index];
      await Promise.all(frames.flatMap((frame, position) => {
        const end = frames[position + 1] ?? scene.from + scene.duration;
        return Array.from({ length: end - frame }, (_, offset) =>
          link(cachedFrame(frame), join(sequence, `${String(frame + offset).padStart(5, "0")}.jpg`))
        );
      }));
    }
    const mp4 = join(temporary, `${key}.mp4`);
    const audioInput = audioFile ? ["-i", audioFile, "-map", "0:v:0", "-map", "1:a:0", "-c:a", "aac", "-b:a", "128k", "-ar", "48000"] : ["-an"];
    await command(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-framerate", String(FPS), "-start_number", "0", "-i", join(sequence, "%05d.jpg"),
      ...audioInput, "-frames:v", String(common.composition.durationInFrames),
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-threads", "4", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4]);
    const metadata = await probe(mp4);
    const stream = metadata.streams.find(candidate => candidate.codec_type === "video");
    const audio = metadata.streams.find(candidate => candidate.codec_type === "audio");
    const { width, height, durationInFrames } = common.composition;
    if (stream?.codec_name !== "h264" || stream.width !== width || stream.height !== height ||
        stream.avg_frame_rate !== `${FPS}/1` || Number(stream.nb_frames) !== durationInFrames) {
      throw new Error(`${code} · MP4 không khớp thông số đã thiết kế`);
    }
    if (audioFile && (audio?.codec_name !== "aac" || Number(audio.sample_rate) !== 48000 ||
        !Number.isFinite(Number(audio.duration)) || Math.abs(Number(audio.duration) - durationInFrames / FPS) > 1 / FPS ||
        Number(audio.start_time) !== 0)) {
      throw new Error(`${code} · Kênh AAC không khớp thời lượng hoặc mốc bắt đầu.`);
    }

    const evidence = join(qaDir, key, "decoded");
    // New audio changes frame times and filenames. Keep only extracts from
    // the staged MP4 being verified.
    await rm(evidence, { recursive: true, force: true });
    await mkdir(evidence, { recursive: true });
    const extractFrame = (name, frame) => command(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-ss", String(frame / FPS), "-i", mp4, "-frames:v", "1",
      "-vf", "scale=960:540", join(evidence, `${name}.jpg`)]);
    for (const [index, scene] of scenes.entries()) {
      const name = `${String(scene.from / FPS).padStart(2, "0")}s`;
      await extractFrame(`transition-${name}`, scene.from + Math.floor(scene.motionFrames / 2));
      await extractFrame(`shot-${name}`, scene.from + Math.max(scene.motionFrames - 1, scene.resultFrame ?? 0));
      if (audioFile) for (const [cueIndex, cue] of scene.cues.entries()) {
        await extractFrame(`caption-${index + 1}-${cueIndex + 1}`, scene.from + cue.from);
      }
    }
    const keyMoments = { "start": 0, "middle": Math.floor(durationInFrames / 2), "end": durationInFrames - 1 };
    for (const [name, frame] of Object.entries(keyMoments)) await extractFrame(name, frame);
    await writeFile(join(outputDir, `${key}.vi.vtt`), captionsVtt(scenes));
    await writeFile(join(outputDir, `${key}.jpg`), await readFile(cachedFrame(scenes[0].motionFrames - 1)));
    await rename(mp4, join(outputDir, `${key}.mp4`));
    await writeFile(join(qaDir, key, "metadata.json"), JSON.stringify({
      codec: stream.codec_name, width, height, fps: FPS, frames: durationInFrames, seconds: Number(metadata.format.duration),
      bytes: Number(metadata.format.size), renderedMotionFrames: motionCount, capturedFrames: renderedFrames.length,
      audio: audio ? { codec: audio.codec_name, sampleRate: Number(audio.sample_rate), channels: audio.channels,
        startSeconds: Number(audio.start_time), durationSeconds: Number(audio.duration) } : null,
      scenes: scenes.map((scene, sceneIndex) => ({
        sceneIndex, from: scene.from, durationFrames: scene.duration, motionFrames: scene.motionFrames,
        cues: scene.cues.map(({ from, duration, text }) => ({ from, duration, text })),
      })),
    }, null, 2) + "\n");
    console.log(`${code} · ${width}×${height}, ${FPS} fps, ${metadata.format.duration} s · ${key}.mp4`);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

const plans = new Map(await Promise.all(codes.map(async code => [code, await prepareLesson(code)])));
await Promise.all([mkdir(outputDir, { recursive: true }), mkdir(qaDir, { recursive: true })]);
let bundleMark = -1;
const serveUrl = await bundle({
  entryPoint: join(here, "film.jsx"), publicDir: join(here, "assets"), enableCaching: false,
  webpackOverride: config => ({ ...config,
    optimization: { ...config.optimization, minimize: false },
    resolve: { ...config.resolve, alias: { ...config.resolve?.alias, "@": join(root, "src") } },
  }),
  onProgress: percent => {
    const mark = Math.floor(percent / 20);
    if (mark > bundleMark) { bundleMark = mark; console.log(`Remotion bundle · ${Math.round(percent)}%`); }
  },
});
try {
  for (const code of codes) {
    const browser = await openBrowser("chrome", { browserExecutable, logLevel: "warn" });
    try {
      const { scenes, audioFile, narrationScenes } = plans.get(code);
      const common = { serveUrl, port, puppeteerInstance: browser, inputProps: { narrationScenes }, logLevel: "warn" };
      const composition = await selectComposition({ ...common, id: code });
      if (draft) await qaFrames(code, scenes, { ...common, composition });
      else await renderLesson(code, scenes, { ...common, composition }, audioFile);
    } finally {
      await browser.close({ silent: true });
    }
  }
} finally {
  await rm(serveUrl, { recursive: true, force: true });
}
