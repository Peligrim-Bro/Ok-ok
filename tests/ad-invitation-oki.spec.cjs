const {test,expect}=require('@playwright/test');
for(const lang of ['ru','en','th'])for(const theme of ['dark','light'])
test(`owner-disabled advertising remains absent: ${lang} ${theme}`,async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(({lang,theme})=>{
  localStorage.setItem('pok-lang',lang);
  localStorage.setItem('pok-lang-set','1');
  localStorage.setItem('pok-install-seen','1');
  localStorage.setItem('pok-theme',theme);
 },{lang,theme});
 let creates=0,portraits=0;
 await page.route('**/api/ads/**',route=>{
  if(new URL(route.request().url()).pathname.endsWith('/create'))creates++;
  return route.fulfill({json:{ads:[],slots:3,free:3,t:Date.now()}});
 });
 await page.route('**/assets/oki/invitation-*.webp',route=>{portraits++;return route.abort();});
 await page.setViewportSize({width:390,height:844});
 await page.goto('/',{waitUntil:'domcontentloaded'});
 if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#themeBtn').click();
 for(const size of [{width:320,height:568},{width:768,height:1024},{width:844,height:390}]){
  await page.setViewportSize(size);
  await page.evaluate(()=>window.OKAds.refresh());
  await expect(page.locator('#okAds')).toBeHidden();
  await expect(page.locator('.okad-invitation, .okad-invitation-wrap, .okad-oki-peek, #okAds .okads-list')).toHaveCount(0);
  await expect(page.locator('#okAdDialog')).toHaveCount(0);
  await expect(page.locator('nav.tab button')).toHaveCount(5);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.screenshot({path:`quality-reports/advertising-disabled-${lang}-${theme}-${size.width}.png`});
 }
 expect(creates).toBe(0);expect(portraits).toBe(0);
});
