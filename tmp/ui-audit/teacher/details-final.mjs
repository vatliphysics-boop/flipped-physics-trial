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
 await p.goto(base+'/teacher/materials',{waitUntil:'domcontentloaded'});
 const row=p.locator('.material-bank-container .card > div > div').first();await row.waitFor();await row.scrollIntoViewIfNeeded();
 await p.screenshot({path:`${photos}/teacher-material-row-${width}.png`});
 report.push({name:'material-row',width,layout:await row.evaluate(el=>({row:el.getBoundingClientRect().toJSON(),title:el.querySelector('strong').getBoundingClientRect().toJSON(),actions:[...el.querySelectorAll('a,button')].map(a=>({text:a.textContent,rect:a.getBoundingClientRect().toJSON()}))}))});
 await row.getByRole('link',{name:'Soạn kế hoạch',exact:true}).click();await p.waitForURL(u=>u.pathname==='/teacher/plans'&&u.searchParams.has('material'));
 report.push({name:'material-plan-link',width,path:new URL(p.url()).pathname,selected:!!new URL(p.url()).searchParams.get('material')});
 await context.close();
}}finally{await browser.close();await writeFile('tmp/ui-audit/teacher/final/details.json',JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report,null,2));
