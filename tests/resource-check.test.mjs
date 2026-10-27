import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {findBusinesses,reportAge} from '../safety/resource-check.mjs';
const data=JSON.parse(readFileSync('content/business-reports.json','utf8'));
test('business identity matching keeps names, aliases and source domains distinct',()=>{
 assert.equal(findBusinesses(data.records,'спидбайк').records[0].id,'speed-bike');
 assert.equal(findBusinesses(data.records,'Progress Pattaya').records[0].id,'progress-language');
 assert.equal(findBusinesses(data.records,'https://speedbikepattaya.com/').records[0].id,'speed-bike');
 assert.equal(findBusinesses(data.records,'speedbikepattaya.com').records[0].id,'speed-bike');
 assert.equal(findBusinesses(data.records,'https://speedbikepattaya.com.evil.example/').records.length,0);
 assert.equal(findBusinesses(data.records,'https://deetrip-tours.my.canva.site/other-company').records.length,0);
 assert.equal(findBusinesses(data.records,'https://www.google.com/maps/search/?api=1&query=Unknown+Business').records.length,0);
 assert.equal(findBusinesses(data.records,'javascript:alert(1)').invalid,true);
 assert.equal(findBusinesses(data.records,'https://user:password@example.com').invalid,true);
 assert.equal(findBusinesses(data.records,'https://example.com/%ZZ').invalid,true);
 assert.equal(findBusinesses(data.records,'Unknown School Phuket').records.length,0);
});
test('dated reports preserve snapshot provenance and expose unknown verification',()=>{
 assert.equal(data.records.length,10);assert.equal(new Set(data.records.map(r=>r.id)).size,10);
 for(const r of data.records){assert.equal(r.city,'pattaya');assert.equal(reportAge(r.source.reviewed,'2026-10-27')!==null,true);for(const l of ['ru','en','th'])assert(r.fact[l]);assert.equal(new URL(r.source.url).protocol,'https:');if(r.rating)assert.equal(r.rating.reviewed,'2026-10-18');}
 assert.equal(data.records.find(r=>r.id==='progress-language').licenceClaim,'ชบ 0003/2545');
 assert.equal(reportAge('2026-10-18','2026-11-18'),31);
 assert.equal(reportAge('2026-11-18','2026-10-18'),null);assert.equal(reportAge('2026-02-31','2026-10-27'),null);
});
