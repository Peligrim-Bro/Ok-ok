import {readFileSync,writeFileSync} from 'node:fs';
const p='site/public/index.html';let h=readFileSync(p,'utf8');
if(!h.includes('</head>')||!h.includes('</body>'))throw new Error('invalid index');
h=h.replace(/<style id="okok-tetris-expand-v1">[\s\S]*?<\/style>/g,'').replace(/<script id="okok-tetris-expand-js-v1">[\s\S]*?<\/script>/g,'');
const css=`<style id="okok-tetris-playable-v2">
/* Responsive Tetris: game board stays visible; controls stay compact. */
[data-okok-tetris-shell="1"]{width:min(94vw,560px)!important;max-height:92dvh!important;overflow:auto!important;padding:14px!important;box-sizing:border-box!important;}
[data-okok-tetris-board="1"]{width:min(72vw,340px)!important;height:min(58dvh,620px)!important;min-height:360px!important;margin:8px auto!important;display:block!important;aspect-ratio:1/2!important;}
[data-okok-tetris-controls="1"]{min-height:0!important;height:auto!important;max-height:none!important;display:grid!important;grid-template-columns:repeat(4,1fr)!important;gap:8px!important;margin:8px 0!important;}
[data-okok-tetris-controls="1"] button,[data-okok-tetris-control="1"]{min-height:48px!important;height:48px!important;padding:8px!important;border-radius:14px!important;}
@media(max-width:600px){[data-okok-tetris-shell="1"]{width:96vw!important;max-height:94dvh!important;padding:10px!important;}[data-okok-tetris-board="1"]{width:min(76vw,300px)!important;height:min(52dvh,560px)!important;min-height:330px!important;}[data-okok-tetris-controls="1"] button,[data-okok-tetris-control="1"]{height:44px!important;min-height:44px!important;font-size:13px!important;}}
</style>`;
h=h.replace('</head>',css+'\n</head>');
const js=`<script id="okok-tetris-playable-js-v2">(()=>{
 const needles=['сбросить блок','пауза'];
 const fix=()=>{
  const els=[...document.querySelectorAll('body *')];
  const reset=els.find(e=>(e.textContent||'').trim().toLowerCase()==='сбросить блок');
  const pause=els.find(e=>(e.textContent||'').trim().toLowerCase()==='пауза');
  if(!reset||!pause)return;
  reset.setAttribute('data-okok-tetris-control','1');pause.setAttribute('data-okok-tetris-control','1');
  let controls=reset.parentElement;
  if(controls&&controls.contains(pause))controls.setAttribute('data-okok-tetris-controls','1');
  let shell=reset.parentElement;
  while(shell&&shell!==document.body){const r=shell.getBoundingClientRect();if(r.width>280&&r.height>400){shell.setAttribute('data-okok-tetris-shell','1');break;}shell=shell.parentElement;}
  if(!shell)return;
  const candidates=[...shell.querySelectorAll('canvas,[class*="board" i],[class*="grid" i]')];
  const board=candidates.filter(e=>{const r=e.getBoundingClientRect();return r.width>120&&r.width<500&&r.height>80;}).sort((a,b)=>b.getBoundingClientRect().height-a.getBoundingClientRect().height)[0];
  if(board)board.setAttribute('data-okok-tetris-board','1');
  /* Undo the previous accidental giant sizing on every control ancestor. */
  [reset,pause,...(controls?[...controls.children]:[])].forEach(e=>{e.style.removeProperty('min-height');e.style.removeProperty('height');});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fix,{once:true});else fix();
 new MutationObserver(()=>requestAnimationFrame(fix)).observe(document.body,{childList:true,subtree:true});
})();</script>`;
h=h.replace('</body>',js+'\n</body>');writeFileSync(p,h);
const sw='site/public/sw.js';let s=readFileSync(sw,'utf8');s=s.replace(/const CACHE = [^;]+;/,'const CACHE = "okok-20261003-tetris-playable-v2";');writeFileSync(sw,s);
console.log('Tetris responsive playable layout v2 applied.');
