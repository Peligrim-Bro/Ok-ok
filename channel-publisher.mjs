import {createHash, timingSafeEqual} from 'node:crypto';
import {CHANNEL, POSTS} from './channel-posts.mjs';
const json = (v, status=200) => new Response(JSON.stringify(v), {status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const hash = text => createHash('sha256').update(text).digest('hex');
async function api(env, method, body) {
  const response = await fetch('https://api.telegram.org/bot'+env.TG_BOT_TOKEN+'/'+method, {
    method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(8000)
  });
  const result = await response.json();
  if (!response.ok || result.ok !== true) throw new Error('telegram_rejected');
  return result.result;
}
export async function checkRights(env) {
  const me = await api(env,'getMe',{});
  if (me.username?.toLowerCase() !== 'aibotadam_bot') throw new Error('wrong_bot');
  const chat = await api(env,'getChat',{chat_id:CHANNEL});
  if(chat.type !== 'channel' || chat.username?.toLowerCase() !== CHANNEL.slice(1).toLowerCase()) throw new Error('wrong_channel');
  const member = await api(env,'getChatMember',{chat_id:chat.id,user_id:me.id});
  if(member.status !== 'administrator' || member.can_post_messages !== true) throw new Error('no_post_permission');
  return chat.id;
}
export function validatePosts(posts) {
  const ids = new Set();
  for(const p of posts) {
    if(!/^[a-z0-9-]{3,80}$/.test(p.id)||ids.has(p.id)||typeof p.text!=='string'||!p.text.trim()||p.text.length>4000||!Number.isFinite(Date.parse(p.publishAt))||!Number.isFinite(Date.parse(p.expiresAt))||Date.parse(p.expiresAt)<=Date.parse(p.publishAt)||typeof p.approved!=='boolean') throw Error('invalid_channel_post');
    ids.add(p.id);
  }
  return posts;
}
validatePosts(POSTS);
// A separate namespace: no access to payment records or the payment outbox.
export class ChannelPublisher {
  constructor(ctx,env){this.ctx=ctx;this.env=env;}
  async fetch(request){
    if(request.method!=='POST')return json({error:'method'},405);
    const {action,posts=POSTS}=await request.json();
    if(action==='status')return json({enabled:!!await this.ctx.storage.get('enabled')});
    if(action==='stop'){await this.ctx.storage.put('enabled',false);return json({enabled:false});}
    if(action==='start'){
      await checkRights(this.env);
      await this.ctx.storage.put('enabled',true);
      return json({enabled:true});
    }
    if(action!=='tick')return json({error:'action'},400);
    validatePosts(posts);
    if(!await this.ctx.storage.get('enabled'))return json({enabled:false});
    const now=Date.now();
    const due=posts.filter(p=>p.approved&&Date.parse(p.publishAt)<=now&&now<Date.parse(p.expiresAt));
    let sent=0;
    for(const p of due){
      const key='post:'+p.id, contentKey='content:'+hash(p.text);
      // Reserve durably BEFORE network I/O. A timeout is ambiguous and must not
      // be blindly retried, even after an isolate restart or a new deployment.
      const reserved=await this.ctx.storage.transaction(async txn=>{
        if(await txn.get(key)||await txn.get(contentKey))return false;
        await txn.put(key,{state:'sending',at:now});await txn.put(contentKey,p.id);return true;
      });
      if(!reserved)continue;
      try{
        const channelId=await checkRights(this.env);
        const result=await api(this.env,'sendMessage',{chat_id:channelId,text:p.text,link_preview_options:{is_disabled:false}});
        await this.ctx.storage.put(key,{state:'sent',messageId:result.message_id,at:Date.now()});sent++;
      }catch{
        await this.ctx.storage.put(key,{state:'needs_review',at:Date.now()});
        // No secrets, body dumps or automatic repost on ambiguous delivery.
        try{await api(this.env,'sendMessage',{chat_id:this.env.TG_CHAT_ID,text:'Публикация '+p.id+' требует проверки. Автоповтор отключён, чтобы избежать дубля.'});}catch{}
      }
    }
    return json({enabled:true,sent});
  }
}
export async function channelWebhook(request,env){
  if(new URL(request.url).pathname!=='/api/telegram/webhook'||request.method!=='POST')return null;
  const raw=await request.clone().text();if(raw.length>65536)return null;
  let update;try{update=JSON.parse(raw);}catch{return null;}
  const msg=update.message, cmd=String(msg?.text||'').trim().split(/\s/)[0].split('@')[0];
  if(!['/channel','/channel_start','/channel_stop'].includes(cmd))return null;
  const expected=hash('okok-webhook:'+env.TG_BOT_TOKEN), supplied=request.headers.get('X-Telegram-Bot-Api-Secret-Token')||'';
  if(!env.TG_BOT_TOKEN||Buffer.byteLength(supplied)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(supplied),Buffer.from(expected)))return json({error:'unauthorized'},401);
  if(!/^\d+$/.test(String(env.TG_CHAT_ID||''))||msg.chat?.type!=='private'||String(msg.chat.id)!==String(env.TG_CHAT_ID)||String(msg.from?.id)!==String(env.TG_CHAT_ID)||msg.from?.is_bot)return json({ok:true});
  let text;
  try{
    if(!env.CHANNEL_PUBLISHER)throw Error('not_configured');
    const stub=env.CHANNEL_PUBLISHER.get(env.CHANNEL_PUBLISHER.idFromName('pattaya-ok-ok-v1'));
    if(cmd==='/channel'){
      await checkRights(env);
      const state=await (await stub.fetch(new Request('https://internal',{method:'POST',body:JSON.stringify({action:'status'})}))).json();
      text='Adam может публиковать в '+CHANNEL+'. Очередь '+(state.enabled?'включена':'выключена')+'. /channel_start — включить; /channel_stop — остановить. Публикуются только одобренные записи с заданным временем.';
    }else{
      await stub.fetch(new Request('https://internal',{method:'POST',body:JSON.stringify({action:cmd==='/channel_start'?'start':'stop'})}));
      text=cmd==='/channel_start'?'Очередь '+CHANNEL+' включена. Только одобренные записи; существующие публикации не повторяются.':'Очередь '+CHANNEL+' остановлена. Уже отправленная публикация или начатая отправка не отменяются.';
    }
  }catch{text='Не удалось подтвердить подключение канала. Проверьте, что Adam — администратор '+CHANNEL+' с правом публикации. Существующие уведомления сайта не изменены.';}
  try{await api(env,'sendMessage',{chat_id:env.TG_CHAT_ID,text});}catch{}
  return json({ok:true});
}
export async function runChannelQueue(env){
  if(!env.CHANNEL_PUBLISHER)return;
  const stub=env.CHANNEL_PUBLISHER.get(env.CHANNEL_PUBLISHER.idFromName('pattaya-ok-ok-v1'));
  await stub.fetch(new Request('https://internal',{method:'POST',body:JSON.stringify({action:'tick',posts:POSTS})}));
}
