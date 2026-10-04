import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const cards=JSON.parse(readFileSync('content/bangkok.json','utf8'));
for(const p of cards){
 assert(['exchange','transport','sights'].includes(p.category));
 assert(new URL(p.source).protocol==='https:');
 for(const lang of ['ru','en','th'])assert(p.text[lang]);
}
const phuket=JSON.parse(readFileSync('content/phuket.json','utf8'));
for(const p of phuket){assert(['beach','sights','culture'].includes(p.category));assert(new URL(p.source).protocol==='https:');for(const lang of ['ru','en','th'])assert(p.text[lang]);}
const functions=String.raw`
    let city = (()=>{try{return ['bangkok','phuket'].includes(localStorage.getItem('okok-city'))?localStorage.getItem('okok-city'):'pattaya'}catch(_){return 'pattaya'}})();
    let bangkokCategory='all';
    const BANGKOK_CARDS=__CARDS__;
    const PHUKET_CARDS=__PHUKET__;
    const cityText=(ru,en,th)=>lang==='th'?th:lang==='en'?en:ru;
    const cityEscape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    function renderCityPicker(){
      let picker=$('cityPicker');
      if(!picker){picker=document.createElement('div');picker.id='cityPicker';picker.className='city-picker';$('searchBar').before(picker)}
      picker.setAttribute('aria-label',cityText('Город','City','เมือง'));
      picker.innerHTML=[['pattaya',cityText('Паттайя','Pattaya','พัทยา')],['bangkok',cityText('Бангкок','Bangkok','กรุงเทพฯ')],['phuket',cityText('Пхукет','Phuket','ภูเก็ต')]].map(([id,label])=>'<button class="btn ghost" type="button" data-city="'+id+'" aria-pressed="'+(city===id)+'">'+label+'</button>').join('');
      picker.onclick=e=>{const b=e.target.closest('[data-city]');if(!b||b.dataset.city===city)return;city=b.dataset.city;try{localStorage.setItem('okok-city',city)}catch(_){}bangkokCategory='all';$('q').value='';while(closeOverlay()){}setTab('home');};
      document.documentElement.dataset.city=city;
      document.querySelector('header.app h1').textContent=city==='phuket'?cityText('ok-ok · Пхукет','ok-ok · Phuket','ok-ok · ภูเก็ต'):city==='bangkok'?cityText('ok-ok · Бангкок','ok-ok · Bangkok','ok-ok · กรุงเทพฯ'):'PattayaOK';
      document.querySelector('.tickers').hidden=city!=='pattaya';
    }
    function renderBangkok(){
      const isPhuket=city==='phuket';
      const cityName=isPhuket?cityText('Пхукет','Phuket','ภูเก็ต'):cityText('Бангкок','Bangkok','กรุงเทพฯ');
      for(const id of ['searchBar','filters','zones'])$(id).style.display='none';
      const intro='<section class="bkk-intro"><span class="pv">'+cityText('Первый этап','First stage','ระยะแรก')+'</span><h2>'+(isPhuket?cityText('Открой Пхукет','Discover Phuket','ค้นพบภูเก็ต'):cityText('Знакомимся с Бангкоком','Discover Bangkok','เริ่มรู้จักกรุงเทพฯ'))+'</h2><p>'+(isPhuket?cityText('Идеи для отпуска: пляжи, прогулки, океанариум и культура. Выберите категорию и откройте место на карте.','Holiday ideas: beaches, walks, an aquarium and culture. Choose a category and open a place on the map.','ไอเดียสำหรับวันหยุด: ชายหาด เดินเล่น อควาเรียม และวัฒนธรรม เลือกหมวดหมู่แล้วเปิดสถานที่บนแผนที่'):cityText('Раздел наполняется постепенно. Пока — транспорт, обмен и достопримечательности по официальным источникам.','This section is growing gradually: transport, currency exchange and sights from official sources.','ส่วนนี้กำลังเพิ่มข้อมูลทีละขั้น: การเดินทาง แลกเงิน และสถานที่ท่องเที่ยวจากแหล่งทางการ'))+'</p></section>';
      if(tab==='shop'||tab==='scam'){
        $('app').innerHTML=intro+'<div class="empty">'+cityText('Этот раздел ещё готовится. Карточки других городов здесь не отображаются.','This section is still being prepared. Other cities’ cards are not shown here.','ส่วนนี้อยู่ระหว่างจัดเตรียม ไม่แสดงข้อมูลของเมืองอื่นที่นี่')+'</div>';return;
      }
      const cats=isPhuket?[['all',cityText('Все','All','ทั้งหมด')],['beach',cityText('Пляжи','Beaches','ชายหาด')],['sights',cityText('Виды и прогулки','Views & walks','วิวและเดินเล่น')],['culture',cityText('Культура','Culture','วัฒนธรรม')]]:[['all',cityText('Все','All','ทั้งหมด')],['exchange',cityText('Обмен','Exchange','แลกเงิน')],['transport',cityText('Транспорт','Transport','เดินทาง')],['sights',cityText('Посмотреть','Sights','สถานที่ท่องเที่ยว')]];
      const list=(isPhuket?PHUKET_CARDS:BANGKOK_CARDS).filter(p=>bangkokCategory==='all'||p.category===bangkokCategory);
      $('app').innerHTML=intro+'<div class="city-picker bkk-categories">'+cats.map(([id,label])=>'<button class="btn ghost" type="button" data-bkk-category="'+id+'" aria-pressed="'+(bangkokCategory===id)+'">'+label+'</button>').join('')+'</div><div class="bkk-grid">'+list.map(p=>'<article class="bkk-card"><span class="bkk-icon" aria-hidden="true">'+p.icon+'</span><span class="pv">'+cityText('Справочная карточка','Information card','ข้อมูลอ้างอิง')+'</span><h3>'+cityEscape(p.name)+'</h3><p>'+cityEscape(L(p.text))+'</p><div class="actions"><a class="btn call" href="'+cityEscape(p.source)+'" target="_blank" rel="noopener noreferrer">'+cityText('Официальный сайт','Official website','เว็บไซต์ทางการ')+'</a>'+(p.maps?'<a class="btn map" href="'+cityEscape(p.maps)+'" target="_blank" rel="noopener noreferrer">'+cityText('На карте','Map','แผนที่')+'</a>':'')+'</div></article>').join('')+'</div><p class="hint">'+cityText('Не рейтинг и не гарантия качества. Актуальные условия проверяйте у организации.','Not a ranking or quality guarantee. Confirm current terms with the organisation.','ไม่ใช่การจัดอันดับหรือการรับประกันคุณภาพ โปรดตรวจสอบเงื่อนไขล่าสุดกับองค์กร')+'</p>'+(isPhuket?'':partnersHTML());
      $('app').querySelectorAll('[data-bkk-category]').forEach(b=>b.onclick=()=>{bangkokCategory=b.dataset.bkkCategory;render()});
    }
` .replace('__PHUKET__',JSON.stringify(phuket).replaceAll('<','\\u003c')).replace('__CARDS__',JSON.stringify(cards).replaceAll('<','\\u003c'));
for(const name of ['index.html']){
 const path='site/public/'+name;let html=readFileSync(path,'utf8');
 const anchor='    function render() {\n      applyLang();';
 assert(html.includes(anchor),'Main render anchor missing');
 html=html.replace(anchor,functions+'\n'+anchor+'\n      renderCityPicker();\n      if(city !== "pattaya" && ["home","list","shop","scam"].includes(tab)){syncBackBtn();renderBangkok();renderDock();return;}');
 html=html.replace('</head>',`<style>
.city-picker{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.city-picker .btn{min-height:44px;flex:1;padding:10px 14px!important;font-size:13px!important}.city-picker [aria-pressed="true"]{outline:2px solid var(--mint,#78ecd0);outline-offset:-2px}.tickers[hidden]{display:none!important}.bkk-intro,.bkk-card{border:1px solid var(--line);border-radius:20px;background:var(--card);color:var(--text);padding:18px;margin:12px 0}.bkk-intro h2{margin:10px 0;font-size:24px}.bkk-intro p,.bkk-card p{line-height:1.6}.bkk-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.bkk-card{margin:0;min-width:0}.bkk-icon{display:block;font-size:30px;margin-bottom:10px}.bkk-card .actions{display:flex;gap:8px;flex-wrap:wrap}.bkk-card .actions .btn{min-height:44px;padding:10px 12px!important;font-size:12px!important}.bkk-categories .btn{flex:1 0 40%}@media(max-width:520px){.bkk-grid{grid-template-columns:1fr}.bkk-intro h2{font-size:21px}}
</style></head>`);
 writeFileSync(path,html);
}
const sw='site/public/sw.js';
writeFileSync(sw,readFileSync(sw,'utf8').replace(/const CACHE = "[^"]+";/,'const CACHE = "pattayaok-bangkok-v96-'+Date.now()+'";'));
console.log('City switch: Pattaya, Bangkok and Phuket; city-specific source cards.');
