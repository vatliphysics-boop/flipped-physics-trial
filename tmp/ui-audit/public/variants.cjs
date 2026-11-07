const {chromium}=require(process.env.HOME+'/.gemini/antigravity/brain/17e91277-4016-4e60-920d-e3b6e5d338ed/scratch/pg-harness/node_modules/playwright-core');
const fs=require('node:fs/promises');const base=process.env.BASE_URL||'http://127.0.0.1:3476';const set=process.env.OUTPUT_SET||'before';
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const report=[];try{
for(const width of (process.env.AUDIT_WIDTHS || '1366 390').split(/\s+/).map(Number))for(const group of ['studio','infographic'])for(const code of ['B22','B23','B24','B25']){
 const context=await browser.newContext({viewport:{width,height:width<500?844:900},isMobile:width<500,hasTouch:width<500});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto(base+(group==='studio'?`/hoc-lieu/truc-quan?bai=${code}`:'/gioi-thieu'),{waitUntil:'domcontentloaded'});
 if(group==='infographic')await page.getByRole('button',{name:new RegExp(`^Bài ${code.slice(1)} ·`)}).click();
 await page.waitForTimeout(350);
 const sample=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,h1:[...document.querySelectorAll('h1')].map(x=>x.innerText),brokenImages:[...document.images].filter(x=>x.complete&&x.naturalWidth===0).map(x=>x.src)}));
 await page.screenshot({path:`docs/previews/ui-consistency/${set}/${group}-${code.toLowerCase()}-${width}.png`});
 report.push({group,code,width,status:response.status(),errors,...sample});console.log(group,code,width,response.status(),sample.scrollWidth,errors.length);await context.close();
}await fs.writeFile(`tmp/ui-audit/public/variants-${set}.json`,JSON.stringify({base,report},null,2)+'\n');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
