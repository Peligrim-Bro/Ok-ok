// Experimental particle galaxy: continuous inward flow, no solid spiral ribbons.
(()=>{
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const key='okok-portal-seen-v5';if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1');
 const style=document.createElement('style');style.textContent=`
#okok-portal{position:fixed;inset:0;z-index:2147483647;overflow:hidden;background:#030510;pointer-events:none;animation:okportal-reveal 5s ease both}
#okok-portal .tunnel{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:100%;height:100%}
#okok-portal canvas{display:block;width:100%;height:100%}
@keyframes okportal-reveal{0%{opacity:0}8%,80%{opacity:1}100%{opacity:0;visibility:hidden}}
`;document.head.append(style);
 function mount(){
  if(!document.body)return;
  const el=document.createElement('div');el.id='okok-portal';el.setAttribute('aria-hidden','true');
  el.innerHTML='<div class="tunnel"><canvas aria-hidden="true"></canvas></div>';document.body.append(el);
  const canvas=el.querySelector('canvas'),ctx=canvas.getContext('2d');
  let frame=0,stopped=false;
  const cleanup=()=>{stopped=true;cancelAnimationFrame(frame);el.remove();style.remove();window.removeEventListener('resize',resize)};
  el.addEventListener('animationend',e=>{if(e.target===el)cleanup()});setTimeout(cleanup,5600);
  if(!ctx){cleanup();return}
  const colors=['#55eaff','#a65aff','#ff4db9','#ff965a','#ffe098','#697aff'];
  const sprites=colors.map(color=>{
   const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d');
   const glow=g.createRadialGradient(48,48,0,48,48,48);glow.addColorStop(0,color);glow.addColorStop(.28,color+'aa');glow.addColorStop(1,color+'00');g.fillStyle=glow;g.fillRect(0,0,96,96);return c;
  });
  const noise=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
  const stars=Array.from({length:1100},(_,i)=>({phase:noise(i+1),arm:i%3,jitter:(noise(i+17)-.5)*.82,size:.4+noise(i+23)*1.65,color:i%colors.length}));
  const clouds=Array.from({length:110},(_,i)=>({phase:noise(i+91),arm:i%3,jitter:(noise(i+120)-.5)*.65,size:30+noise(i+52)*80,color:i%colors.length}));
  let w,h,radius;function resize(){w=innerWidth;h=innerHeight;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);radius=Math.hypot(w,h)*.8}resize();window.addEventListener('resize',resize);
  const started=performance.now();
  function position(p,t){
   const phase=(p.phase+t*.115)%1,r=radius*Math.exp(-4.8*phase);
   const angle=p.arm*Math.PI*2/3+phase*Math.PI*5.8+p.jitter+t*.18;
   return {x:w/2+Math.cos(angle)*r,y:h/2+Math.sin(angle)*r,depth:r/radius,alpha:Math.min(1,phase*12,(1-phase)*9)};
  }
  function draw(now){
   if(stopped)return;
   if(!document.hidden){
    const t=(now-started)/1000;ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.fillStyle='#030510';ctx.fillRect(0,0,w,h);
    ctx.globalCompositeOperation='lighter';
    for(const p of clouds){const q=position(p,t),size=p.size*(.18+q.depth)*2.2;ctx.globalAlpha=q.alpha*.26;ctx.drawImage(sprites[p.color],q.x-size/2,q.y-size/2,size,size)}
    for(const p of stars){const q=position(p,t),size=p.size*(.3+q.depth*.9);ctx.globalAlpha=q.alpha*(.48+q.depth*.52);ctx.fillStyle=colors[p.color];ctx.beginPath();ctx.arc(q.x,q.y,size,0,Math.PI*2);ctx.fill();if(p.size>1.8){ctx.globalAlpha=q.alpha*.22;ctx.drawImage(sprites[p.color],q.x-size*5,q.y-size*5,size*10,size*10)}}
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    const core=ctx.createRadialGradient(w/2,h/2,1,w/2,h/2,Math.min(w,h)*.048);core.addColorStop(0,'#02030b');core.addColorStop(.4,'#050615');core.addColorStop(.65,'#6b62c655');core.addColorStop(1,'#17114000');ctx.fillStyle=core;ctx.fillRect(w/2-40,h/2-40,80,80);
   }
   frame=requestAnimationFrame(draw);
  }frame=requestAnimationFrame(draw);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
