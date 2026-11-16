import {launchBrowser,newContext,visit} from '../../scripts/lib/browser.mjs';
const baseUrl='http://127.0.0.1:4173',browser=await launchBrowser();
const {ctx,page}=await newContext(browser,{baseUrl,lang:'en',theme:'dark',viewport:{width:320,height:1000}});
await ctx.route('**/*',r=>['font','stylesheet'].includes(r.request().resourceType())?r.continue():r.fallback());
for(const path of ['/servicos?lang=en','/orcamento?addon=maintenance&lang=en']){
 await visit(page,baseUrl,path);console.log(path,await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,fonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family),offenders:[...document.querySelectorAll('main *')].map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.slice(0,100),left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})).filter(e=>e.right>innerWidth+1||e.left< -1).slice(0,30)})));await page.screenshot({path:`artifacts/services-strategy/after/overflow-${path.includes('servicos')?'services':'quote'}.png`});
}await browser.close();
