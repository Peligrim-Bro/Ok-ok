import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('./worker.mjs',import.meta.url),'utf8').replace('import queue from "./queue.json";', 'const queue=[];');
const {ThreadsQueue}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
function storage(){const map=new Map();return {get:async k=>map.get(k),put:async(k,v)=>map.set(k,structuredClone(v)),delete:async k=>map.delete(k),list:async()=>map,transaction:async fn=>fn({get:async k=>map.get(k),put:async(k,v)=>map.set(k,v)})};}
const post={id:'future-slot',text:'Example',imageUrl:'https://raw.githubusercontent.com/Peligrim-Bro/Ok-ok/main/media/example.jpg',imageReviewed:true,altText:'Illustration'};
const req=p=>new Request('https://internal/publish',{method:'POST',body:JSON.stringify({post:p})});
test('image container is published once; duplicate slot returns receipt',async()=>{
 const calls=[];globalThis.fetch=async url=>{calls.push(String(url));return Response.json(url.includes('/me/threads?fields=')?{data:[]}:url.includes('threads_publish')?{id:'post-id'}:url.includes('fields=status')?{status:'FINISHED'}:url.includes('fields=permalink')?{permalink:'https://threads.net/example'}:{id:'container-id'});};
 const q=new ThreadsQueue({storage:storage()},{THREADS_ACCESS_TOKEN:'mock'});
 assert.equal((await (await q.fetch(req(post))).json()).id,'post-id');
 await q.fetch(req(post));
 assert.equal(calls.filter(x=>x.includes('media_type=IMAGE')).length,1);
 assert.equal(calls.filter(x=>x.includes('threads_publish')).length,1);
 assert.ok(calls.some(x=>x.includes('alt_text=Illustration')));
});
test('ambiguous publish failure is claimed, reconciled by text before any retry',async()=>{
 let visible=false,creates=0;
 globalThis.fetch=async url=>{
 if(url.includes('/me/threads?fields='))return Response.json({data:visible?[{id:'real-post',text:post.text}]:[]});
 if(url.includes('threads_publish'))throw new Error('connection lost');
 if(url.includes('fields=status'))return Response.json({status:'FINISHED'});
 creates++;return Response.json({id:'container'});
 };
 const q=new ThreadsQueue({storage:storage()},{THREADS_ACCESS_TOKEN:'mock'});
 await assert.rejects(q.fetch(req(post)),/connection lost/);
 assert.equal((await q.fetch(req(post))).status,409);
 visible=true;
 assert.equal((await (await q.fetch(req(post))).json()).id,'real-post');
 assert.equal(creates,1);
});
test('unreviewed media is rejected; legacy text still auto publishes',async()=>{
 let calls=[];globalThis.fetch=async url=>{calls.push(url);return Response.json(url.includes('fields=')?{data:[]}:{id:'text-post'});};
 const q=new ThreadsQueue({storage:storage()},{THREADS_ACCESS_TOKEN:'mock'});
 assert.equal((await q.fetch(req({...post,imageReviewed:false}))).status,400);
 assert.equal(calls.length,0);
 await q.fetch(req({id:'text',text:'Plain text'}));
 assert.ok(calls.some(x=>x.includes('auto_publish_text=true')));
});
