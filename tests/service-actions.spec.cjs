const {test,expect}=require('@playwright/test');

for(const lang of ['ru','en','th'])test(`service enquiry and disclosure ${lang}`,async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.addInitScript(l=>{
  localStorage.setItem('pok-lang',l);localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-install-seen','1');
  window.copiedPhrases=[];window.copyDenied=false;
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{if(window.copyDenied)throw Error('denied');window.copiedPhrases.push(text);}}});
 },lang);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await page.locator('nav.tab [data-tab="list"]').click();
 for(const category of ['bikes','visas']){
  await page.locator(`[data-service-section="${category}"]`).click();
  await page.locator('[data-provider-open]').first().click();
  const phrase=page.locator('#servicePhrase'),summary=page.locator('.service-checklist summary');
  const expected=category==='bikes'
   ? 'Hello! I found you on OK-OK.click. Could you confirm the model, total rental price, deposit, insurance exclusions and delivery cost, please?'
   : 'Hello! I found you on OK-OK.click. Could you send the full quote, required documents, timeline and refund terms, please?';
  await expect(phrase).toHaveValue(expected);
  await expect(phrase).toHaveAttribute('readonly','');
  await expect(page.locator('#sheet .service-attribution')).toContainText('OK-OK.click');
  await expect(page.locator('#sheet')).toContainText('2026-10-18');
  expect(await page.locator('#sheet .actions a').count()).toBeGreaterThanOrEqual(2);
  await expect(page.locator('.service-checklist li').first()).toBeHidden();
  await page.locator('#serviceCopyPhrase').click();
  expect(await page.evaluate(()=>window.copiedPhrases.at(-1))).toBe(expected);
  await expect(page.locator('#serviceCopyStatus')).not.toBeEmpty();
  await page.evaluate(()=>window.copyDenied=true);
  await page.locator('#serviceCopyPhrase').click();
  await expect(phrase).toBeFocused();
  expect(await phrase.evaluate(n=>[n.selectionStart,n.selectionEnd])).toEqual([0,expected.length]);
  await expect(page.locator('#serviceCopyPhrase')).toBeEnabled();
  await summary.focus();await page.keyboard.press('Enter');
  await expect(page.locator('.service-checklist')).toHaveAttribute('open','');
  await expect(page.locator('.service-checklist li')).toHaveCount(3);
  await page.screenshot({path:`quality-reports/services-enquiry-${lang}-${category}.png`});
  await page.keyboard.press('Tab');await expect(page.locator('#closeSheet')).toBeFocused();
  await page.keyboard.press('Shift+Tab');await expect(summary).toBeFocused();
  await page.keyboard.press('Escape');await expect(page.locator('#sheet')).not.toHaveClass(/open/);
  await expect(page.locator('[data-provider-open]').first()).toBeFocused();
  await page.evaluate(()=>window.copyDenied=false);
 }
});

test('missing clipboard keeps the enquiry manually selectable',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-install-seen','1');
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined});
 });
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await page.locator('nav.tab [data-tab="list"]').click();await page.locator('[data-service-section="bikes"]').click();
 await page.locator('[data-provider-open]').first().click();await page.locator('#serviceCopyPhrase').click();
 await expect(page.locator('#servicePhrase')).toBeFocused();
 expect(await page.locator('#servicePhrase').evaluate(n=>n.selectionEnd-n.selectionStart)).toBeGreaterThan(100);
 await expect(page.locator('#serviceCopyStatus')).not.toBeEmpty();
});

test('late clipboard failure cannot steal focus after closing the sheet',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-install-seen','1');
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>new Promise((resolve,reject)=>window.rejectCopy=reject)}});
 });
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await page.locator('nav.tab [data-tab="list"]').click();await page.locator('[data-service-section="bikes"]').click();
 await page.locator('[data-provider-open]').first().click();await page.locator('#serviceCopyPhrase').click();
 await expect(page.locator('#serviceCopyPhrase')).toHaveAttribute('aria-busy','true');
 await page.keyboard.press('Escape');await expect(page.locator('#sheet')).not.toHaveClass(/open/);
 await page.evaluate(()=>window.rejectCopy(Error('denied')));
 await expect(page.locator('[data-provider-open]').first()).toBeFocused();
 await expect(page.locator('#serviceCopyStatus')).toBeEmpty();
});
