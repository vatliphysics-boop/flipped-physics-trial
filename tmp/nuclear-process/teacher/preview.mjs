import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

process.loadEnvFile(".env.local");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_CORE_PATH);
const { createServerClient } = require("@supabase/ssr");
const base = process.env.BASE_URL || "http://127.0.0.1:3475";
const artifact = resolve("tmp/nuclear-process/teacher");
const photos = resolve("docs/previews/physics-process");
const lessons = {
  b21: "Mô phỏng: Thí nghiệm tán xạ hạt alpha Rutherford",
  b22: "Mô phỏng: Phản ứng phân hạch Uranium-235 và phản ứng dây chuyền",
  b23: "Mô phỏng: Khảo sát đồ thị định luật phóng xạ và chu kì bán rã T",
  b24: "Mô phỏng: Sơ đồ chu chuyển năng lượng nhà máy điện hạt nhân",
  b25: "Mô phỏng: Thực hành phân tích dữ liệu phân rã phóng xạ H(t)",
};
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1366, height: 950 }, reducedMotion: "reduce" });
page.setDefaultTimeout(45000);
const writes = [], errors = [], results = [];
await Promise.all([mkdir(artifact, { recursive: true }), mkdir(photos, { recursive: true })]);

async function move(dialog, code) {
  if (code === "b21") {
    const impact = dialog.getByRole("slider", { name: /Tham số va chạm b · A/ });
    await impact.press("Home");
    assert.equal(await impact.inputValue(), "0");
    await dialog.getByRole("button", { name: "Tiến 1 bước", exact: true }).click();
    assert.match(await dialog.locator("[data-rutherford-time]").textContent(), /0,5 zs/);
    return { proof: "Tham số va chạm A = 0 fm, thời gian 0,5 zs", target: dialog.getByRole("img", { name: /Nguồn alpha/ }) };
  }
  if (code === "b22") {
    const condition = dialog.getByRole("combobox", { name: /Điều kiện ban đầu/ });
    await condition.selectOption("none");
    await dialog.getByRole("button", { name: "Bắt đầu thí nghiệm 3D" }).click();
    await dialog.getByText(/Không có phân hạch do neutron tới/).waitFor();
    await condition.selectOption("neutron");
    await dialog.getByRole("button", { name: /Mảnh phân hạch tách ra/ }).click();
    const counts = dialog.locator(".fission-live-counts");
    assert.match(await counts.textContent(), /Y-95.*I-138.*3 neutron/);
    const canvas = dialog.locator(".fission-canvas canvas");
    await canvas.waitFor();
    await dialog.getByRole("button", { name: "Từ trên", exact: true }).click();
    return { proof: "Y-95, I-138 và 3 neutron; xoay 3D", target: dialog.locator(".fission-stage") };
  }
  if (code === "b23") {
    const lab = dialog.locator('[data-process="B23"][data-process-ready="true"]');
    await lab.waitFor();
    const halfLife = lab.getByRole("slider", { name: "Chu kì bán rã T", exact: true });
    await halfLife.press("End");
    assert.equal(await halfLife.inputValue(), "60");
    await lab.getByRole("button", { name: "Từng bước 1 s", exact: true }).click();
    assert.equal(await lab.locator("[data-time]").textContent(), "1.0 s");
    return { proof: "T = 60 s, tiến tới 1 giây", target: lab.getByRole("img", { name: /Lượt seed/ }) };
  }
  if (code === "b24") {
    const rod = dialog.getByRole("slider", { name: /Thanh điều khiển cắm sâu/ });
    await rod.press("End");
    assert.equal(await rod.inputValue(), "100");
    await dialog.getByRole("button", { name: "Tiến một bước", exact: true }).click();
    assert.match(await dialog.locator('[aria-current="step"]').textContent(), /0,6/);
    await dialog.getByRole("button", { name: "Dòng năng lượng", exact: true }).click();
    await dialog.getByRole("button", { name: "Tiến một bước", exact: true }).click();
    await dialog.getByText(/Hai dòng nước không trộn lẫn/).first().waitFor();
    return { proof: "Cắm sâu 100%, chỉ số 0,6; bộ sinh hơi và hai vòng nước", target: dialog.getByRole("img", { name: /Hai vòng nước cách li/ }) };
  }
  const lab = dialog.locator('[data-process="B25"][data-process-ready="true"]');
  await lab.waitFor();
  await lab.getByRole("button", { name: "Hiện đường lí thuyết", exact: true }).click();
  await lab.getByRole("button", { name: "Đối chiếu tại 30 giây", exact: true }).click();
  assert.equal(await lab.locator("[data-theory]").textContent(), "89.79 Bq");
  assert.equal(await lab.locator("tbody tr").count(), 8);
  return { proof: "T = 40 s tại 30 s cho 89,79 Bq; giữ tám dòng SGK", target: lab.getByRole("img", { name: /Bảng 25.1 giữ nguyên/ }) };
}

