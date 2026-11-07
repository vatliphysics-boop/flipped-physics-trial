const {chromium}=require(process.env.PLAYWRIGHT_CORE_PATH);
const assert=require('node:assert/strict');
const base=process.env.VISUAL_QA_URL || 'http://localhost:3000';
const folder='docs/previews/sgk-alignment';
(async()=>{const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
const p=await b.newPage({viewport:{width:390,height:880},reducedMotion:'reduce'});
p.setDefaultTimeout(12000);
p.on('pageerror',e=>console.log('PAGE_ERROR',e.message));
const go=code=>p.goto(base+'/hoc-lieu/truc-quan?bai='+code,{waitUntil:'domcontentloaded',timeout:120000});
await go('B23');
for (const width of [320,390,768,1366]) {
  await p.setViewportSize({width,height:880});
  await p.locator('h3').filter({hasText:'Hệ thức Toán'}).first().scrollIntoViewIfNeeded();
  await p.screenshot({path:folder+'/truc-quan-b23-'+width+'.png'});
  console.log('wrote B23',width);
}
await go('B25');
await p.getByText('Sơ đồ vector tĩnh để in phiếu học tập / chèn PowerPoint (B25)', {exact:true}).click();
await p.locator('.infographic-image img').evaluate(el=>el.decode());
for (const width of [390,1366]) {
  await p.setViewportSize({width,height:880});
  await p.locator('.infographic-image').first().screenshot({path:folder+'/b25-infographic-'+width+'.png'});
  console.log('wrote B25',width);
}
await go('B22');
await p.getByRole('button',{name:'Mô phỏng 4 bước dẫn dắt',exact:true}).click();
await p.getByRole('button',{name:'Bắt đầu thí nghiệm 3D',exact:true}).click();
await p.locator('.fission-stage canvas').waitFor();
await p.getByRole('button',{name:/Mảnh phân hạch tách ra/}).click();
assert.match(await p.locator('.fission-live-counts').first().textContent(),/39p, 56n.*53p, 85n.*3 neutron/);
for (const [width,view] of [[390,'Phía trước'],[768,'Từ trên'],[1366,'Bên cạnh']]) {
  await p.setViewportSize({width,height:880});
  await p.getByRole('button',{name:view,exact:true}).click();
  await p.locator('.fission-stage').first().screenshot({path:folder+'/b22-phan-hach-'+width+'.png'});
  console.log('wrote B22',width,view);
}
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
