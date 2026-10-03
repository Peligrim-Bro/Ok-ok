import { readFileSync, writeFileSync } from 'node:fs';
const path='site/public/index.html';
let html=readFileSync(path,'utf8');
if(!html.includes('</head>')||!html.includes('</body>')) throw new Error('OKI/nav fix: invalid index');
const patch=`<style id="oki-nav-float-fix-v2">
/* Bottom navigation: five independent floating controls, no black submarine/panel. */
html body nav.tab{
  background:transparent!important;
  background-color:transparent!important;
  border:0!important;
  box-shadow:none!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
  padding:8px 14px calc(10px + env(safe-area-inset-bottom,0px))!important;
  gap:9px!important;
  overflow:visible!important;
}
html body nav.tab::before,html body nav.tab::after{display:none!important;content:none!important;}
html body nav.tab button{
  min-height:62px!important;
  border-radius:22px!important;
  box-shadow:0 9px 22px #02081555,inset 0 2px 2px #ffffffa8,inset 0 -3px 5px #16213c66!important;
  backdrop-filter:blur(12px)!important;
  -webkit-backdrop-filter:blur(12px)!important;
}
/* OKI prompt: remove the downward triangle that points at Scam. */
#okok-tail-killer{display:none!important;}
@media(max-width:390px){html body nav.tab{gap:6px!important;padding-left:9px!important;padding-right:9px!important;}html body nav.tab button{border-radius:19px!important;}}
</style>`;
html=html.replace(/<style id="oki-bubble-pointer-fix-v1">[\s\S]*?<\/style>/g,'');
if(!html.includes('oki-nav-float-fix-v2')) html=html.replace('</head>',patch+'\n</head>');
const script=`<script id="oki-prompt-tail-fix-v2">(()=>{
 const textNeedles=['мини-тетрис','mini-tetris','tetris'];
 const fix=()=>{
   document.querySelectorAll('body *').forEach(el=>{
     if(el.children.length>8)return;
     const t=(el.textContent||'').trim().toLowerCase();
     if(!textNeedles.some(n=>t.includes(n)))return;
     const r=el.getBoundingClientRect();
     if(r.width<120||r.width>520||r.height<35||r.height>220)return;
     el.style.setProperty('z-index','1300','important');
     el.style.setProperty('margin-bottom','16px','important');
     /* Neutralize pseudo-element tails even when the original class is unknown. */
     el.setAttribute('data-oki-prompt-fixed','1');
   });
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fix,{once:true});else fix();
 new MutationObserver(()=>requestAnimationFrame(fix)).observe(document.body,{subtree:true,childList:true});
})();</script><style id="oki-prompt-tail-css-v2">[data-oki-prompt-fixed="1"]::before,[data-oki-prompt-fixed="1"]::after{content:none!important;display:none!important;border:0!important;clip-path:none!important;}</style>`;
if(!html.includes('oki-prompt-tail-fix-v2')) html=html.replace('</body>',script+'\n</body>');
writeFileSync(path,html);
const sw='site/public/sw.js';
let s=readFileSync(sw,'utf8');
s=s.replace(/const CACHE = [^;]+;/,'const CACHE = "okok-20261003-floating-nav-v2";');
writeFileSync(sw,s);
console.log('OKI prompt tail removed; bottom navigation converted to floating controls.');
