const {test,expect}=require('@playwright/test');
test.use({hasTouch:true,isMobile:true});
const key='okok-oki-house-v2';
async function open(page){
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/oki-house.html');
 await expect(page.locator('#oki img')).toBeVisible();
 expect(await page.locator('#oki img').evaluate(n=>n.complete&&n.naturalWidth>0)).toBe(true);
 expect(await page.evaluate(async()=>{const image=new Image();image.src='./oki-walk-v1.webp';await image.decode();return image.naturalWidth>0&&image.naturalHeight>0;})).toBe(true);
 expect(await page.evaluate(async()=>{const im=new Image();im.src='./oki-actions-v1.webp';await im.decode();return im.width>0;})).toBe(true);
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
   return (b.left+r.clientLeft+r.clientWidth-n.getBoundingClientRect().right)/r.clientWidth;
  })).toBeLessThan(0.2);await insideRoom(page);
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

async function frozenHouse(page,owned=['lamp']){
 await page.setViewportSize({width:768,height:1024});
 await page.clock.install({time:new Date('2026-10-28T10:00:00Z')});
 await page.clock.pauseAt(new Date('2026-10-28T10:00:01Z'));
 await page.addInitScript(({key,owned})=>localStorage.setItem(key,JSON.stringify({coins:50,owned})),{key,owned});
 await open(page);
 for(let i=0;i<3;i++)await tap(page,'#left');
 await page.clock.runFor(6000);
}
async function okiBox(page){return page.locator('#oki').boundingBox();}
test('approach has steady steps and lamp interaction waits for arrival',async({page},info)=>{
 await frozenHouse(page);
 const start=await okiBox(page);await tap(page,'[data-id=lamp]');
 await expect(page.locator('#oki')).toHaveAttribute('data-motion','walking');
 await expect(page.locator('[data-id=lamp]')).not.toHaveClass(/lit/);
 await page.clock.runFor(240);const first=await okiBox(page);
 expect(first.x-start.x).toBeGreaterThan(10);expect(first.x-start.x).toBeLessThan(40);
 const pose=await page.locator('.walk-sprite').evaluate(n=>getComputedStyle(n).backgroundPosition);
 await page.screenshot({path:`quality-reports/house-${info.project.name}-walking.png`,fullPage:true});
 await page.clock.runFor(240);const second=await okiBox(page);
 expect(second.x-first.x).toBeGreaterThan(10);expect(second.x-first.x).toBeLessThan(40);
 expect(Math.abs((first.x-start.x)-(second.x-first.x))).toBeLessThan(5);
 expect(await page.locator('.walk-sprite').evaluate(n=>getComputedStyle(n).backgroundPosition)).not.toBe(pose);
 expect(second.y).toBeCloseTo(start.y,1);
 await expect(page.locator('#oki')).toHaveAttribute('data-facing','right');
 await expect(page.locator('[data-id=lamp]')).not.toHaveClass(/lit/);
 await expect(page.locator('#speech')).toContainText('Иду');
 await page.clock.runFor(6000);
 await expect(page.locator('[data-id=lamp]')).toHaveClass(/lit/);
 await expect(page.locator('#speech')).toContainText('включает лампу');
 expect(await page.locator('#oki').getAttribute('data-motion')).not.toBe('walking');
 const end=await okiBox(page),lamp=await page.locator('[data-id=lamp]').boundingBox();
 expect(Math.abs(end.x+end.width*.78-lamp.x-lamp.width/2)).toBeLessThan(2);
 await insideRoom(page);expect((await state(page)).coins).toBe(50);
});
test('changing destination and manual walking cancel the previous interaction',async({page})=>{
 await frozenHouse(page,['bed','lamp']);
 await tap(page,'[data-id=lamp]');await page.clock.runFor(900);
 const before=await okiBox(page);await tap(page,'[data-id=bed]');await page.clock.runFor(200);
 await expect(page.locator('#oki')).toHaveAttribute('data-facing','left');
 expect((await okiBox(page)).x).toBeLessThan(before.x);
 await page.clock.runFor(6000);
 await expect(page.locator('#speech')).toContainText('кровати');
 await expect(page.locator('[data-id=lamp]')).not.toHaveClass(/lit/);
 await tap(page,'[data-id=lamp]');await page.clock.runFor(200);await tap(page,'#left');await page.clock.runFor(6000);
 await expect(page.locator('[data-id=lamp]')).not.toHaveClass(/lit/);
 await expect(page.locator('#speech')).not.toContainText('лампу');
 await insideRoom(page);
});
test('resize and shop rendering keep the pending approach attached to the object',async({page})=>{
 await frozenHouse(page);await tap(page,'[data-id=lamp]');await page.clock.runFor(250);
 await page.setViewportSize({width:320,height:568});await tap(page,'#daily');
 await page.clock.runFor(6000);
 await expect(page.locator('[data-id=lamp]')).toHaveClass(/lit/);await insideRoom(page);
 const end=await okiBox(page),lamp=await page.locator('[data-id=lamp]').boundingBox();
 expect(Math.abs(end.x+end.width*.78-lamp.x-lamp.width/2)).toBeLessThan(2);
 expect((await state(page)).coins).toBe(60);
});
test('reset cancels queued actions and restores the starting position',async({page})=>{
 await frozenHouse(page);await tap(page,'[data-id=lamp]');await page.clock.runFor(250);
 page.once('dialog',d=>d.accept());await tap(page,'#reset');const start=await okiBox(page);
 await page.clock.runFor(6000);
 await expect(page.locator('#oki')).toHaveAttribute('data-motion','idle');await expect(page.locator('.object')).toHaveCount(0);
 await expect(page.locator('#speech')).toHaveText('Начинаем сначала!');
 expect((await okiBox(page)).x).toBeCloseTo(start.x,1);expect((await state(page)).coins).toBe(100);await insideRoom(page);
});

