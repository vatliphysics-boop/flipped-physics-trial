const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = process.cwd();
const bank = 'data/book-bank/';
const traced = bank + '.next-runtime/';
const index = JSON.parse(fs.readFileSync(bank + 'index.json'));
const indexed = [...new Set([
  ...index.pages.map(p => p.file),
  ...index.questions.flatMap(q => q.images.map(i => i.file)),
  ...index.figures.flatMap(f => [f.image.file, ...(f.colorImage ? [f.colorImage.file] : [])]),
  ...index.equations.map(e => e.image.file),
])];
const routes = {
  'book-bank': ['index.json'],
  'book-bank/asset': ['index.json', ...indexed],
  'question-bank': ['unified.json'],
  'word-download': [],
};
for (const [route, expected] of Object.entries(routes)) {
  const manifest = path.resolve('.next/server/app/api', route, 'route.js.nft.json');
  const files = [...new Set(JSON.parse(fs.readFileSync(manifest)).files.map(file =>
    path.relative(root, path.resolve(path.dirname(manifest), file))))];
  const assets = files.filter(f => f.startsWith(bank));
  const outside = files.filter(f => /^(tmp|docs|output|Sachgiaokhoavl12vlhn|\.git)\//.test(f) || /\.(zip|pdf|docx)$/i.test(f));
  const wanted = new Set(expected.map(f => traced + f));
  const extra = assets.filter(f => !wanted.has(f));
  const missing = expected.filter(f => !assets.includes(traced + f));
  console.log(route, { files: files.length, assets: assets.length, extra: extra.slice(0, 5), missing: missing.slice(0, 5), outside });
  assert.equal(extra.length + missing.length + outside.length, 0);
  for (const file of assets) {
    const destination = path.join('tmp/book-bank-production/verified-traced-bank', file.slice(traced.length));
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    if (!fs.existsSync(destination)) fs.linkSync(file, destination);
  }
}
