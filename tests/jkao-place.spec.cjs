const {test,expect}=require('@playwright/test');
const {mkdirSync}=require('node:fs');
for(const lang of ['ru','en','th'])for(const theme of ['dark','light'])test(`J-Kao first-visit card ${lang} ${theme}`,async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(({lang,theme})=>{localStorage.setItem('pok-lang',lang);localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-theme',theme);},{lang,theme});
 await page.goto('/');await page.locator('#installClose').click();
 await page.locator('nav.tab [data-tab="list"]').click();await page.locator('#q').fill('J-Kao');
 const card=page.locator('.card[data-open="jkao-seafood"]');
 await expect(card).toHaveCount(1);await expect(card).toContainText('60–120');await expect(card).toContainText('120');await expect(card.locator('.stars')).toHaveCount(0);
 await expect(card.locator('.flag')).toHaveText({ru:'Первый визит · 16.10.2026',en:'First visit · 16 Oct 2026',th:'เยี่ยมชมครั้งแรก · 16 ต.ค. 2026'}[lang]);
 await expect.poll(()=>card.locator('img').evaluate(n=>n.naturalWidth)).toBeGreaterThan(0);
 const destination='https://www.google.com/maps/search/?api=1&query=7P42VV6X%2B9Q';
 await expect(card.locator('a[data-jkao-map]')).toHaveAttribute('href',destination);
 const sheet=page.locator('#sheet');
 if(lang==='ru'&&theme==='dark'){
  await page.context().route('https://www.google.com/**',route=>route.fulfill({body:'Map navigation fixture'}));
  const popupPromise=page.waitForEvent('popup');await card.locator('a[data-jkao-map]').click();
  const popup=await popupPromise;await popup.waitForLoadState();expect(popup.url()).toBe(destination);
  await expect(sheet).not.toHaveClass(/open/);await popup.close();
 }
 await page.screenshot({path:`quality-reports/jkao-card-${lang}-${theme}.png`});
 await card.locator('button').click();await expect(sheet).toHaveClass(/open/);
 await expect(sheet).toContainText('J-Kao Seafood');await expect(sheet.locator('.stars')).toHaveCount(0);
 await expect(sheet).toContainText({ru:'Воскресенье — выходной',en:'Closed Sundays',th:'หยุดวันอาทิตย์'}[lang]);
 await expect(sheet.locator('.owner-review')).toContainText('120');
 await expect(sheet.locator('.owner-review')).toContainText({ru:'жестковаты',en:'a little tough',th:'เหนียวไปหน่อย'}[lang]);
 await expect(sheet).not.toContainText('undefined');await expect(sheet.locator('.gallery img')).toHaveCount(3);
 // Existing detail UI intentionally offers both Map and Route actions.
 await expect(sheet.locator('a.btn.map')).toHaveAttribute('href',destination);
 await expect(sheet.locator('a.btn.ghost')).toHaveAttribute('href',destination);
 await expect(sheet.locator('a[href*="7P42VV6X"]')).toHaveCount(2);
 await expect(sheet.locator('iframe.mapbox')).toHaveAttribute('src',/12\.8609375,100\.8994375/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 mkdirSync('quality-reports',{recursive:true});await page.screenshot({path:`quality-reports/jkao-${lang}-${theme}.png`});
 await page.locator('#closeSheet').click();await expect(sheet).not.toHaveClass(/open/);
});
