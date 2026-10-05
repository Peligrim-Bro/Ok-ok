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

test('real 3D background stays idle, animates taps and respects reduced motion',async({page})=>{
 await page.goto('/',{waitUntil:'domcontentloaded'});
 const bg=page.locator('#spatial-background');
 await expect(bg).toHaveAttribute('data-renderer','webgl');
 await expect.poll(()=>bg.getAttribute('data-renders')).not.toBeNull();
 await page.waitForTimeout(300);
 const read=()=>bg.getAttribute('data-renders').then(Number);
 const idle=await read();await page.waitForTimeout(500);expect(await read()).toBe(idle);
 await page.locator('#installClose').click();
 await page.evaluate(()=>document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:innerWidth/2,clientY:innerHeight/2})));
 await expect.poll(read).toBeGreaterThan(idle);
 await page.waitForTimeout(2000);const settled=await read();await page.waitForTimeout(400);expect(await read()).toBe(settled);
 await page.locator('#themeBtn').click();await expect.poll(read).toBeGreaterThan(settled);
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);
 const stopped=await read();
 await page.evaluate(()=>document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:innerWidth/2,clientY:innerHeight/2})));
 await page.waitForTimeout(400);expect(await read()).toBe(stopped);
 await page.screenshot({path:'quality-reports/hedgehogs-light.png',fullPage:false});
});
