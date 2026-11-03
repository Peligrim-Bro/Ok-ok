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
