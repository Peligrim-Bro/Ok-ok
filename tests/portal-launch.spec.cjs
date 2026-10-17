const {test,expect}=require('@playwright/test');
// Owner paused the effect: verify direct opening and stale-cache safety.
for(const lang of ['ru','en','th'])for(const theme of ['dark','light'])test(`paused portal opens directly ${lang} ${theme}`,async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.addInitScript(({lang,theme})=>{localStorage.setItem('pok-lang',lang);localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-theme',theme);},{lang,theme});
 const portalRequests=[];page.on('request',r=>{if(r.url().includes('portal-launch'))portalRequests.push(r.url())});
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('html')).not.toHaveAttribute('data-okok-portal-pending','');
 await expect(page.locator('#okok-portal, #okok-portal-startup, script[src*="portal-launch"]')).toHaveCount(0);
 await expect(page.locator('.brand')).toBeVisible();
 await page.locator('#installClose').click();
 await page.locator('nav.tab [data-tab="list"]').click();
 await expect(page.locator('nav.tab [data-tab="list"]')).toHaveClass(/on/);
 await page.screenshot({path:`quality-reports/portal-disabled-${lang}-${theme}.png`});
 expect(portalRequests).toEqual([]);
 expect(await page.evaluate(()=>sessionStorage.getItem('okok-portal-seen-v6'))).toBeNull();
});

test('stale portal assets stay inactive after online and offline navigation',async({page})=>{
 await page.addInitScript(()=>{localStorage.setItem('pok-lang','ru');localStorage.setItem('pok-lang-set','1');});
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 await page.evaluate(async()=>{
  for(const name of await caches.keys()){
   const cache=await caches.open(name);
   for(const path of ['./portal-launch.js','./portal-launch.js?v=old'])await cache.put(new URL(path,location.href),new Response('window.stalePortalExecuted=true;', {headers:{'Content-Type':'text/javascript'}}));
  }
 });
 await page.reload({waitUntil:'domcontentloaded'});
 await expect(page.locator('#okok-portal, #okok-portal-startup, script[src*="portal-launch"]')).toHaveCount(0);
 expect(await page.evaluate(()=>window.stalePortalExecuted)).toBeUndefined();
 await page.context().setOffline(true);
 await page.reload({waitUntil:'domcontentloaded'});
 await expect(page.locator('#okok-portal, #okok-portal-startup, script[src*="portal-launch"]')).toHaveCount(0);
 await expect(page.locator('html')).not.toHaveAttribute('data-okok-portal-pending','');
 expect(await page.evaluate(()=>window.stalePortalExecuted)).toBeUndefined();
 await page.context().setOffline(false);
});
