// Illustrated reference-matched Oki, absolutely positioned behind the invitation rim.
let inviteOkiCleanup=()=>{}, inviteOkiNext=Date.now()+14000, inviteOkiUntil=0, inviteOkiCount=0;
try { inviteOkiNext=Math.max(inviteOkiNext,Number(sessionStorage.getItem('ok-ad-oki-snooze'))||0); } catch {}
function mountInviteOki(wrap) {
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 if(navigator.connection?.saveData)return;
 const portrait=h('img',{class:'okad-oki-portrait',alt:'',decoding:'async','aria-hidden':'true'});
 const peek=h('div',{class:'okad-oki-peek',hidden:true},
  h('span',{class:'okad-oki-speech',text:tr('Твоему сообщению — сюда!','Your message belongs here!','ข้อความของคุณอยู่ตรงนี้ได้!')}),portrait,
  h('button',{type:'button',class:'okad-oki-close','aria-label':tr('Скрыть подсказку Оки','Hide Oki’s hint','ซ่อนคำแนะนำของโอกิ'),text:'×'}));
 wrap.prepend(peek);
 const previous=wrap.closest('#okAds')?.previousElementSibling;
 const underlay=previous?.matches('p.hint')?previous:null;
 const abort=new AbortController();
 let active=false,loaded=false,visible=false,loading=false,stopped=false,job,measuredWidth=0,minimum=44;
 function outsideSafeArea(){
  const box=wrap.getBoundingClientRect(),nav=document.querySelector('nav.tab'),navBox=nav?.getBoundingClientRect();
  // Use only existing free space above the button; never reserve a blank row or cover another control.
  let edge=0;
  for(const el of document.querySelectorAll('button,a,input,textarea,select,summary')){
   if(wrap.contains(el)||!el.getClientRects().length)continue;
   const r=el.getBoundingClientRect();
   if(r.width&&r.height&&r.right>box.left&&r.left<box.right&&r.bottom<=box.top+1)edge=Math.max(edge,r.bottom);
  }
  const rise=Math.min(88,Math.floor(box.top-edge-4));
  if(measuredWidth!==box.width){
   const measure=peek.querySelector('.okad-oki-speech').cloneNode(true);
   measure.style.cssText='position:absolute;left:-10000px;right:auto;top:0;box-sizing:border-box;width:'+Math.max(1,box.width-140)+'px;animation:none;opacity:0;visibility:hidden;pointer-events:none';
   wrap.append(measure);minimum=Math.max(44,Math.ceil(measure.getBoundingClientRect().height)+4);measure.remove();measuredWidth=box.width;
  }
  if(rise>=minimum&&wrap.style.getPropertyValue('--oki-rise')!==rise+'px')wrap.style.setProperty('--oki-rise',rise+'px');
  return rise<minimum||box.bottom>Math.min(innerHeight,navBox&&nav.getClientRects().length?navBox.top:innerHeight)-8;
 }
 const blocked=()=>document.hidden||!visible||!wrap.isConnected||outsideSafeArea()||
  [...document.querySelectorAll('[role="dialog"],.modal.on,.overlay.on,.lang-overlay.on,.install-overlay.on,#okiBubble')].some(el=>el.getClientRects().length)||document.body.style.position==='fixed';
 function hide(){peek.hidden=true;wrap.classList.remove('oki-is-peeking');underlay?.classList.remove('okad-oki-underlay-hidden');active=false;}
 function snooze(){inviteOkiUntil=0;inviteOkiNext=Date.now()+600000;try{sessionStorage.setItem('ok-ad-oki-snooze',String(inviteOkiNext));}catch{}hide();}
 peek.querySelector('button').addEventListener('click',snooze,{signal:abort.signal});
 wrap.querySelector('.okad-invitation').addEventListener('click',()=>{inviteOkiUntil=0;inviteOkiNext=Date.now()+90000;hide();},{signal:abort.signal});
 async function reveal(){
  if(loading||active)return;
  loading=true;
  try {
   if(!loaded){
    await new Promise((resolve,reject)=>{
     const finish=error=>{clearTimeout(timeout);portrait.onload=portrait.onerror=null;abort.signal.removeEventListener('abort',cancel);error?reject(error):resolve();};
     const cancel=()=>finish(Error('Oki unmounted')),timeout=setTimeout(()=>finish(Error('Oki image timeout')),8000);
     portrait.onload=()=>finish();portrait.onerror=()=>finish(Error('Oki image unavailable'));
     abort.signal.addEventListener('abort',cancel,{once:true});
     portrait.src='__OKI_INVITATION_ASSET__';
     if(portrait.complete&&portrait.naturalWidth)finish();
    });
    await portrait.decode();loaded=true;
   }
   if(stopped||blocked())return;
   peek.hidden=false;active=true;wrap.classList.add('oki-is-peeking');underlay?.classList.add('okad-oki-underlay-hidden');
   if(Date.now()>=inviteOkiUntil){inviteOkiUntil=Date.now()+7000;inviteOkiNext=inviteOkiUntil+90000;inviteOkiCount++;}
  }catch{hide();if(!stopped)inviteOkiNext=Date.now()+90000;}finally{loading=false;}
 }
 function tick(){
  if(stopped)return;
  if(blocked())hide();
  else if(active&&Date.now()>=inviteOkiUntil)hide();
  else if(!active&&(Date.now()<inviteOkiUntil||(Date.now()>=inviteOkiNext&&inviteOkiCount<3&&(!reduce.matches||inviteOkiCount===0))))void reveal();
  job=setTimeout(tick,500);
 }
 const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.95;if(!visible)hide();},{threshold:[0,.95]});
 visibility.observe(wrap);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){inviteOkiUntil=0;hide();}},{signal:abort.signal});
 const overlays=new MutationObserver(()=>{if(active&&blocked())hide();});
 overlays.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','open']});
 tick();
 inviteOkiCleanup=()=>{stopped=true;clearTimeout(job);abort.abort();visibility.disconnect();overlays.disconnect();hide();};
}
