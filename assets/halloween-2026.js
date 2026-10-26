/* Decorative only; Bangkok dates, no interaction handlers. */
(()=>{
const id='okok-halloween-decor';
function sync(){
const date=new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Bangkok'}),old=document.getElementById(id);
if(date<'2026-10-28'||date>'2026-10-31'){old?.remove();return;}
if(old)return;
const decor=document.createElement('div');decor.id=id;decor.setAttribute('aria-hidden','true');
decor.innerHTML='<span class="web left">🕸</span><span class="web right">🕸</span><span class="pumpkin left">🎃</span><span class="pumpkin right">🎃</span>';
document.body.appendChild(decor);
}
sync();setInterval(sync,60000);document.addEventListener('visibilitychange',sync);
})();
