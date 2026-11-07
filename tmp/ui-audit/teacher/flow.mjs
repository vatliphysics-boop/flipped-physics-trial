import {createRequire} from 'node:module';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_CORE_PATH);
const {createServerClient}=require('@supabase/ssr');
process.loadEnvFile('.env.local');
const base=process.env.BASE_URL;
if(!base)throw Error('BASE_URL required');
const out='tmp/ui-audit/teacher';
const photos='docs/previews/ui-consistency/after';
await mkdir(photos,{recursive:true});
const fixture=JSON.parse(await readFile('tmp/sgk-phase-qa/fixture.json','utf8'));
const lesson=fixture.lessons.B21;
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const result={base,checks:[],writes:'Only dedicated [QA] class; restoration required',restored:false};
let original,teacherClient,page;
async function session(email,width){
 const context=await browser.newContext({viewport:{width,height:950},reducedMotion:'reduce'});
 const client=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{cookies:{getAll:()=>[],setAll:async cookies=>{await context.addCookies(cookies.map(({name,value})=>({name,value,url:base})));}}});
 const signed=await client.auth.signInWithPassword({email,password:process.env.B23_TEST_PASSWORD||['TestB23','Pass!'].join('')});
 if(signed.error)throw signed.error;
 const p=await context.newPage();p.setDefaultTimeout(20000);
 return {page:p,client};
}
const nav={waitUntil:'domcontentloaded',timeout:60000};
async function snapshot(){
 const r=await teacherClient.from('student_step_progress').select('id,step_id,is_completed,evidence').eq('step_id',original.id).order('id');
 if(r.error)throw r.error;return r.data;
}
try{
 ({page,client:teacherClient}=await session('b23-gv@example.com',1366));
 const {data:cls,error:ce}=await teacherClient.from('classes').select('name').eq('id',fixture.classId).single();
 if(ce)throw ce;assert.match(cls.name,/^\[QA\]/);
 const {data:step,error:se}=await teacherClient.from('lesson_pathway_steps').select('*').eq('lesson_id',lesson).eq('phase','before_class').order('step_order').limit(1).single();
 if(se)throw se;original=step;
 await writeFile(path.join(out,'flow-backup.json'),JSON.stringify(original,null,2)+'\n');
 const priorProgress=await snapshot();
 await page.goto(`${base}/teacher/lessons/${lesson}/before-class`,nav);
 let row=page.locator('.pathway-step-row').first();
 if(original.is_published){await row.getByRole('button',{name:'Chuyển về nháp',exact:true}).click();await row.getByText('Bản nháp',{exact:true}).waitFor();}
 result.checks.push('Teacher switched QA step to draft');
 await row.getByRole('button',{name:/Chỉnh sửa/}).click();
 const input=page.locator('#editor-step-instructions');
 await input.fill((original.instructions||'')+'\n\n[QA] Kiểm tra đồng bộ giao diện và công thức.\n');
 await input.focus();await input.press('ControlOrMeta+End');
 await page.locator('#formula-latex-input').fill('N=A-Z');
 await page.locator('.formula-mode-switch input[value=block]').check();
 await page.getByRole('button',{name:'+ Chèn vào nhiệm vụ',exact:true}).click();
 assert.match(await input.inputValue(),/N=A-Z/);
 assert(await page.locator('.formula-live-preview-box .katex').count());
 await page.getByRole('button',{name:/Lưu thay đổi bước học/}).click();
 await page.getByText('Đã lưu thành công',{exact:false}).first().waitFor();
 await page.screenshot({path:path.join(photos,'teacher-flow-formula-saved-1366.png')});
 result.checks.push('Inserted professional formula with live KaTeX and saved draft');
 await page.getByRole('button',{name:'Đóng trình soạn thảo',exact:true}).click();
 await page.reload(nav);row=page.locator('.pathway-step-row').first();
 await row.getByRole('button',{name:/Chỉnh sửa/}).click();
 assert.match(await input.inputValue(),/N=A-Z/);
 await page.getByRole('button',{name:'Đóng trình soạn thảo',exact:true}).click();
 result.checks.push('Saved draft formula survived reload');
 const student=await session('b23-hs1@example.com',390);
 await student.page.goto(`${base}/student/lessons/${lesson}/before-class`,nav);
 assert.equal(await student.page.getByText('[QA] Kiểm tra đồng bộ giao diện và công thức.',{exact:false}).count(),0);
 result.checks.push('Draft hidden from enrolled student');
 const previewWrites=[];
 const onrequest=req=>{if(['POST','PUT','PATCH','DELETE'].includes(req.method()))previewWrites.push({method:req.method(),path:new URL(req.url()).pathname});};
 page.on('request',onrequest);
 await row.getByRole('button',{name:/Xem trước/}).click();
 const preview=page.getByRole('dialog',{name:/Xem trước:/});
 await preview.waitFor();assert(await preview.locator('.katex').count());
 const openVideo=preview.getByRole('button',{name:/Mở video B21/});
 if(await openVideo.count()){await openVideo.click();await preview.locator('video').waitFor();}
 await page.screenshot({path:path.join(photos,'teacher-flow-draft-preview-1366.png')});
 await page.getByRole('button',{name:'Đóng xem trước',exact:true}).click();
 page.off('request',onrequest);
 assert.deepEqual(previewWrites,[]);assert.deepEqual(await snapshot(),priorProgress);
 result.checks.push('Preview uses actual video/math without mutation requests or progress change');
 await row.getByRole('button',{name:'Giao cho học sinh',exact:true}).click();
 await row.getByText('Đã giao',{exact:true}).waitFor();
 await student.page.reload(nav);
 await student.page.getByText('[QA] Kiểm tra đồng bộ giao diện và công thức.',{exact:false}).first().waitFor();
 assert(await student.page.locator('.katex').count());
 await student.page.screenshot({path:path.join(photos,'teacher-flow-assigned-student-390.png')});
 result.checks.push('Teacher assigned draft; enrolled student sees saved mathematical task');
}catch(error){result.error=error.stack||error.message;console.error(error.message);}
finally{
 if(original&&teacherClient){
  // Restore exact fields on this confirmed QA-only row, even if UI assertions fail.
  const restored=await teacherClient.from('lesson_pathway_steps').update({title:original.title,instructions:original.instructions,is_required:original.is_required,is_published:original.is_published}).eq('id',original.id).eq('lesson_id',lesson).select('title,instructions,is_required,is_published').single();
  if(restored.error)result.restoreError=restored.error.message;
  else {assert.deepEqual(restored.data,{title:original.title,instructions:original.instructions,is_required:original.is_required,is_published:original.is_published});result.restored=true;}
 }
 await writeFile(path.join(out,'flow-report.json'),JSON.stringify(result,null,2)+'\n');
 await browser.close();
}
console.log(JSON.stringify(result,null,2));
if(result.error||!result.restored)process.exitCode=1;
