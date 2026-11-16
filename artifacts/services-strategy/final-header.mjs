import assert from 'node:assert/strict';import {writeFileSync} from 'node:fs';
import {launchBrowser,newContext,visit} from '../../scripts/lib/browser.mjs';
const baseUrl='http://127.0.0.1:4173',browser=await launchBrowser(),results=[];
try {for(const theme of ['dark','light']) for(const width of [320,360]){
 const {ctx,page}=await newContext(browser,{baseUrl,lang:'pt',theme,viewport:{width,height:1000}});await ctx.route('**/*',r=>['font','stylesheet'].includes(r.request().resourceType())?r.continue():r.fallback());
 for(const path of ['/','/servicos','/orcamento?addon=maintenance']){
  await visit(page,baseUrl,path);
  const bounds=await page.locator('.header__actions > button').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,height:r.height}}));assert(bounds.every(r=>r.left>=0&&r.right<=width&&r.width>=44&&r.height>=44),JSON.stringify(bounds));
  await page.locator('.header__hamburger').click();await page.locator('.mobile-nav.is-open').waitFor();
  const menu=await page.locator('.mobile-nav__acoes > button').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,height:r.height}}));assert(menu.every(r=>r.left>=0&&r.right<=width&&r.width>=44&&r.height>=44),JSON.stringify(menu));
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('.mobile-nav.is-open'));
  if(path==='/servicos')await page.screenshot({path:`artifacts/services-strategy/after/live-fonts-${theme}-${width}.png`});
  results.push({theme,width,path,controlsInViewport:true,touchTargets44px:true,menu:true});
 }await ctx.close();}writeFileSync('artifacts/services-strategy/after/header.json',JSON.stringify(results,null,2));console.log('passed: header and menu, 320/360px, both themes, home/services/quote');}finally{await browser.close()}
