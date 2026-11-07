import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_CORE_PATH);
const base=process.env.BASE_URL??'http://localhost:3000';
const artifact=path.resolve('docs/previews/sgk-review');
await fs.mkdir(artifact,{recursive:true});
const titles={
 B21:'Cấu trúc hạt nhân',
 B22:'Phản ứng hạt nhân và năng lượng liên kết',
 B23:'Hiện tượng phóng xạ',
 B24:'Công nghiệp hạt nhân',
 B25:'Bài tập về vật lí hạt nhân',
};
const names=['Võ Đoàn Đăng Khôi','Nguyễn Bảo Thy','Bùi Ngọc Xuân Phương','PGS.TS. Nguyễn Thị Nhị','Khoa Sư phạm Khoa học Tự nhiên, Trường Đại học Sài Gòn'];
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const metrics=[];
const links=new Map();
try{
for(const [width,height] of [[320,760],[375,812],[390,844],[768,1024],[1366,900]].filter(([width])=>!process.env.QA_WIDTHS||process.env.QA_WIDTHS.split(',').includes(String(width)))){
 const page=await browser.newPage({viewport:{width,height},isMobile:width<=390,hasTouch:width<=390, reducedMotion:'reduce'});
 for (const code of ['home','B21','B25'].filter(code=>!process.env.QA_PAGES||process.env.QA_PAGES.split(',').includes(code))) {
  if(process.env.QA_CASES&&!process.env.QA_CASES.split(',').includes(width+'-'+code))continue;
  const relative=code==='home'?'/':`/hoc-lieu/phong-hat-nhan?bai=${code}`;
  const errors=[];
  const diagnostics=[];
  const collect=e=>diagnostics.push(e.message);
  page.on('pageerror',collect);
  try {
   const response=await page.goto(base+relative,{waitUntil:'domcontentloaded',timeout:45000});
   if(response?.status()!==200)errors.push('page HTTP '+response?.status());
   await page.evaluate(()=>document.fonts.ready);
   const heading=await page.locator('h1').first().innerText({timeout:15000});
   if(code!=='home'&&!heading.includes(titles[code]))errors.push('title '+heading);
   const model=page.locator('[data-nucleus-explorer]').first();
   if(await model.count()===1){
    const expected=code==='B25'?[6,8,14]:[6,6,12];
    const counts=(await model.locator('dl dd').allTextContents()).map(Number);
    const optionCount=await model.getByLabel('Quan sát hạt',{exact:true}).locator('option').count()-1;
    if(counts.join()!==expected.join()||optionCount!==expected[2])errors.push('nucleus count '+JSON.stringify({counts,optionCount}));
    if(!process.env.QA_SKIP_MODEL_ACTIONS&&(width===1366&&code==='home'||width===390&&code==='B21'||width===1366&&code==='B25')){
     await model.locator('[data-model-status]').scrollIntoViewIfNeeded();
     await model.locator('[data-model-status="ready"] canvas').waitFor({timeout:15000});
     const preset=model.getByRole('button',{name:'Trên',exact:true});
     await preset.click();
     if(await preset.getAttribute('aria-pressed')!=='true') errors.push('top camera unavailable');
     await model.getByRole('button',{name:'Phóng to'}).click();
     await model.getByLabel('Quan sát hạt',{exact:true}).selectOption("proton-1");
     if(!(await model.locator('[aria-live]').innerText()).includes('điện tích +e'))errors.push('proton selection');
     const cut=model.getByRole('button',{name:'Cắt lớp',exact:true});
     await cut.click();
     if(await cut.getAttribute('aria-pressed')!=='true'||(await model.locator('dl dd').allTextContents()).map(Number).join()!==expected.join())errors.push('cutaway changes count');
     const full=model.getByRole('button',{name:'Toàn màn hình',exact:true});
     await full.click();
     await model.getByRole('button',{name:'Thoát toàn màn hình',exact:true}).click();
     await model.getByRole('button',{name:'Đặt lại góc nhìn'}).click();
     await cut.click();
     await model.getByLabel('Quan sát hạt',{exact:true}).selectOption({index:0});
     await page.evaluate(()=>window.scrollTo(0,0));
    }
   }else errors.push('model missing');
   const footer=page.locator('footer');
   const footText=await footer.innerText({timeout:15000});
   for (const name of names) if(!footText.includes(name)) errors.push('missing footer name '+name);
   for(const [key,title] of Object.entries(titles)){
    const link=footer.getByRole('link',{name:`${key} · ${title}`});
    if(await link.count()!==1)errors.push('missing footer code '+key);
    else if(await link.getAttribute('href')!==`/hoc-lieu/phong-hat-nhan?bai=${key}`)errors.push('unexpected target '+key);
   }
   if(width===1366&&code==='home'){
    await model.locator('[data-model-status]').scrollIntoViewIfNeeded();
    try { await model.locator('[data-model-status="ready"] canvas').waitFor({timeout:25000}); }
    catch { diagnostics.push('Hero screenshot model status '+await model.locator('[data-model-status]').getAttribute('data-model-status')); }
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:path.join(artifact,'public-home-1366.png')});
    const footerLinks=await footer.locator('a').evaluateAll(nodes=>nodes.map(a=>[a.href,a.innerText]));
    for(const [href,label] of footerLinks) links.set(href,label);
   }
   const info=footer.getByText('Thông tin công trình',{exact:true});
   await info.click();
   const project=await footer.locator('details[open] p').innerText();
   if(!project.includes('nhằm phát triển năng lực tự học của học sinh')||!project.includes('môn Vật lí lớp 12 ở trường THPT'))errors.push('wrong title '+project);
   if(width===390&&code==='home'){
    await footer.scrollIntoViewIfNeeded();
    await footer.screenshot({path:path.join(artifact,'public-footer-390.png')});
   }
   if(code!=='home'){
    const source=page.getByText('Nguồn khoa học và quy ước',{exact:true});
    await source.click();
    const sourceBox=page.locator('details[open]').filter({has:source});
    if(await sourceBox.count()!==1)errors.push('source expander stayed closed');
    const sourceLinks=await sourceBox.locator('a').evaluateAll(nodes=>nodes.map(a=>[a.href,a.innerText]));
    if(sourceLinks.length!==2)errors.push('science link count '+sourceLinks.length);
    for(const [href,label] of sourceLinks)links.set(href,label);
    const phases=page.getByRole('heading',{name:`Tiến trình mẫu của ${code}`}).locator('..').locator('details > summary');
    for(let n=0;n<await phases.count();n++)await phases.nth(n).click();
    if(width===390&&code==='B25'){
      const section=page.getByRole('heading',{name:`Tiến trình mẫu của ${code}`}).locator('..');
      await section.screenshot({path:path.join(artifact,'b25-phase-formulas-390.png')});
    }
   }
   const result=await page.evaluate(()=>{
    const pageWidth=document.documentElement.clientWidth;
    const formulas=[...document.querySelectorAll('.katex-html')].filter(el=>el.getClientRects().length).map(el=>{
      const rect=el.getBoundingClientRect();
      const overflow=[];
      for(let p=el.parentElement;p&&p!==document.body;p=p.parentElement){
       const css=getComputedStyle(p);const bound=p.getBoundingClientRect();
       if(/^(hidden|clip)$/.test(css.overflowX)&&(rect.right>bound.right+1||rect.left<bound.left-1))overflow.push('horizontal '+p.className);
       if(/^(hidden|clip)$/.test(css.overflowY)&&(rect.bottom>bound.bottom+1||rect.top<bound.top-1))overflow.push('vertical '+p.className);
      }
      return {overflow,width:Math.round(rect.width)};
    });
    const overflows=[...document.querySelectorAll('main *,footer *')].filter(el=>{const r=el.getBoundingClientRect();return el.getClientRects().length&&r.right>pageWidth+2&&r.width>1;}).slice(0,8).map(el=>[el.nodeName,el.className?.baseVal??el.className,Math.round(el.getBoundingClientRect().right)]);
    return {pageWidth,scrollWidth:document.documentElement.scrollWidth,formulaCount:formulas.length,formulaClips:formulas.filter(x=>x.overflow.length),overflowElements:overflows};
   });
   if(result.scrollWidth>result.pageWidth+1)errors.push('page overflow '+result.scrollWidth);
   if(result.formulaClips.length)errors.push('clipped KaTeX');
   metrics.push({width,code,...result,errors,diagnostics});
   console.log(JSON.stringify(metrics.at(-1)));
  } catch(e) {
    metrics.push({width,code,errors:[...errors,e.message],diagnostics});
    console.log(JSON.stringify(metrics.at(-1)));
  } finally { page.off('pageerror',collect); }
 }
 await page.close();
}
const internal=await Promise.all([...links].filter(([href])=>href.startsWith(base)).map(async ([href,label])=>{
 const response=await fetch(href,{signal:AbortSignal.timeout(45000)});
 return {href,label,status:response.status};
}));
console.log(JSON.stringify({internal,external:[...links].filter(([href])=>!href.startsWith(base))}));
await fs.writeFile(path.resolve(process.env.QA_RESULTS??'tmp/source-audit/public-responsive.json'),JSON.stringify({metrics,internal,external:[...links].filter(([href])=>!href.startsWith(base))},null,2));
}finally{await browser.close()}
