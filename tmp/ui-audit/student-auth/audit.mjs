import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_CORE_PATH);
process.loadEnvFile('.env.local');
const {createServerClient}=require('@supabase/ssr');
const base=process.env.BASE_URL||'http://127.0.0.1:3476';
const output=process.env.UI_OUT||'docs/previews/ui-consistency/before';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const student=await browser.newContext({viewport:{width:1366,height:950},reducedMotion:'reduce'});
const auth=await browser.newContext({viewport:{width:1366,height:950},reducedMotion:'reduce'});
const client=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{cookies:{getAll:()=>[],setAll:async items=>student.addCookies(items.map(({name,value})=>({name,value,url:base})))}});
const {error}=await client.auth.signInWithPassword({email:'b23-hs1@example.com',password:['TestB23','Pass!'].join('')});
if(error)throw error;
const lesson='2455fc0f-dfa2-4e56-9924-b887564a1a93';
const routes=[
['student-overview','/student'],['student-classes','/student/classes'],['student-curriculum','/student/curriculum'],['student-chapter','/student/curriculum/IV'],
['student-before',`/student/lessons/${lesson}/before-class`],['student-during',`/student/lessons/${lesson}/in-class`],['student-after',`/student/lessons/${lesson}/after-class`],
['student-assessment','/student/assignments'],['student-journal','/student/journal'],['student-ai','/student/ai?bai=B23'],['student-materials','/student/materials'],
['auth-login','/login',true],['auth-register','/register',true],['auth-verified','/auth/verified?status=success',true],['auth-expired','/auth/verified?status=error&message=Li%C3%AAn%20k%E1%BA%BFt%20%C4%91%C3%A3%20h%E1%BA%BFt%20h%E1%BA%A1n.',true]];
const rows=[];
try{
 for(const width of (process.env.UI_WIDTHS||"1366 390").split(/\s+/).map(Number)){
  for(const [id,path,isAuth] of routes){
   const page=await (isAuth?auth:student).newPage();
   await page.setViewportSize({width,height:950});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   let response,status;
   try{
    response=await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:60000});
    await page.locator('h1').first().waitFor({timeout:20000});await page.waitForTimeout(350);
    status=await page.evaluate(()=>({title:document.querySelector('h1')?.textContent,h1Count:document.querySelectorAll('h1').length,overflow:document.documentElement.scrollWidth>innerWidth+1,scrollWidth:document.documentElement.scrollWidth,width:innerWidth,headings:[...document.querySelectorAll('h1,h2')].slice(0,9).map(e=>e.textContent),links:[...document.querySelectorAll('main a,aside a')].slice(0,35).map(e=>({text:e.textContent.trim(),href:e.getAttribute('href')})),invalid:[...document.querySelectorAll('button,input,a')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.left< -1||r.right>innerWidth+1}).slice(0,10).map(e=>({text:e.textContent.trim().slice(0,50),name:e.getAttribute('name'),rect:e.getBoundingClientRect().toJSON()}))}));
    await page.screenshot({path:`${output}/${id}-${width}.png`});
    rows.push({id,path,width,http:response?.status(),url:page.url(),...status,errors});
    console.log(id,width,response?.status(),status.overflow?'OVERFLOW':'OK');
   }catch(error){rows.push({id,path,width,error:String(error),errors});console.log(id,width,'FAIL',String(error).slice(0,100));}
   await page.close();
   await writeFile(process.env.UI_REPORT||'tmp/ui-audit/student-auth/inventory.json',JSON.stringify(rows,null,2));
  }
 }
}finally{await browser.close();}
