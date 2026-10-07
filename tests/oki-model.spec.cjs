const {test,expect}=require('@playwright/test');
async function modelPage(page,gender='boy',stage=3){
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('**/oki-model-review',route=>route.fulfill({contentType:'text/html',body:`<style>body{margin:0;background:#0d1427}.host{width:280px;height:360px;margin:auto}</style><div class="host" id="model"></div><script src="/assets/oki-3d-v91.js"></script><script>window.view=OKI3D.mount(document.getElementById('model'),{gender:${JSON.stringify(gender)},stage:${stage},mood:'happy',skin:'neon',interactive:true});</script>`}));
 await page.goto('/oki-model-review');await expect(page.locator('#model')).toHaveAttribute('data-ready','true');
}
for(const gender of ['boy','girl'])test(`3D ${gender}: moods, drag, resize and disposal`,async({page})=>{
 test.setTimeout(60000);const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.setViewportSize({width:390,height:844});await modelPage(page,gender);
 const model=page.locator('#model'),canvas=model.locator('canvas');await expect(model).toHaveAttribute('data-model-revision','neon-glass-v2');
 const images=[];
 for(const [mood,expression] of [['happy','wave'],['sleep','calm'],['quiet','think']]){
  await page.evaluate(m=>window.view.update(m,'neon',85),mood);await expect(model).toHaveAttribute('data-expression',expression);
  await page.waitForTimeout(1600);const pixels=await canvas.screenshot();images.push(pixels);
  await page.screenshot({path:`quality-reports/oki-${gender}-${mood}.png`});
 }
 expect(images[0].equals(images[1])).toBe(false);expect(images[1].equals(images[2])).toBe(false);
 const before=Number(await model.getAttribute('data-azimuth')),box=await canvas.boundingBox();
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+80,box.y+box.height/2,{steps:10});await page.mouse.up();
 await expect.poll(async()=>Math.abs(Number(await model.getAttribute('data-azimuth'))-before)).toBeGreaterThan(.1);
 await canvas.press('Home');await page.setViewportSize({width:320,height:568});
 await expect.poll(()=>canvas.evaluate(n=>n.width>0&&n.getBoundingClientRect().right<=innerWidth)).toBe(true);
 await page.screenshot({path:`quality-reports/oki-${gender}-320.png`});
 await page.evaluate(()=>window.view.dispose());await expect(model.locator('canvas')).toHaveCount(0);expect(errors).toEqual([]);
});
for(const lang of ['ru','en','th'])test(`3D integrates with care and preserved baby progress: ${lang}`,async({page})=>{
 test.setTimeout(60000);await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(lang=>{localStorage.setItem('pok-lang',lang);localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-install-seen','1');localStorage.setItem('oki-metrics-v1',JSON.stringify({enabled:false}));},lang);
 await page.goto('/',{waitUntil:'domcontentloaded'});await page.locator('nav.tab [data-tab="game"]').click();
 await expect(page.locator('#okiLife .ol-3d-slot[data-ready="true"]')).toHaveCount(2);
 await page.locator('#okiLife [data-gender="boy"]').click();
 const model=page.locator('#okiLife .ol-pet .ol-3d-slot');
 await expect(model).toHaveAttribute('data-model-revision','neon-glass-v2');await expect(model).toHaveAttribute('data-life-stage','0');await expect(model).toHaveAttribute('data-ready','true');
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('oki-life-v1')));
 await page.locator('#okiLife [data-do="sleep"]').click();await expect(model).toHaveAttribute('data-mood','sleep');await expect(model).toHaveAttribute('data-expression','calm');
 await model.scrollIntoViewIfNeeded();
 await page.screenshot({path:`quality-reports/oki-care-${lang}.png`});
 await page.locator('#okiLife .ol-close').click();await expect(page.locator('#okiLife')).toHaveCount(0);
 await page.locator('nav.tab [data-tab="game"]').click();await expect(model).toHaveAttribute('data-ready','true');await expect(model).toHaveAttribute('data-mood','sleep');
 const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('oki-life-v1')));expect(after.gender).toBe(before.gender);expect(after.careDays).toBe(before.careDays);expect(after.skin).toBe(before.skin);
 await page.locator('#okiLife .ol-close').click();
});
test('3D growth retains all stages and stops rendering offscreen or at rest with reduced motion',async({page})=>{
 test.setTimeout(60000);await modelPage(page,'boy',0);const model=page.locator('#model');
 await expect(model).toHaveAttribute('data-life-stage','0');await expect(model).toHaveAttribute('data-character-height','2.0');
 const frames=()=>model.getAttribute('data-renders').then(Number);
 await page.waitForTimeout(1600);const resting=await frames();await page.waitForTimeout(400);expect(await frames()).toBe(resting);
 await page.evaluate(()=>{window.view.update('sleep','aurora',15);document.body.style.paddingBottom='1400px';scrollTo(0,900);});
 await page.waitForTimeout(300);const offscreen=await frames();await page.waitForTimeout(400);expect(await frames()).toBe(offscreen);
 await page.evaluate(()=>scrollTo(0,0));await expect.poll(frames).toBeGreaterThan(offscreen);
 for(const stage of [1,2,3]){
  await page.evaluate(stage=>{window.view.dispose();window.view=OKI3D.mount(document.getElementById('model'),{gender:'boy',stage,mood:'happy',skin:'sunset',interactive:true});},stage);
  await expect(model).toHaveAttribute('data-life-stage',String(stage));await expect(model.locator('canvas')).toHaveCount(1);
  await expect(model).toHaveAttribute('data-ready','true');
  await page.screenshot({path:`quality-reports/oki-growth-${stage}.png`});
 }
});
