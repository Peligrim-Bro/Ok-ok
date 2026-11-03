import {test,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
let server;
test.beforeAll(async()=>{
 server=createServer(async(req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=resolve(process.cwd(),'.'+pathname);
  if(!file.startsWith(process.cwd()+'/')){res.writeHead(403).end();return}
  try{
   const body=await readFile(file);
   res.setHeader('Content-Type',extname(file)==='.mjs'?'text/javascript':extname(file)==='.html'?'text/html':'text/plain');
   res.end(body);
  }catch{res.writeHead(404).end()}
 });
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
});
test.afterAll(async()=>{await new Promise(ok=>server.close(ok))});
const url=path=>'http://127.0.0.1:'+server.address().port+path;
test('INSPECT saves fields and switches independent modes',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url('/inspect.html'));
 await page.locator('#plateNumber').fill('กข 1234');
 await page.locator('#rentalName').fill('Test rental');
 await page.locator('#return').click();
 await expect(page.locator('#plateNumber')).toHaveValue('');
 await page.locator('#start').click();
 await expect(page.locator('#plateNumber')).toHaveValue('กข 1234');
 await page.reload();
 await expect(page.locator('#plateNumber')).toHaveValue('กข 1234');
 expect(errors).toEqual([]);
});
test('SPLIT page loads without module errors',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url('/split-bill.html'));
 await expect(page.locator('body')).toContainText('SPLIT');
 expect(errors).toEqual([]);
});

test('INSPECT blocks incomplete PDF and supports English',async({page})=>{
 await page.goto(url('/inspect.html'));
 await page.locator('#pdf').click();
 await expect(page.locator('#status')).toContainText('Добавьте пять');
 await page.locator('#lang').click();
 await expect(page.locator('#pdf')).toHaveText('Create PDF');
 await page.locator('#pdf').click();
 await expect(page.locator('#status')).toContainText('Add all five');
});

test('INSPECT captures photo and keeps it after reload',async({page})=>{
 await page.goto(url('/inspect.html'));
 const image=await page.evaluate(()=>{
  const canvas=document.createElement('canvas');canvas.width=240;canvas.height=120;
  canvas.getContext('2d').fillRect(0,0,240,120);
  return canvas.toDataURL('image/png').split(',')[1];
 });
 await page.locator('#slots input[type=file]').first().setInputFiles({name:'front.png',mimeType:'image/png',buffer:Buffer.from(image,'base64')});
 await expect(page.locator('#progress')).toHaveText('1/5');
 await expect(page.locator('#slots img')).toHaveCount(1);
 await page.reload();
 await expect(page.locator('#progress')).toHaveText('1/5');
 await expect(page.locator('#slots img')).toHaveCount(1);
});

test('INSPECT generates downloadable PDF with five photos and multilingual notes',async({page})=>{
 await page.goto(url('/inspect.html'));
 await page.locator('#plateNumber').fill('กข 1234');
 await page.locator('#rentalName').fill('Прокат ทดสอบ');
 await page.locator('#damageNotes').fill('Царапина слева / รอยขีดข่วน');
 const image=await page.evaluate(()=>{
  const canvas=document.createElement('canvas');canvas.width=240;canvas.height=120;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#f5ba32';ctx.fillRect(0,0,240,120);
  return canvas.toDataURL('image/png').split(',')[1];
 });
 for(let i=0;i<5;i++){
  await page.locator('#slots input[type=file]').nth(i).setInputFiles({name:'view'+i+'.png',mimeType:'image/png',buffer:Buffer.from(image,'base64')});
  await expect(page.locator('#progress')).toHaveText((i+1)+'/5');
 }
 const [download]=await Promise.all([page.waitForEvent('download',{timeout:45000}),page.locator('#pdf').click()]);
 expect(download.suggestedFilename()).toMatch(/^OKOK_INSPECT_START_.*\.pdf$/);
 await expect(page.locator('#status')).toContainText('PDF готов');
 const fs=await import('node:fs/promises');
 const bytes=await fs.readFile(await download.path());
 expect(bytes.subarray(0,5).toString()).toBe('%PDF-');
 expect(bytes.length).toBeGreaterThan(10000);
});

test('mobile built-site navigation reaches both tools',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto(url('/site/public/tools.html'));
 await expect(page.locator('h1')).toHaveText('Полезное');
 await expect(page.locator('a[href="./split-bill.html"]')).toBeVisible();
 await expect(page.locator('a[href="./inspect.html"]')).toBeVisible();
 await page.locator('#lang').click();
 await expect(page.locator('h1')).toHaveText('Tools');
 await page.locator('#lang').click();
 await expect(page.locator('h1')).toHaveText('เครื่องมือ');
 await page.locator('a[href="./split-bill.html"]').click();
 await expect(page).toHaveURL(/site\/public\/split-bill\.html$/);
 await expect(page.locator('body')).toBeVisible();
 await page.locator('header a[href="./tools.html"]').click();
 await expect(page).toHaveURL(/site\/public\/tools\.html$/);
 await page.locator('a[href="./inspect.html"]').click();
 await expect(page).toHaveURL(/site\/public\/inspect\.html$/);
 await expect(page.locator('body')).toBeVisible();
 await page.locator('header a[href="./tools.html"]').click();
 await expect(page).toHaveURL(/site\/public\/tools\.html$/);
});

