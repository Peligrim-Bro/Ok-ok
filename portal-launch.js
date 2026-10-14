// Experimental portal transition for OK-OK PWA.
// Load with <script defer src="portal-launch.js"></script> on the public index only.
(()=>{if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const key='okok-portal-seen';if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1');
const style=document.createElement('style');style.textContent=`
#okok-portal{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;overflow:hidden;background:#050817;pointer-events:none;animation:okportal-out .55s ease-in 1.25s forwards}
#okok-portal .vortex{width:55vmax;height:55vmax;border-radius:50%;background:repeating-conic-gradient(from 15deg,#45d6ff 0deg,#4338a0 14deg,#080e35 26deg,#e879f9 33deg,#45d6ff 44deg);filter:blur(3px) drop-shadow(0 0 38px #63dfff);mask-image:radial-gradient(circle,transparent 0 9%,#000 20% 58%,transparent 73%);animation:okportal-spin 1.8s linear infinite,okportal-zoom 1.75s cubic-bezier(.4,0,.2,1) both}
#okok-portal .core{position:absolute;width:16vmax;height:16vmax;border-radius:50%;background:radial-gradient(circle,#020312 10%,#11155e 44%,#6fe7ff 58%,transparent 73%);box-shadow:0 0 70px #4b7cff;animation:okportal-core 1.7s ease-in forwards}
@keyframes okportal-spin{to{rotate:360deg}}@keyframes okportal-zoom{from{scale:.08;opacity:0}25%{opacity:1}to{scale:5;opacity:1}}@keyframes okportal-core{from{scale:.2}to{scale:10}}@keyframes okportal-out{to{opacity:0;visibility:hidden}}
`;document.head.append(style);
function mount(){if(!document.body)return;const el=document.createElement('div');el.id='okok-portal';el.setAttribute('aria-hidden','true');el.innerHTML='<div class="vortex"></div><div class="core"></div>';document.body.append(el);el.addEventListener('animationend',e=>{if(e.target===el){el.remove();style.remove()}},{once:true});setTimeout(()=>{el.remove();style.remove()},2400)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();