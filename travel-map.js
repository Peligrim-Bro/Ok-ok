/* Geographic city map. Leaflet is bundled locally; street tiles load on demand. */
(() => {
'use strict';
const leaflet=window.L;
const tr=(ru,en,th)=>document.documentElement.lang==='th'?th:document.documentElement.lang==='en'?en:ru;
const places=[

 {id:'naban',category:'transport',name:'Na Baan Pier, Koh Larn',ru:'Ко Лан · пирс Na Baan',th:'เกาะล้าน · ท่าหน้าบ้าน',lat:12.92275,lng:100.78935,icon:'⛴',note:['Посадка на обратный паром в Паттайю. Сверьте время на пирсе перед поездкой.','Return ferry boarding for Pattaya. Confirm departure at the pier.','จุดขึ้นเรือกลับพัทยา โปรดตรวจสอบเวลาออกที่ท่าเรือ']},
 {id:'utp',category:'transport',name:'U-Tapao International Airport (UTP)',routeQuery:'U-Tapao International Airport',ru:'Аэропорт У-Тапао · UTP',th:'สนามบินอู่ตะเภา · UTP',lat:12.67994,lng:101.00503,icon:'✈',note:['Официальное расписание и актуальный статус рейса — по ссылкам ниже. Уточняйте время у авиакомпании.','Official schedule and current flight status are linked below. Confirm timing with your airline.','ดูตารางบินทางการและสถานะเที่ยวบินจากลิงก์ด้านล่าง โปรดยืนยันเวลากับสายการบิน']},
 {id:'airportbus',category:'transport',name:'Roong Reuang Coach Jomtien',routeQuery:'Roong Reuang Coach Jomtien Pattaya',ru:'Джомтьен · автобус в BKK',th:'จอมเทียน · รถบัสไปสุวรรณภูมิ',lat:12.905319,lng:100.869361,icon:'🚌',note:['Автобус до аэропорта Суварнабхуми (BKK). Это другой аэропорт, не У-Тапао.','Bus to Suvarnabhumi Airport (BKK). This is a different airport from U-Tapao.','รถบัสไปสนามบินสุวรรณภูมิ (BKK) ไม่ใช่สนามบินอู่ตะเภา']},
 {id:'truth',name:'Sanctuary of Truth',ru:'Храм Истины',th:'ปราสาทสัจธรรม',lat:12.9728,lng:100.8891,icon:'◆',note:['Деревянный храм-музей у моря в Наклыа.','Wooden museum by the sea in Naklua.','พิพิธภัณฑ์ไม้ริมทะเลในนาเกลือ']},
 {id:'mini',name:'Mini Siam',ru:'Мини-Сиам',th:'เมืองจำลอง',lat:12.9551,lng:100.9066,icon:'▣',note:['Парк миниатюр рядом с Sukhumvit Road.','Miniature park near Sukhumvit Road.','สวนเมืองจำลองใกล้ถนนสุขุมวิท']},
 {id:'terminal',name:'Terminal 21 Pattaya',ru:'Terminal 21 Pattaya',th:'เทอร์มินอล 21 พัทยา',lat:12.94984,lng:100.88969,icon:'✈',note:['Торговый центр в Северной Паттайе.','Shopping mall in North Pattaya.','ศูนย์การค้าในพัทยาเหนือ']},
 {id:'walking',name:'Walking Street',ru:'Walking Street',th:'ถนนคนเดิน',lat:12.9264,lng:100.8709,icon:'✦',note:['Пешеходная улица в Южной Паттайе.','Walking street in South Pattaya.','ถนนคนเดินในพัทยาใต้']},
 {id:'pier',category:'transport',name:'Bali Hai Pier',ru:'Bali Hai · паром до Ко Лана',th:'บาลีฮาย · เรือไปเกาะล้าน',lat:12.928486,lng:100.865937,icon:'⚓',note:['Обычный паром: пройдите к концу пирса и уточните посадку на Na Baan. Билет покупают у места посадки.','Public ferry: walk to the end of the pier and confirm the Na Baan boarding point. Buy tickets at boarding.','เรือโดยสาร: เดินไปปลายท่าและตรวจสอบจุดขึ้นเรือไปหน้าบ้าน ซื้อตั๋วบริเวณจุดขึ้นเรือ']},
 {id:'view',name:'Pattaya Viewpoint',ru:'Смотровая Паттайи',th:'จุดชมวิวพัทยา',lat:12.92226,lng:100.86608,icon:'◎',note:['Панорама бухты с холма Пратамнак.','Bay panorama from Pratumnak Hill.','ชมอ่าวจากเขาพระตำหนัก']},
 {id:'buddha',name:'Big Buddha',ru:'Большой Будда',th:'พระใหญ่',lat:12.91447,lng:100.86851,icon:'✧',note:['Храмовый комплекс на холме Пратамнак.','Temple complex on Pratumnak Hill.','วัดบนเขาพระตำหนัก']},
 {id:'jomtien',name:'Jomtien Beach',ru:'Пляж Джомтьен',th:'หาดจอมเทียน',lat:12.87688,lng:100.8826,icon:'≈',note:['Пляж и прогулочная набережная к югу от центра.','Beach and promenade south of the centre.','ชายหาดและทางเดินริมทะเลทางใต้ของใจกลางเมือง']},
 {id:'floating',name:'Pattaya Floating Market',ru:'Плавучий рынок',th:'ตลาดน้ำสี่ภาค',lat:12.86788,lng:100.90481,icon:'⌂',note:['Плавучий рынок на Sukhumvit Road.','Floating market on Sukhumvit Road.','ตลาดน้ำบนถนนสุขุมวิท']},
 {id:'nong',name:'Nong Nooch Tropical Garden',ru:'Сад Нонг Нуч',th:'สวนนงนุช',lat:12.76487,lng:100.93551,icon:'❋',note:['Тропический сад к югу от Паттайи, в районе Саттахип.','Tropical garden south of Pattaya in the Sattahip area.','สวนเขตร้อนทางใต้ของพัทยาในเขตสัตหีบ']},
 {id:'senate',name:'Senate Exchange',ru:'Senate Exchange',th:'Senate Exchange',lat:12.91474,lng:100.87114,icon:'$',partner:true,note:['Thappraya · партнёрская ссылка автора.','Thappraya · author’s referral link.','ทัพพระยา · ลิงก์แนะนำของผู้ดูแล']}
];
let host=null,map=null,resize=null,abort=null,clockTimer=0,linkOpened=false;
let saved=new Set();try{const ids=JSON.parse(localStorage.getItem('okok-map-saved-v1')||'[]');if(Array.isArray(ids))saved=new Set(ids.filter(id=>places.some(p=>p.id===id)));}catch{}
const outbound=['07:00','10:00','12:00','14:00','15:30','17:00','18:30'];
const inbound=['06:30','07:30','09:30','12:00','14:00','16:00','17:00','18:00'];
const busTimes=Array.from({length:17},(_,i)=>String(i+6).padStart(2,'0')+':00');
const schedules=p=>p.id==='pier'?outbound:p.id==='naban'?inbound:p.id==='airportbus'?busTimes:[];
function nextLabel(p,now=new Date()){
 const bits=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now);
 const minute=Number(bits.find(b=>b.type==='hour').value)*60+Number(bits.find(b=>b.type==='minute').value);
 const times=schedules(p),next=times.find(x=>Number(x.slice(0,2))*60+Number(x.slice(3))>minute);
 return next?tr('Следующий по расписанию: ','Next scheduled: ','รอบถัดไปตามตาราง: ')+next:tr('Сегодня рейсов по расписанию больше нет. Первый завтра: ','No more scheduled trips today. First tomorrow: ','ไม่มีรอบตามตารางแล้ววันนี้ รอบแรกพรุ่งนี้: ')+(times[0]||'');
}
function paragraph(parent,text,className=''){const el=document.createElement('p');el.className=className;el.textContent=text;parent.append(el);return el;}
function external(parent,text,url){const a=document.createElement('a');a.className='btn';a.textContent=text;a.href=url;a.target='_blank';a.rel='noopener';parent.append(a);return a;}
function timetable(parent,title,times){const d=document.createElement('details');d.open=true;const summary=document.createElement('summary');summary.textContent=title;d.append(summary);const row=document.createElement('div');row.className='map-times';for(const time of times){const span=document.createElement('span');span.textContent=time;row.append(span)}d.append(row);parent.append(d);}
function renderDetail(panel,p,opts,show){
 panel.replaceChildren();panel.dataset.place=p.id;
 const heading=document.createElement('div');heading.className='map-detail-heading';const h=document.createElement('h3');h.textContent=p.icon+' '+label(p);heading.append(h);
 const close=document.createElement('button');close.type='button';close.className='btn';close.textContent='×';close.setAttribute('aria-label',tr('Закрыть карточку','Close card','ปิดการ์ด'));close.addEventListener('click',()=>{panel.hidden=true},opts);heading.append(close);panel.append(heading);
 paragraph(panel,tr(...p.note));
 if(p.id==='pier'||p.id==='naban'){
  paragraph(panel,tr('Обычный паром: ориентир 30 ฿ в одну сторону · 35–45 минут. Время Таиланда (UTC+7).','Public ferry: indicative fare ฿30 each way · 35–45 minutes. Thailand time (UTC+7).','เรือโดยสาร: ค่าโดยสารอ้างอิง 30 บาทต่อเที่ยว · 35–45 นาที เวลาไทย (UTC+7)'));
  const next=paragraph(panel,nextLabel(p),'map-next');next.dataset.nextTrip='1';
  timetable(panel,tr('Bali Hai → Na Baan (Ко Лан)','Bali Hai → Na Baan (Koh Larn)','บาลีฮาย → หน้าบ้าน (เกาะล้าน)'),outbound);
  timetable(panel,tr('Na Baan → Bali Hai (Паттайя)','Na Baan → Bali Hai (Pattaya)','หน้าบ้าน → บาลีฮาย (พัทยา)'),inbound);
  paragraph(panel,tr('Справочное расписание, не онлайн-табло. Рейсы могут меняться из-за погоды. Подтвердите отправление на пирсе; у Tawaen другое расписание.','Reference timetable, not live departures. Weather may change trips. Confirm at the pier; Tawaen has a separate timetable.','ตารางอ้างอิง ไม่ใช่สถานะเรือสด รอบเรืออาจเปลี่ยนตามสภาพอากาศ โปรดยืนยันที่ท่าเรือ ท่าตาแหวนใช้ตารางต่างกัน'),'map-small');
  const sources=document.createElement('div');sources.className='map-detail-actions';external(sources,tr('Источник расписания','Timetable source','แหล่งข้อมูลตารางเรือ'),'https://pattayacitytourcoltd.com/blog/details/pattaya-to-koh-larn-ferry-complete-guide-to-traveling-from-pattaya-to-koh-larn-island');external(sources,tr('Как найти посадку','Boarding guide','วิธีหาจุดขึ้นเรือ'),'https://www.kohlarn.com/getting-to-koh-larn.html');panel.append(sources);
  const back=document.createElement('button');back.type='button';back.className='btn';back.textContent=p.id==='pier'?tr('Показать обратный пирс','Show return pier','ดูท่าเรือขากลับ'):tr('Показать посадку в Паттайе','Show Pattaya boarding','ดูจุดขึ้นเรือในพัทยา');back.addEventListener('click',()=>panel.closest('.spatial-hero').querySelector('[data-map-place="'+(p.id==='pier'?'naban':'pier')+'"]').click(),opts);panel.append(back);
 }else if(p.id==='utp'){
  const actions=document.createElement('div');actions.className='map-detail-actions';external(actions,tr('Официальное расписание','Official schedule','ตารางบินทางการ'),'https://www.utapao.com/th/flight-schedule');external(actions,tr('Прилёты · статус рейсов','Arrivals · flight status','เที่ยวบินขาเข้า · สถานะ'),'https://www.flightradar24.com/data/airports/utp/arrivals');external(actions,tr('Вылеты · статус рейсов','Departures · flight status','เที่ยวบินขาออก · สถานะ'),'https://www.flightradar24.com/data/airports/utp/departures');panel.append(actions);
  paragraph(panel,tr('Расписание открывается у аэропорта; статус — во внешнем сервисе. Данные рейсов здесь не копируются и не выдаются за онлайн-табло.','Schedule opens on the airport website; status opens in an external service. This card does not display a live flight board.','ตารางบินเปิดจากเว็บไซต์สนามบิน ส่วนสถานะเปิดในบริการภายนอก การ์ดนี้ไม่ใช่จอเที่ยวบินสด'),'map-small');
 }else if(p.id==='airportbus'){
  paragraph(panel,tr('По расписанию перевозчика: каждый час 06:00–22:00 · 158 ฿ · около 2 часов, зависит от пробок. Приходите минимум за 15 минут.','Operator timetable: hourly 06:00–22:00 · ฿158 · about 2 hours, traffic dependent. Arrive at least 15 minutes early.','ตามตารางผู้ให้บริการ: ทุกชั่วโมง 06:00–22:00 · 158 บาท · ประมาณ 2 ชั่วโมงขึ้นอยู่กับจราจร ควรมาถึงก่อนอย่างน้อย 15 นาที'));
  const next=paragraph(panel,nextLabel(p),'map-next');next.dataset.nextTrip='1';timetable(panel,tr('Джомтьен → Суварнабхуми (BKK)','Jomtien → Suvarnabhumi (BKK)','จอมเทียน → สุวรรณภูมิ (BKK)'),busTimes);
  external(panel,tr('Расписание и билеты у перевозчика','Operator timetable & tickets','ตารางเวลาและตั๋วจากผู้ให้บริการ'),'https://airportpattayabus.com/airport-jomtien/');
  paragraph(panel,tr('Цена и расписание могут меняться. Места и отправление подтвердите у перевозчика.','Fare and timetable may change. Confirm seats and departure with the operator.','ราคาและตารางเวลาอาจเปลี่ยน โปรดยืนยันที่นั่งและเวลาออกกับผู้ให้บริการ'),'map-small');
 }
 if(p.category==='transport')paragraph(panel,tr('Источники просмотрены: 02.10.2026','Sources reviewed: 2 Oct 2026','ตรวจสอบแหล่งข้อมูล: 2 ต.ค. 2569'),'map-small');
 const actions=document.createElement('div');actions.className='map-detail-actions';const route=external(actions,p.partner?tr('Открыть Senate','Open Senate','เปิด Senate'):tr('Построить маршрут','Get directions','เส้นทาง'),link(p));if(p.partner){route.rel='noopener sponsored';route.dataset.okPartner='senate';route.dataset.okPlacement='city-map'}
 const favorite=document.createElement('button');favorite.type='button';favorite.className='btn';favorite.setAttribute('aria-pressed',String(saved.has(p.id)));favorite.textContent=saved.has(p.id)?tr('★ Сохранено','★ Saved','★ บันทึกแล้ว'):tr('☆ Сохранить','☆ Save','☆ บันทึก');favorite.addEventListener('click',()=>{const before=new Set(saved);saved.has(p.id)?saved.delete(p.id):saved.add(p.id);try{localStorage.setItem('okok-map-saved-v1',JSON.stringify([...saved]));}catch{saved=before;paragraph(panel,tr('Не удалось сохранить. Проверьте доступ к хранилищу браузера.','Could not save. Check browser storage access.','บันทึกไม่สำเร็จ โปรดตรวจสอบพื้นที่จัดเก็บเบราว์เซอร์'),'map-small');return;}renderDetail(panel,p,opts,show);panel.closest('.spatial-hero').dispatchEvent(new Event('map-save'))},opts);actions.append(favorite);
 const share=document.createElement('button');share.type='button';share.className='btn';share.textContent=tr('Поделиться точкой','Share place','แชร์สถานที่');share.addEventListener('click',async()=>{const url=new URL(location.pathname,location.origin);url.searchParams.set('mapPlace',p.id);try{if(navigator.share)await navigator.share({title:label(p),url:url.href});else{await navigator.clipboard.writeText(url.href);paragraph(panel,tr('Ссылка скопирована','Link copied','คัดลอกลิงก์แล้ว'),'map-small');}}catch(e){if(e.name!=='AbortError')paragraph(panel,tr('Ссылка: ','Link: ','ลิงก์: ')+url.href,'map-small')}},opts);actions.append(share);panel.append(actions);
}

const label=p=>tr(p.ru,p.name,p.th);
function boot(){
 let el=document.querySelector('.pattaya-map');
 if(!el&&!linkOpened&&places.some(p=>p.id===new URL(location.href).searchParams.get('mapPlace'))){const opener=document.querySelector('[data-openmap]');if(opener){opener.click();el=document.querySelector('.pattaya-map');linkOpened=!!el;}}
 if(el===host)return;
 clearInterval(clockTimer);if(map){map.remove();map=null}if(resize)resize.disconnect();if(abort)abort.abort();host=el;if(!el)return;
 const hero=el.closest('.spatial-hero');abort=new AbortController();const opts={signal:abort.signal};
 const head=document.createElement('div');head.className='map-heading';
 const title=document.createElement('div');title.innerHTML='<b></b><small></small>';title.querySelector('b').textContent=tr('Паттайя: места и транспорт','Pattaya: places & transport','พัทยา: สถานที่และการเดินทาง');title.querySelector('small').textContent=tr('Паром · аэропорт · автобус · избранное','Ferry · airport · bus · saved places','เรือ · สนามบิน · รถบัส · จุดที่บันทึก');
 const reset=document.createElement('button');reset.type='button';reset.className='btn map-reset';reset.textContent=tr('Все точки','All places','ทุกจุด');head.append(title,reset);hero.prepend(head);
 const foot=document.createElement('div');foot.className='map-footer';foot.textContent=tr('Двигайте карту пальцем · масштаб двумя пальцами или + / −','Drag to explore · pinch or + / − to zoom','ลากแผนที่ · ใช้สองนิ้วหรือ + / − เพื่อซูม');hero.append(foot);
 const status=document.createElement('div');status.className='map-status';status.setAttribute('role','status');status.hidden=true;hero.append(status);
 const list=document.createElement('div');list.className='map-list';list.setAttribute('aria-label',tr('Места на карте','Map places','สถานที่บนแผนที่'));hero.append(list);
 const panel=document.createElement('section');panel.className='map-detail';panel.hidden=true;panel.setAttribute('aria-live','polite');hero.append(panel);
 let activePlace=null;
 const show=p=>{activePlace=p;panel.hidden=false;renderDetail(panel,p,opts,show);};
 const controls=document.createElement('div');controls.className='map-tools';
 const search=document.createElement('input');search.type='search';search.placeholder=tr('Найти место','Find a place','ค้นหาสถานที่');search.setAttribute('aria-label',search.placeholder);controls.append(search);
 let filter='all';const filterButtons=[];
 for(const [key,ru,en,th]of [['all','Все','All','ทั้งหมด'],['transport','Транспорт','Transport','การเดินทาง'],['saved','★ Избранное','★ Saved','★ บันทึก']]){const b=document.createElement('button');b.type='button';b.className='btn';b.dataset.mapFilter=key;b.textContent=tr(ru,en,th);b.setAttribute('aria-pressed',String(key===filter));b.addEventListener('click',()=>{filter=key;applyFilter()},opts);controls.append(b);filterButtons.push(b);}
 const empty=document.createElement('p');empty.className='map-empty';empty.hidden=true;empty.textContent=tr('Нет точек. Сохраните нужное место кнопкой ★ в карточке.','No places. Save a place with ★ in its card.','ไม่พบจุด บันทึกสถานที่ด้วยปุ่ม ★ ในการ์ด');hero.insertBefore(controls,list);hero.insertBefore(empty,list);
 const buttons=[],byId=new Map();
 const applyFilter=()=>{const term=search.value.trim().toLocaleLowerCase();let visible=0;buttons.forEach(({p,b})=>{const pass=(filter!=='transport'||p.category==='transport')&&(filter!=='saved'||saved.has(p.id))&&[p.name,p.ru,p.th].join(' ').toLocaleLowerCase().includes(term);b.hidden=!pass;if(pass)visible++;});empty.hidden=visible>0;filterButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mapFilter===filter)));};
 search.addEventListener('input',applyFilter,opts);hero.addEventListener('map-save',applyFilter,opts);
 const shortcut=document.createElement('div');shortcut.className='map-shortcuts';
 for(const id of ['pier','utp','airportbus']){const p=places.find(x=>x.id===id),b=document.createElement('button');b.type='button';b.className='btn';b.textContent=p.icon+' '+label(p);b.addEventListener('click',()=>{byId.get(id)?.b.click()},opts);shortcut.append(b);}hero.insertBefore(shortcut,controls);
 clockTimer=setInterval(()=>{if(activePlace&&panel.querySelector('[data-next-trip]'))panel.querySelector('[data-next-trip]').textContent=nextLabel(activePlace)},60000);
 if(!leaflet){status.hidden=false;status.textContent=tr('Карта не загрузилась. Откройте место по ссылке ниже.','Map unavailable. Open a place below.','โหลดแผนที่ไม่สำเร็จ เปิดสถานที่ด้านล่าง');for(const p of places){const b=document.createElement('button');b.type='button';b.className='btn';b.dataset.mapPlace=p.id;b.textContent=p.icon+' '+label(p);b.addEventListener('click',()=>show(p),opts);list.append(b);buttons.push({p,b});byId.set(p.id,{p,b});}applyFilter();const selected=places.find(p=>p.id===new URL(location.href).searchParams.get('mapPlace'));if(selected)show(selected);return}
 map=leaflet.map(el,{minZoom:10,maxZoom:18,scrollWheelZoom:false,zoomControl:false,zoomAnimation:!matchMedia('(prefers-reduced-motion: reduce)').matches,maxBounds:[[12.30,100.10],[13.60,101.80]],maxBoundsViscosity:.8}).setView([12.932,100.886],12);
 leaflet.control.zoom({position:'topright'}).addTo(map);leaflet.control.scale({imperial:false,position:'bottomleft'}).addTo(map);
 let loaded=false;
 const tiles=leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',crossOrigin:true}).addTo(map);
 tiles.on('tileload',()=>{loaded=true;status.hidden=true});tiles.on('tileerror',()=>{if(!loaded){status.hidden=false;status.textContent=tr('Фон карты недоступен. Точки и список мест работают; проверьте интернет.','Street tiles unavailable. Places and the list still work; check your connection.','โหลดพื้นหลังไม่ได้ จุดและรายการยังใช้ได้ กรุณาตรวจสอบอินเทอร์เน็ต')}});
 const markers=[];
 for(const p of places){
  const icon=leaflet.divIcon({className:'ok-map-pin'+(p.partner?' partner':''),html:'<span><i>'+p.icon+'</i></span>',iconSize:[40,40],iconAnchor:[20,40],popupAnchor:[0,-38]});
  const marker=leaflet.marker([p.lat,p.lng],{icon,title:label(p),alt:label(p),keyboard:true,riseOnHover:true}).addTo(map);
  const card=document.createElement('div');const b=document.createElement('b');b.className='map-place-title';b.textContent=label(p);const note=document.createElement('p');note.className='map-place-note';note.textContent=tr(...p.note);const a=document.createElement('a');a.className='btn map-place-link';a.href=link(p);a.target='_blank';a.rel=p.partner?'noopener sponsored':'noopener';a.textContent=p.partner?tr('Открыть Senate','Open Senate','เปิด Senate'):tr('Маршрут в Google Maps','Route in Google Maps','เส้นทางใน Google Maps');if(p.partner){a.dataset.okPartner='senate';a.dataset.okPlacement='city-map'}card.append(b,note,a);
  marker.bindPopup(card,{closeButton:true,closeOnClick:true,autoClose:true,maxWidth:270});marker.on('popupopen',()=>{show(p);const close=marker.getPopup().getElement().querySelector('.leaflet-popup-close-button');if(close)close.setAttribute('aria-label',tr('Закрыть','Close','ปิด'));if(p.partner&&window.OKCommerce)window.OKCommerce.track('partner_interest','senate','city-map')});markers.push(marker);
  const button=document.createElement('button');button.type='button';button.className='btn';button.textContent=p.icon+' '+label(p);button.dataset.mapPlace=p.id;button.addEventListener('click',()=>{map.setView([p.lat,p.lng],15,{animate:false});marker.openPopup()},opts);list.append(button);buttons.push({p,b:button});byId.set(p.id,{p,b:button});
 }
 applyFilter();const selected=places.find(p=>p.id===new URL(location.href).searchParams.get('mapPlace'));if(selected)byId.get(selected.id).b.click();
 reset.addEventListener('click',()=>{filter='all';search.value='';applyFilter();map.closePopup();map.fitBounds(leaflet.featureGroup(markers).getBounds(),{padding:[35,35],animate:false})},opts);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&map)map.closePopup()},{...opts,capture:true});
 resize=new ResizeObserver(()=>{if(map)map.invalidateSize({pan:false})});resize.observe(el);
}
function link(p){return p.partner?(window.OK_PARTNERS?.senate?.ref||'https://t.me/SenateExchange_bot?start=fi10072'):'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(p.routeQuery||p.name+' Pattaya')}
let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;boot()})}).observe(document.getElementById('app'),{childList:true});document.addEventListener('DOMContentLoaded',boot,{once:true});boot();
})();
