// Runs inside the ad board closure. No audio, network tracking or payment changes.
let inviteOkiCleanup=()=>{}, inviteOkiNext=Date.now()+14000, inviteOkiUntil=0, inviteOkiCount=0;
try { inviteOkiNext=Math.max(inviteOkiNext,Number(sessionStorage.getItem('ok-ad-oki-snooze'))||0); } catch {}
function mountInviteOki(wrap) {
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 if(navigator.connection?.saveData)return;
 const peek=h('div',{class:'okad-oki-peek',hidden:true},
  h('span',{class:'okad-oki-speech',text:tr('Твоему сообщению — сюда!','Your message belongs here!','ข้อความของคุณอยู่ตรงนี้ได้!')}),
  h('div',{class:'okad-oki-model','aria-hidden':'true'}),
  h('button',{type:'button',class:'okad-oki-close','aria-label':tr('Скрыть подсказку Оки','Hide Oki’s hint','ซ่อนคำแนะนำของโอกิ'),text:'×'}));
 wrap.prepend(peek);
 const host=peek.querySelector('.okad-oki-model'),abort=new AbortController();
 let model=null,visible=false,loading=false,stopped=false,job;
 const outsideSafeArea=()=>{const box=wrap.getBoundingClientRect(),nav=document.querySelector('nav.tab'),navBox=nav?.getBoundingClientRect();return box.top<0||box.bottom>Math.min(innerHeight,navBox&&nav.getClientRects().length?navBox.top:innerHeight)-8;};
 const blocked=()=>document.hidden||!visible||!wrap.isConnected||outsideSafeArea()||
  [...document.querySelectorAll('[role="dialog"],.modal.on,.overlay.on,.lang-overlay.on,.install-overlay.on,#okiBubble')].some(el=>el.getClientRects().length)||document.body.style.position==='fixed';
 function hide(){peek.hidden=true;wrap.classList.remove('oki-is-peeking');model?.dispose();model=null;}
 function snooze(){inviteOkiUntil=0;inviteOkiNext=Date.now()+600000;try{sessionStorage.setItem('ok-ad-oki-snooze',String(inviteOkiNext));}catch{}hide();}
 peek.querySelector('button').addEventListener('click',snooze,{signal:abort.signal});
 wrap.querySelector('.okad-invitation').addEventListener('click',()=>{inviteOkiUntil=0;inviteOkiNext=Date.now()+90000;hide();},{signal:abort.signal});
 async function reveal(){
  if(loading||model)return;
  loading=true;
  try {
   if(!window.OKI3D){
    await new Promise((resolve,reject)=>{
     let script=document.getElementById('oki3d-loader');
     const finish=error=>{clearTimeout(timeout);window.removeEventListener('oki3dready',ready);script?.removeEventListener('error',fail);error?reject(error):resolve();};
     const ready=()=>finish(),fail=()=>finish(Error('OKI unavailable'));
     const timeout=setTimeout(fail,8000);
     window.addEventListener('oki3dready',ready,{once:true});
     if(!script){script=document.createElement('script');script.id='oki3d-loader';script.src='/assets/oki-3d-v91.js';script.async=true;document.head.append(script);}
     script.addEventListener('error',fail,{once:true});
     if(window.OKI3D)finish();
    });
   }
   if(stopped||blocked())return;
   // Unhide before mounting so the renderer can measure its real bounds.
   peek.hidden=false;
   model=window.OKI3D?.mount(host,{stage:2,gender:'boy',mood:'happy',skin:'neon',interactive:false,gesture:'invite'});
   if(!model){hide();inviteOkiNext=Date.now()+90000;return;}
   wrap.classList.add('oki-is-peeking');
   if(Date.now()>=inviteOkiUntil){inviteOkiUntil=Date.now()+7000;inviteOkiNext=inviteOkiUntil+90000;inviteOkiCount++;}
  }catch{hide();inviteOkiNext=Date.now()+90000;}finally{loading=false;}
 }
 function tick(){
  if(stopped)return;
  if(blocked()){hide();if(inviteOkiUntil>Date.now())inviteOkiUntil=0;}
  else if(model&&Date.now()>=inviteOkiUntil)hide();
  else if(!model&&(Date.now()<inviteOkiUntil||(Date.now()>=inviteOkiNext&&inviteOkiCount<3&&(!reduce.matches||inviteOkiCount===0))))void reveal();
  job=setTimeout(tick,500);
 }
 const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.95;if(!visible)hide();},{threshold:[0,.95]});
 visibility.observe(wrap);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){inviteOkiUntil=0;hide();}},{signal:abort.signal});
 // Disappear immediately when a dialog opens, not after the next timer tick.
 const overlays=new MutationObserver(()=>{if(model&&blocked()){inviteOkiUntil=0;hide();}});
 overlays.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','open']});
 tick();
 inviteOkiCleanup=()=>{stopped=true;clearTimeout(job);abort.abort();visibility.disconnect();overlays.disconnect();hide();};
}
