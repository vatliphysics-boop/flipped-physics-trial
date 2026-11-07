/**
 * Run against the dedicated B23 fixture, never a teaching class.
 * Required: B23_LESSON_ID. Optional: BASE_URL, B23_TEST_PASSWORD,
 * PLAYWRIGHT_CORE_PATH, CHROME_PATH, ARTIFACT_DIR.
 * Saves a temporary instruction marker and restores the original in finally.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_CORE_PATH || 'playwright-core');
const base = process.env.BASE_URL || 'http://localhost:3000';
const lesson = process.env.B23_LESSON_ID;
assert(lesson, 'Set B23_LESSON_ID to the dedicated B23 test lesson.');
const password = process.env.B23_TEST_PASSWORD || ['TestB23', 'Pass!'].join('');
const artifacts = path.resolve(process.env.ARTIFACT_DIR || 'tmp/step-editor-e2e');
await mkdir(artifacts, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const context = await browser.newContext({ viewport: { width: 1360, height: 880 } });
const page = await context.newPage();
page.setDefaultTimeout(15000);
const runtimeErrors = [];
page.on('pageerror', error => runtimeErrors.push(error.message));
const teacherPath = `/teacher/lessons/${lesson}/before-class`;
let original;
let needsRestore = false;

async function login(target, email, prefix) {
  await target.goto(`${base}/login`);
  await target.locator('[name=email]').fill(email);
  await target.locator('[name=password]').fill(password);
  await Promise.all([
    target.waitForURL(url => url.pathname === prefix),
    target.locator('button[type=submit]').click(),
  ]);
}
async function openEditor() {
  await page.locator('.pathway-step-row').first().locator('button.pathway-edit-btn').click();
  await page.locator('.pathway-editor-modal').waitFor({ state: 'visible' });
}
const editor = page.locator('.pathway-editor-modal');
const textarea = editor.locator('#editor-step-instructions');
async function save() {
  await editor.getByRole('button', { name: '💾 Lưu thay đổi bước học' }).click();
  await editor.locator('.step-status-pill.is-saved').waitFor({ state: 'visible' });
}
async function checkWidth() {
  const dims = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  assert(dims.scroll <= dims.width, `Page overflow: ${JSON.stringify(dims)}`);
}
try {
  await login(page, 'b23-gv@example.com', '/teacher');
  await page.goto(`${base}${teacherPath}`);
  await openEditor();
  original = await textarea.inputValue();
  await writeFile(path.join(artifacts, 'fixture-original.json'), JSON.stringify({ lesson, instructions: original }, null, 2));
  const draft = `${original}\nGhi chú kiểm thử: \\(N=N_0/2\\). Chi phí: \\$5.\n\\[\\lambda=\\frac{\\ln 2}{T}\\]`;
  assert(draft.length < 8000);
  await textarea.fill(draft);
  assert((await editor.locator('.pathway-editor-preview-card').innerText()).includes('Chi phí: $5.'));
  assert(!(await editor.locator('.pathway-editor-preview-card').innerText()).includes('\\$5'));
  await editor.locator('#formula-latex-input').fill('\\frac{1}{');
  await editor.locator('.formula-live-preview-box .math-syntax-error').waitFor();
  assert(await editor.locator('.formula-input-row button').isDisabled());
  console.log('PASS: escaped dollars render as text; invalid formulas show a friendly error.');

  // This caught a real regression: both dialogs existed, but the editor covered the preview.
  await editor.getByRole('button', { name: '👁 Xem trước đầy đủ' }).click();
  await editor.waitFor({ state: 'hidden' });
  const preview = page.locator('.pathway-preview-modal');
  await preview.waitFor({ state: 'visible' });
  assert(await preview.evaluate(el => {
    const r = el.getBoundingClientRect();
    return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + 80));
  }), 'Preview must receive pointer input, not be covered by the editor.');
  assert((await preview.innerText()).includes('Ghi chú kiểm thử'));
  await preview.locator('.pathway-expand-btn').click();
  assert(await preview.evaluate(el => el.classList.contains('is-expanded')));
  await page.screenshot({ path: path.join(artifacts, 'preview-desktop.png') });
  await preview.getByRole('button', { name: 'Đóng xem trước', exact: true }).click();
  await editor.waitFor({ state: 'visible' });
  assert.equal(await textarea.inputValue(), draft);
  await editor.locator('.step-status-pill.is-dirty').waitFor();
  console.log('PASS: full preview opens above editor and returns with unsaved content intact.');

  await editor.locator('.pathway-editor-footer').getByRole('button', { name: 'Đóng', exact: true }).click();
  await editor.getByRole('alertdialog').waitFor();
  await editor.getByRole('button', { name: 'Tiếp tục chỉnh sửa', exact: true }).click();
  assert.equal(await textarea.inputValue(), draft);
  console.log('PASS: closing after preview still warns about unsaved changes.');

  // Simulate a transport failure without mutating the fixture.
  let releaseSave;
  let requestSeen;
  const seen = new Promise(resolve => { requestSeen = resolve; });
  const release = new Promise(resolve => { releaseSave = resolve; });
  const failSave = async route => {
    if (route.request().method() === 'POST' && route.request().headers()['next-action']) {
      requestSeen();
      await release;
      await route.abort('failed');
    } else await route.continue();
  };
  await page.route('**/*', failSave);
  await editor.getByRole('button', { name: '💾 Lưu thay đổi bước học' }).click();
  await Promise.race([seen, new Promise((_, reject) => setTimeout(() => reject(new Error('No save request')), 15000))]);
  try {
    assert(await textarea.isDisabled());
    assert(await editor.getByRole('button', { name: '👁 Xem trước đầy đủ' }).isDisabled());
  } finally { releaseSave(); }
  await editor.locator('.form-alert-error').waitFor();
  await page.unroute('**/*', failSave);
  assert.equal(await textarea.inputValue(), draft);
  assert(await textarea.isEnabled());
  console.log('PASS: saving locks inputs; a network failure preserves edits and allows retry.');

  needsRestore = true;
  await save();
  await page.reload();
  await openEditor();
  assert.equal(await textarea.inputValue(), draft);
  assert.equal(await editor.locator('.pathway-editor-preview-card .math-syntax-error').count(), 0);
  console.log('PASS: retry saves successfully; LaTeX and newlines survive reload.');

  await page.setViewportSize({ width: 390, height: 844 });
  await checkWidth();
  await page.screenshot({ path: path.join(artifacts, 'editor-mobile.png') });
  await editor.getByRole('button', { name: '👁 Xem trước đầy đủ' }).click();
  await editor.waitFor({ state: 'hidden' });
  await checkWidth();
  assert(await preview.evaluate(el => el.scrollWidth <= el.clientWidth));
  await page.screenshot({ path: path.join(artifacts, 'preview-mobile.png') });
  console.log('PASS: mobile editor and preview fit a 390px viewport.');

  const studentContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  try {
    const student = await studentContext.newPage();
    await login(student, 'b23-hs1@example.com', '/student');
    await student.goto(`${base}/student/lessons/${lesson}/before-class`);
    const instructions = student.locator('.student-step-instructions').first();
    await instructions.getByText(/Ghi chú kiểm thử/).waitFor();
    assert((await instructions.locator('.katex').count()) >= 2);
    assert((await instructions.innerText()).includes('Chi phí: $5.'));
    await student.screenshot({ path: path.join(artifacts, 'student-mobile.png') });
  } finally { await studentContext.close(); }
  assert.deepEqual(runtimeErrors, []);
  console.log('PASS: student sees the saved formulas and text; no uncaught browser errors.');
} finally {
  try {
    if (needsRestore) {
      await page.goto(`${base}${teacherPath}`);
      await openEditor();
      await textarea.fill(original);
      await save();
      await page.reload();
      await openEditor();
      assert.equal(await textarea.inputValue(), original);
      console.log('RESTORED: original fixture instructions verified after reload.');
    }
  } finally { await browser.close(); }
}
console.log(`All step-editor checks passed. Screenshots: ${artifacts}`);
