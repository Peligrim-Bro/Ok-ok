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
