import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyLive} from '../scripts/verify-live.mjs';
const commit='a'.repeat(40);
function request(override={}){
 return async url=>{
  const path=url.pathname;
  let body;
  if(path in override)body=override[path];
  else if(path==='/build-info.json')body=JSON.stringify({commit});
  else if(path.startsWith('/api/'))body='{}';
  else body=readFileSync('site/public'+(path==='/'?'/index.html':path));
  return new Response(body,{status:body===null?503:200});
 };
}
test('published release checks the built shell, PWA assets and health endpoints',async()=>{
 const result=await verifyLive(commit,request());
 assert.equal(result.commit,commit);
 assert(result.checked.includes('/api/oki/health'));
});
test('an old deployment cannot pass as the expected release',async()=>{
 await assert.rejects(verifyLive(commit,request({'/build-info.json':JSON.stringify({commit:'b'.repeat(40)})})),/expected release/);
});
test('a retired partner in runtime config fails the release check',async()=>{
 await assert.rejects(verifyLive(commit,request({'/config.js':'EX24'})),/Retired partner/);
});
test('an unavailable health endpoint fails the release check',async()=>{
 await assert.rejects(verifyLive(commit,request({'/api/oki/health':null})),/HTTP 503/);
});
