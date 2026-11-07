/**
 * Smoke the public lab and teacher picker with the dedicated B23 fixture.
 * The temporary draft is removed in finally. Use B23_LESSON_ID for test data only.
 */
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_CORE_PATH || "playwright-core");
const base = process.env.BASE_URL || "http://localhost:3000";
const artifacts = path.resolve(process.env.ARTIFACT_DIR || "tmp/nuclear-lab-qa");
const lessonId = process.env.B23_LESSON_ID;
assert(lessonId, "Set B23_LESSON_ID to the dedicated B23 test lesson.");
const password = process.env.B23_TEST_PASSWORD || ["TestB23", "Pass!"].join("");
const teacherRoute = `/teacher/lessons/${lessonId}/before-class`;
const labRoute = "/hoc-lieu/phong-hat-nhan";
const codes = (process.env.VIDEO_CODES || "B21 B22 B23 B24 B25").split(/\s+/);
const navigation = { waitUntil: "domcontentloaded", timeout: 60000 };
const videoMetadata = JSON.parse(await readFile(new URL("../../src/data/nuclear-video-metadata.json", import.meta.url), "utf8"));
const draftTitle = `[Kiểm thử] Mô hình B23 ${Date.now()}`;
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
await mkdir(artifacts, { recursive: true });

async function login(page, email, route) {
  await page.goto(`${base}/login`, navigation);
  await page.locator("[name=email]").fill(email);
  await page.locator("[name=password]").fill(password);
  await Promise.all([
    page.waitForURL(url => url.pathname === route, { timeout: 60000 }),
    page.locator("button[type=submit]").click(),
  ]);
}

