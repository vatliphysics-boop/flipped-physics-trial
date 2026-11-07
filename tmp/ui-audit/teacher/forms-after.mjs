import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_CORE_PATH),{createServerClient}=require('@supabase/ssr');
process.loadEnvFile('.env.local');const base=process.env.BASE_URL,photos='docs/previews/ui-consistency/after',report=[];
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{for(const width of[1366,768,390,320]){
 const context=await browser.newContext({viewport:{width,height:width<=390?844:width===768?1024:950},reducedMotion:'reduce'});
 const client=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{cookies:{getAll:()=>[],setAll:async cs=>context.addCookies(cs.map(({name,value})=>({name,value,url:base})))}});
 const sign=await client.auth.signInWithPassword({email:'b23-gv@example.com',password:process.env.B23_TEST_PASSWORD||['TestB23','Pass!'].join('')});if(sign.error)throw sign.error;
 const p=await context.newPage();p.setDefaultTimeout(12000);
 await p.goto(base+'/teacher/materials',{waitUntil:'domcontentloaded'});await p.getByRole('button',{name:'+ Thêm học liệu vào kho',exact:true}).click();await p.getByRole('dialog').waitFor();
 await p.screenshot({path:`${photos}/teacher-material-add-${width}.png`});
 report.push({name:'material-add',width,layout:await p.getByRole('dialog').evaluate(el=>({height:el.scrollHeight,viewport:innerHeight,form:el.querySelector('form').getBoundingClientRect().toJSON(),lastButton:el.querySelector('button[type=submit]').getBoundingClientRect().toJSON()}))});
 await p.getByRole('button',{name:'Hủy',exact:true}).click();
 await p.goto(base+'/teacher/plans',{waitUntil:'domcontentloaded'});
 await p.getByRole('button',{name:'Mẫu B21',exact:true}).click();
 await p.locator('.plan-header-fields').scrollIntoViewIfNeeded();await p.screenshot({path:`${photos}/teacher-plan-editor-${width}.png`});
 report.push({name:'plan-editor',width,scrollWidth:await p.evaluate(()=>document.documentElement.scrollWidth)});
 await context.close();
}}finally{await browser.close();await writeFile('tmp/ui-audit/teacher/after/forms.json',JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report,null,2));
