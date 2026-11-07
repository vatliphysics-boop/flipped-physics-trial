import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_CORE_PATH);
const base = process.env.BASE_URL || "http://localhost:3000";
const artifacts = process.env.ARTIFACT_DIR || "docs/previews/physics-process";
const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
try {
  for (const width of (process.env.QA_WIDTHS || "320,390,768,1366").split(",").map(Number)) {
    const page = await browser.newPage({ viewport: { width, height: width > 800 ? 950 : 844 }, isMobile: width < 400, hasTouch: width < 400 });
    page.setDefaultTimeout(16000);
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    const response = await page.goto(`${base}/hoc-lieu/phong-hat-nhan?bai=B21`, { waitUntil: "domcontentloaded", timeout: 60000 });
    assert.equal(response.status(), 200);
    const lab = page.locator("[data-rutherford-lab]").first();
    await lab.waitFor();
    await page.evaluate(() => document.fonts.ready);
    const clock = lab.locator("[data-rutherford-time]");
    const result = lab.locator("[data-rutherford-result]");
    const time = async () => Number((await clock.innerText()).replace(",", ".").match(/[\d.]+/)[0]);
    await lab.getByRole("button", { name: "Tiến 1 bước", exact: true }).click();
    await page.waitForFunction(() => document.querySelector("[data-rutherford-time]").textContent.includes("0,5"));
    await lab.getByRole("button", { name: "Tiếp tục", exact: true }).click();
    await lab.getByRole("button", { name: "Tạm dừng", exact: true }).click();
    const stopped = await time();
    await page.waitForTimeout(220);
    assert.equal(await time(), stopped);
    await lab.getByLabel("Tốc độ phát").selectOption("2");
    await lab.getByRole("button", { name: "Tiếp tục", exact: true }).click();
    await result.getByText(/Hai hạt đã tới màn/).waitFor();
    assert.equal(await lab.locator("svg polyline").count(), 2);
    for (const text of ["18°", "109,8°", "49,5°", "113,1°", "105,3 fm", "31,6 fm"]) {
      assert.equal(await lab.getByText(text, { exact: true }).count(), 1, text);
    }
    const exercise = lab.locator("..");
    const formula = exercise.getByText("Cách tính góc và giới hạn mô hình", { exact: true });
    await formula.click();
    assert.equal(await formula.locator("..").locator(".katex").count(), 1);
    const formulaGeometry = await formula.locator("..").locator(".latex-math-block").evaluate(wrapper => {
      const text = wrapper.querySelector(".katex-html").getBoundingClientRect();
      const bounds = wrapper.getBoundingClientRect();
      return { expression: text.width, available: bounds.width, fits: text.left >= bounds.left - 1 && text.right <= bounds.right + 1 };
    });
    assert(formulaGeometry.fits, JSON.stringify(formulaGeometry));
    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    assert.equal(pageWidth, width);
    if (width === 390 || width === 1366) {
      const figure = lab.locator("figure");
      await figure.evaluate(el => el.scrollIntoView({ block: "center", behavior: "instant" }));
      await figure.screenshot({ path: `${artifacts}/b21-rutherford-${width}.png` });
    }
    if (width === 390) {
      for (const [i, text] of ["Góc tăng.", "Điện tích dương tập trung trong một hạt nhân rất nhỏ."].entries()) {
        const check = exercise.locator(".physics-check").nth(i);
        await check.getByRole("radio", { name: text, exact: true }).check();
        await check.getByRole("button", { name: "Kiểm tra nhận định", exact: true }).click();
        await check.getByText("Chính xác.", { exact: true }).waitFor();
      }
      assert.equal(await exercise.locator(".physics-checklist .is-done").count(), 2);
      await lab.getByRole("slider", { name: /Tham số va chạm b · B/ }).press("Home");
      assert.equal(await time(), 0);
      await lab.getByRole("button", { name: "Chạy hai điều kiện", exact: true }).click();
      await result.getByText(/Hai hạt đã tới màn/).waitFor();
      assert.equal(await lab.getByText("180°", { exact: true }).count(), 2);
      await lab.getByRole("button", { name: "Đặt lại", exact: true }).click();
      assert.equal(await time(), 0);
      assert.equal(await lab.getByLabel("Tốc độ phát").inputValue(), "1");
      assert.equal(await exercise.locator(".physics-checklist .is-done").count(), 0);
    }
    assert.deepEqual(errors, []);
    console.log(`PASS ${width}px · step, pause/resume, 2×, two measured trajectories and both angle conventions, equation, no page overflow`);
    await page.close();
  }
} finally {
  await browser.close();
}
