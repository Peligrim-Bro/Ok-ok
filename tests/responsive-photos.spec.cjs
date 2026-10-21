const {test,expect}=require('@playwright/test');
const photos=[['sky','sky.jpg'],['harlans','harlans.jpg'],['cabbages','cabbages.jpg'],['musselana','musselana-shabu/1.webp']];
for(const [width,dpr,variant] of [[390,1,480],[390,2,960],[768,1,960]]){
 test(`responsive photos ${width}px DPR ${dpr}: selected bytes, rerender and original details`,async({browser})=>{
  const context=await browser.newContext({baseURL:test.info().project.use.baseURL,viewport:{width,height:844},deviceScaleFactor:dpr,reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.addInitScript(()=>{
   localStorage.setItem('pok-lang','en');localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-install-seen','1');
  });
  const requests=[];page.on('request',r=>requests.push(new URL(r.url()).pathname));
  await page.goto('/?okok_test=1',{waitUntil:'domcontentloaded'});
  await page.locator('nav.tab [data-tab="list"]').click();
  for(const [name,original] of photos){
   const img=page.locator('.card .pic img[src="assets/images/places/'+original+'"]');
   await expect(img).toHaveCount(1);
   await img.scrollIntoViewIfNeeded();
   await expect.poll(()=>img.evaluate(n=>n.complete&&n.naturalWidth>0&&n.currentSrc.includes('/assets/responsive/'))).toBe(true);
   const src=await img.evaluate(n=>n.currentSrc);
   expect(src).toMatch(new RegExp('/assets/responsive/[a-f0-9]{12}/'+name+'-'+variant+'\\.webp$'));
   expect(requests).not.toContain('/assets/images/places/'+original);
   await expect(img).toHaveAttribute('loading','lazy');
   expect(await img.evaluate(n=>Math.abs(n.getBoundingClientRect().width-Math.min(innerWidth-34,526)))).toBeLessThan(2);
   await page.screenshot({path:`quality-reports/photo-${name}-${width}-${dpr}.png`});
  }
  // A language change recreates the cards; responsive attributes must survive.
  await page.locator('#langBtn').click();await page.locator('#langMask [data-lang="th"]').click();
  const img=page.locator('.card .pic img[src="assets/images/places/sky.jpg"]');
  await img.scrollIntoViewIfNeeded();
  await expect(img).toHaveAttribute('srcset',/sky-480.webp 480w, .*sky-960.webp 960w/);
  await img.click();
  const cover=page.locator('#sheet .cover img');
  await expect(cover).toHaveAttribute('src','assets/images/places/sky.jpg');
  await expect(cover).not.toHaveAttribute('srcset');
  await expect.poll(()=>cover.evaluate(n=>n.complete&&n.naturalWidth>960)).toBe(true);
  await context.close();
 });
}

test('requested responsive photo remains usable offline without precaching all variants',async({page,context})=>{
 await page.addInitScript(()=>{localStorage.setItem('pok-lang','en');localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-install-seen','1');});
 await page.goto('/?okok_test=1');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));});
 await page.reload();await page.locator('nav.tab [data-tab="list"]').click();
 const img=page.locator('.card .pic img[src="assets/images/places/sky.jpg"]');
 await img.scrollIntoViewIfNeeded();
 await expect.poll(()=>img.evaluate(n=>n.complete&&n.naturalWidth>0&&n.currentSrc.includes('/assets/responsive/'))).toBe(true);
 const url=await img.evaluate(n=>n.currentSrc);
 await expect.poll(()=>page.evaluate(async url=>!!await caches.match(url),url)).toBe(true);
 await context.setOffline(true);
 const loaded=await page.evaluate(url=>new Promise(resolve=>{const image=new Image();image.onload=()=>resolve(image.naturalWidth);image.onerror=()=>resolve(0);image.src=url;}),url);
 expect(loaded).toBeGreaterThan(0);
 await context.setOffline(false);
});
