import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {releaseCacheName,verifyReleaseCache} from '../scripts/release-cache.mjs';
const info={commit:'33acee5fb459884dc8bdb207dd0d0d2271763f02',builtAt:'2026-10-08T08:00:00.000Z'};
test('cache is stable for a commit and changes for a new source release',()=>{
  assert.equal(releaseCacheName(info),releaseCacheName({...info,builtAt:'2026-10-09T08:00:00.000Z'}));
  assert.notEqual(releaseCacheName(info),releaseCacheName({...info,commit:'a'.repeat(40)}));
  const local={...info,commit:null};
  assert.notEqual(releaseCacheName(local),releaseCacheName({...local,builtAt:'2026-10-09T08:00:00.000Z'}));
});
test('gate rejects runtime timestamps, fixed names, wrong commits and duplicate declarations',()=>{
  const good='const CACHE = '+JSON.stringify(releaseCacheName(info))+';';
  verifyReleaseCache(good,info);
  for(const bad of ['const CACHE = "pattayaok-ga4-events-v1-"+Date.now();','const CACHE = "pattayaok-fixed";',good.replace('33acee5fb459','68d4f3500000'),good+'\n'+good])assert.throws(()=>verifyReleaseCache(bad,info));
});
test('GA4 patch preserves release cache and remains idempotent',()=>{
  const root=mkdtempSync(join(tmpdir(),'okok-ga4-'));
  try {
    mkdirSync(join(root,'site/public'),{recursive:true});
    const sw='const CACHE = '+JSON.stringify(releaseCacheName(info))+';';
    writeFileSync(join(root,'site/public/sw.js'),sw);
    writeFileSync(join(root,'site/public/index.html'),'<html><body></body></html>');
    const patch=fileURLToPath(new URL('../scripts/apply-ga4-events.mjs',import.meta.url));
    for(let i=0;i<2;i++){
      const result=spawnSync(process.execPath,[patch],{cwd:root,encoding:'utf8'});
      assert.equal(result.status,0,result.stderr);
      assert.equal(readFileSync(join(root,'site/public/sw.js'),'utf8'),sw);
    }
    assert.equal((readFileSync(join(root,'site/public/index.html'),'utf8').match(/<script id="ok-ga4-events-v1">/g)||[]).length,1);
  } finally {rmSync(root,{recursive:true,force:true});}
});
