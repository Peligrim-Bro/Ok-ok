const {test,expect}=require('@playwright/test');
for(const lang of ['ru','en','th'])test(`House replaces old pet without importing balances ${lang}`,async({page})=>{
 const requests=[];page.on('request',r=>requests.push(r.url()));
 await page.addInitScript(lang=>{localStorage.setItem('pok-lang',lang);localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-install-seen','1');localStorage.setItem('oki-life-v1',JSON.stringify({gender:'boy',crystals:9999,careDays:190,owned:['neon'],food:70}));},lang);
 await page.goto('/');await page.locator('nav.tab [data-tab=game]').click();
 await expect(page.locator('#okiLife iframe')).toBeVisible();
 const house=page.frameLocator('#okiLife iframe');await expect(house.locator('html')).toHaveAttribute('lang',lang);await expect(house.locator('#balance')).toHaveText('100');await expect(house.locator('.object')).toHaveCount(0);
 await house.locator('#shop [data-item=lamp] button').click();await expect(house.locator('#balance')).toHaveText('70');
 await page.locator('.ol-close').click();await expect(page.locator('#okiLife')).toHaveCount(0);
 await page.locator('nav.tab [data-tab=game]').click();await expect(page.frameLocator('#okiLife iframe').locator('#balance')).toHaveText('70');
 await page.frameLocator('#okiLife iframe').locator('#right').press('Escape');await expect(page.locator('#okiLife')).toHaveCount(0);
 expect(requests.filter(u=>/oki-3d|three(?:\.min)?\.js/.test(u))).toEqual([]);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('oki-life-v1')).crystals)).toBe(9999);
 await expect(page.locator('nav.tab [data-tab=game]')).toBeFocused();
 await page.screenshot({path:`quality-reports/house-primary-${lang}.png`});
});
