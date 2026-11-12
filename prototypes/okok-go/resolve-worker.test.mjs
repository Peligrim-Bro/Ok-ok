import assert from 'node:assert/strict';
import test from 'node:test';
import worker, {pointFrom} from './resolve-worker.mjs';
const invoke=async(url)=>{const r=await worker.fetch(new Request('https://example.test/api/resolve',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({url})}));return {status:r.status,data:await r.json()};};
test('explicit Google Maps query coordinates',async()=>{const r=await invoke('https://www.google.com/maps/search/?api=1&query=12.934123%2C100.881234');assert.equal(r.status,200);assert.equal(r.data.lat,12.934123);assert.equal(r.data.lng,100.881234);});
test('rejects non Google hosts without fetch',async()=>{const r=await invoke('https://127.0.0.1/private');assert.equal(r.status,400);assert.equal(r.data.error,'unsupported_host');});
test('rejects credentials and non https',async()=>{assert.equal((await invoke('http://maps.app.goo.gl/abc')).status,400);assert.equal((await invoke('https://user:pass@maps.app.goo.gl/abc')).status,400);});
test('rejects invalid coordinates',async()=>{const r=await invoke('https://www.google.com/maps/search/?query=99.12345,181.12345');assert.notEqual(r.status,200);});

test('destination pin wins over viewport',async()=>{const r=await invoke('https://www.google.com/maps/place/test/@13.12345,101.12345,15z/data=!3d12.934!4d100.881');assert.equal(r.data.lat,12.934);assert.equal(r.data.lng,100.881);});
test('viewport alone is never a destination',()=>{assert.equal(pointFrom(new URL('https://www.google.com/maps/@13.12345,101.12345,15z')),null);});
test('encoded coordinate query and integer coordinates',async()=>{const r=await invoke('https://www.google.com/maps?query=12%2C100');assert.equal(r.data.lat,12);assert.equal(r.data.lng,100);});
test('rejects oversized body without content-length',async()=>{const r=await worker.fetch(new Request('https://example.test/api/resolve',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({url:'x'.repeat(5000)})}));assert.equal(r.status,413);});
test('rejects hostile redirect before fetching target',async()=>{const original=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;return new Response(null,{status:302,headers:{location:'https://127.0.0.1/private'}})};try{assert.equal((await invoke('https://maps.app.goo.gl/test')).status,400);assert.equal(calls,1)}finally{globalThis.fetch=original}});

test('iPhone place shortlink returns named place without inventing coordinates',async()=>{const original=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;return new Response(null,{status:302,headers:{location:'https://maps.google.com?q=Pupen+Seafood&ftid=0x3102940477d1dee9:0x74db886f251470ae'}})};try{const r=await invoke('https://maps.app.goo.gl/ZNZC9pypnDWWxn5GA?g_st=ic');assert.equal(r.status,200);assert.equal(r.data.placeText,'Pupen Seafood');assert.equal(r.data.lat,undefined);assert.equal(calls,1);assert.match(r.data.mapsUrl,/ftid=/)}finally{globalThis.fetch=original}});
