(()=>{
 'use strict';
 const EMBED='https://embed.tawk.to/6ac5e0bddd1f0034bfdc8335/1k4afbpev';
 const copy={
  ru:{button:'Написать автору',title:'Связаться с автором',lead:'Выберите тему обращения. Если автор не в сети, оставьте сообщение и email для ответа.',topics:['Реклама','Сотрудничество','Вопрос','Проблема на сайте'],loading:'Открываем чат…',error:'Чат пока не загрузился. Попробуйте ещё раз или откройте его отдельно.',fallback:'Открыть чат отдельно',close:'Закрыть',draft:'Здравствуйте! Тема обращения: '},
  en:{button:'Message the author',title:'Contact the author',lead:'Choose a topic. If the author is offline, leave a message and your email for a reply.',topics:['Advertising','Partnership','Question','Website issue'],loading:'Opening chat…',error:'The chat has not loaded. Try again or open it separately.',fallback:'Open chat separately',close:'Close',draft:'Hello! My topic: '},
  th:{button:'ติดต่อผู้ดูแล',title:'ติดต่อผู้ดูแล',lead:'เลือกหัวข้อ หากผู้ดูแลไม่ออนไลน์ กรุณาฝากข้อความและอีเมลเพื่อตอบกลับ',topics:['โฆษณา','ร่วมงาน','สอบถาม','ปัญหาเว็บไซต์'],loading:'กำลังเปิดแชต…',error:'แชตยังไม่โหลด ลองอีกครั้งหรือเปิดแชตแยกต่างหาก',fallback:'เปิดแชตแยกต่างหาก',close:'ปิด',draft:'สวัสดี! หัวข้อที่ต้องการติดต่อ: '}
 };
 const button=document.getElementById('authorChatButton'),dialog=document.getElementById('authorChatDialog');
 const status=document.getElementById('authorChatStatus'),fallback=document.getElementById('authorChatFallback');
 const keys=['advertising','partnership','question','website-issue'];
 const minimize=document.getElementById('authorChatMinimize');
 let expanded=false,lockedStyles=null,returnScroll=null,restoreVersion=0;
 const lockProperties=['position','top','left','right','width','overflow'];
 function rememberScroll(){returnScroll={x:scrollX,y:scrollY};restoreVersion++;}
 function restoreScroll(){
  if(!returnScroll)return;
  const point={...returnScroll},version=++restoreVersion;
  const apply=()=>{if(!expanded&&version===restoreVersion)window.scrollTo({left:point.x,top:point.y,behavior:'instant'});};
  apply();requestAnimationFrame(()=>requestAnimationFrame(apply));setTimeout(apply,250);
 }
 // A new gesture must not be overridden by a delayed keyboard/viewport correction.
 for(const type of ['pointerdown','touchstart','wheel'])addEventListener(type,()=>restoreVersion++,{passive:true});
 function viewport(){
  const v=window.visualViewport;
  document.documentElement.style.setProperty('--author-viewport-top',(v?.offsetTop||0)+'px');
  document.documentElement.style.setProperty('--author-viewport-height',(v?.height||innerHeight)+'px');
 }
 function expandedState(value){
  if(value===expanded)return;
  expanded=value;minimize.hidden=!value;
  if(value){
   if(!returnScroll)rememberScroll();
   lockedStyles=Object.fromEntries(lockProperties.map(key=>[key,{value:document.body.style.getPropertyValue(key),priority:document.body.style.getPropertyPriority(key)}]));
   // iOS needs a fixed page at its original scroll offset while the keyboard is open.
   Object.assign(document.body.style,{position:'fixed',top:-returnScroll.y+'px',left:-returnScroll.x+'px',right:'0',width:'100%',overflow:'hidden'});
   viewport();minimize.focus({preventScroll:true});
  }
  else{
   for(const [key,old] of Object.entries(lockedStyles||{})){
    if(old.value)document.body.style.setProperty(key,old.value,old.priority);else document.body.style.removeProperty(key);
   }
   lockedStyles=null;button.focus({preventScroll:true});restoreScroll();
  }
 }
 function minimizeChat(){
  window.Tawk_API?.minimize?.();
  window.Tawk_API?.hideWidget?.();
  expandedState(false);
 }
 minimize.addEventListener('click',minimizeChat);
 addEventListener('resize',viewport);
 window.visualViewport?.addEventListener('resize',viewport);
 window.visualViewport?.addEventListener('scroll',viewport);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&expanded){e.preventDefault();minimizeChat();}});
 viewport();
 let ready=false,loading=false,timer=0,script=null,topic=2,error=false;
 const lang=()=>copy[document.documentElement.lang]?document.documentElement.lang:'ru';
 const t=()=>copy[lang()];
 function labels(){
  document.getElementById('authorContactNotes').innerHTML=notesHTML();
  button.textContent=t().button;
  minimize.textContent=({ru:'Свернуть чат',en:'Minimize chat',th:'ย่อแชต'})[lang()];
  document.getElementById('authorChatTitle').textContent=t().title;
  document.getElementById('authorChatLead').textContent=t().lead;
  document.getElementById('authorChatClose').setAttribute('aria-label',t().close);
  fallback.textContent=t().fallback;
  dialog.querySelectorAll('[data-author-topic]').forEach((b,i)=>{b.textContent=t().topics[i];b.disabled=loading;});
  status.textContent=loading?t().loading:error?t().error:'';
 }
 keys.forEach((key,i)=>{const b=document.createElement('button');b.type='button';b.className='btn';b.dataset.authorTopic=key;b.addEventListener('click',()=>loadChat(i));dialog.querySelector('.author-chat-topics').appendChild(b);});
 function finish(){clearTimeout(timer);loading=false;error=false;fallback.hidden=true;labels();}
 function failed(){clearTimeout(timer);loading=false;error=true;fallback.hidden=false;labels();}
 function showChat(){
  const api=window.Tawk_API;
  finish();
  // The topic is a draft: only the visitor sends the message.
  if(!api.isChatOngoing?.()){
   api.setAttributes?.({'okok-topic':keys[topic],'okok-language':lang()},()=>{});
   api.setChatInputMessage?.(t().draft+t().topics[topic],()=>{});
  }
  dialog.close();
  expandedState(true);api.showWidget();api.maximize();
 }
 function loadChat(index){
  topic=index;
  if(ready){showChat();return;}
  if(loading)return;
  loading=true;error=false;fallback.hidden=true;labels();
  timer=setTimeout(failed,18000);
  if(script)return;
  const api=window.Tawk_API=window.Tawk_API||{};
  api.customStyle={zIndex:2147483000};
  api.onBeforeLoad=()=>api.hideWidget();
  api.onLoad=()=>{ready=true;if(dialog.open)showChat();else{finish();api.hideWidget();}};
  api.onChatMaximized=()=>expandedState(true);
  api.onChatMinimized=()=>{api.hideWidget();expandedState(false);};
  api.onChatHidden=()=>expandedState(false);
  api.onChatMessageAgent=()=>{if(!api.isChatMaximized?.()){button.textContent=t().button+' •';button.setAttribute('aria-label',t().button+' •');}};
  window.Tawk_LoadStart=new Date();
  script=document.createElement('script');script.async=true;script.src=EMBED;script.charset='UTF-8';script.setAttribute('crossorigin','*');
  script.onerror=()=>{script.remove();script=null;failed();};
  document.head.appendChild(script);
 }
 button.addEventListener('click',()=>{if(!expanded)rememberScroll();button.removeAttribute('aria-label');viewport();dialog.showModal();labels();});
 document.getElementById('authorChatClose').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{if(!ready){clearTimeout(timer);loading=false;labels();}if(!expanded){button.focus({preventScroll:true});restoreScroll();}});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 new MutationObserver(labels).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 labels();
})();
