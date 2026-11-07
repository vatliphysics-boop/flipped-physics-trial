/** Browser QA using the dedicated B23 test accounts and a NEW class labeled QA. */
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_CORE_PATH || "playwright-core");
const base = process.env.BASE_URL || "http://localhost:3000";
const artifact = path.resolve(process.env.ARTIFACT_DIR || "tmp/sgk-phase-qa");
const nav = { waitUntil: "domcontentloaded", timeout: 90000 };
const password = process.env.B23_TEST_PASSWORD || ["TestB23", "Pass!"].join("");
const answerPairs = {
  B21: [["6", "13"], ["6", "7"]],
  B22: [["1", "0"], ["18", "9"]],
  B23: [["2", "32"], ["16", "1"]],
  B24: [["tua-bin", "neutron"], ["máy phát", "phân hạch"]],
  B25: [["40", "độ phóng xạ"], ["20", "3"]],
};
const codes = (process.env.QA_CODES || "B21 B22 B23 B24 B25").split(/\s+/);
const phases = ["before-class", "in-class", "after-class"];
const directAuth = process.env.QA_AUTH_DIRECT === "1";
if (directAuth) process.loadEnvFile(".env.local");
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
await mkdir(artifact, { recursive: true });
const fixtureFile = path.join(artifact, "fixture.json");
let fixture = await readFile(fixtureFile, "utf8").then(JSON.parse).catch(() => ({ lessons: {}, done: [] }));
const checkpoint = () => writeFile(fixtureFile, JSON.stringify(fixture, null, 2));
const sessions = {};

async function session(email, prefix, viewport) {
  const page = await browser.newPage({ viewport });
  sessions[email.split("@")[0]] = page;
  page.setDefaultTimeout(30000);
  page.on("pageerror", error => console.log("PAGEERROR", email.split("@")[0], error.message));
  page.on("response", response => { if(response.status()>=400&&response.url().startsWith(base)) console.log("HTTP",response.status(),new URL(response.url()).pathname); });
  if (directAuth) {
    const { createServerClient } = require("@supabase/ssr");
    const client = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
      cookies: { getAll: () => [], setAll: async cookies => {
        await page.context().addCookies(cookies.map(({ name, value }) => ({ name, value, url: base })));
      } },
    });
    const { error } = await client.auth.signInWithPassword({ email, password });
    assert(!error, error?.message);
    return page;
  }
  await page.goto(base + "/login", nav);
  await page.locator('[name="email"]').fill(email);
  await page.locator('[name="password"]').fill(password);
  await Promise.all([page.waitForURL(url => url.pathname === prefix, nav), page.locator("button[type=submit]").click()]);
  return page;
}

async function moveRange(input, next) {
  await input.evaluate((element, value) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(element, String(value));
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }, next);
}

async function choose(panel, index) {
  const check = panel.locator(".physics-check").last();
  await check.locator("input[type=radio]").nth(index).check();
  await check.getByRole("button", { name: "Kiểm tra nhận định" }).click();
  await check.getByText("Chính xác.", { exact: true }).waitFor();
}

async function interact(card, code) {
  const triggers = {
    B21: /Quan sát lại cấu trúc/i,
    B22: /Kích hoạt va chạm/i,
    B23: /Đặt lại mẫu.*64/,
    B24: /Điều tiết lưu lượng|Chạy sơ đồ|Chạy chu trình/i,
    B25: /Chạy lại phép đo|Chạy lại mô hình/i,
  };
  await card.getByRole("button", { name: triggers[code] }).first().click();
  const details = card.locator("details").filter({ has: card.getByText("Mở Phiếu bài tập định lượng", { exact: false }) }).first();
  const summary = details.locator("summary").first();
  await summary.click();
  const panel = details.locator(".physics-lab").first();
  if (code === "B21") {
    await panel.getByRole("button", { name: /Si-28/ }).click();
    await moveRange(panel.locator('input[type=range]').nth(1), 15);
    await choose(panel, 0);
  } else if (code === "B22") {
    for (const [i, value] of ["17", "8", "1", "1"].entries()) await panel.locator('input[type=number]').nth(i).fill(value);
    await choose(panel, 1);
  } else if (code === "B23") {
    await moveRange(panel.locator('input[type=range]').first(), 60);
    await choose(panel, 1);
  } else if (code === "B24") {
    const slider = panel.locator('input[type=range]').first();
    await moveRange(slider, 0);
    await moveRange(slider, 95);
    await choose(panel, 1);
  } else {
    await panel.getByRole("button", { name: "Hiện đường lí thuyết" }).click();
    await choose(panel, 1);
    await panel.getByRole("button", { name: /Cân bằng phương trình/ }).click();
    const sub = panel.locator(".physics-lab").last();
    await sub.getByRole("button", { name: "Kiểm tra", exact: true }).click();
    await sub.getByRole("button", { name: "Phân rã β⁻", exact: true }).click();
    const numbers = sub.locator('input[type=number]');
    for (const [i, value] of ["14", "6", "14", "7"].entries()) await numbers.nth(i).fill(value);
    await sub.getByRole("button", { name: "Kiểm tra", exact: true }).click();
    await panel.getByRole("button", { name: /Tính Δm/ }).click();
    const options = sub.locator("button").filter({ hasText: /He-4|Fe-56|U-235|C-12|O-16/ });
    await options.nth(1).click();
    await options.nth(2).click();
    await choose(sub, 1);
  }
}

