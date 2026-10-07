import {readFileSync,writeFileSync} from 'node:fs';
const path='site/public/index.html';
let html=readFileSync(path,'utf8');
const anchor='<main class="wrap" id="app"></main>';
if(!html.includes(anchor))throw Error('Author chat: app anchor missing');
const dock='<div class="dock" id="dock"></div>';
if(!html.includes(dock))throw Error('Contact dock missing');
html=html.replace(dock,'');
html=html.replace(anchor,`${anchor}
<section class="wrap author-contact" aria-labelledby="authorContactTitle">
 <h2 id="authorContactTitle" data-i="notesTitle">От автора</h2>
 <div id="authorContactNotes"></div>
 <button class="btn" id="authorChatButton" type="button" aria-haspopup="dialog">Написать автору</button>
${dock}
</section>
<dialog id="authorChatDialog" aria-labelledby="authorChatTitle">
 <div class="author-chat-heading"><h2 id="authorChatTitle"></h2><button class="btn" id="authorChatClose" type="button">×</button></div>
 <p id="authorChatLead"></p>
 <div class="author-chat-topics"></div>
 <p id="authorChatStatus" role="status" aria-live="polite"></p>
 <a id="authorChatFallback" href="https://tawk.to/chat/6ac5e0bddd1f0034bfdc8335/1k4afbpev" target="_blank" rel="noopener" hidden></a>
</dialog>
<button id="authorChatMinimize" class="btn" type="button" hidden>Свернуть чат</button>`);
html=html.replace('</head>','<style id="okok-author-chat-style">'+readFileSync('author-chat.css','utf8')+'</style>\n</head>');
html=html.replace('</body>','<script id="okok-author-chat">'+readFileSync('author-chat.js','utf8')+'</script>\n</body>');
html=html.replace('</head>','<style id="responsive-layout">'+readFileSync('responsive-layout.css','utf8')+'</style></head>');
const filterAnchor='<div class="filters" id="filters"></div>\n      <div class="filters" id="zones"></div>';
if(!html.includes(filterAnchor))throw Error('Compact home: filter anchor missing');
html=html.replace(filterAnchor,`<details id="homeFilters">
 <summary class="btn" id="homeFiltersToggle">Фильтры</summary>
 ${filterAnchor}
</details>`);
const renderAnchor='      renderCityPicker();';
if(!html.includes(renderAnchor))throw Error('Compact home: render anchor missing');
html=html.replace(renderAnchor,renderAnchor+`
      const homeFilters=$('homeFilters');
      const filterVisible=city==='pattaya' && ['home','list'].includes(tab);
      homeFilters.hidden=!filterVisible;
      $('homeFiltersToggle').hidden=tab!=='home';
      if(tab!=='home')homeFilters.open=true;
      else if(homeFilters.dataset.screen!=='home')homeFilters.open=false;
      homeFilters.dataset.screen=tab;
      $('homeFiltersToggle').textContent=({ru:'Фильтры',en:'Filters',th:'ตัวกรอง'})[lang];
`);
const languageHeading='<h2 style="margin:0 0 6px">${t().langPickTitle}</h2>';
if(!html.includes(languageHeading))throw Error('Language picker heading missing');
html=html.replace(languageHeading,'<div class="row" style="justify-content:space-between;gap:12px"><h2 style="margin:0 0 6px">${t().langPickTitle}</h2><button class="lang" id="langClose" type="button" aria-label="${({ru:"Закрыть",en:"Close",th:"ปิด"})[lang]}">×</button></div>');
html=html.replace('      if (fromUser) pushOverlay("langMask");','      $("langClose").onclick = () => { if(fromUser) history.back(); else {mask.classList.remove("on");syncBackBtn();} };\n      if (fromUser) pushOverlay("langMask");');
writeFileSync(path,html);
console.log('PASS: author chat, lazy tawk.to, localized contact and topics');
