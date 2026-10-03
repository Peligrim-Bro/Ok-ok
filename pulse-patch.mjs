import { readFileSync, writeFileSync } from 'node:fs';

const indexPath='site/public/index.html';
let html=readFileSync(indexPath,'utf8');
if(!html.includes('</body>')) throw new Error('OK-OK Pulse: missing </body>');

const pulse=`
<style id="okok-pulse-v1">
.okok-pulse{margin:12px 0 2px;padding:12px;border:1px solid #91a7d455;border-radius:18px;background:linear-gradient(145deg,#ffffff0d,#7b8ec014);box-shadow:inset 0 1px #fff2}
.okok-pulse__title{font-weight:800;font-size:14px;margin-bottom:8px}.okok-pulse__buttons{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.okok-pulse__buttons button{min-height:38px!important;padding:7px 6px!important;border-radius:14px!important;font-size:12px!important}.okok-pulse__meta{display:flex;justify-content:space-between;gap:8px;margin-top:8px;font-size:11px;opacity:.75}.okok-pulse__thanks{margin-top:8px;font-size:12px;font-weight:700}.okok-pulse button[data-vote="great"]{--toy-face:linear-gradient(174deg,#dcffe7,#7bd99c 60%,#54b67a);--toy-rim:#73cf91;--toy-depth:#3b8c5a;--toy-ink:#153d25}.okok-pulse button[data-vote="issue"]{--toy-face:linear-gradient(174deg,#fff2e5,#e5ad85 60%,#c98363);--toy-rim:#d49a77;--toy-depth:#915b47;--toy-ink:#4c291d}
html[data-theme="light"] .okok-pulse{background:linear-gradient(145deg,#fff,#eef2fb);border-color:#9aabd077;color:#26324c}
@media(max-width:380px){.okok-pulse__buttons{gap:5px}.okok-pulse__buttons button{font-size:11px!important;padding:6px 3px!important}}
</style>
<script id="okok-pulse-v1-js">
(()=>{
 const STORE='okok-pulse-v1';
 const read=()=>{try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch{return {}}};
 const save=x=>{try{localStorage.setItem(STORE,JSON.stringify(x))}catch{}};
 const keyFor=(card,i)=>{const title=card.querySelector('h1,h2,h3,h4,.title,.name')?.textContent?.trim()||('place-'+i);return title.toLowerCase().replace(/\\s+/g,'-').slice(0,80)};
 const isPlace=card=>{
   if(card.closest('.okad,[data-ad],nav,header,footer')) return false;
   const text=(card.textContent||'').toLowerCase();
   if(text.length<35) return false;
   return !!card.querySelector('h2,h3,h4,.title,.name') && (!!card.querySelector('a[href*="maps"],a[href*="google"],[data-report],.rating,.stars,.btn') || /рейтинг|rating|провер|verified|отзыв|review/.test(text));
 };
 const render=()=>{
  const cards=[...document.querySelectorAll('.card,.place-card,[data-place],article')].filter(isPlace);
  const db=read();
  cards.forEach((card,i)=>{
   if(card.querySelector('.okok-pulse')) return;
   const key=keyFor(card,i), rec=db[key]||{};
   const box=document.createElement('div'); box.className='okok-pulse'; box.dataset.pulseKey=key;
   box.innerHTML='<div class="okok-pulse__title">Как здесь сейчас?</div><div class="okok-pulse__buttons"><button type="button" data-vote="great">🔥 Отлично</button><button type="button" data-vote="ok">👍 Норм</button><button type="button" data-vote="issue">⚠️ Есть нюанс</button></div><div class="okok-pulse__meta"><span class="okok-pulse__count"></span><span class="okok-pulse__fresh"></span></div><div class="okok-pulse__thanks" hidden></div>';
   const update=()=>{const r=read()[key]||{};box.querySelector('.okok-pulse__count').textContent=r.vote?'Твоя отметка учтена':'1 касание — и данные свежее';box.querySelector('.okok-pulse__fresh').textContent=r.at?'Обновлено только что':'Нужна свежая отметка';box.querySelectorAll('[data-vote]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.vote===r.vote)))};
   box.addEventListener('click',e=>{const b=e.target.closest('[data-vote]');if(!b)return;const all=read();all[key]={vote:b.dataset.vote,at:Date.now()};save(all);const t=box.querySelector('.okok-pulse__thanks');t.hidden=false;t.textContent='Оки принял 👀 Теперь данные свежее';update();setTimeout(()=>{t.hidden=true},2600)});
   const actions=card.querySelector('.actions,.buttons,.card-actions');
   if(actions) actions.before(box); else card.append(box); update();
  });
 };
 let timer; const schedule=()=>{clearTimeout(timer);timer=setTimeout(render,120)};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
 new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
})();
</script>`;

if(!html.includes('okok-pulse-v1')) html=html.replace('</body>',pulse+'\n</body>');
writeFileSync(indexPath,html);

const swPath='site/public/sw.js';
let sw=readFileSync(swPath,'utf8');
sw=sw.replace(/const CACHE = [^;]+;/,'const CACHE = "okok-20261003-pulse-v1";');
writeFileSync(swPath,sw);
console.log('OK-OK Pulse v1 injected.');
