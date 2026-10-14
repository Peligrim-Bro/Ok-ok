import test from 'node:test';
import assert from 'node:assert/strict';
import {runPortalPreview} from '../scripts/portal-preview.mjs';
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
test('an invalid injected token stops and cannot leak bodies or error messages',async()=>{
 const logs=[];let calls=0;
 assert.equal(await runPortalPreview({env:base,write:s=>logs.push(s),request:async()=>{calls++;return response(403,{success:false,errors:[{code:9109,message:token}],result:{secret:token}});},launch:()=>assert.fail('launch forbidden')}),1);
 assert.equal(calls,1);assert(logs.join('').includes('9109'));assert(!logs.join('').includes(token));
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
