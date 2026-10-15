import test from 'node:test';
import assert from 'node:assert/strict';
import {portalPreviewConfig} from '../scripts/prepare-portal-preview.mjs';
const generated=()=>({name:'ok-ok',main:'weather-worker.mjs',assets:{binding:'ASSETS',directory:'./site/public',run_worker_first:['/api/weather','/api/ads/*']},migrations:[{tag:'okok-ads-v1',new_sqlite_classes:['AdsStore']}],durable_objects:{bindings:[{name:'ADS_STORE',class_name:'AdsStore'}]}});
const base=()=>({previews:{durable_objects:{bindings:[{name:'ADS_STORE',class_name:'AdsStore'}]}}});
test('Preview has an independent local class binding and leaves production config unchanged',()=>{
 const source=generated();const before=structuredClone(source);const config=portalPreviewConfig(source,base());
 assert.deepEqual(source,before);assert.equal(source.previews,undefined);assert.deepEqual(config.previews,base().previews);
 assert.equal(config.main,'weather-worker.mjs');assert.deepEqual(config.migrations,source.migrations);
});
test('production services, named external classes and copied storage IDs are rejected',()=>{
 for(const unsafe of [undefined,{durable_objects:{bindings:[{name:'ADS_STORE',class_name:'AdsStore',script_name:'ok-ok'}]}},{...base().previews,kv_namespaces:[{binding:'SHARED',id:'production-id'}]},{...base().previews,vars:{TOKEN:'must-not-be-published'}}]){
  assert.throws(()=>portalPreviewConfig(generated(),{previews:unsafe}));
 }
});
test('missing backend generation or SQLite migration cannot produce deployable config',()=>{
 for(const patch of [{name:'other'},{main:'cloudflare-telegram-worker.mjs'},{assets:{}},{migrations:[]}])assert.throws(()=>portalPreviewConfig({...generated(),...patch},base()));
});
