import {readFileSync,writeFileSync} from 'node:fs';
// Editorial clarity only. No new verification dates, visits or business claims.
const translations={
 ru:{top:'Места для знакомства с Паттайей',week:'Скам недели',recTag:'реклама',adsTag:'ссылки',checking:'Нужна проверка',verified:'В каталоге',premium:'Реклама',openNow:'По графику открыто',closedNow:'По графику закрыто',why:'Перед визитом',reviews:'Отзывы и подробности',chatLead:'Telegram — новости и предупреждения о скамах. WhatsApp — связь с автором.',installTitle:'Добавить на главный экран',installLead:'Сохраните сайт на главный экран, чтобы открывать его как приложение.',rules1:'Карточка в каталоге не гарантирует качество услуг. Уточняйте условия, цены и часы перед визитом.',rules2:'Статус «Нужна проверка» означает, что сведения требуют подтверждения. Не выдаём наличие карточки за личный визит автора.',rules3:'Сообщения о проблемах рассматриваем отдельно. Жалоба сама по себе не доказывает нарушение.',rules4:'Партнёрские ссылки и платные размещения отмечаем отдельно от каталога.'},
 en:{top:'Places to explore in Pattaya',week:'Scam of the week',recTag:'ad',adsTag:'links',checking:'Needs checking',verified:'Listed',premium:'Advertisement',openNow:'Scheduled open',closedNow:'Scheduled closed',why:'Before you visit',reviews:'Reviews and details',installTitle:'Add to home screen',installLead:'Save the site to your home screen to open it like an app.',rules1:'A listing is not a service guarantee. Confirm prices, conditions and hours before visiting.',rules2:'“Needs checking” means details need confirmation. A listing does not imply a personal visit by the author.',rules3:'We review reports separately. A report alone does not prove wrongdoing.',rules4:'Affiliate links and paid placements are marked separately from the directory.'},
 th:{top:'สถานที่น่าสำรวจในพัทยา',week:'กลโกงประจำสัปดาห์',recTag:'โฆษณา',adsTag:'ลิงก์',checking:'ต้องตรวจสอบ',verified:'อยู่ในรายชื่อ',premium:'โฆษณา',openNow:'เปิดตามตาราง',closedNow:'ปิดตามตาราง',why:'ก่อนเดินทาง',reviews:'รีวิวและรายละเอียด',installTitle:'เพิ่มไปยังหน้าจอหลัก',installLead:'บันทึกเว็บไซต์ไว้บนหน้าจอหลักเพื่อเปิดเหมือนแอป',rules1:'การอยู่ในรายชื่อไม่ได้รับประกันบริการ กรุณายืนยันราคา เงื่อนไข และเวลาเปิดก่อนเดินทาง',rules2:'“ต้องตรวจสอบ” หมายถึงข้อมูลยังต้องยืนยัน การอยู่ในรายชื่อไม่ได้แปลว่าผู้ดูแลไปเยี่ยมด้วยตนเอง',rules3:'เราตรวจสอบรายงานแยกต่างหาก รายงานเพียงอย่างเดียวไม่ใช่หลักฐานว่ามีการกระทำผิด',rules4:'ลิงก์แนะนำและโฆษณาที่ชำระเงินจะแสดงแยกจากรายชื่อสถานที่'}
};
const notes={ru:'Карточки — ориентир для поиска, не гарантия услуг. Цены и часы уточняйте перед визитом.',en:'Listings help you find places; they are not service guarantees. Confirm prices and hours before visiting.',th:'รายชื่อช่วยค้นหาสถานที่ ไม่ใช่การรับประกันบริการ กรุณายืนยันราคาและเวลาเปิดก่อนเดินทาง'};
const verdicts={
 harlans:{ru:'Стейк-хаус. Перед визитом уточните меню и наличие столика.',en:'Steakhouse. Check the menu and table availability before visiting.',th:'ร้านสเต๊ก ตรวจสอบเมนูและโต๊ะว่างก่อนเดินทาง'},
 moom:{ru:'Морепродукты у воды. При заказе уточните цену за порцию или вес.',en:'Waterfront seafood. Check whether the price is per portion or by weight.',th:'อาหารทะเลริมน้ำ สอบถามว่าคิดราคาต่อจานหรือตามน้ำหนัก'},
 sky:{ru:'Ресторан с видом на море. Если едете к закату, заранее уточните наличие столика.',en:'Restaurant with a sea view. Check table availability ahead of a sunset visit.',th:'ร้านอาหารวิวทะเล หากไปช่วงพระอาทิตย์ตก ควรสอบถามโต๊ะว่างล่วงหน้า'},
 cabbages:{ru:'Ресторан в саду. Перед поездкой проверьте маршрут и часы работы.',en:'Garden restaurant. Check the route and opening hours before your trip.',th:'ร้านอาหารในสวน ตรวจสอบเส้นทางและเวลาเปิดก่อนเดินทาง'},
 sandwich:{ru:'Вариант для быстрого перекуса. Актуальное меню и цены уточните у заведения.',en:'An option for a quick meal. Check the current menu and prices with the venue.',th:'ตัวเลือกสำหรับมื้อด่วน ตรวจสอบเมนูและราคาปัจจุบันกับร้าน'},
 glasssilver:{ru:'Место в районе Наклуа / Вонгамат. Проверьте адрес нужного филиала на карте.',en:'A listing in Naklua / Wongamat. Check the correct branch address on the map.',th:'สถานที่ในย่านนาเกลือ / วงศ์อมาตย์ ตรวจสอบที่อยู่สาขาที่ต้องการบนแผนที่'}
};
const areaNames={ru:{'Central Pattaya':'Центральная Паттайя','East Pattaya':'Восточная Паттайя','North Pattaya':'Северная Паттайя','South Pattaya':'Южная Паттайя','Pratumnak Hill':'Холм Пратамнак','Pratumnak':'Пратамнак','Naklua':'Наклуа','Wongamat':'Вонгамат','Jomtien':'Джомтьен'},th:{'Central Pattaya':'พัทยากลาง','East Pattaya':'พัทยาตะวันออก','North Pattaya':'พัทยาเหนือ','South Pattaya':'พัทยาใต้','Pratumnak Hill':'เขาพระตำหนัก','Pratumnak':'พระตำหนัก','Naklua':'นาเกลือ','Wongamat':'วงศ์อมาตย์','Jomtien':'จอมเทียน'}};
const css=`
/* Owner request 2026-10-07: two scrolling strips, without category labels. */
html body #donateBtn::before,html body #donateBtn::after{animation:none!important}
html body :is(#recTicker,#ticker){font-size:12px}
html body .catalog-note{margin:0 0 14px;max-width:64ch;line-height:1.5;color:var(--muted);font-size:12px}
html body .card .verdict{line-height:1.55}
html body .card .mini{line-height:1.5;row-gap:5px}
html body :is(.news-rail,.okads)>h3{letter-spacing:-.015em}
`;
const helper=`
    function editorialArea(area) {
      let result=area || '';
      for(const [name,label] of Object.entries((${JSON.stringify(areaNames)})[lang] || {})) result=result.split(name).join(label);
      return result;
    }
    function editorialVisitNote() {return (${JSON.stringify({ru:'Условия уточняйте перед визитом',en:'Confirm details before visiting',th:'ยืนยันข้อมูลก่อนเดินทาง'})})[lang] || 'Confirm details before visiting';}
`;
for(const name of ['index.html']){
 const path='site/public/'+name;let html=readFileSync(path,'utf8');
 const replace=(from,to,required=name==='index.html')=>{if(required&&!html.includes(from))throw Error('Editorial anchor missing: '+from);html=html.replaceAll(from,to);};
 replace('    const PLACES = [',`    for(const [language,copy] of Object.entries(${JSON.stringify(translations)})) Object.assign(T[language],copy);\n    const PLACES = [`);
 for(const [id,copy] of Object.entries(verdicts)){
  const anchor=new RegExp('('+id+': \\{ ru:)[^\\n]+');
  if(id==='glasssilver') continue; // No legacy override; add below instead.
  if(!anchor.test(html))throw Error('Verdict missing: '+id);
  html=html.replace(anchor,id+': '+JSON.stringify(copy)+',');
 }
 replace('    const WHO = {',`    VERDICT.glasssilver=${JSON.stringify(verdicts.glasssilver)};\n    for(const place of PLACES) if((${JSON.stringify(Object.keys(verdicts))}).includes(place.id)) place.blurb=VERDICT[place.id];\n    const WHO = {`);
 replace('    function cardHTML(p) {',helper+'\n    function cardHTML(p) {');
 replace('${p.area}','${editorialArea(p.area)}');
 replace('<span>${t().checked} сен 2026</span>','<span class="visit-note">${editorialVisitNote()}</span>');
 replace('<h3 style="margin:18px 0 8px">${t().top}</h3>','<h3 style="margin:18px 0 8px">${t().top}</h3>\n        <p class="catalog-note">'+ '${('+JSON.stringify(notes)+')[lang]}</p>');
 // The description already appears as the main verdict when no override exists.
 replace('<p>${L(p.blurb)}</p>','${VERDICT[p.id] && L(VERDICT[p.id]) !== L(p.blurb) ? `<p>${L(p.blurb)}</p>` : ""}');
 html=html.replace('</head>','<style id="okok-editorial-polish-v1">'+css+'</style>\n</head>');
 // Remove labels from markup, not just visually; applyLang cannot restore them.
 html=html.replace(/<span class="ticker-tag" data-i="(?:recTag|adsTag)">[^<]*<\/span>/g,'');
 // Keep channel buttons elsewhere; only exclude it from the promotion list.
 const start=html.indexOf('    const ADS ='),end=html.indexOf('    const RECS =',start);
 if(start<0||end<0)throw Error('Ticker list boundaries missing');
 let ads=html.slice(start,end);
 ads=ads.replace(/^.*href: "https:\/\/t\.me\/PattayaOk_Ok"[^\n]*\n/gm,'');
 ads=ads.replace(/;\s*$/,'.filter(ad => !/pattayaok_ok/i.test(String(ad.href || "")));\n');
 html=html.slice(0,start)+ads+html.slice(end);
 writeFileSync(path,html);
}
const configPath='site/public/config.js';
writeFileSync(configPath,readFileSync(configPath,'utf8').replace(/^.*href: "https:\/\/t\.me\/PattayaOk_Ok"[^\n]*\n/gm,''));
console.log('PASS: editorial clarity RU/EN/TH, no invented verification dates, quieter secondary accents');
