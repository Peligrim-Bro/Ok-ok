// Experimental inward portal; test branch only.
(()=>{
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const key='okok-portal-seen-v3';if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1');
 const style=document.createElement('style');style.textContent=`
#okok-portal{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;overflow:hidden;background:#050817;pointer-events:none;animation:okportal-reveal 5s ease both}
#okok-portal .tunnel{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:grid;place-items:center;width:118vmax;height:118vmax;isolation:isolate}
#okok-portal .ring{position:absolute;inset:0;animation:okportal-inward 4.8s linear infinite;animation-delay:calc(var(--i) * -1.6s);will-change:transform,opacity}
#okok-portal .ring svg{display:block;width:100%;height:100%;overflow:visible;filter:drop-shadow(0 0 5px #5964ad88)}
#okok-portal .ribbon{fill:url(#portal-ribbon);stroke:#78bdde55;stroke-width:.6}
#okok-portal .core{position:absolute;width:12vmin;height:12vmin;border-radius:50%;background:#02040d;box-shadow:0 0 12px 3px #040718,0 0 26px 5px #26417277;z-index:1}
#okok-portal .core:after{content:'';position:absolute;inset:-3px;border-radius:50%;border:1px solid #60c7df66;box-shadow:0 0 9px #4875b855;filter:blur(1px)}
@keyframes okportal-inward{0%{transform:rotate(0deg) scale(1);opacity:0}12%{opacity:.8}75%{opacity:.5}100%{transform:rotate(420deg) scale(.025);opacity:0}}
@keyframes okportal-reveal{0%{opacity:0}8%,80%{opacity:1}100%{opacity:0;visibility:hidden}}
`;document.head.append(style);
 // Two tapered logarithmic arms; radius falls as angle advances toward the core.
 function spiralRibbon(phase){
  const sides=[[],[]];
  for(let i=0;i<=180;i++){
   const t=i/180,angle=phase+t*Math.PI*3.5,r=460*Math.exp(-3.65*t),w=2+r*.065;
   for(let side=0;side<2;side++){
    const rr=r+(side?1:-1)*w;
    sides[side].push((500+Math.cos(angle)*rr).toFixed(2)+','+(500+Math.sin(angle)*rr).toFixed(2));
   }
  }
  return 'M'+sides[0].join(' L')+' L'+sides[1].reverse().join(' L')+' Z';
 }
 function mount(){
  if(!document.body)return;
  const el=document.createElement('div');el.id='okok-portal';el.setAttribute('aria-hidden','true');
  const arms=[0,Math.PI].map(phase=>'<path class="ribbon" d="'+spiralRibbon(phase)+'"/>').join('');
  const defs='<svg width="0" height="0" style="position:absolute"><defs><radialGradient id="portal-ribbon"><stop stop-color="#89dce9"/><stop offset=".4" stop-color="#6258b4"/><stop offset="1" stop-color="#265e7777"/></radialGradient></defs></svg>';
  el.innerHTML=defs+'<div class="tunnel">'+Array.from({length:3},(_,i)=>'<div class="ring" style="--i:'+i+'"><svg viewBox="0 0 1000 1000">'+arms+'</svg></div>').join('')+'<div class="core"></div></div>';
  document.body.append(el);
  const cleanup=()=>{el.remove();style.remove()};
  el.addEventListener('animationend',e=>{if(e.target===el)cleanup()});setTimeout(cleanup,5600);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
