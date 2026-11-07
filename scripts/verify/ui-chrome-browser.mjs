/** Shared navigation, accessibility and floating assistant regression. No learning writes. */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_CORE_PATH||'playwright-core');
const base=process.env.BASE_URL||'http://127.0.0.1:3477';
const folder=process.env.ARTIFACT_DIR||'tmp/ui-audit/chrome';
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results=[];
const widths=[320,390,768,1366];
const errors=[];
const goto=async(page,path)=>{await page.goto(base+path,{waitUntil:'domcontentloaded'});await page.locator('h1').waitFor();await page.evaluate(()=>document.fonts.ready);};
const overflow=async(page)=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal page overflow');
try{
 for(const width of widths){
  const context=await browser.newContext({viewport:{width,height:950},reducedMotion:'reduce'});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await goto(page,'/hoc-lieu');
  assert.equal(await page.locator('.public-shell > header').count(),1);assert.equal(await page.locator('.public-shell > footer').count(),1);
  assert.equal(await page.locator('aside.portal-sidebar').count(),0);
  assert.equal(await page.locator('a[href="#"]').count(),0);
  if(width<1080){
   const toggle=page.getByRole('button',{name:'Mở menu',exact:true});await toggle.click();
   const nav=page.getByRole('navigation',{name:'Điều hướng công khai',exact:true});
   await nav.getByRole('link',{name:'Kho học liệu',exact:true}).waitFor();
   await page.keyboard.press('Escape');assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert(await toggle.evaluate(e=>e===document.activeElement));
  }else{
   const tools=page.locator('header details');await tools.locator('summary').click();assert(await tools.evaluate(e=>e.open));
   await page.keyboard.press('Escape');assert.equal(await tools.evaluate(e=>e.open),false);
  }
  const trigger=page.getByRole('button',{name:'Mở trợ lí học tập',exact:true});
  const box=await trigger.boundingBox();assert(box.width>100&&box.height<60&&box.x>=0&&box.x+box.width<=width);
  await trigger.click();const panel=page.locator('.ai-chat-panel');await panel.waitFor();
  assert(await panel.locator('textarea').evaluate(e=>e===document.activeElement));
  await overflow(page);
  const panelBox=await panel.boundingBox();assert(panelBox.x>=-1&&panelBox.y>=-1&&panelBox.x+panelBox.width<=width+1&&panelBox.height<=951);
  await page.screenshot({path:`${folder}/chat-${width}.png`});
  await page.keyboard.press('Escape');await panel.waitFor({state:'hidden'});
  assert(await trigger.evaluate(e=>e===document.activeElement));
  await trigger.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
  const outline=await trigger.evaluate(e=>getComputedStyle(e).outlineWidth);assert.equal(outline,'3px');
  await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
  const overlap=await page.locator('footer a').evaluateAll(links=>{const dock=document.querySelector('.ai-help-dock').getBoundingClientRect();return links.filter(a=>{const r=a.getBoundingClientRect();return r.left<dock.right&&r.right>dock.left&&r.top<dock.bottom&&r.bottom>dock.top;}).map(a=>a.textContent);});assert.deepEqual(overlap,[]);
  results.push({group:'public-menu-chat-footer-focus',width,pass:true,triggerBounds:box,panelBounds:panelBox});
  await context.close();
 }
 const context=await browser.newContext({viewport:{width:1366,height:950}});const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));await goto(page,'/login');
 await page.locator('[name=email]').fill('b23-gv@example.com');await page.locator('[name=password]').fill(process.env.QA_PASSWORD||['TestB23','Pass!'].join(''));
 await page.getByRole('button',{name:/Đăng nhập vào lớp học/}).click();await page.waitForURL(u=>u.pathname==='/teacher');
 const writes=[];page.on('request',r=>{if(['POST','PUT','PATCH','DELETE'].includes(r.method()))writes.push(r.method()+' '+r.url());});
 for(const width of widths){
  await page.setViewportSize({width,height:950});await goto(page,'/teacher/lessons');
  if(width<1024){
   const toggle=page.getByRole('button',{name:'Mở menu',exact:true});await toggle.click();const dialog=page.getByRole('dialog',{name:'Menu di động',exact:true});await dialog.waitFor();
   const controls=dialog.locator('button,a[href]');const last=controls.last();await last.focus();await page.keyboard.press('Tab');assert(await controls.first().evaluate(e=>e===document.activeElement));await page.keyboard.press('Shift+Tab');assert(await last.evaluate(e=>e===document.activeElement));
   assert.equal(await page.locator('.ai-help-dock').isVisible(),false);
   assert.equal(await dialog.getByRole('link',{name:'Bài học',exact:true}).getAttribute('aria-current'),'page');
   await page.screenshot({path:`${folder}/teacher-menu-${width}.png`});
   await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});assert(await toggle.evaluate(e=>e===document.activeElement));
  }else{
   await page.getByRole('button',{name:'Ẩn menu',exact:true}).click();assert(await page.locator('.portal-shell').evaluate(e=>e.classList.contains('sidebar-closed')));await page.getByRole('button',{name:'Hiện menu',exact:true}).click();
  }
  await overflow(page);results.push({group:'teacher-sidebar-focus-active-navigation',width,pass:true});
 }
 assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
 await writeFile(`${folder}/report.json`,JSON.stringify({base,build:JSON.parse(await readFile('tmp/ui-audit/build-manifest.json','utf8')),results,errors,writes},null,2)+'\n');console.log('PASS',results.length,'shared chrome cases');
}finally{await browser.close();}
