import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const referral='https://ex24qr.com/sf5vfvhnf';
const root='site/public';
const ticker={href:referral,ru:'EX24 · обмен валюты · хороший курс · доставка обычно около 2 часов',en:'EX24 · currency exchange · good rate · delivery usually about 2 hours',th:'EX24 · แลกเงิน · อัตราดี · จัดส่งโดยปกติประมาณ 2 ชั่วโมง'};
function rewrite(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){
 const path=dir+'/'+entry.name;
 if(entry.isDirectory()){rewrite(path);continue;}
 if(!/\.(html|js|json)$/.test(entry.name)||entry.name==='sw.js')continue;
 let text=readFileSync(path,'utf8');
 text=text.replaceAll('https://t.me/SenateExchange_bot?start=fi10072',referral)
  .replaceAll('Senate Exchange','EX24').replaceAll('SenateExchange_bot','EX24')
  .replace(/\bSenate\b/g,'EX24');
 // Legacy EX24 direct URLs must also use the owner's attribution.
 text=text.replace(/https?:\/\/(?:www\.)?(?:ex24\.pro|ex24qr\.com)[^\s"'<>`\\]*/gi,referral);
 writeFileSync(path,text);
}}
rewrite(root);
const path=root+'/index.html';let html=readFileSync(path,'utf8');
const anchor='    const WHO = {';assert(html.includes(anchor));
const copy={ru:{partnerSenateText:'Откроется EX24 по партнёрской ссылке автора.',partnerSenateBtn:'Открыть EX24'},en:{partnerSenateText:'EX24 will open through the author’s affiliate link.',partnerSenateBtn:'Open EX24'},th:{partnerSenateText:'เปิด EX24 ผ่านลิงก์แนะนำของผู้ดูแล',partnerSenateBtn:'เปิด EX24'}};
html=html.replace(anchor,`    // Retain internal partner IDs for saved places/tracking, never old branding.
    for(const [language,copy] of Object.entries(${JSON.stringify(copy)}))Object.assign(T[language],copy);
    for(const list of [ADS,RECS,CFG.ads||[]])for(const ad of list)if(ad.href===${JSON.stringify(referral)})Object.assign(ad,${JSON.stringify(ticker)});
    const checkedResource=PLACES.find(p=>p.id==='senate');
    if(!checkedResource)throw Error('Checked Senate resource missing');
    Object.assign(checkedResource,{name:'Senate Exchange',resourceUrl:'https://t.me/SenateExchange_bot?start=fi10072',checkedDate:'13.10.2026',blurb:{ru:'Проверенный ресурс для обмена валюты · 13.10.2026.',en:'Verified currency exchange resource · 13.10.2026.',th:'แหล่งแลกเงินที่ตรวจสอบแล้ว · 13.10.2026.'}});
    delete checkedResource.partner;delete checkedResource.phone;
    const currentExchange=PLACES.find(p=>p.id==='ex24');
    if(!currentExchange)throw Error('EX24 card missing');
    currentExchange.partner='senate';currentExchange.maps=${JSON.stringify(referral)};
    delete VERDICT.senate;
    PLACES.splice(PLACES.indexOf(currentExchange),1);PLACES.unshift(currentExchange);
`+anchor);
const badge='${exchangeCheckedLabel()}';
assert(html.includes(badge));html=html.replaceAll(badge,'${exchangeCheckedLabel()}${p.checkedDate ? " · "+p.checkedDate : ""}');
const cardBadge='? exchangeCheckedLabel() : t().verified';
assert(html.includes(cardBadge));html=html.replaceAll(cardBadge,'? exchangeCheckedLabel() + (p.checkedDate ? " · "+p.checkedDate : "") : t().verified');
// Senate remains only a dated reference card, not a promotional placement.
const partnerAction='${p.partner ? `<button class="btn tg" type="button" data-partner="${p.partner}">${t().partnerSenateBtn}</button>` : ""}';
assert(html.includes(partnerAction));html=html.replace(partnerAction,partnerAction+'\n            ${p.resourceUrl ? `<a class="btn tg" href="${p.resourceUrl}" target="_blank" rel="noopener sponsored">Senate Exchange</a>` : ""}');
// No misleading map action when EX24's destination is a referral, not an office.
const map='<a class="btn map" href="${p.maps}" target="_blank" rel="noopener">${t().maps}</a>';
assert(html.includes(map));html=html.replace(map,'${p.id === "ex24" || p.resourceUrl ? "" : `'+map+'`}');
const ghost='<a class="btn ghost" href="${p.maps}" target="_blank" rel="noopener">${t().maps}</a>';
assert(html.includes(ghost));html=html.replace(ghost,'${p.id === "ex24" || p.resourceUrl ? "" : `'+ghost+'`}');
// Close the topmost partner dialog before the underlying place sheet.
const overlayStart=html.indexOf('    function overlayOpen() {'),overlayEnd=html.indexOf('    function closeOverlay() {',overlayStart);
assert(overlayStart>=0&&overlayEnd>overlayStart);
let overlay=html.slice(overlayStart,overlayEnd);
const sheetFirst='      if (sheet && sheet.classList.contains("open")) return "sheet";';
assert(overlay.includes(sheetFirst));overlay=overlay.replace(sheetFirst,'').replace('      return null;',sheetFirst+'\n      return null;');
html=html.slice(0,overlayStart)+overlay+html.slice(overlayEnd);
writeFileSync(path,html);
const configPath=root+'/config.js';writeFileSync(configPath,readFileSync(configPath,'utf8')+'\nwindow.PATTAYAOK.ads=(window.PATTAYAOK.ads||[]).map(ad=>ad.href==='+JSON.stringify(referral)+'?{...ad,...'+JSON.stringify(ticker)+'}:ad);\n');
const mapPath=root+'/assets/spatial/pattaya-map.js';let mapJS=readFileSync(mapPath,'utf8');
mapJS=mapJS.replace(/note:\['Thappraya ·[^\n]+?\]\}/,"note:['EX24 · обмен с доставкой · партнёрская ссылка. Точка на карте не является адресом офиса.','EX24 · exchange with delivery · affiliate link. This map point is not an office address.','EX24 · แลกเงินพร้อมจัดส่ง · ลิงก์แนะนำ จุดบนแผนที่ไม่ใช่ที่อยู่สำนักงาน']}");
writeFileSync(mapPath,mapJS);
for(const file of ['index.html','admin.html','config.js','assets/commerce/partners.js','assets/spatial/pattaya-map.js']){
 const text=readFileSync(root+'/'+file,'utf8');
 if(file==='index.html')assert(text.includes('https://t.me/SenateExchange_bot?start=fi10072'),'Protected Senate referral missing');
 else assert(!/fi10072/.test(text),'Senate referral leaked into EX24 promotions: '+file);
 if(file!=='index.html')assert(!/Senate Exchange|SenateExchange_bot/.test(text),'Retired promotional exchange remains: '+file);
}
console.log('PASS: EX24 replaces Senate in catalogue, tickers, map and holiday wheel; owner referral preserved');
