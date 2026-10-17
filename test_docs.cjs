const {chromium}=require('playwright');
const Axe=require('@axe-core/playwright').default;
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const origin='https://fix-no-fabricated-success-20.nexus-hybrid-devtools.pages.dev';
(async()=>{
 const browser=await chromium.launch({...(process.env.NEXUS_BROWSER_CHANNEL?{channel:process.env.NEXUS_BROWSER_CHANNEL}:{})});
 const evidence={origin,viewports:[]};
 fs.mkdirSync('evidence',{recursive:true});
 try{
  for(const width of [320,768,1024,1440]){
   const context=await browser.newContext({viewport:{width,height:900}});
   const page=await context.newPage();
   const errors=[];page.on('pageerror',e=>errors.push(e.name));
   const response=await page.goto(origin,{waitUntil:'networkidle'});
   assert.equal(response.status(),200);
   const contentHash=crypto.createHash('sha256').update(await response.body()).digest('hex');
   if(process.env.NEXUS_DOCS_EXPECTED_SHA256) assert.equal(contentHash,process.env.NEXUS_DOCS_EXPECTED_SHA256);
   assert.ok(response.headers()['content-security-policy'].includes("default-src 'none'"));
   assert.equal(await page.getByRole('heading',{name:'Adapters with verifiable outcomes.'}).count(),1);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'documentation overflow at '+width);
   await page.keyboard.press('Tab');
   assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Skip to documentation');
   await page.keyboard.press('Enter');
   assert.equal(await page.evaluate(()=>document.activeElement.id),'main');
   const audit=await new Axe({page}).analyze();
   assert.deepEqual(audit.violations,[]);assert.deepEqual(errors,[]);
   await page.screenshot({path:'evidence/docs-'+width+'.png'});
   evidence.viewports.push({width,status:response.status(),contentHash,exactSourceHashChecked:!!process.env.NEXUS_DOCS_EXPECTED_SHA256,securityHeaders:true,keyboardSkip:true,violations:0,incomplete:audit.incomplete.map(x=>x.id)});
   await context.close();
  }
  console.log('PASS: deployed documentation content, security headers, responsive layout, keyboard skip and axe');
 }finally{fs.writeFileSync('evidence/docs-preview.json',JSON.stringify(evidence,null,2));await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
