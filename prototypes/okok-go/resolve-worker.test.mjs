import assert from 'node:assert/strict';
import test from 'node:test';
import worker from './resolve-worker.mjs';
const invoke=async(url)=>{const r=await worker.fetch(new Request('https://example.test/api/resolve',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({url})}));return {status:r.status,data:await r.json()};};
test('explicit Google Maps query coordinates',async()=>{const r=await invoke('https://www.google.com/maps/search/?api=1&query=12.934123%2C100.881234');assert.equal(r.status,200);assert.equal(r.data.lat,12.934123);assert.equal(r.data.lng,100.881234);});
test('rejects non Google hosts without fetch',async()=>{const r=await invoke('https://127.0.0.1/private');assert.equal(r.status,400);assert.equal(r.data.error,'unsupported_host');});
test('rejects credentials and non https',async()=>{assert.equal((await invoke('http://maps.app.goo.gl/abc')).status,400);assert.equal((await invoke('https://user:pass@maps.app.goo.gl/abc')).status,400);});
test('rejects invalid coordinates',async()=>{const r=await invoke('https://www.google.com/maps/search/?query=99.12345,181.12345');assert.notEqual(r.status,200);});