try {
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => [],
      setAll: async cookies => page.context().addCookies(cookies.map(({ name, value }) => ({ name, value, url: base }))),
    },
  });
  const { error } = await supabase.auth.signInWithPassword({
    email: process.env.QA_TEACHER_EMAIL || "b23-gv@example.com",
    password: process.env.B23_TEST_PASSWORD || ["TestB23", "Pass!"].join(""),
  });
  assert(!error, error?.message);
  page.on("request", request => {
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method())) {
      const url = new URL(request.url());
      writes.push({ method: request.method(), origin: url.origin, path: url.pathname });
    }
  });
  page.on("pageerror", error => errors.push(error.message));
  for (const width of [1366, 390]) {
    await page.setViewportSize({ width, height: 950 });
    for (const [code, title] of Object.entries(lessons)) {
      const url = new URL("/teacher/materials", base);
      url.searchParams.set("q", title);
      await page.goto(url.href, { waitUntil: "domcontentloaded", timeout: 90000 });
      assert.equal(new URL(page.url()).pathname, "/teacher/materials");
      const opener = page.getByRole("button", { name: "Xem trước", exact: true });
      assert.equal(await opener.count(), 1, `${code} must resolve one exact material`);
      await opener.click();
      const dialog = page.getByRole("dialog");
      try { await dialog.waitFor({ timeout: 4000 }); } catch { await opener.click(); await dialog.waitFor(); }
      await dialog.getByRole("heading", { name: title, exact: true }).waitFor();
      const { proof, target } = await move(dialog, code);
      const controlsOutside = await dialog.getByRole("button", { name: /Nộp kết quả|Lưu điểm|Ghi điểm/ }).count();
      assert.equal(controlsOutside, 0);
      assert.equal(await dialog.locator(".katex-error").count(), 0);
      await target.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      const box = await target.boundingBox();
      assert(box && box.x >= 0 && box.x + box.width <= width, `${code}: visualization outside ${width}px viewport`);
      await page.screenshot({ path: join(photos, `teacher-${code}-${width}.png`) });
      await dialog.getByRole("button", { name: "Đóng xem trước", exact: true }).click();
      await dialog.waitFor({ state: "hidden" });
      assert.deepEqual(writes, [], "Preview attempted a non-read HTTP request");
      assert.deepEqual(errors, [], "Preview triggered a page error");
      results.push({ code, width, proof, writes: 0 });
      console.log(`PASS ${code.toUpperCase()} ${width}px: ${proof}; 0 yêu cầu ghi`);
    }
  }
} catch (error) {
  await page.screenshot({ path: join(artifact, "error.png") }).catch(() => {});
  console.error(new URL(page.url()).pathname, writes, errors);
  throw error;
} finally {
  await writeFile(join(artifact, "results.json"), JSON.stringify({ base, results, writes, errors }, null, 2) + "\n");
  await browser.close();
}
