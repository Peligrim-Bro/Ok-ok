import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync, copyFileSync } from 'node:fs';

rmSync('site', { recursive: true, force: true });
const unzip = spawnSync('unzip', ['-oq', 'site-source.zip', '-d', 'site'], { stdio: 'inherit' });
if (unzip.error || unzip.status !== 0) throw new Error('Site archive extraction failed');

const css = String.raw`
/* v72: sculpted glossy controls, inspired by glazed blue/lilac ceramic. */
:root {
  --toy-ink:#f9f7ff; --toy-rim:#7893ba; --toy-depth:#253047;
  --toy-face:linear-gradient(174deg,#8796b6 0%,#566483 27%,#3c4768 60%,#596783 100%);
  --toy-shadow:0 4px 0 var(--toy-depth),0 8px 13px #050b1b52,inset 0 2px 2px #ffffffb0,inset 0 -3px 5px #18203980,inset 2px 0 3px #b8d8ff35;
}
html[data-theme="light"] {
  --toy-ink:#28304d; --toy-rim:#8b9dbb; --toy-depth:#8090ae;
  --toy-face:linear-gradient(174deg,#fffefd 0%,#f2efed 26%,#d6dce8 66%,#eff0f7 100%);
  --toy-shadow:0 4px 0 var(--toy-depth),0 8px 13px #34406023,inset 0 2px 3px #fff,inset 0 -3px 5px #8293b647,inset 2px 0 3px #fff;
}
html body :is(button,a.btn,.zones a,.dock a,.leaflet-control-zoom a) {
  background:radial-gradient(ellipse 54% 27% at 27% 8%,#fff9,transparent 76%),var(--toy-face)!important;
  color:var(--toy-ink)!important;
  border:2px solid var(--toy-rim)!important;
  border-radius:18px!important;
  box-shadow:var(--toy-shadow)!important;
  text-shadow:0 1px 1px #0003;
  font-weight:700;
  transition:translate .16s ease,box-shadow .16s ease,filter .16s ease;
  background-clip:padding-box!important;
  touch-action:manipulation;
}
html[data-theme="light"] body :is(button,a.btn,.zones a,.dock a) {text-shadow:0 1px 0 #fffa;}
html body :is(button.on,button[aria-pressed="true"],.btn.call,.btn.tg,.btn.wa,.lang.timer,#installNow,.okads-submit,.okad-empty) {
  --toy-face:linear-gradient(174deg,#eeeaff 0%,#bdb3de 26%,#9388c2 64%,#c5bedf 100%);
  --toy-rim:#8880b1; --toy-depth:#5a527b; --toy-ink:#27233f;
  text-shadow:0 1px 0 #fff9;
}
html body :is(button.hot,.btn[data-report],#reportBtn) {
  --toy-face:linear-gradient(174deg,#fff0f8 0%,#d8aecb 30%,#b087ac 67%,#e2c3db 100%);
  --toy-rim:#a480a2; --toy-depth:#72536d; --toy-ink:#43263d;
  text-shadow:0 1px 0 #fff9;
}
html body :is(button:disabled,button[aria-disabled="true"]) {opacity:.5!important;cursor:not-allowed;}
html body :is(button,a.btn,.zones a,.dock a):focus-visible {outline:3px solid #b9a6f3!important;outline-offset:5px;}
@media(hover:hover) and (pointer:fine) {
  html body :is(button,a.btn,.zones a,.dock a):not(:disabled):hover {filter:brightness(1.09);translate:0 -1px;}
}
html body :is(button,a.btn,.zones a,.dock a):not(:disabled):active {
  translate:0 3px;
  box-shadow:0 1px 0 var(--toy-depth),0 3px 6px #050b1b30,inset 0 1px 3px #fff7,inset 0 -2px 4px #18203950!important;
}
html body nav.tab {gap:5px;padding-top:9px;padding-bottom:calc(9px + env(safe-area-inset-bottom,0px));}
html body nav.tab button {border-radius:16px!important;min-width:0;opacity:1!important;}
html body :is(.filters button,.zones a,.zones button) {border-radius:22px!important;}
html body .filters {padding-bottom:10px;}
html body :is(.lang,.game-pad button,.install-card button,.lang-card button) {min-height:44px;}
html body .okad {border-radius:18px!important;}
html body .okad :is(.okad-meta,.okad-badge,.okad-example-note,.okad-bottom) {color:inherit;opacity:.84;}
html body .okad .okad-badge {background:#ffffff12;border-color:#b3bed06b;}
html[data-theme="light"] body .okad .okad-badge {background:#fff7;}
html body .leaflet-control-zoom a {border-radius:12px!important;}
@media(max-width:380px) {html body nav.tab {gap:4px;}html body nav.tab button {border-radius:13px!important;}}
@media(prefers-reduced-motion:reduce) {html body :is(button,a.btn,.zones a,.dock a) {transition:none;}}
`;

for (const name of ['index.html', 'admin.html']) {
  const path = 'site/public/' + name;
  const html = readFileSync(path, 'utf8');
  if (!html.includes('</head>')) throw new Error('Missing head in ' + name);
  writeFileSync(path, html.replace('</head>', '<style id="ok-gloss-v72">' + css + '</style>\n</head>'));
}
const swPath = 'site/public/sw.js';
writeFileSync(swPath, readFileSync(swPath, 'utf8').replace(/const CACHE = [^;]+;/, 'const CACHE = "pattayaok-20261001-v73-home-icon";'));
console.log('PattayaOK v72: glossy buttons applied; PWA cache updated.');

// Versioned home-screen artwork matches the glossy application palette.
for (const size of [180, 192, 512]) {
  copyFileSync(`pattayaok-icon-v73-${size}.png`, `site/public/assets/icons/icon-${size}-v73.png`);
  copyFileSync(`pattayaok-icon-v73-${size}.png`, `site/public/assets/icons/icon-${size}.png`);
}
copyFileSync('pattayaok-icon-v73-180.png', 'site/public/apple-touch-icon.png');
const manifestPath = 'site/public/manifest.json';
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
manifest.id = '/';
manifest.icons = [192,512].map(size => ({src:`assets/icons/icon-${size}-v73.png`,sizes:`${size}x${size}`,type:'image/png',purpose:'any'}));
writeFileSync(manifestPath, JSON.stringify(manifest,null,2));
for (const name of ['index.html','admin.html']) {
  const path='site/public/'+name;
  let html=readFileSync(path,'utf8').replace(/assets\/icons\/icon-(180|192|512)\.png/g,'assets/icons/icon-$1-v73.png');
  html=html.replace(/assets\/images\/logo-ok\.jpg/g,'assets/icons/icon-192-v73.png');
  writeFileSync(path,html);
}
// A clear invitation to advertise, translated with the rest of the UI.
const adsPath='site/public/assets/ads/ads.js';
let ads=readFileSync(adsPath,'utf8')
 .replaceAll('Пять объявлений Паттайи','Заяви о себе в Паттайе')
 .replaceAll('Five Pattaya ads','Get noticed in Pattaya')
 .replaceAll('โฆษณาพัทยา 5 รายการ','โปรโมตตัวคุณในพัทยา')
 .replaceAll('Разместить · ${price}', 'Разместить своё объявление · ${price}');
writeFileSync(adsPath,ads);
for (const name of ['index.html','admin.html']) {
 const path='site/public/'+name;
 writeFileSync(path,readFileSync(path,'utf8').replaceAll('assets/ads/ads.js?v=71','assets/ads/ads.js?v=73'));
}
const sw=readFileSync(swPath,'utf8').replaceAll('assets/ads/ads.js?v=71','assets/ads/ads.js?v=73').replace('"./assets/images/logo-ok.jpg"','"./assets/images/logo-ok.jpg", "./assets/icons/icon-180-v73.png", "./assets/icons/icon-192-v73.png", "./assets/icons/icon-512-v73.png"');
writeFileSync(swPath,sw);
// Lightweight vector smiley; wink repeats without timers or extra requests.
const shopIcon = `<svg class="shop-smiley" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
<defs><radialGradient id="shop-face" cx="32%" cy="20%" r="85%"><stop stop-color="#fff8b1"/><stop offset=".38" stop-color="#ffdf4b"/><stop offset=".8" stop-color="#f7b921"/><stop offset="1" stop-color="#d68c0c"/></radialGradient><linearGradient id="shop-eye" x2="0" y2="1"><stop stop-color="#ffd0ca"/><stop offset="1" stop-color="#ef6864"/></linearGradient></defs>
<circle cx="20" cy="21" r="17" fill="#825312" opacity=".55"/>
<circle cx="20" cy="19" r="17" fill="url(#shop-face)" stroke="#ffe979" stroke-width="1.3"/>
<path d="M8 12C11 5 21 3 29 8" fill="none" stroke="#fffce0" stroke-width="2" stroke-linecap="round" opacity=".8"/>
<g class="shop-eye-left"><path d="M8.5 17.3Q13 14.6 17.5 17.5Q17 23 13 23Q9 23 8.5 17.3" fill="url(#shop-eye)" stroke="#9c5223" stroke-width=".8"/><ellipse cx="13.3" cy="19.3" rx="1.5" ry="2.5" fill="#54252a"/><path d="M8.5 17.3Q13 15.9 17.5 17.5" stroke="#86501b" stroke-width="1.5" fill="none" stroke-linecap="round"/></g>
<g class="shop-eye-wink"><path d="M22.5 17.5Q27 14.6 31.5 17.3Q31 23 27 23Q23 23 22.5 17.5" fill="url(#shop-eye)" stroke="#9c5223" stroke-width=".8"/><ellipse cx="26.7" cy="19.3" rx="1.5" ry="2.5" fill="#54252a"/><path d="M22.5 17.5Q27 15.9 31.5 17.3" stroke="#86501b" stroke-width="1.5" fill="none" stroke-linecap="round"/></g>
<path class="shop-wink-line" d="M23 19Q27 21 31 18.8" fill="none" stroke="#86501b" stroke-width="1.8" stroke-linecap="round"/>
<path d="M12.5 27Q20 32.5 28 25.5" fill="none" stroke="#9c521c" stroke-width="1.9" stroke-linecap="round"/>
</svg>`;
const smileyCSS=`<style id="ok-shop-smiley-v74">
html body nav.tab button[data-tab="shop"] .shop-smiley {width:32px!important;height:32px!important;display:block;overflow:visible;filter:drop-shadow(0 2px 1px #14203855);flex-shrink:0;}
.shop-eye-wink {transform-box:fill-box;transform-origin:center;animation:shop-wink 6s ease-in-out infinite;}
.shop-wink-line {opacity:0;animation:shop-wink-line 6s ease-in-out infinite;}
@keyframes shop-wink {0%,84%,92%,100%{transform:scaleY(1);opacity:1}87%,89%{transform:scaleY(.05);opacity:0}}
@keyframes shop-wink-line {0%,84%,92%,100%{opacity:0}87%,89%{opacity:1}}
@media(prefers-reduced-motion:reduce){.shop-eye-wink,.shop-wink-line{animation:none!important;}}
</style>`;
const indexPath='site/public/index.html';
let smileyHTML=readFileSync(indexPath,'utf8');
const shopPattern=/(<button\b[^>]*data-tab="shop"[^>]*>\s*)<svg\b[\s\S]*?<\/svg>/;
if(!shopPattern.test(smileyHTML)) throw new Error('Shop navigation icon not found');
smileyHTML=smileyHTML.replace(shopPattern,(_,opening)=>opening+shopIcon).replace('</head>',smileyCSS+'\n</head>');
writeFileSync(indexPath,smileyHTML);
writeFileSync(swPath,readFileSync(swPath,'utf8').replace('v73-home-icon','v74-winking-shop'));
/* === OK-OK v76 ALL-IN-ONE PATCH ===
   Add this entire block ONCE at the very end of gloss-build.mjs.
   Includes:
   1) Supabase community-ads bridge
   2) premium glowing "Поддержать автора" treatment
   3) touch/click star-burst effect
   4) PWA cache bump
*/

// --- Supabase community ads bridge ---
{
  const adsBridgePath='site/public/assets/ads/ads.js';
  let adsBridge=readFileSync(adsBridgePath,'utf8');
  const supabaseAdsEndpoint='https://qyvahcxumjphxuykivpr.supabase.co/functions/v1/community-ads';

  if(!adsBridge.includes('OKOK_SUPABASE_ADS_ENDPOINT')){
    adsBridge += `
;(()=>{const ENDPOINT="${supabaseAdsEndpoint}";
window.OKOK_SUPABASE_ADS_ENDPOINT=ENDPOINT;
window.okokLoadCommunityAds=async function(){
  try{
    const r=await fetch(ENDPOINT,{headers:{accept:"application/json"},cache:"no-store"});
    if(!r.ok) throw new Error("ads_http_"+r.status);
    const j=await r.json();
    return Array.isArray(j?.ads)?j.ads:[];
  }catch(e){
    console.warn("[ok-ok] Supabase ads fallback unavailable",e);
    return [];
  }
};
})();`;
  }
  writeFileSync(adsBridgePath,adsBridge);
}

