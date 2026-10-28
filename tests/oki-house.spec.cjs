const {test,expect}=require('@playwright/test');
test.use({hasTouch:true,isMobile:true});
const key='okok-oki-house-v2';
async function open(page){
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/oki-house.html');
 await expect(page.locator('#oki img')).toBeVisible();
 expect(await page.locator('#oki img').evaluate(n=>n.complete&&n.naturalWidth>0)).toBe(true);
 expect(errors).toEqual([]);
}
async function tap(page,selector){await page.locator(selector).scrollIntoViewIfNeeded();await page.locator(selector).tap();}
async function state(page){return page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);}
async function insideRoom(page){
 await expect.poll(()=>page.locator('#oki').evaluate(n=>{
  const a=n.getBoundingClientRect(),r=document.getElementById('room'),b=r.getBoundingClientRect();
  return a.left>=b.left+r.clientLeft&&a.right<=b.left+r.clientLeft+r.clientWidth+1&&a.top>=b.top&&a.bottom<=b.bottom;
 })).toBe(true);
}
for(const [width,height] of [[320,568],[390,844],[430,932],[844,390],[768,1024],[1024,768]]){
 test(`touch layout and movement ${width}x${height}`,async({page},info)=>{
  await page.setViewportSize({width,height});await open(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  for(const id of ['left','interact','right','daily','reset']){
   const b=await page.locator('#'+id).boundingBox();expect(b.width).toBeGreaterThanOrEqual(44);expect(b.height).toBeGreaterThanOrEqual(44);
  }
  for(let i=0;i<6;i++)await tap(page,'#right');
  await expect.poll(()=>page.locator('#oki').evaluate(n=>{
   const r=document.getElementById('room'),b=r.getBoundingClientRect();
   return b.left+r.clientLeft+r.clientWidth-n.getBoundingClientRect().right;
  })).toBeLessThanOrEqual(10);await insideRoom(page);
  for(let i=0;i<8;i++)await tap(page,'#left');
  await expect.poll(()=>page.locator('#oki').evaluate(n=>{
   const r=document.getElementById('room'),b=r.getBoundingClientRect();
   return (n.getBoundingClientRect().left-b.left-r.clientLeft)/r.clientWidth;
  })).toBeLessThan(0.1);await insideRoom(page);
  await page.screenshot({path:`quality-reports/house-${info.project.name}-${width}x${height}.png`,fullPage:true});
 });
}
test('purchases, persistence, reward limits and reset isolation',async({page})=>{
 await page.setViewportSize({width:390,height:844});await open(page);
 await page.evaluate(()=>localStorage.setItem('house-unrelated-test','preserve'));
 await expect(page.locator('#balance')).toHaveText('100');
 const cards=page.locator('#shop .item');
 await expect(cards.filter({hasText:'Телевизор'}).getByRole('button')).toBeDisabled();
 await cards.filter({hasText:'Лампа'}).getByRole('button').tap();
 await expect(page.locator('#balance')).toHaveText('70');
 await expect(cards.filter({hasText:'Лампа'}).getByRole('button')).toBeDisabled();
 await page.reload();await expect(page.locator('#balance')).toHaveText('70');await expect(page.locator('[data-id=lamp]')).toHaveCount(1);
 await cards.filter({hasText:'Пальма'}).getByRole('button').tap();
 await expect(page.locator('#balance')).toHaveText('30');await tap(page,'#achievement');
 await expect(page.locator('#balance')).toHaveText('60');await expect(page.locator('#achievement')).toBeDisabled();
 await tap(page,'#daily');await expect(page.locator('#balance')).toHaveText('70');await expect(page.locator('#daily')).toBeDisabled();
 await page.reload();await expect(page.locator('#daily')).toBeDisabled();await expect(page.locator('#achievement')).toBeDisabled();
 const cancel=dialog=>dialog.dismiss();page.once('dialog',cancel);await tap(page,'#reset');await expect(page.locator('#balance')).toHaveText('70');
 page.once('dialog',dialog=>dialog.accept());await tap(page,'#reset');
 await expect(page.locator('#balance')).toHaveText('100');await expect(page.locator('.object')).toHaveCount(0);
 expect(await page.evaluate(()=>localStorage.getItem('house-unrelated-test'))).toBe('preserve');
});
test('tasks require actions and renew on Bangkok midnight',async({page})=>{
 await page.clock.install({time:new Date('2026-10-28T23:59:00+07:00')});await open(page);
 await tap(page,'#interact');await expect(page.locator('#balance')).toHaveText('110');
 await tap(page,'#interact');await expect(page.locator('#balance')).toHaveText('110');
 await tap(page,'#left');await tap(page,'#left');await expect(page.locator('#balance')).toHaveText('120');
 await tap(page,'#left');await expect(page.locator('#balance')).toHaveText('120');
 await tap(page,'#daily');await expect(page.locator('#balance')).toHaveText('130');
 await page.clock.fastForward(61000);await page.reload();
 await expect(page.locator('#daily')).toBeEnabled();await tap(page,'#daily');
 await tap(page,'#interact');await expect(page.locator('#balance')).toHaveText('150');
 expect((await state(page)).tasks).toBe(1);
});
test('all furniture stays usable and visible with touch and keyboard',async({page},info)=>{
 await page.setViewportSize({width:320,height:568});
 await page.addInitScript(k=>localStorage.setItem(k,JSON.stringify({coins:50,owned:['bed','sofa','tv','plant','fridge','lamp']})),key);
 await page.emulateMedia({reducedMotion:'reduce'});await open(page);
 const overlaps=await page.locator('.object').evaluateAll(nodes=>nodes.flatMap((a,i)=>nodes.slice(i+1).filter(b=>{
  const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();
  return x.left<y.right&&y.left<x.right&&x.top<y.bottom&&y.top<x.bottom;
 }).map(b=>[a.dataset.id,b.dataset.id])));
 expect(overlaps).toEqual([]);
 for(const [id,mode] of [['bed','sleeping'],['sofa','sitting'],['tv','busy'],['plant','busy'],['fridge','busy'],['lamp','busy']]){
  const furniture=page.locator(`[data-id=${id}]`);const b=await furniture.boundingBox();
  expect(b.width).toBeGreaterThanOrEqual(44);expect(b.height).toBeGreaterThanOrEqual(44);
  await furniture.scrollIntoViewIfNeeded();await furniture.tap();await expect(page.locator('#oki')).toHaveClass(new RegExp(mode));await insideRoom(page);
 }
 await page.locator('[data-id=lamp]').focus();await page.keyboard.press('Enter');await expect(page.locator('#speech')).toContainText('лампу');
 expect(await page.locator('#oki').evaluate(n=>getComputedStyle(n).transitionDuration)).toBe('0s');
 await page.screenshot({path:`quality-reports/house-${info.project.name}-furnished.png`,fullPage:true});
});
test('invalid save recovers and blocked storage gives visible feedback',async({page})=>{
 await page.addInitScript(k=>localStorage.setItem(k,'{"coins":-5,"owned":[]}'),key);
 await open(page);await expect(page.locator('#balance')).toHaveText('100');
 await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new Error('blocked storage');};});
 await tap(page,'#daily');await expect(page.locator('#speech')).toContainText('Не удалось сохранить');
});