async function submitStep(student, code, phase) {
  const card = student.getByRole("region", { name: "Tiến trình giáo viên giao" }).locator("article").first();
  const token = `QA-HS1-${code}-${phase}`;
  if (await card.getByText("Đã lưu bài nộp", { exact: false }).count()) return token;
  if (phase === "in-class") await interact(card, code);
  const fields = card.locator("textarea");
  for (const [i, text] of ["Mục tiêu và dự đoán; đối chiếu video và mục SGK.", `${token} · Bằng chứng kiểm thử luồng, không dùng làm dữ liệu nghiên cứu.`, "Kiểm tra lại số đọc và hỏi nhóm nếu có khác biệt."].entries()) {
    await fields.nth(i).fill(text);
  }
  const save = card.getByRole("button", { name: "Nộp kết quả bước học" });
  await save.click();
  await card.getByText("Đã lưu bài nộp", { exact: false }).waitFor();
  await student.reload(nav);
  assert((await card.locator("textarea").nth(1).inputValue()).includes(token), `${code} ${phase} persists`);
  return token;
}

async function closePhase(student, answers, testWrong) {
  if (await student.getByText("Em đã hoàn thành chốt kiến thức pha này", { exact: false }).count()) return;
  const form = student.locator("section").filter({ has: student.getByRole("heading", { name: "Chốt kiến thức", exact: true }) }).last().locator("form");
  for (const [i, answer] of answers.entries()) await form.locator("input").nth(i).fill(testWrong && i === 0 ? "sai" : answer);
  if (testWrong) {
    await form.getByRole("button", { name: "Nộp bài", exact: true }).click();
    await form.getByRole("alert").filter({ hasText: "chưa đúng" }).waitFor();
    await form.locator("input").first().fill(answers[0]);
  }
  await form.getByRole("button", { name: "Nộp bài", exact: true }).click();
  await student.getByText("Em đã hoàn thành chốt kiến thức pha này", { exact: false }).waitFor();
}

