const {chromium}=require(process.env.PLAYWRIGHT_CORE_PATH);
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
const page=await browser.newPage({viewport:{width:390,height:880},reducedMotion:'reduce'});
page.setDefaultTimeout(22000);
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.goto((process.env.VISUAL_QA_URL||'http://localhost:3000')+'/hoc-lieu/truc-quan?bai=B22',{waitUntil:'domcontentloaded',timeout:120000});
await page.waitForTimeout(3500);
const invoke = (name) => page.evaluate((label) => {
 const button = [...document.querySelectorAll('button')].find(el=>el.offsetWidth&&el.textContent.trim()===label);
 if (!button) throw new Error('Button missing: '+label);
 button.click();
},name);
await invoke('Mô phỏng 4 bước dẫn dắt');
console.log('mode opened');
const guided=page.locator('.guided-fission').filter({visible:true});
await invoke('Bắt đầu thí nghiệm 3D');
console.log('started');
await guided.locator('canvas').waitFor();
await invoke('04Mảnh phân hạch tách ra');
assert.match(await guided.locator('.fission-live-counts').textContent(),/39p, 56n.*53p, 85n.*3 neutron/);
for(const [width,view] of [[1366,'Bên cạnh'],[768,'Từ trên'],[390,'Phía trước']]){
 await page.setViewportSize({width,height:880});
 await invoke(view);
 await page.evaluate(()=>document.querySelector('.fission-stage').scrollIntoView({block:'center'}));
 await page.waitForTimeout(4000);
 await page.screenshot({path:'docs/previews/sgk-alignment/b22-phan-hach-'+width+'.png',timeout:25000});
 console.log(width,view);
}
assert.deepEqual(errors,[]);
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
