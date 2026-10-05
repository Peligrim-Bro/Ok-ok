(() => {
'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const saveData=!!(navigator.connection&&navigator.connection.saveData);
const bgc=document.createElement('canvas');bgc.id='spatial-background';bgc.setAttribute('aria-hidden','true');document.body.prepend(bgc);
const b=bgc.getContext('2d',{alpha:false});if(!b)return;
let W=0,H=0,D=1,weather='cloud',night=false,wind=1,last=0,t=0,burst={x:0,y:0,s:0},pointer={x:.5,y:.45};
let clouds=[],drops=[],motes=[],skyLayer=null,skyKey='',cloudTheme='',frame=0,lastFrame=0;
const frameInterval=()=>isPhone()?1000/24:1000/30;
const staticMode=()=>reduced.matches||saveData;
const isPhone=()=>innerWidth<600;
function seed(){const cc=isPhone()?7:13,dc=isPhone()?70:120,mc=isPhone()?35:65;clouds=Array.from({length:cc},(_,i)=>({x:Math.random()*W,y:Math.random()*H*.82,r:(isPhone()?90:120)+Math.random()*(isPhone()?120:190),z:.18+Math.random()*.95,phase:Math.random()*6.28}));drops=Array.from({length:dc},()=>({x:Math.random()*W,y:Math.random()*H,z:.2+Math.random()*1.1,l:10+Math.random()*32}));motes=Array.from({length:mc},()=>({x:Math.random()*W,y:Math.random()*H,z:.2+Math.random()}));}
function resize(){skyKey='';D=Math.min(devicePixelRatio||1,isPhone()?1.35:1.6);W=innerWidth;H=innerHeight;bgc.width=Math.round(W*D);bgc.height=Math.round(H*D);bgc.style.width=W+'px';bgc.style.height=H+'px';b.setTransform(D,0,0,D,0,0);seed();prepareClouds();requestDraw()}
function classify(code){if(code===0)return'clear';if([1,2,3,45,48].includes(code))return'cloud';if(code>=95)return'storm';if((code>=51&&code<=67)||(code>=80&&code<=82))return'rain';return'cloud'}
async function loadWeather(){try{const u='https://api.open-meteo.com/v1/forecast?latitude=12.9236&longitude=100.8825&current=weather_code,is_day,wind_speed_10m&timezone=Asia%2FBangkok';const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw 0;const j=await r.json();weather=classify(j.current.weather_code);night=j.current.is_day===0;wind=Math.max(.5,Math.min(3,(j.current.wind_speed_10m||8)/10));document.documentElement.dataset.weather=weather}catch(_){weather='cloud';night=false}skyKey='';requestDraw()}
function paintSky(){const light=document.documentElement.dataset.theme==='light',g=b.createLinearGradient(0,0,0,H);if(night){g.addColorStop(0,light?'#b9d5e9':'#03101f');g.addColorStop(.55,light?'#dbeaf2':'#09263b');g.addColorStop(1,light?'#eef7f8':'#0a303a')}else if(weather==='storm'){g.addColorStop(0,light?'#9fb8c9':'#071421');g.addColorStop(1,light?'#e5eef2':'#163444')}else{g.addColorStop(0,light?'#68b9ed':'#071d39');g.addColorStop(.5,light?'#bce6f6':'#0a3347');g.addColorStop(1,light?'#f4fbfc':'#0a3038')}b.fillStyle=g;b.fillRect(0,0,W,H);if(light&&!night){const sun=b.createRadialGradient(W*.82,H*.08,2,W*.82,H*.08,Math.min(W,H)*.55);sun.addColorStop(0,'rgba(255,255,255,.58)');sun.addColorStop(.25,'rgba(255,255,255,.14)');sun.addColorStop(1,'rgba(255,255,255,0)');b.fillStyle=sun;b.fillRect(0,0,W,H)}}
function sky(){
 const key=[W,H,D,weather,night,document.documentElement.dataset.theme].join('|');
 if(key!==skyKey){
  skyLayer=document.createElement('canvas');skyLayer.width=bgc.width;skyLayer.height=bgc.height;
  // Paint gradients once, then copy the prepared sky on each animation frame.
  const ctx=skyLayer.getContext('2d');
  paintSky();ctx.drawImage(bgc,0,0);skyKey=key;
 }
 b.drawImage(skyLayer,0,0,W,H);
}
function prepareClouds(){
 cloudTheme=document.documentElement.dataset.theme;
 const light=document.documentElement.dataset.theme==='light';
 clouds.forEach(c=>{
  const pad=32,size=(c.r+pad)*2,pixels=Math.min(320,Math.ceil(size));
  const layer=document.createElement('canvas');layer.width=layer.height=pixels;
  const ctx=layer.getContext('2d'),scale=pixels/size;
  ctx.setTransform(scale,0,0,scale,pixels/2,pixels/2);
  ctx.filter=`blur(${Math.max(7,22-11*c.z)*scale}px)`;
  const cg=ctx.createRadialGradient(-c.r*.15,-c.r*.22,c.r*.05,0,0,c.r);
  cg.addColorStop(0,light?'rgba(255,255,255,.98)':'rgba(207,232,244,.72)');
  cg.addColorStop(.6,light?'rgba(244,251,255,.72)':'rgba(128,177,201,.30)');
  cg.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=cg;
  for(let k=0;k<5;k++){ctx.beginPath();ctx.ellipse((k-2)*c.r*.22,Math.sin(k*1.7)*c.r*.08,c.r*(.40-.025*k),c.r*(.28+.03*k),0,0,Math.PI*2);ctx.fill()}
  c.sprite=layer;c.spriteSize=size;
 });
}
function drawCloud(c,step){
 const light=document.documentElement.dataset.theme==='light',par=(pointer.x-.5)*c.z*24,parY=(pointer.y-.5)*c.z*12,dx=c.x-burst.x,dy=c.y-burst.y,d=Math.hypot(dx,dy)||1;
 if(burst.s>0&&d<260){c.x+=dx/d*burst.s*8*c.z*step;c.y+=dy/d*burst.s*3*c.z*step}
 const x=c.x+par,y=c.y+parY+Math.sin(t*.00015+c.phase)*5*c.z;
 b.globalAlpha=light?(.12+.20*c.z):(.07+.12*c.z);
 b.drawImage(c.sprite,x-c.spriteSize/2,y-c.spriteSize/2,c.spriteSize,c.spriteSize);
 c.x+=.035*wind*(.5+c.z)*step;if(c.x>W+c.r*2)c.x=-c.r*2;
}
function rain(d,step){const dd=Math.hypot(d.x-burst.x,d.y-burst.y)||1;if(burst.s>0&&dd<180)d.x+=(d.x-burst.x)/dd*burst.s*15*d.z*step;b.globalAlpha=.15+.42*d.z;b.strokeStyle=night?'#b7e3ff':'#328ebf';b.lineWidth=.6+d.z;b.beginPath();b.moveTo(d.x,d.y);b.lineTo(d.x-3*wind,d.y+d.l);b.stroke();d.y+=(6+9*d.z)*step;d.x-=wind*.7*step;if(d.y>H+35){d.y=-35;d.x=Math.random()*W}}
function mote(m,step){const a=.08+.22*(.5+.5*Math.sin(t*.001*m.z+m.x));b.globalAlpha=a;b.fillStyle=night?'#e4f9ff':'#ffffff';b.beginPath();b.arc(m.x+(pointer.x-.5)*m.z*14,m.y+(pointer.y-.5)*m.z*8,1+2.3*m.z,0,Math.PI*2);b.fill();m.x+=.04*m.z*step;if(m.x>W)m.x=0}
function requestDraw(){if(!document.hidden&&!frame)frame=requestAnimationFrame(draw)}
function draw(now){
 frame=0;if(document.hidden)return;
 if(!staticMode()&&lastFrame&&now-lastFrame<frameInterval()){requestDraw();return}
 const dt=Math.min(80,now-last||16),step=dt/(1000/60);last=lastFrame=now;t+=dt;
 b.globalAlpha=1;b.globalCompositeOperation='source-over';sky();b.globalCompositeOperation='screen';
 if(weather!=='clear'||!night)clouds.forEach(c=>drawCloud(c,step));
 if(weather==='rain'||weather==='storm')drops.forEach(d=>rain(d,step));else motes.forEach(m=>mote(m,step));
 if(weather==='storm'&&!staticMode()&&Math.random()<.0012*dt){b.globalAlpha=.11;b.fillStyle='#e9f8ff';b.fillRect(0,0,W,H)}
 b.globalAlpha=1;b.globalCompositeOperation='source-over';burst.s*=Math.pow(.90,step);
 if(!staticMode())requestDraw();
}
document.addEventListener('visibilitychange',()=>{if(frame)cancelAnimationFrame(frame);frame=0;last=lastFrame=0;requestDraw()});
reduced.addEventListener('change',()=>{if(frame)cancelAnimationFrame(frame);frame=0;last=lastFrame=0;requestDraw()});
new MutationObserver(()=>{if(cloudTheme===document.documentElement.dataset.theme)return;skyKey='';prepareClouds();requestDraw()}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
document.addEventListener('pointermove',e=>{pointer.x=e.clientX/Math.max(1,W);pointer.y=e.clientY/Math.max(1,H)},{passive:true});document.addEventListener('pointerdown',e=>{if(!reduced.matches&&!saveData)burst={x:e.clientX,y:e.clientY,s:1}},{passive:true});addEventListener('resize',resize,{passive:true});resize();loadWeather();setInterval(()=>{if(!document.hidden)loadWeather()},15*60*1000);
})();

/* tactile button micro-interaction */
document.addEventListener('pointerdown',e=>{const el=e.target.closest('button,.btn,.chip,a[role="button"],nav.tab a');if(!el)return;el.classList.remove('ok-press');void el.offsetWidth;el.classList.add('ok-press');setTimeout(()=>el.classList.remove('ok-press'),480)},{passive:true});
