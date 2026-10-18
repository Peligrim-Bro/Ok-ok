import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
copyFileSync('weather-background.js', 'site/public/assets/spatial/spatial.js');
const file = 'site/public/index.html';
let html = readFileSync(file, 'utf8');
// Owner 2026-10-18: three utilities; support/report remain reachable in More.
const timer = html.match(/\s*<button[^>]*id="timerBtn"[^>]*>[\s\S]*?<\/button>/);
if (!timer) throw Error('Header timer missing');
html = html.replace(timer[0], '').replace('<div class="top-actions">', timer[0] + '\n        <div class="top-actions">');
const moved=[];
for(const id of ['donateBtn','reportBtn'])html=html.replace(new RegExp('<button[^>]*id="'+id+'"[^>]*>[\\s\\S]*?</button>'),s=>{moved.push(s);return ''});
html=html.replace(/(<div class="top-actions">[\s\S]*?)(<\/div>)/, '$1<button class="lang" id="moreBtn" type="button" aria-expanded="false" aria-controls="headerMore">⋯</button>$2');
html=html.replace('</header>', '<div id="headerMore" hidden><button class="lang" id="moreClose" type="button">×</button>'+moved.join('')+'</div></header>');
if (!html.includes('id="ok-header-layout-v100"')) {
  html = html.replace('</head>', `<style id="ok-header-layout-v100">
    html body header.app .brand{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
    html body header.app .brand>.logo{flex:0 0 36px}
    html body header.app .brand>div:nth-child(3){flex:1 1 0;min-width:0;overflow:hidden}
    html body header.app .brand>#timerBtn{position:static!important;inset:auto!important;transform:none!important;translate:none!important;margin:0!important;width:44px!important;min-width:44px!important;max-width:44px!important;height:44px!important;min-height:44px!important;max-height:44px!important;flex:0 0 44px!important;align-self:center!important}
    html body header.app .brand>.top-actions{display:grid;grid-template-columns:minmax(0,1fr) 44px 52px 44px;gap:8px;flex:0 0 100%;width:100%;min-width:0;margin:0;grid-template-rows:44px;grid-auto-rows:44px;align-items:center;height:44px;max-height:44px}
    html body header.app .top-actions>#donateBtn{width:100%!important;min-width:0!important;max-width:none!important;margin:0!important;flex:none!important;white-space:normal!important;line-height:1.25!important;font-size:12px!important;padding:7px 8px!important;min-height:44px!important;box-sizing:border-box}
    html body header.app .top-actions>:is(#themeBtn,#langBtn,#reportBtn){width:100%!important;min-width:0!important;min-height:44px!important;padding:7px 4px!important;white-space:nowrap!important;box-sizing:border-box;flex:none!important}
    /* Explicit block sizing prevents utility controls stretching on mobile Safari. */
    html body header.app .top-actions>:is(#themeBtn,#langBtn,#moreBtn){height:44px!important;min-height:44px!important;max-height:44px!important;align-self:center!important;aspect-ratio:auto!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;margin-block:0!important;overflow:hidden}
    html body #headerMore[hidden]{display:none!important}html body #headerMore{position:fixed;top:max(12px,env(safe-area-inset-top));right:12px;z-index:12000;display:flex;flex-direction:column;gap:8px;padding:12px;width:min(340px,calc(100vw - 24px));box-sizing:border-box;background:var(--card);border:1px solid var(--line);border-radius:20px;box-shadow:0 12px 36px #0008;max-height:calc(100dvh - 24px);overflow:auto}html body #headerMore>button{min-height:44px;flex:0 0 auto;padding:10px!important;white-space:normal}html body #moreClose{align-self:flex-end;width:44px}
    html body header.app #langBtn{font-size:13px!important}
    html body header.app #reportBtn{font-size:12px!important}
    html body nav.tab{left:max(10px,calc((100% - 560px)/2))!important;right:max(10px,calc((100% - 560px)/2))!important}
  </style></head>`);
  writeFileSync(file, html);
}
// Return to the original weather renderer with a fresh asset URL for PWA caches.
for (const path of [file, 'site/public/sw.js']) {
  writeFileSync(path, readFileSync(path, 'utf8').replace(/spatial\/spatial\.js\?v=\d+/g, 'spatial/spatial.js?v=98'));
}
console.log('Header layout v100: stable utility row and centered five-item navigation; weather restored.');
