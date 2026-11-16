import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
const dir='artifacts/layout-2026-11';mkdirSync(dir,{recursive:true});
const b=await chromium.launch({executablePath:process.env.LOCALAPPDATA+'/ms-playwright/chromium-1248/chrome-win64/chrome.exe'});
const page=await b.newPage({viewport:{width:1920,height:1080},reducedMotion:'reduce'});
const results=[];
for(const route of ['/projetos','/']){try{const res=await page.goto('https://gcruz.dev.br'+route,{waitUntil:'networkidle',timeout:45000});await page.screenshot({path:dir+'/production-'+(route==='/'?'home':'projects')+'.png'});results.push({route,status:res.status(),url:page.url(),title:await page.title(),layout:await page.evaluate(()=>({tokens:{max:getComputedStyle(document.documentElement).getPropertyValue('--layout-max'),wide:getComputedStyle(document.documentElement).getPropertyValue('--layout-xwide')},shells:[...document.querySelectorAll('.container,.header__inner,main>div,main>section')].slice(0,20).map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{cls:e.className,left:r.left,width:r.width,padding:s.paddingInline,max:s.maxWidth}})}))});}catch(e){results.push({route,error:e.message})}}
writeFileSync(dir+'/production.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));await b.close();