// --- Premium Support Author button ---
{
  const supportCSS=String.raw`
<style id="ok-support-author-v76">
:root{
  --support-text:#fff;
  --support-edge:#c5b8ff;
  --support-a:#6658c9;
  --support-b:#9b70df;
  --support-c:#416eb9;
}
html[data-theme="light"]{
  --support-text:#302452;
  --support-edge:#a895e8;
  --support-a:#e7e2ff;
  --support-b:#d5c5ff;
  --support-c:#c9e4ff;
}
.ok-support-author{
  position:relative!important;
  isolation:isolate;
  overflow:hidden!important;
  width:calc(100% - 28px)!important;
  max-width:760px!important;
  min-height:54px!important;
  margin:12px auto 16px!important;
  padding:13px 22px!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  gap:9px!important;
  border-radius:20px!important;
  border:1px solid color-mix(in srgb,var(--support-edge) 80%,white)!important;
  color:var(--support-text)!important;
  background:
    radial-gradient(circle at 16% 0%,#ffffff80 0 2%,transparent 24%),
    linear-gradient(115deg,var(--support-a),var(--support-b) 46%,var(--support-c))!important;
  box-shadow:
    0 5px 0 #332b6d,
    0 11px 25px #715ed94a,
    0 0 28px #8e79ff35,
    inset 0 2px 2px #ffffffb5,
    inset 0 -4px 9px #24285a66!important;
  font-weight:850!important;
  letter-spacing:.01em;
  text-shadow:0 1px 2px #17132d70!important;
  transform:translateZ(0);
}
html[data-theme="light"] .ok-support-author{
  box-shadow:
    0 5px 0 #9689c8,
    0 11px 24px #6650aa2b,
    0 0 25px #8d76e82d,
    inset 0 2px 3px #fff,
    inset 0 -4px 8px #7c70ae33!important;
  text-shadow:0 1px 0 #fff!important;
}
.ok-support-author::before{
  content:"";
  position:absolute;
  z-index:-1;
  inset:-55% -35%;
  background:linear-gradient(105deg,transparent 37%,#fff0 43%,#ffffffb5 49%,#fff0 56%,transparent 62%);
  transform:translateX(-55%) rotate(3deg);
  animation:okSupportShine 4.8s cubic-bezier(.45,0,.2,1) infinite;
  pointer-events:none;
}
.ok-support-author::after{
  content:"✦";
  position:absolute;
  right:16px;
  top:8px;
  color:#fff;
  font-size:12px;
  opacity:.72;
  filter:drop-shadow(0 0 5px #fff);
  animation:okSupportTwinkle 2.4s ease-in-out infinite;
  pointer-events:none;
}
.ok-support-author:active{
  transform:translateY(3px) scale(.992)!important;
  box-shadow:
    0 2px 0 #332b6d,
    0 6px 16px #715ed93d,
    0 0 32px #a78fff55,
    inset 0 2px 5px #ffffffa8!important;
}
.ok-support-star{
  position:fixed;
  z-index:2147483646;
  left:0;top:0;
  width:7px;height:7px;
  pointer-events:none;
  color:#fff;
  font-size:13px;
  line-height:1;
  text-shadow:0 0 5px #fff,0 0 11px #a58cff;
  will-change:transform,opacity;
  animation:okSupportBurst 720ms cubic-bezier(.1,.65,.15,1) forwards;
}
@keyframes okSupportShine{
  0%,58%{transform:translateX(-65%) rotate(3deg);opacity:0}
  64%{opacity:.85}
  79%,100%{transform:translateX(65%) rotate(3deg);opacity:0}
}
@keyframes okSupportTwinkle{
  0%,100%{transform:scale(.72) rotate(0);opacity:.35}
  48%{transform:scale(1.35) rotate(35deg);opacity:1}
}
@keyframes okSupportBurst{
  0%{transform:translate(-50%,-50%) scale(.25) rotate(0deg);opacity:1}
  75%{opacity:.9}
  100%{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(var(--s)) rotate(var(--r));opacity:0}
}
@media(prefers-reduced-motion:reduce){
  .ok-support-author::before,.ok-support-author::after{animation:none!important}
  .ok-support-star{display:none!important}
}
</style>`;

  const supportJS=String.raw`
<script id="ok-support-author-js-v76">
(()=> {
  const labels=[
    "поддержать автора","support the author","support author",
    "поддержать проект","สนับสนุนผู้เขียน","สนับสนุน"
  ];
  const mark=()=>{
    document.querySelectorAll("a,button").forEach(el=>{
      const t=(el.textContent||"").trim().toLowerCase();
      if(labels.some(x=>t.includes(x))) el.classList.add("ok-support-author");
    });
  };
  const burst=(x,y)=>{
    if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const glyphs=["✦","✧","⋆","✦","·"];
    for(let i=0;i<18;i++){
      const n=document.createElement("i");
      n.className="ok-support-star";
      n.textContent=glyphs[i%glyphs.length];
      const a=(Math.PI*2*i/18)+(Math.random()-.5)*.32;
      const d=32+Math.random()*72;
      n.style.left=x+"px"; n.style.top=y+"px";
      n.style.setProperty("--dx",(Math.cos(a)*d).toFixed(1)+"px");
      n.style.setProperty("--dy",(Math.sin(a)*d).toFixed(1)+"px");
      n.style.setProperty("--s",(0.65+Math.random()*1.05).toFixed(2));
      n.style.setProperty("--r",((Math.random()-.5)*220).toFixed(0)+"deg");
      document.body.appendChild(n);
      setTimeout(()=>n.remove(),780);
    }
  };
  mark();
  new MutationObserver(mark).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener("pointerdown",e=>{
    const b=e.target.closest?.(".ok-support-author");
    if(!b) return;
    burst(e.clientX,e.clientY);
  },{passive:true});
})();
</script>`;

  for(const name of ['index.html','admin.html']){
    const path='site/public/'+name;
    let html=readFileSync(path,'utf8');
    if(!html.includes('ok-support-author-v76')){
      html=html.replace('</head>',supportCSS+'\n</head>');
      html=html.replace('</body>',supportJS+'\n</body>');
      writeFileSync(path,html);
    }
  }
}