try {
  const teacher = await session("b23-gv@example.com", "/teacher", { width: 1366, height: 950 });
  if (!fixture.classId) {
    await teacher.goto(base + "/teacher/classes/new", nav);
    await teacher.locator("#name").fill(`[QA] SGK B21–B25 ${Date.now()}`);
    await teacher.locator("#description").fill("Lớp kiểm thử kỹ thuật riêng. Không dùng làm dữ liệu thực nghiệm sư phạm.");
    await Promise.all([
      teacher.waitForURL(url => /\/teacher\/classes\/[0-9a-f-]{36}$/.test(url.pathname), nav),
      teacher.getByRole("button", { name: "Tạo lớp học", exact: true }).click(),
    ]);
    fixture.classId = new URL(teacher.url()).pathname.split("/").at(-1);
    fixture.joinCode = (await teacher.locator(".class-code-value").textContent()).trim();
    await checkpoint();
  }
  const [student, outside] = await Promise.all([
    session("b23-hs1@example.com", "/student", { width: 390, height: 844 }),
    session("b23-hs2@example.com", "/student", { width: 768, height: 900 }),
  ]);
  if (!fixture.joined) {
    await student.goto(base + "/student/classes", nav);
    await student.locator("#join_code").fill(fixture.joinCode);
    await student.getByRole("button", { name: "Tham gia", exact: true }).click();
    await student.getByText(/Tham gia lớp học thành công|Đã tham gia|đã là thành viên/i).first().waitFor();
    fixture.joined = true;
    await checkpoint();
  }
  for (const code of codes) {
    if (fixture.done.includes(code)) continue;
    console.log(`START ${code}`);
    if (!fixture.lessons[code]) {
      const listing = `${base}/teacher/lessons?classId=${fixture.classId}`;
      await teacher.goto(listing, nav);
      const lessonCard = teacher.locator("article.lesson-card").filter({ has: teacher.getByText(code, { exact: true }) });
      await lessonCard.waitFor({ timeout: 45000 });
      const setup = lessonCard.getByRole("button", { name: /Thiết lập bài học/ });
      if (await setup.count()) {
        console.log(code, "setting up from teacher card");
        await setup.click();
        await teacher.waitForURL(url => /^\/teacher\/lessons\/[^/]+$/.test(url.pathname), { timeout: 15000 }).catch(() => {});
        if (!/^\/teacher\/lessons\/[^/]+$/.test(new URL(teacher.url()).pathname)) await teacher.goto(listing, nav);
      }
      if (!/^\/teacher\/lessons\/[^/]+$/.test(new URL(teacher.url()).pathname)) {
        const open = lessonCard.getByRole("link", { name: /Mở bài học/ });
        await open.waitFor({ timeout: 30000 });
        await teacher.goto(new URL(await open.getAttribute("href"), base).href, nav);
      }
      fixture.lessons[code] = new URL(teacher.url()).pathname.split("/").at(-1);
      assert(/^[0-9a-f-]{36}$/.test(fixture.lessons[code]), `Cannot open ${code}`);
      console.log(code, "teacher lesson opened");
      await checkpoint();
    }
    const id = fixture.lessons[code];
    const t = `${base}/teacher/lessons/${id}`;
    const s = `${base}/student/lessons/${id}`;
    for (const phase of phases) {
      await teacher.goto(`${t}/${phase}`, nav);
      const row = teacher.locator(".pathway-step-row").first();
      await row.waitFor();
      console.log(code, phase, "teacher pathway loaded");
      if (await row.getByText("Bản nháp", { exact: true }).count()) {
        if (code === "B21" && phase === "before-class") {
          await row.getByRole("button", { name: "Xem trước" }).click();
          const modal = teacher.getByRole("dialog", { name: /Xem trước/ });
          await modal.getByRole("button", { name: /Mở video B21/ }).click();
          await modal.locator("video").waitFor();
          await modal.getByRole("button", { name: "Đóng xem trước", exact: true }).click();
          await row.getByRole("button", { name: "Chỉnh sửa" }).click();
          const input = teacher.locator("#editor-step-instructions");
          if (!(await input.inputValue()).includes("Kiểm tra LaTeX")) {
            await input.fill((await input.inputValue()) + String.raw`\n\nKiểm tra LaTeX \(N=A-Z\).`.replaceAll("\\n", "\n"));
            await teacher.getByRole("button", { name: /Lưu thay đổi bước học/ }).click();
            await teacher.getByText("Đã lưu thành công", { exact: false }).first().waitFor();
          }
          await teacher.getByRole("button", { name: "Đóng trình soạn thảo" }).click();
        }
        await row.getByRole("button", { name: "Giao cho học sinh" }).click();
        await row.getByText("Đã giao", { exact: true }).waitFor();
      }
    }
    await outside.goto(`${s}/before-class`, nav);
    assert.equal(await outside.getByRole("region", { name: "Tiến trình giáo viên giao" }).count(), 0);
    await student.goto(`${s}/after-class`, nav);
    const current = new URL(student.url()).pathname.split("/").at(-1);
    if (!fixture.progress?.[code]) assert.equal(current, "before-class");
    for (const [index, phase] of phases.entries()) {
      await student.goto(`${s}/${phase}`, nav);
      assert.equal(new URL(student.url()).pathname.split("/").at(-1), phase);
      console.log(code, phase, "student phase opened");
      const token = await submitStep(student, code, phase);
      fixture.progress ??= {};
      fixture.progress[code] = phase;
      await checkpoint();
      console.log(code, phase, "student step saved after reload");
      if (index === 1) {
        const confirmation = student.getByRole("button", { name: "Xác nhận hoàn thành hoạt động chính" });
        if (await confirmation.count()) await confirmation.click();
      }
      if (index < 2) await closePhase(student, answerPairs[code][index], index === 0);
      else {
        const assess = student.locator("section").filter({ has: student.getByRole("heading", { name: "Bài tập & Đánh giá", exact: true }) }).last();
        if (await assess.count()) {
          await assess.locator("input[type=radio]").first().check();
          await assess.locator("input[type=text]").fill("Lời giải tự luận dùng kiểm thử lưu bài.");
          await assess.getByRole("button", { name: "Nộp bài tập" }).click();
          await student.getByText("Bài học đã hoàn tất", { exact: false }).waitFor();
        }
        const reflection = student.locator("form").filter({ has: student.getByRole("button", { name: "Lưu nhật kí học tập" }) });
        for (const [i, text] of ["Bài đã học trong lớp QA", "Điều còn cần kiểm chứng", "Tự đọc lại nguồn"].entries()) await reflection.locator("textarea").nth(i).fill(text);
        await reflection.getByRole("button", { name: "Lưu nhật kí học tập" }).click();
        await student.getByText("Đã lưu nhật kí học tập", { exact: false }).waitFor();
      }
      await teacher.goto(`${t}/ket-qua?phase=${phase.replace("-", "_")}`, nav);
      await teacher.getByText(token, { exact: false }).waitFor();
      if (index === 2) await teacher.screenshot({ path: path.join(artifact, `${code}-ket-qua.png`) });
      console.log(`PASS ${code} ${phase}: học sinh nộp, tải lại giữ dữ liệu, giáo viên đọc đúng minh chứng.`);
    }
    fixture.done.push(code);
    await checkpoint();
  }
  console.log("PASS: class QA only; second student outside the test class cannot access the lessons.");
} catch (error) {
  for (const [label, page] of Object.entries(sessions)) {
    const excerpt = (await page.locator("main").innerText({ timeout: 1500 }).catch(() => "")).slice(0, 3200);
    console.log(label, new URL(page.url()).pathname, fixture.joinCode ? excerpt.replaceAll(fixture.joinCode, "[mã lớp QA]") : excerpt);
    await page.screenshot({ path: path.join(artifact, `error-${label}.png`) }).catch(() => {});
  }
  throw error;
} finally {
  await browser.close();
}
