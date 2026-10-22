import {test} from 'node:test';
import assert from 'node:assert/strict';
import {auditQueue} from '../scripts/audit-channel-queue.mjs';
const now=Date.parse('2026-10-22T00:00:00+07:00');
const p={id:'test-slot',text:'Test',approved:true,publishAt:'2026-10-22T09:00:00+07:00',expiresAt:'2026-10-22T12:00:00+07:00'};
test('offline audit reports actual gaps and missing illustrations without inventing delivery',()=>{
 const r=auditQueue([p],now);assert.equal(r.ready,false);assert.equal(r.missingSlots.length,27);
 assert.deepEqual(r.missingImages,[p.id]);assert.equal(r.delivery.enabled,'unknown');
});
test('identical source bytes under different filenames are reported across history',()=>{
 const r=auditQueue([{...p,id:'old-photo',photo:'https://www.ok-ok.click/assets/channel/old.jpg'},
  {...p,id:'new-photo',photo:'https://www.ok-ok.click/assets/channel/new.jpg',publishAt:'2026-10-23T09:00:00+07:00',expiresAt:'2026-10-23T12:00:00+07:00'}],now,()=>new Uint8Array([1,2,3]));
 assert.equal(r.imageDuplicates.length,1);assert.equal(r.ready,false);
});
