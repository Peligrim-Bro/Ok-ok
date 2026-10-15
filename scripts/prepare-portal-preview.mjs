import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

export function portalPreviewConfig(generated,base){
 assert.equal(generated.name,'ok-ok','Unexpected Worker');
 assert.equal(generated.main,'weather-worker.mjs','Build the current backend before Preview');
 assert(generated.assets?.run_worker_first?.includes('/api/weather'),'Weather route missing');
 assert(generated.migrations?.some(m=>m.new_sqlite_classes?.includes('AdsStore')),'SQLite migration missing');
 // Only a local class binding, with no script_name or namespace identifier.
 // Worker Previews provisions its own namespace for this class on each branch.
 const isolated={durable_objects:{bindings:[{name:'ADS_STORE',class_name:'AdsStore'}]}};
 assert.deepEqual(base.previews,isolated,'Preview bindings must be isolated and contain no production services, storage IDs or secrets');
 const config=structuredClone(generated);
 config.previews=structuredClone(base.previews);
 return config;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const config=portalPreviewConfig(JSON.parse(readFileSync('wrangler-telegram.json','utf8')),JSON.parse(readFileSync('wrangler.jsonc','utf8')));
 writeFileSync('wrangler-portal-preview.json',JSON.stringify(config,null,2)+'\n');
 console.log('CF_DIAGNOSTIC {"check":"preview_config","result":"isolated_ADS_STORE_with_current_weather_backend"}');
}
