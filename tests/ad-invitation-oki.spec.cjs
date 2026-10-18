const {test,expect}=require('@playwright/test');
async function jump(page,ms){await page.clock.setFixedTime(new Date(await page.evaluate(()=>Date.now())+ms));}
async function prepare(page,lang='ru',reduce=false){
 await page.emulateMedia({reducedMotion:reduce?'reduce':'no-preference'});
 await page.addInitScript(lang=>{localStorage.setItem('pok-lang',lang);localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-install-seen','1');localStorage.setItem('oki-life-v1',JSON.stringify({reminders:false}));},lang);
 await page.route('**/api/ads/list',r=>r.fulfill({json:{slots:3,price:15,hours:24,ads:[],free:3}}));
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.okad-invitation-wrap')).toBeVisible();
 await page.locator('.okad-invitation-wrap').scrollIntoViewIfNeeded();
 // Advance wall time without replacing requestAnimationFrame/WebGL scheduling.
 await jump(page,16000);
}
for(const lang of ['ru','en','th'])test(`small real 3D Oki invitation: ${lang}`,async({page})=>{
 test.setTimeout(60000);await page.setViewportSize({width:390,height:844});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await prepare(page,lang,true);
 const wrap=page.locator('.okad-invitation-wrap'),model=wrap.locator('.okad-oki-model'),peek=wrap.locator('.okad-oki-peek');
 await expect(model).toHaveAttribute('data-ready','true');await expect(model).toHaveAttribute('data-expression','invite');
 await expect(model).toHaveAttribute('data-model-revision','neon-glass-v2');
 await expect(peek).toContainText({ru:'Твоему сообщению — сюда!',en:'Your message belongs here!',th:'ข้อความของคุณอยู่ตรงนี้ได้!'}[lang]);
 for(const theme of ['dark','light']){
  if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#themeBtn').evaluate(b=>b.click());
  for(const size of [{width:320,height:568},{width:768,height:1024},{width:844,height:390}]){
   await page.setViewportSize(size);await wrap.scrollIntoViewIfNeeded();
   await expect(peek).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
   await wrap.screenshot({path:`quality-reports/oki-invitation-${lang}-${theme}-${size.width}.png`});
  }
 }
 const before=await wrap.boundingBox();
 await wrap.locator('.okad-oki-close').click();await expect(peek).toBeHidden();await expect(model.locator('canvas')).toHaveCount(0);
 const after=await wrap.boundingBox();expect(after.height).toBe(before.height);
 await jump(page,120000);await page.waitForTimeout(700);await expect(peek).toBeHidden();
 await wrap.locator('.okad-invitation').click();await expect(page.locator('#okAdDialog')).toBeVisible();
 expect(errors).toEqual([]);
});
test('Oki repeats gently, disposes offscreen and never appears over a dialog',async({page})=>{
 test.setTimeout(45000);await page.setViewportSize({width:390,height:844});await prepare(page);
 const wrap=page.locator('.okad-invitation-wrap'),peek=wrap.locator('.okad-oki-peek');
 await expect(wrap.locator('[data-ready="true"]')).toHaveCount(1);
 const bounds=await wrap.boundingBox();
 await jump(page,8000);await expect(peek).toBeHidden();
 expect((await wrap.boundingBox()).height).toBe(bounds.height);
 await jump(page,100000);await expect(peek).toBeVisible();
 await page.evaluate(()=>scrollTo(0,0));await expect(peek).toBeHidden();await expect(wrap.locator('canvas')).toHaveCount(0);
 await wrap.scrollIntoViewIfNeeded();await jump(page,100000);await expect(peek).toBeVisible();
 await wrap.locator('.okad-invitation').click();await expect(peek).toBeHidden();
 await jump(page,100000);await page.waitForTimeout(700);await expect(peek).toBeHidden();
});
test('data-saving does not fetch an extra renderer',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true},configurable:true}));
 let models=0;await page.route('**/assets/oki-3d-v91.js',r=>{models++;return r.abort();});
 await prepare(page);await page.waitForTimeout(700);
 await expect(page.locator('.okad-oki-peek')).toHaveCount(0);expect(models).toBe(0);
 await page.locator('.okad-invitation').click();await expect(page.locator('#okAdDialog')).toBeVisible();
});
