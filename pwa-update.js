/* Refresh installed OK-OK after a release without interrupting unfinished work. */
(()=>{
'use strict';
if(!('serviceWorker' in navigator))return;
const loaded=window.OKOK_RELEASE, KEY='okok-pwa-update', RESTORE='okok-pwa-view';
const valid=v=>v&&typeof v.builtAt==='string'&&Number.isFinite(Date.parse(v.builtAt))&&(v.commit===null||/^[a-f0-9]{40}$/i.test(v.commit));
const identity=v=>v.commit||v.builtAt;
if(!valid(loaded))return;
let registration, pending=null, checking=false, refreshing=false, lastInput=0, banner;
const dirty=new Set();
const visible=el=>el&&el.getClientRects().length>0;
function busy(){
 for(const el of dirty)if(!el.isConnected)dirty.delete(el);
 return dirty.size>0||Date.now()-lastInput<10000||
 ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)||document.activeElement?.isContentEditable||
 [...document.querySelectorAll('[role="dialog"],.mask.on,.install-mask.on,.spin-mask.on,.modal.on,.overlay.on,.sheet.open,#okiLife,#authorChatMinimize:not([hidden])')].some(visible)||
 !!document.querySelector('nav.tab button[data-tab="game"].on')||
 !!window.Tawk_API?.isChatMaximized?.();
}
const words={ru:['Доступна новая версия','Обновить','Завершите действие — сайт обновится автоматически.'],en:['An update is available','Update','Finish your activity — the site will update automatically.'],th:['มีเวอร์ชันใหม่','อัปเดต','ทำรายการให้เสร็จ แล้วเว็บไซต์จะอัปเดตอัตโนมัติ']};
function show(){
 if(!banner){banner=document.createElement('aside');banner.id='okokUpdate';banner.setAttribute('role','status');banner.innerHTML='<span></span><button type="button"></button>';document.body.appendChild(banner);banner.querySelector('button').onclick=()=>{lastInput=0;if(busy()){banner.querySelector('span').textContent=(words[document.documentElement.lang]||words.ru)[2];return;}refresh();};}
 const w=words[document.documentElement.lang]||words.ru;banner.querySelector('span').textContent=w[0];banner.querySelector('button').textContent=w[1];
}
async function workerReady(){
 await registration.update();
 const worker=registration.installing||registration.waiting;
 if(!worker)return !!registration.active;
 if(worker.state==='activated')return true;
 return new Promise(resolve=>{const timer=setTimeout(()=>done(false),15000);function done(ok){clearTimeout(timer);worker.removeEventListener('statechange',change);resolve(ok);}function change(){if(worker.state==='activated')done(true);else if(worker.state==='redundant')done(false);}worker.addEventListener('statechange',change);change();});
}
async function refresh(){
 if(!pending||refreshing||document.hidden||busy())return;
 refreshing=true;
 try{
  if(!await workerReady()||document.hidden||busy()){refreshing=false;return;}
  // Recheck the release after updating SW; never reload to an offline response.
  const actual=await version();if(identity(actual)!==identity(pending)){refreshing=false;return;}
  const previous=JSON.parse(sessionStorage.getItem(KEY)||'null');
  if(previous?.target===identity(pending)&&Date.now()-previous.at<300000){refreshing=false;return;}
  sessionStorage.setItem(RESTORE,JSON.stringify({target:identity(pending),tab:history.state?.tab||document.querySelector('nav.tab button.on')?.dataset.tab||'home',scroll:scrollY,at:Date.now()}));
  sessionStorage.setItem(KEY,JSON.stringify({target:identity(pending),at:Date.now()}));
  location.reload();
 }catch{refreshing=false;}
}
async function version(){
 const response=await fetch('/build-info.json?pwa-check='+Date.now(),{cache:'no-store',signal:AbortSignal.timeout(8000)});
 if(!response.ok)throw Error('Version unavailable');
 const v=await response.json();if(!valid(v))throw Error('Invalid version');return v;
}
async function check(){
 if(checking||document.hidden||!registration)return;
 checking=true;
 try{const actual=await version();if(identity(actual)!==identity(loaded)){pending=actual;show();await refresh();}}
 catch{}finally{checking=false;}
}
// Registration replaces the original single register() call.
navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(r=>{registration=r;check();}).catch(()=>{});
for(const event of ['focus','pageshow','online'])window.addEventListener(event,check);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});
for(const event of ['pointerdown','keydown'])document.addEventListener(event,e=>{if(!e.target.closest?.('#okokUpdate'))lastInput=Date.now();},{passive:true});
document.addEventListener('input',e=>{if(e.target.matches('input,textarea,select,[contenteditable]'))dirty.add(e.target);});
document.addEventListener('reset',e=>{for(const el of dirty)if(e.target.contains(el))dirty.delete(el);});
setInterval(check,120000);setInterval(()=>{if(pending)refresh();},2000);
try{const view=JSON.parse(sessionStorage.getItem(RESTORE)||'null');if(view&&view.target===identity(loaded)&&Date.now()-view.at<300000){sessionStorage.removeItem(RESTORE);requestAnimationFrame(()=>{window.okokRestoreView?.(view.tab);setTimeout(()=>window.scrollTo({top:view.scroll,behavior:'instant'}),350);});}}catch{}
})();