test('built mobile homepage exposes a working Tools entry',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url('/site/public/index.html'),{waitUntil:'domcontentloaded'});
 const link=page.locator('a.okok-tools-entry[href="./tools.html"]');
 await expect(link).toHaveCount(1);
 await expect(link).toBeVisible();
 await link.click({noWaitAfter:true,timeout:8000});
 await page.waitForURL(/site\/public\/tools\.html$/,{waitUntil:'commit',timeout:8000});
 await expect(page.locator('a[href="./split-bill.html"]')).toBeVisible();
 await expect(page.locator('a[href="./inspect.html"]')).toBeVisible();
});

test('Travel Reads shelf loads on mobile and keeps bookmark locally',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto(url('/site/public/travel-reads.html'));
 await expect(page.locator('.book')).toHaveCount(3);
 await expect(page.locator('#title')).toHaveText('Попутчик');
 await page.locator('#readingProgress').selectOption('last-passenger');
 await page.reload();
 await expect(page.locator('#readingProgress')).toHaveValue('last-passenger');
 await page.locator('#lang').click();
 await expect(page.locator('#title')).toHaveText('Travel Reads');
 await expect(page.locator('#bookmarkLabel')).toHaveText('Save a book to your shelf');
 await expect(page.locator('#readingProgress')).toHaveValue('last-passenger');
 await page.locator('#fontUp').click();
 await expect(page.locator('#fontSizeLabel')).toHaveText('Text: 110%');
 await page.reload();
 await expect(page.locator('#fontSizeLabel')).toHaveText('Text: 110%');
 for(let i=0;i<5;i++)await page.locator('#fontUp').click();
 await expect(page.locator('#fontSizeLabel')).toHaveText('Text: 140%');
 for(let i=0;i<6;i++)await page.locator('#fontDown').click();
 await expect(page.locator('#fontSizeLabel')).toHaveText('Text: 90%');
});

test('Travel Reads opens accessible preview without inventing unpublished story',async({page})=>{
 await page.goto(url('/site/public/travel-reads.html'));
 await page.locator('.book').first().click();
 await expect(page.locator('#reader')).toBeVisible();
 await expect(page.locator('#readerTitle')).toHaveText('Последний пассажир');
 await expect(page.locator('#readerStatus')).toContainText('ещё не опубликован');
 await page.locator('#readerClose').click();
 await expect(page.locator('#reader')).toBeHidden();
});

test('Travel Reads age filters and three complete bilingual stories',async({page})=>{
 await page.goto(url('/site/public/travel-reads.html'));
 await page.locator('[data-filter="3-6"]').click();
 await expect(page.locator('.book:visible')).toHaveCount(1);
 await page.locator('[data-age="3-6"]').click();
 await expect(page.locator('#readerStory p')).toHaveCount(1);await expect(page.locator('#sceneProgress')).toContainText('1 / 8');
 await expect(page.locator('#readerStory')).toContainText('звёзд');await page.locator('#sceneNext').click();await expect(page.locator('#sceneProgress')).toContainText('2 / 8');await expect(page.locator('#sceneTrack')).toHaveAttribute('aria-valuenow','2');
 await page.locator('#readerClose').click();
 await page.locator('[data-filter="7-10"]').click();
 await expect(page.locator('.book:visible')).toHaveCount(1);
 await page.locator('[data-age="7-10"]').click();
 await expect(page.locator('#readerStory p')).toHaveCount(1);await expect(page.locator('#sceneProgress')).toContainText('1 / 8');
 await page.locator('#readerClose').click();
 await page.locator('[data-filter="adult"]').click();
 await page.locator('[data-age="adult"]').nth(1).click();
 await expect(page.locator('#readerStory p')).toHaveCount(1);await expect(page.locator('#sceneProgress')).toContainText('1 / 8');
 await page.locator('#lang').click();
 await expect(page.locator('#book2')).toHaveText('Room Without a Guest');
 await page.locator('[data-age="adult"]').nth(1).click();
 await expect(page.locator('#readerStory p')).toHaveCount(1);await expect(page.locator('#sceneProgress')).toContainText('1 / 8');
 await expect(page.locator('#readerStory')).toContainText('Pattaya');
});

test('Travel Reads swipe advances scene and keeps progress after reopening',async({page})=>{
 await page.goto(url('/site/public/travel-reads.html'));
 await page.locator('[data-age="3-6"]').click();
 const area=page.locator('#readerStory');
 await expect(page.locator('#sceneProgress')).toContainText('1 / 8');
 await area.dispatchEvent('touchstart',{touches:[{clientX:270,clientY:240}]});
 await area.dispatchEvent('touchend',{changedTouches:[{clientX:95,clientY:244}]});
 await expect(page.locator('#sceneProgress')).toContainText('2 / 8');
 await page.locator('#readerClose').click();
 await page.locator('[data-age="3-6"]').click();
 await expect(page.locator('#sceneProgress')).toContainText('2 / 8');
 await expect(page.locator('#readerStory p')).toHaveClass(/turn/);
});
