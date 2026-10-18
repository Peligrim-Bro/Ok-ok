const {test,expect}=require('@playwright/test');
for(const lang of ['ru','en','th'])for(const [width,height] of [[390,844],[768,1024],[844,390]])test(`service catalogue ${lang} ${width}x${height}`,async({page})=>{
 await page.setViewportSize({width,height});
 await page.addInitScript(l=>{localStorage.setItem('pok-lang',l);localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-install-seen','1');window.catalogueSignals=[];window.addEventListener('okok:catalogue',e=>window.catalogueSignals.push(e.detail));},lang);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('nav.tab button')).toHaveCount(5);
 await expect(page.locator('#donateBtn')).not.toBeVisible();await expect(page.locator('#reportBtn')).not.toBeVisible();
 await page.locator('#moreBtn').click();await expect(page.locator('#donateBtn')).toBeVisible();await expect(page.locator('#reportBtn')).toBeVisible();
 await page.keyboard.press('Escape');await expect(page.locator('#headerMore')).toBeHidden();await expect(page.locator('#moreBtn')).toBeFocused();
 for(const theme of ['dark','light']){
  if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#themeBtn').click();
  await page.locator('nav.tab [data-tab="list"]').click();
  for(const category of ['bikes','visas']){
   await page.locator(`[data-service-section="${category}"]`).click();
   await expect(page.locator('.service-card')).toHaveCount(category==='bikes'?5:3);
   await expect(page.locator('#homeFilters')).toBeHidden();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
   await page.screenshot({path:`quality-reports/services-${lang}-${width}-${height}-${theme}-${category}.png`});
   await page.locator('[data-provider-open]').first().click();await expect(page.locator('#sheet')).toHaveClass(/open/);
   await expect(page.locator('#sheet .service-attribution')).toContainText('OK-OK.click');
   await expect(page.locator('#sheet')).toContainText('2026-10-18');
   await page.locator('#sheet').evaluate(n=>n.scrollTop=n.scrollHeight);
   expect(await page.locator('#closeSheet').evaluate(n=>{const r=n.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));})).toBe(true);
   await page.screenshot({path:`quality-reports/services-detail-${lang}-${width}-${theme}-${category}.png`});
   await page.locator('#closeSheet').click();await expect(page.locator('#sheet')).not.toHaveClass(/open/);
  }
  await page.locator('#q').fill('TVS');await expect(page.locator('.service-card')).toHaveCount(1);await page.locator('#q').fill('');
  await page.locator('[data-service-section="all"]').click();await expect(page.locator('.card').first()).toBeVisible();await expect(page.locator('#homeFilters')).toBeVisible();
 }
 await page.locator('#citySelect').selectOption('phuket');await page.locator('nav.tab [data-tab="list"]').click();await page.locator('[data-service-section="bikes"]').click();await expect(page.locator('.service-card')).toHaveCount(0);
 await page.locator('#citySelect').selectOption('pattaya');await page.locator('nav.tab [data-tab="list"]').click();await expect(page.locator('[data-service-section="all"]')).toHaveAttribute('aria-pressed','true');
 expect(await page.evaluate(()=>window.catalogueSignals.some(e=>e.name==='provider_open'&&e.provider_id==='tvs'))).toBe(true);
});
test('ticker directions and analytics test-session exclusion',async({page})=>{
 await page.addInitScript(()=>{localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-install-seen','1');window.sentEvents=[];window.gtag=(...args)=>window.sentEvents.push(args);});
 await page.goto('/?okok_test=1');
 expect(await page.locator('#recTrack').evaluate(n=>getComputedStyle(n).animationDirection)).toBe('normal');
 expect(await page.locator('#tickerTrack').evaluate(n=>getComputedStyle(n).animationDirection)).toBe('reverse');
 await page.locator('nav.tab [data-tab="list"]').click();await page.locator('[data-service-section="bikes"]').click();await page.locator('[data-provider-open]').first().click();
 await page.evaluate(()=>document.querySelector('[data-contact-channel="website"]').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true})));
 expect(await page.evaluate(()=>window.sentEvents.filter(e=>['catalogue_view','provider_open','provider_contact_click'].includes(e[1])).length)).toBe(0);
 expect(await page.evaluate(()=>sessionStorage.getItem('okok-test'))).toBe('1');
});
