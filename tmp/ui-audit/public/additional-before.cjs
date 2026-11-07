const { chromium }=require(process.env.HOME+'/.gemini/antigravity/brain/17e91277-4016-4e60-920d-e3b6e5d338ed/scratch/pg-harness/node_modules/playwright-core');
const fs=require('node:fs/promises');
const base=process.env.BASE_URL||'http://127.0.0.1:3476', set=process.env.OUTPUT_SET||'before';
(async()=>{const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const out=[];
try{for(const width of (process.env.AUDIT_WIDTHS || '1366 390').split(/\s+/).map(Number))for(const type of (process.env.EXTRA_TYPES || 'video exam-matrix ai-status').split(/\s+/)){
 const page=await b.newPage({viewport:{width,height:width<500?844:900}});
 const url=type==='exam-matrix'?'/hoc-lieu/ai-giao-vien':type==='ai-status'?'/hoc-lieu/ai':'/hoc-lieu/phong-hat-nhan?bai=B21#video';
 await page.goto(base+url,{waitUntil:'domcontentloaded'}); await page.waitForTimeout(650);
 if(type==='video'){await page.getByRole('button',{name:/Mở video B21/}).click();await page.locator('video').scrollIntoViewIfNeeded();}
 if(type==='exam-matrix')await page.getByRole('button',{name:'Up ma trận đề và xuất ra đề file Word',exact:true}).click();
 if(type==='ai-status'){await page.getByRole('button',{name:/(Mở Chatbox hỏi AI Vật lí|Mở trợ lí học tập)/}).click();await page.waitForTimeout(450);}
 const snapshot=await page.evaluate(()=>({text:document.body.innerText.slice(-2400),scrollWidth:document.documentElement.scrollWidth}));
 await page.screenshot({path:`docs/previews/ui-consistency/${set}/${type}-${width}.png`});out.push({type,width,url,snapshot});await page.close();
 }await fs.writeFile(`tmp/ui-audit/public/additional-${set}.json`,JSON.stringify(out,null,2)+'\n');}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
