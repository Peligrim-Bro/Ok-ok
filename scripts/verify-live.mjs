import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

export async function verifyLive(commit,request=fetch){
 assert.match(commit,/^[a-f0-9]{40}$/,'A full expected release SHA is required');
 const checked=[];
 const get=async path=>{
  const url=new URL(path,'https://ok-ok.click');
  url.searchParams.set('release-check',commit);
  const response=await request(url,{cache:'no-store',signal:AbortSignal.timeout(15000)});
  assert(response.ok,`${path}: HTTP ${response.status}`);
  checked.push(path);
  return response;
 };
 const info=await (await get('/build-info.json')).json();
 assert.equal(info.commit,commit,'Live site does not match the expected release');
 const html=await (await get('/')).text();
 assert(html.includes('id="okok-tropical-gloss-v1"')&&html.includes('--bg:#061d27')&&html.includes('--bg:#eef5ef'),'Approved Tropical Night palette missing on the live site');
 for(const marker of ['PattayaOK','okok-pulse-v1','oki-nav-float-fix-v4','oki-prompt-tail-fix-v4','okok-tetris-playable-v2','https://t.me/SenateExchange_bot?start=fi10072'])assert(html.includes(marker),`Missing live marker: ${marker}`);
 assert(html.includes("id:'ex24',name:'EX24'")&&html.includes('✓ OK · Проверено')&&html.includes('доставка обычно около 2 часов.'),'Owner exchange cards missing on live site');
 const config=await (await get('/config.js')).text();
 for(const source of [html,config])assert(!/ex24thap|ex24naklua|ex24prat|supermao|agoda/i.test(source),'Retired partner returned on the live site');
 const home=html.slice(html.indexOf('    function renderHome() {'),html.indexOf('    function renderList() {'));
 assert(home.indexOf('data-tours="1"')>=0&&home.indexOf('id="okAds"')>home.indexOf('data-tours="1"'),'Live primary actions must precede async ads');
 assert(html.includes('family=Manrope:wght@400;500;600;700;800&display=optional'),'Live font strategy changed');
 const background=await (await get('/assets/spatial/spatial.js')).text();
 assert(background.includes('hedgehogs-3d-v102'),'Approved 3D background missing');
 const manifest=await (await get('/manifest.json')).json();
 assert.equal(manifest.display,'standalone');
 for(const size of ['192x192','512x512']){
  const icon=manifest.icons.find(i=>i.sizes===size);
  assert(icon,`PWA icon ${size} missing`);
  const url=new URL(icon.src,'https://ok-ok.click/');
  assert.equal(url.origin,'https://ok-ok.click','Unexpected PWA icon host');
  await get(url.pathname);
 }
 const sw=await (await get('/sw.js')).text();
 assert(sw.includes('request.mode === "navigate"')&&sw.includes('url.pathname.startsWith("/api/")'),'Live PWA freshness/API bypass missing');
 for(const path of ['/api/telegram/health','/api/oki/health'])await get(path);
 assert.equal((await (await get('/build-info.json')).json()).commit,commit,'Release changed during verification');
 return {commit,checkedAt:new Date().toISOString(),checked};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const commit=process.env.COMMIT_REF;
 mkdirSync('quality-reports',{recursive:true});
 let failure;
 for(let attempt=1;attempt<=12;attempt++){
  try{
   const report=await verifyLive(commit);
   writeFileSync('quality-reports/live-release.json',JSON.stringify(report,null,2));
   console.log(`PASS: live release ${commit}; ${report.checked.length} public checks`);
   process.exit(0);
  }catch(error){
   failure=error;
   console.log(`Live verification ${attempt}/12: ${error.message}`);
   if(attempt<12)await new Promise(resolve=>setTimeout(resolve,10000));
  }
 }
 writeFileSync('quality-reports/live-release.json',JSON.stringify({commit,error:failure.message,checkedAt:new Date().toISOString()},null,2));
 throw failure;
}
