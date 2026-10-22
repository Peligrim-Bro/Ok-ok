const {test,expect}=require('@playwright/test');
const editorial=require('../content/editorial.json');
const services=require('../content/services.json');
const latest=Math.max(Date.parse(editorial.verifiedAt+'T00:00:00Z'),...services.providers.map(p=>Date.parse((p.reviewed??services.reviewed)+'T00:00:00Z')));

for(const lang of ['ru','en','th'])test(`dated content warns on foreground without restamping ${lang}`,async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.addInitScript(({lang,now})=>{
  localStorage.setItem('pok-lang',lang);localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-install-seen','1');
  window.reviewClock=now;Date.now=()=>window.reviewClock;
 },{lang,now:Date.parse(editorial.verifiedAt+'T05:00:00Z')});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/',{waitUntil:'domcontentloaded'});
 const news=page.locator('.news-rail [data-freshness-kind="news"]');
 await expect(news).toHaveAttribute('data-freshness-state','dated');
 await expect(news).toContainText(editorial.verifiedAt);
 const links=await page.locator('.news-card').evaluateAll(nodes=>nodes.map(n=>n.href));
 await page.evaluate(now=>{window.reviewClock=now;window.dispatchEvent(new Event('pageshow'));},latest+31*86400000);
 await expect(news).toHaveAttribute('data-freshness-state','due');
 await expect(news.locator('.freshness-note')).toBeVisible();
 await expect(news).toContainText(editorial.verifiedAt);
 expect(await page.locator('.news-card').evaluateAll(nodes=>nodes.map(n=>n.href))).toEqual(links);
 await news.scrollIntoViewIfNeeded();await page.screenshot({path:`quality-reports/freshness-news-${lang}.png`});
 await page.locator('nav.tab [data-tab="list"]').click();await page.locator('[data-service-section="bikes"]').click();
 await page.locator('[data-provider-open]').first().click();
 const snapshot=page.locator('#sheet [data-freshness-kind="services"]');
 await expect(snapshot).toHaveAttribute('data-freshness-state','due');
 await expect(snapshot).toContainText(services.providers[0].reviewed??services.reviewed);
 await expect(snapshot.locator('.freshness-note')).toBeVisible();
 await expect(page.locator('#sheet .actions a')).toHaveCount(2);
 await expect(page.locator('#serviceCopyPhrase')).toBeVisible();
 await snapshot.scrollIntoViewIfNeeded();await page.screenshot({path:`quality-reports/freshness-service-${lang}.png`});
 await page.locator('#sheet').evaluate(n=>n.scrollTop=n.scrollHeight);
 await page.locator('#closeSheet').click();await expect(page.locator('#sheet')).not.toHaveClass(/open/);
});

test('a missing freshness asset leaves the catalogue and source dates usable',async({page})=>{
 await page.addInitScript(()=>{localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-install-seen','1');});
 await page.route('**/assets/content-freshness-*.js',route=>route.abort());
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.news-card')).toHaveCount(5);
 await expect(page.locator('.news-rail')).toContainText(editorial.verifiedAt);
 await page.locator('nav.tab [data-tab="list"]').click();await page.locator('[data-service-section="bikes"]').click();
 await page.locator('[data-provider-open]').first().click();
 await expect(page.locator('#sheet')).toContainText(services.reviewed);
 await expect(page.locator('#serviceCopyPhrase')).toBeVisible();
 await page.locator('#closeSheet').click();await expect(page.locator('#sheet')).not.toHaveClass(/open/);
});
