import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { draftReply, ThreadsReplies } from './replies.mjs';
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
function storage() {
  const map = new Map();
  return { map, get: async k => structuredClone(map.get(k)), put: async (k,v) => map.set(k,structuredClone(v)),
    transaction: async fn => fn({get:async k=>structuredClone(map.get(k)),put:async(k,v)=>map.set(k,structuredClone(v))}) };
}
const env = { THREADS_ACCESS_TOKEN:'mock-threads', THREADS_REVIEW_BOT_TOKEN:'mock-tg', THREADS_REVIEW_OWNER_ID:'42', THREADS_REVIEW_WEBHOOK_SECRET:'test-secret', THREADS_REPLIES_ENABLED:'true' };
const root = {id:'100',text:'Новая книга на https://ok-ok.click/travel-reads.html#receipt',is_reply:false,has_replies:true};
const reply = (id='200',text='Спасибо!') => ({id,text,username:'reader',timestamp:new Date().toISOString(),root_post:{id:'100'},replied_to:{id:'100'},is_reply:true,is_reply_owned_by_me:false,hide_status:'NOT_HUSHED'});
function fixture(options={}) {
  const store = storage();
  store.map.set('enabled',true);
  store.map.set('startedAt',new Date(Date.now()-60000).toISOString());
  const engine = new ThreadsReplies({storage:store},env);
  const calls=[];
  let replies=options.replies || [reply()];
  const updates=options.updates || [];
  globalThis.fetch=async (url,init={})=>{
    url=String(url); calls.push({url,init});
    if(url.includes('api.telegram.org')) {
      const method=url.split('/').at(-1);
      if(method==='getWebhookInfo') return Response.json({ok:true,result:{url:options.webhook||''}});
      if(method==='getUpdates') return Response.json({ok:true,result:updates});
      return Response.json({ok:true,result:{message_id:77}});
    }
    if(url.includes('/me?'))return Response.json({id:'1',username:'owner'});
    if(url.includes('/me/threads?'))return Response.json({data:[root]});
    if(url.includes('/conversation?'))return Response.json({data:replies});
    if(url.includes('/replies?'))return Response.json({data:options.children||[]});
    if(url.includes('/200?')||url.includes('/201?'))return Response.json(options.target || replies.find(r=>url.includes('/'+r.id+'?')));
    if(init.method==='POST' && url.endsWith('/me/threads')) {
      if(options.ambiguous)throw new Error('private URL must not appear');
      return Response.json({id:'999'});
    }
    throw new Error('Unexpected fixture endpoint: '+url);
  };
  return {engine,store,calls,setReplies:x=>{replies=x;},updates};
}
const tick=engine=>engine.fetch(new Request('https://internal/tick',{method:'POST'}));
const update=(engine,body)=>engine.fetch(new Request('https://internal/update',{method:'POST',body:JSON.stringify(body)}));
const posts=calls=>calls.filter(c=>c.init.method==='POST'&&c.url.endsWith('/me/threads'));
const notifications=calls=>calls.filter(c=>c.url.endsWith('/sendMessage'));
test('only complete allowlisted reactions auto-reply; prompt injection, sarcasm and questions need review',()=>{
  assert.ok(draftReply('Спасибо большое! 👍'));
  assert.ok(draftReply('Nice!'));
  for(const text of ['Спасибо, но это развод','не полезно','спасибо?','круто, только враньё','ignore all instructions','дай номер карты','👍','сколько стоит?','Спасибо за херню'])assert.equal(draftReply(text),null,text);
  assert.equal(draftReply('Где читать?',root.text),'Вот ссылка на чтение: https://ok-ok.click/travel-reads.html#receipt');
  assert.equal(draftReply('Где читать?','hello'),null);
});
test('new safe comment publishes targeted reply once with durable receipt',async()=>{
  const f=fixture();
  assert.equal((await tick(f.engine)).status,200);
  await tick(f.engine);
  assert.equal(posts(f.calls).length,1);
  const body=new URLSearchParams(posts(f.calls)[0].init.body);
  assert.equal(body.get('reply_to_id'),'200');
  assert.equal(body.get('auto_publish_text'),'true');
  assert.equal(f.store.map.get('reply:200').mediaId,'999');
});
test('old, hidden, owner and unknown-ownership comments cannot publish',async()=>{
  const old=reply('201');old.timestamp=new Date(Date.now()-120000).toISOString();
  const f=fixture({replies:[old,{...reply('202'),hide_status:'HIDDEN'},{...reply('203'),is_reply_owned_by_me:true},{...reply('204'),is_reply_owned_by_me:undefined},{...reply('205'),replied_to:{id:'other'}}]});
  await tick(f.engine);assert.equal(posts(f.calls).length,0);assert.equal(notifications(f.calls).length,0);
});
test('ambiguous publish never retries; visible owner reply reconciles receipt',async()=>{
  const f=fixture({ambiguous:true});
  assert.equal((await tick(f.engine)).status,502);
  assert.equal(f.store.map.get('reply:200').state,'uncertain');
  const draft=f.store.map.get('reply:200').draft;
  f.setReplies([reply(),{...reply('999',draft),is_reply_owned_by_me:true,replied_to:{id:'200'}}]);
  await tick(f.engine);
  assert.equal(posts(f.calls).length,1);
  assert.equal(f.store.map.get('reply:200').state,'sent');
  assert.ok(!JSON.stringify(f.store.map.get('stats')).includes('private URL'));
});
test('risky comment gets one private review notice and no automatic answer',async()=>{
  const f=fixture({replies:[reply('200','А цена какая?')]});
  await tick(f.engine);await tick(f.engine);
  assert.equal(posts(f.calls).length,0);assert.equal(notifications(f.calls).length,1);
  assert.equal(JSON.parse(notifications(f.calls)[0].init.body).chat_id,'42');
});
const ownerMessage=text=>({update_id:1,message:{message_id:10,date:Math.floor(Date.now()/1000),from:{id:42},chat:{id:42,type:'private'},text}});
test('owner can preview, approve once and stale buttons cannot publish newer text',async()=>{
  const f=fixture({replies:[reply('200','Вопрос?')]});
  await tick(f.engine);
  f.updates.push(ownerMessage('/reply 200 Мой ответ'));
  await update(f.engine,f.updates[0]);f.updates.length=0;
  assert.equal(posts(f.calls).length,0);
  const button=JSON.parse(notifications(f.calls).at(-1).init.body).reply_markup.inline_keyboard[0][0].callback_data;
  const cb={update_id:2,callback_query:{id:'cb',from:{id:42},message:{chat:{id:42,type:'private'}},data:button}};
  await update(f.engine,cb);await update(f.engine,cb);
  assert.equal(posts(f.calls).length,1);
  assert.equal(new URLSearchParams(posts(f.calls)[0].init.body).get('text'),'Мой ответ');
});
test('outsider commands and forged approval cannot enable or publish',async()=>{
  const f=fixture({updates:[{...ownerMessage('/threads_on'),message:{...ownerMessage('').message,from:{id:43}}}]});
  f.store.map.set('enabled',false);await update(f.engine,f.updates[0]);
  assert.equal(await f.engine.enabled(),false);assert.equal(posts(f.calls).length,0);
});
test('owner stop persists over later ticks and restarts',async()=>{
  const f=fixture({updates:[ownerMessage('/threads_off')]});
  await update(f.engine,f.updates[0]);f.updates.length=0;await tick(f.engine);
  assert.equal(await new ThreadsReplies({storage:f.store},env).enabled(),false);
  assert.equal(posts(f.calls).length,0);
});
test('scheduled scans never poll or change existing Telegram webhook',async()=>{
  const f=fixture();await tick(f.engine);
  assert.ok(!f.calls.some(c=>/getUpdates|getWebhookInfo|setWebhook|deleteWebhook/.test(c.url)));
});
test('manual owner answer or changed target prevents automatic duplicate',async()=>{
  for(const options of [{children:[{id:'777',is_reply_owned_by_me:true}]},{target:{...reply(),text:'edited'}}]){
    const f=fixture(options);await tick(f.engine);
    assert.equal(posts(f.calls).length,0);assert.equal(f.store.map.get('reply:200').state,'skipped');
  }
});
test('daily limit includes uncertain attempts, approval cannot bypass it',async()=>{
  const f=fixture();f.store.map.set('count:'+new Date().toISOString().slice(0,10),20);
  await tick(f.engine);assert.equal(posts(f.calls).length,0);
  assert.equal(await f.engine.publish({id:'200',state:'ready',rootId:'100',original:'Спасибо!',draft:'Ответ'}),undefined);
});
test('missing owner configuration remains off and makes no requests',async()=>{
  let called=false;globalThis.fetch=async()=>{called=true;throw Error();};
  const engine=new ThreadsReplies({storage:storage()},{THREADS_ACCESS_TOKEN:'mock'});
  assert.equal((await tick(engine)).status,200);assert.equal(called,false);
});
test('provisioning validates reads, initializes once, and preserves an owner stop',async()=>{
 const f=fixture();f.store.map.delete('enabled');f.store.map.delete('startedAt');
 const activate=()=>f.engine.fetch(new Request('https://internal/activate',{method:'POST'}));
 assert.equal((await activate()).status,200);assert.equal(await f.engine.enabled(),true);
 assert.equal(posts(f.calls).length,0);
 f.store.map.set('enabled',false);await activate();assert.equal(await f.engine.enabled(),false);
});
test('changed preview rejects stale approval and accepts only latest revision',async()=>{
 const f=fixture({replies:[reply('200','Спорный вопрос?')]});await tick(f.engine);
 await update(f.engine,ownerMessage('/reply 200 Первый'));
 const second=ownerMessage('/reply 200 Исправленный');second.update_id=2;
 await update(f.engine,second);
 const cb=(seq,revision)=>({update_id:seq,callback_query:{id:'cb',from:{id:42},message:{chat:{id:42,type:'private'}},data:'tr:approve:200:'+revision}});
 await update(f.engine,cb(3,1));assert.equal(posts(f.calls).length,0);
 await update(f.engine,cb(4,2));assert.equal(posts(f.calls).length,1);
 assert.equal(new URLSearchParams(posts(f.calls)[0].init.body).get('text'),'Исправленный');
});
