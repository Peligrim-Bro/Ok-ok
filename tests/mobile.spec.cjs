const {test,expect}=require('@playwright/test');
for(const lang of ['ru','en','th'])for(const width of [390,768])test(`${lang} at ${width}px preserves navigation and compact header`,async({page})=>{
 await page.setViewportSize({width,height:844});
 await page.addInitScript(lang=>{localStorage.setItem('pok-lang',lang);localStorage.setItem('pok-lang-set','1');},lang);
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('nav.tab button')).toHaveCount(5);
 await expect(page.locator('#langBtn')).toHaveText(lang.toUpperCase());
 for(const id of ['donateBtn','themeBtn','langBtn','reportBtn'])expect((await page.locator('#'+id).boundingBox()).height).toBe(44);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.locator('#installClose').click();
 await expect(page.locator('#installMask')).not.toHaveClass(/on/);
 await page.locator('nav.tab [data-tab="list"]').click();
 await expect(page.locator('nav.tab [data-tab="list"]')).toHaveClass(/active|on/);
 await expect(page.locator('body')).not.toContainText(/EX24|Supermao/i);
 await page.screenshot({path:`quality-reports/${lang}-${width}.png`,fullPage:false});
});
test('installed app can reopen the cached shell offline',async({page,context})=>{
 await page.goto('/');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
 await context.setOffline(true);
 await page.reload();
 await expect(page.locator('nav.tab button')).toHaveCount(5);
});

test('weather animation pauses for reduced motion and resumes when allowed',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>{
  window.backgroundPaints=0;
  const original=CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage=function(...args){
   if(this.canvas.id==='spatial-background')window.backgroundPaints++;
   return original.apply(this,args);
  };
 });
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.backgroundPaints)).toBeGreaterThan(0);
 await page.waitForTimeout(500);
 const before=await page.evaluate(()=>window.backgroundPaints);
 await page.waitForTimeout(500);
 expect(await page.evaluate(()=>window.backgroundPaints)).toBe(before);
 await page.emulateMedia({reducedMotion:'no-preference'});
 await expect.poll(()=>page.evaluate(()=>window.backgroundPaints)).toBeGreaterThan(before);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForTimeout(200);
 const stopped=await page.evaluate(()=>window.backgroundPaints);
 await page.waitForTimeout(500);
 expect(await page.evaluate(()=>window.backgroundPaints)).toBe(stopped);
});
