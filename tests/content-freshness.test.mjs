import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const context={};new Script(readFileSync('content-freshness.js','utf8')).runInNewContext(context);
const {state,html}=context.OKOK_FRESHNESS;
const at=s=>Date.parse(s);
test('review age changes at Bangkok midnight, independently of UTC date',()=>{
 assert.equal(state('news','2026-10-20',at('2026-10-21T16:59:59Z')).status,'dated');
 assert.equal(state('news','2026-10-20',at('2026-10-21T17:00:00Z')).status,'due');
 assert.equal(state('news','2026-10-20',at('2026-10-21T17:00:00Z')).ageDays,2);
});
test('service snapshots use their separate 30-calendar-day review interval',()=>{
 assert.equal(state('services','2026-09-22',at('2026-10-22T00:00:00Z')).status,'dated');
 assert.equal(state('services','2026-09-21',at('2026-10-22T00:00:00Z')).status,'due');
});
test('missing, impossible, future and malformed dates cannot become confirmed',()=>{
 for(const date of [null,undefined,'','2026-02-30','2026-10-23','2026-1-01','<img src=x>','2026-10-20T00:00:00Z'])assert.equal(state('news',date,at('2026-10-22T00:00:00Z')).status,'unknown');
 assert.equal(state('news','2024-02-29',at('2024-03-01T00:00:00Z')).status,'dated');
 assert.equal(state('untrusted','2026-10-22',at('2026-10-22T00:00:00Z')).status,'unknown');
 assert.equal(state('news','2026-10-22',NaN).status,'unknown');
});
test('localized notices preserve source dates and never inject untrusted markup',()=>{
 for(const lang of ['ru','en','th']){
  const s=html('services','2026-09-01',lang,at('2026-10-22T00:00:00Z'));
  assert(s.includes('data-freshness-state="due"'));assert(s.includes('2026-09-01'));assert(s.includes('30'));
  const unknown=html('news','<img src=x onerror=alert(1)>',lang,at('2026-10-22T00:00:00Z'));
  assert(!unknown.includes('<img'));assert(unknown.includes('data-freshness-state="unknown"'));
 }
 assert.equal(html('not-a-kind','2026-10-22','ru'), '');
});
