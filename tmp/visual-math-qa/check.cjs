const {chromium}=require(process.env.PLAYWRIGHT_CORE_PATH);
const wait = {waitUntil:'domcontentloaded',timeout:60000};
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
for (const width of [320,390,768,1366]) {
const page=await browser.newPage({viewport:{width,height:900}, reducedMotion:'reduce'});
page.on('pageerror',error=>console.log('PAGEERROR',width,error.message));
await page.goto('http://localhost:3000/hoc-lieu/truc-quan?bai=B23',wait);
await page.locator('.visual-studio').waitFor();
const res=await page.evaluate(()=>({width:innerWidth,doc:document.documentElement.scrollWidth,text:document.querySelector('h1')?.textContent,over:[...document.querySelectorAll('.visual-studio *')].filter(e=>e instanceof HTMLElement&&e.getBoundingClientRect().right>innerWidth+3&&e.getBoundingClientRect().width>15).slice(0,14).map(e=>[e.tagName,e.className,e.textContent?.slice(0,30),Math.round(e.getBoundingClientRect().right)])}));
console.log(width,JSON.stringify(res)); await page.screenshot({path:'tmp/visual-math-qa/baseline-'+width+'.png'}); await page.close(); }
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
