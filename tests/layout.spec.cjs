const {test,expect}=require('@playwright/test');
const sizes=[[320,568],[360,740],[390,844],[430,932],[768,1024],[844,390]];
async function layout(page,label){
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label+' page overflow').toBe(true);
 const boxes=await page.locator('header.app .brand>#timerBtn,header.app .top-actions>button,nav.tab>button').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {id:n.id||n.dataset.tab,x:r.x,y:r.y,w:r.width,h:r.height};}));
 const width=await page.evaluate(()=>innerWidth);
 for(const b of boxes){expect(b.x,label+' '+b.id).toBeGreaterThanOrEqual(-1);expect(b.x+b.w,label+' '+b.id).toBeLessThanOrEqual(width+1);}
 for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
  const a=boxes[i],b=boxes[j],overlap=Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>1&&Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>1;
  expect(overlap,label+' overlap '+a.id+'/'+b.id).toBe(false);
 }
 expect(await page.locator('header.app .top-actions>button').count()).toBe(4);
 const brand=await page.locator('header.app .brand').evaluate(n=>Array.from(n.children).filter(n=>!n.classList.contains('top-actions')&&n.getClientRects().length).map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};}));
 for(let i=0;i<brand.length;i++)for(let j=i+1;j<brand.length;j++){const a=brand[i],b=brand[j];expect(Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>1&&Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>1,label+' brand overlap').toBe(false);}
}
async function reachable(page,selector){
 const n=page.locator(selector);await expect(n).toBeVisible();
 await expect.poll(()=>n.evaluate(n=>{const r=n.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;return r.top>=0&&r.bottom<=innerHeight+1&&r.left>=0&&r.right<=innerWidth+1&&n.contains(document.elementFromPoint(x,y));}),{message:selector+' reachable'}).toBe(true);
}
for(const lang of ['ru','en','th'])for(const [width,height] of sizes)test(`layout ${lang} ${width}x${height}: screens, cities and close controls`,async({page})=>{
 test.setTimeout(90000);
 await page.setViewportSize({width,height});
 await page.addInitScript(lang=>{localStorage.setItem('pok-lang',lang);localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-install-seen','1');},lang);
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const theme of ['dark','light']){
  if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#themeBtn').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
  for(const tab of ['home','list','scam','shop']){
   await page.locator(`nav.tab [data-tab="${tab}"]`).click();
   await layout(page,lang+' '+theme+' '+tab);
   await reachable(page,'#timerBtn');await reachable(page,'#reportBtn');
   await page.screenshot({path:`quality-reports/layout-${lang}-${width}-${height}-${theme}-${tab}.png`,fullPage:false});
  }
 }
 await page.locator('#timerBtn').click();await expect(page.locator('#visaForm')).toBeVisible();await layout(page,'timer');
 await page.locator('#reportBtn').click();await expect(page.locator('#app form')).toBeVisible();await layout(page,'report');
 await page.locator('nav.tab [data-tab="home"]').click();
 for(const city of ['bangkok','phuket','pattaya']){await page.locator(`[data-city="${city}"]`).click();await layout(page,city);}
 await page.locator('#langBtn').click();for(const code of ['ru','en','th'])await reachable(page,'#langMask [data-lang="'+code+'"]');await reachable(page,'#langClose');await page.locator('#langClose').click();await expect(page.locator('#langMask')).not.toHaveClass(/on/);
 // Close without changing the selected language.

 await page.locator('#donateBtn').click();await page.locator('#donateCard').evaluate(n=>n.scrollTop=n.scrollHeight);await reachable(page,'#donateClose');await page.locator('#donateClose').click();await expect(page.locator('#donateMask')).not.toHaveClass(/on/);
 await page.locator('[data-spin="1"]').first().click();await page.locator('#spinCard').evaluate(n=>n.scrollTop=n.scrollHeight);await reachable(page,'#spinClose');await page.locator('#spinClose').click();await expect(page.locator('#spinMask')).not.toHaveClass(/on/);
 await page.locator('nav.tab [data-tab="list"]').click();await page.locator('.card').first().click();await page.locator('#sheet').evaluate(n=>n.scrollTop=n.scrollHeight);await reachable(page,'#closeSheet');await page.locator('#closeSheet').click();await expect(page.locator('#sheet')).not.toHaveClass(/open/);
 await page.locator('nav.tab [data-tab="game"]').click();await page.locator('#okiLife .ol-card').evaluate(n=>n.scrollTop=n.scrollHeight);await reachable(page,'#okiLife .ol-close');await page.locator('#okiLife .ol-close').click();await expect(page.locator('#okiLife')).toHaveCount(0);
 await page.locator('nav.tab [data-tab="home"]').click();
 await page.locator('[data-openmap]').click();await expect(page.locator('.pattaya-map')).toBeVisible();await layout(page,'map');await page.locator('[data-openmap]').click();await expect(page.locator('.pattaya-map')).toHaveCount(0);
 expect(await page.locator('#dock').evaluate(n=>getComputedStyle(n).position)).toBe('static');
 await expect(page.locator('[data-okok-contact-float]')).toHaveCount(0);
 await page.locator('#authorChatButton').click();await reachable(page,'#authorChatClose');await page.locator('#authorChatClose').click();
});
test.describe('iPhone installation instructions',()=>{
 test.use({userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 for(const lang of ['ru','en','th'])for(const [width,height] of [[320,568],[844,390]])test(`${lang} ${width}x${height} install can close`,async({page})=>{
  await page.setViewportSize({width,height});
  await page.addInitScript(lang=>{localStorage.setItem('pok-lang',lang);localStorage.setItem('pok-lang-set','1');},lang);
  await page.goto('/?install=1',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#installMask')).toHaveClass(/on/);
  await page.locator('#installCard').evaluate(n=>n.scrollTop=n.scrollHeight);
  await reachable(page,'#installClose');
  const box=await page.locator('#installCard').boundingBox();expect(box.y).toBeGreaterThanOrEqual(0);expect(box.height).toBeLessThanOrEqual(height);
  await page.locator('#installClose').click();await expect(page.locator('#installMask')).not.toHaveClass(/on/);
 });
});
