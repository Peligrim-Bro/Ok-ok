const {test,expect}=require('@playwright/test');
const {BRAND}=require('../brand-copy.mjs');
for(const lang of ['ru','en','th'])for(const theme of ['dark','light'])test(`brand mission and share route ${lang} ${theme}`,async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(({lang,theme})=>{localStorage.setItem('pok-lang',lang);localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-theme',theme);localStorage.setItem('pok-install-seen','1');},{lang,theme});
 await page.goto('/');const notes=page.locator('#authorContactNotes');
 await expect(notes.getByText(BRAND[lang].motto,{exact:true})).toHaveCount(1);
 await notes.scrollIntoViewIfNeeded();await expect(notes).toContainText(BRAND[lang].cta.share);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.screenshot({path:`quality-reports/brand-motto-${lang}-${theme}.png`});
 await page.locator('#authorChatButton').click();await expect(page.locator('#authorChatDialog')).toBeVisible();
 await expect(page.locator('[data-author-topic="question"]')).toHaveText({ru:'Место или отзыв',en:'Place or review',th:'สถานที่หรือรีวิว'}[lang]);
 await page.locator('#authorChatClose').click();await expect(page.locator('#authorChatDialog')).not.toBeVisible();
 await expect(page.locator('nav.tab [data-tab]')).toHaveCount(5);
});
