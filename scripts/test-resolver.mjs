import {registerHooks} from 'node:module';
import {existsSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
registerHooks({resolve(specifier,context,nextResolve){
 if(specifier.startsWith('@/'))specifier=pathToFileURL(path.resolve('src',specifier.slice(2))).href;
 try{const result=nextResolve(specifier,context);return result.url.endsWith('.json')?{...result,importAttributes:{type:'json'}}:result;}catch(error){
  if(specifier.startsWith('.')||specifier.startsWith('file:')){
   const url=new URL(specifier,context.parentURL);for(const extension of ['.ts','.tsx']){const candidate=new URL(url.href+extension);if(existsSync(fileURLToPath(candidate)))return nextResolve(candidate.href,context);}
  }
  throw error;
 }
}});
