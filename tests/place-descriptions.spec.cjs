const {test,expect}=require('@playwright/test');
const notes=require('../content/place-descriptions.json');
const wheel=require('../content/holiday-wheel.json');
for(const lang of ['ru','en','th'])for(const theme of ['dark','light'])test(`all 50 saved wheel places have sourced descriptions ${lang} ${theme}`,async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(({lang,theme,ids})=>{localStorage.setItem('pok-lang',lang);localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-theme',theme);localStorage.setItem('pok-install-seen','1');localStorage.setItem('okok-holiday-wheel',JSON.stringify({saved:ids,seen:[],visited:[]}));},{lang,theme,ids:wheel.map(p=>p.id)});
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await page.locator('[data-spin="1"]').click();await page.locator('[data-holiday-filter="saved"]').click();
 const cards=page.locator('.holiday-result');await expect(cards).toHaveCount(50);
 for(let i=0;i<wheel.length;i++){
  const p=wheel[i],n=notes.places[p.id],card=cards.nth(i);
  await expect(card.locator('.place-description')).toHaveText(n.description[lang]);
  await expect(card.locator('.place-sources a')).toHaveCount(n.sources.length);
  await expect(card.locator('a.btn.map')).toHaveAttribute('href',p.maps);
 }
 const first=cards.first();await first.locator('.place-sources summary').click();
 await expect(first.locator('.place-sources a').first()).toBeVisible();
 await page.screenshot({path:`quality-reports/place-descriptions-${lang}-${theme}.png`});
 const panel=page.locator('#spinCard');await panel.evaluate(n=>n.scrollTop=n.scrollHeight);
 await page.locator('#spinClose').click();await expect(page.locator('#spinMask')).not.toHaveClass(/on/);
 // The matching catalogue entry uses the same copy, not the older generic verdict.
 await page.locator('nav.tab [data-tab="list"]').click();await page.locator('#q').fill('The Sky Gallery');
 const card=page.locator('.card[data-open="sky"]');await expect(card).toContainText(notes.places.sky.description[lang]);await card.click();
 await expect(page.locator('#sheet .place-description')).toHaveText(notes.places.sky.description[lang]);
 await expect(page.locator('#sheet .place-sources a')).toHaveCount(notes.places.sky.sources.length);
 await page.locator('#closeSheet').click();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
test('wheel descriptions and sources survive a real offline reload',async({page,context})=>{
 await page.addInitScript(()=>{localStorage.setItem('pok-lang','en');localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-install-seen','1');localStorage.setItem('okok-holiday-wheel',JSON.stringify({saved:['t20-truth'],seen:[],visited:[]}));});
 await page.goto('/');await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
 await expect.poll(()=>page.evaluate(async()=>{const c=await caches.open((await caches.keys()).find(k=>k.startsWith('pattayaok-')));return (await c.keys()).some(r=>r.url.includes('/assets/data/place-descriptions-'));})).toBe(true);
 await context.setOffline(true);await page.reload();
 await page.locator('[data-spin="1"]').click();await page.locator('[data-holiday-filter="saved"]').click();
 await expect(page.locator('.holiday-result .place-description')).toHaveText(notes.places['t20-truth'].description.en);
 await expect(page.locator('.holiday-result .place-sources a')).toHaveAttribute('href',notes.places['t20-truth'].sources[0].url);
 await context.setOffline(false);
});
