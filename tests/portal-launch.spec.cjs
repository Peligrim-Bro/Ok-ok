const {test,expect}=require('@playwright/test');
test('portal is decorative, cleans up and runs once per session',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.addInitScript(()=>{localStorage.setItem('pok-lang','ru');localStorage.setItem('pok-lang-set','1');});
 await page.goto('/',{waitUntil:'domcontentloaded'});
 const portal=page.locator('#okok-portal');
 await expect(portal).toBeAttached();
 await expect(portal).toHaveAttribute('aria-hidden','true');
 await expect(portal).toHaveCSS('pointer-events','none');
 await page.screenshot({path:'quality-reports/portal-launch-phone.png'});
 await expect(portal).toHaveCount(0,{timeout:6000});
 await page.locator('#installClose').click();
 await page.locator('nav.tab [data-tab="list"]').click();
 await expect(page.locator('nav.tab [data-tab="list"]')).toHaveClass(/on/);
 await page.screenshot({path:'quality-reports/portal-cleanup-phone.png'});
 await page.reload({waitUntil:'domcontentloaded'});
 await expect(page.locator('#okok-portal')).toHaveCount(0);
 expect(await page.evaluate(()=>sessionStorage.getItem('okok-portal-seen'))).toBe('1');
});
test('reduced motion skips the portal entirely',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#okok-portal')).toHaveCount(0);
 expect(await page.evaluate(()=>sessionStorage.getItem('okok-portal-seen'))).toBeNull();
});
