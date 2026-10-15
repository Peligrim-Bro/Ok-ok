import test from 'node:test';
import assert from 'node:assert/strict';
import {adsHandle,AdsStore,CFG} from '../cloudflare-telegram-worker.mjs';
const T=Date.parse('2026-10-15T06:00:00Z');
const txid=n=>Number(n).toString(16).padStart(64,'0');
const transfer=(id,micro,at=T+1000)=>({transaction_id:id,to:CFG.wallet,from:'TOfflinePayer',type:'Transfer',value:String(micro),block_timestamp:at,token_info:{address:CFG.usdt}});
function sandbox(){
 let now=T,rows=[],db={},requests=0,down=false;const notes=[];
 const store={get:async k=>structuredClone(db[k]),set:async(k,v)=>{db[k]=structuredClone(v)}};
 const deps={now:()=>now,ip:()=>String(requests),store:async()=>store,notify:async s=>{notes.push(s)},fetch:async()=>{if(down)throw Error('offline test');return Response.json({data:rows})}};
 const call=async(action,body)=>{requests++;const r=await adsHandle(new Request('https://test.invalid/api/ads/'+action,body?{method:'POST',body:JSON.stringify(body)}:undefined),deps);return {http:r.status,...await r.json()}};
 return {call,notes,time:t=>{now=t},rows:r=>{rows=r},down:()=>{down=true},state:()=>structuredClone(db.state),seed:st=>{db.state=structuredClone(st)}};
}
const create=(s,n)=>s.call('create',{title:'Cafe '+n,text:'Fresh breakfast and coffee every morning '+n,contact:'@cafe_'+n,agree:true});
const micro=o=>Math.round(Number(o.amount)*1e6);
const status=(s,o)=>s.call('status?id='+o.id+'&t='+o.token);
const claim=(s,o,id)=>s.call('txid',{id:o.id,t:o.token,txid:id});
test('new invoice amounts are unique, within the approved range and disclosed by list',async()=>{
 const s=sandbox(),amounts=new Set();
 for(let i=0;i<40;i++){const o=await create(s,'name'+i);assert.equal(o.http,200);const m=micro(o);assert(m>=15010000&&m<=15990000&&m%10000===0);assert(!amounts.has(m));amounts.add(m)}
 assert.equal((await create(s,'overflow')).error,'busy');const list=await s.call('list');assert.equal(list.minAmount,'15.01');assert.equal(list.maxAmount,'15.99');
});
test('exact confirmed transfer publishes without TXID and expires precisely after 24 hours',async()=>{
 const s=sandbox(),o=await create(s,'alpha');s.rows([transfer(txid(1),micro(o))]);s.time(T+61000);
 const live=await status(s,o);assert.equal(live.status,'live');assert.equal(live.endAt-live.startAt,CFG.duration);assert.equal((await s.call('list')).ads.length,1);assert.equal(s.notes.length,1);
 s.time(live.endAt-1);assert.equal((await s.call('list')).ads.length,1);s.time(live.endAt);assert.equal((await s.call('list')).ads.length,0);
});
test('a different order cannot claim this invoice payment and a TXID cannot be reused',async()=>{
 const s=sandbox(),a=await create(s,'bravo'),b=await create(s,'charlie');s.rows([transfer(txid(2),micro(a))]);
 assert.equal((await claim(s,b,txid(2))).result.code,'tx_amount');assert.equal((await status(s,b)).status,'pending');assert.equal((await claim(s,a,txid(2))).status,'live');assert.equal((await claim(s,b,txid(2))).result.code,'tx_used');assert.equal(s.notes.length,1);
});
test('old and mismatched transfers never activate an invoice',async()=>{
 const s=sandbox(),o=await create(s,'delta');
 for(const amount of [micro(o)-10000,micro(o)+10000,15000000]){s.rows([transfer(txid(3),amount)]);assert.equal((await claim(s,o,txid(3))).result.code,'tx_amount')}
 s.rows([transfer(txid(3),micro(o),T-61000)]);assert.equal((await claim(s,o,txid(3))).result.code,'tx_old');assert.equal((await status(s,o)).status,'pending');assert.equal(s.notes.length,0);
});
test('payment window expires on reads even if no new order triggers pruning',async()=>{
 const s=sandbox(),o=await create(s,'echoo');s.time(T+CFG.lateGrace);s.rows([transfer(txid(4),micro(o),T+CFG.lateGrace)]);assert.equal((await claim(s,o,txid(4))).status,'expired');assert.equal(s.notes.length,0);
});
test('legacy fixed-price invoices require reconciliation and existing paid records remain live',async()=>{
 const s=sandbox(),o=await create(s,'foxtrot'),st=s.state();st.orders[o.id].micro=15000000;s.seed(st);s.rows([transfer(txid(5),15000000)]);assert.equal((await claim(s,o,txid(5))).result.code,'legacy_payment_review');assert.equal((await status(s,o)).status,'pending');
 st.orders[o.id].status='paid';st.orders[o.id].startAt=T;st.orders[o.id].endAt=T+CFG.duration;s.seed(st);assert.equal((await s.call('list')).ads.length,1);
});
test('reserved amounts are not reused while recent paid invoices remain protected',async()=>{
 const s=sandbox(),o=await create(s,'golfxx');s.rows([transfer(txid(6),micro(o))]);await claim(s,o,txid(6));const st=s.state();
 for(let cents=1;cents<=99;cents++)st.orders['reserved'+cents]={...st.orders[o.id],status:'paid',micro:15000000+cents*10000,createdAt:T,startAt:T-CFG.duration-100,endAt:T-100};
 s.seed(st);assert.equal((await create(s,'hotelxx')).error,'busy');
});
test('three simultaneous placements queue the fourth and release it on schedule',async()=>{
 const s=sandbox(),orders=[];for(let i=0;i<4;i++){const o=await create(s,'queue'+i);orders.push(o);s.rows([transfer(txid(10+i),micro(o))]);const result=await claim(s,o,txid(10+i));assert.equal(result.status,i<3?'live':'queued')}
 assert.equal((await s.call('list')).ads.length,3);s.time(T+CFG.duration);const list=await s.call('list');assert.equal(list.ads.length,1);assert.equal(list.ads[0].id,orders[3].id);
});
test('network failures and invalid order tokens do not publish or send notifications',async()=>{
 const s=sandbox(),o=await create(s,'indiaxx');s.down();assert.equal((await claim(s,o,txid(20))).result.code,'chain_unavailable');assert.equal((await s.call('status?id='+o.id+'&t=wrong')).http,404);assert.equal(s.state().orders[o.id].status,'pending');assert.equal(s.notes.length,0);
});
test('Durable Object alarm settles a closed-window payment and persists its notification before delivery',async t=>{
 let now=T,rows=[],failTelegram=true;const map=new Map();let alarm;
 const storage={get:async keys=>Array.isArray(keys)?new Map(keys.filter(k=>map.has(k)).map(k=>[k,structuredClone(map.get(k))])):structuredClone(map.get(keys)),put:async data=>{for(const [k,v]of Object.entries(data))map.set(k,structuredClone(v))},setAlarm:async at=>{alarm=at},deleteAlarm:async()=>{alarm=null}};
 const ctx={storage,blockConcurrencyWhile:work=>work()};
 t.mock.method(Date,'now',()=>now);
 t.mock.method(globalThis,'fetch',async url=>{if(String(url).startsWith('https://api.telegram.org/')){assert.equal(map.get('outbox').length,1);if(failTelegram)throw Error('offline Telegram');return Response.json({ok:true})}assert(String(url).startsWith('https://api.trongrid.io/'));return Response.json({data:rows})});
 let actor=new AdsStore(ctx,{TG_BOT_TOKEN:'offline-token',TG_CHAT_ID:'1'});
 const response=await actor.fetch(new Request('https://test.invalid/api/ads/create',{method:'POST',body:JSON.stringify({title:'Local cafe',text:'Breakfast and coffee served each morning',contact:'@cafetest',agree:true})}));const o=await response.json();assert(alarm);
 rows=[transfer(txid(25),micro(o))];now=T+61000;await actor.alarm();assert.equal(map.get('state').orders[o.id].status,'paid');assert.equal(map.get('outbox').length,1);
 actor=new AdsStore(ctx,{TG_BOT_TOKEN:'offline-token',TG_CHAT_ID:'1'});failTelegram=false;now=map.get('outbox')[0].nextAt;await actor.alarm();assert.equal(map.get('outbox').length,0);assert.equal(Object.keys(map.get('state').txs).length,1);
});
