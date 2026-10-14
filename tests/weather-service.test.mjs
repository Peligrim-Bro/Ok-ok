import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeForecast,weatherResponse} from '../weather-service.mjs';
const now=Date.now();
const fixture=(symbol='rain',offset=0)=>({properties:{meta:{updated_at:new Date(now).toISOString()},timeseries:[{time:new Date(now-offset).toISOString(),data:{instant:{details:{wind_speed:2}},next_1_hours:{summary:{symbol_code:symbol}}}}]}});
test('maps current-hour weather without inventing rainfall',()=>{
 for(const [symbol,weather]of [['clearsky_day','clear'],['clearsky_night','clear'],['cloudy','cloud'],['fog','fog'],['rain','rain'],['heavyrainandthunder','storm'],['unknown','unknown']])assert.equal(normalizeForecast(fixture(symbol),now).weather,weather);
 assert.equal(normalizeForecast(fixture('clearsky_night'),now).is_day,0);
 assert.throws(()=>normalizeForecast(fixture('rain',7200e3),now),/Stale/);
});
test('rejects arbitrary cities and methods without contacting upstream',async()=>{
 const fail=()=>{throw Error('Must not fetch')};
 assert.equal((await weatherResponse(new Request('https://ok-ok.click/api/weather?city=else'),null,fail,now)).status,400);
 assert.equal((await weatherResponse(new Request('https://ok-ok.click/api/weather?city=pattaya',{method:'POST'}),null,fail,now)).status,405);
});
test('upstream failure stays unavailable rather than becoming clouds',async()=>{
 const r=await weatherResponse(new Request('https://ok-ok.click/api/weather?city=bangkok'),null,async()=>new Response('',{status:503}),now);
 assert.equal(r.status,503);
});
test('identifies the application and caches city forecasts until expiry',async()=>{
 let calls=0;
 const fetcher=async(url,options)=>{calls++;assert(url.includes('lat=7.8804&lon=98.3923'));assert(options.headers['User-Agent'].includes('ok-ok.click'));return Response.json(fixture(),{headers:{expires:new Date(now+3600e3).toUTCString()}})};
 for(let i=0;i<2;i++){const r=await weatherResponse(new Request('https://ok-ok.click/api/weather?city=phuket'),null,fetcher,now);assert.equal(r.status,200);assert.equal((await r.json()).current.weather,'rain')}
 assert.equal(calls,1);
});
