import {readFileSync,writeFileSync} from 'node:fs';
const p='site/public/index.html';let h=readFileSync(p,'utf8');
if(!h.includes('</head>')||!h.includes('</body>'))throw new Error('invalid index');
const css=`<style id="okok-tetris-expand-v1">
/* Give the existing mini-Tetris enough vertical play space for a real session. */
:is(.tetris-board,.game-board,[class*="tetris"][class*="board"],canvas[id*="tetris" i],canvas[class*="tetris" i]){min-height:420px!important;max-height:62vh!important;}
:is(.tetris-modal,.game-modal,[class*="tetris"][class*="modal"],[class*="game"][class*="modal"]){max-height:88dvh!important;overflow:auto!important;}
@media(max-width:600px){:is(.tetris-board,.game-board,[class*="tetris"][class*="board"],canvas[id*="tetris" i],canvas[class*="tetris" i]){min-height:390px!important;}}
</style>`;
if(!h.includes('okok-tetris-expand-v1'))h=h.replace('</head>',css+'\n</head>');
const js=`<script id="okok-tetris-expand-js-v1">(()=>{
 const grow=()=>{
  const roots=[...document.querySelectorAll('[class*="tetris" i],[id*="tetris" i],[class*="game-board" i]')];
  for(const el of roots){
   const tag=el.tagName;
   if(tag==='CANVAS'){
    /* Preserve width; expand short 2-row/preview canvases only when they are the active game surface. */
    const r=el.getBoundingClientRect();
    if(r.width>160&&r.height>0&&r.height<260){el.style.setProperty('height','420px','important');el.setAttribute('data-okok-tetris-expanded','1');}
   }else{
    const r=el.getBoundingClientRect();
    if(r.width>160&&r.height>0&&r.height<300){el.style.setProperty('min-height','420px','important');el.style.setProperty('overflow','hidden','important');el.setAttribute('data-okok-tetris-expanded','1');}
   }
  }
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',grow,{once:true});else grow();
 new MutationObserver(()=>requestAnimationFrame(grow)).observe(document.body,{childList:true,subtree:true,attributes:false});
})();</script>`;
if(!h.includes('okok-tetris-expand-js-v1'))h=h.replace('</body>',js+'\n</body>');
writeFileSync(p,h);
const sw='site/public/sw.js';let s=readFileSync(sw,'utf8');s=s.replace(/const CACHE = [^;]+;/,'const CACHE = "okok-20261003-tetris-expand-v1";');writeFileSync(sw,s);
console.log('OK-OK Tetris play area expanded.');
