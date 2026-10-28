import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,readdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {HOUSE_BRANCH,prepareHousePreview,runHousePreview} from '../scripts/portal-preview.mjs';
import worker from '../scripts/oki-house-preview-worker.mjs';
const allowed={WORKERS_CI:'1',WORKERS_CI_BRANCH:HOUSE_BRANCH,CLOUDFLARE_API_TOKEN:'offline-test-token'};
test('production and unrelated branches cannot invoke any publishing process',()=>{
 for(const env of [{},{...allowed,WORKERS_CI:'0'},{...allowed,WORKERS_CI_BRANCH:'main'},{...allowed,WORKERS_CI_BRANCH:'experiment/portal-launch'},{...allowed,CLOUDFLARE_ACCOUNT_ID:'other-account'}]){
  assert.equal(runHousePreview({env,prepare:()=>assert.fail('must not prepare'),run:()=>assert.fail('must not publish'),write:()=>{}}),1);
 }
});
test('missing or malformed credentials stop without logging credential values',()=>{
 for(const token of [undefined,'',' bad','bad\ntoken']){
  const logs=[];assert.equal(runHousePreview({env:{...allowed,CLOUDFLARE_API_TOKEN:token},prepare:()=>assert.fail(),write:s=>logs.push(s)}),1);
  assert.deepEqual(logs,['OKI_HOUSE_PREVIEW preview_credential_unavailable']);
 }
});
test('only pinned Wrangler preview is launched and failure is preserved',()=>{
 for(const status of [0,1,17,null]){
  const calls=[];const env={...allowed,PORTAL_PREVIEW_API_TOKEN:'separate-offline-preview-token'};
  const result=runHousePreview({env,prepare:()=>'.oki-house-preview/wrangler.json',write:()=>{},run:(...args)=>{calls.push(args);return{status};}});
  assert.equal(result,status??1);assert.equal(calls.length,1);
  assert.deepEqual(calls[0].slice(0,2),['npx',['--yes','wrangler@4.151.3','preview','--config','.oki-house-preview/wrangler.json']]);
  assert.equal(calls[0][2].env.CLOUDFLARE_API_TOKEN,env.CLOUDFLARE_API_TOKEN);
 }
 const logs=[];assert.equal(runHousePreview({env:allowed,prepare:()=>{throw Error('private details');},write:s=>logs.push(s)}),1);
 assert(!logs.join().includes('private details'));
});
test('archived portal credential cannot override or replace the selected Builds token',()=>{
 const calls=[];
 assert.equal(runHousePreview({env:{...allowed,PORTAL_PREVIEW_API_TOKEN:'obsolete-portal-token'},prepare:()=>'.oki-house-preview/wrangler.json',run:(...args)=>{calls.push(args);return{status:0};},write:()=>{}}),0);
 assert.equal(calls[0][2].env.CLOUDFLARE_API_TOKEN,allowed.CLOUDFLARE_API_TOKEN);
 assert.equal(runHousePreview({env:{...allowed,CLOUDFLARE_API_TOKEN:undefined,PORTAL_PREVIEW_API_TOKEN:'obsolete-portal-token'},prepare:()=>assert.fail('must not reuse archived credential'),write:()=>{}}),1);
});
test('preview packages exactly two game assets and has no production bindings or routes',()=>{
 const root=mkdtempSync(join(tmpdir(),'oki-house-preview-'));
 try{
  mkdirSync(join(root,'site/public'),{recursive:true});
  const html='<title>Дом Оки</title><script>const key="okok-oki-house-v2";</script>';
  writeFileSync(join(root,'site/public/oki-house.html'),html);writeFileSync(join(root,'site/public/oki-game-v2.webp'),Buffer.from('RIFF0000WEBP'));
  writeFileSync(join(root,'site/public/index.html'),'production home must not be uploaded');
  const path=prepareHousePreview(root);const config=JSON.parse(readFileSync(join(root,path),'utf8'));
  assert.deepEqual(Object.keys(config).sort(),['assets','compatibility_date','main','name','previews']);
  assert.equal(config.name,'ok-ok');assert.equal(config.main,'../scripts/oki-house-preview-worker.mjs');assert.deepEqual(config.previews,{});
  assert.deepEqual(config.assets,{directory:'./public',binding:'ASSETS',run_worker_first:true,html_handling:'none'});
  assert.deepEqual(readdirSync(join(root,'.oki-house-preview/public')).sort(),['oki-game-v2.webp','oki-house.html']);
  assert.equal(readFileSync(join(root,'.oki-house-preview/public/oki-house.html'),'utf8'),html);
  writeFileSync(join(root,'site/public/oki-house.html'),'invalid page');assert.throws(()=>prepareHousePreview(root),/build_required/);
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('static preview serves the game and blocks all APIs, mutations and other assets',async()=>{
 const requests=[];const env={ASSETS:{fetch:async request=>{requests.push(new URL(request.url).pathname);return new Response('static asset');}}};
 for(const path of ['/oki-house.html','/oki-game-v2.webp'])assert.equal((await worker.fetch(new Request('https://preview.example'+path),env)).status,200);
 const root=await worker.fetch(new Request('https://preview.example/'),env);assert.equal(root.status,302);assert.equal(root.headers.get('location'),'https://preview.example/oki-house.html');
 for(const path of ['/api/telegram/webhook','/api/ads/create','/api/oki/report','/index.html','/assets/channel/comic.jpg'])assert.equal((await worker.fetch(new Request('https://preview.example'+path),env)).status,404);
 assert.equal((await worker.fetch(new Request('https://preview.example/oki-house.html',{method:'POST'}),env)).status,405);
 assert.deepEqual(requests,['/oki-house.html','/oki-game-v2.webp']);
});
