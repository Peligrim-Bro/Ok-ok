const {test,expect}=require('@playwright/test');
for(const lang of ['ru','en','th'])test(`author contact is lazy and accessible: ${lang}`,async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.addInitScript(lang=>{localStorage.setItem('pok-lang',lang);localStorage.setItem('pok-lang-set','1');},lang);
 let requests=0;
 await page.route('https://embed.tawk.to/**',route=>{requests++;return route.fulfill({contentType:'application/javascript',body:`window.chatTest={shown:false,maximized:false,attributes:null,draft:''};Object.assign(Tawk_API,{hideWidget(){chatTest.shown=false;},showWidget(){chatTest.shown=true;},maximize(){chatTest.maximized=true;},isChatOngoing(){return false;},setAttributes(a,cb){chatTest.attributes=a;cb();},setChatInputMessage(m,cb){chatTest.draft=m;cb();}});Tawk_API.onBeforeLoad();Tawk_API.onLoad();`});});
 await page.goto('/');await page.locator('#installClose').click();
 const button=page.locator('#authorChatButton');
 await expect(button).toHaveText({ru:'Написать автору',en:'Message the author',th:'ติดต่อผู้ดูแล'}[lang]);
 expect(requests).toBe(0);
 await button.click();await expect(page.locator('#authorChatDialog')).toBeVisible();
 expect(requests).toBe(0);
 await expect(page.locator('[data-author-topic]')).toHaveCount(4);
 await page.locator('[data-author-topic="advertising"]').click();
 await expect(page.locator('#authorChatDialog')).not.toBeVisible();
 expect(requests).toBe(1);
 const state=await page.evaluate(()=>window.chatTest);
 expect(state.shown&&state.maximized).toBe(true);expect(state.attributes['okok-topic']).toBe('advertising');expect(state.attributes['okok-language']).toBe(lang);expect(state.draft).toBeTruthy();
 await expect(page.locator('#authorChatMinimize')).toBeVisible();
 await page.evaluate(()=>Tawk_API.onChatMinimized());
 expect(await page.evaluate(()=>chatTest.shown)).toBe(false);
 await expect(page.locator('#authorChatMinimize')).not.toBeVisible();
 await button.click();await page.locator('[data-author-topic="question"]').click();
 expect(requests).toBe(1);expect(await page.evaluate(()=>chatTest.attributes['okok-topic'])).toBe('question');
 await button.click();await page.locator('#authorChatClose').click();await expect(button).toBeFocused();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
test('close controls stay reachable on short mobile screens and a tall vendor widget',async({page})=>{
 await page.addInitScript(()=>{localStorage.setItem('pok-lang','ru');localStorage.setItem('pok-lang-set','1');});
 await page.route('https://embed.tawk.to/**',route=>route.fulfill({contentType:'application/javascript',body:`
 const frame=document.createElement('iframe');frame.id='mockTallWidget';frame.style.cssText='position:fixed;bottom:0;right:0;width:100%;height:1800px;z-index:2147483000;display:none';document.body.appendChild(frame);
 Object.assign(Tawk_API,{hideWidget(){frame.style.display='none';Tawk_API.onChatHidden();},showWidget(){frame.style.display='block';},maximize(){Tawk_API.onChatMaximized();},minimize(){Tawk_API.onChatMinimized();},isChatOngoing(){return true;}});Tawk_API.onBeforeLoad();Tawk_API.onLoad();` }));
 await page.setViewportSize({width:390,height:844});await page.goto('/');await page.locator('#installClose').click();
 for(const viewport of [{width:390,height:844},{width:390,height:300},{width:844,height:390}]){
  await page.setViewportSize(viewport);
  await page.locator('#authorChatButton').click();
  const close=page.locator('#authorChatClose');const box=await close.boundingBox();
  expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThan(viewport.height);
  await page.locator('#authorChatDialog').evaluate(n=>n.scrollTop=n.scrollHeight);
  const scrolled=await close.boundingBox();expect(scrolled.y).toBeGreaterThanOrEqual(0);expect(scrolled.y+scrolled.height).toBeLessThan(viewport.height);
  await close.click();
  await page.locator('#authorChatButton').click();await page.locator('[data-author-topic="question"]').click();
  const minimize=page.locator('#authorChatMinimize');await expect(minimize).toBeVisible();
  const visible=await minimize.boundingBox();expect(visible.y).toBeGreaterThanOrEqual(0);expect(visible.y+visible.height).toBeLessThan(viewport.height);
  expect(await page.evaluate(()=>document.body.style.overflow)).toBe('hidden');
  await minimize.click();await expect(page.locator('#mockTallWidget')).not.toBeVisible();await expect(minimize).not.toBeVisible();
  expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
 }
});
test('unavailable chat offers retry and separate chat',async({page})=>{
 await page.addInitScript(()=>{localStorage.setItem('pok-lang','ru');localStorage.setItem('pok-lang-set','1');});
 await page.route('https://embed.tawk.to/**',route=>route.abort());
 await page.goto('/');await page.locator('#installClose').click();
 await page.locator('#authorChatButton').click();await page.locator('[data-author-topic="question"]').click();
 await expect(page.locator('#authorChatStatus')).toContainText('Попробуйте ещё раз');
 await expect(page.locator('#authorChatFallback')).toBeVisible();
 await expect(page.locator('[data-author-topic="question"]')).toBeEnabled();
 await page.locator('#authorChatClose').click();await expect(page.locator('#authorChatDialog')).not.toBeVisible();
});
test('minimizing restores the page after vendor scroll resets and callbacks',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.addInitScript(()=>{localStorage.setItem('pok-lang','ru');localStorage.setItem('pok-lang-set','1');});
 await page.route('https://embed.tawk.to/**',route=>route.fulfill({contentType:'application/javascript',body:`
 Object.assign(Tawk_API,{hideWidget(){Tawk_API.onChatHidden();},showWidget(){},maximize(){window.scrollTo(0,0);Tawk_API.onChatMaximized();},minimize(){Tawk_API.onChatMinimized();window.scrollTo(0,0);requestAnimationFrame(()=>window.scrollTo(0,0));},isChatOngoing(){return true;}});Tawk_API.onBeforeLoad();Tawk_API.onLoad();`}));
 await page.goto('/');await page.locator('#installClose').click();
 const button=page.locator('#authorChatButton');
 await button.scrollIntoViewIfNeeded();
 for(let i=0;i<2;i++){
  const start=await page.evaluate(()=>scrollY);expect(start).toBeGreaterThan(500);
  await button.click();await page.locator('[data-author-topic="question"]').click();
  await expect(page.locator('#authorChatMinimize')).toBeVisible();
  await page.locator('#authorChatMinimize').click();
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeCloseTo(start,0);
  await page.waitForTimeout(300);expect(await page.evaluate(()=>scrollY)).toBeCloseTo(start,0);
  expect(await page.evaluate(()=>document.body.style.position)).not.toBe('fixed');
 }
 await button.click();await page.locator('#authorChatClose').click();
 await expect(button).toBeFocused();
});
