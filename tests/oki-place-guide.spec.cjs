const {test,expect}=require('@playwright/test');
const wheel=require('../content/holiday-wheel.json');
const food=wheel.filter(p=>p.category==='food');
const initial={seen:[food[0].id],visited:[food[1].id],saved:[]};
async function prepare(page,lang='ru',theme='dark',waitUntil='domcontentloaded'){
 await page.setViewportSize({width:390,height:844});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(({lang,theme,initial})=>{
  localStorage.setItem('pok-lang',lang);localStorage.setItem('pok-lang-set','1');localStorage.setItem('pok-theme',theme);localStorage.setItem('pok-install-seen','1');
  if(!localStorage.getItem('okok-holiday-wheel'))localStorage.setItem('okok-holiday-wheel',JSON.stringify(initial));
 },{lang,theme,initial});
 await page.goto('/',{waitUntil});
}
async function choose(page){
 await page.locator('[data-spin="1"]').click();
 await page.locator('.oki-guide>summary').click();
 await page.locator('[data-guide-category="food"]').click();
 await page.locator('[data-guide-time="60"]').click();
}

for(const lang of ['ru','en','th'])for(const theme of ['dark','light'])test(`Oki guide keeps catalogue actions, history and close reachable ${lang} ${theme}`,async({page})=>{
 await prepare(page,lang,theme);await choose(page);
 const root=page.locator('.oki-guide');await expect(root.locator('.holiday-result')).toHaveCount(3);
 await expect(root.locator('.holiday-result').first().locator('h3')).toHaveText(food[2].name);
 await expect(root.locator('a.btn.map').first()).toHaveAttribute('href',food[2].maps);
 await expect(root.locator('.place-description').first()).not.toBeEmpty();
 await expect(root.locator('.place-sources summary').first()).toBeAttached();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('okok-holiday-wheel')))).toEqual(initial);
 await root.locator('[data-guide-more]').click();
 await expect(root.locator('.holiday-result').first().locator('h3')).toHaveText(food[5].name);
 await root.locator('[data-holiday-save]').first().click();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('okok-holiday-wheel')));
 expect(saved.saved).toEqual([food[5].id]);expect(saved.seen).toEqual(initial.seen);expect(saved.visited).toEqual(initial.visited);
 await page.screenshot({path:`quality-reports/oki-guide-${lang}-${theme}.png`});
 await page.locator('#spinCard').evaluate(n=>n.scrollTop=n.scrollHeight);
 await expect(page.locator('#spinClose')).toBeInViewport();
 await page.locator('#spinClose').click();await expect(page.locator('#spinMask')).not.toHaveClass(/on/);
});

test.describe('optional module failures',()=>{
test.use({serviceWorkers:'block'});
test('missing optional guide script leaves the original wheel usable',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/assets/oki-place-guide-*.js',route=>route.abort());
 await prepare(page);await page.locator('[data-spin="1"]').click();
 await expect(page.locator('.oki-guide')).toHaveCount(0);
 await page.locator('#lever').click();await expect(page.locator('#spinResult .holiday-result')).toHaveCount(1);
 expect(errors).toEqual([]);
});

test('a stalled guide download does not block the site or the normal wheel',async({page})=>{
 let release;
 await page.route('**/assets/oki-place-guide-*.js',route=>new Promise(resolve=>{
  release=async()=>{await route.continue();resolve();};
 }));
 try{
  await prepare(page);
  expect(release).toBeUndefined(); // No parser-blocking guide request at startup.
  await page.locator('[data-spin="1"]').click();
  await expect.poll(()=>typeof release).toBe('function');
  await expect(page.locator('#lever')).toBeVisible();
  await expect(page.locator('.oki-guide')).toHaveCount(0);
  await page.locator('#lever').click();await expect(page.locator('#spinResult .holiday-result')).toHaveCount(1);
  await page.locator('[data-holiday-filter="saved"]').click();
 }finally{if(release)await release();}
 await expect(page.locator('.oki-guide')).toHaveCount(1);
 await expect(page.locator('.oki-guide')).toBeHidden();
 await page.locator('[data-holiday-filter="all"]').click();
 await expect(page.locator('.oki-guide>summary')).toBeVisible();
});
});

test('the precached guide works offline and blocked storage never breaks navigation',async({page,context})=>{
 await prepare(page);await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBeTruthy();
 await context.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});await choose(page);
 await expect(page.locator('.oki-guide .holiday-result')).toHaveCount(3);
 await page.evaluate(()=>{Storage.prototype.setItem=function(){throw Error('blocked');};});
 await page.locator('.oki-guide [data-holiday-save]').first().click();
 await expect(page.locator('#holidayStatus')).toHaveText('Не удалось сохранить на этом устройстве.');
 await page.locator('#spinClose').click();await expect(page.locator('#spinMask')).not.toHaveClass(/on/);
 await context.setOffline(false);
});
