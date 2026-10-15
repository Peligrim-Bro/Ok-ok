import test from 'node:test';
import assert from 'node:assert/strict';
import {runPortalPreview,createPreviewLauncher} from '../scripts/portal-preview.mjs';
const token='test-credential-never-print';
const base={WORKERS_CI:'1',WORKERS_CI_BRANCH:'experiment/portal-launch',CLOUDFLARE_API_TOKEN:token};
const response=(status,body,headers={})=>new Response(JSON.stringify(body),{status,headers});
const ok={success:true,result:{status:'active'}};
test('production and unknown branches cannot make requests or launch preview',async()=>{
 for(const branch of ['main','other',undefined]){
  const result=await runPortalPreview({env:{...base,WORKERS_CI_BRANCH:branch},write:()=>{},request:()=>assert.fail('network forbidden'),launch:()=>assert.fail('launch forbidden')});assert.equal(result,1);
 }
});
test('missing, malformed and wrong-account credentials stop without network',async()=>{
 for(const env of [{...base,CLOUDFLARE_API_TOKEN:''},{...base,CLOUDFLARE_API_TOKEN:' '+token},{...base,CLOUDFLARE_ACCOUNT_ID:'wrong'}]){
  assert.equal(await runPortalPreview({env,write:()=>{},request:()=>assert.fail('network forbidden'),launch:()=>assert.fail('launch forbidden')}),1);
 }
});
test('rejected credentials produce independent read results without leaking secrets',async()=>{
 const logs=[];let calls=0;
 assert.equal(await runPortalPreview({env:base,write:s=>logs.push(s),request:async()=>{calls++;return response(403,{success:false,errors:[{code:9109,message:token}],result:{secret:token}});},launch:()=>assert.fail('launch forbidden')}),1);
 assert.equal(calls,3);assert(logs.join('').includes('9109'));assert(logs.join('').includes('both_worker_apis_rejected'));assert(!logs.join('').includes(token));
});
test('active tokens must also pass ordinary worker and Preview API reads',async()=>{
 let calls=0;const logs=[];
 assert.equal(await runPortalPreview({env:base,write:s=>logs.push(s),request:async()=>++calls<3?response(200,ok):response(403,{success:false,errors:[{code:10000,message:token}]}),launch:()=>assert.fail('launch forbidden')}),1);
 assert.equal(calls,3);assert(logs.join('').includes('preview_api_read'));assert(!logs.join('').includes(token));
});
test('rate limiting is reported once with Retry-After, without retrying',async()=>{
 let calls=0;const logs=[];
 assert.equal(await runPortalPreview({env:base,write:s=>logs.push(s),request:async()=>{calls++;return response(429,{success:false,errors:[{code:10429}]},{'retry-after':'120'});},launch:()=>assert.fail('launch forbidden')}),1);
 assert.equal(calls,1);assert(logs.join('').includes('"retryAfterSeconds":120'));
});
test('only GET checks on Cloudflare API precede the original preview launch',async()=>{
 const paths=[];let launched=0;
 const result=await runPortalPreview({env:base,write:()=>{},request:async(url,options)=>{assert.equal(new URL(url).origin,'https://api.cloudflare.com');assert.equal(options.method,'GET');assert.equal(options.redirect,'error');assert.equal(options.headers.Authorization,'Bearer '+token);paths.push(new URL(url).pathname);return response(200,ok);},launch:()=>{launched++;return {status:0};}});
 assert.equal(result,0);assert.equal(launched,1);assert.equal(paths.length,3);assert.equal(paths[0],'/client/v4/user/tokens/verify');assert(paths[1].endsWith('/settings'));assert(paths[2].endsWith('/workers/workers/ok-ok'));
});
test('network exceptions never reveal credential-bearing exception text',async()=>{
 const logs=[];assert.equal(await runPortalPreview({env:base,write:s=>logs.push(s),request:()=>{throw Error(token);},launch:()=>assert.fail('launch forbidden')}),1);assert(!logs.join('').includes(token));
});
test('a verification-only rejection does not imply rejected Worker access',async()=>{
 let calls=0;let launched=0;const logs=[];
 assert.equal(await runPortalPreview({env:base,write:s=>logs.push(s),request:async()=>++calls===1?response(401,{success:false,errors:[{code:1000}]}):response(200,ok),launch:()=>{launched++;return {status:0};}}),0);
 assert.equal(calls,3);assert.equal(launched,1);assert(logs.join('').includes('"userTokenVerified":false'));assert(logs.join('').includes('both_worker_apis_readable'));
});
test('new Preview API rejection is distinguished from a valid ordinary Worker read',async()=>{
 let calls=0;const logs=[];
 assert.equal(await runPortalPreview({env:base,write:s=>logs.push(s),request:async()=>++calls===2?response(200,ok):response(401,{success:false,errors:[{code:1000}]}),launch:()=>assert.fail('launch forbidden')}),1);
 assert(logs.join('').includes('worker_readable_preview_api_rejected'));
});
test('the dedicated Preview secret is used consistently for reads and launch, never logged',async()=>{
 const secret='dedicated-test-secret';const logs=[];
 assert.equal(await runPortalPreview({env:{...base,PORTAL_PREVIEW_API_TOKEN:secret},write:s=>logs.push(s),request:async(url,options)=>{assert.equal(options.headers.Authorization,'Bearer '+secret);return response(200,ok);},launch:env=>{assert.equal(env.CLOUDFLARE_API_TOKEN,secret);assert.equal(base.CLOUDFLARE_API_TOKEN,token);return {status:0};}}),0);
 assert(logs.join('').includes('portal_preview_secret'));assert(!logs.join('').includes(secret));assert(!logs.join('').includes(token));
});
test('an empty explicit secret never falls back to a different credential',async()=>{
 assert.equal(await runPortalPreview({env:{...base,PORTAL_PREVIEW_API_TOKEN:''},write:()=>{},request:()=>assert.fail('network forbidden'),launch:()=>assert.fail('launch forbidden')}),1);
});
test('launch builds the backend and selects only the isolated Preview configuration',()=>{
 const calls=[];const env={CLOUDFLARE_API_TOKEN:token};
 assert.equal(createPreviewLauncher({run:(...args)=>{calls.push(args);return {status:0};}})(env).status,0);
 assert.deepEqual(calls.map(c=>c[1]),[['telegram-build.mjs'],['scripts/finalize-release-cache.mjs'],['scripts/prepare-portal-preview.mjs'],['wrangler','preview','--config','wrangler-portal-preview.json']]);
 for(const call of calls)assert.equal(call[2].env,env);
});
test('a failed backend or config check cannot reach a remote Preview command',()=>{
 for(const failAt of [0,1,2]){
  let calls=0;const result=createPreviewLauncher({run:()=>({status:calls++===failAt?1:0})})({});
  assert.equal(result.status,1);assert.equal(calls,failAt+1);
 }
});
