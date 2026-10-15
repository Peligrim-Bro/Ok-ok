// Experimental inward portal; test branch only.
(()=>{
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const key='okok-portal-seen-v2';if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1');
 const style=document.createElement('style');style.textContent=`
#okok-portal{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;overflow:hidden;background:#050817;pointer-events:none;animation:okportal-reveal 3.1s ease both}
#okok-portal .tunnel{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:grid;place-items:center;width:118vmax;height:118vmax;isolation:isolate}
#okok-portal .ring{position:absolute;inset:0;border-radius:50%;border:1px solid #57cfe566;box-shadow:inset 0 0 18px #3f72d52b,0 0 12px #6b53b52b;background:conic-gradient(from 20deg,transparent 0deg,#4e4c9666 55deg,transparent 115deg,#45b4d755 190deg,transparent 260deg,#6854b866 325deg,transparent);mask-image:radial-gradient(circle,transparent 59%,#000 68% 70%,transparent 71%);animation:okportal-inward 2.8s linear infinite;animation-delay:calc(var(--i) * -.35s);will-change:transform,opacity}
#okok-portal .core{position:absolute;width:12vmin;height:12vmin;border-radius:50%;background:#02040d;box-shadow:0 0 12px 3px #040718,0 0 26px 5px #26417277;z-index:1}
#okok-portal .core:after{content:'';position:absolute;inset:-3px;border-radius:50%;border:1px solid #60c7df66;box-shadow:0 0 9px #4875b855;filter:blur(1px)}
@keyframes okportal-inward{0%{transform:rotate(0deg) scale(1);opacity:0}12%{opacity:.8}75%{opacity:.5}100%{transform:rotate(115deg) scale(.025);opacity:0}}
@keyframes okportal-reveal{0%{opacity:0}9%,70%{opacity:1}100%{opacity:0;visibility:hidden}}
`;document.head.append(style);
 function mount(){
  if(!document.body)return;
  const el=document.createElement('div');el.id='okok-portal';el.setAttribute('aria-hidden','true');
  el.innerHTML='<div class="tunnel">'+Array.from({length:8},(_,i)=>'<div class="ring" style="--i:'+i+'"></div>').join('')+'<div class="core"></div></div>';
  document.body.append(el);
  const cleanup=()=>{el.remove();style.remove()};
  el.addEventListener('animationend',e=>{if(e.target===el)cleanup()});setTimeout(cleanup,3700);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