test('furniture has visible poses and appliance reactions',async({page},info)=>{
 await frozenHouse(page,['bed','sofa','tv','plant','fridge','lamp']);
 for(const [id,pose] of [['sofa','1'],['bed','2'],['fridge','3'],['tv','0'],['lamp','0']]){
  await tap(page,'[data-id='+id+']');
  for(let i=0;i<80;i++){await page.clock.runFor(100);if(await page.locator('#oki').getAttribute('data-action')===id)break;}
  await page.clock.runFor(550);
  await expect(page.locator('#oki')).toHaveAttribute('data-pose',pose);
  if(id==='fridge')await expect(page.locator('[data-id=fridge]')).toHaveClass(/open/);
  if(id==='tv')await expect(page.locator('[data-id=tv]')).toHaveClass(/on/);
  if(id==='lamp')await expect(page.locator('[data-id=lamp]')).toHaveClass(/lit/);
  await insideRoom(page);
  await page.screenshot({path:`quality-reports/house-${info.project.name}-action-${id}.png`,fullPage:true});
 }
 expect((await state(page)).coins).toBe(50);
});
test('Oki comments match the action, vary, and respect reward feedback',async({page})=>{
 await frozenHouse(page,['plant','sofa']);
 const comments=[];
 for(let repeat=0;repeat<2;repeat++){
  await tap(page,'[data-id=plant]');
  for(let i=0;i<80;i++){await page.clock.runFor(100);if(await page.locator('#speech').getAttribute('data-dialogue')==='plant')break;}
  await expect(page.locator('#speech')).toHaveAttribute('data-dialogue','plant');
  comments.push(await page.locator('#speech').innerText());
 }
 expect(comments[0]).not.toBe(comments[1]);
 await tap(page,'#daily');await page.clock.runFor(5000);await expect(page.locator('#speech')).toContainText('Ежедневная награда');
 await page.clock.runFor(40000);await expect(page.locator('#speech')).toHaveAttribute('data-dialogue','idle');
 const quiet=await page.locator('#speech').innerText();await page.clock.runFor(40000);expect(await page.locator('#speech').innerText()).toBe(quiet);
 expect((await state(page)).coins).toBe(60);
});