async function playAndSeek(player) {
  await player.evaluate(async video => {
    video.muted = true;
    await video.play();
  });
  await player.page().waitForFunction(() => document.querySelector("video[aria-label^='Video B2']")?.currentTime > 0.15);
  const seconds = await player.evaluate(async video => {
    const target = Math.floor(video.duration / 2);
    await new Promise(resolve => {
      video.addEventListener("seeked", resolve, { once: true });
      video.currentTime = target;
    });
    video.pause();
    if (Math.abs(video.currentTime - target) > 1) throw new Error("Sai vị trí tua video.");
    return video.duration;
  });
  const code = await player.evaluate(video => video.currentSrc.match(/\/(b2[1-5])\.mp4(?:[?#]|$)/)?.[1].toUpperCase());
  assert(code && videoMetadata[code], "The player must use a known lesson video");
  assert(Math.abs(seconds - videoMetadata[code].durationSeconds) < 0.1, `Unexpected duration ${seconds}`);
  return seconds;
}

try {
  if (process.env.QA_MODE !== "draft") {
    const viewport = { width: 390, height: 844 };
    const page = await browser.newPage({ viewport, isMobile: true, hasTouch: true });
    for (const code of codes) {
      const media = [];
      const noteRequest = request => { if (request.url().includes("/videos/nuclear-lessons/")) media.push(request.url()); };
      page.on("request", noteRequest);
      await page.goto(`${base}${labRoute}?bai=${code}#video`, navigation);
      await page.getByRole("heading", { name: `Video ${code}`, exact: true }).waitFor();
      assert.equal(media.length, 0, "Player fetched assets before the user opened it.");
      await page.getByRole("button", { name: new RegExp(`Mở video ${code}`) }).click();
      const player = page.getByLabel(new RegExp(`^Video ${code} ·`));
      const seconds = await playAndSeek(player);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: path.join(artifacts, `${code.toLowerCase()}-video-mobile.png`) });
      page.off("request", noteRequest);
      console.log(`PASS: ${code} starts on demand, plays and seeks on mobile (${seconds}s).`);
    }
    await page.close();
  }

  if (process.env.QA_MODE !== "video") {
    const teacher = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const student = await browser.newPage();
    await login(teacher, "b23-gv@example.com", "/teacher");
    await teacher.goto(base + teacherRoute, navigation);
    const rows = teacher.locator(".pathway-step-row");
    await rows.first().waitFor();
    const before = await rows.count();
    const draft = rows.filter({ hasText: draftTitle });
    let saveAttempted = false;

    try {
      await teacher.getByRole("button", { name: "Chọn từ kho học liệu" }).click();
      const picker = teacher.getByRole("dialog", { name: "Chọn học liệu cho bước học" });
      await picker.getByRole("searchbox").fill("Mô hình 3D B23");
      await picker.getByRole("button", { name: "Chọn học liệu này" }).click();
      await picker.locator("#step-title").fill(draftTitle);
      assert.match(await picker.locator("#step-instructions").inputValue(), /uranium-238/);
      await picker.getByRole("button", { name: "Xem trước bước học" }).click();
      const preview = teacher.getByRole("dialog", { name: /Xem trước/ });
      await preview.getByRole("region", { name: /Mô hình hạt nhân/ }).scrollIntoViewIfNeeded();
      await preview.locator("canvas").waitFor({ timeout: 20000 });
      await preview.getByRole("button", { name: "Cắt lớp", exact: true }).click();
      assert.equal(await preview.getByRole("button", { name: "Cắt lớp", exact: true }).getAttribute("aria-pressed"), "true");
      await teacher.screenshot({ path: path.join(artifacts, "teacher-model-preview-mobile.png") });
      await preview.getByRole("button", { name: "Đóng xem trước", exact: true }).click();
      assert.equal(await rows.count(), before);
      assert.equal(await picker.locator("#step-title").inputValue(), draftTitle);
      console.log("PASS: teacher can open the 3D model and cut away the front before saving.");
      saveAttempted = true;
      await picker.getByRole("button", { name: "Lưu bản nháp" }).click();
      await draft.getByText("Bản nháp", { exact: true }).waitFor({ timeout: 30000 });
      await teacher.reload(navigation);
      await draft.getByText("Bản nháp", { exact: true }).waitFor();
      await draft.getByRole("button", { name: "Chỉnh sửa" }).click();
      assert.equal(await teacher.locator("#editor-step-title").inputValue(), draftTitle);
      await teacher.getByRole("button", { name: "Đóng trình soạn thảo" }).click();
      await login(student, "b23-hs1@example.com", "/student");
      await student.goto(`${base}/student/lessons/${lessonId}/before-class`, navigation);
      await student.getByRole("heading", { name: "Tiến trình giáo viên giao" }).waitFor();
      assert.equal(await student.getByText(draftTitle, { exact: true }).count(), 0);
      console.log("PASS: real model previews, no auto-publication, draft persists and stays hidden from the student.");
    } finally {
      if (saveAttempted) {
        await teacher.goto(base + teacherRoute, navigation);
        if (await draft.count()) {
          teacher.once("dialog", dialog => dialog.accept());
          await draft.getByRole("button", { name: "Xóa", exact: true }).click();
          await draft.waitFor({ state: "detached", timeout: 30000 });
          await teacher.reload(navigation);
          assert.equal(await rows.count(), before);
          console.log("RESTORED: B23 fixture draft removed.");
        }
      }
    }

  }

  if (process.env.QA_MODE !== "draft") {
    const teacher = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await login(teacher, "b23-gv@example.com", "/teacher");
    await teacher.goto(base + "/teacher/materials?q=Video%20B21", navigation);
    await teacher.getByRole("button", { name: "Xem trước" }).first().click();
    const player = teacher.getByRole("dialog").getByLabel(/^Video B21 ·/);
    await teacher.getByRole("dialog").getByRole("button", { name: /Mở video B21/ }).click();
    const seconds = await playAndSeek(player);
    console.log(`PASS: teacher plays and seeks the generated MP4 in preview (${seconds}s).`);
  }
} finally {
  await browser.close();
}
