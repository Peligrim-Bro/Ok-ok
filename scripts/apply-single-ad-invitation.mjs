import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

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
ads=ads.slice(0,start)+`  list.append(h('button', { type: 'button', class: 'okad free okad-invitation', onclick: () => openOrder() },
    h('span', { class: 'okad-invite-icon', 'aria-hidden': 'true', text: '•••' }),
    h('span', { class: 'okad-invite-copy' },
      h('b', { text: tr('Заяви о себе', 'Get noticed', 'บอกให้โลกรู้') }),
      h('span', { class: 'okad-invite-note', text: tr('Объявление, поздравление или просто привет.', 'An announcement, a celebration, or just a hello.', 'ประกาศ คำอวยพร หรือแค่ทักทายกัน') })),
    h('span', { class: 'okad-invite-arrow', 'aria-hidden': 'true', text: '↗' })));
  root.append(list);
`+ads.slice(end);
// Keep the paid-placement disclosure inside the form, before any submission.
replaceOnce("h('p', { class: 'hint', text: tr(`${price} USDT за ${hours} часов. Текст проверяется до оплаты.`, `${price} USDT for ${hours} hours. The text is checked before payment.`, `${price} USDT ต่อ ${hours} ชั่วโมง ตรวจข้อความก่อนชำระ`) }), form)",
"h('p', { class: 'hint', text: tr(`Платное размещение: ${price} USDT за ${hours} часов. Текст проверяется до оплаты.`, `Paid placement: ${price} USDT for ${hours} hours. The text is checked before payment.`, `โฆษณาแบบเสียเงิน: ${price} USDT ต่อ ${hours} ชั่วโมง ตรวจข้อความก่อนชำระ`) }), h('p', {class:'hint',text:tr('Платное размещение — это не рекомендация и не статус «Проверено ok-ok».','A paid placement is not a recommendation or an “ok-ok verified” status.','โฆษณาแบบเสียเงินไม่ใช่คำแนะนำหรือสถานะ \"ตรวจสอบโดย ok-ok\"')}), form)");
replaceOnce("tr('Разместить объявление', 'Place an ad', 'ลงโฆษณา')", "tr('Твоё сообщение', 'Your message', 'ข้อความของคุณ')");
writeFileSync(path,ads);
console.log('Single ad invitation ready; pricing disclosed after opening.');

// A single glossy message card, with no business-only framing or idle animation.
const cssPath='site/public/assets/ads/ads.css';
const css=readFileSync(cssPath,'utf8')+String.raw`
/* okok-personal-invitation-v1 */
html body #okAds .okads-list{margin-bottom:0}
html body #okAds .okad.okad-invitation{
 display:grid;grid-template-columns:52px minmax(0,1fr) 30px;gap:12px;align-items:center;
 min-height:128px;padding:18px 16px;box-sizing:border-box;text-align:left;isolation:isolate;overflow:hidden;
 border:1px solid var(--toy-rim)!important;border-radius:20px;
 background:radial-gradient(ellipse at 0% 100%,#57efc329,transparent 65%),radial-gradient(ellipse at 100% 0%,#ff936b33,transparent 65%),linear-gradient(135deg,var(--card),var(--bg))!important;
 color:var(--text)!important;box-shadow:inset 0 2px 1px #ffffff66,inset 0 -2px 1px #00000026,0 8px 18px #00000024!important;
 transition:transform .18s ease,border-color .18s ease;
}
html body #okAds .okad-invitation::before{content:'';position:absolute;inset:7px;border:1px solid #ffffff24;border-radius:14px;pointer-events:none;z-index:-1}
html body #okAds .okad-invite-icon{position:relative;display:grid;place-items:center;width:48px;height:44px;border-radius:15px;transform:rotate(-8deg);font-size:21px;letter-spacing:1px;font-weight:800;color:#082c29;background:radial-gradient(ellipse at 25% 0%,#ffffffcc,transparent 70%),linear-gradient(145deg,#98ffe0,#28c8ae);box-shadow:inset 0 2px 1px #ffffffcc,inset 0 -3px 3px #048e8980,0 6px 10px #00000026}
html body #okAds .okad-invite-icon::after{content:'';position:absolute;width:12px;height:12px;left:10px;bottom:-5px;background:#38d1b6;clip-path:polygon(0 0,100% 0,0 100%)}
html body #okAds .okad-invite-copy{display:grid;gap:6px;min-width:0}
html body #okAds .okad-invite-copy b{font-size:19px;line-height:1.2;letter-spacing:-.025em;overflow-wrap:anywhere}
html body #okAds .okad-invite-note{font-size:12px;line-height:1.45;font-weight:500;color:var(--muted);overflow-wrap:anywhere}
html body #okAds .okad-invite-arrow{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:linear-gradient(145deg,#ffc18f,#ff8b71);box-shadow:inset 0 1px 1px #ffffffb3,0 3px 7px #00000026;color:#40241e;font-size:20px;font-weight:700}
@media(hover:hover){html body #okAds .okad-invitation:hover{transform:translateY(-2px)}}
html body #okAds .okad-invitation:active{transform:scale(.985)}
@media(max-width:350px){html body #okAds .okad.okad-invitation{grid-template-columns:40px minmax(0,1fr) 26px;gap:9px;padding:16px 12px}html body #okAds .okad-invite-icon{width:37px;height:38px;font-size:18px;border-radius:12px}html body #okAds .okad-invite-copy b{font-size:17px}html body #okAds .okad-invite-arrow{width:26px;height:26px;font-size:18px}}
@media(prefers-reduced-motion:reduce){html body #okAds .okad.okad-invitation{transition:none;transform:none}}
`;
writeFileSync(cssPath,css);
const version=createHash('sha256').update(css).digest('hex').slice(0,16);
for(const file of ['site/public/index.html','site/public/admin.html','site/public/sw.js']){
 const source=readFileSync(file,'utf8');
 if(file.endsWith('index.html')||file.endsWith('sw.js')){
  if(!/assets\/ads\/ads\.css\?v=[^"'\s]+/.test(source))throw Error('Ad invitation stylesheet cache anchor missing');
 }
 writeFileSync(file,source.replace(/assets\/ads\/ads\.css\?v=[^"'\s]+/g,'assets/ads/ads.css?v='+version));
}
