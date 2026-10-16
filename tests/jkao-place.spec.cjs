const {test,expect}=require('@playwright/test');
const {mkdirSync}=require('node:fs');
for(const lang of ['ru','en','th'])for(const theme of ['dark','light'])test(`J-Kao first-visit card ${lang} ${theme}`,async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(({lang,theme})=>{localStorage.setItem('pok-lang',lang);localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-theme',theme);},{lang,theme});
 await page.goto('/');await page.locator('#installClose').click();
 await page.locator('nav.tab [data-tab="list"]').click();await page.locator('#q').fill('J-Kao');
 const card=page.locator('.card[data-open="jkao-seafood"]');
 await expect(card).toHaveCount(1);await expect(card).toContainText('60–70');await expect(card.locator('.stars')).toHaveCount(0);
 await expect(card.locator('.flag')).toHaveText({ru:'Первый визит · 16.10.2026',en:'First visit · 16 Oct 2026',th:'เยี่ยมชมครั้งแรก · 16 ต.ค. 2026'}[lang]);
 await expect.poll(()=>card.locator('img').evaluate(n=>n.naturalWidth)).toBeGreaterThan(0);
 await card.click();const sheet=page.locator('#sheet');await expect(sheet).toHaveClass(/open/);
 await expect(sheet).toContainText('J-Kao Seafood');await expect(sheet.locator('.stars')).toHaveCount(0);
 await expect(sheet).toContainText({ru:'График работы не уточнялся',en:'Opening hours have not been checked',th:'ยังไม่ได้ตรวจสอบเวลาเปิดปิด'}[lang]);
 await expect(sheet).not.toContainText('undefined');await expect(sheet.locator('.gallery img')).toHaveCount(3);
 // Existing detail UI intentionally offers both Map and Route actions.
 const destination='https://www.google.com/maps/search/?api=1&query=7P42VV6X%2B9Q';
 await expect(sheet.locator('a.btn.map')).toHaveAttribute('href',destination);
 await expect(sheet.locator('a.btn.ghost')).toHaveAttribute('href',destination);
 await expect(sheet.locator('a[href*="7P42VV6X"]')).toHaveCount(2);
 await expect(sheet.locator('iframe.mapbox')).toHaveAttribute('src',/12\.8609375,100\.8994375/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 mkdirSync('quality-reports',{recursive:true});await page.screenshot({path:`quality-reports/jkao-${lang}-${theme}.png`});
 await page.locator('#closeSheet').click();await expect(sheet).not.toHaveClass(/open/);
});
