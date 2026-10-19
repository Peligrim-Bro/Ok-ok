const {test,expect}=require('@playwright/test');
async function jump(page,ms){await page.clock.setFixedTime(new Date(await page.evaluate(()=>Date.now())+ms));}
async function center(wrap){await wrap.evaluate(n=>{const r=n.getBoundingClientRect(),bottom=Math.min(innerHeight,document.querySelector('nav.tab').getBoundingClientRect().top)-8;scrollTo({top:scrollY+r.top-Math.max(96,(bottom-r.height+88)/2),behavior:'instant'});});}
async function prepare(page,lang='ru',reduce=false){
 await page.emulateMedia({reducedMotion:reduce?'reduce':'no-preference'});
 await page.addInitScript(lang=>{localStorage.setItem('pok-lang',lang);localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-install-seen','1');localStorage.setItem('oki-life-v1',JSON.stringify({reminders:false}));},lang);
 await page.route('**/api/ads/list',r=>r.fulfill({json:{slots:3,price:15,hours:24,ads:[],free:3}}));
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.okad-invitation-wrap')).toBeVisible();
 const before=await page.locator('.okad-invitation-wrap').boundingBox(),card=await page.locator('.okad-invitation').boundingBox();
 expect(before.height).toBe(card.height);expect(before.y).toBe(card.y);
 await center(page.locator('.okad-invitation-wrap'));
 // Advance wall time without replacing image loading or animation scheduling.
 await jump(page,16000);
}
for(const lang of ['ru','en','th'])test(`reference-matched illustrated Oki without a reserved gap: ${lang}`,async({page})=>{
 test.setTimeout(60000);await page.setViewportSize({width:390,height:844});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await prepare(page,lang,true);
 const wrap=page.locator('.okad-invitation-wrap'),portrait=wrap.locator('.okad-oki-portrait'),peek=wrap.locator('.okad-oki-peek');
 await expect(peek).toBeVisible();await expect(portrait).toHaveAttribute('src',/\/assets\/oki\/invitation-[a-f0-9]{16}\.webp$/);
 expect(await portrait.evaluate(n=>n.complete&&n.naturalWidth>0)).toBe(true);
 expect(await peek.evaluate(n=>n.getAnimations({subtree:true}).length)).toBe(0);
 await expect(wrap.locator('canvas')).toHaveCount(0);await expect(page.locator('#oki3d-loader')).toHaveCount(0);
 await expect(peek).toContainText({ru:'Твоему сообщению — сюда!',en:'Your message belongs here!',th:'ข้อความของคุณอยู่ตรงนี้ได้!'}[lang]);
 for(const theme of ['dark','light']){
  if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#themeBtn').evaluate(b=>b.click());
  for(const size of [{width:320,height:568},{width:768,height:1024},{width:844,height:390}]){
   await page.setViewportSize(size);await center(wrap);
   await expect(peek).toBeVisible();
   const speech=await wrap.locator('.okad-oki-speech').boundingBox(),card=await wrap.locator('.okad-invitation').boundingBox();
   expect(speech.y+speech.height).toBeLessThanOrEqual(card.y);
   const nav=await page.locator('nav.tab').boundingBox();
   expect(card.y+card.height).toBeLessThanOrEqual(nav.y-8);
   const rect=await wrap.boundingBox(),peekRect=await peek.boundingBox();
   expect(rect.height).toBe(card.height);expect(rect.y).toBe(card.y);
   expect(Math.abs(peekRect.y+peekRect.height-card.y)).toBeLessThan(1);
   expect(await peek.evaluate(n=>{const p=n.getBoundingClientRect();return [...document.querySelectorAll('button,a,input,textarea,select,summary')].filter(el=>!n.closest('.okad-invitation-wrap').contains(el)&&el.getClientRects().length).every(el=>{const r=el.getBoundingClientRect();return r.right<=p.left||r.left>=p.right||r.bottom<=p.top||r.top>=p.bottom;});})).toBe(true);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
   await page.screenshot({path:`quality-reports/oki-invitation-${lang}-${theme}-${size.width}.png`});
  }
 }
 const before=await wrap.boundingBox();
 await wrap.locator('.okad-oki-close').click();await expect(peek).toBeHidden();
 const after=await wrap.boundingBox();expect(after.height).toBe(before.height);
 await page.screenshot({path:`quality-reports/oki-invitation-idle-${lang}.png`});
 await jump(page,120000);await page.waitForTimeout(700);await expect(peek).toBeHidden();
 await wrap.locator('.okad-invitation').click();await expect(page.locator('#okAdDialog')).toBeVisible();
 expect(errors).toEqual([]);
});
test('Oki moves head and hands, follows touch and pointer, retreats and yields to More',async({page})=>{
 await page.setViewportSize({width:390,height:844});await prepare(page);
 const wrap=page.locator('.okad-invitation-wrap'),peek=wrap.locator('.okad-oki-peek'),rig=wrap.locator('.okad-oki-rig'),head=wrap.locator('.okad-oki-head'),hands=wrap.locator('.okad-oki-hand');
 await expect(peek).toBeVisible();const before=await wrap.boundingBox();
 // Sample the browser's real CSS animations at deterministic times.
 const sample=async time=>rig.evaluate((n,time)=>n.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=time}),time);
 await sample(1600);
 const first=await hands.evaluateAll(nodes=>nodes.map(n=>getComputedStyle(n).transform));
 await sample(1950);
 const second=await hands.evaluateAll(nodes=>nodes.map(n=>getComputedStyle(n).transform));
 expect(first).not.toEqual(second);expect(second.every(s=>s!=='none'&&s!=='matrix(1, 0, 0, 1, 0, 0)')).toBe(true);
 const box=await rig.boundingBox();
 await page.mouse.move(box.x-100,box.y);
 await expect.poll(()=>head.evaluate(n=>parseFloat(getComputedStyle(n).rotate))).toBeLessThan(0);
 await page.evaluate(({x,y})=>document.dispatchEvent(new PointerEvent('pointerdown',{clientX:x,clientY:y,pointerType:'touch',bubbles:true})),{x:box.x+box.width+100,y:box.y});
 await expect.poll(()=>head.evaluate(n=>parseFloat(getComputedStyle(n).rotate))).toBeGreaterThan(0);
 await page.screenshot({path:'quality-reports/oki-invitation-motion-point.png'});
 const lookBefore=await rig.boundingBox();await sample(6800);
 await expect.poll(async()=>(await rig.boundingBox()).y).toBeGreaterThan(lookBefore.y+5);
 expect((await wrap.boundingBox()).y).toBe(before.y);expect((await wrap.boundingBox()).height).toBe(before.height);
 await sample(1600);await page.locator('#moreBtn').evaluate(n=>n.click());await expect(peek).toBeHidden();
 await page.locator('#moreClose').click();await expect(peek).toBeVisible();
 await wrap.locator('.okad-oki-close').click();await expect(peek).toBeHidden();
 await page.mouse.move(0,0);expect(await rig.evaluate(n=>n.style.getPropertyValue('--oki-look-x'))).toBe('0');
});
test('Oki repeats gently, hides offscreen and never appears over a dialog',async({page})=>{
 test.setTimeout(45000);await page.setViewportSize({width:390,height:844});await prepare(page);
 const wrap=page.locator('.okad-invitation-wrap'),peek=wrap.locator('.okad-oki-peek');
 await expect(peek).toBeVisible();
 const bounds=await wrap.boundingBox();
 await jump(page,8000);await expect(peek).toBeHidden();
 expect((await wrap.boundingBox()).height).toBe(bounds.height);
 await jump(page,100000);await expect(peek).toBeVisible();
 await wrap.evaluate(n=>{document.body.style.paddingBottom='2000px';scrollTo(0,n.getBoundingClientRect().bottom+scrollY+100);});
 await expect.poll(async()=>{const r=await wrap.boundingBox();return r.y+r.height;}).toBeLessThan(0);
 await expect(peek).toBeHidden();await expect(wrap.locator('canvas')).toHaveCount(0);
 await center(wrap);await jump(page,100000);await expect(peek).toBeVisible();
 await wrap.locator('.okad-invitation').click();await expect(peek).toBeHidden();
 await jump(page,100000);await page.waitForTimeout(700);await expect(peek).toBeHidden();
});
test('data-saving does not fetch the invitation image or an extra renderer',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true},configurable:true}));
 let models=0;await page.route('**/assets/oki-3d-v91.js',r=>{models++;return r.abort();});
 let portraits=0;await page.route('**/assets/oki/invitation-*.webp',r=>{portraits++;return r.abort();});
 await prepare(page);await page.waitForTimeout(700);
 await expect(page.locator('.okad-oki-peek')).toHaveCount(0);expect(models).toBe(0);expect(portraits).toBe(0);
 await page.locator('.okad-invitation').click();await expect(page.locator('#okAdDialog')).toBeVisible();
});
