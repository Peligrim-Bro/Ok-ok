import {readFileSync,writeFileSync} from 'node:fs';

// Owner decision 2026-10-18: one invitation; prices and terms after opening.
// Existing paid placements and invoices retain their purchased exposure.
const path='site/public/assets/ads/ads.js';
let ads=readFileSync(path,'utf8');
function replaceOnce(before,after){
 if(!ads.includes(before))throw Error('Single ad invitation anchor missing: '+before.slice(0,70));
 ads=ads.replace(before,after);
}
const headStart=ads.indexOf("  root.append(h('div', { class: 'okads-head' }");
const headEnd=ads.indexOf('\n  if (!data)',headStart);
if(headStart<0||headEnd<0)throw Error('Ad heading anchor missing');
ads=ads.slice(0,headStart)+ads.slice(headEnd);
const start=ads.indexOf('  const freeCount = Math.max(0, data.slots - ads.length);');
const end=ads.indexOf('  const mine = myOrder();',start);
if(start<0||end<0)throw Error('Ad invitation anchors missing');
ads=ads.slice(0,start)+`  list.append(h('button', { type: 'button', class: 'okad free', onclick: () => openOrder() },
    h('span', { class: 'okad-free-icon', text: '+' }),
    h('b', { text: tr('Заяви о себе', 'Get noticed', 'โปรโมตตัวคุณ') }),
    h('span', { class: 'okad-free-price', text: tr('Расскажи о своём деле →', 'Tell people about your business →', 'แนะนำธุรกิจของคุณ →') })));
  root.append(list);
`+ads.slice(end);
// Keep the paid-placement disclosure inside the form, before any submission.
replaceOnce("h('p', { class: 'hint', text: tr(`${price} USDT за ${hours} часов. Текст проверяется до оплаты.`, `${price} USDT for ${hours} hours. The text is checked before payment.`, `${price} USDT ต่อ ${hours} ชั่วโมง ตรวจข้อความก่อนชำระ`) }), form)",
"h('p', { class: 'hint', text: tr(`Платное размещение: ${price} USDT за ${hours} часов. Текст проверяется до оплаты.`, `Paid placement: ${price} USDT for ${hours} hours. The text is checked before payment.`, `โฆษณาแบบเสียเงิน: ${price} USDT ต่อ ${hours} ชั่วโมง ตรวจข้อความก่อนชำระ`) }), h('p', {class:'hint',text:tr('Платное размещение — это не рекомендация и не статус «Проверено ok-ok».','A paid placement is not a recommendation or an “ok-ok verified” status.','โฆษณาแบบเสียเงินไม่ใช่คำแนะนำหรือสถานะ \"ตรวจสอบโดย ok-ok\"')}), form)");
writeFileSync(path,ads);
console.log('Single ad invitation ready; pricing disclosed after opening.');
