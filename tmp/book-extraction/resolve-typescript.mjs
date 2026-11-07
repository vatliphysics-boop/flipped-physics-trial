import {registerHooks} from 'node:module';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
registerHooks({resolve(specifier,context,nextResolve){try{return nextResolve(specifier,context);}catch(error){if(specifier.startsWith('.') && context.parentURL){const url=new URL(specifier+'.ts',context.parentURL);if(existsSync(fileURLToPath(url)))return nextResolve(url.href,context);}throw error;}}});
