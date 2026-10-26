/* OK-OK Halloween 2026: optional, isolated decoration. Load explicitly from the page only after QA. */
(function(){
  const now=new Date();
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const v=Object.fromEntries(parts.map(p=>[p.type,p.value]));
  const day=Number(v.month)*100+Number(v.day);
  if(Number(v.year)!==2026||day<1028||day>1031||document.getElementById('okok-halloween'))return;
  const style=document.createElement('style');style.id='okok-halloween';
  style.textContent=`#okok-halloween-decor{position:fixed;inset:0;pointer-events:none;z-index:5;overflow:hidden;contain:layout style paint}#okok-halloween-decor .pumpkin{position:absolute;bottom:calc(76px + env(safe-area-inset-bottom,0px));font-size:clamp(20px,4vw,34px);opacity:.75;filter:drop-shadow(0 0 8px #ff8b35)}#okok-halloween-decor .pumpkin.left{left:8px}#okok-halloween-decor .pumpkin.right{right:8px}#okok-halloween-decor .web{position:absolute;top:0;font-size:25px;opacity:.28;color:#bca4ff}#okok-halloween-decor .web.left{left:8px}#okok-halloween-decor .web.right{right:8px;transform:scaleX(-1)}@media(max-width:360px){#okok-halloween-decor .pumpkin{font-size:18px;opacity:.5}}@media(prefers-reduced-motion:reduce){#okok-halloween-decor *{animation:none!important;transition:none!important}}`;
  const decor=document.createElement('div');decor.id='okok-halloween-decor';decor.setAttribute('aria-hidden','true');
  decor.innerHTML='<span class="web left">🕸</span><span class="web right">🕸</span><span class="pumpkin left">🎃</span><span class="pumpkin right">🎃</span>';
  document.head.appendChild(style);document.body.appendChild(decor);
})();
