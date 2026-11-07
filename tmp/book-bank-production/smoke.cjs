const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { setTimeout: sleep } = require('node:timers/promises');
const { chromium } = require(process.env.PLAYWRIGHT_CORE_PATH);
const bank = path.resolve('data/book-bank');
const unified = JSON.parse(fs.readFileSync(path.join(bank, 'unified.json')));
const fallback = JSON.parse(fs.readFileSync('src/data/unified-question-bank.json'));
const artifactDir = path.resolve('tmp/book-bank-production');

async function run(browser, port, mode, override) {
  const base = 'http://127.0.0.1:' + port;
  const env = { ...process.env };
  delete env.BOOK_BANK_DIR;
  if (override) env.BOOK_BANK_DIR = override;
  const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', String(port)], { env });
  server.stdout.pipe(process.stdout);
  server.stderr.pipe(process.stderr);
  const ready = new Promise((resolve, reject) => {
    server.once('exit', code => reject(new Error('Server exited before startup: ' + code)));
    server.stdout.on('data', data => { if (data.toString().includes('Ready')) resolve(); });
  });
  const context = await browser.newContext();
  try {
    await Promise.race([ready, sleep(15000).then(() => { throw new Error('Startup timeout'); })]);
    const denied = await context.request.get(base + '/api/question-bank');
    assert.equal(denied.status(), 401);
    const privateFile = await context.request.get(base + '/data/book-bank/unified.json');
    assert.equal(privateFile.status(), 404);

    const page = await context.newPage();
    await page.goto(base + '/login');
    await page.locator('[name=email]').fill('b23-gv@example.com');
    await page.locator('[name=password]').fill(process.env.B23_TEST_PASSWORD || ['TestB23','Pass!'].join(''));
    await Promise.all([
      page.waitForURL(url => url.pathname === '/teacher', { timeout: 45000 }),
      page.locator('button[type=submit]').click(),
    ]);
    const dataResponse = page.waitForResponse(res => new URL(res.url()).pathname === '/api/question-bank');
    await page.goto(base + '/teacher/ai');
    const response = await dataResponse;
    assert.equal(response.status(), 200);
    const data = await response.json();
    assert.deepEqual(data.questions, mode === 'missing' ? fallback : unified);
    assert.equal(data.note, mode === 'missing' ? 'Máy chủ chưa cài dữ liệu trích xuất từ ba sách.' : undefined);
    await page.locator('.unified-question').first().waitFor({ state: 'visible' });
    const indexResponse = await context.request.get(base + '/api/book-bank');
    if (mode === 'missing') {
      await page.getByText(data.note, { exact: true }).waitFor();
      assert.equal(indexResponse.status(), 503);
      assert.equal((await indexResponse.json()).error, 'Chưa cài bộ dữ liệu sách trên máy chủ.');
      const asset = await context.request.get(base + '/api/book-bank/asset?file=missing.png');
      assert.equal(asset.status(), 503);
      assert.equal(await asset.text(), 'Chưa có dữ liệu hình.');
      console.log(mode, { port, fallbackQuestions: data.questions.length, index: 503, asset: 503 });
    } else {
      assert.equal(indexResponse.status(), 200);
      const index = await indexResponse.json();
      assert.equal(index.books.length, 3);
      const figure = index.figures.find(f => f.image.file.includes('/verified-figures/')).image.file;
      const asset = await context.request.get(base + '/api/book-bank/asset?file=' + encodeURIComponent(figure));
      assert.equal(asset.status(), 200);
      assert.match(asset.headers()['content-type'], /^image\//);
      assert.deepEqual(await asset.body(), fs.readFileSync(path.join(bank, figure)));
      const rejected = await context.request.get(base + '/api/book-bank/asset?file=unified.json');
      assert.equal(rejected.status(), 404);
      console.log(mode, { port, questions: data.questions.length, books: index.books.length, imageBytes: (await asset.body()).length });
    }
  } finally {
    await context.close();
    server.kill();
    if (server.exitCode === null && server.signalCode === null) await new Promise(resolve => server.once('exit', resolve));
  }
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  try {
    await run(browser, 3417, 'default');
    await run(browser, 3418, 'trace-only override', path.join(artifactDir, 'verified-traced-bank'));
    await run(browser, 3419, 'missing', path.join(artifactDir, 'nonexistent-bank'));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