// --- Cache bump so iPhone/iPad receives the new UI ---
{
  let sw76=readFileSync(swPath,'utf8');
  sw76=sw76
    .replace('v74-winking-shop','v76-support-supabase')
    .replace('v75-supabase-bridge','v76-support-supabase');
  writeFileSync(swPath,sw76);
}/* === OK-OK v77: force old $ donate control into premium Support Author === */
{
  const supportFixJS=String.raw`
<script id="ok-support-author-fix-v77">
(()=> {
  const translations={
    ru:"Поддержать автора",
    en:"Support the author",
    th:"สนับสนุนผู้เขียน"
  };
  const getLabel=()=>{
    const lang=(document.documentElement.lang||localStorage.getItem("lang")||"ru").toLowerCase();
    return lang.startsWith("th")?translations.th:lang.startsWith("en")?translations.en:translations.ru;
  };
  const isDonate=(el)=>{
    const t=(el.textContent||"").trim();
    const id=(el.id||"").toLowerCase();
    const cls=(typeof el.className==="string"?el.className:"").toLowerCase();
    const href=(el.getAttribute?.("href")||"").toLowerCase();
    const aria=(el.getAttribute?.("aria-label")||"").toLowerCase();
    return t==="$" ||
      /donat|donate|support|поддерж/.test(id+" "+cls+" "+href+" "+aria+" "+t.toLowerCase());
  };
  const upgrade=()=>{
    const candidates=[...document.querySelectorAll("a,button")].filter(isDonate);
    for(const el of candidates){
      if(el.closest(".okad")) continue;
      el.classList.add("ok-support-author");
      if((el.textContent||"").trim()==="$" || (el.textContent||"").trim().length<3){
        el.textContent="✦ "+getLabel()+" ✦";
      }
      el.setAttribute("aria-label",getLabel());
    }
  };
  upgrade();
  addEventListener("DOMContentLoaded",upgrade,{once:true});
  setTimeout(upgrade,400);
  setTimeout(upgrade,1400);
  new MutationObserver(upgrade).observe(document.documentElement,{childList:true,subtree:true});
})();
</script>`;
  const index='site/public/index.html';
  let html=readFileSync(index,'utf8');
  if(!html.includes('ok-support-author-fix-v77')){
    html=html.replace('</body>',supportFixJS+'\n</body>');
    writeFileSync(index,html);
  }
  let sw77=readFileSync(swPath,'utf8');
  sw77=sw77
    .replace('v76-support-supabase','v77-support-button')
    .replace('v74-winking-shop','v77-support-button');
  writeFileSync(swPath,sw77);
}
console.log('PattayaOK v77: old $ donate control upgraded to premium Support Author.');
console.log('PattayaOK v76: Supabase bridge + premium Support Author star-burst enabled.');
/* === OK-OK v78: layout guard + compact Support Author + animated hourglass === */
{
  const v78CSS=String.raw`
<style id="ok-layout-v78">
/* Prevent controls from forcing horizontal overflow. */
html,body{max-width:100%;overflow-x:clip}
*,*::before,*::after{box-sizing:border-box}
img,video,svg{max-width:100%}

/* Support Author: deliberately narrower than v76. */
html body .ok-support-author{
  width:min(78%,420px)!important;
  max-width:420px!important;
  min-width:230px!important;
  min-height:50px!important;
  margin:12px auto 17px!important;
  padding:11px 18px!important;
  border-radius:18px!important;
  flex:none!important;
  white-space:normal!important;
  text-align:center!important;
  line-height:1.15!important;
}
@media(max-width:360px){
  html body .ok-support-author{
    width:82%!important;
    min-width:0!important;
    font-size:13px!important;
    padding-inline:12px!important;
  }
}

/* Compact timer: it must never stretch its row. */
html body .ok-timer-v78{
  width:46px!important;
  min-width:46px!important;
  max-width:46px!important;
  height:46px!important;
  min-height:46px!important;
  padding:0!important;
  margin:0!important;
  border-radius:15px!important;
  display:inline-grid!important;
  place-items:center!important;
  flex:0 0 46px!important;
  overflow:visible!important;
  line-height:1!important;
  font-size:0!important;
}
.ok-timer-v78 .ok-hourglass-v78{
  display:block;
  font-size:24px;
  line-height:1;
  transform-origin:50% 50%;
  filter:drop-shadow(0 2px 2px #1115);
  animation:okHourglassFlip 2.8s cubic-bezier(.65,0,.35,1) infinite;
}
@keyframes okHourglassFlip{
  0%,28%{transform:rotate(0deg)}
  43%,72%{transform:rotate(180deg)}
  87%,100%{transform:rotate(360deg)}
}

/* Navigation/layout guards. */
html body nav.tab{
  width:100%!important;
  max-width:100%!important;
  display:grid!important;
  grid-template-columns:repeat(5,minmax(0,1fr))!important;
  gap:5px!important;
}
html body nav.tab button{
  width:auto!important;
  min-width:0!important;
  max-width:100%!important;
  overflow:hidden!important;
}
html body nav.tab button :is(span,small){
  max-width:100%;
  overflow:hidden;
  text-overflow:ellipsis;
}
html body :is(.filters,.zones,.dock){
  max-width:100%!important;
}
html body :is(.filters,.zones){
  overflow-x:auto;
  overscroll-behavior-inline:contain;
  -webkit-overflow-scrolling:touch;
}
html body :is(.card,.panel,.glass,.install-card,.lang-card,.okad){
  max-width:100%!important;
}

/* Long RU/EN/TH labels should wrap rather than widen the page. */
html body :is(button,a.btn,.zones a,.zones button){
  overflow-wrap:anywhere;
}

/* iPhone/iPad safe area. */
html body nav.tab{
  padding-bottom:calc(9px + env(safe-area-inset-bottom,0px))!important;
}

@media(max-width:380px){
  html body nav.tab{gap:3px!important}
  html body nav.tab button{padding-left:4px!important;padding-right:4px!important}
}
@media(prefers-reduced-motion:reduce){
  .ok-timer-v78 .ok-hourglass-v78{animation:none!important}
}
</style>`;

  const v78JS=String.raw`
<script id="ok-layout-js-v78">
(()=> {
  const timerWords=[
    "таймер","timer","นาฬิกาจับเวลา","จับเวลา"
  ];
  const looksLikeTimer=(el)=>{
    const text=(el.textContent||"").trim().toLowerCase();
    const id=(el.id||"").toLowerCase();
    const cls=(typeof el.className==="string"?el.className:"").toLowerCase();
    const aria=(el.getAttribute?.("aria-label")||"").toLowerCase();
    const title=(el.getAttribute?.("title")||"").toLowerCase();
    const bag=[text,id,cls,aria,title].join(" ");
    return timerWords.some(w=>bag.includes(w)) || /\btimer\b/.test(bag);
  };
  const timerLabel=()=>{
    const lang=(document.documentElement.lang||localStorage.getItem("lang")||"ru").toLowerCase();
    return lang.startsWith("th")?"ตัวจับเวลา":lang.startsWith("en")?"Timer":"Таймер";
  };
  const upgradeTimer=()=>{
    const all=[...document.querySelectorAll("button,a")];
    const timer=all.find(el=>looksLikeTimer(el) && !el.closest(".okad"));
    if(!timer) return;
    timer.classList.add("ok-timer-v78");
    timer.setAttribute("aria-label",timerLabel());
    timer.setAttribute("title",timerLabel());
    if(!timer.querySelector(".ok-hourglass-v78")){
      timer.textContent="";
      const icon=document.createElement("span");
      icon.className="ok-hourglass-v78";
      icon.textContent="⌛";
      icon.setAttribute("aria-hidden","true");
      timer.appendChild(icon);
    }
  };
  upgradeTimer();
  addEventListener("DOMContentLoaded",upgradeTimer,{once:true});
  setTimeout(upgradeTimer,350);
  setTimeout(upgradeTimer,1200);
  new MutationObserver(upgradeTimer).observe(document.documentElement,{childList:true,subtree:true});
})();
</script>`;

  for(const name of ['index.html','admin.html']){
    const path='site/public/'+name;
    let html=readFileSync(path,'utf8');
    if(!html.includes('ok-layout-v78')){
      html=html.replace('</head>',v78CSS+'\n</head>');
      html=html.replace('</body>',v78JS+'\n</body>');
      writeFileSync(path,html);
    }
  }

  let sw78=readFileSync(swPath,'utf8');
  sw78=sw78
    .replace('v77-support-button','v78-layout-timer')
    .replace('v76-support-supabase','v78-layout-timer')
    .replace('v74-winking-shop','v78-layout-timer');
  writeFileSync(swPath,sw78);
}
console.log('PattayaOK v78: compact support button + animated hourglass + responsive layout guards enabled.');
/* === OK-OK v79 EMERGENCY LAYOUT FIX === */
{
  const fixCSS=String.raw`
<style id="ok-layout-emergency-v79">
/* Cancel the v78 rules that changed the site's established layout. */
html,body{max-width:none!important}
body{overflow-x:hidden!important}

/* Never convert the existing bottom navigation to grid. */
html body nav.tab{
  display:flex!important;
  width:auto!important;
  max-width:none!important;
  grid-template-columns:none!important;
  gap:5px!important;
}
html body nav.tab button{
  width:auto!important;
  min-width:0!important;
  max-width:none!important;
  flex:1 1 0!important;
}

/* Restore original scrolling/layout behavior for chips and content. */
html body :is(.filters,.zones,.dock){
  max-width:none!important;
}
html body :is(.card,.panel,.glass,.install-card,.lang-card,.okad){
  max-width:none!important;
}

/* Support button must not consume the whole utility/header row. */
html body .ok-support-author{
  width:auto!important;
  min-width:190px!important;
  max-width:300px!important;
  min-height:46px!important;
  margin:0 6px!important;
  padding:10px 15px!important;
  flex:0 1 300px!important;
  white-space:nowrap!important;
  font-size:14px!important;
  border-radius:17px!important;
}
@media(max-width:600px){
  html body .ok-support-author{
    min-width:150px!important;
    max-width:220px!important;
    flex-basis:220px!important;
    font-size:12px!important;
    padding-inline:10px!important;
  }
}

/* Timer remains compact, but does not alter its parent layout. */
html body .ok-timer-v78{
  width:42px!important;
  min-width:42px!important;
  max-width:42px!important;
  height:42px!important;
  min-height:42px!important;
  flex:0 0 42px!important;
  margin:0 4px!important;
  padding:0!important;
  display:inline-grid!important;
  place-items:center!important;
}
.ok-timer-v78 .ok-hourglass-v78{font-size:22px!important}
</style>`;

  for(const name of ['index.html','admin.html']){
    const path='site/public/'+name;
    let html=readFileSync(path,'utf8');
    if(!html.includes('ok-layout-emergency-v79')){
      html=html.replace('</head>',fixCSS+'\n</head>');
      writeFileSync(path,html);
    }
  }

  let sw79=readFileSync(swPath,'utf8');
  sw79=sw79
    .replace('v78-layout-timer','v79-emergency-layout')
    .replace('v77-support-button','v79-emergency-layout');
  writeFileSync(swPath,sw79);
}
console.log('PattayaOK v79: emergency layout correction applied.');
/* === OK-OK v80: NEON PWA + OKI PET === */
{
  // New neon home-screen icon.
  for (const size of [180,192,512]) {
    copyFileSync(`okok-neon-v80-${size}.png`, `site/public/assets/icons/icon-${size}-v80.png`);
    copyFileSync(`okok-neon-v80-${size}.png`, `site/public/assets/icons/icon-${size}.png`);
  }
  copyFileSync('okok-neon-v80-180.png','site/public/apple-touch-icon.png');

  const manifestPath='site/public/manifest.json';
  const m=JSON.parse(readFileSync(manifestPath,'utf8'));
  m.id='/';
  m.name='OK-OK';
  m.short_name='OK-OK';
  m.icons=[192,512].map(size=>({
    src:`assets/icons/icon-${size}-v80.png`,sizes:`${size}x${size}`,
    type:'image/png',purpose:'any maskable'
  }));
  writeFileSync(manifestPath,JSON.stringify(m,null,2));

  const v80CSS=String.raw`
<style id="ok-v80-neon-pet">
/* PWA install: compact raised neon control, isolated from layout */
html body :is(#installNow,[data-install],[id*="install" i]).ok-install-v80{
 position:relative!important;overflow:hidden!important;
 border:1px solid #70eaff!important;border-radius:18px!important;
 background:linear-gradient(145deg,#122e75,#392087 52%,#8b237f)!important;
 box-shadow:0 5px 0 #07173f,0 9px 18px #0a0f2f88,
 inset 0 2px 2px #fff9,0 0 18px #2adfff66!important;
 color:#fff!important;text-shadow:0 1px 3px #07112d!important;
}
.ok-install-v80::after{
 content:"";position:absolute;inset:-60% -35%;
 background:linear-gradient(110deg,transparent 40%,#fff9 49%,transparent 58%);
 transform:translateX(-70%);animation:okiShine 5s ease-in-out infinite;pointer-events:none
}
@keyframes okiShine{0%,62%{transform:translateX(-70%)}82%,100%{transform:translateX(70%)}}

/* OKI overlay: self-contained, does not alter existing page grid */
#okiPetV80{position:fixed;inset:0;z-index:2147483000;background:#06112be8;
 backdrop-filter:blur(14px);display:none;align-items:center;justify-content:center;padding:18px}
#okiPetV80.on{display:flex}
.oki-card{width:min(100%,430px);max-height:88dvh;overflow:auto;position:relative;
 border:1px solid #5fe9ff88;border-radius:30px;padding:22px 18px 18px;text-align:center;
 background:radial-gradient(circle at 50% 5%,#943d9c66,transparent 32%),
 linear-gradient(160deg,#0b2458ee,#11143bee 55%,#25154cee);
 box-shadow:0 18px 55px #000b,inset 0 1px 2px #fff8,0 0 35px #21d9ff44}
.oki-close{position:absolute!important;right:12px;top:12px;width:42px!important;height:42px!important;
 min-width:42px!important;padding:0!important;border-radius:50%!important}
.oki-title{font-size:26px;font-weight:900;color:#fff}.oki-sub{font-size:12px;color:#bfefff;margin-top:2px}
.oki-face{width:148px;height:148px;margin:18px auto 14px;border-radius:50%;display:grid;place-items:center;
 font-size:78px;background:radial-gradient(circle at 35% 25%,#fff,#77eaff 18%,#6655e9 54%,#ee43d2 80%,#14204b);
 box-shadow:inset 0 5px 10px #fff9,inset 0 -10px 22px #190e5c,0 10px 0 #08143c,0 0 35px #28ddff88;
 animation:okiFloat 3.1s ease-in-out infinite}
@keyframes okiFloat{50%{transform:translateY(-7px) rotate(2deg)}}
.oki-stats{display:grid;gap:9px;text-align:left;margin:8px 0 16px}
.oki-stat{display:grid;grid-template-columns:82px 1fr 38px;align-items:center;gap:7px;color:#fff;font-size:12px}
.oki-bar{height:11px;background:#060c24;border-radius:99px;overflow:hidden;border:1px solid #ffffff25}
.oki-fill{height:100%;border-radius:inherit;background:linear-gradient(90deg,#25e8ff,#9e66ff,#ff56b6)}
.oki-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.oki-actions button{min-width:0!important;padding:10px 5px!important;font-size:12px!important}
.oki-level{display:inline-block;margin:0 0 10px;padding:5px 11px;border-radius:99px;color:#ffe787;
 background:#ffcc3120;border:1px solid #ffd96b55;font-size:12px;font-weight:800}
@media(prefers-reduced-motion:reduce){.oki-face,.ok-install-v80::after{animation:none!important}}
</style>`;

  const v80JS=String.raw`
<script id="ok-v80-neon-pet-js">
(()=>{
 const LANG=()=>{const l=(document.documentElement.lang||localStorage.getItem("lang")||"ru").toLowerCase();
   return l.startsWith("th")?"th":l.startsWith("en")?"en":"ru"};
 const T={
  ru:{pet:"OKI",sub:"твой маленький житель OK-OK",food:"Еда",mood:"Радость",energy:"Энергия",level:"Уровень",feed:"🍉 Кормить",play:"✨ Играть",sleep:"🌙 Спать",install:"OK-OK · На экран домой"},
  en:{pet:"OKI",sub:"your little OK-OK companion",food:"Food",mood:"Mood",energy:"Energy",level:"Level",feed:"🍉 Feed",play:"✨ Play",sleep:"🌙 Sleep",install:"OK-OK · Add to Home"},
  th:{pet:"OKI",sub:"เพื่อนตัวน้อยของคุณใน OK-OK",food:"อาหาร",mood:"อารมณ์",energy:"พลัง",level:"เลเวล",feed:"🍉 ให้อาหาร",play:"✨ เล่น",sleep:"🌙 นอน",install:"OK-OK · เพิ่มหน้าจอหลัก"}
 };
 const clamp=n=>Math.max(0,Math.min(100,n));
 const load=()=>{try{return {...{food:82,mood:88,energy:76,xp:0,last:Date.now()},...JSON.parse(localStorage.getItem("oki-v80")||"{}")}}catch{return {food:82,mood:88,energy:76,xp:0,last:Date.now()}}};
 let s=load();
 const elapsed=Math.min(72,(Date.now()-(s.last||Date.now()))/36e5);
 s.food=clamp(s.food-elapsed*1.2);s.mood=clamp(s.mood-elapsed*.55);s.energy=clamp(s.energy-elapsed*.75);s.last=Date.now();
 const save=()=>{s.last=Date.now();localStorage.setItem("oki-v80",JSON.stringify(s))};
 const render=()=>{
  const q=T[LANG()],lv=1+Math.floor(s.xp/100);
  document.querySelector("#okiPetV80")?.remove();
  const el=document.createElement("div");el.id="okiPetV80";
    el.innerHTML='<div class="oki-card"><button class="oki-close" aria-label="Close">×</button>'+
   '<div class="oki-title">'+q.pet+'</div><div class="oki-sub">'+q.sub+'</div>'+
   '<div class="oki-face" aria-hidden="true">'+(s.energy<25?"😴":s.food<25?"🥺":s.mood>70?"😉":"🙂")+'</div>'+
   '<div class="oki-level">✦ '+q.level+' '+lv+' · '+(s.xp%100)+'/100 XP</div>'+
   '<div class="oki-stats">'+[["food",q.food],["mood",q.mood],["energy",q.energy]].map(([k,n])=>'<div class="oki-stat"><span>'+n+'</span><div class="oki-bar"><div class="oki-fill" style="width:'+Math.round(s[k])+'%"></div></div><b>'+Math.round(s[k])+'</b></div>').join("")+'</div>'+
   '<div class="oki-actions"><button data-a="feed">'+q.feed+'</button><button data-a="play">'+q.play+'</button><button data-a="sleep">'+q.sleep+'</button></div></div>';
document.body.appendChild(el);
el.querySelector(".oki-close").onclick=()=>el.classList.remove("on");
  el.onclick=e=>{if(e.target===el)el.classList.remove("on")};
  el.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{
   const a=b.dataset.a;
   if(a==="feed"){s.food=clamp(s.food+24);s.mood=clamp(s.mood+4)}
   if(a==="play"){s.mood=clamp(s.mood+22);s.energy=clamp(s.energy-9);s.food=clamp(s.food-5)}
   if(a==="sleep"){s.energy=clamp(s.energy+30);s.food=clamp(s.food-4)}
   s.xp+=8;save();render();document.querySelector("#okiPetV80").classList.add("on");
  });
 };
 const install=()=>{
  document.querySelectorAll("button,a").forEach(el=>{
   const bag=((el.id||"")+" "+(typeof el.className==="string"?el.className:"")+" "+(el.textContent||"")+" "+(el.getAttribute?.("aria-label")||"")).toLowerCase();
   if(/install|установ|экран домой|home screen|หน้าจอหลัก/.test(bag)){
    el.classList.add("ok-install-v80");
   if(el.textContent!==T[LANG()].install)el.textContent=T[LANG()].install;
   }
  });
 };
 const hookGame=()=>{
  document.querySelectorAll("button,a").forEach(el=>{
   const bag=((el.dataset?.tab||"")+" "+(el.id||"")+" "+(el.textContent||"")+" "+(el.getAttribute?.("aria-label")||"")).toLowerCase();
   if(/snake|змей|game|игра|เกม/.test(bag)&&!el.closest(".okad")){
    el.dataset.oki="1";
    const txt=(el.textContent||"").trim();
    if(/змей|snake|игра|game|เกม/i.test(txt)) el.textContent="OKI";
   }
  });
 };
 render();install();hookGame();save();
 document.addEventListener("click",e=>{
   const b=e.target.closest?.("[data-oki='1']");
   if(!b)return;
   e.preventDefault();e.stopImmediatePropagation();
   document.querySelector("#okiPetV80")?.classList.add("on");
 },true);
 new MutationObserver(()=>{install();hookGame()}).observe(document.documentElement,{childList:true,subtree:true});
})();
</script>`;
  for(const name of ['index.html','admin.html']){
    const p='site/public/'+name; let h=readFileSync(p,'utf8');
    h=h.replace(/assets\/icons\/icon-(180|192|512)-v73\.png/g,'assets/icons/icon-$1-v80.png');
    if(!h.includes('ok-v80-neon-pet')) h=h.replace('</head>',v80CSS+'\n</head>').replace('</body>',v80JS+'\n</body>');
    writeFileSync(p,h);
  }
  let sw80=readFileSync(swPath,'utf8').replace('v79-emergency-layout','v80-neon-oki');
  writeFileSync(swPath,sw80);
}
console.log('OK-OK v80: neon PWA identity + OKI pet enabled.');
// === OKI LIVING v81 — добавить в конец gloss-build.mjs ===
{
 const okiLivingJS=String.raw`<script id="ok-v80-neon-pet-js">
(()=>{
 'use strict';
 const KEY='oki-v80', ID='okiPetV80';
 const L={
 ru:{
  sub:'Маленький друг в Паттайе',
  food:'Сытость',mood:'Настроение',energy:'Энергия',level:'Уровень',
  feed:'🍉 Кормить',pet:'💜 Погладить',play:'⭐ Лови звёзды',
  sleep:'🌙 Спать',wake:'☀️ Разбудить',dance:'🕺 Танцевать',
  talk:'💬 Поболтать',gift:'🎁 Подарок дня',close:'Закрыть',
  hello:'Привет! Погладь меня — я люблю внимание 💜',
  fed:'Ммм, арбуз! Спасибо 🍉',
  petted:'Ещё немного за ушком? 💜',
  tired:'Я устал. Давай поспим?',
  rest:'Тсс… Я восстанавливаю силы 😴',
  awake:'Доброе утро! Я снова с тобой ☀️',
  dancing:'Паттайя, включай музыку! 🕺',
  gifted:'Подарок дня: +15 XP и хорошее настроение 🎁',
  already:'Сегодня подарок уже получен. Приходи завтра 💜',
  cooldown:'Дай мне пару секунд перевести дух 🙂',
  goal:'Поймай 5 звёзд за 15 секунд',
  won:'Ура! Все звёзды наши! +20 XP ✨',
  lost:'Хорошая попытка! Сыграем ещё? ⭐',
  talks:[
   'Я маленький, но люблю большие приключения 🌴',
   'Лучший план: вода, тень и немного отдыха ☀️',
   'Вместе веселее. Заглядывай ко мне 💜',
   'Смотри, как я умею подмигивать 😉'
  ],
  tip:'Коснись OKI или проведи пальцем по нему',
  back:'Вернуться',score:'Звёзды',time:'Время'
 },
 en:{
  sub:'Your little friend in Pattaya',
  food:'Food',mood:'Mood',energy:'Energy',level:'Level',
  feed:'🍉 Feed',pet:'💜 Pet',play:'⭐ Catch stars',
  sleep:'🌙 Sleep',wake:'☀️ Wake up',dance:'🕺 Dance',
  talk:'💬 Chat',gift:'🎁 Daily gift',close:'Close',
  hello:'Hi! Give me a gentle tap 💜',
  fed:'Yummy watermelon! Thank you 🍉',
  petted:'A little scratch behind my ear? 💜',
  tired:'I am tired. Let us rest.',
  rest:'Shh… Recharging 😴',
  awake:'Good morning! I am back ☀️',
  dancing:'Pattaya, turn up the music! 🕺',
  gifted:'Daily gift: +15 XP and a happy mood 🎁',
  already:'You got today’s gift. Come back tomorrow 💜',
  cooldown:'Give me a moment to catch my breath 🙂',
  goal:'Catch 5 stars in 15 seconds',
  won:'We caught them all! +20 XP ✨',
  lost:'Nice try! Play again? ⭐',
  talks:[
   'Small friend, big adventures 🌴',
   'Water, shade and a little rest ☀️',
   'It is more fun together 💜',
   'Watch me wink 😉'
  ],
  tip:'Tap OKI or gently swipe over him',
  back:'Back',score:'Stars',time:'Time'
 },
 th:{
  sub:'เพื่อนตัวน้อยของคุณในพัทยา',
  food:'อาหาร',mood:'อารมณ์',energy:'พลัง',level:'เลเวล',
  feed:'🍉 ให้อาหาร',pet:'💜 ลูบหัว',play:'⭐ จับดาว',
  sleep:'🌙 นอน',wake:'☀️ ปลุก',dance:'🕺 เต้น',
  talk:'💬 คุยกัน',gift:'🎁 ของขวัญวันนี้',close:'ปิด',
  hello:'สวัสดี! แตะฉันเบา ๆ 💜',
  fed:'แตงโมอร่อยมาก! ขอบคุณ 🍉',
  petted:'ลูบหัวอีกหน่อยได้ไหม 💜',
  tired:'เหนื่อยแล้ว พักกันเถอะ',
  rest:'กำลังพักผ่อน 😴',
  awake:'ตื่นแล้ว! มาเล่นกัน ☀️',
  dancing:'มาเต้นกันเถอะ 🕺',
  gifted:'ของขวัญวันนี้: +15 XP 🎁',
  already:'รับของขวัญวันนี้แล้ว พรุ่งนี้มาใหม่นะ 💜',
  cooldown:'ขอพักสักครู่ 🙂',
  goal:'จับดาว 5 ดวงใน 15 วินาที',
  won:'จับครบแล้ว! +20 XP ✨',
  lost:'เก่งมาก! เล่นอีกไหม ⭐',
  talks:[
   'เพื่อนตัวเล็ก ชอบผจญภัย 🌴',
   'ดื่มน้ำและพักในที่ร่มนะ ☀️',
   'อยู่ด้วยกันสนุกกว่า 💜',
   'ดูฉันขยิบตาสิ 😉'
  ],
  tip:'แตะหรือลูบ OKI เบา ๆ',
  back:'กลับ',score:'ดาว',time:'เวลา'
 }
 };

 const lang=()=>{
  const l=(document.documentElement.lang||'ru').toLowerCase();
  return l.startsWith('en')?'en':l.startsWith('th')?'th':'ru';
 };
 const text=()=>L[lang()];
 const clamp=n=>Math.max(0,Math.min(100,n));

 let s={
  food:82,mood:88,energy:76,xp:0,
  last:Date.now(),sleeping:false,gift:''
 };
 try{
  const v=JSON.parse(localStorage.getItem(KEY)||'{}');
  for(const k of ['food','mood','energy','xp','last']){
   if(Number.isFinite(v[k])&&v[k]>=0)s[k]=v[k];
  }
  s.sleeping=v.sleeping===true;
  s.gift=typeof v.gift==='string'?v.gift:'';
 }catch{}

 let modal=null,pulse=0,animationTimer=0,gameTimer=0;
 let game=null,lastAction=0,previousFocus=null,oldOverflow='';

 const save=()=>{
  try{localStorage.setItem(KEY,JSON.stringify(s))}catch{}
 };

 const tick=()=>{
  const now=Date.now();
  const hours=Math.max(0,Math.min(72,(now-s.last)/36e5));
  s.food=clamp(s.food-hours*1.2);
  s.mood=clamp(s.mood-hours*.55);
  s.energy=clamp(s.energy+hours*(s.sleeping?12:-.75));
  s.last=now;
  save();
 };
 tick();

 const speak=message=>{
  if(modal)modal.querySelector('.oki-speech').textContent=message;
 };

 const update=()=>{
  if(!modal)return;
  const q=text();
  for(const k of ['food','mood','energy']){
   modal.querySelector('[data-value="'+k+'"]').textContent=Math.round(s[k]);
   const bar=modal.querySelector('[data-bar="'+k+'"]');
   bar.style.width=s[k]+'%';
   bar.parentElement.setAttribute('aria-valuenow',Math.round(s[k]));
  }
  modal.querySelector('.oki-level').textContent=
   '✦ '+q.level+' '+(1+Math.floor(s.xp/100))+
   ' · '+s.xp%100+'/100 XP';

  const face=modal.querySelector('.oki-creature');
  face.dataset.mood=s.sleeping?'sleep':
   s.energy<25?'tired':
   s.food<25?'hungry':
   s.mood<35?'sad':'happy';

  modal.querySelector('[data-action="sleep"]').textContent=
   s.sleeping?q.wake:q.sleep;
 };

 const animate=(kind,emoji)=>{
  if(!modal)return;
  const face=modal.querySelector('.oki-creature');
  face.dataset.action=kind;
  modal.querySelector('.oki-reaction').textContent=emoji;
  clearTimeout(animationTimer);
  animationTimer=setTimeout(()=>{
   if(modal){
    face.dataset.action='';
    modal.querySelector('.oki-reaction').textContent='';
   }
  },1800);
 };

 const endGame=won=>{
  clearInterval(gameTimer);
  gameTimer=0;
  game=null;
  if(!modal)return;
  modal.querySelector('.oki-arena').hidden=true;
  modal.querySelector('.oki-actions').hidden=false;
  if(won){
   s.xp+=20;
   s.mood=clamp(s.mood+12);
   s.energy=clamp(s.energy-6);
   save();
   update();
   animate('dance','✨');
  }
  speak(won?text().won:text().lost);
 };

 const moveStar=()=>{
  if(!modal||!game)return;
  const b=modal.querySelector('.oki-star');
  b.style.left=(12+Math.random()*65)+'%';
  b.style.top=(12+Math.random()*57)+'%';
  modal.querySelector('.oki-game-score').textContent=
   text().score+': '+game.score+'/5 · '+
   text().time+': '+game.seconds+'s';
 };

 const startGame=()=>{
  if(game)return;
  game={score:0,seconds:15};
  modal.querySelector('.oki-arena').hidden=false;
  modal.querySelector('.oki-actions').hidden=true;
  speak(text().goal);
  moveStar();
  modal.querySelector('.oki-star').focus();
  gameTimer=setInterval(()=>{
   if(!modal)return;
   game.seconds--;
   if(game.seconds<=0)endGame(false);
   else moveStar();
  },1000);
 };

 const act=action=>{
  if(!modal)return;
  tick();
  const q=text();

  if(action==='back'){
   endGame(false);
   return;
  }
  if(s.sleeping&&action!=='sleep'){
   speak(q.rest);
   return;
  }
  const now=Date.now();
  if(now-lastAction<1800){
   speak(q.cooldown);
   return;
  }
  lastAction=now;

  if(action==='feed'){
   s.food=clamp(s.food+20);
   s.mood=clamp(s.mood+3);
   animate('eat','🍉');
   speak(q.fed);
  }
  if(action==='pet'){
   s.mood=clamp(s.mood+8);
   animate('love','💜');
   speak(q.petted);
  }
  if(action==='sleep'){
   s.sleeping=!s.sleeping;
   speak(s.sleeping?q.rest:q.awake);
   animate('rest',s.sleeping?'💤':'☀️');
  }
  if(action==='dance'){
   if(s.energy<15){
    speak(q.tired);
    return;
   }
   s.energy=clamp(s.energy-4);
   s.mood=clamp(s.mood+7);
   animate('dance','🎵');
   speak(q.dancing);
  }
  if(action==='talk'){
   speak(q.talks[Math.floor(Math.random()*q.talks.length)]);
   animate('wink','💬');
  }
  if(action==='gift'){
   const d=new Date();
   const day=d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate();
   if(s.gift===day){
    speak(q.already);
    return;
   }
   s.gift=day;
   s.xp+=15;
   s.mood=clamp(s.mood+10);
   animate('love','🎁');
   speak(q.gifted);
  }
  if(action==='play'){
   if(s.energy<15){
    speak(q.tired);
    return;
   }
   startGame();
  }
  if(['feed','pet','dance'].includes(action))s.xp+=2;
  save();
  update();
 };

 const close=()=>{
  clearInterval(pulse);
  clearInterval(gameTimer);
  clearTimeout(animationTimer);
  pulse=gameTimer=0;
  game=null;
  modal?.remove();
  modal=null;
  document.body.style.overflow=oldOverflow;
  previousFocus?.focus?.();
 };

 const open=()=>{
  if(modal){
   modal.querySelector('.oki-close').focus();
   return;
  }
  tick();
  const q=text();
  previousFocus=document.activeElement;
  oldOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';

  modal=document.createElement('div');
  modal.id=ID;
  modal.className='on oki-living';
  modal.setAttribute('role','dialog');
  modal.setAttribute('aria-modal','true');
  modal.setAttribute('aria-labelledby','oki-living-title');

  modal.innerHTML=
   '<div class="oki-card">'+
   '<button type="button" class="oki-close" aria-label="'+q.close+'">×</button>'+
   '<div class="oki-title" id="oki-living-title">OKI</div>'+
   '<div class="oki-sub">'+q.sub+'</div>'+
   '<div class="oki-level"></div>'+
   '<button type="button" class="oki-creature" data-action="pet" aria-label="'+q.pet+'">'+
   '<span class="oki-glint"></span>'+
   '<span class="oki-eyes"><i></i><i></i></span>'+
   '<span class="oki-cheek left"></span>'+
   '<span class="oki-cheek right"></span>'+
   '<span class="oki-mouth"></span>'+
   '<span class="oki-reaction" aria-hidden="true"></span>'+
   '</button>'+
   '<div class="oki-touch-tip">'+q.tip+'</div>'+
   '<div class="oki-speech" role="status" aria-live="polite"></div>'+
   '<div class="oki-stats">'+
   ['food','mood','energy'].map(k=>
    '<div class="oki-stat"><span>'+q[k]+'</span>'+
    '<div class="oki-bar" role="progressbar" aria-label="'+q[k]+'" aria-valuemin="0" aria-valuemax="100">'+
    '<div class="oki-fill" data-bar="'+k+'"></div></div>'+
    '<b data-value="'+k+'"></b></div>'
   ).join('')+
   '</div>'+
   '<div class="oki-actions">'+
   ['feed','pet','play','sleep','dance','talk','gift'].map(k=>
    '<button type="button" data-action="'+k+'">'+q[k]+'</button>'
   ).join('')+
   '</div>'+
   '<div class="oki-arena" hidden>'+
   '<div class="oki-game-score" role="status"></div>'+
   '<button type="button" class="oki-star" aria-label="'+q.play+'">⭐</button>'+
   '<button type="button" data-action="back" class="oki-game-back">'+q.back+'</button>'+
   '</div></div>';

  document.body.appendChild(modal);
  modal.querySelector('.oki-close').onclick=close;

  modal.addEventListener('click',e=>{
   if(e.target===modal){
    close();
    return;
   }
   const b=e.target.closest('[data-action]');
   if(b)act(b.dataset.action);
  });

  modal.querySelector('.oki-star').onclick=()=>{
   if(!game)return;
   game.score++;
   if(game.score>=5)endGame(true);
   else moveStar();
  };

  let start=null;
  const face=modal.querySelector('.oki-creature');

  face.addEventListener('pointerdown',e=>{
   start={x:e.clientX,y:e.clientY};
  });
  face.addEventListener('pointerup',e=>{
   if(start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>20)act('pet');
   start=null;
  });
  face.addEventListener('pointermove',e=>{
   if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
   const r=face.getBoundingClientRect();
   face.style.setProperty('--look',
    Math.max(-5,Math.min(5,(e.clientX-r.left-r.width/2)/15))+'px');
  });
  face.addEventListener('pointerleave',()=>{
   face.style.setProperty('--look','0px');
  });

  modal.addEventListener('keydown',e=>{
   if(e.key==='Escape'){
    close();
    return;
   }
   if(e.key==='Tab'){
    const buttons=[...modal.querySelectorAll('button')]
     .filter(b=>!b.closest('[hidden]'));
    const first=buttons[0],last=buttons[buttons.length-1];
    if(e.shiftKey&&document.activeElement===first){
     e.preventDefault();
     last.focus();
    }else if(!e.shiftKey&&document.activeElement===last){
     e.preventDefault();
     first.focus();
    }
   }
  });

  update();
  speak(s.sleeping?q.rest:q.hello);
  modal.querySelector('.oki-close').focus();
  pulse=setInterval(()=>{
   tick();
   update();
  },15000);
 };

 const mark=()=>{
  document.querySelectorAll('#installBtn,#installNow')
   .forEach(b=>b.classList.add('ok-install-v80'));
  document.querySelectorAll('nav.tab button[data-tab="game"]')
   .forEach(b=>{
    b.dataset.oki='1';
    const span=b.querySelector('[data-i="navGame"]');
    if(span&&span.textContent!=='OKI')span.textContent='OKI';
   });
 };
 mark();

 document.addEventListener('click',e=>{
  const b=e.target.closest?.('nav.tab button[data-tab="game"]');
  if(!b)return;
  e.preventDefault();
  e.stopImmediatePropagation();
  open();
 },true);

 new MutationObserver(()=>{
  mark();
  if(modal){
   close();
   open();
  }
 }).observe(document.documentElement,{
  attributes:true,
  attributeFilter:['lang']
 });
})();
</script>`;

 const okiLivingCSS=String.raw`<style id="ok-oki-living-v81">
#okiPetV80.oki-living .oki-card{
 max-width:450px;padding-top:24px;
 overscroll-behavior:contain;
}
.oki-living .oki-level{margin-top:10px}
.oki-living [hidden]{display:none!important}

html body .oki-living button.oki-creature{
 display:block!important;
 position:relative;
 width:150px;height:150px;min-height:150px;
 margin:16px auto 10px;
 padding:0!important;
 border-radius:50%!important;
 border:1px solid #a8f9ff!important;
 background:radial-gradient(circle at 32% 18%,
 #ecffff,#80eafa 18%,#7975ed 48%,#c76eec 75%,#3a296e)!important;
 box-shadow:inset 0 5px 10px #fff9,
 inset 0 -10px 22px #190e5c,
 0 9px 0 #08143c,0 0 28px #28ddff55!important;
 animation:okiBreath 3.5s ease-in-out infinite;
 touch-action:pan-y;
 cursor:pointer;
 overflow:visible;
 color:#151844!important;
}
.oki-glint{
 position:absolute;left:25px;top:12px;
 width:54px;height:24px;
 transform:rotate(-24deg);
 border-radius:50%;background:#fff8;
 filter:blur(2px);pointer-events:none;
}
.oki-eyes{
 position:absolute;top:58px;left:37px;
 display:flex;gap:28px;
 transform:translateX(var(--look,0px));
 pointer-events:none;
}
.oki-eyes i{
 display:block;width:21px;height:28px;
 border-radius:50%;background:#181c48;
 box-shadow:inset 5px 5px 0 -2px #fff;
 animation:okiBlink 6s infinite;
 transform-origin:center;
}
.oki-mouth{
 position:absolute;left:59px;top:100px;
 width:34px;height:17px;
 border:3px solid #30305e;border-top:0;
 border-radius:0 0 24px 24px;
 pointer-events:none;
}
.oki-cheek{
 position:absolute;top:93px;
 width:20px;height:9px;
 border-radius:50%;
 background:#ff78b390;
 pointer-events:none;
}
.oki-cheek.left{left:23px}
.oki-cheek.right{right:23px}
.oki-reaction{
 position:absolute;right:-17px;top:-10px;
 font-size:40px;text-shadow:none;
 pointer-events:none;
}
.oki-touch-tip{
 font-size:11px;color:#bde7ff;margin:7px 0;
}
.oki-speech{
 display:grid;place-items:center;
 min-height:58px;margin:12px 0;padding:11px;
 border-radius:16px;color:#e9f7ff;
 background:#ffffff0d;
 border:1px solid #ffffff24;
 font-size:14px;line-height:1.4;
}
.oki-living .oki-actions{
 grid-template-columns:repeat(2,minmax(0,1fr));
}
.oki-living .oki-actions button{
 min-height:44px;white-space:normal;
}
.oki-living .oki-actions button:last-child{
 grid-column:1/-1;
}
.oki-creature[data-mood="sleep"] .oki-eyes i{
 height:4px;margin-top:15px;
 animation:none;box-shadow:none;
}
.oki-creature[data-mood="sleep"] .oki-mouth{
 width:12px;height:12px;left:69px;
 border:3px solid #30305e;border-radius:50%;
}
.oki-creature:is([data-mood="sad"],[data-mood="hungry"]) .oki-mouth{
 transform:rotate(180deg);
}
.oki-creature[data-mood="tired"] .oki-eyes i{
 height:14px;margin-top:8px;box-shadow:none;
}
.oki-creature[data-action="eat"] .oki-mouth{
 height:22px;border-radius:50%;
 border:0;background:#30305e;
 animation:okiChew .35s infinite;
}
html body .oki-creature[data-action="dance"]{
 animation:okiDance .4s ease-in-out 4!important;
}
.oki-creature[data-action="love"] .oki-cheek{
 background:#ff599ac0;
}
.oki-creature[data-action="wink"] .oki-eyes i:last-child{
 transform:scaleY(.12);animation:none;
}
.oki-arena{
 position:relative;height:220px;
 border-radius:18px;
 background:radial-gradient(ellipse at center,#33416d,#080e29);
 border:1px solid #7adfff55;overflow:hidden;
}
.oki-game-score{
 padding:10px;color:#fff;font-size:13px;
}
html body .oki-arena .oki-star{
 position:absolute;
 width:52px;height:52px;min-height:52px;
 border-radius:50%!important;
 padding:0!important;font-size:26px;
 touch-action:manipulation;
 transition:left .15s,top .15s;
}
.oki-game-back{
 position:absolute;bottom:8px;left:50%;
 transform:translateX(-50%);font-size:12px;
}
@keyframes okiBlink{
 0%,42%,46%,100%{transform:scaleY(1)}
 44%{transform:scaleY(.08)}
}
@keyframes okiBreath{
 50%{transform:translateY(-5px) scale(1.025,1.01)}
}
@keyframes okiDance{
 25%{transform:rotate(-12deg) translateY(-5px)}
 75%{transform:rotate(12deg) translateY(-5px)}
}
@keyframes okiChew{
 50%{transform:scaleY(.4)}
}
@media(max-width:360px){
 .oki-living .oki-card{padding:20px 12px 14px}
 .oki-living .oki-stat{
  grid-template-columns:78px 1fr 30px;
 }
}
@media(prefers-reduced-motion:reduce){
 html body .oki-living *{
  animation:none!important;
  transition:none!important;
 }
}
</style>`;

 for(const name of ["index.html","admin.html"]){
  const path="site/public/"+name;
  let html=readFileSync(path,"utf8");

  const oldOKI=/<script\b[^>]*id="ok-v80-neon-pet-js"[^>]*>[\s\S]*?<\/script>/;

  if(!oldOKI.test(html)){
   throw new Error("OKI script not found in "+name);
  }

  html=html.replace(oldOKI,()=>okiLivingJS);

  if(!html.includes('id="ok-oki-living-v81"')){
   html=html.replace("</head>",()=>okiLivingCSS+"\n</head>");
  }

  writeFileSync(path,html);
 }

 const swPath="site/public/sw.js";
 const build=(
  process.env.CF_PAGES_COMMIT_SHA||
  process.env.COMMIT_REF||
  String(Date.now())
 ).slice(0,12);

 writeFileSync(
  swPath,
  readFileSync(swPath,"utf8").replace(
   /const\s+CACHE\s*=\s*[^;]+;/,
   ()=>'const CACHE = "pattayaok-living-oki-'+build+'";'
  )
 );

 console.log("OKI living update ready");
}


