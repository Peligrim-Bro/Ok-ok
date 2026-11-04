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
<a class="home-tile" href="#safety/bike-deposit/after"><span class="tile-symbol">🧾</span><strong>\${cityText('Депозит и залог','Deposits','เงินมัดจำ')}</strong><small>\${cityText('Что сохранить и как вернуть','What to save and how to get it back','เก็บหลักฐานและขอเงินคืน')}</small></a>
<a class="home-tile" href="/ne-vedis/index.html?lang=\${lang}#check"><span class="tile-symbol">🔎</span><strong>\${cityText('Проверить','Check a place','ตรวจสอบ')}</strong><small>\${cityText('Прокат или школа','Rental or school','ร้านเช่าหรือโรงเรียน')}</small></a>
</div></section>
<section class="home-panel" aria-labelledby="places-title"><div class="panel-heading"><h2 id="places-title">🧭 \${cityText('Куда пойти','Where to go','ไปไหนดี')}</h2><span>\${cityText('Листай →','Swipe →','เลื่อน →')}</span></div><p class="home-caption">\${cityText('Подборка мест, идеи и маршруты в Паттайе','Places, ideas and routes in Pattaya','สถานที่ ไอเดีย และเส้นทางในพัทยา')}</p><div class="home-rail places-rail">
<button class="home-tile" type="button" data-spin="1"><span class="tile-symbol">✨</span><strong>\${cityText('Выбор дня','Daily pick','ตัวเลือกวันนี้')}</strong><small>\${cityText('50 идей без повторов','50 ideas, no repeats','50 ไอเดียไม่ซ้ำ')}</small></button>
<button class="home-tile" type="button" data-openmap="1"><span class="tile-symbol">🗺</span><strong>\${cityText('На карте','On the map','บนแผนที่')}</strong><small>\${cityText('Все места Паттайи','Explore Pattaya','สถานที่ในพัทยา')}</small></button>
<button class="home-tile" type="button" data-spot="1"><span class="tile-symbol">♡</span><strong>\${cityText('Любимые локации','Favorite spots','สถานที่โปรด')}</strong><small>\${cityText('Ваш список','Your list','รายการของคุณ')}</small></button>
<button class="home-tile" type="button" data-tours="1"><span class="tile-symbol">🎟</span><strong>\${cityText('Экскурсии','Tours','ทัวร์')}</strong><small>\${cityText('Открыть подборку','Open the selection','เปิดรายการแนะนำ')}</small></button>
</div><div id="homeFilterSlot"></div><div id="okMapSlot"></div></section>
<div class="okok-new-home" id="okok-new-home">
<section class="home-panel" aria-labelledby="travel-tools-title">
<div class="panel-heading"><h2 id="travel-tools-title">🧳 \${cityText('Инструменты для путешествий','Travel tools','เครื่องมือเดินทาง')}</h2><span>\${cityText('Листай →','Swipe →','เลื่อน →')}</span></div>
<div class="home-rail">
<a class="home-tile tool-tile" href="./split-bill.html"><img src="./assets/icons/icon-192-v80.png" alt="" width="27" height="27">OK-OK SPLIT</a>
<a class="home-tile tool-tile" href="https://www.google.com/travel/flights" target="_blank" rel="noopener"><span class="tile-symbol" aria-hidden="true">✈</span>\${cityText('Авиабилеты','Flights','เที่ยวบิน')}</a>
<a class="home-tile tool-tile" href="https://nomads.com/" target="_blank" rel="noopener"><span class="tile-symbol" aria-hidden="true">🛏</span>\${cityText('Жильё','Stays','ที่พัก')}</a>
<a class="home-tile tool-tile" href="https://12go.asia/?z=17095940" target="_blank" rel="noopener sponsored"><span class="tile-symbol" aria-hidden="true">🚘</span>\${cityText('Транспорт','Transport','การเดินทาง')}</a>
<button class="home-tile tool-tile" type="button" data-home-exchange><span class="tile-symbol" aria-hidden="true">💱</span>\${cityText('Обмен валют','Currency exchange','แลกเงิน')}</button>
<a class="home-tile tool-tile" href="./tools.html"><span class="tile-symbol" aria-hidden="true">•••</span>\${cityText('Ещё','More','เพิ่มเติม')}</a>
</div></section>
<section class="home-panel books-panel" aria-labelledby="books-title">
<div class="panel-heading"><h2 id="books-title">📖 \${cityText('Попутчик','Travel Reads','หนังสือระหว่างทาง')}</h2><a href="./travel-reads.html">\${cityText('Книги в дорогу','Browse books','ดูหนังสือ')} →</a></div>
<p class="home-caption">\${cityText('Детективы, мистика и триллеры в дорогу. После загрузки сайта можно читать офлайн.','Mysteries, supernatural stories and thrillers. Read offline once the site has loaded.','นิยายสืบสวน เรื่องลึกลับ และระทึกขวัญ อ่านออฟไลน์ได้หลังโหลดเว็บไซต์')}</p>
<div class="okok-books">
<a class="okok-book-link" href="./travel-reads.html?book=1"><img class="okok-book-cover" src="./tools/cover-1-cinema.webp" alt="" loading="lazy">\${cityText('Последний пассажир','The Last Passenger','ผู้โดยสารคนสุดท้าย')}<small>\${cityText('Детектив','Mystery','สืบสวน')}</small></a>
<a class="okok-book-link" href="./travel-reads.html?book=2"><img class="okok-book-cover" src="./tools/cover-2-cinema.webp" alt="" loading="lazy">\${cityText('Номер без гостя','Room Without a Guest','ห้องพักไร้แขก')}<small>\${cityText('Мистика','Supernatural','เรื่องลึกลับ')}</small></a>
<a class="okok-book-link" href="./travel-reads.html?book=3"><img class="okok-book-cover" src="./tools/cover-3-cinema.webp" alt="" loading="lazy">\${cityText('Чужой маршрут','The Wrong Route','ผิดเส้นทาง')}<small>\${cityText('Триллер','Thriller','ระทึกขวัญ')}</small></a>
</div></section>
</div>
<p class="hint">\${cityText('Подборка — ориентир, не гарантия услуг. Цены и условия уточняй перед бронированием.','Suggestions are a starting point, not a service guarantee. Confirm prices and terms before booking.','รายการแนะนำเป็นข้อมูลเบื้องต้น ไม่ใช่การรับประกันบริการ โปรดยืนยันราคาและเงื่อนไขก่อนจอง')}</p>
\${clockHTML(true)}
`;
html=html.slice(0,actionsStart)+home.replaceAll('\\${','${')+html.slice(actionsEnd);
// The Places carousel already links to saved spots. Remove the old home-only duplicate.
const favoriteStart=html.indexOf('        ${(() => {\n          const fav = spots.find(',actionsStart);
const favoriteEnd=html.indexOf('        })()}\n',favoriteStart);
if(favoriteStart<0||favoriteEnd<0)throw Error('Legacy home favorite block missing');
html=html.slice(0,favoriteStart)+html.slice(favoriteEnd+'        })()}\n'.length);
// Keep the native filters and their existing listeners when home is redrawn.
html=html.replace('<details id="homeFilters">','<div id="catalogFiltersSlot"></div><details id="homeFilters">');
html=html.replace("const homeFilters=$('homeFilters');","const homeFilters=$('homeFilters'); $('catalogFiltersSlot').after(homeFilters);");
html=html.replace('if (tab === "home") renderHome();',`if (tab === "home") {
        renderHome();
        $('homeFilterSlot').append(homeFilters);
      }`);
html=html.replace('      if (e.target.closest("[data-tours]")) {',`      if (e.target.closest('[data-home-exchange]')) {
        cat = 'cash';
        setTab('list');
        return;
      }
      if (e.target.closest("[data-tours]")) {`);

html=html.replace('<h1>PattayaOK</h1>','<h1>OK-OK</h1>').replace(":'PattayaOK';",":'OK-OK';");
html=html.replace('tagline: "Места, которым можно верить"','tagline: "Места и защита от скама"').replace('tagline: "Places you can actually trust"','tagline: "Places and scam awareness"').replace('tagline: "สถานที่ที่ไว้ใจได้"','tagline: "แนะนำสถานที่และรู้ทันกลโกง"');
html=html.replace('</head>','<style id=\"okok-home-panels\">.home-panel{padding:14px;margin:0 0 14px;border:1px solid var(--line);border-radius:24px;background:var(--card)}.panel-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}.panel-heading h2{font-size:19px;margin:0}.panel-heading>span{font-size:12px;color:var(--muted)}.home-rail{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;padding:3px 2px 10px;scrollbar-width:thin}.home-tile{flex:0 0 71%;min-width:0;scroll-snap-align:start;display:flex;flex-direction:column;align-items:flex-start;gap:6px;text-align:left;padding:14px;min-height:136px;border:1px solid var(--line);border-radius:19px;background:var(--card2);color:var(--text);font:inherit;text-decoration:none;cursor:pointer;box-shadow:inset 0 1px 1px #ffffff35}.home-tile strong{font-size:17px;line-height:1.25}.home-tile small{font-size:13px;line-height:1.4;color:var(--muted)}.home-tile[data-spin] small{color:inherit}.tile-symbol{font-size:25px;line-height:1.2}.home-tile:focus-visible{outline:3px solid var(--mint);outline-offset:-3px}.safety-tile{border-color:var(--mint)}.places-rail .home-tile{flex-basis:53%;min-height:118px}#homeFilters:not([open]){width:max-content;max-width:100%;margin:8px 0}#homeFilters:not([open]) #homeFiltersToggle{padding:0 38px;border-radius:14px}#homeFilters[open]{width:100%}@media(min-width:700px){.home-tile,.places-rail .home-tile{flex-basis:calc((100% - 20px)/3)}}@media(prefers-reduced-motion:reduce){.home-rail{scroll-behavior:auto}}</style></head>');
// The fifth tab keeps its catalogue and exposes device-local shortcuts above it.
const profile = `<section class="home-panel" aria-labelledby="profile-title">
<h2 id="profile-title">\${cityText('Профиль','Profile','โปรไฟล์')}</h2>
<p class="home-caption">\${cityText('Ваши инструменты и сохранённые данные на этом устройстве','Your tools and data saved on this device','เครื่องมือและข้อมูลที่บันทึกไว้บนอุปกรณ์นี้')}</p>
<div class="profile-actions">
\${city==='pattaya'?'<button class="btn map" type="button" data-spot="1">'+cityText('Любимые локации','Favorite spots','สถานที่โปรด')+'</button>':''}
<a class="btn map" href="./tools.html">\${cityText('Полезное','Tools','เครื่องมือ')}</a>
<a class="btn ghost" href="./travel-reads.html">\${cityText('Попутчик','Travel Reads','หนังสือระหว่างทาง')}</a>
</div></section>`;
html=html.replace('    function renderShop() {','    function profileHTML(){return `'+profile+'`;}\n    function renderShop() {');
html=html.replace('<h2 style="margin:8px 0 6px">${t().shopsTitle}</h2>','${profileHTML()}<h2 style="margin:8px 0 6px">${t().shopsTitle}</h2>');
html=html.replace("$('app').innerHTML=intro+'<div class=\"empty\">'+cityText", "$('app').innerHTML=(tab==='shop'?profileHTML():'')+intro+'<div class=\"empty\">'+cityText");
for (const label of ['Профиль','Profile','โปรไฟล์']) html=html.replace('navShop: ""','navShop: "'+label+'"');
html=html.replace(' class="quiet-leaf" aria-label="cannabis shops"',' class="quiet-leaf"');
// Version panel CSS separately so new safety content stays within the shell budget.
const panelStyle=html.match(/<style id="okok-home-panels">([\s\S]*?)<\/style>/);
if(!panelStyle)throw Error('Home panel stylesheet missing');
const panelURL='./safety/panels-'+createHash('sha256').update(panelStyle[1]).digest('hex').slice(0,12)+'.css';
writeFileSync('site/public/'+panelURL.slice(2),panelStyle[1]);
html=html.replace(panelStyle[0],'<link rel="stylesheet" href="'+panelURL+'">');
// One self-contained centre serves website visitors and links opened from Telegram.
mkdirSync('site/public/ne-vedis',{recursive:true});
const reports=JSON.parse(readFileSync('content/business-reports.json','utf8'));
for(const r of reports.records){if(!r.id||!['bikes','schools','visas'].includes(r.category))throw Error('Invalid business report');for(const l of ['ru','en','th'])if(!r.fact[l])throw Error('Missing report language');for(const address of [r.website,r.source.url,r.rating?.url].filter(Boolean))if(new URL(address).protocol!=='https:')throw Error('Unsafe report source');}
const helpers=readFileSync('safety/resource-check.mjs','utf8').replace(/^export /gm,'');
const checkUI=readFileSync('safety/resource-check-ui.mjs','utf8').replace('__BUSINESS_REPORTS__',()=>JSON.stringify(reports).replaceAll('<','\\u003c')).replace('__RESOURCE_CHECK_HELPERS__',()=>helpers);
writeFileSync('site/public/ne-vedis/index.html',readFileSync('safety/ne-vedis.html','utf8').replace('__RESOURCE_CHECK_UI__',()=>checkUI));
writeFileSync(page,html);
const swPath='site/public/sw.js';let sw=readFileSync(swPath,'utf8').replace('const CORE = [','const CORE = ['+JSON.stringify(panelURL)+','+JSON.stringify('./ne-vedis/index.html')+','+JSON.stringify(warningURL)+',');
// Keep centre navigation out of the shell cache (including Cloudflare clean URLs).
sw=sw.replace('  if (request.mode === "navigate") {',`  if (request.mode === "navigate" && /^\\/ne-vedis(?:\\/|$)/.test(url.pathname)) {
    e.respondWith(fetch(request).then(async res => {
      if(res.ok) { const c=await caches.open(CACHE); await c.put("./ne-vedis/index.html",res.clone()); }
      return res;
    }).catch(async()=> (await caches.match("./ne-vedis/index.html")) || Response.error()));
    return;
  }
  if (request.mode === "navigate") {`);
writeFileSync(swPath,sw);
console.log('PASS: self-contained safety guide and compact horizontal home panels');
