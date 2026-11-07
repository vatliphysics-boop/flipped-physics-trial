const {chromium}=require(process.env.PLAYWRIGHT_CORE_PATH);
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
const page=await browser.newPage({viewport:{width:390,height:880},reducedMotion:'reduce'});
page.setDefaultTimeout(22000);
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.goto((process.env.VISUAL_QA_URL||'http://localhost:3000')+'/hoc-lieu/truc-quan?bai=B22',{waitUntil:'domcontentloaded',timeout:120000});
await page.getByText('Mô phỏng 4 bước dẫn dắt',{exact:true}).press("Enter");
console.log('mode opened');
const guided=page.locator('.guided-fission').filter({visible:true});
await guided.getByText('Bắt đầu thí nghiệm 3D',{exact:true}).press("Enter");
console.log('started');
await guided.locator('canvas').waitFor();
await guided.locator('.fission-steps button').nth(3).press("Enter");
assert.match(await guided.locator('.fission-live-counts').textContent(),/39p, 56n.*53p, 85n.*3 neutron/);
for(const [width,view] of [[390,'Phía trước'],[768,'Từ trên'],[1366,'Bên cạnh']]){
 await page.setViewportSize({width,height:880});
 await guided.getByText(view,{exact:true}).press("Enter");
 await guided.locator('.fission-stage').screenshot({path:'docs/previews/sgk-alignment/b22-phan-hach-'+width+'.png',timeout:22000});
 console.log(width,view);
}
assert.deepEqual(errors,[]);
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
