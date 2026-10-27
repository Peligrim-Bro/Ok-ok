const {test,expect}=require('@playwright/test');
const entry='/ne-vedis/index.html';
for(const lang of ['ru','en','th'])for(const width of [360,390,768,844])test(`centre ${lang} ${width}`,async({page})=>{
 await page.setViewportSize({width,height:width===844?390:844});
 await page.goto(entry+'?lang='+lang);
 await expect(page.locator('html')).toHaveAttribute('lang',lang);
 for(const theme of ['dark','light']){
  if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#theme').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`quality-reports/nevedis-${lang}-${width}-${theme}.png`,fullPage:true});
 }
 await page.locator('#options button').first().click();await expect(page.locator('#explanation')).toBeVisible();
 await expect(page.locator('#source')).toHaveAttribute('href',/https:\/\//);
 await page.locator('#tab-catalog').click();await expect(page.locator('.trap')).toHaveCount(4);
 await page.locator('[data-filter="digital"]').click();await expect(page.locator('.trap')).toHaveCount(2);
 await page.locator('#search').fill('ZZZ-not-a-match');await expect(page.locator('.trap')).toHaveCount(0);await expect(page.locator('#search-count')).not.toBeEmpty();
 await page.locator('#search').fill('');await expect(page.locator('.trap')).toHaveCount(2);
 await page.locator('.trap a').first().click();await expect(page.locator('#trainer')).toBeVisible();await expect(page).toHaveURL(/#case\/seed/);
 await page.locator('#guide').click();await expect(page.frameLocator('#safetyGuide').locator('h1')).toBeVisible();
});
test('round score reflects wrong answers; no repeat awards or fabricated history',async({page})=>{
 await page.goto(entry+'?lang=en');
 for(let i=0;i<4;i++){await page.locator('#options button').first().click();await expect(page.locator('#options button').first()).toBeDisabled();await page.locator('#next').click();}
 await expect(page.locator('#complete')).toBeVisible();await expect(page.locator('#result')).toHaveText('Correct answers: 0 / 4');
 await page.locator('#restart').click();await expect(page.locator('#complete')).toBeHidden();await expect(page.locator('#explanation')).toBeHidden();await expect(page.locator('#options button').first()).toBeEnabled();
 await expect(page.locator('body')).not.toContainText(/350 XP|7 cases|blockchain scan|Safe website/);
});
test('share failure offers exact scenario link; search cannot inject markup',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(navigator,'share',{value:undefined,configurable:true});Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('denied')}},configurable:true});});
 await page.goto(entry+'?lang=en#case/seed');await page.locator('#share').click();await expect(page.locator('#share-link')).toBeVisible();await expect(page.locator('#share-link')).toHaveValue(/\?lang=en#case\/seed$/);
 await page.locator('#tab-catalog').click();await page.locator('#search').fill('<img src=x onerror=alert(1)>');await expect(page.locator('#traps img')).toHaveCount(0);await expect(page.locator('.trap')).toHaveCount(0);
});
test('centre works offline without replacing home shell cache',async({page,context})=>{
 await page.addInitScript(()=>{localStorage.setItem('pok-lang','en');localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-install-seen','1')});
 await page.goto('/?okok_test=1');await page.evaluate(async()=>{await navigator.serviceWorker.register('/sw.js');await navigator.serviceWorker.ready});await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 await page.goto(entry+'?lang=en#catalog');await context.setOffline(true);await page.reload();await expect(page.locator('#catalog')).toBeVisible();await expect(page.locator('.trap')).toHaveCount(4);
 await page.goto('/?okok_test=1');await expect(page.locator('#homeSafety')).toBeVisible();await page.locator('a[href^="/ne-vedis/"]').click();await expect(page.locator('#question')).toBeVisible();
});
