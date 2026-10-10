import {readFileSync,writeFileSync} from 'node:fs';
const path='site/public/index.html';
let html=readFileSync(path,'utf8');
html=html.replace(/\n      \{\n        id: "ex24[^\"]*",[\s\S]*?\n      \},/g,'');
html=html.replace(/^.*href: "https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=Ex24[^\n]*\n/gmi,'');
html=html.replace(/^.*(?:ex24thap|ex24naklua|ex24prat)\s*:[^\n]*\n/gmi,'');
html=html.replace(/^.*who:.*EX24[^\n]*\n/gmi,'');
html=html.replace(/^.*who:.*ex24\.pro[^\n]*\n/gmi,'');
html=html.replace(/^.*who:.*тут и в EX24[^\n]*\n/gmi,'');
html=html.replace(/fxSpinText: "[^\"]*EX24[^\"]*"/g,(_,offset)=>{
 const before=html.slice(0,offset);
 const lang=before.lastIndexOf('th: {')>before.lastIndexOf('en: {')?'th':before.lastIndexOf('en: {')>before.lastIndexOf('ru: {')?'en':'ru';
 return 'fxSpinText: '+JSON.stringify({ru:'Senate Exchange — уточни актуальный курс перед обменом.',en:'Senate Exchange — check the current rate before exchanging.',th:'Senate Exchange — ตรวจสอบอัตราแลกเปลี่ยนปัจจุบันก่อนแลกเงิน'}[lang]);
});
// Remove legacy comparisons without reassigning third-party reviews to a new business.
html=html.replaceAll('Сверь с табло EX24 и T.T. в тот же день.','Сверь актуальный курс перед обменом.')
 .replaceAll('Compare with EX24 and T.T. boards the same day.','Check the current rate before exchanging.')
 .replaceAll('EX24/T.T.','лицензированных обменников')
 .replaceAll('стыковать T.T. и EX24.','сравнивать курсы.')
 .replaceAll('benchmark T.T. and EX24.','compare current rates.')
 .replaceAll('assets/images/ex24.jpg','assets/images/hero.jpg');
if(/ex24/i.test(html))throw Error('EX24 remains in generated HTML');
// Owner 2026-10-10: retain legacy cleanup, then restore two explicit exchange cards.
const copy={
 senate:{ru:'Быстрая доставка.',en:'Fast delivery.',th:'จัดส่งรวดเร็ว'},
 ex24:{ru:'Хороший курс · доставка обычно около 2 часов.',en:'Good exchange rate · delivery usually takes about 2 hours.',th:'อัตราแลกเปลี่ยนดี · จัดส่งโดยปกติประมาณ 2 ชั่วโมง'},
 checked:{ru:'✓ OK · Проверено',en:'✓ OK · Verified',th:'✓ OK · ตรวจสอบแล้ว'}
};
const restore=`
    // Owner-approved exchange cards; do not restore archived branches/reviews.
    const senateCard=PLACES.find(p=>p.id==='senate');
    if(!senateCard) throw Error('Senate catalogue card missing');
    Object.assign(senateCard,{name:'Senate Exchange',area:'Pattaya',badge:'ok',photo:'assets/icons/icon-192-v80.png',blurb:${JSON.stringify(copy.senate)},conditions:{ru:'Курс и условия доставки согласуйте в Telegram-боте.',en:'Confirm the rate and delivery terms in the Telegram bot.',th:'ยืนยันอัตราแลกเปลี่ยนและเงื่อนไขการจัดส่งในบอท Telegram'}});
    VERDICT.senate=senateCard.blurb;
    const ex24Card={id:'ex24',name:'EX24',cat:'cash',area:'Pattaya',price:'FX',badge:'ok',photo:'assets/images/ex24.jpg',maps:'https://www.google.com/maps/search/?api=1&query=EX24+Pattaya',blurb:${JSON.stringify(copy.ex24)},conditions:{ru:'Актуальный курс и время доставки уточните у EX24.',en:'Confirm the current rate and delivery time with EX24.',th:'ยืนยันอัตราแลกเปลี่ยนและเวลาจัดส่งล่าสุดกับ EX24'},comments:[]};
    PLACES.splice(PLACES.indexOf(senateCard),1);
    PLACES.unshift(senateCard,ex24Card);
    function exchangeCheckedLabel(){return (${JSON.stringify(copy.checked)})[lang];}
`;
if(!html.includes('    const WHO = {'))throw Error('Exchange card insertion anchor missing');
html=html.replace('    const WHO = {',restore+'\n    const WHO = {');
const badge='<span class="flag">'+ '${t().verified}</span>';
if(!html.includes(badge))throw Error('Card badge anchor missing');
html=html.replace(badge,'<span class="flag">'+ '${["senate","ex24"].includes(p.id) ? exchangeCheckedLabel() : t().verified}</span>');
const detail='<h2 style="margin:8px 0 4px">'+ '${p.name}</h2>';
if(!html.includes(detail))throw Error('Exchange detail heading missing');
html=html.replace(detail,detail+'\n          '+ '${["senate","ex24"].includes(p.id) ? `<span class="flag" style="position:static;display:inline-block">${exchangeCheckedLabel()}</span>` : ""}');
// Do not attach the archive's unverified stars/review counts to these owner cards.
html=html.replaceAll('<span class="stars">'+ '${stars(p.rating)} ${p.rating}</span>', '${["senate","ex24"].includes(p.id) ? "" : `<span class="stars">${stars(p.rating)} ${p.rating}</span>`}');
writeFileSync(path,html);
const config='site/public/config.js';
const source=readFileSync(config,'utf8').replace(/^.*href:.*ex24[^\n]*\n/gmi,'');
if(/ex24/i.test(source))throw Error('EX24 remains in runtime config');
writeFileSync(config,source);
console.log('PASS: owner exchange cards restored; obsolete branches and promotions removed');
