const { chromium } = require('/Users/vodoandangkhoi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = __dirname;
const stage = process.argv[2] || 'baseline';
const publicRoutes = ['/', '/login', '/register', '/demo-lesson'];
const protectedRoutes = ['/teacher', '/teacher/classes', '/teacher/curriculum', '/teacher/curriculum/IV', '/student', '/student/curriculum', '/student/assignments'];
const placeholder = '00000000-0000-0000-0000-000000000021';
for (const role of ['teacher', 'student']) for (const phase of ['before-class', 'in-class', 'after-class']) protectedRoutes.push(`/${role}/lessons/${placeholder}/${phase}`);
(async () => {
  await fs.mkdir(path.join(root, 'evidence', stage), { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const results = [];
  for (const width of [1440, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of publicRoutes) {
      const before = errors.length;
      const response = await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle' });
      const name = route === '/' ? 'home' : route.slice(1);
      await page.screenshot({ path: path.join(root, 'evidence', stage, `${name}-${width}.png`), fullPage: true });
      const metrics = await page.evaluate(() => ({
        viewport: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        title: document.querySelector('h1')?.textContent,
        overflow: [...document.querySelectorAll('body *')].filter(e => {
          const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
          return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1) && s.position !== 'fixed' && !e.closest('[aria-hidden="true"]');
        }).slice(0, 15).map(e => ({ tag: e.tagName, class: e.className, text: e.textContent.slice(0, 80) })),
      }));
      results.push({ route, width, status: response.status(), ...metrics, errors: errors.slice(before) });
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const route of protectedRoutes) {
    const response = await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle' });
    results.push({ route, width: 1440, status: response.status(), finalPath: new URL(page.url()).pathname, evidence: 'Logged-out redirect only; placeholder lesson ID, no real B21 session.' });
  }
  await fs.writeFile(path.join(root, `${stage}-browser.json`), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results));
  await browser.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
