const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_CORE_PATH);
const root = process.env.VISUAL_QA_URL || 'http://localhost:3000';
const out = 'docs/previews/sgk-alignment';
const navigation = { waitUntil: 'domcontentloaded', timeout: 120000 };
const cases = [['B21', 2], ['B22', 7], ['B23', 15], ['B24', 25], ['B25', 30]];
const widths = [320, 390, 768, 1366];
(async () => {
  const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 900 }, reducedMotion: 'reduce' });
  const errors = [], failures = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    for (const [code, anchor] of cases) {
      await page.goto(root + '/hoc-lieu/truc-quan?bai=' + code, navigation);
      await page.locator('.visual-studio').waitFor();
      for (const width of widths) {
        try {
          await page.setViewportSize({ width, height: 900 });
          await page.evaluate(() => document.fonts.ready);
          const data = await page.evaluate(() => ({
            width: innerWidth, scroll: document.documentElement.scrollWidth,
            anchors: [...document.querySelectorAll('.visual-studio a[href*="SGK-chuong-IV.pdf"]')].map(el => el.hash),
            math: document.querySelectorAll('.visual-studio .katex').length,
            badMath: [...document.querySelectorAll('.visual-studio .katex-error')].map(el => el.textContent),
            clippedMath: [...document.querySelectorAll('.visual-studio .latex-math-block')].filter(el => el.offsetWidth > 0 && el.scrollWidth > el.clientWidth + 2).map(el => el.querySelector('annotation')?.textContent),
          }));
          console.log(width, code, JSON.stringify(data));
          assert.equal(data.width, width);
          assert.ok(data.scroll <= width + 1, 'Document overflows');
          assert.ok(data.anchors.length && data.anchors.every(hash => hash === '#page=' + anchor), 'Unexpected SGK anchor');
          assert.deepEqual(data.badMath, []);
          assert.deepEqual(data.clippedMath, []);
          if (code === 'B23') {
            await page.getByRole('button', { name: 'Tia γ', exact: true }).click();
            await page.locator('.physics-lab').first().scrollIntoViewIfNeeded();
            await page.screenshot({ path: out + '/truc-quan-b23-' + width + '.png', timeout: 15000 });
          }
          if (code === 'B22' && (width === 390 || width === 1366)) {
            const start = page.getByRole('button', { name: 'Bắt đầu thí nghiệm 3D' });
            if (await start.isVisible()) await start.click();
            await page.getByRole('button', { name: /Mảnh phân hạch tách ra/ }).click();
            await page.getByRole('button', { name: 'Phía trước', exact: true }).click();
            await page.locator('.fission-stage canvas').waitFor();
            assert.match(await page.locator('.fission-live-counts').textContent(), /39p, 56n.*53p, 85n.*3 neutron/);
            await page.locator('.fission-stage').screenshot({ path: out + '/b22-phan-hach-' + width + '.png', timeout: 15000 });
          }
          if (code === 'B25' && (width === 390 || width === 1366)) {
            const expand = page.getByText('Sơ đồ vector tĩnh để in phiếu học tập / chèn PowerPoint (B25)', { exact: true });
            if (!(await expand.locator('..').getAttribute('open'))) await expand.click();
            const figure = page.locator('.infographic-image').first();
            await figure.scrollIntoViewIfNeeded();
            const image = await figure.locator('img').evaluate(el => ({ loaded: el.complete && el.naturalWidth > 0, source: el.src }));
            assert.ok(image.loaded && image.source.endsWith('/B25-diagram.svg'));
            await figure.screenshot({ path: out + '/b25-infographic-' + width + '.png', timeout: 15000 });
          }
        } catch (error) { failures.push([width, code, error.message]); }
      }
    }
    console.log(JSON.stringify({ failures, errors }));
    assert.deepEqual(failures, []);
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
