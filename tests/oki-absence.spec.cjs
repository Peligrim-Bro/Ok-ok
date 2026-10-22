const {test,expect}=require('@playwright/test');
const now=Date.parse('2026-10-22T10:00:00Z'),week=7*86400000;
const pet={version:2,gender:'boy',careDays:190,careDay:'2026-10-22',crystals:231,owned:['neon','aurora'],skin:'aurora',shopUnlocked:true,quest:{feed:true,pet:true,play:true},food:70,mood:70,energy:70,hygiene:70,activity:70,last:now,giftDay:'2026-10-22',reminders:false};
async function prepare(page,state,lang='ru'){
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(({state,lang,now})=>{
  const RealDate=Date;window.okiNow=now;
  window.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[window.okiNow]));}static now(){return window.okiNow;}};
  localStorage.setItem('pok-lang',lang);localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-install-seen','1');
  localStorage.setItem('oki-metrics-v1',JSON.stringify({enabled:false}));localStorage.setItem('oki-life-v1',JSON.stringify(state));
 },{state,lang,now});
 await page.goto('/',{waitUntil:'domcontentloaded'});
}
const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('oki-life-v1')));

test('existing pets get a full grace period, and site visits renew it',async({page})=>{
 await prepare(page,{...pet,last:now-20*86400000});
 let s=await saved(page);expect(s.gender).toBe('boy');expect(s.careDays).toBe(190);expect(s.absenceSeenAt).toBe(now);
 await page.evaluate(t=>{window.okiNow=t;window.dispatchEvent(new Event('pageshow'));},now+week-1);
 s=await saved(page);expect(s.gender).toBe('boy');expect(s.absenceSeenAt).toBe(now+week-1);
 await page.evaluate(t=>{window.okiNow=t;window.dispatchEvent(new Event('pageshow'));},now+week+1000);
 expect((await saved(page)).careDays).toBe(190);
});

for(const lang of ['ru','en','th'])test(`seven days loses only the pet and a new baby can be chosen ${lang}`,async({page})=>{
 await prepare(page,{...pet,absenceVersion:1,absenceGeneration:0,absenceSeenAt:now-week},lang);
 const lost=await saved(page);expect(lost.gender).toBe('');expect(lost.careDays).toBe(0);expect(lost.crystals).toBe(231);expect(lost.owned).toEqual(['neon','aurora']);expect(lost.shopUnlocked).toBe(true);expect(lost.skin).toBe('aurora');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('oki-loss-backup-v1')).pet.careDays)).toBe(190);
 await page.locator('nav.tab [data-tab="game"]').click();
 await expect(page.locator('#okiLife .ol-absence-notice')).toBeVisible();
 await expect(page.locator('#okiLife .ol-absence-rule')).toContainText('7');
 await page.screenshot({path:`quality-reports/oki-absence-${lang}.png`});
 await page.locator('#okiLife [data-gender="girl"]').click();
 await expect(page.locator('#okiLife .ol-absence-notice')).toHaveCount(0);
 const next=await saved(page);expect(next.gender).toBe('girl');expect(next.careDays).toBeLessThanOrEqual(1);expect(next.crystals).toBe(231);expect(next.skin).toBe('aurora');expect(next.absenceLostAt).toBe(0);
 await page.locator('#okiLife .ol-card').evaluate(n=>n.scrollTop=n.scrollHeight);
 await page.locator('#okiLife .ol-close').click();await expect(page.locator('#okiLife')).toHaveCount(0);
});

test('a stale tab cannot resurrect a lost pet while saving care',async({page})=>{
 await prepare(page,{...pet,absenceVersion:1,absenceGeneration:0,absenceSeenAt:now});
 await page.locator('nav.tab [data-tab="game"]').click();
 await page.evaluate(now=>{
  const latest=JSON.parse(localStorage.getItem('oki-life-v1'));
  localStorage.setItem('oki-life-v1',JSON.stringify({...latest,gender:'',careDays:0,absenceGeneration:1,absenceLostAt:now}));
 },now);
 // Bypass pointer events to exercise the old tab's save guard itself.
 await page.locator('#okiLife [data-do="pet"]').evaluate(n=>n.click());
 const state=await saved(page);expect(state.gender).toBe('');expect(state.careDays).toBe(0);expect(state.absenceGeneration).toBe(1);
 await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));
 await expect(page.locator('#okiLife')).toHaveCount(0);
 await page.locator('nav.tab [data-tab="game"]').click();await expect(page.locator('#okiLife .ol-absence-notice')).toBeVisible();
});
