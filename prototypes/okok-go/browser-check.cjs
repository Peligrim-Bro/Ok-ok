const {chromium}=require('@playwright/test');
const {readFileSync}=require('node:fs');
const {mkdir}=require('node:fs/promises');
const assert=require('node:assert/strict');
(async()=>{
 await mkdir('quality-reports',{recursive:true});
 const browser=await chromium.launch();
 try{for(const width of [390,768]){
  const page=await browser.newPage({viewport:{width,height:844}});
  await page.route('https://go.test/',r=>r.fulfill({body:readFileSync('prototypes/okok-go/index.html','utf8'),contentType:'text/html'}));
  await page.route('https://go.test/api/resolve',r=>r.fulfill({status:422,json:{error:'coordinates_not_available'}}));
  await page.goto('https://go.test/');
  await page.locator('#source').fill('12.934, 100.881');await page.locator('#parse').click();
  assert.equal(await page.locator('#coords').textContent(),'12.934000, 100.881000');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:'quality-reports/go-'+width+'.png',fullPage:true});
  await page.locator('#source').fill('https://maps.app.goo.gl/test');await page.locator('#parse').click();
  await page.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('Ссылка'));
  assert.equal(await page.locator('#result').isVisible(),false);
  assert.equal(await page.locator('#parse').isEnabled(),true);
  await page.locator('#source').fill('nonsense');await page.locator('#parse').click();
  assert.match(await page.locator('#status').textContent(),/^Вставь/);
  await page.route('https://go.test/api/resolve',r=>r.fulfill({json:{placeText:'Pupen Seafood, Na Chom Thian',mapsUrl:'https://www.google.com/maps?q=Pupen+Seafood&ftid=test'}}));
  await page.locator('#source').fill('https://maps.app.goo.gl/ZNZC9pypnDWWxn5GA?g_st=ic');await page.locator('#parse').click();
  await page.waitForFunction(()=>document.querySelector('#copy').textContent==='Скопировать адрес для Grab');
  assert.equal(await page.locator('#coords').textContent(),'Pupen Seafood, Na Chom Thian');
  await page.screenshot({path:'quality-reports/go-place-'+width+'.png',fullPage:true});await page.close();
 }}finally{await browser.close()}
 console.log('390/768px input, error recovery and overflow pass; resolver mocked, not physical iOS');
})().catch(e=>{console.error(e);process.exitCode=1});
