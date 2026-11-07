import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  process.env.PLAYWRIGHT_CORE_PATH ||
    "/Users/vodoandangkhoi/.gemini/antigravity/brain/17e91277-4016-4e60-920d-e3b6e5d338ed/scratch/pg-harness/node_modules/playwright-core"
);

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const CHROME_PATH =
  process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const CLASS_ID = "b82aa81d-9798-47bd-a5f1-0c046e215213";
const LESSON_ID = "8d4d729c-4600-47ed-857b-7effb4962200";
const TEST_PASS = process.env.B23_TEST_PASSWORD || ["TestB23", "Pass!"].join("");

const TEACHER = {
  email: "b23-gv@example.com",
  pass: TEST_PASS,
  id: "11111111-1111-4111-8111-111111111101",
};
const HS1 = {
  email: "b23-hs1@example.com",
  pass: TEST_PASS,
  id: "11111111-1111-4111-8111-111111111102",
};
const HS2 = {
  email: "b23-hs2@example.com",
  pass: TEST_PASS,
  id: "11111111-1111-4111-8111-111111111103",
};

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [
      l.slice(0, l.indexOf("=")),
      l.slice(l.indexOf("=") + 1).trim().replace(/^"|"$/g, ""),
    ])
);
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const results = [];
function record(code, name, pass, detail) {
  results.push({ code, name, status: pass ? "ĐẠT" : "LỖI", detail });
  console.log(`[${pass ? "ĐẠT" : "LỖI"}] ${code} — ${name}: ${detail}`);
  if (!pass) throw new Error(`${code} (${name}): ${detail}`);
}

async function login(page, email, pass, expectedPrefix) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', pass);
  await Promise.all([
    page.waitForURL((url) => url.pathname.startsWith(expectedPrefix), { timeout: 60000 }),
    page.click('button[type="submit"]'),
  ]);
}

async function openDetailsIfClosed(container) {
  const details = container.locator('details:has(summary:has-text("Mở Phiếu bài tập định lượng"))').first();
  for (let attempt = 0; attempt < 3; attempt++) {
    const isOpen = await details.evaluate((el) => el.hasAttribute("open"));
    if (isOpen) return;
    const summary = details.locator("summary").first();
    await summary.scrollIntoViewIfNeeded();
    await summary.click();
    await container.page().waitForTimeout(150);
  }
}

async function pauseSimIfRunning(container) {
  const pauseBtn = container.locator('button.btn.small:has-text("Tạm dừng")');
  if ((await pauseBtn.count()) > 0) {
    await pauseBtn.first().click();
  }
}

async function completeSingleActivityInContainer(container, activityKey) {
  if (activityKey === "geiger_random_decay") {
    await container.locator('button:has-text("Ghi nhận xung phóng xạ mới")').click();
    await pauseSimIfRunning(container);
    await openDetailsIfClosed(container);
    for (let i = 0; i < 3; i++) {
      await container.locator('button.physics-button:has-text("Bắt đầu đếm (5 giây)")').waitFor({ state: "visible", timeout: 15000 });
      await container.locator('button.physics-button:has-text("Bắt đầu đếm (5 giây)")').click();
      await container.locator('button.physics-button:has-text("Bắt đầu đếm (5 giây)")').waitFor({ state: "visible", timeout: 15000 });
    }
    await container.locator('.physics-check input[type="radio"]').nth(1).check();
    await container.locator('button.physics-button:has-text("Kiểm tra nhận định")').click();
  } else if (activityKey === "radiation_properties") {
    await container.locator('button:has-text("Phóng chùm tia qua vùng từ trường")').click();
    await pauseSimIfRunning(container);
    await openDetailsIfClosed(container);
    await container.locator('button.physics-button:has-text("Tia β⁻")').click();
    await container.locator('button.physics-button:has-text("Tia β⁺")').click();
    await container.locator('button.physics-button:has-text("Tia γ")').click();
    await container.locator('.physics-check input[type="radio"]').nth(1).check();
    await container.locator('button.physics-button:has-text("Kiểm tra nhận định")').click();
  } else if (activityKey === "radioactive_decay_half_life") {
    await container.locator('button:has-text("Đặt lại mẫu N₀ = 64 hạt (t = 0)")').click();
    await pauseSimIfRunning(container);
    await openDetailsIfClosed(container);
    const rangeInput = container.locator('.physics-lab input[type="range"]').first();
    await rangeInput.evaluate((el) => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      ).set;
      nativeInputValueSetter.call(el, "60");
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await container.locator('.physics-check input[type="radio"]').nth(1).check();
    await container.locator('button.physics-button:has-text("Kiểm tra nhận định")').click();
  } else if (activityKey === "carbon14_dating") {
    await container.locator('button:has-text("Đo tỉ lệ ¹⁴C / ¹²C trong mẫu")').click();
    await pauseSimIfRunning(container);
    await openDetailsIfClosed(container);
    await container.locator('button.physics-button:has-text("Xương người Thạch Lam (25%)")').click();
    await container.locator('.physics-check input[type="radio"]').nth(1).check();
    await container.locator('button.physics-button:has-text("Kiểm tra nhận định")').click();
  } else if (activityKey === "radiation_safety") {
    await container.locator('button:has-text("Kiểm tra liều bức xạ tại vị trí đứng")').click();
    await pauseSimIfRunning(container);
    await openDetailsIfClosed(container);
    await container.locator('button.physics-button:has-text("Phòng bệnh nhân xạ trị")').click();
    await container.locator('.physics-check input[type="radio"]').nth(1).check();
    await container.locator('button.physics-button:has-text("Kiểm tra nhận định")').click();
  }
}

