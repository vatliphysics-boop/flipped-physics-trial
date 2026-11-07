import {createRequire} from "node:module";
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_CORE_PATH);
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH});
try{
 const page=await browser.newPage({viewport:{width:320,height:900},reducedMotion:"reduce"});
 for(const width of [320,390,768,1366]){
   await page.setViewportSize({width,height:900});
   await page.goto("http://127.0.0.1:3476/hoc-lieu/truc-quan?bai=B24",{waitUntil:"domcontentloaded",timeout:90000});
   const lab=page.locator(".physics-lab").filter({hasText:"Khám phá phản ứng dây chuyền và dòng năng lượng"});
   const rod=lab.getByRole("slider",{name:/Thanh điều khiển cắm sâu/});
   await rod.press("End");
   for(let i=0;i<4;i++)await lab.getByRole("button",{name:"Tiến một bước",exact:true}).click();
   const chain=lab.getByRole("img",{name:/Các đường đi quy ước/});
   await chain.evaluate(element=>element.scrollIntoView({block:"center",behavior:"instant"}));
   await page.screenshot({path:`tmp/nuclear-process/b22-b24-final/b24-chain-${width}.png`});
   await lab.getByRole("button",{name:"Dòng năng lượng",exact:true}).click();
   await lab.getByRole("button",{name:"Bình ngưng",exact:true}).click();
   const flow=lab.getByRole("img",{name:/Hai vòng nước cách li/});
   await flow.evaluate(element=>element.scrollIntoView({block:"center",behavior:"instant"}));
   await page.screenshot({path:`tmp/nuclear-process/b22-b24-final/b24-${width}.png`});
   console.log("Captured readable B24 modes",width);
 }
}finally{await browser.close();}
