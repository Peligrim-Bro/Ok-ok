import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';
const page='site/public/index.html';let html=readFileSync(page,'utf8');
const guide=readFileSync('safety/bike-deposit.html','utf8');
// Keep the interactive guide in the shell: no separate HTML navigation in PWA/iOS.
const embedded=guide.replace(/const lang=\['ru','en','th'\][\s\S]*?,t=DATA\[lang\];/,"const lang=parent.document.documentElement.lang||'ru',t=DATA[lang];");
if(embedded===guide)throw Error('Guide language anchor missing');
const serialized=JSON.stringify(embedded).replaceAll('<','\\u003c');
// Secondary warnings load only when requested; preserve their content and sources.
const warningMatch=html.match(/    const SCAMS = \[[\s\S]*?\n    \];\n(?:    SCAMS\.unshift\(\.\.\..*\);\n)?/);
if(!warningMatch)throw Error('Warnings data anchor missing');
const warningData=runInNewContext(warningMatch[0]+';JSON.stringify(SCAMS)',{}, {timeout:1000});
const warningVersion=createHash('sha256').update(warningData).digest('hex').slice(0,12);
const warningURL='./safety/warnings-'+warningVersion+'.json';
mkdirSync('site/public/safety',{recursive:true});writeFileSync('site/public/'+warningURL.slice(2),warningData);
html=html.replace(warningMatch[0],'');
const start=html.indexOf('    function renderScams() {'),end=html.indexOf('    function stopGame()',start);
if(start<0||end<0)throw Error('Safety renderer anchors missing');
const renderer=`    const safetyDocument=${serialized};
    function renderScams() {
      const label=cityText('Не попадись','Stay scam-aware','รู้ทันก่อนพลาด');
      $('app').innerHTML='<iframe id="safetyGuide" title="'+label+'" style="display:block;width:100%;height:1600px;border:0"></iframe><details class="news" id="safetyWarnings"><summary>'+cityText('Другие предупреждения и источники','Other warnings and sources','คำเตือนอื่นและแหล่งข้อมูล')+'</summary><div></div></details>';
      $('safetyGuide').srcdoc=safetyDocument;
      const warnings=$('safetyWarnings');warnings.ontoggle=async()=>{if(!warnings.open||warnings.dataset.loaded)return;const target=warnings.querySelector('div');target.textContent=cityText('Загрузка…','Loading…','กำลังโหลด…');try{const r=await fetch('${warningURL}');if(!r.ok)throw Error('warnings');const list=await r.json();target.innerHTML=list.map(s=>'<article><h3>'+L(s.title)+'</h3><p>'+L(s.text)+'</p><p>'+L(s.do)+'</p></article>').join('');warnings.dataset.loaded='1';}catch{target.textContent=cityText('Не удалось загрузить. Закройте и откройте список ещё раз.','Could not load. Close and reopen to retry.','โหลดไม่สำเร็จ ปิดแล้วเปิดอีกครั้ง');}};
    }
    window.addEventListener('message',e=>{
      const frame=$('safetyGuide');if(!frame||e.origin!==location.origin||e.source!==frame.contentWindow)return;
      if(e.data?.okokSafety==='height'&&Number.isFinite(e.data.height))frame.style.height=Math.max(400,Math.min(e.data.height+16,12000))+'px';
      if(['copy','share','mode','report'].includes(e.data?.okokSafety))window.dispatchEvent(new CustomEvent('okok:safety',{detail:{action:e.data.okokSafety,mode:['before','after'].includes(e.data.mode)?e.data.mode:''}}));
      if(e.data?.okokSafety==='report')$('authorChatButton')?.click();
    });
    function safetyRoute(){if(['#safety/bike-deposit','#safety/bike-deposit/after','#safety/bike-deposit/quiz'].includes(location.hash)){setTab('scam',false);history.replaceState({view:'tab',tab:'scam'},'');}}
    document.addEventListener('click',e=>{const link=e.target.closest('a[href^=\"#safety/bike-deposit\"]');if(link){e.preventDefault();const hash=link.getAttribute('href');if(location.hash===hash)safetyRoute();else location.hash=hash;}});
    window.addEventListener('hashchange',safetyRoute);setTimeout(safetyRoute,0);

`;
html=html.slice(0,start)+renderer+html.slice(end);
// Thailand-wide checklist remains available in every selected city.
html=html.replace('["home","list","shop","scam"].includes(tab)','["home","list","shop"].includes(tab)');
html=html.replace('navScam: "Скам"','navScam: "Защита"').replace('navScam: "Scam"','navScam: "Safety"');
const homeStart=html.indexOf('        <article class="scam" data-open-scam="jetski">');
const homeEnd=html.indexOf('        <h3 style="margin:18px 0 8px">',homeStart);
if(homeStart<0||homeEnd<0)throw Error('Safety home entry missing');
html=html.slice(0,homeStart)+html.slice(homeEnd);
const actionsStart=html.indexOf('        <button class="btn map" type="button" data-openmap="1"');
const actionsEnd=html.indexOf('        <div id="okAds"',actionsStart);
if(actionsStart<0||actionsEnd<0)throw Error('Home primary action anchors missing');
const home=String.raw`
<section class="home-panel" aria-labelledby="protection-title"><div class="panel-heading"><h2 id="protection-title">🛡 \${cityText('Не попадись','Stay scam-aware','รู้ทันกลโกง')}</h2><span>\${cityText('Листай →','Swipe →','เลื่อน →')}</span></div><div class="home-rail">
<a id="homeSafety" class="home-tile safety-tile" href="#safety/bike-deposit"><span class="tile-symbol">🛵</span><strong>\${cityText('Перед арендой','Before renting','ก่อนเช่ารถ')}</strong><small>\${cityText('Байк и депозит: 5 проверок до оплаты','Bike deposits: 5 checks before paying','เงินมัดจำ: ตรวจ 5 ข้อก่อนจ่าย')}</small></a>
<a class="home-tile" href="#safety/bike-deposit/after"><span class="tile-symbol">🧾</span><strong>\${cityText('Депозит удерживают?','Deposit withheld?','ถูกหักเงินมัดจำ?')}</strong><small>\${cityText('Что сохранить и куда обратиться','What to save and who to contact','เก็บหลักฐานอะไรและติดต่อใคร')}</small></a>
<a class="home-tile" href="#safety/bike-deposit/quiz"><span class="tile-symbol">🔎</span><strong>\${cityText('Заметишь подвох?','Spot the warning sign','จับสัญญาณเตือน')}</strong><small>\${cityText('Одна ситуация — проверь себя','One scenario to test yourself','ลองตอบสถานการณ์สมมติ')}</small></a>
</div></section>
<section class="home-panel" aria-labelledby="places-title"><div class="panel-heading"><h2 id="places-title">🧭 \${cityText('Куда пойти','Where to go','ไปไหนดี')}</h2><span>\${cityText('Листай →','Swipe →','เลื่อน →')}</span></div><div class="home-rail places-rail">
<button class="home-tile" type="button" data-spin="1"><span class="tile-symbol">✨</span><strong>\${cityText('Выбор дня','Daily pick','ตัวเลือกวันนี้')}</strong><small>\${cityText('50 идей без повторов','50 ideas, no repeats','50 ไอเดียไม่ซ้ำ')}</small></button>
<button class="home-tile" type="button" data-openmap="1"><span class="tile-symbol">🗺</span><strong>\${cityText('На карте','On the map','บนแผนที่')}</strong><small>\${cityText('Места Паттайи на карте','Explore Pattaya places on a map','สำรวจสถานที่ในพัทยาบนแผนที่')}</small></button>
<button class="home-tile" type="button" data-tours="1"><span class="tile-symbol">🎟</span><strong>\${cityText('Экскурсии','Tours','ทัวร์')}</strong><small>\${cityText('Открыть подборку','Open the selection','เปิดรายการแนะนำ')}</small></button>
</div><div id="okMapSlot"></div></section>
\${clockHTML(true)}
`;
html=html.slice(0,actionsStart)+home.replaceAll('\\${','${')+html.slice(actionsEnd);
html=html.replace('<h1>PattayaOK</h1>','<h1>OK-OK</h1>').replace(":'PattayaOK';",":'OK-OK';");
html=html.replace('tagline: "Места, которым можно верить"','tagline: "Места и защита от скама"').replace('tagline: "Places you can actually trust"','tagline: "Places and scam awareness"').replace('tagline: "สถานที่ที่ไว้ใจได้"','tagline: "แนะนำสถานที่และรู้ทันกลโกง"');
html=html.replace('</head>','<style id=\"okok-home-panels\">.home-panel{padding:14px;margin:0 0 14px;border:1px solid var(--line);border-radius:24px;background:var(--card)}.panel-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}.panel-heading h2{font-size:19px;margin:0}.panel-heading>span{font-size:12px;color:var(--muted)}.home-rail{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;padding:3px 2px 10px;scrollbar-width:thin}.home-tile{flex:0 0 71%;min-width:0;scroll-snap-align:start;display:flex;flex-direction:column;align-items:flex-start;gap:6px;text-align:left;padding:14px;min-height:136px;border:1px solid var(--line);border-radius:19px;background:var(--card2);color:var(--text);font:inherit;text-decoration:none;cursor:pointer;box-shadow:inset 0 1px 1px #ffffff35}.home-tile strong{font-size:17px;line-height:1.25}.home-tile small{font-size:13px;line-height:1.4;color:var(--muted)}.tile-symbol{font-size:25px;line-height:1.2}.home-tile:focus-visible{outline:3px solid var(--mint);outline-offset:-3px}.safety-tile{border-color:var(--mint)}.places-rail .home-tile{flex-basis:53%;min-height:118px}#homeFilters:not([open]){width:max-content;max-width:100%;margin:8px 0}#homeFilters:not([open]) #homeFiltersToggle{padding:0 38px 0 16px;border-radius:14px}#homeFilters[open]{width:100%}@media(min-width:700px){.home-tile,.places-rail .home-tile{flex-basis:calc((100% - 20px)/3)}}@media(prefers-reduced-motion:reduce){.home-rail{scroll-behavior:auto}}</style></head>');
writeFileSync(page,html);
const swPath='site/public/sw.js';let sw=readFileSync(swPath,'utf8').replace('const CORE = [','const CORE = ['+JSON.stringify(warningURL)+',');
writeFileSync(swPath,sw);
console.log('PASS: self-contained safety guide and compact horizontal home panels');
