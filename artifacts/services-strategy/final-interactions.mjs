import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {launchBrowser,newContext,visit} from '../../scripts/lib/browser.mjs';
const baseUrl='http://127.0.0.1:4173';const browser=await launchBrowser();const results=[];
try{
 for(const theme of ['dark','light']){
  const {ctx,page}=await newContext(browser,{baseUrl,lang:'pt',theme,viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
  await ctx.route('**/*',route=>['font','stylesheet'].includes(route.request().resourceType())?route.continue():route.fallback());
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push({message:m.text(),location:m.location()})});
  page.on('requestfailed',r=>console.log('REQUEST_FAILED',r.url(),r.failure()));
  await visit(page,baseUrl,'/servicos');
  for(const id of ['catalogo','web','personalizar','processo','duvidas']){
   await page.locator(`.services-nav a[href="#${id}"]`).click();await page.waitForTimeout(700);
   const heading=page.locator(`#${id} h2`).first();const box=await heading.boundingBox();assert(box.y>=75,`${id} under fixed header`);
  }
  await page.locator('.services-nav a[href="#web"]').click();await page.waitForTimeout(700);
  await page.screenshot({path:`artifacts/services-strategy/after/plans-anchor-${theme}.png`});
  const button=page.locator('#web a[href*="service=express"]');await button.hover();await page.keyboard.press('Tab');
  await button.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
  assert.equal(await button.evaluate(el=>getComputedStyle(el).outlineStyle),'solid');
  for(const id of ['site-personalizado','ti-personalizada','manutencao']){
   await page.locator(`#${id}`).evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-100,behavior:'instant'}));
   await page.screenshot({path:`artifacts/services-strategy/after/${id}-${theme}.png`});
  }
  assert.deepEqual(errors,[]);
  const fonts=await page.evaluate(()=>({cabinet:document.fonts.check('700 20px "Cabinet Grotesk"'),general:document.fonts.check('400 16px "General Sans"')}));
  assert(fonts.cabinet && fonts.general);
  await visit(page,baseUrl,'/servicos');await page.screenshot({path:`artifacts/services-strategy/after/live-fonts-${theme}-1440.png`});
  for(const width of [320,360,768]){await page.setViewportSize({width,height:1000});
   for(const path of ['/servicos?lang=en','/orcamento?addon=maintenance&lang=en']){await visit(page,baseUrl,path);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);}
   await visit(page,baseUrl,'/servicos');await page.screenshot({path:`artifacts/services-strategy/after/live-fonts-${theme}-${width}.png`});
  }
  assert.deepEqual(errors,[]);results.push({theme,anchors:true,focus:true,hover:true,consoleErrors:0,fonts,widths:[320,360,768,1440],overflow:false});await ctx.close();
 }
 const {ctx,page}=await newContext(browser,{baseUrl,lang:'en',theme:'light',viewport:{width:320,height:800}});
 for(const path of ['/servicos?lang=en','/orcamento?addon=maintenance&lang=en']){await visit(page,baseUrl,path);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);}
 results.push({width:320,lang:'en',overflow:false});await ctx.close();writeFileSync('artifacts/services-strategy/after/interactions.json',JSON.stringify(results,null,2));console.log('passed anchors, focus, hover, console, and 320px');
}finally{await browser.close()}
