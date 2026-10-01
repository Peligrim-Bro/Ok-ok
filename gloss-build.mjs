import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';

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
writeFileSync(swPath, readFileSync(swPath, 'utf8').replace(/const CACHE = [^;]+;/, 'const CACHE = "pattayaok-20261001-v72-sculpted-buttons";'));
console.log('PattayaOK v72: glossy buttons applied; PWA cache updated.');
