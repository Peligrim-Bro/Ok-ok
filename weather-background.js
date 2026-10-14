(() => {
'use strict';
// weather-live-v103: city-specific modelled current conditions, not a local rain sensor.
if(document.getElementById('spatial-background'))return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const saveData=!!(navigator.connection&&navigator.connection.saveData);
const bgc=document.createElement('canvas');bgc.id='spatial-background';bgc.dataset.renderer='weather-live-v103';bgc.setAttribute('aria-hidden','true');bgc.style.cssText='position:fixed;inset:0;z-index:-1;pointer-events:none';document.body.prepend(bgc);
const b=bgc.getContext('2d',{alpha:false});if(!b)return;
let W=0,H=0,D=1,weather='unknown',night=false,wind=1,last=0,t=0,burst={x:0,y:0,s:0},pointer={x:.5,y:.45},renders=0;
const cities={pattaya:[12.9236,100.8825],phuket:[7.8804,98.3923],bangkok:[13.7563,100.5018]};
const refreshMs=15*60*1000;
let activeCity='',controller=null,checked=0;
const selectedCity=()=>cities[document.documentElement.dataset.city]?document.documentElement.dataset.city:'pattaya';
let clouds=[],drops=[],motes=[],skyLayer=null,skyKey='',cloudTheme='',frame=0,lastFrame=0;
const frameInterval=()=>isPhone()?1000/24:1000/30;
const staticMode=()=>reduced.matches||saveData;
const isPhone=()=>innerWidth<600;
function seed(){const cc=isPhone()?7:13,dc=isPhone()?70:120,mc=isPhone()?35:65;clouds=Array.from({length:cc},(_,i)=>({x:Math.random()*W,y:Math.random()*H*.82,r:(isPhone()?90:120)+Math.random()*(isPhone()?120:190),z:.18+Math.random()*.95,phase:Math.random()*6.28}));drops=Array.from({length:dc},()=>({x:Math.random()*W,y:Math.random()*H,z:.2+Math.random()*1.1,l:10+Math.random()*32}));motes=Array.from({length:mc},()=>({x:Math.random()*W,y:Math.random()*H,z:.2+Math.random()}));}
function resize(){skyKey='';D=Math.min(devicePixelRatio||1,isPhone()?1.35:1.6);W=innerWidth;H=innerHeight;bgc.width=Math.round(W*D);bgc.height=Math.round(H*D);bgc.style.width=W+'px';bgc.style.height=H+'px';b.setTransform(D,0,0,D,0,0);seed();prepareClouds();requestDraw()}
function localizeCredit(){const lang=document.documentElement.lang||localStorage.getItem('pok-lang')||'ru';const el=document.getElementById('weather-credit-label');if(el)el.textContent=({ru:'Погода на текущий час по модели',en:'Modelled current-hour weather',th:'สภาพอากาศชั่วโมงปัจจุบันจากแบบจำลอง'})[lang]||'Modelled current-hour weather'}
function applyWeather(current,city){
 const stamp=Date.parse(current?.time);
 if(!Number.isFinite(stamp)||Math.abs(Date.now()-stamp)>90*60*1000||!['clear','cloud','fog','rain','storm','unknown'].includes(current.weather)||![0,1].includes(current.is_day))throw Error('Invalid or stale weather');
 weather=current.weather;night=current.is_day===0;wind=Math.max(.5,Math.min(3,(current.wind_speed_10m||2)/3));checked=Date.now();
 Object.assign(bgc.dataset,{weather,city,night:String(night),status:weather==='unknown'?'unavailable':'current',observedAt:current.time});
 document.documentElement.dataset.weather=weather;skyKey='';requestDraw();
}
function neutral(city){weather='unknown';checked=0;night=false;delete bgc.dataset.observedAt;Object.assign(bgc.dataset,{weather,city,night:'false',status:'unavailable'});document.documentElement.dataset.weather=weather;skyKey='';requestDraw()}
async function loadWeather(){
 const city=selectedCity();if(controller)controller.abort();controller=new AbortController();const request=controller;
 if(city!==activeCity){activeCity=city;neutral(city)}
 const timeout=setTimeout(()=>request.abort(),8000);
 try{
  const u='/api/weather?city='+city;
  const r=await fetch(u,{cache:'no-store',signal:request.signal});if(!r.ok)throw Error('Weather unavailable');const j=await r.json();
  if(request!==controller||city!==selectedCity())return;applyWeather(j.current,city);
 }catch(_){if(request===controller&&city===selectedCity()&&(!checked||Date.now()-checked>=refreshMs))neutral(city)}
 finally{clearTimeout(timeout);if(request===controller)controller=null}
}
function paintSky(){const light=document.documentElement.dataset.theme==='light',g=b.createLinearGradient(0,0,0,H);if(weather==='unknown'){g.addColorStop(0,light?'#eef5ef':'#061d27');g.addColorStop(1,light?'#e4f1ea':'#103743')}else if(night){g.addColorStop(0,light?'#b9d5e9':'#03101f');g.addColorStop(.55,light?'#dbeaf2':'#09263b');g.addColorStop(1,light?'#eef7f8':'#0a303a')}else if(weather==='storm'||weather==='rain'||weather==='fog'){g.addColorStop(0,light?'#9fb8c9':'#071421');g.addColorStop(1,light?'#e5eef2':'#163444')}else{g.addColorStop(0,light?'#68b9ed':'#071d39');g.addColorStop(.5,light?'#bce6f6':'#0a3347');g.addColorStop(1,light?'#f4fbfc':'#0a3038')}b.fillStyle=g;b.fillRect(0,0,W,H);if(weather==='clear'){const sun=b.createRadialGradient(W*.82,H*.08,2,W*.82,H*.08,Math.min(W,H)*.55);sun.addColorStop(0,night?'rgba(215,235,255,.38)':'rgba(255,237,174,.58)');sun.addColorStop(.25,'rgba(255,255,255,.14)');sun.addColorStop(1,'rgba(255,255,255,0)');b.fillStyle=sun;b.fillRect(0,0,W,H)}}
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
 if(['cloud','fog','rain','storm'].includes(weather))clouds.forEach(c=>drawCloud(c,staticMode()?0:step));
 if(weather==='rain'||weather==='storm')drops.forEach(d=>rain(d,staticMode()?0:step));else if(weather==='clear'&&night)motes.forEach(m=>mote(m,staticMode()?0:step));
 b.globalAlpha=1;b.globalCompositeOperation='source-over';burst.s*=Math.pow(.90,step);
 bgc.dataset.renders=String(++renders);
 if(!staticMode()&&weather!=='unknown'&&(weather!=='clear'||night))requestDraw();
}
document.addEventListener('visibilitychange',()=>{if(frame)cancelAnimationFrame(frame);frame=0;last=lastFrame=0;if(!document.hidden&&Date.now()-checked>=refreshMs)loadWeather();requestDraw()});
reduced.addEventListener('change',()=>{if(frame)cancelAnimationFrame(frame);frame=0;last=lastFrame=0;requestDraw()});
new MutationObserver(()=>{localizeCredit();if(selectedCity()!==activeCity)loadWeather();if(cloudTheme===document.documentElement.dataset.theme)return;skyKey='';prepareClouds();requestDraw()}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','data-city','lang']});
document.addEventListener('pointermove',e=>{pointer.x=e.clientX/Math.max(1,W);pointer.y=e.clientY/Math.max(1,H)},{passive:true});document.addEventListener('pointerdown',e=>{if(!reduced.matches&&!saveData)burst={x:e.clientX,y:e.clientY,s:1}},{passive:true});addEventListener('resize',resize,{passive:true});localizeCredit();resize();loadWeather();setInterval(()=>{if(!document.hidden)loadWeather()},15*60*1000);
})();

/* tactile button micro-interaction */
document.addEventListener('pointerdown',e=>{const el=e.target.closest('button,.btn,.chip,a[role="button"],nav.tab a');if(!el)return;el.classList.remove('ok-press');void el.offsetWidth;el.classList.add('ok-press');setTimeout(()=>el.classList.remove('ok-press'),480)},{passive:true});
