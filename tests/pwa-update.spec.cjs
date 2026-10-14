const {test,expect}=require('@playwright/test');
const {createServer}=require('node:http');
const {readFile}=require('node:fs/promises');
const {resolve,extname}=require('node:path');
const A='a'.repeat(40), B='b'.repeat(40);
let server,origin,current,unavailable;
const info=commit=>({commit,builtAt:'2026-10-14T08:00:00.000Z'});
test.beforeEach(async()=>{
 current=A;unavailable=false;
 const root=resolve('site/public');
 server=createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/build-info.json'){res.writeHead(unavailable?503:200,{'content-type':'application/json','cache-control':'no-store'});res.end(unavailable?'unavailable':JSON.stringify(info(current)));return;}
  const file=resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));
  if(!file.startsWith(root+'/')){res.writeHead(403).end();return;}
  try{let body=await readFile(file);
   if(url.pathname==='/'||url.pathname==='/index.html')body=body.toString().replace(/window.OKOK_RELEASE=\{[^;]+;/,'window.OKOK_RELEASE='+JSON.stringify(info(current))+';');
   if(url.pathname==='/sw.js')body=body.toString().replace(/const CACHE = [^;]+;/,'const CACHE = "pattayaok-release-'+current.slice(0,12)+'";');
   res.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg'}[extname(file)]||'application/octet-stream','cache-control':'no-store'});res.end(body);
  }catch{res.writeHead(404).end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;
});
test.afterEach(async()=>{server.closeAllConnections();await new Promise(r=>server.close(r));});
async function open(page,lang='ru'){
 await page.addInitScript(lang=>{localStorage.setItem('pok-lang',lang);localStorage.setItem('pok-lang-set','1');},lang);
 await page.goto(origin);await page.locator('#installClose').click();
 await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 await expect.poll(()=>page.evaluate(()=>window.OKOK_RELEASE.commit)).toBe(A);
}
test('foreground update activates new SW once and preserves tab and local progress',async({page})=>{
 await open(page);await page.locator('nav.tab button[data-tab="list"]').click();
 await page.evaluate(()=>localStorage.setItem('pwa-progress-test','saved'));
 let navigations=0;page.on('framenavigated',f=>{if(f===page.mainFrame())navigations++;});
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.waitForTimeout(200);expect(navigations).toBe(0);
 current=B;
 await page.evaluate(()=>{window.dispatchEvent(new Event('focus'));});
 await expect(page.locator('#okokUpdate')).toBeVisible();
 // Explicit action avoids waiting for the normal ten-second idle period.
 await page.locator('#okokUpdate button').click();
 await expect.poll(()=>page.evaluate(()=>window.OKOK_RELEASE.commit)).toBe(B);
 await expect(page.locator('nav.tab button[data-tab="list"]')).toHaveClass(/on/);
 expect(await page.evaluate(()=>localStorage.getItem('pwa-progress-test'))).toBe('saved');
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.waitForTimeout(300);expect(navigations).toBe(1);
 expect(await page.evaluate(()=>caches.keys())).toContain('pattayaok-release-'+B.slice(0,12));
});
for(const lang of ['ru','en','th'])test(`unfinished form waits and update banner fits: ${lang}`,async({page})=>{
 await page.setViewportSize({width:390,height:844});await open(page,lang);
 await page.evaluate(()=>{const f=document.createElement('form');f.id='pwaForm';f.innerHTML='<input aria-label="Update test draft">';document.body.prepend(f);});
 await page.getByLabel('Update test draft').fill('unfinished');current=B;
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await expect(page.locator('#okokUpdate')).toBeVisible();
 await page.locator('#okokUpdate button').click();expect(await page.evaluate(()=>window.OKOK_RELEASE.commit)).toBe(A);
 await expect(page.getByLabel('Update test draft')).toHaveValue('unfinished');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.screenshot({path:`quality-reports/pwa-update-${lang}.png`});
 await page.locator('#pwaForm').evaluate(el=>el.remove());await page.locator('#okokUpdate button').click();
 await expect.poll(()=>page.evaluate(()=>window.OKOK_RELEASE.commit)).toBe(B);
});
test('offline version checks do not reload and foreground recovers later',async({page,context})=>{
 await open(page);current=B;await context.setOffline(true);
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.waitForTimeout(300);
 expect(await page.evaluate(()=>window.OKOK_RELEASE.commit)).toBe(A);await expect(page.locator('#okokUpdate')).toHaveCount(0);
 await context.setOffline(false);unavailable=true;
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.waitForTimeout(300);await expect(page.locator('#okokUpdate')).toHaveCount(0);
 unavailable=false;await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
 await expect(page.locator('#okokUpdate')).toBeVisible();await page.locator('#okokUpdate button').click();
 await expect.poll(()=>page.evaluate(()=>window.OKOK_RELEASE.commit)).toBe(B);
});
test('OKI dialog defers update without losing the active session',async({page})=>{
 await open(page);await page.locator('nav.tab button[data-tab="game"]').click();await expect(page.locator('#okiLife')).toBeVisible();
 current=B;await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
 await expect(page.locator('#okokUpdate')).toBeAttached();await page.waitForTimeout(2500);
 expect(await page.evaluate(()=>window.OKOK_RELEASE.commit)).toBe(A);await expect(page.locator('#okiLife')).toBeVisible();
 await page.locator('.ol-close').click();await page.locator('#okokUpdate button').click();
 await expect.poll(()=>page.evaluate(()=>window.OKOK_RELEASE.commit)).toBe(B);
});
