const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = process.cwd();
const cache = new Map();
const css = fs.readFileSync(path.join(root, 'src/components/physics/ProcessLab.module.css'), 'utf8');
const classes = Object.fromEntries([...css.matchAll(/\.([a-zA-Z][a-zA-Z0-9]*)/g)].map(m => [m[1], m[1]]));
function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const mod = new Module(file);
  mod.filename = file;
  mod.paths = Module._nodeModulePaths(path.dirname(file));
  cache.set(file, mod);
  const native = mod.require.bind(mod);
  mod.require = id => {
    if (id.endsWith('.module.css')) return classes;
    if (id.startsWith('.') || id.startsWith('@/')) {
      const base = id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : path.resolve(path.dirname(file), id);
      const found = ['', '.ts', '.tsx', '.json'].map(suffix => base + suffix).find(candidate => fs.existsSync(candidate));
      if (found?.endsWith('.json')) return JSON.parse(fs.readFileSync(found, 'utf8'));
      if (found && /\.tsx?$/.test(found)) return load(found);
    }
    return native(id);
  };
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  mod._compile(output.outputText, file);
  return mod.exports;
}
const { DecayProcessVisual } = load(path.join(root, 'src/components/physics/DecayProcessVisual.tsx'));
const { B25DataProcessLab } = load(path.join(root, 'src/components/physics/B25DataProcessLab.tsx'));
const { createDecaySample } = load(path.join(root, 'src/lib/radioactive-decay-model.ts'));
const sample = createDecaySample({ initialCount: 32, halfLifeSeconds: 5, seed: 3262 });
for (const width of [236, 300, 360, 560, 650]) {
  const decay = renderToStaticMarkup(React.createElement(DecayProcessVisual, { sample, time: 1 }));
  const activity = renderToStaticMarkup(React.createElement(B25DataProcessLab));
  const html = `<!doctype html><html lang="vi"><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:12px;font:16px/1.5 Arial,sans-serif;background:#fff}.harness{width:${width}px}.harness>div[data-process]{padding:0;border:0}.figure svg{width:100%;display:block}</style><style>${css}</style><div class="harness"><div class="figure" data-decay>${decay}</div><div data-activity>${activity}</div></div></html>`;
  fs.writeFileSync(path.join(__dirname, `width-${width}.html`), html);
}
console.log('Static component HTML rendered; seed 3262 histogram at t=1 s.');
