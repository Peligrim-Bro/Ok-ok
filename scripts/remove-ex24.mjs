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
writeFileSync(path,html);
const config='site/public/config.js';
const source=readFileSync(config,'utf8').replace(/^.*href:.*ex24[^\n]*\n/gmi,'');
if(/ex24/i.test(source))throw Error('EX24 remains in runtime config');
writeFileSync(config,source);
console.log('PASS: EX24 listings, promotions and legacy references removed');
