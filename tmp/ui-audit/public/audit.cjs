const { chromium } = require(process.env.PLAYWRIGHT_CORE_PATH || process.env.HOME + '/.gemini/antigravity/brain/17e91277-4016-4e60-920d-e3b6e5d338ed/scratch/pg-harness/node_modules/playwright-core');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = process.cwd();
const outputSet = process.env.OUTPUT_SET || 'before';
const routes = [
 ['home','/'],['library','/hoc-lieu'],['lab-b21','/hoc-lieu/phong-hat-nhan?bai=B21'],['lab-b22','/hoc-lieu/phong-hat-nhan?bai=B22'],['lab-b23','/hoc-lieu/phong-hat-nhan?bai=B23'],['lab-b24','/hoc-lieu/phong-hat-nhan?bai=B24'],['lab-b25','/hoc-lieu/phong-hat-nhan?bai=B25'],
 ['visual-studio','/hoc-lieu/truc-quan?bai=B21'],['video','/hoc-lieu/phong-hat-nhan?bai=B21#video'],['infographic-history','/gioi-thieu'],['demo','/demo-lesson'],['curriculum','/hoc-lieu/chuong-trinh'],['student-ai','/hoc-lieu/ai'],['teacher-tools','/hoc-lieu/ai-giao-vien'],['worksheet','/hoc-lieu/ai-giao-vien','Phiếu học tập ba pha'],['prepare-lesson','/hoc-lieu/ai-giao-vien','Chuẩn bị giờ học'],['plan-editor','/hoc-lieu/soan-ke-hoach'],['flipped-guide','/hoc-lieu/lop-hoc-dao-nguoc'],['assessment-catalog','/hoc-lieu?type=assessment'],['document-catalog','/hoc-lieu?type=document'],
];
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--disable-dev-shm-usage']});
 const report=[];
 try {
  for(const width of (process.env.AUDIT_WIDTHS || '1366 390').split(/\s+/).map(Number)) {
   const context=await browser.newContext({viewport:{width,height:width<500?844:900},isMobile:width<500,hasTouch:width<500});
   for(const [name,route,tab] of routes) {
    const page=await context.newPage();
    const entry={name,route,width,errors:[]};
    page.on('pageerror',error=>entry.errors.push(error.message));
    try {
     const response=await page.goto((process.env.BASE_URL||'http://127.0.0.1:3476')+route,{waitUntil:'domcontentloaded',timeout:30000});
     entry.status=response.status();
     await page.waitForTimeout(650);
     if(tab) await page.getByRole('button',{name:tab,exact:true}).click();
     if(name==='video') { await page.getByRole('button',{name:/Mở video B21/}).click(); await page.locator('video').scrollIntoViewIfNeeded(); }
     if(tab) await page.waitForTimeout(250);
     entry.snapshot=await page.evaluate(()=>{
      const css=e=>{const s=getComputedStyle(e);return {background:s.backgroundColor,color:s.color,radius:s.borderRadius,fontSize:s.fontSize,fontWeight:s.fontWeight,padding:s.padding}};
      const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}};
      return {title:document.title,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,headings:[...document.querySelectorAll('h1,h2')].slice(0,9).map(e=>({text:e.innerText,...css(e)})),buttons:[...document.querySelectorAll('button,.btn')].filter(e=>e.getBoundingClientRect().width).slice(0,14).map(e=>({text:e.innerText.slice(0,80),...css(e),...rect(e)})),overflow:[...document.querySelectorAll('main *,section *')].filter(e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);return r.width>0&&(r.right>innerWidth+2||r.left< -2)&&s.position!=='fixed'&&s.overflowX!=='auto'&&e.tagName!=='CANVAS'}).slice(0,12).map(e=>({tag:e.tagName,class:e.className?.baseVal??e.className,text:e.innerText?.slice(0,80),...rect(e)})),links:[...document.querySelectorAll('main a')].slice(0,20).map(e=>({text:e.innerText,href:e.getAttribute('href')})),bodyText:document.body.innerText.slice(0,1200)};
     });
     const destination=path.join(root,`docs/previews/ui-consistency/${outputSet}`,`${name}-${width}.png`);
     await page.screenshot({path:destination});
     entry.screenshot=path.relative(root,destination);
     console.log(name,width,entry.status,entry.snapshot.scrollWidth,entry.errors.length);
    } catch(error) {entry.error=error.message;console.log('ERROR',name,width,error.message);}
    report.push(entry);
    await fs.writeFile(path.join(root,`tmp/ui-audit/public/${outputSet}.json`),JSON.stringify(report,null,2)+'\n');
    await page.close();
   }
   await context.close();
  }
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
