import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_CORE_PATH);
const {createServerClient}=require('@supabase/ssr');
process.loadEnvFile('.env.local');
const base=process.env.BASE_URL||'http://127.0.0.1:3476';
const root=process.cwd();
const out=path.resolve(process.env.ARTIFACT_DIR||'tmp/ui-audit/teacher');
const photos=path.resolve(process.env.PHOTO_DIR||'docs/previews/ui-consistency/before');
await mkdir(out,{recursive:true});await mkdir(photos,{recursive:true});
const fixture=JSON.parse(await readFile('tmp/sgk-phase-qa/fixture.json','utf8'));
const others=JSON.parse(await readFile('tmp/sgk-phase-b24-b25/fixture.json','utf8'));
const cls=fixture.classId, lesson=fixture.lessons.B21;
const routes=[
 ['overview','/teacher','Tổng quan'],
 ['classes','/teacher/classes','Danh sách lớp'],
 ['class-new','/teacher/classes/new','Tạo lớp'],
 ['class-detail',`/teacher/classes/${cls}`,'Quản trị lớp'],
 ['class-curriculum-redirect',`/teacher/classes/${cls}/curriculum`,'Tuyến cũ chuyển chương trình'],
 ['curriculum','/teacher/curriculum','Chương trình'],
 ['curriculum-selected',`/teacher/curriculum?classId=${cls}`,'Chương trình theo lớp'],
 ['curriculum-chapter',`/teacher/curriculum/IV?classId=${cls}`,'Chương IV'],
 ['lessons',`/teacher/lessons?classId=${cls}`,'Năm bài'],
 ['lesson-overview',`/teacher/lessons/${lesson}`,'Tổng quan bài'],
 ['lesson-before',`/teacher/lessons/${lesson}/before-class`,'Trước giờ học'],
 ['lesson-during',`/teacher/lessons/${lesson}/in-class`,'Trong giờ học'],
 ['lesson-after',`/teacher/lessons/${lesson}/after-class`,'Sau giờ học'],
 ['lesson-results',`/teacher/lessons/${others.lessons.B25}/ket-qua?phase=after_class`,'Minh chứng theo học sinh'],
 ['materials','/teacher/materials','Kho học liệu'],
 ['materials-assessment','/teacher/materials?type=assessment','Đề kiểm tra trong kho'],
 ['plans','/teacher/plans','Bàn soạn kế hoạch'],
 ['workroom','/teacher/ai','Ngân hàng đề và công cụ giáo viên'],
 ['students','/teacher/students','Học sinh và kết quả'],
];
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const report=[];
async function capture(page,name,route,group,width){
 const record={name,route,group,width};const errors=[];
 const note=e=>errors.push(e.message);page.on('pageerror',note);
 try{
  if(route){const response=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:60000});record.status=response.status();}
  await page.locator('main').waitFor({timeout:15000});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(250);
  record.actualRoute=new URL(page.url()).pathname+new URL(page.url()).search;
  record.headings=await page.locator('main h1,main h2').allTextContents();
  record.alerts=await page.locator('main [role=alert]').allTextContents();
  record.layout=await page.evaluate(()=>{
   const root=document.documentElement;
   const style=el=>{const s=getComputedStyle(el);return {font:s.fontFamily,size:s.fontSize,color:s.color,background:s.backgroundColor,border:s.borderColor,radius:s.borderRadius,padding:s.padding};};
   const main=document.querySelector('main');
   const overflows=[...main.querySelectorAll('*')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&r.right>innerWidth+2&&getComputedStyle(el).position!=='fixed'&&!el.closest('math,semantics')}).slice(0,10).map(el=>({tag:el.tagName,class:el.className,text:el.textContent.slice(0,90),right:Math.round(el.getBoundingClientRect().right)}));
   return {viewport:innerWidth,scrollWidth:root.scrollWidth,mainWidth:main.getBoundingClientRect().width,body:style(document.body),h1:main.querySelector('h1')?style(main.querySelector('h1')):null,primary:main.querySelector('.btn.primary')?style(main.querySelector('.btn.primary')):null,overflows};
  });
  await page.screenshot({path:path.join(photos,`teacher-${name}-${width}.png`),timeout:Number(process.env.QA_SHOT_TIMEOUT||15000)});
 }catch(error){record.error=error.message;await page.screenshot({path:path.join(photos,`teacher-${name}-${width}-error.png`)}).catch(()=>{});}
 record.errors=errors;page.off('pageerror',note);report.push(record);
 await writeFile(path.join(out,`inventory-${width}${process.env.QA_EXTRAS_ONLY?'-extras':''}.json`),JSON.stringify(report.filter(r=>r.width===width),null,2)+'\n');
 console.log(JSON.stringify({name,width,status:record.status,error:record.error,scrollWidth:record.layout?.scrollWidth,alerts:record.alerts?.length,pageErrors:errors.length}));
}
try{
 for(const width of (process.env.QA_WIDTHS||'1366,390').split(',').map(Number)){
  const context=await browser.newContext({viewport:{width,height:width<=390?844:width===768?1024:950},isMobile:width<=390,hasTouch:width<=390,reducedMotion:'reduce'});
  const page=await context.newPage();page.setDefaultTimeout(15000);
  const client=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{cookies:{getAll:()=>[],setAll:async cookies=>{await context.addCookies(cookies.map(({name,value})=>({name,value,url:base})));}}});
  const signed=await client.auth.signInWithPassword({email:'b23-gv@example.com',password:process.env.B23_TEST_PASSWORD||['TestB23','Pass!'].join('')});
  if(signed.error)throw new Error(signed.error.message);
  for(const [name,route,group]of (process.env.QA_EXTRAS_ONLY?[]:routes))await capture(page,name,route,group,width);
  await page.goto(base+'/teacher/ai',{waitUntil:'domcontentloaded',timeout:60000});
  for(const [name,label]of [['workroom-worksheet','Phiếu học tập ba pha'],['workroom-preparation','Chuẩn bị giờ học'],['workroom-bank','Ngân hàng đề']]){
   await page.getByRole('button',{name:label,exact:true}).click();await capture(page,name,null,label,width);
  }
  const matrix=page.getByRole('button',{name:/ma trận/i}).filter({hasText:/Tạo đề|Ma trận/i});
  if(await matrix.count()){
   await matrix.first().click();await capture(page,'workroom-matrix',null,'Ma trận đề',width);
  }
  await page.goto(`${base}/teacher/lessons/${lesson}/before-class`,{waitUntil:'domcontentloaded',timeout:60000});
  const row=page.locator('.pathway-step-row').first();
  await row.getByRole('button',{name:/Chỉnh sửa/}).click();
  await page.getByRole('dialog').waitFor();await capture(page,'lesson-editor',null,'Soạn bước và công thức',width);
  await page.getByRole('button',{name:'Đóng trình soạn thảo',exact:true}).click();
  await row.getByRole('button',{name:/Xem trước/}).click();
  await page.getByRole('dialog').waitFor();await capture(page,'lesson-preview',null,'Xem trước bước đã giao',width);
  await page.getByRole('button',{name:'Đóng xem trước',exact:true}).click();
  await context.close();
 }
 await writeFile(path.join(out,'inventory.json'),JSON.stringify({base,readOnly:true,routes:report},null,2)+'\n');
}finally{await browser.close();}
