/** Read-only production smoke: public lesson and teacher material preview. */
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_CORE_PATH || "playwright-core");
const base = process.env.BASE_URL || "http://127.0.0.1:3476";
const artifacts = path.resolve(process.env.ARTIFACT_DIR || "tmp/nuclear-voice/browser");
const plan = JSON.parse(await readFile(process.env.TIMING_MANIFEST || "tmp/nuclear-voice/process-narration-timing.json", "utf8"));
const codes = (process.env.VIDEO_CODES || "B21 B22 B23 B24 B25").split(/\s+/);
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
await mkdir(artifacts, { recursive: true });
const report = [];
const navigation = { waitUntil: "domcontentloaded", timeout: 60000 };

async function verifyPlayer(page, scope, code, surface, width) {
  await scope.getByRole("button", { name: new RegExp(`Mở video ${code}`) }).click();
  const player = scope.getByLabel(new RegExp(`^Video ${code} ·`));
  await player.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector("video")?.readyState >= 1);
  assert(await player.evaluate(v => v.paused && !v.autoplay && v.controls && v.playsInline), "Must wait for user play");
  const expected = plan.lessons[code].scenes.reduce((sum, s) => sum + s.durationFrames, 0) / plan.fps;
  const result = await player.evaluate(async (video, expectedSeconds) => {
    const assertLocal = (ok, message) => { if (!ok) throw new Error(message); };
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const seek = async seconds => {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Seek timed out")), 10000);
        video.addEventListener("seeked", () => { clearTimeout(timeout); resolve(); }, { once: true });
        video.currentTime = seconds;
      });
      assertLocal(Math.abs(video.currentTime - seconds) < 0.15, "Seek drift");
    };
    assertLocal(Math.abs(video.duration - expectedSeconds) < 0.08, "Stale video duration");
    const context = new AudioContext();
    const source = context.createMediaElementSource(video);
    const analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    analyser.connect(context.destination);
    await context.resume();
    video.muted = false;
    video.volume = 0.7;
    await video.play();
    await sleep(1600);
    const samples = new Float32Array(analyser.fftSize);
    let peakRms = 0;
    for (let i = 0; i < 15; i++) {
      analyser.getFloatTimeDomainData(samples);
      peakRms = Math.max(peakRms, Math.sqrt(samples.reduce((s, v) => s + v * v, 0) / samples.length));
      await sleep(40);
    }
    assertLocal(peakRms > 0.002, "No decoded speech signal: " + JSON.stringify({
      currentTime: video.currentTime, paused: video.paused, readyState: video.readyState,
      audioBytes: video.webkitAudioDecodedByteCount, context: context.state, muted: video.muted,
      error: video.error?.message, source: video.currentSrc,
    }));
    assertLocal(video.currentTime > 1, "Video did not advance");
    video.pause();
    const pausedAt = video.currentTime;
    await sleep(150);
    assertLocal(Math.abs(video.currentTime - pausedAt) < 0.05, "Pause did not stop");
    video.muted = true;
    video.volume = 0.25;
    assertLocal(video.muted && video.volume === 0.25, "Mute/volume failed");
    video.muted = false;
    video.volume = 0.7;
    const track = video.textTracks[0];
    assertLocal(Boolean(track), "Missing Vietnamese caption track");
    track.mode = "hidden";
    await seek(video.duration / 2);
    await sleep(150);
    for (let i = 0; !track.cues?.length && i < 20; i++) await sleep(100);
    assertLocal(track.cues?.length > 0, "VTT failed to load");
    const cueCount = track.cues.length;
    await seek(video.duration - 2.5);
    await video.play();
    await sleep(300);
    assertLocal(!video.paused && video.currentTime > video.duration - 2.4, "Near-end resume failed");
    video.pause();
    await seek(video.duration / 2);
    await context.close();
    return { duration: video.duration, peakRms, cueCount, nearEndSeek: true, controls: true,
      noAutoplay: true, pause: true, mute: true, volume: true };
  }, expected);
  assert.equal(result.cueCount, plan.lessons[code].scenes.reduce((sum, s) => sum + s.cues.length, 0));
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Horizontal page overflow");
  const bounds = await player.boundingBox();
  assert(bounds && bounds.x >= 0 && bounds.x + bounds.width <= width + 1, "Player outside viewport");
  await page.screenshot({ path: path.join(artifacts, `${surface}-${code.toLowerCase()}-${width}.png`) });
  report.push({ surface, code, width, ...result });
  console.log(`PASS ${surface} ${code} ${width}px: ${result.duration.toFixed(3)}s, decoded audio RMS ${result.peakRms.toFixed(4)}, ${result.cueCount} cues`);
}

try {
  for (const width of [1366, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width < 500 ? 844 : 900 }, isMobile: width < 500, hasTouch: width < 500 });
    const page = await context.newPage();
    for (const code of codes) {
      const media = [];
      const onRequest = request => { if (request.url().includes("/videos/nuclear-lessons/")) media.push(request.url()); };
      page.on("request", onRequest);
      await page.goto(`${base}/hoc-lieu/phong-hat-nhan?bai=${code}#video`, navigation);
      await page.getByRole("button", { name: new RegExp(`Mở video ${code}`) }).waitFor();
      assert.equal(media.length, 0, "Video fetched before opening");
      await verifyPlayer(page, page, code, "public", width);
      page.off("request", onRequest);
      const response = await page.request.get(`${base}/videos/nuclear-lessons/${code.toLowerCase()}.mp4`, { headers: { Range: "bytes=1000-1999" } });
      assert.equal(response.status(), 206);
      assert.equal((await response.body()).length, 1000);
      assert.match(response.headers()["content-range"], /^bytes 1000-1999\//);
      assert.match(response.headers()["content-type"], /^video\/mp4/);
      assert.match(response.headers()["cache-control"], /max-age=0/);
      report.at(-1).rangeStatus = response.status();
    }
    await page.goto(`${base}/login`, navigation);
    await page.locator("[name=email]").fill(process.env.QA_TEACHER_EMAIL || "b23-gv@example.com");
    await page.locator("[name=password]").fill(process.env.B23_TEST_PASSWORD || ["TestB23", "Pass!"].join(""));
    await Promise.all([page.waitForURL(url => url.pathname === "/teacher", { timeout: 60000 }), page.locator("button[type=submit]").click()]);
    const writes = [];
    page.on("request", request => { if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method())) writes.push(request.url()); });
    for (const code of codes) {
      await page.goto(`${base}/teacher/materials?q=${encodeURIComponent(`Video ${code} ·`)}`, navigation);
      await page.getByRole("button", { name: "Xem trước", exact: true }).first().click();
      const dialog = page.getByRole("dialog");
      await verifyPlayer(page, dialog, code, "teacher-preview", width);
      await dialog.getByRole("button", { name: "Đóng xem trước", exact: true }).click();
    }
    assert.deepEqual(writes, [], "Preview must not submit writes");
    await context.close();
  }
  await writeFile(path.join(artifacts, "report.json"), JSON.stringify({ base, testedAt: new Date().toISOString(), result: report,
    scope: "Decoded audio signal, metadata, native player state and seeks; not a human listening review." }, null, 2) + "\n");
} finally {
  await browser.close();
}
