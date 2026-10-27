const {test,expect}=require('@playwright/test');
for(const lang of ['ru','en','th'])for(const width of [360,390,768,844])test(`resource report ${lang} ${width}`,async({page})=>{
 await page.setViewportSize({width,height:width===844?390:844});
 await page.goto('/ne-vedis/index.html?lang='+lang+'#check');
 await expect(page.locator('#check-input')).toBeVisible();await expect(page.locator('main>h1')).toBeHidden();await page.screenshot({path:`quality-reports/resource-search-${lang}-${width}.png`});
 await page.locator('#check-input').fill('Progress Pattaya');await page.locator('#check-form button').click();
 await expect(page.locator('.business-match')).toHaveCount(1);await page.locator('.business-match').click();
 await expect(page.locator('#business-report-title')).toHaveText('Progress Language School');
 await expect(page.locator('#check-report')).toContainText('ชบ 0003/2545');
 await expect(page.locator('#check-report a[href="https://progresspattaya.com/language-courses/"]')).toBeVisible();
 for(const theme of ['dark','light']){
  if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#theme').click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.screenshot({path:`quality-reports/resource-${lang}-${width}-${theme}.png`,fullPage:true});
 }
 await page.locator('#check-report a[href="#check"]').click();await expect(page.locator('#check-input')).toHaveValue('Progress Pattaya');
 await page.locator('#check-input').fill('https://www.speedbikepattaya.com/');await page.locator('#check-form button').click();await expect(page.locator('.business-match')).toHaveCount(1);await page.locator('.business-match').click();await expect(page.locator('#business-report-title')).toHaveText('Speed Bike');
});
test('unknown and unsafe input never produces a safety verdict or fetches the submitted site',async({page})=>{
 const requests=[];page.on('request',r=>requests.push(r.url()));
 await page.goto('/ne-vedis/index.html?lang=en#check');
 for(const q of ['Unknown School Phuket','https://unknown-test.example/','<img src=x onerror=alert(1)>']){
  await page.locator('#check-input').fill(q);await page.locator('#check-form button').click();await expect(page.locator('.business-match')).toHaveCount(0);await expect(page.locator('#check-report')).toBeHidden();await expect(page.locator('#check-status')).toHaveText('No prepared report found.');
 }
 expect(requests.some(u=>u.includes('unknown-test.example'))).toBe(false);await expect(page.locator('#check-results img')).toHaveCount(0);
 await page.locator('#check-input').fill('javascript:alert(1)');await page.locator('#check-form button').click();await expect(page.locator('#check-status')).toContainText('http/https');
});
test('deep link, old rating date, copy/share fallback and theme-language changes',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(navigator,'share',{value:undefined,configurable:true});Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('denied')}},configurable:true});});
 await page.goto('/ne-vedis/index.html?lang=en#check/pattaya-bike-trip');await expect(page.locator('#business-report-title')).toHaveText('Pattaya Bike Trip');await expect(page.locator('#check-report')).toContainText('20,000');
 await page.locator('#business-copy').click();await expect(page.locator('#business-copy-status')).toHaveText('Select and copy the English text manually.');await expect(page.locator('#business-phrase')).toHaveValue(/Please confirm the total price/);
 await page.locator('#business-share').click();await expect(page.locator('#business-share-link')).toHaveValue(/\?lang=en#check\/pattaya-bike-trip$/);
 await page.locator('#language').selectOption('ru');await expect(page.locator('html')).toHaveAttribute('lang','ru');await expect(page.locator('#business-report-title')).toHaveText('Pattaya Bike Trip');await expect(page.locator('#business-phrase')).toHaveValue(/Please confirm the total price/);
 await page.goto('/ne-vedis/index.html?lang=en#check/speed-bike');await expect(page.locator('#check-report')).toContainText('10/18/2026');await expect(page.locator('#check-report')).toContainText('Google via Wanderlog');
});
test('cached reports remain available offline and source age is not restamped',async({page,context})=>{
 await page.goto('/ne-vedis/index.html?lang=en#check/speed-bike');await page.evaluate(async()=>{await navigator.serviceWorker.register('/sw.js');await navigator.serviceWorker.ready});await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 await context.setOffline(true);await page.reload();await expect(page.locator('#business-report-title')).toHaveText('Speed Bike');await expect(page.locator('.report-stamp')).toContainText('Offline: saved report');await expect(page.locator('#check-report')).toContainText('10/18/2026');
 await page.goto('/ne-vedis/index.html?lang=en#check/no-such-place');await expect(page.locator('#check-status')).toHaveText('No prepared report found.');await expect(page.locator('#check-report')).toBeHidden();
});

test('copy sends the visible English phrase only after user intent',async({page})=>{
 await page.addInitScript(()=>{window.copiedPhrases=[];Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copiedPhrases.push(text)}}});});
 await page.goto('/ne-vedis/index.html?lang=en#check/progress-language');
 expect(await page.evaluate(()=>window.copiedPhrases)).toEqual([]);
 const visible=await page.locator('#business-phrase').inputValue();await page.locator('#business-copy').click();
 expect(await page.evaluate(()=>window.copiedPhrases)).toEqual([visible]);await expect(page.locator('#business-copy-status')).toHaveText('Text copied');
});
