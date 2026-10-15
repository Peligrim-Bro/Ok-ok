import {test,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {ChannelPublisher,channelWebhook,checkRights,validatePosts} from '../channel-publisher.mjs';
const realFetch=globalThis.fetch;
afterEach(()=>globalThis.fetch=realFetch);
const env={TG_BOT_TOKEN:'test-secret',TG_CHAT_ID:'123'};
function mock(fail=false){const calls=[];globalThis.fetch=async(url,init)=>{
 const method=url.split('/').pop();calls.push({method,body:JSON.parse(init.body)});
 if(fail&&method==='sendMessage')throw Error('timeout');
 const result=method==='getMe'?{id:456,username:'Aibotadam_bot'}:method==='getChat'?{id:-100123,type:'channel',username:'PattayaOk_Ok'}:method==='getChatMember'?{status:'administrator',can_post_messages:true}:{message_id:999};
 return Response.json({ok:true,result});};return calls;}
function store(){const map=new Map();const s={get:async k=>map.get(k),put:async(k,v)=>map.set(k,v),transaction:async f=>f(s)};return s;}
const req=action=>new Request('https://internal',{method:'POST',body:JSON.stringify(action)});
const post={id:'intro-1',text:'A reviewed post https://ok-ok.click/',approved:true,publishAt:'2026-01-01T00:00:00Z',expiresAt:'2099-01-01T00:00:00Z'};
test('validates queue and rejects duplicate IDs or invalid expiry',()=>{
 assert.equal(validatePosts([post]).length,1);
 assert.throws(()=>validatePosts([post,post]));assert.throws(()=>validatePosts([{...post,expiresAt:post.publishAt}]));
});
test('verifies identity, channel and explicit post rights without posting',async()=>{const calls=mock();await checkRights(env);assert.deepEqual(calls.map(x=>x.method),['getMe','getChat','getChatMember']);});
test('rejects incorrect bot and missing post permissions',async()=>{
 globalThis.fetch=async()=>Response.json({ok:true,result:{username:'another_bot'}});await assert.rejects(checkRights(env));
 globalThis.fetch=async(url)=>Response.json({ok:true,result:url.endsWith('/getMe')?{id:456,username:'Aibotadam_bot'}:url.endsWith('/getChat')?{id:-100,type:'channel',username:'PattayaOk_Ok'}:{status:'administrator',can_post_messages:false}});await assert.rejects(checkRights(env));
});
test('disabled queue sends nothing',async()=>{const calls=mock();const d=new ChannelPublisher({storage:store()},env);await d.fetch(req({action:'tick',posts:[post]}));assert.equal(calls.length,0);});
test('publishes once, survives restart and prevents same content under another ID',async()=>{
 const calls=mock(),storage=store();let d=new ChannelPublisher({storage},env);await d.fetch(req({action:'start'}));await d.fetch(req({action:'tick',posts:[post]}));
 d=new ChannelPublisher({storage},env);await d.fetch(req({action:'tick',posts:[post,{...post,id:'intro-2'}]}));assert.equal(calls.filter(x=>x.method==='sendMessage'&&x.body.chat_id<0).length,1);
});
test('ignores drafts, future and expired posts',async()=>{
 const calls=mock(),d=new ChannelPublisher({storage:store()},env);await d.fetch(req({action:'start'}));
 await d.fetch(req({action:'tick',posts:[{...post,approved:false},{...post,id:'future',publishAt:'2098-01-01T00:00:00Z'},{...post,id:'expired',expiresAt:'2026-01-02T00:00:00Z'}]}));assert.equal(calls.filter(x=>x.method==='sendMessage').length,0);
});
test('ambiguous send is persisted and never blindly retried',async()=>{
 const calls=mock(true),storage=store();let d=new ChannelPublisher({storage},env);await d.fetch(req({action:'start'}));await d.fetch(req({action:'tick',posts:[post]}));
 d=new ChannelPublisher({storage},env);await d.fetch(req({action:'tick',posts:[post]}));assert.equal((await storage.get('post:'+post.id)).state,'needs_review');assert.equal(calls.filter(x=>x.method==='sendMessage'&&x.body.chat_id<0).length,1);
});
test('stop prevents subsequent sends',async()=>{const calls=mock(),d=new ChannelPublisher({storage:store()},env);await d.fetch(req({action:'start'}));await d.fetch(req({action:'stop'}));await d.fetch(req({action:'tick',posts:[post]}));assert.equal(calls.filter(x=>x.method==='sendMessage').length,0);});
function webhook(id='123',secret=true){return new Request('https://ok-ok.click/api/telegram/webhook',{method:'POST',headers:secret?{'X-Telegram-Bot-Api-Secret-Token':createHash('sha256').update('okok-webhook:'+env.TG_BOT_TOKEN).digest('hex')}:{},body:JSON.stringify({message:{text:'/channel_start',chat:{id,type:'private'},from:{id,is_bot:false}}})});}
test('webhook rejects spoofed secret and ignores non-owner',async()=>{const calls=mock();assert.equal((await channelWebhook(webhook('123',false),env)).status,401);assert.equal((await channelWebhook(webhook('789'),env)).status,200);assert.equal(calls.length,0);});
test('owner can enable queue; channel check does not publish',async()=>{
 const calls=mock(),d=new ChannelPublisher({storage:store()},env),bound={...env,CHANNEL_PUBLISHER:{idFromName:x=>x,get:()=>d}};
 await channelWebhook(webhook(),bound);assert.equal((await (await d.fetch(req({action:'status'}))).json()).enabled,true);assert.equal(calls.filter(x=>x.method==='sendMessage'&&x.body.chat_id<0).length,0);
});
