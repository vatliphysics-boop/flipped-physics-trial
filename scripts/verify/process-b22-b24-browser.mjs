/** Read-only browser smoke for the B22 and B24 process simulations. */
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_CORE_PATH || "playwright-core");
const base = process.env.BASE_URL || "http://localhost:3000";
const output = resolve(process.env.ARTIFACT_DIR || "tmp/nuclear-process/b22-b24");
const widths = (process.env.VIEWPORT_WIDTHS || "390 1366").trim().split(/\s+/).map(Number);
assert(widths.length > 0 && widths.every(width => Number.isInteger(width) && width >= 320), "VIEWPORT_WIDTHS phải chứa các độ rộng nguyên từ 320 px.");
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const nav = { waitUntil: "domcontentloaded", timeout: 90000 };
const results = [];
await mkdir(output, { recursive: true });

async function visibleText(scope, name) {
  const label = scope.getByText(name);
  await label.first().waitFor();
}

async function noOverflow(page, width) {
  assert(await page.evaluate(expected => innerWidth === expected && document.documentElement.scrollWidth <= expected, width));
  assert.equal(await page.locator(".katex-error").count(), 0);
}

async function offscreenPause(page, lab, snapshot) {
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  assert(await lab.evaluate(element => {
    const bounds = element.getBoundingClientRect();
    return bounds.bottom <= 0 || bounds.top >= innerHeight;
  }), "Mô phỏng chưa ra ngoài khung nhìn.");
  await lab.getByRole("button", { name: "Tiếp tục", exact: true }).waitFor();
  await page.waitForTimeout(120);
  const paused = await snapshot();
  await page.waitForTimeout(500);
  assert.equal(await snapshot(), paused, "Đồng hồ tiếp tục chạy ngoài khung nhìn.");
  await lab.getByRole("button", { name: "Tiếp tục", exact: true }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(180);
  assert.equal(await snapshot(), paused, "Mô phỏng tự chạy khi quay lại khung nhìn.");
}

async function readableDiagram(svg) {
  const result = await svg.evaluate(element => {
    const bounds = element.getBoundingClientRect();
    const labels = Array.from(element.querySelectorAll("text")).map(text => {
      const rect = text.getBoundingClientRect();
      const matrix = text.getScreenCTM();
      return {
        text: text.textContent,
        actualFont: parseFloat(getComputedStyle(text).fontSize) * Math.hypot(matrix.c, matrix.d),
        withinBounds: rect.left >= bounds.left - 2 && rect.right <= bounds.right + 2 &&
          rect.top >= bounds.top - 2 && rect.bottom <= bounds.bottom + 2,
      };
    });
    return { width: bounds.width, minimumFontPx: Math.min(...labels.map(label => label.actualFont)), labels };
  });
  assert(result.labels.length > 0);
  assert(result.minimumFontPx >= 12.5, `Chữ sơ đồ quá nhỏ: ${result.minimumFontPx.toFixed(2)} px.`);
  assert(result.labels.every(label => label.withinBounds), `Nhãn bị cắt: ${JSON.stringify(result.labels.filter(label => !label.withinBounds))}`);
  return { chartWidthPx: result.width, minimumFontPx: result.minimumFontPx, labelBounds: true };
}

async function b22(page, width) {
  await page.goto(`${base}/hoc-lieu/truc-quan?bai=B22`, nav);
  const lab = page.getByRole("region", { name: "Mô phỏng phân hạch", exact: true });
  const condition = lab.getByRole("combobox", { name: /Điều kiện ban đầu/ });
  await lab.getByRole("button", { name: "Bắt đầu thí nghiệm 3D" }).click();
  await lab.getByRole("button", { name: "Tạm dừng", exact: true }).waitFor();
  await condition.selectOption("none");
  await visibleText(lab, /Không có phân hạch do neutron tới/);
  const clock = lab.getByRole("slider", { name: "Thời điểm phân hạch" });
  assert(await clock.isDisabled());
  await page.waitForTimeout(400);
  assert.equal(await clock.inputValue(), "0");
  await condition.selectOption("neutron");
  await lab.getByRole("button", { name: /Hấp thụ neutron/ }).click();
  await visibleText(lab, /Hạt nhân kích thích: U-236/);
  const beforeRun = await clock.inputValue();
  await lab.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.waitForTimeout(400);
  await lab.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  const paused = await clock.inputValue();
  assert(Number(paused) > Number(beforeRun), "Đồng hồ phân hạch chưa chạy.");
  await page.waitForTimeout(450);
  assert.equal(await clock.inputValue(), paused);
  await lab.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.waitForTimeout(350);
  await offscreenPause(page, lab, () => clock.inputValue());
  await lab.getByRole("button", { name: /Mảnh phân hạch tách ra/ }).click();
  await visibleText(lab, /Y-95 \(39p, 56n\).*I-138 \(53p, 85n\).*3 neutron/);
  const view = lab.getByRole("button", { name: "Từ trên", exact: true });
  const webgl = await view.count() > 0;
  if (webgl) {
    await view.click();
    await lab.locator(".fission-canvas canvas").waitFor();
  }
  await lab.getByText("Tính năng lượng tỏa ra của kênh Y-95 và I-138", { exact: true }).click();
  assert.match(await lab.locator("annotation").last().textContent(), /178\{,\}0/);
  await noOverflow(page, width);
  await lab.locator(".fission-stage").scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.screenshot({ path: join(output, `b22-${width}.png`) });
  await lab.getByRole("button", { name: "Đặt lại thí nghiệm" }).click();
  assert.equal(await clock.inputValue(), "0");
  results.push({ code: "B22", width, absentNeutron: true, paused: true, offscreenPause: true, manualResume: true, reset: true, fissionConserved: true, qMeV: 178.0, webgl });
}

async function b24(page, width) {
  await page.goto(`${base}/hoc-lieu/truc-quan?bai=B24`, nav);
  const lab = page.locator(".physics-lab").filter({ hasText: "Khám phá phản ứng dây chuyền và dòng năng lượng" });
  const rod = lab.getByRole("slider", { name: /Thanh điều khiển cắm sâu/ });
  const step = lab.getByRole("button", { name: "Tiến một bước", exact: true });
  const state = lab.getByRole("status").first();
  await lab.getByRole("button", { name: "Mô phỏng phân hạch", exact: true }).click();
  await lab.getByRole("button", { name: "Tạm dừng", exact: true }).waitFor();
  await rod.press("Home");
  assert.equal(await rod.inputValue(), "0");
  await lab.getByRole("button", { name: "Mô phỏng phân hạch", exact: true }).click();
  await visibleText(lab, /Thế hệ 1\./);
  await lab.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  const paused = await state.textContent();
  await page.waitForTimeout(1400);
  assert.equal(await state.textContent(), paused);
  await lab.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.waitForTimeout(200);
  const chainDiagram = lab.getByRole("img", { name: /Các đường đi quy ước/ });
  await offscreenPause(page, lab, () => chainDiagram.locator("circle").first().getAttribute("cx"));
  await lab.getByRole("button", { name: "Đặt lại mô phỏng" }).click();
  await visibleText(lab, /Thế hệ 0\./);
  for (let i = 0; i < 4; i++) await step.click();
  assert.match(await lab.locator('[aria-current="step"]').textContent(), /3,84/);
  await rod.press("End");
  assert.equal(await rod.inputValue(), "100");
  for (let i = 0; i < 4; i++) await step.click();
  assert.match(await lab.locator('[aria-current="step"]').textContent(), /0,13/);
  const chainLabels = await readableDiagram(chainDiagram);
  await chainDiagram.evaluate(element => element.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.screenshot({ path: join(output, `b24-chain-${width}.png`) });
  await lab.getByRole("button", { name: "Dòng năng lượng", exact: true }).click();
  await lab.getByRole("button", { name: "Chạy dòng năng lượng", exact: true }).click();
  await page.waitForTimeout(300);
  const flowDiagram = lab.getByRole("img", { name: /Hai vòng nước cách li/ });
  await offscreenPause(page, lab, () => flowDiagram.locator('path[stroke="#ffcf99"]').getAttribute("stroke-dasharray"));
  await lab.getByRole("button", { name: "Đặt lại mô phỏng" }).click();
  await step.click();
  await visibleText(lab, /Hai dòng nước không trộn lẫn/);
  await lab.getByRole("button", { name: "Bình ngưng", exact: true }).click();
  await visibleText(lab, /được bơm trở lại bộ sinh hơi/);
  const flowLabels = await readableDiagram(flowDiagram);
  await noOverflow(page, width);
  await flowDiagram.evaluate(element => element.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.screenshot({ path: join(output, `b24-${width}.png`) });
  results.push({ code: "B24", width, raisedRodIndex: 3.84, insertedRodIndex: 0.13, paused: true, offscreenPause: true, manualResume: true, reset: true, separateCircuits: true, chainLabels, flowLabels });
}

try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    try {
      await b22(page, width);
      console.log(`PASS B22 ${width}px`);
      await b24(page, width);
      console.log(`PASS B24 ${width}px`);
    } catch (error) {
      console.error(page.url(), errors);
      await page.screenshot({ path: join(output, `error-${width}.png`) }).catch(() => {});
      throw error;
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
  await writeFile(join(output, "results.json"), JSON.stringify({ base, results }, null, 2) + "\n");
} finally {
  await browser.close();
}
