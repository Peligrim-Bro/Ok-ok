import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const tracker=readFileSync('site/public/index.html','utf8').match(/<script id="ok-ga4-events-v1">([\s\S]*?)<\/script>/)[1];
function fixture({hostname='ok-ok.click',webdriver=false,search=''}={}){
 const events=[],listeners={},session=new Map();
 const ctx={URL,URLSearchParams,location:{hostname,search,href:'https://ok-ok.click/',pathname:'/'},navigator:{webdriver},sessionStorage:{getItem:k=>session.get(k),setItem:(k,v)=>session.set(k,v)},localStorage:{getItem:()=>null},document:{documentElement:{lang:'en',dataset:{city:'pattaya'}},addEventListener:(n,f)=>listeners[n]=f},window:{gtag:(...a)=>events.push(a),addEventListener:(n,f)=>listeners[n]=f}};
 runInNewContext(tracker,ctx);return {events,listeners,session};
}
test('catalogue views, opens and outbound contacts remain distinct and contain no contact PII',()=>{
 const f=fixture();
 for(const name of ['catalogue_view','provider_open'])f.listeners['okok:catalogue']({detail:{name,category:'bikes',city:'pattaya',provider_id:'speed-bike',phone:'private'}});
 const el={dataset:{provider:'speed-bike',contactChannel:'whatsapp'},getAttribute:()=>'',textContent:'Contact',href:'https://wa.me/private',id:'',className:''};
 f.listeners.click({target:{closest:()=>el}});
 assert.deepEqual(f.events.map(e=>e[1]),['catalogue_view','provider_open','provider_contact_click']);
 assert.equal(f.events[2][2].provider_id,'speed-bike');assert.equal(f.events[2][2].channel,'whatsapp');
 assert(!JSON.stringify(f.events).includes('private'));
});
for(const options of [{hostname:'127.0.0.1'},{webdriver:true},{search:'?okok_test=1'}])test('test traffic excluded '+JSON.stringify(options),()=>{
 const f=fixture(options);f.listeners['okok:catalogue']({detail:{name:'catalogue_view',category:'visas',city:'pattaya'}});assert.equal(f.events.length,0);
 if(options.search)assert.equal(f.session.get('okok-test'),'1');
});
