const {test,expect}=require('@playwright/test');
for(const lang of ['ru','en','th'])for(const width of [360,390,768,844])test(`bike guide ${lang} ${width}`,async({page,context})=>{
await page.setViewportSize({width,height:width===844?390:844});
await page.addInitScript(lang=>{localStorage.setItem('pok-lang',lang);localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-install-seen','1');},lang);
await page.goto('/?okok_test=1#safety/bike-deposit');
const f=page.frameLocator('#safetyGuide');await expect(f.locator('h1')).toBeVisible();
await f.locator('[data-check="0"]').check();await page.reload();await expect(f.locator('[data-check="0"]')).toBeChecked();
await f.locator('#reset').click();await expect(f.locator('[data-check="0"]')).not.toBeChecked();
for(const theme of ['light','dark']){
if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#themeBtn').click();
await expect(f.locator('html')).toHaveAttribute('data-theme',theme);
expect(await f.locator('body').evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
await f.locator('[data-mode="after"]').click();await expect(f.locator('a[href="tel:1155"]')).toBeVisible();
await f.locator('details').first().locator('summary').click();await f.locator('[data-answer="1"]').click();await expect(f.locator('#answer')).not.toBeEmpty();
await page.screenshot({path:`quality-reports/safety-${lang}-${width}-${theme}.png`,fullPage:true});
await f.locator('[data-mode="before"]').click();
}
await f.locator('#copy').click();await expect(f.locator('#status')).not.toBeEmpty();
await f.locator('#report').click();await expect(page.locator('#authorChatDialog')).toBeVisible();await page.locator('#authorChatClose').click();
await page.locator('nav.tab [data-tab="home"]').click();await expect(page.locator('#safetyGuide')).toHaveCount(0);
});
test('guide offline, hash navigation and city selection',async({page,context})=>{
await page.addInitScript(()=>{localStorage.setItem('pok-install-seen','1');localStorage.setItem('pok-city','pattaya')});
await page.goto('/?okok_test=1');await page.evaluate(()=>navigator.serviceWorker.ready);
await page.locator('#citySelect').selectOption('phuket');
await page.evaluate(()=>location.hash='safety/bike-deposit');const f=page.frameLocator('#safetyGuide');await expect(f.locator('h1')).toBeVisible();
await page.reload();await expect(f.locator('h1')).toBeVisible();
await context.setOffline(true);await page.reload();await expect(f.locator('h1')).toBeVisible();
await f.locator('[data-mode="after"]').click();await expect(f.locator('a[href="tel:1155"]')).toBeVisible();
});
