import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_CORE_PATH);
const base=process.env.BASE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({executablePath:process.env.CHROME_PATH});
const folder=path.resolve('docs/previews/physics-process'); await mkdir(folder,{recursive:true});
async function range(locator,value){await locator.evaluate((el,value)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,String(value));el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));},value);}
try {
 for(const width of [1366,390,320,768]) {
  const page=await browser.newPage({viewport:{width,height:900}});
  const errors=[]; page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'/hoc-lieu/phong-hat-nhan?bai=B23#qua-trinh',{waitUntil:'domcontentloaded'});
  let lab=page.locator('[data-process="B23"][data-process-ready="true"]'); await lab.waitFor();
  await lab.getByRole('button',{name:'Bắt đầu',exact:true}).click();
  await page.waitForTimeout(600);
  await lab.getByRole('button',{name:'Tạm dừng',exact:true}).click();
  let paused=await lab.locator('[data-time]').innerText();await page.waitForTimeout(350);assert.equal(await lab.locator('[data-time]').innerText(),paused);
  await lab.getByRole('button',{name:'Đặt lại',exact:true}).click();assert.equal(await lab.locator('[data-time]').innerText(),'0.0 s');assert.equal(await lab.locator('[data-remaining]').innerText(),'64');
  for(let i=0;i<20;i++)await lab.getByRole('button',{name:'Từng bước 1 s',exact:true}).click();
  const actual=await lab.locator('[data-remaining]').innerText();
  await lab.getByRole('button',{name:'Đặt lại',exact:true}).click();for(let i=0;i<20;i++)await lab.getByRole('button',{name:'Từng bước 1 s',exact:true}).click();assert.equal(await lab.locator('[data-remaining]').innerText(),actual);
  await lab.getByRole('button',{name:'Lưu điều kiện để so sánh',exact:true}).click();await range(lab.getByLabel('Chu kì bán rã T',{exact:true}),40);
  for(let i=0;i<20;i++)await lab.getByRole('button',{name:'Từng bước 1 s',exact:true}).click();assert(+await lab.locator('[data-remaining]').innerText()>=+actual);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'B23 overflow '+width);
  await lab.locator('svg').first().scrollIntoViewIfNeeded();await page.screenshot({path:folder+`/b23-process-${width}.png`});
  assert.deepEqual(errors,[]);
  await page.goto(base+'/hoc-lieu/phong-hat-nhan?bai=B25#qua-trinh',{waitUntil:'domcontentloaded'});
  lab=page.locator('[data-process="B25"][data-process-ready="true"]');await lab.waitFor();
  await lab.getByRole('button',{name:'Hiện đường lí thuyết',exact:true}).click();
  await lab.getByRole('button',{name:'Đối chiếu tại 30 giây',exact:true}).click();assert.equal(await lab.locator('[data-theory]').innerText(),'89.79 Bq');
  await range(lab.getByLabel('T ước lượng của em',{exact:true}),60);assert.equal(await lab.locator('[data-theory]').innerText(),'106.77 Bq');
  await lab.getByRole('button',{name:'So sánh thêm T = 40 s',exact:true}).click();
  await lab.getByRole('button',{name:'Đặt lại',exact:true}).click();
  await lab.getByRole('button',{name:'Bắt đầu',exact:true}).click();await page.waitForTimeout(550);await lab.getByRole('button',{name:'Tạm dừng',exact:true}).click();paused=await lab.locator('[data-time]').innerText();await page.waitForTimeout(300);assert.equal(await lab.locator('[data-time]').innerText(),paused);
  await lab.getByRole('button',{name:'Đối chiếu tại 30 giây',exact:true}).click();
  assert.equal(await lab.locator('tbody tr').count(),8);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'B25 overflow '+width);
  await lab.locator('svg').scrollIntoViewIfNeeded();await page.screenshot({path:folder+`/b25-process-${width}.png`});
  assert.deepEqual(errors,[]);console.log(`PASS B23/B25 ${width}px: timeline, pause/reset, repeat seed, parameter comparison, source table, layout`);
  await page.close();
 }
}finally{await browser.close();}
