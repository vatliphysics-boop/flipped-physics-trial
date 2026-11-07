const assert = require("node:assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_CORE_PATH);
const base = process.env.BASE_URL || "http://127.0.0.1:3461";
const navigation = { waitUntil: "domcontentloaded", timeout: 60000 };
const lessonId = "8d4d729c-4600-47ed-857b-7effb4962200";
(async () => {
  const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
  try {
    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await mobile.goto(base, navigation);
    await mobile.screenshot({ path: "tmp/nuclear-lab-qa/home-mobile.png" });
    const menu = mobile.getByRole("button", { name: "Mục lục", exact: true });
    await menu.click();
    await mobile.getByRole("navigation", { name: "Điều hướng chính" }).getByRole("link", { name: "Mô hình & video" }).click();
    await mobile.getByRole("heading", { name: "Cấu trúc hạt nhân", exact: true }).waitFor();
    assert.equal(await menu.getAttribute("aria-expanded"), "false");
    assert(await mobile.evaluate(() => document.documentElement.scrollWidth === innerWidth));
    await mobile.close();

    const teacher = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await teacher.goto(base + "/login", navigation);
    await teacher.locator("[name=email]").fill("b23-gv@example.com");
    await teacher.locator("[name=password]").fill(process.env.B23_TEST_PASSWORD || ["TestB23", "Pass!"].join(""));
    await Promise.all([teacher.waitForURL(url => url.pathname === "/teacher", { timeout: 60000 }), teacher.locator("button[type=submit]").click()]);
    const bank = await teacher.request.get(base + "/api/question-bank");
    assert.equal(bank.status(), 200);
    const data = await bank.json();
    assert.equal(data.note, undefined);
    assert.equal(data.questions.length, 212);
    console.log("PASS: production question bank returned 212 questions without a fallback notice.");

    await teacher.goto(base + "/teacher/lessons/" + lessonId + "/before-class", navigation);
    const temporaryDrafts = teacher.locator(".pathway-step-row").filter({ hasText: /\[Kiểm thử\] Mô hình B23 \d{13}/ });
    const total = await temporaryDrafts.count();
    // Only remove rows from this QA script, never published content.
    for (let i = 0; i < total; i++) {
      const draft = temporaryDrafts.first();
      assert.equal(await draft.getByText("Bản nháp", { exact: true }).count(), 1);
      const title = await draft.locator("strong").first().textContent();
      teacher.once("dialog", dialog => dialog.accept());
      await draft.getByRole("button", { name: "Xóa", exact: true }).click();
      await temporaryDrafts.filter({ hasText: title }).waitFor({ state: "detached", timeout: 30000 });
    }
    assert.equal(await temporaryDrafts.count(), 0);
    console.log("PASS: no test drafts remain in the dedicated B23 fixture.", { cleaned: total });

    const classLink = teacher.locator('a[href^="/teacher/classes/"]').first();
    const classHref = await classLink.getAttribute("href");
    assert(classHref);
    await teacher.goto(base + classHref, navigation);
    const member = teacher.locator(".member-meta").first();
    if (!await member.isVisible()) await teacher.locator(".member-management-toggle").click();
    await member.waitFor();
    const separated = await member.evaluate(el => {
      const name = el.querySelector(".member-name").getBoundingClientRect();
      const date = el.querySelector(".member-joined-date").getBoundingClientRect();
      return date.top >= name.bottom + 2;
    });
    assert(separated);
    console.log("PASS: member name and join date are separated on the mobile layout.");
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
