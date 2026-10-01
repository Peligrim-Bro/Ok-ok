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