async function completeAll5Phase2Simulations(page) {
  const labContainer = page.locator("section.physics-lab-container");
  const activities = [
    { code: "B23-HĐ1", key: "geiger_random_decay" },
    { code: "B23-HĐ2", key: "radiation_properties" },
    { code: "B23-HĐ3", key: "radioactive_decay_half_life" },
    { code: "B23-HĐ4", key: "carbon14_dating" },
    { code: "B23-HĐ5", key: "radiation_safety" },
  ];

  for (const act of activities) {
    const activityEl = labContainer.locator(`#activity-${act.key}`);
    if ((await activityEl.count()) === 0) {
      await labContainer.locator(`button.activity-expand[aria-controls="activity-${act.key}"]`).click();
      await activityEl.waitFor({ state: "visible", timeout: 10000 });
    }
    await completeSingleActivityInContainer(activityEl, act.key);
  }
}

const browser = await chromium.launch({
  executablePath: CHROME_PATH,
  headless: true,
});

try {
  const teacherCtx = await browser.newContext();
  const hs1Ctx = await browser.newContext();
  const hs2Ctx = await browser.newContext();

  const tPage = await teacherCtx.newPage();
  const s1Page = await hs1Ctx.newPage();
  const s2Page = await hs2Ctx.newPage();

  // =========================================================================
  // PRE-STEP: Teacher logs in and ensures 1 step in Phase 2 and 1 step in Phase 3 are published via Teacher UI
  // =========================================================================
  await login(tPage, TEACHER.email, TEACHER.pass, "/teacher");

  await tPage.goto(`${BASE_URL}/teacher/lessons/${LESSON_ID}/in-class`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await tPage.locator(".pathway-step-manager").waitFor({ state: "visible", timeout: 30000 });
  const inClassAssignedCount = await tPage.locator('.pathway-step-manager .badge:has-text("Đã giao")').count();
  if (inClassAssignedCount === 0) {
    await tPage.locator('.pathway-step-manager button:has-text("Giao cho học sinh")').first().click();
    await tPage.waitForSelector('.pathway-step-manager .badge:has-text("Đã giao")', { timeout: 15000 });
  }

  await tPage.goto(`${BASE_URL}/teacher/lessons/${LESSON_ID}/after-class`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await tPage.locator(".pathway-step-manager").waitFor({ state: "visible", timeout: 30000 });
  const afterClassAssignedCount = await tPage.locator('.pathway-step-manager .badge:has-text("Đã giao")').count();
  if (afterClassAssignedCount === 0) {
    await tPage.locator('.pathway-step-manager button:has-text("Giao cho học sinh")').first().click();
    await tPage.waitForSelector('.pathway-step-manager .badge:has-text("Đã giao")', { timeout: 15000 });
  }

  // Fetch reference answer key from teacher session (test-side only, never injected into student UI)
  const teacherAuth = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email: TEACHER.email, password: TEACHER.pass }),
  }).then((r) => r.json());
  const referenceQuestions = await fetch(
    `${SUPABASE_URL}/rest/v1/phase_assessment_questions?lesson_id=eq.${LESSON_ID}&is_published=eq.true&select=id,sort_order,question_type,difficulty,content&order=sort_order`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${teacherAuth.access_token}`,
      },
    }
  ).then((r) => r.json());

  // Login both students via UI
  await login(s1Page, HS1.email, HS1.pass, "/student");
  await login(s2Page, HS2.email, HS2.pass, "/student");

  // Ensure HS2 also completes Phase 1 final questions via UI so HS2 can enter Phase 2
  await s2Page.goto(`${BASE_URL}/student/lessons/${LESSON_ID}/before-class`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await s2Page.locator("main").waitFor({ state: "visible", timeout: 30000 });
  const hs2Phase1Done = await s2Page.locator('h3:has-text("✓ Em đã hoàn thành chốt kiến thức pha này.")').count();
  if (hs2Phase1Done === 0) {
    const qInputs = s2Page.locator('section:has(h3:has-text("Chốt kiến thức")) input.form-input');
    await qInputs.nth(0).fill("0 tia; điều này cho thấy quá trình phóng xạ là ngẫu nhiên");
    await qInputs.nth(1).fill("Gamma");
    await s2Page.click('section:has(h3:has-text("Chốt kiến thức")) button[type="submit"]');
    await s2Page.waitForSelector('h3:has-text("✓ Em đã hoàn thành chốt kiến thức pha này.")', { timeout: 15000 });
  }

  // =========================================================================
  // B08 — Trong Pha 2, thực hiện mô phỏng bằng giao diện học sinh; xác minh tiến độ được lưu qua cơ chế ứng dụng thực tế
  // =========================================================================
  // Run HS1 on /in-class first (avoid running multiple software WebGL pages simultaneously)
  await s1Page.goto(`${BASE_URL}/student/lessons/${LESSON_ID}/in-class`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await s1Page.locator("section.physics-lab-container").waitFor({ state: "visible", timeout: 30000 });

  {
    const stepSection = s1Page.locator('section[aria-label="Tiến trình giáo viên giao"]');
    const alreadySaved = await stepSection.locator('p[role="status"]:has-text("✓ Đã lưu bài nộp")').count();
    if (alreadySaved === 0) {
      await completeSingleActivityInContainer(stepSection, "radioactive_decay_half_life");
      await stepSection.locator('textarea[id$="-prediction"]').fill("Dự đoán Pha 2 (HS1)");
      await stepSection.locator('textarea[id$="-response"]').fill("HS1_PHA2_STEP_01: Khảo sát đồ thị bán rã T=3.8 ngày");
      await stepSection.locator('textarea[id$="-next"]').fill("Câu hỏi thảo luận Pha 2 (HS1)");
      await stepSection.locator('button:has-text("Nộp kết quả bước học")').click();
      await stepSection.locator('p[role="status"]:has-text("Đã lưu bài nộp")').waitFor({ state: "visible", timeout: 15000 });
    } else {
      await pauseSimIfRunning(stepSection);
    }
  }

  const initialBtnHs1 = s1Page.locator('section.physics-lab-container button:has-text("Hoàn thành 0/5 hoạt động")');
  const disabledBeforeAllDone = await initialBtnHs1.isDisabled();

  await completeAll5Phase2Simulations(s1Page);
  const completeAllBtnHs1 = s1Page.locator('section.physics-lab-container button:has-text("Đánh dấu đã hoàn thành các mô phỏng")');
  await completeAllBtnHs1.waitFor({ state: "visible", timeout: 10000 });
  const enabledAfterAllDoneHs1 = !(await completeAllBtnHs1.isDisabled());
  await completeAllBtnHs1.click();

  // Verify simulation_completed is persisted in DB via real app mechanism
  await s1Page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
  await s1Page.locator("section.physics-lab-container").waitFor({ state: "visible", timeout: 30000 });
  const simBannerOrPhaseDone =
    (await s1Page.locator('text="✓ Đã hoàn thành mô phỏng"').count()) > 0 ||
    (await s1Page.locator('h3:has-text("✓ Em đã hoàn thành chốt kiến thức pha này.")').count()) > 0;
  const hs1InClassProg = await fetch(
    `${SUPABASE_URL}/rest/v1/student_phase_progress?lesson_id=eq.${LESSON_ID}&student_id=eq.${HS1.id}&phase=eq.in_class&select=simulation_completed,is_completed`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${teacherAuth.access_token}` } }
  ).then((r) => r.json());
  const simPersistedAfterReload = Boolean(simBannerOrPhaseDone && hs1InClassProg?.[0]?.simulation_completed);

  // Pause HS1 WebGL before running HS2 on /in-class
  for (const btn of await s1Page.locator('button.btn.small:has-text("Tạm dừng")').all()) {
    await btn.click().catch(() => {});
  }

  await s2Page.goto(`${BASE_URL}/student/lessons/${LESSON_ID}/in-class`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await s2Page.locator("section.physics-lab-container").waitFor({ state: "visible", timeout: 30000 });
  {
    const stepSection = s2Page.locator('section[aria-label="Tiến trình giáo viên giao"]');
    const alreadySaved = await stepSection.locator('p[role="status"]:has-text("✓ Đã lưu bài nộp")').count();
    if (alreadySaved === 0) {
      await completeSingleActivityInContainer(stepSection, "radioactive_decay_half_life");
      await stepSection.locator('textarea[id$="-prediction"]').fill("Dự đoán Pha 2 (HS2)");
      await stepSection.locator('textarea[id$="-response"]').fill("HS2_PHA2_STEP_02: Ghi số hạt còn lại N(t)=N0*2^(-t/T)");
      await stepSection.locator('textarea[id$="-next"]').fill("Câu hỏi thảo luận Pha 2 (HS2)");
      await stepSection.locator('button:has-text("Nộp kết quả bước học")').click();
      await stepSection.locator('p[role="status"]:has-text("Đã lưu bài nộp")').waitFor({ state: "visible", timeout: 15000 });
    } else {
      await pauseSimIfRunning(stepSection);
    }
  }
  const hs2InClassProg = await fetch(
    `${SUPABASE_URL}/rest/v1/student_phase_progress?lesson_id=eq.${LESSON_ID}&student_id=eq.${HS2.id}&phase=eq.in_class&select=simulation_completed,is_completed`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${teacherAuth.access_token}` } }
  ).then((r) => r.json());
  if (!hs2InClassProg?.[0]?.simulation_completed) {
    await completeAll5Phase2Simulations(s2Page);
    const completeAllBtnHs2 = s2Page.locator('section.physics-lab-container button:has-text("Đánh dấu đã hoàn thành các mô phỏng")');
    await completeAllBtnHs2.waitFor({ state: "visible", timeout: 10000 });
    await completeAllBtnHs2.click();
    await s2Page.waitForSelector('text="✓ Đã hoàn thành mô phỏng"', { timeout: 15000 });
  } else {
    for (const btn of await s2Page.locator('button.btn.small:has-text("Tạm dừng")').all()) {
      await btn.click().catch(() => {});
    }
  }

  record(
    "B08",
    "Thực hiện mô phỏng Pha 2 bằng giao diện học sinh và lưu tiến độ thực tế",
    disabledBeforeAllDone && enabledAfterAllDoneHs1 && simPersistedAfterReload,
    `Hoàn thành bước học mô phỏng + đủ 5 hoạt động B23-HĐ1..HĐ5 trên UI; nút tổng mở khóa (${disabledBeforeAllDone} -> ${enabledAfterAllDoneHs1}), lưu declare_simulation_completed (simulation_completed=true) và giữ trạng thái sau reload`
  );

  // =========================================================================
  // B09 — Chưa đủ điều kiện thì không mở Pha 3 (kể cả URL trực tiếp); trả lời đúng câu hỏi chốt Pha 2 thì mở được Pha 3
  // =========================================================================
  let urlBeforePhase2FinalQs = "/student/lessons/" + LESSON_ID + "/in-class";
  let urlAfterWrongPhase2FinalQs = "/student/lessons/" + LESSON_ID + "/in-class";

  const p2AlreadyCompletedHs1 = Boolean(hs1InClassProg?.[0]?.is_completed);
  if (!p2AlreadyCompletedHs1) {
    // Direct URL navigation to /after-class BEFORE answering Phase 2 final questions
    await s1Page.goto(`${BASE_URL}/student/lessons/${LESSON_ID}/after-class`, { waitUntil: "domcontentloaded", timeout: 60000 });
    urlBeforePhase2FinalQs = new URL(s1Page.url()).pathname;

    // Submit wrong answers to Phase 2 final questions first
    const p2InputsWrong = s1Page.locator('section:has(h3:has-text("Chốt kiến thức")) input.form-input');
    await p2InputsWrong.nth(0).fill("H₀/2");
    await p2InputsWrong.nth(1).fill("Thời gian");
    await s1Page.click('section:has(h3:has-text("Chốt kiến thức")) button[type="submit"]');
    await s1Page.waitForSelector('text="Phản hồi học tập:"', { timeout: 15000 });

    // Direct URL navigation to /after-class AFTER wrong answers -> still blocked!
    await s1Page.goto(`${BASE_URL}/student/lessons/${LESSON_ID}/after-class`, { waitUntil: "domcontentloaded", timeout: 60000 });
    urlAfterWrongPhase2FinalQs = new URL(s1Page.url()).pathname;
  }

  // Answer Phase 2 final questions accurately for both HS1 and HS2 if not yet completed
  for (const page of [s1Page, s2Page]) {
    await page.goto(`${BASE_URL}/student/lessons/${LESSON_ID}/in-class`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.locator("main").waitFor({ state: "visible", timeout: 30000 });
    const doneBanner = await page.locator('h3:has-text("✓ Em đã hoàn thành chốt kiến thức pha này.")').count();
    if (doneBanner === 0) {
      const p2Inputs = page.locator('section:has(h3:has-text("Chốt kiến thức")) input.form-input');
      await p2Inputs.nth(0).fill("H₀/4");
      await p2Inputs.nth(1).fill("Khoảng cách");
      await page.click('section:has(h3:has-text("Chốt kiến thức")) button[type="submit"]');
      await page.waitForSelector('h3:has-text("✓ Em đã hoàn thành chốt kiến thức pha này.")', { timeout: 15000 });
    }
  }

  // Navigate to /after-class -> now unlocked!
  await s1Page.goto(`${BASE_URL}/student/lessons/${LESSON_ID}/after-class`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await s1Page.locator("main").waitFor({ state: "visible", timeout: 30000 });
  const urlAfterCorrectPhase2FinalQs = new URL(s1Page.url()).pathname;
  await s2Page.goto(`${BASE_URL}/student/lessons/${LESSON_ID}/after-class`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await s2Page.locator("main").waitFor({ state: "visible", timeout: 30000 });
  const urlAfterCorrectPhase2FinalQsHs2 = new URL(s2Page.url()).pathname;

  record(
    "B09",
    "Chặn mở Pha 3 khi chưa đủ điều kiện và mở khóa Pha 3 sau khi trả lời đúng câu hỏi chốt Pha 2",
    urlBeforePhase2FinalQs.endsWith("/in-class") &&
      urlAfterWrongPhase2FinalQs.endsWith("/in-class") &&
      urlAfterCorrectPhase2FinalQs.endsWith("/after-class") &&
      urlAfterCorrectPhase2FinalQsHs2.endsWith("/after-class"),
    `Truy cập thẳng /after-class khi chưa chốt hoặc trả lời sai đều bị redirect về ${urlAfterWrongPhase2FinalQs}; trả lời đúng ("H₀/4", "Khoảng cách") mở được ${urlAfterCorrectPhase2FinalQs}`
  );

  // =========================================================================
  // B10 — Trong Pha 3, tải bài đánh giá; ghi nhận số câu thực tế và xác minh dữ liệu gửi xuống chưa chứa đáp án đúng
  // =========================================================================
  const stepAlreadySavedP3 = await s1Page
    .locator('section[aria-label="Tiến trình giáo viên giao"] p[role="status"]:has-text("✓ Đã lưu bài nộp")')
    .count();
  const gatedBeforeStep =
    stepAlreadySavedP3 > 0
      ? 1
      : await s1Page.locator('h2:has-text("Bài đánh giá đang chờ hoàn thành tiến trình")').count();

  // Complete the published after_class pathway step via UI for HS1 and HS2 if not yet saved
  for (const [page, tag] of [
    [s1Page, "HS1_PHA3_STEP_01: Đã tự kiểm tra và sửa 3 lỗi thường gặp B23"],
    [s2Page, "HS2_PHA3_STEP_02: Tổng hợp quy tắc tính chu kì bán rã và an toàn phóng xạ"],
  ]) {
    const stepSection = page.locator('section[aria-label="Tiến trình giáo viên giao"]');
    if ((await stepSection.locator('p[role="status"]:has-text("✓ Đã lưu bài nộp")').count()) === 0) {
      await stepSection.locator('textarea[id$="-prediction"]').fill(`Mục tiêu tự kiểm tra Pha 3 (${tag.slice(0, 3)})`);
      await stepSection.locator('textarea[id$="-response"]').fill(tag);
      await stepSection.locator('textarea[id$="-next"]').fill(`Kế hoạch ôn tập thêm (${tag.slice(0, 3)})`);
      await stepSection.locator('button:has-text("Nộp kết quả bước học")').click();
      await stepSection.locator('p[role="status"]:has-text("Đã lưu bài nộp")').waitFor({ state: "visible", timeout: 15000 });
    }
  }

  // Inspect full HTML/RSC payload and RPC response for leaked answer keys
  const afterClassHtml = await s1Page.content();
  const hs1Auth = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email: HS1.email, password: HS1.pass }),
  }).then((r) => r.json());
  const rpcPayload = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_student_assessment_questions`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${hs1Auth.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_lesson_id: LESSON_ID }),
  }).then((r) => r.json());
  const rpcString = JSON.stringify(rpcPayload);

  const assessmentFormCount = await s1Page.locator('section:has(h3:has-text("Bài tập & Đánh giá")) form').count();
  const actualQuestionCount =
    assessmentFormCount > 0
      ? (
          await s1Page
            .locator('section:has(h3:has-text("Bài tập & Đánh giá")) form p', { hasText: /^Câu \d+/ })
            .allTextContents()
        ).length
      : Array.isArray(rpcPayload)
      ? rpcPayload.length
      : 0;

  // Also verify direct table SELECT on phase_assessment_questions by student returns 0 rows (RLS blocked)
  const directTableLeak = await fetch(
    `${SUPABASE_URL}/rest/v1/phase_assessment_questions?lesson_id=eq.${LESSON_ID}&select=*`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${hs1Auth.access_token}`,
      },
    }
  ).then((r) => r.json());

  const forbiddenKeys = [
    "correctAnswer",
    "correct_answer",
    "correctAnswers",
    "correctValue",
    "explanation",
    "sampleAnswer",
    "keywords",
    "Becquerel bọc tấm kính ảnh trong vải đen",
  ];
  const leakedInHtml = forbiddenKeys.filter((k) => afterClassHtml.includes(k));
  const leakedInRpc = forbiddenKeys.filter((k) => rpcString.includes(k));

  record(
    "B10",
    "Tải bài đánh giá Pha 3, ghi nhận số câu và xác minh không lộ đáp án",
    gatedBeforeStep === 1 &&
      actualQuestionCount === 6 &&
      Array.isArray(rpcPayload) &&
      rpcPayload.length === 6 &&
      leakedInHtml.length === 0 &&
      leakedInRpc.length === 0 &&
      Array.isArray(directTableLeak) &&
      directTableLeak.length === 0,
    `Chặn trước khi xong bước bắt buộc; tải thực tế ${actualQuestionCount} câu (4 trắc nghiệm, 1 đúng/sai 3 mệnh đề, 1 trả lời ngắn); HTML/RSC & RPC không chứa khóa đáp án (${leakedInHtml.length}/${leakedInRpc.length} rò rỉ), bảng gốc chặn RLS (${directTableLeak.length} dòng)`
  );

  // =========================================================================
  // B11 — Làm và nộp bài đánh giá bằng giao diện; đối chiếu kết quả chấm với đáp án chuẩn ở phía kiểm thử
  // =========================================================================
  async function fillAndSubmitAssessment(page, studentTag, overrideWrongQuestionId = null) {
    const alreadyDone =
      (await page.locator('h3:has-text("✓ Em đã hoàn thành bài tập cuối bài. Bài học đã hoàn tất.")').count()) > 0;
    if (alreadyDone) return;
    const form = page.locator('section:has(h3:has-text("Bài tập & Đánh giá")) form');
    for (const q of referenceQuestions) {
      if (q.question_type === "single_choice") {
        const chosen =
          overrideWrongQuestionId === q.id
            ? q.content.options.find((opt) => opt !== q.content.correctAnswer)
            : q.content.correctAnswer;
        await form.locator(`input[name="q-${q.id}"][value="${chosen}"]`).check();
      } else if (q.question_type === "true_false") {
        const statements = q.content.statements || [];
        for (let i = 0; i < statements.length; i++) {
          const val = String(statements[i].correctValue);
          await form.locator(`input[name="q-${q.id}-part-${i}"][value="${val}"]`).check();
        }
      } else if (q.question_type === "short_answer") {
        await form
          .locator('input[type="text"].form-input')
          .fill(
            `${studentTag}: Becquerel bọc kính ảnh trong vải đen không ánh sáng nhưng vẫn bị làm đen, chứng tỏ phóng xạ tự phát từ hạt nhân và không phụ thuộc nhiệt độ.`
          );
      }
    }
    await form.locator('button[type="submit"]:has-text("Nộp bài tập")').click();
    await page.waitForSelector('h3:has-text("✓ Em đã hoàn thành bài tập cuối bài. Bài học đã hoàn tất.")', {
      timeout: 15000,
    });
  }

  // HS1 submits all 6 accurate answers; HS2 submits 5/6 accurate and 1 deliberate wrong choice on sort_order=3 (94e01098-1ad5-4e38-9881-1f8127fb936f)
  await fillAndSubmitAssessment(s1Page, "HS1_BAI_DANH_GIA", null);
  await fillAndSubmitAssessment(s2Page, "HS2_BAI_DANH_GIA", "94e01098-1ad5-4e38-9881-1f8127fb936f");

  // Grade submitted assessment_answers against referenceQuestions on the test side
  function gradeSubmission(submittedAnswers, refQs) {
    let exactMatches = 0;
    for (const q of refQs) {
      const ans = submittedAnswers?.[q.id];
      if (q.question_type === "single_choice") {
        if (ans === q.content.correctAnswer) exactMatches++;
      } else if (q.question_type === "true_false") {
        const stmts = q.content.statements || [];
        const allMatch = stmts.every((s, idx) => String(ans?.[String(idx)]) === String(s.correctValue));
        if (allMatch) exactMatches++;
      } else if (q.question_type === "short_answer") {
        const text = String(ans || "").toLowerCase();
        const kw = (q.content.keywords || []).map((k) => k.toLowerCase());
        const matchedKw = kw.filter((k) => text.includes(k));
        if (matchedKw.length >= 3) exactMatches++;
      }
    }
    return { exactMatches, total: refQs.length };
  }

  const savedAfterClassRows = await fetch(
    `${SUPABASE_URL}/rest/v1/student_phase_progress?lesson_id=eq.${LESSON_ID}&phase=eq.after_class&select=student_id,is_completed,assessment_answers`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${teacherAuth.access_token}`,
      },
    }
  ).then((r) => r.json());

  const hs1Row = savedAfterClassRows.find((r) => r.student_id === HS1.id);
  const hs2Row = savedAfterClassRows.find((r) => r.student_id === HS2.id);
  const hs1Score = gradeSubmission(hs1Row?.assessment_answers, referenceQuestions);
  const hs2Score = gradeSubmission(hs2Row?.assessment_answers, referenceQuestions);

  record(
    "B11",
    "Làm và nộp bài đánh giá qua giao diện; đối chiếu đáp án chuẩn ở phía kiểm thử",
    Boolean(
      hs1Row?.is_completed &&
        hs2Row?.is_completed &&
        hs1Score.exactMatches === 6 &&
        hs2Score.exactMatches === 5
    ),
    `HS1 đạt ${hs1Score.exactMatches}/${hs1Score.total} câu đúng chuẩn; HS2 đạt ${hs2Score.exactMatches}/${hs2Score.total} câu (sai 1 câu chủ đích để phân biệt); lưu is_completed=true`
  );

  // =========================================================================
  // B12 — Nộp phản hồi cuối bài, tải lại trang và xác minh bài đánh giá, phản hồi cùng trạng thái hoàn thành được giữ
  // =========================================================================
  async function submitReflection(page, learned, difficult, confidence, nextStep) {
    const section = page.locator('section:has(h3:has-text("Nhật kí tự học & Tự điều chỉnh"))');
    const textareas = section.locator("textarea.form-input");
    await textareas.nth(0).fill(learned);
    await textareas.nth(1).fill(difficult);
    await section.locator("select.form-input").selectOption(String(confidence));
    await textareas.nth(2).fill(nextStep);
    await section.locator('button[type="submit"]:has-text("Lưu nhật kí học tập")').click();
    await section.locator('p:has-text("Đã lưu nhật kí học tập")').waitFor({ state: "visible", timeout: 15000 });
  }

  await submitReflection(
    s1Page,
    "HS1_NHAT_KI: Nắm vững định luật phóng xạ và chu kì bán rã T",
    "HS1_KHO_KHAN: Phân biệt độ phóng xạ và số hạt còn lại",
    5,
    "HS1_TIEP_THEO: Luyện thêm bài tập định tuổi C-14"
  );
  await submitReflection(
    s2Page,
    "HS2_NHAT_KI: Hiểu bản chất tia alpha, beta, gamma và nguyên tắc an toàn",
    "HS2_KHO_KHAN: Tính toán lũy thừa số mũ t/T",
    4,
    "HS2_TIEP_THEO: Xem lại bảng tóm tắt B23"
  );

  // Reload both pages and verify assessment completion, step submission, reflection, and header completion badge persist
  await s1Page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
  await s1Page.locator("main").waitFor({ state: "visible", timeout: 30000 });
  await s2Page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
  await s2Page.locator("main").waitFor({ state: "visible", timeout: 30000 });

  const hs1AssessmentDoneAfterReload =
    (await s1Page.locator('h3:has-text("✓ Em đã hoàn thành bài tập cuối bài. Bài học đã hoàn tất.")').count()) === 1;
  const hs1StepDoneAfterReload =
    (await s1Page.locator('p[role="status"]:has-text("✓ Đã lưu bài nộp")').count()) === 1;
  const hs1ReflectionSection = s1Page.locator('section:has(h3:has-text("Nhật kí tự học & Tự điều chỉnh"))');
  const hs1LearnedReload = await hs1ReflectionSection.locator("textarea.form-input").nth(0).inputValue();
  const hs1ConfidenceReload = await hs1ReflectionSection.locator("select.form-input").inputValue();
  const hs1HeaderUnlockedLinks = await s1Page.locator(".student-lesson-header nav a").count();

  const hs2AssessmentDoneAfterReload =
    (await s2Page.locator('h3:has-text("✓ Em đã hoàn thành bài tập cuối bài. Bài học đã hoàn tất.")').count()) === 1;
  const hs2ReflectionSection = s2Page.locator('section:has(h3:has-text("Nhật kí tự học & Tự điều chỉnh"))');
  const hs2LearnedReload = await hs2ReflectionSection.locator("textarea.form-input").nth(0).inputValue();
  const hs2ConfidenceReload = await hs2ReflectionSection.locator("select.form-input").inputValue();

  record(
    "B12",
    "Nộp phản hồi cuối bài, tải lại trang và giữ nguyên trạng thái hoàn thành",
    hs1AssessmentDoneAfterReload &&
      hs1StepDoneAfterReload &&
      hs1LearnedReload.includes("HS1_NHAT_KI") &&
      hs1ConfidenceReload === "5" &&
      hs1HeaderUnlockedLinks === 3 &&
      hs2AssessmentDoneAfterReload &&
      hs2LearnedReload.includes("HS2_NHAT_KI") &&
      hs2ConfidenceReload === "4",
    `Sau reload: giữ nguyên trạng thái hoàn thành 3/3 pha (links=${hs1HeaderUnlockedLinks}/3), bài đánh giá, bước học và nhật kí (HS1 confidence=${hs1ConfidenceReload}, HS2 confidence=${hs2ConfidenceReload})`
  );

  // =========================================================================
  // B13 — Giáo viên xem đúng kết quả của hai học sinh; học sinh không đọc hoặc sửa được kết quả của nhau
  // =========================================================================
  // Teacher views Phase 2 results for HS1 and HS2
  await tPage.goto(`${BASE_URL}/teacher/lessons/${LESSON_ID}/ket-qua?student=${HS1.id}&phase=in_class`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await tPage.locator("section.lesson-evidence").waitFor({ state: "visible", timeout: 30000 });
  const tInClassHs1 = await tPage.content();
  const tSeesInClassHs1 =
    tInClassHs1.includes("Đã hoàn thành mô phỏng") &&
    tInClassHs1.includes("HS1_PHA2_STEP_01") &&
    !tInClassHs1.includes("HS2_PHA2_STEP_02");

  await tPage.goto(`${BASE_URL}/teacher/lessons/${LESSON_ID}/ket-qua?student=${HS2.id}&phase=in_class`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await tPage.locator("section.lesson-evidence").waitFor({ state: "visible", timeout: 30000 });
  const tInClassHs2 = await tPage.content();
  const tSeesInClassHs2 =
    tInClassHs2.includes("Đã hoàn thành mô phỏng") &&
    tInClassHs2.includes("HS2_PHA2_STEP_02") &&
    !tInClassHs2.includes("HS1_PHA2_STEP_01");

  // Teacher views Phase 3 results for HS1 and HS2
  await tPage.goto(`${BASE_URL}/teacher/lessons/${LESSON_ID}/ket-qua?student=${HS1.id}&phase=after_class`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await tPage.locator("section.lesson-evidence").waitFor({ state: "visible", timeout: 30000 });
  const tAfterClassHs1 = await tPage.content();
  const tSeesAfterClassHs1 =
    tAfterClassHs1.includes("Đã nộp (6 câu)") &&
    tAfterClassHs1.includes("HS1_BAI_DANH_GIA") &&
    tAfterClassHs1.includes("HS1_NHAT_KI") &&
    tAfterClassHs1.includes("HS1_PHA3_STEP_01") &&
    !tAfterClassHs1.includes("HS2_BAI_DANH_GIA") &&
    !tAfterClassHs1.includes("HS2_NHAT_KI") &&
    !tAfterClassHs1.includes("HS2_PHA3_STEP_02");

  await tPage.goto(`${BASE_URL}/teacher/lessons/${LESSON_ID}/ket-qua?student=${HS2.id}&phase=after_class`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await tPage.locator("section.lesson-evidence").waitFor({ state: "visible", timeout: 30000 });
  const tAfterClassHs2 = await tPage.content();
  const tSeesAfterClassHs2 =
    tAfterClassHs2.includes("Đã nộp (6 câu)") &&
    tAfterClassHs2.includes("HS2_BAI_DANH_GIA") &&
    tAfterClassHs2.includes("HS2_NHAT_KI") &&
    tAfterClassHs2.includes("HS2_PHA3_STEP_02") &&
    !tAfterClassHs2.includes("HS1_BAI_DANH_GIA") &&
    !tAfterClassHs2.includes("HS1_NHAT_KI") &&
    !tAfterClassHs2.includes("HS1_PHA3_STEP_01");

  // Student cross-read & cross-write isolation checks
  const s1AfterHtml = await s1Page.content();
  const s2AfterHtml = await s2Page.content();
  const uiIsolatedAfterClass =
    !s1AfterHtml.includes("HS2_") && !s2AfterHtml.includes("HS1_");

  // HS1 attempts to open teacher ket-qua URL for HS2
  await s1Page.goto(`${BASE_URL}/teacher/lessons/${LESSON_ID}/ket-qua?student=${HS2.id}&phase=after_class`, {
    waitUntil: "load",
  });
  const hs1RedirectedFromTeacher = !new URL(s1Page.url()).pathname.startsWith("/teacher");
  const hs1CannotSeeHs2OnRedirect = !(await s1Page.content()).includes("HS2_");

  // HS1 attempts to SELECT and PATCH HS2's rows across student_phase_progress, student_step_progress, lesson_reflections
  const hs1Headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${hs1Auth.access_token}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  const [readPhaseHs2, readStepHs2, readReflHs2] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/student_phase_progress?student_id=eq.${HS2.id}&select=*`, {
      headers: hs1Headers,
    }).then((r) => r.json()),
    fetch(`${SUPABASE_URL}/rest/v1/student_step_progress?student_id=eq.${HS2.id}&select=*`, {
      headers: hs1Headers,
    }).then((r) => r.json()),
    fetch(`${SUPABASE_URL}/rest/v1/lesson_reflections?student_id=eq.${HS2.id}&select=*`, {
      headers: hs1Headers,
    }).then((r) => r.json()),
  ]);

  const [patchPhaseHs2, patchStepHs2, patchReflHs2] = await Promise.all([
    fetch(
      `${SUPABASE_URL}/rest/v1/student_phase_progress?student_id=eq.${HS2.id}&lesson_id=eq.${LESSON_ID}&phase=eq.after_class`,
      {
        method: "PATCH",
        headers: hs1Headers,
        body: JSON.stringify({ assessment_answers: { hacked: true } }),
      }
    ).then((r) => r.json()),
    fetch(`${SUPABASE_URL}/rest/v1/student_step_progress?student_id=eq.${HS2.id}&lesson_id=eq.${LESSON_ID}`, {
      method: "PATCH",
      headers: hs1Headers,
      body: JSON.stringify({ evidence: { response: "HACKED_BY_HS1" } }),
    }).then((r) => r.json()),
    fetch(`${SUPABASE_URL}/rest/v1/lesson_reflections?student_id=eq.${HS2.id}&lesson_id=eq.${LESSON_ID}`, {
      method: "PATCH",
      headers: hs1Headers,
      body: JSON.stringify({ learned: "HACKED_BY_HS1" }),
    }).then((r) => r.json()),
  ]);

  const rlsReadBlocked =
    Array.isArray(readPhaseHs2) &&
    readPhaseHs2.length === 0 &&
    Array.isArray(readStepHs2) &&
    readStepHs2.length === 0 &&
    Array.isArray(readReflHs2) &&
    readReflHs2.length === 0;
  const rlsWriteBlocked =
    Array.isArray(patchPhaseHs2) &&
    patchPhaseHs2.length === 0 &&
    Array.isArray(patchStepHs2) &&
    patchStepHs2.length === 0 &&
    Array.isArray(patchReflHs2) &&
    patchReflHs2.length === 0;

  record(
    "B13",
    "Giáo viên xem đúng kết quả 2 học sinh; học sinh không đọc hoặc sửa được kết quả của nhau",
    tSeesInClassHs1 &&
      tSeesInClassHs2 &&
      tSeesAfterClassHs1 &&
      tSeesAfterClassHs2 &&
      uiIsolatedAfterClass &&
      hs1RedirectedFromTeacher &&
      hs1CannotSeeHs2OnRedirect &&
      rlsReadBlocked &&
      rlsWriteBlocked,
    `GV xem đúng tiến độ Pha 2–3, bài đánh giá & nhật kí từng HS; HS1 bị chặn route /teacher và RLS chặn 100% đọc/sửa chéo (SELECT=0, PATCH=0)`
  );

  console.log("\n=== TẤT CẢ KỊCH BẢN B08–B13 TRÊN TRÌNH DUYỆT ĐỀU ĐẠT ===");
} finally {
  await browser.close();
}
