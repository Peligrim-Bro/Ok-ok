Warning: truncated output (original token count: 34074)
Total output lines: 1748

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
    document.querySelectorAll("#donateBtn").forEach(el=>{
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
    return el.id === "donateBtn";
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
 const LANG=()=>{const l=(document.documentElement.lang||localStorage.get…19074 tokens truncated…border:1px solid #ffffff25;border-radius:14px}\n#okiLife .ol-quests li.done{border-color:#64e8c775;background:#38b39715}\n#okiLife .ol-success{color:#8bf8d1}\n#okiLife .ol-products{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}\n#okiLife .ol-products article{border:1px solid #afc5ff45;border-radius:18px;padding:12px;background:#ffffff08;display:flex;flex-direction:column;align-items:stretch}\n#okiLife .ol-product-icon{font-size:35px;margin:5px 0}\n#okiLife .ol-products p{font-size:11px;flex:1}\n#okiLife .ol-products button{font-size:12px!important;padding:9px 5px!important}\n#okiLife .ol-premium{margin-top:18px;padding:18px;border:1px dashed #b294dd70;border-radius:20px;background:linear-gradient(145deg,#ad65df18,#647fe418)}\n#okiLife .ol-premium>div:first-child{font-size:35px;color:#c7b4ff}\n#okiLife .ol-premium-preview{font-size:30px;letter-spacing:12px;margin:12px 0;opacity:.55}\n#okiLife .ol-premium span{display:block;font-size:12px;border-radius:12px;background:#0003;padding:8px;color:#d4c5f1}\n#okiLife .ol-arena{height:270px;position:relative;margin-top:15px;background:radial-gradient(ellipse,#394a8550,#061124);border:1px solid #909fce60;border-radius:20px;overflow:hidden}\n#okiLife .ol-score{position:absolute;inset:12px 5px auto;font-size:14px;color:#fff}\nhtml body #okiLife .ol-star{position:absolute;width:54px;height:54px;font-size:27px!important;transition:none!important;padding:5px!important}\n#okiLife .ol-back{position:absolute;bottom:35px;left:12px;right:12px}\n#okiLife .ol-arena p{position:absolute;bottom:3px;left:5px;right:5px;font-size:10px;margin:0}\n#okiLife [hidden]{display:none!important}\n#okiBubble{position:fixed;z-index:2147482000;display:flex;gap:4px;align-items:center;padding:8px;border:1px solid #b6a3ff;border-radius:17px;background:linear-gradient(150deg,#30385d,#473065);color:#fff;box-shadow:0 8px 28px #0005;font-family:Manrope,system-ui,sans-serif}\n#okiBubble::after{content:\"\";position:absolute;bottom:-6px;left:var(--oki-tail-x,50%);margin-left:-5.5px;width:11px;height:11px;background:#413363;transform:rotate(45deg);border-right:1px solid #b6a3ff;border-bottom:1px solid #b6a3ff}\nhtml body #okiBubble button{min-width:0;min-height:36px!important;margin:0!important;padding:5px!important;color:#fff!important;border:0!important;background:transparent!important;box-shadow:none!important;text-shadow:none;font:700 12px/1.4 Manrope,system-ui,sans-serif!important;border-radius:8px!important;touch-action:manipulation}\n#okiBubble .ol-bubble-open{flex:1;text-align:left}\nhtml body #okiBubble .ol-bubble-close{flex:none;width:36px;height:36px;font-size:20px!important}\nhtml[data-theme=\"light\"] #okiLife .ol-card{background:radial-gradient(ellipse at 50% 20%,#e4befe99,transparent 50%),linear-gradient(160deg,#ecf6ff,#eee5fb);color:#293653;box-shadow:0 20px 70px #24396150}\nhtml[data-theme=\"light\"] #okiLife :is(h2,h3,h4,.ol-growth,.ol-speech,.ol-score){color:#293653}\nhtml[data-theme=\"light\"] #okiLife p{color:#4b5f7c}\nhtml[data-theme=\"light\"] #okiLife .ol-balance{color:#26395a;background:#d8edff;border-color:#a9b4dc}\nhtml[data-theme=\"light\"] #okiLife .ol-speech{background:#fff8;border-color:#afa1ce}\nhtml[data-theme=\"light\"] #okiLife .ol-products article,html[data-theme=\"light\"] #okiLife .ol-quests li{background:#fff7;border-color:#b3b9d9}\nhtml[data-theme=\"light\"] #okiLife .ol-arena{background:radial-gradient(ellipse,#ebe3ff,#cae2f6)}\nhtml[data-theme=\"light\"] #okiLife .ol-premium span{background:#ded5ee;color:#3e4667}\n@media(max-width:380px){#okiLife{padding:8px}#okiLife .ol-card{padding:14px 12px;border-radius:22px;max-height:calc(100dvh - 16px)}#okiLife .ol-tabs{gap:5px}#okiLife .ol-choices svg{height:155px}#okiLife .ol-stat{grid-template-columns:74px minmax(0,1fr) 27px}#okiLife .ol-products{gap:8px}}\n@keyframes olFloat{50%{transform:translateY(-5px) rotate(1deg)}}\n@keyframes olBlink{0%,44%,49%,100%{transform:scaleY(1)}46%,47%{transform:scaleY(.08)}}\n@keyframes olWave{0%,70%,100%{transform:rotate(0)}75%,85%{transform:rotate(-12deg)}80%,90%{transform:rotate(8deg)}}\n@keyframes olChew{50%{transform:scaleY(.35)}}\n@media(prefers-reduced-motion:reduce){#okiLife *,#okiBubble *{animation:none!important;transition:none!important}}\n\nhtml[data-theme=\"light\"] #okiLife{--ol-color:#168ca9;--ol-accent:#d34aa7}\nhtml[data-theme=\"light\"] #okiLife[data-skin=\"aurora\"]{--ol-color:#7956c9;--ol-accent:#be57c1}\nhtml[data-theme=\"light\"] #okiLife[data-skin=\"sunset\"]{--ol-color:#bc7926;--ol-accent:#dc5795}\nhtml[data-theme=\"light\"] #okiLife[data-mood=\"hungry\"],html[data-theme=\"light\"] #okiLife[data-mood=\"quiet\"]{--ol-color:#7587bf;--ol-accent:#9465bc}\nhtml[data-theme=\"light\"] #okiLife[data-mood=\"sleep\"],html[data-theme=\"light\"] #okiLife[data-mood=\"tired\"]{--ol-color:#52799e;--ol-accent:#7a65a5}\nhtml[data-theme=\"light\"] body #okiLife button.ol-change{color:#46597d!important;border-color:#a99ac5!important}\n#okiLife header{position:sticky;top:0;z-index:2;padding:6px;border-radius:16px;background:#1b2440}\nhtml[data-theme=\"light\"] #okiLife header{background:#eeeafb}\n\n#okiLife .ol-surprise{display:grid;gap:4px;margin:10px 0 14px;padding:10px 12px;border:1px dashed #bca0f275;border-radius:14px;background:#a58bea10;font-size:11px;line-height:1.5;color:#dbcef3}\n#okiLife .ol-surprise strong{color:#f1e6ff}\nhtml[data-theme=\"light\"] #okiLife .ol-surprise{color:#52617e;background:#ece2ff;border-color:#a794c8}\nhtml[data-theme=\"light\"] #okiLife .ol-surprise strong{color:#57427f}\n\n#okiLife .ol-pet{display:block;width:min(100%,300px);height:320px;margin:0 auto;overflow:hidden;position:relative;background:radial-gradient(ellipse at 50% 60%,#bb54f720,transparent 66%);border-radius:24px}\n#okiLife .ol-3d-slot{position:relative;width:100%;height:100%;min-height:140px;overflow:hidden;isolation:isolate}\n#okiLife .ol-3d-slot canvas{display:block;width:100%;height:100%;touch-action:none;outline-offset:-4px;cursor:grab}\n#okiLife .ol-3d-slot[data-dragging=\"true\"] canvas{cursor:grabbing}\n#okiLife .ol-3d-loading{position:absolute;inset:0;display:grid;align-content:center;padding:16px;font-size:12px;color:#ddcef5;pointer-events:none;z-index:1}\n#okiLife .ol-3d-slot[data-ready=\"true\"] .ol-3d-loading{display:none}\n#okiLife .ol-choices .ol-3d-slot{height:210px;pointer-events:none}\n#okiLife .ol-rotate-tip{font-size:11px;color:#c8d6ee;margin:0 0 8px}\nhtml[data-theme=\"light\"] #okiLife .ol-3d-loading{color:#435274}\n@media(max-width:380px){#okiLife .ol-pet{height:295px;width:265px}#okiLife .ol-choices .ol-3d-slot{height:175px}}\n\n#okiLife .ol-arena{height:auto;min-height:0;padding:12px;overflow:visible;background:#111b32}\n#okiLife .ol-score{position:static;margin:0 0 6px;font-size:13px}\n#okiLife .ol-arena p{position:static;margin:8px 0;font-size:11px}\n#okiLife .ol-tetris-board{display:grid;grid-template-columns:repeat(8,1fr);width:min(100%,224px);aspect-ratio:8/12;margin:8px auto;background:#080f20;border:1px solid #6687b2;border-radius:8px;padding:4px;gap:2px}\n#okiLife .ol-tetris-board i,#okiLife .ol-tetris-next i{display:block;background:#ffffff08;border-radius:3px;min-height:10px}\n#okiLife .ol-tetris-board i[data-color=\"1\"],#okiLife .ol-tetris-next i[data-color=\"1\"]{background:#2bd7e6}\n#okiLife .ol-tetris-board i[data-color=\"2\"],#okiLife .ol-tetris-next i[data-color=\"2\"]{background:#f5ca58}\n#okiLife .ol-tetris-board i[data-color=\"3\"],#okiLife .ol-tetris-next i[data-color=\"3\"]{background:#b38ae9}\n#okiLife .ol-tetris-board i[data-color=\"4\"],#okiLife .ol-tetris-next i[data-color=\"4\"]{background:#54ce92}\n#okiLife .ol-tetris-board i[data-color=\"5\"],#okiLife .ol-tetris-next i[data-color=\"5\"]{background:#f282a6}\n#okiLife .ol-tetris-board i[data-color=\"6\"],#okiLife .ol-tetris-next i[data-color=\"6\"]{background:#6699f0}\n#okiLife .ol-tetris-board i[data-color=\"7\"],#okiLife .ol-tetris-next i[data-color=\"7\"]{background:#f0a768}\n#okiLife .ol-tetris-board i[data-ghost=\"true\"]{opacity:.23;box-shadow:inset 0 0 0 1px #fff}\n#okiLife .ol-tetris-board[data-paused=\"true\"]{opacity:.45}\n#okiLife .ol-tetris-next-label{font-size:11px;display:flex;justify-content:center;align-items:center;gap:10px;color:#c6d5ef}\n#okiLife .ol-tetris-next{display:grid;gap:2px;min-height:24px}\n#okiLife .ol-tetris-controls{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:12px 0 6px}\nhtml body #okiLife .ol-tetris-controls button{min-height:44px;font-size:23px!important;touch-action:manipulation}\n#okiLife .ol-tetris-tools{display:grid;grid-template-columns:1fr 1fr;gap:6px}\n#okiLife .ol-back{position:static;width:100%;margin-top:6px}\nhtml[data-theme=\"light\"] #okiLife .ol-arena{background:#e9e5f7}\nhtml[data-theme=\"light\"] #okiLife .ol-tetris-next-label{color:#435274}\n\n#okiLife .ol-routine{margin:14px 0;padding:12px;border:1px solid #9f97cc55;border-radius:16px;background:#907bd510;text-align:left}#okiLife .ol-routine h3{font-size:15px;margin:0}#okiLife .ol-routine p{font-size:11px;line-height:1.5;color:#bdcae2}#okiLife .ol-routine ul{list-style:none;padding:0;display:grid;gap:7px;font-size:13px}#okiLife .ol-routine button{width:100%}html[data-theme=\"light\"] #okiLife .ol-routine p{color:#53617e}\n";
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
 writeFileSync(swPath,readFileSync(swPath,'utf8').replace(/const\s+CACHE\s*=\s*[^;]+;/,()=> 'const CACHE = "pattayaok-oki-life-v88-'+cacheBuild+'";'));
console.log('OKI Life v82 ready: RU / EN / TH, crystal-only shop; no sales.');
}

// Keep the header hourglass as the single timer entry point. The compact
// clock's full-width empty-state button was a duplicate on the home screen.
for(const name of ['index.html','admin.html']){
 const path='site/public/'+name;
 const html=readFileSync(path,'utf8');
 const duplicate=/<button\b[^>]*data-timer="1"[^>]*>[\s\S]*?<\/button>/g;
 if(name==='index.html'&&!duplicate.test(html))throw new Error('Expected duplicate timer template missing in '+name);
 writeFileSync(path,html.replace(duplicate,''));
}
writeFileSync(swPath,readFileSync(swPath,'utf8').replace('pattayaok-oki-life-v88-','pattayaok-oki-reference-v90-'));
console.log('Timer duplicate removed; header hourglass and visa clock retained.');
await import('./scripts/apply-editorial.mjs');


// Practical transport cards and saved places, bundled locally.
copyFileSync('travel-map.js','site/public/assets/spatial/pattaya-map.js');
copyFileSync('travel-map.css','site/public/assets/spatial/travel-map.css');
for(const file of ['index.html','admin.html']){
 const path='site/public/'+file;
 let page=readFileSync(path,'utf8').replace(/pattaya-map\.js\?v=\d+/g,'pattaya-map.js?v=92');
 page=page.replace('</head>','<link rel="stylesheet" href="assets/spatial/travel-map.css?v=92">\n</head>');
 writeFileSync(path,page);
}
console.log('Travel map ready: ferry, UTP flights, BKK airport bus, filters and saved places.');
const travelSW=readFileSync(swPath,'utf8').replaceAll('./assets/spatial/pattaya-map.js?v=71','./assets/spatial/pattaya-map.js?v=92').replace('const CORE = [','const CORE = ["./assets/spatial/travel-map.css?v=92",');
writeFileSync(swPath,travelSW);
// GA4: one asynchronous tag on the public site; admin traffic is excluded.
{
 const gaTag = `<script id="ok-ga4">
(function(){
 if(navigator.doNotTrack==='1'||window.doNotTrack==='1'||navigator.globalPrivacyControl===true)return;
 try{if(new URLSearchParams(location.search).get('okok_test')==='1')sessionStorage.setItem('okok-test','1');if(navigator.webdriver||/^(localhost|127[.]0[.]0[.]1)$/.test(location.hostname)||sessionStorage.getItem('okok-test')==='1')return;}catch(e){return;}
 window.dataLayer=window.dataLayer||[];
 window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
 window.gtag('js',new Date());
 window.gtag('config','G-TD8W93WFV5',{allow_google_signals:false,allow_ad_personalization_signals:false});
 var tag=document.createElement('script');
 tag.async=true;
 tag.src='https://www.googletagmanager.com/gtag/js?id=G-TD8W93WFV5';
 document.head.appendChild(tag);
})();
</script>`;
 const path='site/public/index.html';
 const page=readFileSync(path,'utf8');
 if(!/<head\b[^>]*>/i.test(page))throw new Error('Public page head missing for GA4');
 writeFileSync(path,page.replace(/<head\b[^>]*>/i,match=>match+'\n'+gaTag));
 console.log('GA4 ready: G-TD8W93WFV5');
}


// 12GO referral registry and an on-demand widget exclusively inside the city map.
{
 const referral='https://12go.asia/?z=17095940';
 const partnerPath='site/public/assets/commerce/partners.js';
 let partners=readFileSync(partnerPath,'utf8');
 const entry=/travel12go:\s*\{[^}]+\}/;
 if(!entry.test(partners))throw Error('12GO partner registry entry missing');
 partners=partners.replace(entry,row=>row.replace(/\burl:\s*'[^']*'/,"url:'"+referral+"'").replace(/\bref:\s*'[^']*'/,"ref:'"+referral+"'"));
 writeFileSync(partnerPath,partners);
 // Preserve route-specific links while adding attribution to every direct 12GO URL.
 const {readdirSync}=await import('node:fs');
 function rewrite(dir){for(const item of readdirSync(dir,{withFileTypes:true})){
  const file=dir+'/'+item.name;
  if(item.isDirectory()){rewrite(file);continue;}
  if(!/\.(?:html|js|json)$/.test(item.name)||item.name==='sw.js')continue;
  const text=readFileSync(file,'utf8');
  const updated=text.replace(/https?:\/\/(?:www\.)?12go\.asia(?:\/[^\s'"<>\x60\\]*)?/g,raw=>{
   const u=new URL(raw);u.searchParams.set('z','17095940');return u.href;
  });
  if(updated!==text)writeFileSync(file,updated);
 }}
 rewrite('site/public');
 const mapPath='site/public/assets/spatial/pattaya-map.js';
 let mapJS=readFileSync(mapPath,'utf8');
 const anchor="let activePlace=null;";
 if(!mapJS.includes(anchor))throw Error('Map widget insertion anchor missing');
 const widget=String.raw`
 const booking=document.createElement('details');booking.className='map-12go';
 const bookingTitle=document.createElement('summary');bookingTitle.textContent=tr('12GO · Найти билеты в Паттайю','12GO · Find tickets to Pattaya','12GO · ค้นหาตั๋วไปพัทยา');booking.append(bookingTitle);
 const bookingBody=document.createElement('div');bookingBody.className='map-12go-body';booking.append(bookingBody);
 paragraph(bookingBody,tr('Автобусы, паромы, поезда · партнёрская ссылка автора. Виджет на английском, цены в USD.','Buses, ferries, trains · author’s affiliate link. Widget in English, prices in USD.','รถบัส เรือ รถไฟ · ลิงก์พันธมิตรของผู้ดูแล วิดเจ็ตภาษาอังกฤษ ราคาเป็น USD'),'map-small');
 const fallback=external(bookingBody,tr('Открыть 12GO','Open 12GO','เปิด 12GO'),'https://12go.asia/?z=17095940');fallback.rel='noopener sponsored';fallback.dataset.okPartner='travel12go';fallback.dataset.okPlacement='city-map';
 let bookingLoaded=false;
 booking.addEventListener('toggle',()=>{
  if(!booking.open||bookingLoaded)return;bookingLoaded=true;
  const frame=document.createElement('iframe');frame.title='12GO · Pattaya tickets';frame.className='map-12go-frame';frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation');
  const width=Math.max(240,Math.min(400,bookingBody.clientWidth-16));
  frame.srcdoc='<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;background:#fff}body{padding:8px;box-sizing:border-box}onetwogo-travelto-widget{display:block;max-width:100%}</style></head><body><onetwogo-travelto-widget city="Pattaya" width="'+width+'" agent="17095940" lang="en" fxcode="USD" wl="12go.asia"></onetwogo-travelto-widget><script src="https://agent.12go.asia/tools/widget/widget.js"></script></body></html>';
  bookingBody.insertBefore(frame,fallback);
 },opts);
 hero.append(booking);
 `;
 mapJS=mapJS.replace(anchor,()=>widget+'\n '+anchor);
 writeFileSync(mapPath,mapJS);
 const cssPath='site/public/assets/spatial/travel-map.css';
 writeFileSync(cssPath,readFileSync(cssPath,'utf8')+'\n.map-12go{margin:12px 14px;border:1px solid var(--line);border-radius:16px;background:var(--card);color:var(--text);overflow:hidden}.map-12go summary{padding:14px;cursor:pointer;font-size:13px;font-weight:700;min-height:44px}.map-12go-body{padding:0 12px 14px;min-width:0}.map-12go-frame{display:block;width:100%;max-width:416px;height:520px;border:0;border-radius:12px;margin:12px auto;background:#fff}.map-12go-body .btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 14px;font-size:12px!important}\n');
 for(const name of ['index.html','admin.html']){
  const file='site/public/'+name;
  writeFileSync(file,readFileSync(file,'utf8').replaceAll('pattaya-map.js?v=92','pattaya-map.js?v=93').replaceAll('travel-map.css?v=92','travel-map.css?v=93').replace(/partners\.js\?v=\d+/g,'partners.js?v=93'));
 }
 writeFileSync(swPath,readFileSync(swPath,'utf8').replaceAll('pattaya-map.js?v=92','pattaya-map.js?v=93').replaceAll('travel-map.css?v=92','travel-map.css?v=93').replace(/partners\.js\?v=\d+/g,'partners.js?v=93').replace('pattayaok-oki-reference-v90-','pattayaok-12go-v93-'));
 console.log('12GO referral 17095940 ready; widget loads only within the city map.');
}

// v94: Senate roulette, three daily ad slots, author construction notice.
{
 for(const name of ['index.html','admin.html']){
  const path='site/public/'+name;let html=readFileSync(path,'utf8');
  html=html.replace('💱 Может, сначала пополнить кошелёк?','💱 Может пора поменять валюту').replace('💱 Top up the wallet first?','💱 Time to exchange currency?').replace('💱 เติมกระเป๋าก่อนไหม?','💱 ได้เวลาแลกเงินแล้วหรือยัง?');
  const a=html.indexOf('    function spinPool() {'),b=html.indexOf('    function renderRules()',a);
  if(name==='index.html'&&(a<0||b<0))throw Error('Roulette anchors missing');
  if(a>=0&&b>=0){
  let spin=html.slice(a,b).replace(/area: "EX24 · SuperRich · T.T."/g,'area: "Senate Exchange"').replace(/photo: "assets\/images\/ex24.jpg"/g,'photo: "assets/icons/icon-192-v80.png"').replace(/maps: "https:\/\/www.google.com\/maps\/search\/\?api=1&query=[^"]*"/g,'maps: "https://t.me/SenateExchange_bot?start=fi10072"').replace(/name: "💱 " \+ [^\n]+/,'name: t().fxSpinTitle,').replace('ru: "",\n        en: ""','ru: "Senate Exchange",\n        en: "Senate Exchange"');
  spin=spin.replace('ru: t().fxSpinText,\n        en: t().fxSpinText','ru: "Senate Exchange",\n        en: "Senate Exchange"');
  spin=spin.replace('★ ${p.rating} · ${(p.reviews/1000).toFixed(1)}k Google · ${p.area}','${p.id === "ad-fx" ? p.area : `★ ${p.rating} · ${(p.reviews/1000).toFixed(1)}k Google · ${p.area}`}');
  spin=spin.replace('Google #${pick.rank} · ★ ${pick.rating} · ${pick.reviews.toLocaleString()} reviews','${pick.id === "ad-fx" ? "Senate Exchange" : `Google #${pick.rank} · ★ ${pick.rating} · ${pick.reviews.toLocaleString()} reviews`}');
  spin=spin.replace('rel="noopener">${t().maps}</a>','rel="${pick.id === "ad-fx" ? "noopener sponsored" : "noopener"}">${pick.id === "ad-fx" ? t().partnerSenateBtn : t().maps}</a>');
  html=html.slice(0,a)+spin+html.slice(b);
  }
  html=html.replace('const notes = CFG.notes || [];','const notes = [{ru:"Сайт в процессе строительства. Приношу извинения и прошу понимания 🫶",en:"The site is under construction. I apologise and ask for your understanding 🫶",th:"เว็บไซต์อยู่ระหว่างการพัฒนา ขออภัยและขอความเข้าใจด้วยนะครับ 🫶"}, ...(CFG.notes || [])];');
  writeFileSync(path,html.replace(/ads\.js\?v=\d+/g,'ads.js?v=94'));
 }
 const path='site/public/assets/ads/ads.js';
 let ads=readFileSync(path,'utf8').replaceAll('slots: 5','slots: 3').replaceAll("price: '5'","price: '15'").replaceAll("|| '5'","|| '15'").replaceAll('hours: 12','hours: 24').replaceAll('|| 12','|| 24').replaceAll('12 * 3600e3','24 * 3600e3').replaceAll('12 часов','24 часа').replaceAll('12 hours','24 hours').replaceAll('12 ชั่วโมง','24 ชั่วโมง');
 writeFileSync(path,ads);
 writeFileSync(swPath,readFileSync(swPath,'utf8').replace('pattayaok-12go-v93-','pattayaok-senate-ads-v94-').replace(/ads\.js\?v=\d+/g,'ads.js?v=94'));
}

await import('./scripts/apply-events.mjs');


// Klook author referral code: shared registry powers every partner placement.
{
 const path='site/public/assets/commerce/partners.js';
 let partners=readFileSync(path,'utf8');
 const anchor="klook: {name:'Klook',url:'https://www.klook.com/',ref:'',";
 if(!partners.includes(anchor))throw Error('Klook registry anchor missing');
 partners=partners.replace(anchor,anchor+"referralCode:'HAF8KW',referralNote:{ru:'Реферальный код автора Klook: HAF8KW.',en:'Author’s Klook referral code: HAF8KW.',th:'รหัสแนะนำ Klook ของผู้ดูแล: HAF8KW'},referralInstructions:{ru:'Скопируйте HAF8KW и используйте его в программе приглашения друзей Klook. Доступность бонуса определяется условиями Klook.',en:'Copy HAF8KW and use it in Klook’s friend referral program. Rewards are subject to Klook’s terms.',th:'คัดลอก HAF8KW แล้วใช้ในโปรแกรมชวนเพื่อนของ Klook สิทธิ์รับรางวัลขึ้นอยู่กับเงื่อนไขของ Klook'},");
 writeFileSync(path,partners);
 for(const name of ['index.html','admin.html']){
  const file='site/public/'+name;let html=readFileSync(file,'utf8');
  html=html.replace('code ? t().referralNote :','code ? (pl.item.referralNote ? L(pl.item.referralNote) : t().referralNote) :');
  html=html.replace('${t().referralInstructions}</p>','${pl.item.referralInstructions ? L(pl.item.referralInstructions) : t().referralInstructions}</p>');
  html=html.replace(/partners\.js\?v=\d+/g,'partners.js?v=95');
  writeFileSync(file,html);
 }
 writeFileSync(swPath,readFileSync(swPath,'utf8').replace(/partners\.js\?v=\d+/g,'partners.js?v=95').replace('pattayaok-senate-ads-v94-','pattayaok-klook-v95-'));
 console.log('Klook referral HAF8KW ready in all partner placements.');
}

await import('./scripts/apply-bangkok.mjs');
await import('./scripts/apply-holiday-wheel.mjs');

// Fixed five-button navigation order for every deployment.
{
 const path='site/public/index.html';let page=readFileSync(path,'utf8');
 page=page.replace(/<nav class="tab">([\s\S]*?)<\/nav>/,(_whole,inner)=>{
  const buttons=[...inner.matchAll(/<button\b[\s\S]*?<\/button>/g)].map(m=>m[0]);
  const order=['home','game','list','scam','shop'];
  if(buttons.length!==5)throw new Error('Expected five bottom navigation buttons');
  return '<nav class="tab">\n'+order.map(tab=>{
   const button=buttons.find(b=>b.includes('data-tab="'+tab+'"'));
   if(!button)throw new Error('Missing navigation button '+tab);return button;
  }).join('\n')+'\n</nav>';
 });
 writeFileSync(path,page);
}

// Mandatory on every build, including native Cloudflare Workers Builds.
await import('./remove-agoda.mjs');
await import('./scripts/apply-home-compact.mjs');
await import('./scripts/apply-header-layout.mjs');

await import('./scripts/remove-supermao.mjs');
await import('./scripts/apply-production-domain.mjs');
await import('./scripts/apply-card-reveal.mjs');

await import('./scripts/remove-ex24.mjs');
await import('./scripts/apply-quality-metadata.mjs');

// Invalidate the optimized weather renderer even for returning PWA clients.
for(const path of ['site/public/index.html','site/public/sw.js']){
 writeFileSync(path,readFileSync(path,'utf8').replaceAll('spatial.js?v=98','spatial.js?v=101'));
}

// Owner requested current-weather background on 2026-10-14.
copyFileSync('weather-background.js','site/public/assets/spatial/spatial.js');
for(const path of ['site/public/index.html','site/public/sw.js'])writeFileSync(path,readFileSync(path,'utf8').replaceAll('spatial.js?v=101','spatial.js?v=103'));

await import('./scripts/apply-loading-stability.mjs');
await import('./scripts/apply-tropical-gloss.mjs');

await import('./scripts/apply-editorial-polish.mjs');

await import('./scripts/apply-author-chat.mjs');


await import('./scripts/apply-ga4-events.mjs');

await import('./scripts/apply-owner-place.mjs');
await import('./scripts/apply-jkao-place.mjs');

// Owner's current exchange partner overrides archived placements on every build.
await import('./scripts/apply-ex24-referral.mjs');

await import('./scripts/apply-pwa-update.mjs');

// Set release identity after all patches; browser startup must never change it.
await import('./scripts/apply-place-descriptions.mjs');
await import('./scripts/apply-catalogue-services.mjs');
await import('./scripts/apply-content-freshness.mjs');
await import('./scripts/apply-oki-absence.mjs');
await import('./scripts/apply-oki-place-guide.mjs');
await import('./scripts/apply-brand-motto.mjs');
await import('./scripts/apply-safety-guide.mjs');
await import('./scripts/finalize-release-cache.mjs');

// Owner paused the startup portal on 2026-10-17 pending refinement.
// Keep its source available, but inject neither the cover nor animation while off.
const startupSettings=JSON.parse(readFileSync('content/startup.json','utf8'));
if(typeof startupSettings.portalEnabled!=='boolean')throw new Error('Portal setting must be boolean');
if(startupSettings.portalEnabled){
 const portalSource=readFileSync('portal-launch.js','utf8');
 if(!portalSource.includes('okok-portal'))throw new Error('Portal source invalid');
 const pagePath='site/public/index.html';
 let page=readFileSync(pagePath,'utf8');
 if(!page.includes('</body>'))throw new Error('Portal: missing closing body');
 if(/src="\.\/portal-launch\.js(?:\?|")/.test(page))throw new Error('Portal already injected');
 const {createHash}=await import('node:crypto');
 const portalURL='./portal-launch.js?v='+createHash('sha256').update(portalSource).digest('hex').slice(0,16);
 const portalSessionKey=portalSource.match(/const key='([^']+)'/)?.[1];
 if(!portalSessionKey||!page.includes('</head>'))throw new Error('Portal: startup anchor missing');
 const startup='<style id="okok-portal-startup">html[data-okok-portal-pending]::before{content:"";position:fixed;inset:0;background:#030510;z-index:2147483646;pointer-events:none}</style><script>try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&!sessionStorage.getItem('+JSON.stringify(portalSessionKey)+')){document.documentElement.setAttribute("data-okok-portal-pending","");setTimeout(function(){document.documentElement.removeAttribute("data-okok-portal-pending")},4500)}}catch(e){}</script>';
 page=page.replace('</head>',startup+'\n</head>');
 writeFileSync('site/public/portal-launch.js',portalSource);
 page=page.replace('</body>','<script defer src="'+portalURL+'"></script>\n</body>');
 const swPath='site/public/sw.js';
 const portalSW=readFileSync(swPath,'utf8');
 if(!portalSW.includes('const CORE = ['))throw new Error('Portal: offline assets anchor missing');
 writeFileSync(swPath,portalSW.replace('const CORE = [','const CORE = ['+JSON.stringify(portalURL)+','));
 writeFileSync(pagePath,page);
 console.log('Experimental portal injected into public index only');
}else{
 const page=readFileSync('site/public/index.html','utf8');
 if(/portal-launch\.js|okok-portal-startup|data-okok-portal-pending/.test(page))throw new Error('Disabled portal returned to the page');
 console.log('Startup portal paused: direct site opening, no cover or animation');
}

// Seasonal visual layer: isolated from catalogue, partners and navigation.
{
 const source=readFileSync('assets/halloween-2026.js','utf8');
 if(!source.includes('okok-halloween-decor'))throw new Error('Halloween asset missing marker');
 const pagePath='site/public/index.html';
 let page=readFileSync(pagePath,'utf8');
 if(!page.includes('</body>'))throw new Error('Halloween: closing body missing');
 if(page.includes('halloween-2026.js'))throw new Error('Halloween already included');
 copyFileSync('assets/halloween-2026.js','site/public/halloween-2026.js');
 const {createHash}=await import('node:crypto');
 const version=createHash('sha256').update(source).digest('hex').slice(0,12);
 page=page.replace('</body>','<style>'+readFileSync('assets/halloween-2026.css','utf8')+'</style><script defer src="./halloween-2026.js?v='+version+'"></script>\n</body>');
 writeFileSync(pagePath,page);
}

// Standalone Oki House prototype. No navigation or existing mascot changes.
{
 const source='prototypes/oki-house.html';
 const target='site/public/oki-house.html';
 const html=readFileSync(source,'utf8');
 if(!html.includes('okok-oki-house-v2')||!html.includes('<title>Дом Оки'))throw new Error('Oki House prototype invalid');
 copyFileSync(source,target);
 for(const name of ['oki-game-v2.webp','oki-walk-v1.webp'])copyFileSync('prototypes/assets/'+name,'site/public/'+name);
}
