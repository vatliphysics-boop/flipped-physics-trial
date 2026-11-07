import {registerHooks,createRequire} from 'node:module';
const bundled=createRequire('/Users/vodoandangkhoi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/docx/package.json');
const docxPath=bundled.resolve('docx');
registerHooks({resolve(specifier,context,next){if(specifier==='docx')return next(docxPath,context);return next(specifier,context);}});
