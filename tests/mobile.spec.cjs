const {test,expect}=require('@playwright/test');
test('late ad loading keeps primary home actions in place',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.addInitScript(()=>{localStorage.setItem('pok-lang','ru');localStorage.setItem('pok-lang-set','1');});
 let release;
 const ready=new Promise(resolve=>{release=resolve;});
 await page.route('**/api/ads/list',async route=>{
  await ready;
  await route.fulfill({json:{ads:[],slots:3,price:'15',hours:24,t:Date.now()}});
 });
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await page.locator('#installClose').click();
 await page.evaluate(()=>document.fonts.ready);
 const primary=page.locator('[data-tours="1"]').first();
 await expect(primary).toBeVisible();
 const before=await primary.boundingBox();
 const adHeight=(await page.locator('#okAds').boundingBox()).height;
 release();
 await expect(page.locator('#okAds .okads-list')).toBeVisible();
 expect((await page.locator('#okAds').boundingBox()).height).toBeGreaterThan(adHeight);
 expect(Math.abs((await primary.boundingBox()).y-before.y)).toBeLessThan(1);
 await page.screenshot({path:'quality-reports/stable-home.png',fullPage:false});
});
for(const lang of ['ru','en','th'])for(const width of [390,768])test(`${lang} at ${width}px preserves navigation and compact header`,async({page})=>{
 await page.setViewportSize({width,height:844});
 await page.addInitScript(lang=>{localStorage.setItem('pok-lang',lang);localStorage.setItem('pok-lang-set','1');},lang);
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('nav.tab button')).toHaveCount(5);
 await expect(page.locator('#langBtn')).toHaveText(lang.toUpperCase());
 for(const id of ['donateBtn','themeBtn','langBtn','reportBtn'])expect((await page.locator('#'+id).boundingBox()).height).toBe(44);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.locator('#installClose').click();
 await expect(page.locator('#installMask')).not.toHaveClass(/on/);
 await expect(page.locator('.news-card')).toHaveCount(5);
 await expect(page.locator('.home-fold summary')).not.toContainText([/Полезное для поездки|Useful for your trip|มีประโยชน์สำหรับทริป/]);
 // News can mention support/donations, including in source URLs, without becoming controls.
 await page.evaluate(()=>{
  const card=document.querySelector('.news-card');
  card.href='https://example.org/support/donations';
  card.querySelector('p').textContent='Support the author · поддержать автора · สนับสนุนผู้เขียน';
 });
 await page.waitForTimeout(1600);
 await expect(page.locator('.news-card.ok-support-author')).toHaveCount(0);
 await expect(page.locator('#donateBtn')).toHaveClass(/ok-support-author/);
 for(const theme of ['dark','light']){
  await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
  expect(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--bg').trim())).toBe(theme==='dark'?'#061d27':'#eef5ef');
  const palette=await page.locator('[data-spin="1"]').first().evaluate(n=>({background:getComputedStyle(n).backgroundImage,shadow:getComputedStyle(n).boxShadow,color:getComputedStyle(n).color}));
  expect(palette.background).toContain('243, 110, 69');
  expect(palette.shadow).toContain('inset');
  expect(palette.color).toBe('rgb(57, 24, 12)');
  const ordinary=await page.locator('[data-openmap="1"]').first().evaluate(n=>({background:getComputedStyle(n).backgroundImage,shadow:getComputedStyle(n).boxShadow}));
  expect(ordinary.background).toContain(theme==='dark'?'24, 68, 85':'140, 189, 188');
  expect(ordinary.shadow).toContain('inset');
  const cards=await page.locator('.news-card').evaluateAll(nodes=>nodes.map(n=>{
   const s=getComputedStyle(n),p=n.querySelector('p');return {width:n.getBoundingClientRect().width,gradient:s.backgroundImage,display:s.display,wrap:s.whiteSpace,textFits:p.scrollWidth<=p.clientWidth+1};
  }));
  for(const card of cards){expect(card.gradient).toBe(cards[1].gradient);expect(card.display).toBe('block');expect(card.wrap).toBe('normal');expect(card.textFits).toBe(true);expect(card.width).toBeGreaterThan(200);}
 }
 await page.locator('nav.tab [data-tab="list"]').click();
 await expect(page.locator('nav.tab [data-tab="list"]')).toHaveClass(/active|on/);
 await expect(page.locator('body')).not.toContainText(/EX24|Supermao/i);
 await page.screenshot({path:`quality-reports/${lang}-${width}.png`,fullPage:false});
});
test('installed app can reopen the cached shell offline',async({page,context})=>{
 await page.goto('/');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
 await context.setOffline(true);
 await page.reload();
 await expect(page.locator('nav.tab button')).toHaveCount(5);
});

test('real 3D background stays idle, animates taps and respects reduced motion',async({page})=>{
 await page.addInitScript(()=>{localStorage.setItem('pok-lang','ru');localStorage.setItem('pok-lang-set','1');});
 await page.goto('/',{waitUntil:'domcontentloaded'});
 const bg=page.locator('#spatial-background');
 await expect(bg).toHaveAttribute('data-renderer','webgl');
 await expect.poll(()=>bg.getAttribute('data-renders')).not.toBeNull();
 await page.waitForTimeout(300);
 const read=()=>bg.getAttribute('data-renders').then(Number);
 const idle=await read();await page.waitForTimeout(500);expect(await read()).toBe(idle);
 await page.locator('#installClose').click();
 await page.evaluate(()=>document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:innerWidth/2,clientY:innerHeight/2})));
 await expect.poll(read).toBeGreaterThan(idle);
 await page.waitForTimeout(2000);const settled=await read();await page.waitForTimeout(400);expect(await read()).toBe(settled);
 await page.locator('#themeBtn').click();await expect.poll(read).toBeGreaterThan(settled);
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);
 const stopped=await read();
 await page.evaluate(()=>document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:innerWidth/2,clientY:innerHeight/2})));
 await page.waitForTimeout(400);expect(await read()).toBe(stopped);
 await page.screenshot({path:'quality-reports/hedgehogs-light.png',fullPage:false});
});
