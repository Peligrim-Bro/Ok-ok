const {test,expect}=require('@playwright/test');
for(const [date,active] of [['2026-10-27T16:59:59Z',false],['2026-10-27T17:00:00Z',true],['2026-10-31T16:59:59Z',true],['2026-10-31T17:00:00Z',false],['2027-10-28T00:00:00Z',false]]){
test(`Bangkok seasonal boundary ${date}`,async({page})=>{
await page.clock.install({time:new Date(date)});await page.goto('/');
await expect(page.locator('#okok-halloween-decor')).toHaveCount(active?1:0);
});}
for(const lang of ['ru','en','th'])for(const theme of ['light','dark'])for(const width of [360,390,768,844]){
test(`Halloween ${lang} ${theme} ${width}`,async({page})=>{
await page.setViewportSize({width,height:width===844?390:844});
await page.clock.install({time:new Date('2026-10-30T12:00:00Z')});
await page.addInitScript(({lang,theme})=>{localStorage.setItem('pok-lang',lang);localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-theme',theme);},{lang,theme});
await page.goto('/');await page.locator('#installClose').click();
const decor=page.locator('#okok-halloween-decor');await expect(decor).toHaveAttribute('aria-hidden','true');
expect(await decor.evaluate(e=>getComputedStyle(e).pointerEvents)).toBe('none');
await page.locator('#homeFiltersToggle').click();await expect(page.locator('#filters')).toBeVisible();
await page.locator('nav.tab [data-tab="list"]').click();await expect(page.locator('#filters')).toBeVisible();
await page.screenshot({path:`quality-reports/halloween-${lang}-${theme}-${width}.png`});
await page.clock.setSystemTime(new Date('2026-10-31T17:00:01Z'));
await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
await expect(decor).toHaveCount(0);
});}
