const {test,expect}=require('@playwright/test');
for(const lang of ['ru','en','th'])for(const [width,height] of [[360,844],[844,390]])test(`centre home reachable ${lang} ${width}`,async({page})=>{
 await page.setViewportSize({width,height});
 await page.addInitScript(lang=>{localStorage.setItem('pok-lang',lang);localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-install-seen','1');},lang);
 for(const theme of ['dark','light']){
  await page.goto('/ne-vedis/index.html?lang='+lang+'#check/pattaya-bike-trip');
  if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#theme').click();
  await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
  expect(await page.evaluate(()=>scrollY)).toBeGreaterThan(100);
  await expect.poll(()=>page.locator('#back').evaluate(n=>{const r=n.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;return r.top>=0&&r.bottom<=innerHeight&&r.height>=44&&n.contains(document.elementFromPoint(x,y));})).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`quality-reports/centre-home-${lang}-${width}-${theme}.png`});
  await page.locator('#back').click();await expect(page.locator('#homeSafety')).toBeVisible();await expect(page.locator('nav.tab [data-tab="home"]')).toHaveClass(/on/);await expect(page).toHaveURL(/\/$/);
 }
});
test('home return works from a direct report without network or browser history',async({page,context})=>{
 await page.addInitScript(()=>{localStorage.setItem('pok-lang','ru');localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-install-seen','1')});
 await page.goto('/ne-vedis/index.html?lang=ru#check/progress-language');await page.evaluate(async()=>{await navigator.serviceWorker.register('/sw.js');await navigator.serviceWorker.ready});await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 await context.setOffline(true);await page.reload();await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));await page.locator('#back').click();await expect(page.locator('#homeSafety')).toBeVisible();await expect(page.locator('nav.tab [data-tab="home"]')).toHaveClass(/on/);
});
