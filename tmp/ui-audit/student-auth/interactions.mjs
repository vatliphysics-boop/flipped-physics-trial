import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_CORE_PATH);
process.loadEnvFile('.env.local');
const {createClient}=require('@supabase/supabase-js');
const base=process.env.BASE_URL;
assert(base,'BASE_URL must point to coordinated UI production server');
const lesson='2455fc0f-dfa2-4e56-9924-b887564a1a93';
const email='b23-hs1@example.com', password=['TestB23','Pass!'].join('');
const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
const {data:session,error}=await client.auth.signInWithPassword({email,password});assert(!error,error?.message);
async function snapshot(){
 const rows={};
 for(const table of ['student_phase_progress','student_step_progress','lesson_reflections']){
  const {data,error}=await client.from(table).select('*').eq('lesson_id',lesson).eq('student_id',session.user.id);
  assert(!error,error?.message);const sorted=data.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
  rows[table]={count:data.length,sha256:createHash('sha256').update(JSON.stringify(sorted)).digest('hex')};
 }
 return rows;
}
const before=await snapshot();
await writeFile('tmp/ui-audit/student-auth/progress-before.json',JSON.stringify(before,null,2));
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const results=[],writes=[];
results.push=function(...items){for(const item of items)console.log('PASS',item.case);return Array.prototype.push.apply(this,items);};
await mkdir('docs/previews/ui-consistency/after',{recursive:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:950},reducedMotion:'reduce'});
 const page=await context.newPage();page.setDefaultTimeout(25000);
 await page.goto(base+'/login?next=%2Fstudent%2Fclasses',{waitUntil:'domcontentloaded'});
 await page.getByLabel('Địa chỉ Email',{exact:true}).fill(email);
 await page.getByLabel('Mật khẩu',{exact:true}).fill(password);
 await page.getByRole('button',{name:'Hiện mật khẩu',exact:true}).click();
 assert.equal(await page.locator('#password').getAttribute('type'),'text');
 assert.equal(await page.getByRole('button',{name:'Ẩn mật khẩu',exact:true}).getAttribute('aria-pressed'),'true');
 await page.getByRole('button',{name:'Ẩn mật khẩu',exact:true}).click();
 await page.getByRole('button',{name:/Đăng nhập vào lớp học/}).click();
 await page.waitForURL(url=>url.pathname==='/student/classes');
 await page.getByRole('heading',{name:'Lớp học của em',exact:true}).waitFor();
 results.push({case:'login-role-and-next-route',pass:true});
 page.on('request',r=>{if(['POST','PUT','PATCH','DELETE'].includes(r.method()))writes.push({method:r.method(),url:r.url()});});
 const join=page.getByLabel('Mã tham gia lớp',{exact:true});await join.fill('XX');
 assert.equal(await join.evaluate(e=>e.checkValidity()),false);
 assert((await join.boundingBox()).width>=120);
 await join.fill('');
 assert.equal(await page.getByText('Tiến độ:').count(),0);
 assert(await page.getByText('Đã tham gia:',{exact:false}).count());
 results.push({case:'responsive-join-field-and-real-metadata',pass:true});
 for(const phase of ['before-class','in-class','after-class']){
  const targetPath=`/student/lessons/${lesson}/${phase}`;
  if(phase==='before-class') await page.goto(base+targetPath,{waitUntil:'domcontentloaded'});
  else { await page.getByRole('navigation',{name:'Ba pha bài học',exact:true}).locator(`a[href="${targetPath}"]`).click(); await page.waitForURL(url=>url.pathname===targetPath); }
  const nav=page.getByRole('navigation',{name:'Ba pha bài học',exact:true});
  assert.equal(await nav.locator('[aria-current="step"]').getAttribute('href'),`/student/lessons/${lesson}/${phase}`);
  assert.equal(await nav.getByRole('link').count(),3);
  const values=await page.locator('textarea').evaluateAll(items=>items.map(e=>e.value));
  await page.reload({waitUntil:'domcontentloaded'});await nav.waitFor();
  assert.deepEqual(await page.locator('textarea').evaluateAll(items=>items.map(e=>e.value)),values);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  results.push({case:`phase-${phase}-navigation-persisted-evidence`,pass:true,fields:values.length});
 }
 await page.goto(base+'/student',{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'Mở menu',exact:true}).click();
 const menu=page.getByRole('dialog',{name:'Menu di động',exact:true});await menu.waitFor();
 await page.keyboard.press('Escape');await menu.waitFor({state:'hidden'});
 await page.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='Mở menu');
 await page.getByRole('button',{name:'Mở menu',exact:true}).click();
 await page.getByRole('dialog',{name:'Menu di động',exact:true}).getByRole('link',{name:'Nhật kí học tập',exact:true}).click();
 await page.waitForURL(url=>url.pathname==='/student/journal');
 assert.equal(await page.getByRole('dialog',{name:'Menu di động',exact:true}).count(),0);
 results.push({case:'mobile-menu-navigation-escape-and-focus-restore',pass:true});
 for(const path of ['/student/assignments','/student/curriculum/IV','/student/ai?bai=B23','/student/materials']){
  await page.goto(base+path,{waitUntil:'domcontentloaded'});await page.locator('.page-header h1').waitFor();
 }
 results.push({case:'student-screens-read-only-navigation',pass:true});
 const publicContext=await browser.newContext({viewport:{width:390,height:950},reducedMotion:'reduce'});
 const form=await publicContext.newPage();
 await form.goto(base+'/register',{waitUntil:'domcontentloaded'});
 await form.locator('.role-selector label').filter({hasText:'Giáo viên'}).click();
 assert.equal(await form.getByLabel('Giáo viên',{exact:true}).isChecked(),true);
 assert(await form.getByRole('button',{name:/Tạo tài khoản Giáo viên/}).count());
 await form.locator('.role-selector label').filter({hasText:'Học sinh'}).click();
 assert.equal(await form.getByLabel('Học sinh',{exact:true}).isChecked(),true);
 assert(await form.getByRole('button',{name:/Tạo tài khoản Học sinh/}).count());
 assert.equal(await form.locator('#email').evaluate(e=>e.checkValidity()),false);
 results.push({case:'register-role-toggle-and-empty-validation-no-submit',pass:true});
 await form.goto(base+'/auth/verified?status=error&message=Li%C3%AAn%20k%E1%BA%BFt%20%C4%91%C3%A3%20h%E1%BA%BFt%20h%E1%BA%A1n.',{waitUntil:'domcontentloaded'});
 await form.locator('section[aria-labelledby="verification-title"] [role="alert"]').waitFor();
 assert(await form.getByRole('link',{name:/Chuyển tới trang đăng nhập/}).count());
 results.push({case:'verified-expired-state-and-recovery-links',pass:true});
 const after=await snapshot();assert.deepEqual(after,before,'QA progress unchanged');assert.deepEqual(writes,[],'Navigation makes no data mutations');
 results.push({case:'qa-progress-hashes-unchanged-no-write-requests',pass:true});
 await writeFile('tmp/ui-audit/student-auth/interactions.json',JSON.stringify({base,results,before,after,writes},null,2));
 console.log(JSON.stringify(results,null,2));
}finally{const finalProgress=await snapshot();await writeFile('tmp/ui-audit/student-auth/progress-after.json',JSON.stringify(finalProgress,null,2));await writeFile('tmp/ui-audit/student-auth/interactions-checkpoint.json',JSON.stringify({results,before,after:finalProgress,writes},null,2));await browser.close();await client.auth.signOut();}
