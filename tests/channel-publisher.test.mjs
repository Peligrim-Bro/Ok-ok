import {test,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {ChannelPublisher,channelWebhook,checkRights,validatePosts} from '../channel-publisher.mjs';
import {channelText} from '../channel-presentation.mjs';
const realFetch=globalThis.fetch;
afterEach(()=>globalThis.fetch=realFetch);
const jpeg=new Uint8Array([255,216,255,217]);
const env={TG_BOT_TOKEN:'test-secret',TG_CHAT_ID:'123',ASSETS:{fetch:async()=>new Response(jpeg,{headers:{'content-type':'image/jpeg'}})}};
function decode(body){return body instanceof FormData?{chat_id:Number(body.get('chat_id')),caption:body.get('caption'),photo:body.get('photo'),caption_entities:body.get('caption_entities')?JSON.parse(body.get('caption_entities')):undefined,reply_markup:body.get('reply_markup')?JSON.parse(body.get('reply_markup')):undefined}:JSON.parse(body);}
function mock(fail=false){const calls=[];globalThis.fetch=async(url,init)=>{
 const method=url.split('/').pop();calls.push({method,body:decode(init.body)});
 if(fail&&method==='sendMessage')throw Error('timeout');
 const result=method==='getMe'?{id:456,username:'Aibotadam_bot'}:method==='getChat'?{id:-100123,type:'channel',username:'PattayaOk_Ok'}:method==='getChatMember'?{status:'administrator',can_post_messages:true}:{message_id:999,chat:{id:JSON.parse(typeof init.body==='string'?init.body:'{}').chat_id||-100123,type:'channel'}};
 return Response.json({ok:true,result});};return calls;}
function store(){const map=new Map();const s={get:async k=>map.get(k),put:async(k,v)=>map.set(k,v),transaction:async f=>f(s)};return s;}
const req=action=>new Request('https://internal',{method:'POST',body:JSON.stringify(action)});
const post={id:'intro-1',text:'A reviewed post https://ok-ok.click/',approved:true,publishAt:'2026-01-01T00:00:00Z',expiresAt:'2099-01-01T00:00:00Z'};
test('topic footer reaches both wire formats without changing dedup or source buttons',async()=>{
 for(const photo of [undefined,'https://www.ok-ok.click/assets/channel/oki-comic-001-super-soup.jpg']){
  const calls=mock(),storage=store(),d=new ChannelPublisher({storage},env);
  const p={...post,photo,topics:['Фразы','Такси']};
  await d.fetch(req({action:'start'}));await d.fetch(req({action:'tick',posts:[p]}));
  const body=calls.find(c=>c.method===(photo?'sendPhoto':'sendMessage')).body;
  assert.equal(body.text||body.caption,post.text+'\n\n#Фразы #Такси');
  assert.equal((body.entities||body.caption_entities).filter(e=>e.type==='hashtag').length,2);
  await d.fetch(req({action:'tick',posts:[{...p,id:'another-id',topics:['Фразы','Приветствия']}]}));
  assert.equal(calls.filter(c=>c.method==='sendMessage'||c.method==='sendPhoto').length,1);
 }
});
test('topic footer cannot bypass final text/caption length checks',()=>{
 assert.throws(()=>validatePosts([{...post,text:'x'.repeat(3999),topics:['Фразы']}]));
 assert.throws(()=>validatePosts([{...post,text:'x'.repeat(1020),topics:['Фразы'],photo:'https://www.ok-ok.click/assets/channel/oki-comic-001-super-soup.jpg'}]));
});
test('brand signature reaches text/photo payloads without changing body identity',async()=>{
 const calls=mock(),d=new ChannelPublisher({storage:store()},env);await d.fetch(req({action:'start'}));
 const branded={...post,brandCTA:'share'},photo={...post,id:'photo-brand',text:'Reviewed comic',brandCTA:'rate',photo:'https://www.ok-ok.click/assets/channel/oki-comic-001-super-soup.jpg'};
 await d.fetch(req({action:'tick',posts:[branded,photo]}));
 assert.equal(calls.find(c=>c.method==='sendMessage').body.text,channelText(branded));
 assert.equal(calls.find(c=>c.method==='sendPhoto').body.caption,channelText(photo));
 assert.equal(branded.text,post.text);
});
test('adding or changing branding cannot resend delivered content even with another ID',async()=>{
 const calls=mock(),storage=store();let d=new ChannelPublisher({storage},env);await d.fetch(req({action:'start'}));
 await d.fetch(req({action:'tick',posts:[post]}));d=new ChannelPublisher({storage},env);
 await d.fetch(req({action:'tick',posts:[{...post,id:'another-slot',brandCTA:'share'}]}));
 assert.equal(calls.filter(c=>c.method==='sendMessage').length,1);
});
test('final branded captions and text are checked before any delivery',()=>{
 assert.throws(()=>validatePosts([{...post,text:'x'.repeat(3999),brandCTA:'share'}]));
 assert.throws(()=>validatePosts([{...post,text:'x'.repeat(1000),brandCTA:'share',photo:'https://www.ok-ok.click/assets/channel/oki-comic-001-super-soup.jpg'}]));
 assert.throws(()=>validatePosts([{...post,brandCTA:'invent'}]));
});
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
const comic={...post,id:'comic-1',photo:'https://www.ok-ok.click/assets/channel/oki-comic-001-super-soup.jpg'};
test('photo captions and origins are validated before any Telegram call',()=>{
 assert.equal(validatePosts([comic]).length,1);
 for(const photo of ['https://evil.example/comic.png','http://www.ok-ok.click/assets/channel/comic.png','https://www.ok-ok.click/assets/channel/../comic.png',null])assert.throws(()=>validatePosts([{...comic,photo}]));
 assert.throws(()=>validatePosts([{...comic,text:'x'.repeat(1025)}]));
});
test('approved photo uses sendPhoto with the original caption, never a text fallback',async()=>{
 const calls=mock(),d=new ChannelPublisher({storage:store()},env);await d.fetch(req({action:'start'}));await d.fetch(req({action:'tick',posts:[comic]}));
 const sent=calls.filter(x=>['sendPhoto','sendMessage'].includes(x.method));assert.equal(sent.length,1);assert.equal(sent[0].method,'sendPhoto');assert.equal(sent[0].body.chat_id,-100123);assert.equal(sent[0].body.caption,comic.text);assert.equal(sent[0].body.photo.name,'oki-comic-001-super-soup.jpg');assert.equal(sent[0].body.photo.type,'image/jpeg');assert.deepEqual(new Uint8Array(await sent[0].body.photo.arrayBuffer()),jpeg);
});
test('photo duplicate guard survives restart and changed post ID',async()=>{
 const calls=mock(),storage=store();let d=new ChannelPublisher({storage},env);await d.fetch(req({action:'start'}));await d.fetch(req({action:'tick',posts:[comic]}));d=new ChannelPublisher({storage},env);await d.fetch(req({action:'tick',posts:[comic,{...comic,id:'comic-2'}]}));assert.equal(calls.filter(x=>x.method==='sendPhoto').length,1);
});
test('replacing the content of a previously sent slot never resends that slot',async()=>{
 const calls=mock(),storage=store(),d=new ChannelPublisher({storage},env);await d.fetch(req({action:'start'}));await d.fetch(req({action:'tick',posts:[post]}));await d.fetch(req({action:'tick',posts:[{...comic,id:post.id,text:'Replacement caption'}]}));assert.equal(calls.filter(x=>x.method==='sendPhoto').length,0);
});
test('ambiguous photo send persists review state without retries or fallback',async()=>{
 const calls=mock(),normalFetch=globalThis.fetch;globalThis.fetch=async(url,init)=>{if(url.endsWith('/sendPhoto')){calls.push({method:'sendPhoto',body:decode(init.body)});throw Error('timeout');}return normalFetch(url,init);};
 const storage=store();let d=new ChannelPublisher({storage},env);await d.fetch(req({action:'start'}));await d.fetch(req({action:'tick',posts:[comic]}));d=new ChannelPublisher({storage},env);await d.fetch(req({action:'tick',posts:[comic]}));assert.equal((await storage.get('post:'+comic.id)).state,'needs_review');assert.equal(calls.filter(x=>x.method==='sendPhoto').length,1);assert.equal(calls.filter(x=>x.method==='sendMessage'&&x.body.chat_id<0).length,0);
});
test('stopped, future, expired and draft photo posts do not publish',async()=>{
 const calls=mock(),d=new ChannelPublisher({storage:store()},env);await d.fetch(req({action:'tick',posts:[comic]}));await d.fetch(req({action:'start'}));await d.fetch(req({action:'tick',posts:[{...comic,approved:false},{...comic,id:'photo-future',publishAt:'2098-01-01T00:00:00Z'},{...comic,id:'photo-expired',expiresAt:'2026-01-02T00:00:00Z'}]}));assert.equal(calls.filter(x=>x.method==='sendPhoto').length,0);
});

test('uses internal ASSETS binding and rejects non-image or missing files without posting',async()=>{
 for(const response of [new Response('missing',{status:404}),new Response('<html>challenge</html>',{headers:{'content-type':'text/html'}}),new Response(null,{headers:{'content-type':'image/jpeg'}})]){
  const calls=mock(),storage=store();let requested;
  const d=new ChannelPublisher({storage},{...env,ASSETS:{fetch:async request=>{requested=request.url;return response;}}});
  await d.fetch(req({action:'start'}));await d.fetch(req({action:'tick',posts:[comic]}));
  assert.equal(requested,comic.photo);assert.equal(calls.filter(x=>x.method==='sendPhoto').length,0);assert.equal((await storage.get('post:'+comic.id)).state,'needs_review');
 }
});
test('photo file upload leaves Content-Type to multipart encoder',async()=>{
 mock();const wrapped=globalThis.fetch;let observed;
 globalThis.fetch=async(url,init)=>{if(url.endsWith('/sendPhoto'))observed=init;return wrapped(url,init);};
 const d=new ChannelPublisher({storage:store()},env);await d.fetch(req({action:'start'}));await d.fetch(req({action:'tick',posts:[comic]}));assert.ok(observed.body instanceof FormData);assert.equal(observed.headers,undefined);
});

test('success requires a positive message ID and the exact channel receipt; no blind retry',async()=>{
 for(const result of [{message_id:0,chat:{id:-100123,type:'channel'}},{message_id:2,chat:{id:-100999,type:'channel'}},{message_id:2},{message_id:2,chat:{id:-100123,type:'group'}}]){
  const calls=mock(),original=globalThis.fetch,storage=store();
  globalThis.fetch=async(url,init)=>url.endsWith('/sendMessage')&&JSON.parse(init.body).chat_id<0
   ?(calls.push({method:'invalid-receipt'}),Response.json({ok:true,result})):original(url,init);
  const d=new ChannelPublisher({storage},env);await d.fetch(req({action:'start'}));
  await d.fetch(req({action:'tick',posts:[post]}));await d.fetch(req({action:'tick',posts:[post]}));
  assert.equal((await storage.get('post:'+post.id)).state,'needs_review');
  assert.equal(calls.filter(c=>c.method==='invalid-receipt').length,1);
 }
});
test('delivery keeps the channel, planned time and delay without changing owner routing',async()=>{
 const calls=mock(),storage=store(),d=new ChannelPublisher({storage},env);
 await d.fetch(req({action:'start'}));await d.fetch(req({action:'tick',posts:[post]}));
 const r=await storage.get('post:'+post.id);
 assert.equal(r.chatId,-100123);assert.equal(r.messageId,999);assert.equal(r.publishAt,post.publishAt);
 assert(Number.isFinite(r.delayMinutes)&&r.delayMinutes>=0);assert.equal(env.TG_CHAT_ID,'123');
 assert.equal(calls.filter(c=>c.method==='sendMessage'&&c.body.chat_id<0).length,1);
});
test('copy buttons, links and UTF-16 entities survive both text and photo delivery',async()=>{
 for(const photo of [undefined,comic.photo]){
  const p={...post,photo,text:'🌴 Could I have the sauce on the side, please?\nhttps://ok-ok.click/?ref=one&lang=ru',
   copyText:'Could I have the sauce on the side, please?',buttons:[{text:'Открыть сайт',url:'https://ok-ok.click/?ref=one&lang=ru'}],formatting:[{type:'bold',text:'Could I have the sauce on the side, please?'}]};
  const calls=mock(),d=new ChannelPublisher({storage:store()},env);await d.fetch(req({action:'start'}));await d.fetch(req({action:'tick',posts:[p]}));
  const body=calls.find(c=>c.method===(photo?'sendPhoto':'sendMessage')).body;
  assert.equal(body.reply_markup.inline_keyboard[0][0].copy_text.text,p.copyText);
  assert.equal(body.reply_markup.inline_keyboard[1][0].url,p.buttons[0].url);
  assert.equal((body.entities||body.caption_entities)[0].offset,3);
  assert.equal(body.parse_mode,undefined);
 }
});