// OKI Life v82: slow growth, care quest, crystal shop and contextual bubbles.
{
 const lifeJS = "/* OKI Life v82: cosmetic-only crystal economy, no payment endpoints. */\n(()=>{\n'use strict';\nconst KEY='oki-life-v1';\nconst L={\nru:{sub:'Твой маленький житель OK-OK',home:'Мой Оки',shop:'Магазин',quest:'Квест',close:'Закрыть',choose:'Познакомимся? Выбери своего Оки',boy:'Мальчик',girl:'Девочка',change:'Изменить образ',food:'Сытость',mood:'Радость',energy:'Энергия',feed:'🍉 Покормить',pet:'💜 Погладить',play:'⭐ Лови звёзды',sleep:'🌙 Отдыхать',wake:'☀️ Разбудить',gift:'🎁 +20 кристаллов',claimed:'Подарок получен',daily:'Подарок за вход: +20 кристаллов 💎',hello:'Привет! Давай дружить 💜',hungry:'Хочу кушать 🍉',invite:'Давай играть! ⭐',candyHint:'Хочу конфетку 🍬',fed:'Ммм, спасибо за угощение! 🍉',petted:'Как приятно! 💜',rest:'Я отдыхаю и набираюсь сил 💤',awake:'Я проснулся! Давай играть ☀️',tired:'Сначала немного отдохнём?',cooldown:'Дай мне пару секунд 🙂',goal:'Поймай 5 звёзд за 15 секунд',won:'Ура, поймали все звёзды! ✨',lost:'Хорошая попытка! Попробуем ещё?',gameReward:'+5 кристаллов за игру 💎',limit:'Сегодня все награды за игру уже получены. Можно играть дальше 💜',back:'Назад',stars:'Звёзды',time:'сек.',crystals:'Кристаллы',growth:'Дни заботы',stages:['Малыш','Ребёнок','Подросток','Взрослый'],paused:'Развитие ждёт заботы. Оки никогда не умирает 💜',growing:'Оки растёт постепенно — один день заботы за день',questTitle:'Ключ от магазина',questSub:'Познакомься с Оки и открой покупки за кристаллы',steps:['Выбрать мальчика или девочку','Покормить Оки','Погладить Оки','Поймать 5 звёзд'],unlock:'🔑 Открыть магазин · +30 💎',unlocked:'Магазин открыт! +30 кристаллов 💎',locked:'Магазин пока закрыт',lockedSub:'Пройди квест «Ключ от магазина» — Оки поможет найти ключ',goQuest:'Начать квест',fruit:'Фруктовая тарелка',fruitSub:'+25 сытости · угощение сразу',candy:'Конфетка',candySub:'+15 радости · угощение сразу',aurora:'Облик «Аврора»',auroraSub:'Мягкое сиреневое свечение',sunset:'Облик «Закат»',sunsetSub:'Розово-золотое свечение',base:'Облик «Неон»',baseSub:'Твой первоначальный облик',buy:'Купить',wear:'Надеть',wearing:'Надето',bought:'Покупка готова! ✨',poor:'Пока не хватает кристаллов. Забери подарок или сыграй ⭐',premium:'Премиальная коллекция',premiumSub:'Особые скины и аксессуары появятся позже',soon:'Скоро · продажи закрыты',reminders:'Облачка Оки',on:'Включены',off:'Выключены',storage:'Не удалось сохранить прогресс. Проверь доступ к хранилищу браузера',local:'Прогресс сохраняется в этом браузере',attention:'Погладь Оки, чтобы поднять настроение',earned:'Награда получена',full:'Я уже сыт! 💜',chooseFirst:'Сначала выбери своего Оки',skin:'Облик',next:'Следующий этап',max:'Дальше — новые приключения',free:'Кормление и отдых бесплатны',collection:'Коллекция',rewardCap:'До 3 наград за игру в день'},\nen:{sub:'Your little OK-OK companion',home:'My Oki',shop:'Shop',quest:'Quest',close:'Close',choose:'Meet your Oki: choose a companion',boy:'Boy',girl:'Girl',change:'Change appearance',food:'Food',mood:'Joy',energy:'Energy',feed:'🍉 Feed',pet:'💜 Pet',play:'⭐ Catch stars',sleep:'🌙 Rest',wake:'☀️ Wake up',gift:'🎁 +20 crystals',claimed:'Gift claimed',daily:'Daily login gift: +20 crystals 💎',hello:'Hi! Let’s be friends 💜',hungry:'I’m hungry 🍉',invite:'Let’s play! ⭐',candyHint:'A little candy, please? 🍬',fed:'Yummy! Thank you 🍉',petted:'That feels lovely! 💜',rest:'Resting and recharging 💤',awake:'I’m awake! Let’s play ☀️',tired:'Let’s rest a little first?',cooldown:'Give me a moment 🙂',goal:'Catch 5 stars in 15 seconds',won:'We caught them all! ✨',lost:'Nice try! Play again?',gameReward:'+5 crystals for playing 💎',limit:'All game rewards claimed today. You can still play 💜',back:'Back',stars:'Stars',time:'sec.',crystals:'Crystals',growth:'Care days',stages:['Baby','Child','Teen','Adult'],paused:'Growth waits for your care. Oki never dies 💜',growing:'Oki grows slowly: one care day per day',questTitle:'The shop key',questSub:'Get to know Oki and unlock the crystal shop',steps:['Choose a boy or girl','Feed Oki','Pet Oki','Catch 5 stars'],unlock:'🔑 Unlock shop · +30 💎',unlocked:'Shop unlocked! +30 crystals 💎',locked:'The shop is still closed',lockedSub:'Complete “The shop key” quest — Oki will help find the key',goQuest:'Start quest',fruit:'Fruit plate',fruitSub:'+25 food · enjoyed right away',candy:'Candy',candySub:'+15 joy · enjoyed right away',aurora:'Aurora look',auroraSub:'Soft violet glow',sunset:'Sunset look',sunsetSub:'Pink and golden glow',base:'Neon look',baseSub:'Your original look',buy:'Buy',wear:'Wear',wearing:'Wearing',bought:'Purchase ready! ✨',poor:'Not enough crystals yet. Claim your gift or play ⭐',premium:'Premium collection',premiumSub:'Special skins and accessories are coming later',soon:'Coming soon · sales closed',reminders:'Oki bubbles',on:'On',off:'Off',storage:'Progress could not be saved. Check browser storage access',local:'Progress is saved in this browser',attention:'Pet Oki to cheer them up',earned:'Reward claimed',full:'I’m already full! 💜',chooseFirst:'Choose your Oki first',skin:'Look',next:'Next stage',max:'More adventures ahead',free:'Feeding and rest are free',collection:'Collection',rewardCap:'Up to 3 game rewards per day'},\nth:{sub:'เพื่อนตัวน้อยของคุณใน OK-OK',home:'โอกิของฉัน',shop:'ร้านค้า',quest:'ภารกิจ',close:'ปิด',choose:'มารู้จักกัน! เลือกโอกิของคุณ',boy:'เด็กชาย',girl:'เด็กหญิง',change:'เปลี่ยนรูปลักษณ์',food:'ความอิ่ม',mood:'ความสุข',energy:'พลังงาน',feed:'🍉 ให้อาหาร',pet:'💜 ลูบหัว',play:'⭐ จับดาว',sleep:'🌙 พักผ่อน',wake:'☀️ ปลุก',gift:'🎁 คริสตัล +20',claimed:'รับของขวัญแล้ว',daily:'ของขวัญประจำวัน: คริสตัล +20 💎',hello:'สวัสดี! มาเป็นเพื่อนกันนะ 💜',hungry:'หิวแล้ว 🍉',invite:'มาเล่นกัน! ⭐',candyHint:'ขอลูกอมหน่อยได้ไหม 🍬',fed:'อร่อยจัง! ขอบคุณ 🍉',petted:'สบายจังเลย! 💜',rest:'กำลังพักผ่อนและเติมพลัง 💤',awake:'ตื่นแล้ว! มาเล่นกัน ☀️',tired:'พักสักหน่อยก่อนไหม?',cooldown:'ขอพักสักครู่ 🙂',goal:'จับดาว 5 ดวงใน 15 วินาที',won:'จับครบแล้ว! ✨',lost:'เก่งมาก! ลองอีกไหม?',gameReward:'เล่นเกมได้รับคริสตัล +5 💎',limit:'รับรางวัลเกมวันนี้ครบแล้ว ยังเล่นต่อได้นะ 💜',back:'กลับ',stars:'ดาว',time:'วินาที',crystals:'คริสตัล',growth:'วันที่ดูแล',stages:['ทารก','เด็ก','วัยรุ่น','ผู้ใหญ่'],paused:'การเติบโตจะรอการดูแล โอกิไม่มีวันตาย 💜',growing:'โอกิเติบโตช้า ๆ ได้วันดูแลวันละหนึ่งวัน',questTitle:'กุญแจร้านค้า',questSub:'ทำความรู้จักโอกิแล้วปลดล็อกร้านคริสตัล',steps:['เลือกเด็กชายหรือเด็กหญิง','ให้อาหารโอกิ','ลูบหัวโอกิ','จับดาว 5 ดวง'],unlock:'🔑 เปิดร้าน · +30 💎',unlocked:'เปิดร้านแล้ว! คริสตัล +30 💎',locked:'ร้านค้ายังปิดอยู่',lockedSub:'ทำภารกิจ “กุญแจร้านค้า” โอกิจะช่วยหากุญแจ',goQuest:'เริ่มภารกิจ',fruit:'จานผลไม้',fruitSub:'ความอิ่ม +25 · กินทันที',candy:'ลูกอม',candySub:'ความสุข +15 · กินทันที',aurora:'รูปลักษณ์ออโรรา',auroraSub:'แสงสีม่วงอ่อน',sunset:'รูปลักษณ์อาทิตย์ตก',sunsetSub:'แสงสีชมพูและทอง',base:'รูปลักษณ์นีออน',baseSub:'รูปลักษณ์เริ่มต้น',buy:'ซื้อ',wear:'สวมใส่',wearing:'สวมใส่อยู่',bought:'ซื้อเรียบร้อย! ✨',poor:'คริสตัลยังไม่พอ รับของขวัญหรือเล่นเกมนะ ⭐',premium:'คอลเลกชันพรีเมียม',premiumSub:'สกินและเครื่องประดับพิเศษจะมาในภายหลัง',soon:'เร็ว ๆ นี้ · ยังไม่เปิดขาย',reminders:'กล่องข้อความโอกิ',on:'เปิด',off:'ปิด',storage:'บันทึกความคืบหน้าไม่ได้ กรุณาตรวจสอบพื้นที่เก็บข้อมูลของเบราว์เซอร์',local:'บันทึกความคืบหน้าในเบราว์เซอร์นี้',attention:'ลูบหัวโอกิเพื่อเพิ่มความสุข',earned:'รับรางวัลแล้ว',full:'อิ่มแล้วนะ! 💜',chooseFirst:'เลือกโอกิก่อนนะ',skin:'รูปลักษณ์',next:'ช่วงวัยถัดไป',max:'การผจญภัยยังมีอีกมาก',free:'ให้อาหารและพักผ่อนฟรี',collection:'คอลเลกชัน',rewardCap:'รับรางวัลเกมได้สูงสุดวันละ 3 ครั้ง'}\n};\nconst clamp=n=>Math.max(0,Math.min(100,n));\nconst lang=()=>/^th/i.test(document.documentElement.lang)?'th':/^en/i.test(document.documentElement.lang)?'en':'ru';\nconst t=()=>L[lang()];\nconst day=()=>new Date().toISOString().slice(0,10);\nlet state={version:1,food:82,mood:88,energy:76,xp:0,last:Date.now(),sleeping:false,gender:'',crystals:0,giftDay:'',careDays:0,careDay:'',quest:{feed:false,pet:false,play:false},shopUnlocked:false,owned:['neon'],skin:'neon',gameDay:'',gameRewards:0,reminders:true,nextReminder:0};\nfunction load(){\ntry{\n const raw=localStorage.getItem(KEY);const v=JSON.parse(raw||localStorage.getItem('oki-v80')||'{}');\n for(const k of ['food','mood','energy'])if(Number.isFinite(v[k]))state[k]=clamp(v[k]);\n if(Number.isFinite(v.xp)&&v.xp>=0)state.xp=Math.min(v.xp,1e6);\n if(Number.isFinite(v.last)&&v.last>0)state.last=Math.min(v.last,Date.now());\n state.sleeping=v.sleeping===true;\n if(raw){\n  for(const k of ['crystals','careDays','gameRewards','nextReminder'])if(Number.isFinite(v[k])&&v[k]>=0)state[k]=Math.min(v[k],k==='careDays'?365:1e6);\n  for(const k of ['giftDay','careDay','gameDay'])if(typeof v[k]==='string')state[k]=v[k];\n  state.gender=['boy','girl'].includes(v.gender)?v.gender:'';\n  state.quest={feed:v.quest?.feed===true,pet:v.quest?.pet===true,play:v.quest?.play===true};\n  state.shopUnlocked=v.shopUnlocked===true;state.owned=['neon',...['aurora','sunset'].filter(k=>v.owned?.includes(k))];\n  state.skin=state.owned.includes(v.skin)?v.skin:'neon';state.reminders=v.reminders!==false;\n  if(Number.isFinite(v.nextReminder))state.nextReminder=Math.min(v.nextReminder,Date.now()+864e5);\n }\n}catch{}\n}\nlet saveFailed=false;\nfunction save(){try{localStorage.setItem(KEY,JSON.stringify(state));saveFailed=false;}catch{saveFailed=true;}}\nfunction tick(){const now=Date.now(),hours=Math.max(0,Math.min(72,(now-state.last)/36e5));state.food=clamp(state.food-hours*1.2);state.mood=clamp(state.mood-hours*.55);state.energy=clamp(state.energy+hours*(state.sleeping?12:-.75));state.last=now;save();}\nfunction care(){if(state.gender&&state.food>=30&&state.mood>=30&&!state.sleeping&&state.careDay!==day()){state.careDay=day();state.careDays=Math.min(365,state.careDays+1);}}\nfunction claimGift(){if(state.giftDay===day())return false;state.giftDay=day();state.crystals+=20;save();return true;}\nfunction rewardGame(){if(state.gameDay!==day()){state.gameDay=day();state.gameRewards=0;}if(state.gameRewards>=3)return false;state.gameRewards++;state.crystals+=5;return true;}\nconst stage=()=>state.careDays>=365?3:state.careDays>=180?2:state.careDays>=90?1:0;\nconst ready=()=>!!state.gender&&state.quest.feed&&state.quest.pet&&state.quest.play;\nconst items=[{id:'fruit',price:8,emoji:'🍇'},{id:'candy',price:12,emoji:'🍬'},{id:'neon',price:0,emoji:'🩵',label:'base'},{id:'aurora',price:80,emoji:'💜'},{id:'sunset',price:120,emoji:'🌅'}];\nlet modal=null,tab='home',game=null,gameTimer=0,pulse=0,lastAction=0,previousFocus=null,oldOverflow='',messageKey='hello',messageExtra='',bubble=null,bubbleTimer=0,reminderCount=0,animateTimer=0,lastBuy=0;\nfunction avatar(gender=state.gender||'boy',small=false){\n const age=stage(),head=age===0?1.06:age===1?1:age===2?.94:.9,body=age===0?.78:age===1?.9:1;\n return `<svg class=\"ol-avatar\" viewBox=\"0 0 240 300\" aria-hidden=\"true\" focusable=\"false\"><defs><radialGradient id=\"ol-glass-${gender}-${small}\" cx=\"28%\" cy=\"15%\" r=\"90%\"><stop stop-color=\"#ffffff\" stop-opacity=\".65\"/><stop offset=\".25\" stop-color=\"var(--ol-color)\" stop-opacity=\".22\"/><stop offset=\"1\" stop-color=\"var(--ol-color)\" stop-opacity=\".55\"/></radialGradient></defs><ellipse cx=\"120\" cy=\"285\" rx=\"62\" ry=\"9\" fill=\"var(--ol-color)\" opacity=\".18\"/><g class=\"ol-body\" transform=\"translate(120 159) scale(${body}) translate(-120 -159)\" fill=\"url(#ol-glass-${gender}-${small})\" stroke=\"var(--ol-color)\" stroke-width=\"3\"><rect x=\"91\" y=\"149\" width=\"58\" height=\"68\" rx=\"27\"/><path d=\"M95 166Q75 174 60 156M145 166Q163 162 175 145\" fill=\"none\" stroke-width=\"17\" stroke-linecap=\"round\"/><path d=\"M108 215L99 263M133 215L145 263\" stroke-width=\"18\" stroke-linecap=\"round\"/><ellipse cx=\"95\" cy=\"271\" rx=\"21\" ry=\"10\"/><ellipse cx=\"149\" cy=\"271\" rx=\"21\" ry=\"10\"/><circle cx=\"60\" cy=\"151\" r=\"13\"/><g class=\"ol-wave\"><circle cx=\"178\" cy=\"138\" r=\"13\"/><path d=\"M169 128l-6-11M179 125l-1-14M187 128l5-11\" stroke-linecap=\"round\" stroke-width=\"5\"/></g><circle cx=\"120\" cy=\"180\" r=\"10\" fill=\"var(--ol-accent)\" stroke=\"#fff\" stroke-width=\"1\" opacity=\".8\"/><text x=\"120\" y=\"202\" fill=\"#fff\" stroke=\"none\" text-anchor=\"middle\" font-size=\"11\" font-weight=\"800\">OK</text></g><g class=\"ol-head\" transform=\"translate(120 94) scale(${head}) translate(-120 -94)\"><g fill=\"url(#ol-glass-${gender}-${small})\" stroke=\"var(--ol-accent)\" stroke-width=\"3\">${gender==='girl'?'<path d=\"M56 108Q42 26 119 22Q195 22 184 108L164 133H76Z\"/>':''}<circle cx=\"60\" cy=\"96\" r=\"12\"/><circle cx=\"180\" cy=\"96\" r=\"12\"/><circle cx=\"120\" cy=\"87\" r=\"58\"/><path d=\"M113 35Q148 10 129 14Q128 33 106 27\" fill=\"none\" stroke-width=\"9\" stroke-linecap=\"round\"/></g><path d=\"M78 53Q93 34 112 38\" stroke=\"#fff\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\" opacity=\".7\"/><g class=\"ol-eyes\" fill=\"#fff\"><ellipse cx=\"98\" cy=\"82\" rx=\"15\" ry=\"19\"/><ellipse cx=\"143\" cy=\"82\" rx=\"15\" ry=\"19\"/><g fill=\"#16375b\"><ellipse cx=\"100\" cy=\"85\" rx=\"8\" ry=\"12\"/><ellipse cx=\"141\" cy=\"85\" rx=\"8\" ry=\"12\"/></g><g fill=\"#fff\"><circle cx=\"102\" cy=\"80\" r=\"3\"/><circle cx=\"143\" cy=\"80\" r=\"3\"/></g></g><ellipse cx=\"82\" cy=\"105\" rx=\"13\" ry=\"6\" fill=\"var(--ol-accent)\" opacity=\".7\"/><ellipse cx=\"157\" cy=\"105\" rx=\"13\" ry=\"6\" fill=\"var(--ol-accent)\" opacity=\".7\"/><circle cx=\"120\" cy=\"100\" r=\"7\" fill=\"var(--ol-accent)\"/><path class=\"ol-mouth\" d=\"M101 115Q120 134 139 115\" fill=\"none\" stroke=\"#fff\" stroke-width=\"4\" stroke-linecap=\"round\"/></g></svg>`;\n}\nfunction say(key,extra=''){messageKey=key;messageExtra=extra;const el=modal?.querySelector('.ol-speech');if(el)el.textContent=t()[key]+(extra?' '+(t()[extra]||extra):'');}\nfunction mood(){return state.sleeping?'sleep':state.food<30?'hungry':state.energy<25?'tired':state.mood<35?'quiet':'happy';}\nfunction update(){if(!modal)return;const q=t();modal.dataset.mood=mood();modal.dataset.skin=state.skin;const balance=modal.querySelector('.ol-balance');if(balance)balance.textContent='💎 '+state.crystals+' · '+q.crystals;\n for(const k of ['food','mood','energy']){const bar=modal.querySelector('[data-stat=\"'+k+'\"]');if(bar){bar.style.width=Math.round(state[k])+'%';bar.parentElement.setAttribute('aria-valuenow',Math.round(state[k]));modal.querySelector('[data-value=\"'+k+'\"]').textContent=Math.round(state[k]);}}\n const status=modal.querySelector('.ol-growth');if(status)status.textContent=q.stages[stage()]+' · '+q.growth+': '+state.careDays+'/365';\n const sleep=modal.querySelector('[data-do=\"sleep\"]');if(sleep)sleep.textContent=state.sleeping?q.wake:q.sleep;\n const note=modal.querySelector('.ol-note');if(note)note.textContent=saveFailed?q.storage:q.local;\n const gift=modal.querySelector('[data-do=\"gift\"]');if(gift){gift.textContent=state.giftDay===day()?q.claimed:q.gift;gift.disabled=state.giftDay===day();}\n}\nfunction reaction(kind){const a=modal?.querySelector('.ol-avatar');if(!a)return;a.dataset.reaction=kind;clearTimeout(animateTimer);animateTimer=setTimeout(()=>{if(a)a.dataset.reaction='';},1400);}\nfunction render(){if(!modal)return;const active=modal.contains(document.activeElement)?document.activeElement:null;const focusAttr=['data-do','data-buy','data-tab-oki','data-gender'].find(k=>active?.hasAttribute(k));const focusValue=focusAttr?active.getAttribute(focusAttr):null;const scrollTop=modal.dataset.tab===tab?(modal.querySelector('.ol-card')?.scrollTop||0):0;modal.dataset.tab=tab;const q=t();const selected=!!state.gender;\n let body='';\n if(tab==='home'){\n body=(!selected?'<h3>'+q.choose+'</h3><div class=\"ol-choices\">'+['boy','girl'].map(g=>'<button type=\"button\" data-gender=\"'+g+'\">'+avatar(g,true)+'<b>'+q[g]+'</b></button>').join('')+'</div>':'<button type=\"button\" class=\"ol-pet\" data-do=\"pet\" aria-label=\"'+q.pet+'\">'+avatar()+'</button><button type=\"button\" class=\"ol-change\" data-do=\"change\">'+q.change+'</button>')+\n '<div class=\"ol-speech\" role=\"status\" aria-live=\"polite\"></div><div class=\"ol-growth\"></div><p class=\"ol-growth-tip\">'+(state.food<30||state.mood<30?q.paused:q.growing)+'</p>'+['food','mood','energy'].map(k=>'<div class=\"ol-stat\"><span>'+q[k]+'</span><div role=\"progressbar\" aria-label=\"'+q[k]+'\" aria-valuemin=\"0\" aria-valuemax=\"100\"><i data-stat=\"'+k+'\"></i></div><b data-value=\"'+k+'\"></b></div>').join('')+\n '<div class=\"ol-actions\">'+['feed','pet','play','sleep','gift'].map(k=>'<button type=\"button\" data-do=\"'+k+'\" '+(!selected?'disabled':'')+'>'+q[k]+'</button>').join('')+'</div><p class=\"ol-fine\">'+q.free+'</p>'+\n '<button type=\"button\" class=\"ol-toggle\" data-do=\"reminders\" aria-pressed=\"'+state.reminders+'\">'+q.reminders+': '+(state.reminders?q.on:q.off)+'</button>';\n }else if(tab==='quest'){\n body='<div class=\"ol-key\">🔑</div><h3>'+q.questTitle+'</h3><p>'+q.questSub+'</p><ul class=\"ol-quests\">'+[!!state.gender,state.quest.feed,state.quest.pet,state.quest.play].map((done,i)=>'<li class=\"'+(done?'done':'')+'\"><span>'+(done?'✅':'○')+'</span>'+q.steps[i]+'</li>').join('')+'</ul>'+(state.shopUnlocked?'<p class=\"ol-success\">'+q.unlocked+'</p><button type=\"button\" data-tab-oki=\"shop\">'+q.shop+'</button>':'<button type=\"button\" data-do=\"unlock\" '+(!ready()?'disabled':'')+'>'+q.unlock+'</button><button type=\"button\" data-tab-oki=\"home\">'+q.home+'</button>')+'<div class=\"ol-speech\" role=\"status\" aria-live=\"polite\"></div>';\n }else{\n body=state.shopUnlocked?'<h3>💎 '+q.collection+'</h3><div class=\"ol-products\">'+items.map(item=>{const label=item.label||item.id,owned=state.owned.includes(item.id),skin=['neon','aurora','sunset'].includes(item.id);return '<article><div class=\"ol-product-icon\" data-swatch=\"'+item.id+'\">'+item.emoji+'</div><h4>'+q[label]+'</h4><p>'+q[label+'Sub']+'</p><button type=\"button\" data-buy=\"'+item.id+'\" '+(skin&&state.skin===item.id?'disabled':'')+'>'+(skin&&state.skin===item.id?q.wearing:owned?q.wear:q.buy+' · '+item.price+' 💎')+'</button></article>';}).join('')+'</div>':'<div class=\"ol-key\">🔒</div><h3>'+q.locked+'</h3><p>'+q.lockedSub+'</p><button type=\"button\" data-tab-oki=\"quest\">'+q.goQuest+'</button>';\n body+='<div class=\"ol-speech\" role=\"status\" aria-live=\"polite\"></div><section class=\"ol-premium\"><div>✦</div><h3>'+q.premium+'</h3><p>'+q.premiumSub+'</p><div class=\"ol-premium-preview\" aria-hidden=\"true\">🌌 🪽 👑</div><span>'+q.soon+'</span></section>';\n }\n modal.innerHTML='<section class=\"ol-card\"><header><div><h2 id=\"ol-title\">OKI</h2><p>'+q.sub+'</p></div><button type=\"button\" class=\"ol-close\" data-do=\"close\" aria-label=\"'+q.close+'\">×</button></header><div class=\"ol-balance\"></div><nav class=\"ol-tabs\" aria-label=\"OKI\">'+['home','quest','shop'].map(k=>'<button type=\"button\" data-tab-oki=\"'+k+'\" aria-pressed=\"'+(tab===k)+'\">'+(k==='shop'&&!state.shopUnlocked?'🔒 ':'')+q[k]+'</button>').join('')+'</nav><div class=\"ol-content\">'+body+'</div><div class=\"ol-arena\" '+(!game?'hidden':'')+'><div class=\"ol-score\" role=\"status\"></div><button type=\"button\" class=\"ol-star\" data-do=\"star\" aria-label=\"'+q.play+'\">⭐</button><button type=\"button\" class=\"ol-back\" data-do=\"back\">'+q.back+'</button><p>'+q.rewardCap+'</p></div><p class=\"ol-note\"></p></section>';\n if(game){modal.querySelector('.ol-content').hidden=true;moveStar();}\n update();say(messageKey,messageExtra);modal.querySelector('.ol-card').scrollTop=scrollTop;if(focusAttr){const next=modal.querySelector('['+focusAttr+'=\"'+focusValue+'\"]');(next&&!next.disabled?next:modal.querySelector('.ol-close')).focus({preventScroll:true});}\n}\nfunction buy(id){if(Date.now()-lastBuy<1000){say('cooldown');return;}const item=items.find(i=>i.id===id);if(!item||!state.shopUnlocked)return;if(state.sleeping&&['fruit','candy'].includes(id)){say('rest');return;}const owned=state.owned.includes(id);if(!owned&&state.crystals<item.price){say('poor');return;}lastBuy=Date.now();if(!owned)state.crystals-=item.price;\n if(id==='fruit'){state.food=clamp(state.food+25);state.quest.feed=true;care();}\n else if(id==='candy'){state.food=clamp(state.food+5);state.mood=clamp(state.mood+15);care();}\n else{if(!owned)state.owned.push(id);state.skin=id;}\n save();messageKey='bought';messageExtra='';render();\n}\nfunction endGame(won){clearInterval(gameTimer);gameTimer=0;game=null;if(won){state.quest.play=true;state.mood=clamp(state.mood+12);state.energy=clamp(state.energy-6);state.xp+=20;care();const rewarded=rewardGame();messageKey='won';messageExtra=rewarded?'gameReward':'limit';save();}else{messageKey='lost';messageExtra='';}render();modal?.querySelector('[data-do=\"play\"]')?.focus();}\nfunction moveStar(){if(!game||!modal)return;const star=modal.querySelector('.ol-star');star.style.left=(8+Math.random()*65)+'%';star.style.top=(23+Math.random()*28)+'%';modal.querySelector('.ol-score').textContent=t().stars+': '+game.score+'/5 · '+Math.max(0,Math.ceil((game.deadline-Date.now())/1000))+' '+t().time;}\nfunction startGame(){if(game)return;game={score:0,deadline:Date.now()+15000};messageKey='goal';messageExtra='';render();modal.querySelector('.ol-star').focus();gameTimer=setInterval(()=>{if(Date.now()>=game.deadline)endGame(false);else moveStar();},1000);}\nfunction act(action){if(action==='close'){close();return;}if(action==='star'){if(!game)return;if(Date.now()>=game.deadline){endGame(false);return;}game.score++;if(game.score>=5)endGame(true);else moveStar();return;}\n if(action==='back'){endGame(false);return;}if(action==='reminders'){state.reminders=!state.reminders;hideBubble();save();render();return;}if(action==='change'){state.gender='';save();render();return;}\n if(action==='unlock'){if(ready()&&!state.shopUnlocked){state.shopUnlocked=true;state.crystals+=30;save();tab='shop';messageKey='unlocked';messageExtra='';render();}return;}\n if(!state.gender){say('chooseFirst');return;}tick();if(state.sleeping&&action!=='sleep'){say('rest');return;}\n if(Date.now()-lastAction<1500){say('cooldown');return;}lastAction=Date.now();\n if(action==='feed'){state.food=clamp(state.food+20);state.mood=clamp(state.mood+3);state.quest.feed=true;care();say('fed');reaction('eat');}\n if(action==='pet'){state.mood=clamp(state.mood+8);state.quest.pet=true;care();say('petted');reaction('love');}\n if(action==='sleep'){state.sleeping=!state.sleeping;say(state.sleeping?'rest':'awake');}\n if(action==='gift'){say(claimGift()?'daily':'claimed');}\n if(action==='play'){if(state.energy<15){say('tired');return;}startGame();}\n save();update();\n}\nfunction close(){if(!modal)return;clearInterval(pulse);clearInterval(gameTimer);clearTimeout(animateTimer);gameTimer=pulse=0;game=null;modal.remove();modal=null;document.body.style.overflow=oldOverflow;previousFocus?.focus?.();}\nfunction open(){hideBubble();if(modal)return;tick();tab='home';previousFocus=document.activeElement;oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';messageKey=claimGift()?'daily':state.sleeping?'rest':'hello';messageExtra='';modal=document.createElement('div');modal.id='okiLife';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','ol-title');document.body.appendChild(modal);render();modal.querySelector('.ol-close').focus();\n modal.addEventListener('click',e=>{if(e.target===modal){close();return;}const b=e.target.closest('button');if(!b||b.disabled)return;if(b.dataset.gender){state.gender=b.dataset.gender;care();save();messageKey='hello';messageExtra='';render();modal.querySelector('[data-do=\"feed\"]')?.focus();}else if(b.dataset.tabOki){if(game){clearInterval(gameTimer);game=null;gameTimer=0;}tab=b.dataset.tabOki;messageKey='hello';messageExtra='';render();modal.querySelector('[data-tab-oki=\"'+tab+'\"]')?.focus();}else if(b.dataset.buy){buy(b.dataset.buy);}else if(b.dataset.do)act(b.dataset.do);});\n modal.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();return;}if(e.key==='Tab'){const buttons=[...modal.querySelectorAll('button:not(:disabled)')].filter(b=>b.getClientRects().length);const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}});\n pulse=setInterval(()=>{tick();update();},15000);\n}\nfunction hideBubble(){clearTimeout(bubbleTimer);bubble?.remove();bubble=null;}\nfunction positionBubble(){const b=document.querySelector('nav.tab button[data-tab=\"game\"]');if(!bubble||!b)return;const r=b.getBoundingClientRect(),width=Math.min(240,window.innerWidth-24);bubble.style.width=width+'px';bubble.style.left=Math.max(12,Math.min(window.innerWidth-width-12,r.left+r.width/2-width/2))+'px';bubble.style.bottom=Math.max(14,window.innerHeight-r.top+10)+'px';}\nfunction remind(){if(modal||bubble||!state.reminders||document.hidden||reminderCount>=3||Date.now()<state.nextReminder)return;const b=document.querySelector('nav.tab button[data-tab=\"game\"]');if(!b||!b.getClientRects().length)return;\n if([...document.querySelectorAll('[role=\"dialog\"],.modal.on,.overlay.on,.lang-overlay.on,.install-overlay.on')].some(el=>el.getClientRects().length))return;\n tick();const key=!state.gender?'hello':state.sleeping?'rest':state.food<30?'hungry':state.mood<45?'attention':reminderCount%2?'candyHint':'invite';\n bubble=document.createElement('div');bubble.id='okiBubble';bubble.innerHTML='<button type=\"button\" class=\"ol-bubble-open\"></button><button type=\"button\" class=\"ol-bubble-close\" aria-label=\"'+t().close+'\">×</button>';bubble.querySelector('.ol-bubble-open').textContent=t()[key];bubble.dataset.key=key;document.body.appendChild(bubble);positionBubble();bubble.querySelector('.ol-bubble-open').onclick=open;bubble.querySelector('.ol-bubble-close').onclick=()=>{state.nextReminder=Date.now()+600000;save();hideBubble();};reminderCount++;state.nextReminder=Date.now()+120000;save();bubbleTimer=setTimeout(hideBubble,8000);\n}\nfunction mark(){document.querySelectorAll('#installBtn,#installNow').forEach(b=>b.classList.add('ok-install-v80'));document.querySelectorAll('nav.tab button[data-tab=\"game\"]').forEach(b=>{b.dataset.oki='1';const label=b.querySelector('[data-i=\"navGame\"]');if(label&&label.textContent!=='OKI')label.textContent='OKI';});}\nload();tick();mark();\ndocument.addEventListener('click',e=>{const b=e.target.closest?.('nav.tab button[data-tab=\"game\"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();open();},true);\nnew MutationObserver(()=>{mark();if(modal)render();if(bubble){bubble.querySelector('.ol-bubble-open').textContent=t()[bubble.dataset.key];bubble.querySelector('.ol-bubble-close').setAttribute('aria-label',t().close);}}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});\naddEventListener('resize',positionBubble);addEventListener('scroll',positionBubble,{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden){hideBubble();if(game)endGame(false);}else{tick();update();}});\nsetTimeout(remind,12000);setInterval(remind,30000);\n})();\n";
 const lifeCSS = "/* Scoped styles: the site's five-button navigation remains intact. */\n#okiLife{--ol-color:#55e5ff;--ol-accent:#ff82d3;position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:12px;background:#080e2ee8;color:#f6f4ff;overscroll-behavior:contain;font-family:Manrope,system-ui,sans-serif}\n#okiLife *{box-sizing:border-box}\n#okiLife .ol-card{width:min(100%,460px);max-height:calc(100dvh - 24px);overflow:auto;overscroll-behavior:contain;border:1px solid #a797ff80;border-radius:28px;padding:20px;background:radial-gradient(ellipse at 50% 25%,#67378655,transparent 48%),linear-gradient(160deg,#162745,#211739);box-shadow:0 24px 80px #0008,inset 0 1px #ffffff40;text-align:center;scrollbar-width:thin}\n#okiLife header{display:flex;align-items:start;text-align:left;justify-content:space-between;gap:8px}\n#okiLife h2{font-size:28px;margin:0;color:#fff;letter-spacing:.05em}\n#okiLife h3{font-size:18px;margin:16px 0 8px;color:#fff}\n#okiLife h4{font-size:14px;margin:6px 0;color:#fff}\n#okiLife p{font-size:13px;line-height:1.6;color:#d4d9ed;margin:6px 0 12px}\nhtml body #okiLife button{min-height:44px!important;min-width:0!important;padding:10px 12px!important;border-radius:15px!important;font:700 13px/1.4 Manrope,system-ui,sans-serif!important;white-space:normal;color:#f8f5ff!important;border:1px solid #9bafff85!important;background:linear-gradient(165deg,#596d94,#33425f)!important;box-shadow:0 3px 0 #172139,inset 0 1px #ffffff60!important;text-shadow:none;cursor:pointer;touch-action:manipulation}\nhtml body #okiLife button[aria-pressed=\"true\"]{background:linear-gradient(150deg,#9972d1,#535a9b)!important;border-color:#d8c4ff!important}\nhtml body #okiLife button:focus-visible,html body #okiBubble button:focus-visible{outline:3px solid #64e3ff!important;outline-offset:3px}\nhtml body #okiLife button:disabled{opacity:.6!important;cursor:default}\nhtml body #okiLife .ol-close{width:44px!important;height:44px!important;flex:none;font-size:24px!important;padding:0!important}\n#okiLife .ol-balance{margin:12px 0;font-size:15px;font-weight:800;color:#bdf3ff;background:#06112265;border:1px solid #70d4ff50;border-radius:14px;padding:9px}\n#okiLife .ol-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0}\n#okiLife .ol-choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}\n#okiLife .ol-choices svg{height:185px;width:100%;display:block}\n#okiLife .ol-choices b{display:block}\nhtml body #okiLife .ol-pet{display:block;width:210px;height:255px;margin:0 auto;padding:0!important;background:none!important;border:0!important;box-shadow:none!important;overflow:visible!important}\n#okiLife .ol-avatar{width:100%;height:100%;overflow:visible;filter:drop-shadow(0 0 7px color-mix(in srgb,var(--ol-color) 40%,transparent));animation:olFloat 4s ease-in-out infinite;transform-origin:50% 80%}\n#okiLife .ol-eyes{transform-origin:50% 82px;animation:olBlink 6s infinite}\n#okiLife .ol-wave{transform-origin:178px 150px;animation:olWave 7s ease-in-out infinite}\n#okiLife[data-skin=\"aurora\"]{--ol-color:#b69aff;--ol-accent:#e6a5ff}\n#okiLife[data-skin=\"sunset\"]{--ol-color:#ffb971;--ol-accent:#ff8dba}\n#okiLife[data-mood=\"hungry\"],#okiLife[data-mood=\"quiet\"]{--ol-color:#a8b7ed;--ol-accent:#c9b3ff}\n#okiLife[data-mood=\"tired\"],#okiLife[data-mood=\"sleep\"]{--ol-color:#82b5d7;--ol-accent:#a9a6db}\n#okiLife[data-mood=\"sleep\"] .ol-eyes{transform:scaleY(.1);animation:none}\n#okiLife[data-mood=\"sleep\"] .ol-avatar{opacity:.75}\n#okiLife .ol-avatar[data-reaction=\"love\"]{filter:drop-shadow(0 0 16px #ffa0ef);transform:scale(1.04)}\n#okiLife .ol-avatar[data-reaction=\"eat\"] .ol-mouth{animation:olChew .35s 4;transform-origin:120px 120px}\nhtml body #okiLife .ol-change{min-height:32px!important;padding:5px 10px!important;background:transparent!important;box-shadow:none!important;font-size:11px!important}\n#okiLife .ol-speech{min-height:48px;margin:12px 0;padding:10px 12px;background:#ffffff0c;border:1px solid #ffffff25;border-radius:16px;font-size:13px;line-height:1.5;color:#f5edff}\n#okiLife .ol-growth{font-weight:800;font-size:13px;color:#e7cdfb}\n#okiLife .ol-growth-tip{font-size:11px;line-height:1.45;margin:5px 0 14px}\n#okiLife .ol-stat{display:grid;grid-template-columns:86px minmax(0,1fr) 30px;gap:8px;align-items:center;text-align:left;margin:8px 0;font-size:12px}\n#okiLife .ol-stat>div{height:10px;background:#020a22;border:1px solid #ffffff30;border-radius:20px;overflow:hidden}\n#okiLife .ol-stat i{display:block;height:100%;background:linear-gradient(90deg,#45dfff,#b096ff);border-radius:inherit;transition:width .2s}\n#okiLife .ol-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:16px 0 8px}\n#okiLife .ol-actions button:last-child{grid-column:1/-1}\n#okiLife .ol-note,#okiLife .ol-fine{font-size:10px;color:#b2c1dc;margin-top:12px}\n#okiLife .ol-toggle{font-size:11px!important;width:100%}\n#okiLife .ol-key{font-size:52px;margin:20px 0 8px}\n#okiLife .ol-quests{list-style:none;padding:0;text-align:left;margin:20px 0;display:grid;gap:10px}\n#okiLife .ol-quests li{display:flex;gap:10px;align-items:center;font-size:13px;padding:12px;background:#ffffff09;border:1px solid #ffffff25;border-radius:14px}\n#okiLife .ol-quests li.done{border-color:#64e8c775;background:#38b39715}\n#okiLife .ol-success{color:#8bf8d1}\n#okiLife .ol-products{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}\n#okiLife .ol-products article{border:1px solid #afc5ff45;border-radius:18px;padding:12px;background:#ffffff08;display:flex;flex-direction:column;align-items:stretch}\n#okiLife .ol-product-icon{font-size:35px;margin:5px 0}\n#okiLife .ol-products p{font-size:11px;flex:1}\n#okiLife .ol-products button{font-size:12px!important;padding:9px 5px!important}\n#okiLife .ol-premium{margin-top:18px;padding:18px;border:1px dashed #b294dd70;border-radius:20px;background:linear-gradient(145deg,#ad65df18,#647fe418)}\n#okiLife .ol-premium>div:first-child{font-size:35px;color:#c7b4ff}\n#okiLife .ol-premium-preview{font-size:30px;letter-spacing:12px;margin:12px 0;opacity:.55}\n#okiLife .ol-premium span{display:block;font-size:12px;border-radius:12px;background:#0003;padding:8px;color:#d4c5f1}\n#okiLife .ol-arena{height:270px;position:relative;margin-top:15px;background:radial-gradient(ellipse,#394a8550,#061124);border:1px solid #909fce60;border-radius:20px;overflow:hidden}\n#okiLife .ol-score{position:absolute;inset:12px 5px auto;font-size:14px;color:#fff}\nhtml body #okiLife .ol-star{position:absolute;width:54px;height:54px;font-size:27px!important;transition:none!important;padding:5px!important}\n#okiLife .ol-back{position:absolute;bottom:35px;left:12px;right:12px}\n#okiLife .ol-arena p{position:absolute;bottom:3px;left:5px;right:5px;font-size:10px;margin:0}\n#okiLife [hidden]{display:none!important}\n#okiBubble{position:fixed;z-index:2147482000;display:flex;gap:4px;align-items:center;padding:8px;border:1px solid #b6a3ff;border-radius:17px;background:linear-gradient(150deg,#30385d,#473065);color:#fff;box-shadow:0 8px 28px #0005;font-family:Manrope,system-ui,sans-serif}\n#okiBubble::after{content:\"\";position:absolute;bottom:-6px;left:50%;width:11px;height:11px;background:#413363;transform:rotate(45deg);border-right:1px solid #b6a3ff;border-bottom:1px solid #b6a3ff}\nhtml body #okiBubble button{min-width:0;min-height:36px!important;margin:0!important;padding:5px!important;color:#fff!important;border:0!important;background:transparent!important;box-shadow:none!important;text-shadow:none;font:700 12px/1.4 Manrope,system-ui,sans-serif!important;border-radius:8px!important;touch-action:manipulation}\n#okiBubble .ol-bubble-open{flex:1;text-align:left}\nhtml body #okiBubble .ol-bubble-close{flex:none;width:36px;height:36px;font-size:20px!important}\nhtml[data-theme=\"light\"] #okiLife .ol-card{background:radial-gradient(ellipse at 50% 20%,#e4befe99,transparent 50%),linear-gradient(160deg,#ecf6ff,#eee5fb);color:#293653;box-shadow:0 20px 70px #24396150}\nhtml[data-theme=\"light\"] #okiLife :is(h2,h3,h4,.ol-growth,.ol-speech,.ol-score){color:#293653}\nhtml[data-theme=\"light\"] #okiLife p{color:#4b5f7c}\nhtml[data-theme=\"light\"] #okiLife .ol-balance{color:#26395a;background:#d8edff;border-color:#a9b4dc}\nhtml[data-theme=\"light\"] #okiLife .ol-speech{background:#fff8;border-color:#afa1ce}\nhtml[data-theme=\"light\"] #okiLife .ol-products article,html[data-theme=\"light\"] #okiLife .ol-quests li{background:#fff7;border-color:#b3b9d9}\nhtml[data-theme=\"light\"] #okiLife .ol-arena{background:radial-gradient(ellipse,#ebe3ff,#cae2f6)}\nhtml[data-theme=\"light\"] #okiLife .ol-premium span{background:#ded5ee;color:#3e4667}\n@media(max-width:380px){#okiLife{padding:8px}#okiLife .ol-card{padding:14px 12px;border-radius:22px;max-height:calc(100dvh - 16px)}#okiLife .ol-tabs{gap:5px}#okiLife .ol-choices svg{height:155px}#okiLife .ol-stat{grid-template-columns:74px minmax(0,1fr) 27px}#okiLife .ol-products{gap:8px}}\n@keyframes olFloat{50%{transform:translateY(-5px) rotate(1deg)}}\n@keyframes olBlink{0%,44%,49%,100%{transform:scaleY(1)}46%,47%{transform:scaleY(.08)}}\n@keyframes olWave{0%,70%,100%{transform:rotate(0)}75%,85%{transform:rotate(-12deg)}80%,90%{transform:rotate(8deg)}}\n@keyframes olChew{50%{transform:scaleY(.35)}}\n@media(prefers-reduced-motion:reduce){#okiLife *,#okiBubble *{animation:none!important;transition:none!important}}\n\nhtml[data-theme=\"light\"] #okiLife{--ol-color:#168ca9;--ol-accent:#d34aa7}\nhtml[data-theme=\"light\"] #okiLife[data-skin=\"aurora\"]{--ol-color:#7956c9;--ol-accent:#be57c1}\nhtml[data-theme=\"light\"] #okiLife[data-skin=\"sunset\"]{--ol-color:#bc7926;--ol-accent:#dc5795}\nhtml[data-theme=\"light\"] #okiLife[data-mood=\"hungry\"],html[data-theme=\"light\"] #okiLife[data-mood=\"quiet\"]{--ol-color:#7587bf;--ol-accent:#9465bc}\nhtml[data-theme=\"light\"] #okiLife[data-mood=\"sleep\"],html[data-theme=\"light\"] #okiLife[data-mood=\"tired\"]{--ol-color:#52799e;--ol-accent:#7a65a5}\nhtml[data-theme=\"light\"] body #okiLife button.ol-change{color:#46597d!important;border-color:#a99ac5!important}\n#okiLife header{position:sticky;top:0;z-index:2;padding:6px;border-radius:16px;background:#1b2440}\nhtml[data-theme=\"light\"] #okiLife header{background:#eeeafb}\n";
 for (const name of ['index.html','admin.html']) {
  const path='site/public/'+name;
  let html=readFileSync(path,'utf8');
  const old=/<script\b[^>]*id="ok-v80-neon-pet-js"[^>]*>[\s\S]*?<\/script>/;
  if(!old.test(html)) throw new Error('Previous OKI entry point missing in '+name);
  html=html.replace(old,()=>'<script id="ok-v80-neon-pet-js">'+lifeJS+'</script>');
  html=html.replace('</head>',()=>'<style id="ok-oki-life-v82">'+lifeCSS+'</style>\n</head>');
  writeFileSync(path,html);
 }
 const cacheBuild=(process.env.CF_PAGES_COMMIT_SHA||process.env.COMMIT_REF||String(Date.now())).slice(0,12);
 writeFileSync(swPath,readFileSync(swPath,'utf8').replace(/const\s+CACHE\s*=\s*[^;]+;/,()=> 'const CACHE = "pattayaok-oki-life-v82-'+cacheBuild+'";'));
 console.log('OKI Life v82 ready: RU / EN / TH, crystal-only shop; no sales.');
}
