import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../package.json', import.meta.url));
const { chromium } = require(process.env.PLAYWRIGHT_CORE_PATH);
const { createServerClient } = require('@supabase/ssr');
process.loadEnvFile('.env.local');
const base = process.env.BASE_URL || 'http://127.0.0.1:3472';
const fixture = JSON.parse(await readFile('tmp/sgk-phase-qa/fixture.json', 'utf8'));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const c = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { cookies: { getAll: () => [], setAll: values => page.context().addCookies(values.map(({ name, value }) => ({ name, value, url: base }))) } });
  const a = await c.auth.signInWithPassword({ email: 'b23-gv@example.com', password: process.env.B23_TEST_PASSWORD || ['TestB23','Pass!'].join('') });
  assert(a.data.user, a.error?.message);
  await page.goto(base + '/teacher/lessons/' + fixture.lessons.B21 + '/before-class', { waitUntil: 'load' });
  const row = page.locator('.pathway-step-row').first();
  assert.match(await row.innerText(), /Kiểm tra LaTeX/);
  await row.getByRole('button', { name: /Xem trước/ }).press('Enter');
  const dialog = page.getByRole('dialog', { name: /Xem trước/ });
  const modal = dialog.locator('.pathway-preview-modal');
  await modal.waitFor();
  for (const width of [320,375,390,768,1366]) {
    await page.setViewportSize({ width, height: 844 });
    const measure = await modal.evaluate(async (el) => {
      await document.fonts.ready;
      await new Promise(resolve => requestAnimationFrame(resolve));
      const rect = el.getBoundingClientRect();
      return { left: rect.left, right: rect.right, excess: el.scrollWidth - el.clientWidth, katex: el.querySelectorAll('.katex').length };
    });
    assert(measure.left >= 0 && measure.right <= width + 1 && measure.excess <= 1 && measure.katex >= 3, JSON.stringify({width,measure}));
    console.log('PASS B21 teacher preview and saved KaTeX', width, measure);
    if(width===390) await page.screenshot({ path: 'docs/previews/sgk-review/teacher-b21-preview-390.png' });
  }
} finally { await browser.close(); }
