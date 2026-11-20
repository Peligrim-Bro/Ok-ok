import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

// Owner decision 2026-10-18: one invitation; prices and terms after opening.
// Existing paid placements and invoices retain their purchased exposure.
const path='site/public/assets/ads/ads.js';
let ads=readFileSync(path,'utf8');
const portraitSource='content/oki/invitation-illustrated-v2.webp';
const portraitVersion=createHash('sha256').update(readFileSync(portraitSource)).digest('hex').slice(0,16);
const portraitAsset='assets/oki/invitation-'+portraitVersion+'.webp';
mkdirSync('site/public/assets/oki',{recursive:true});
copyFileSync(portraitSource,'site/public/'+portraitAsset);
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
ads=ads.slice(0,start)+`  const freeCount=Math.max(0,data.slots-ads.length);
  const event=freeCount?currentEvent():null;
  const eventSlots=event?1:0;
  let inviteWrap=null;
  if(freeCount>eventSlots){
   inviteWrap=h('div', {class:'okad-invitation-wrap'});
   inviteWrap.append(h('button', {
     type:'button', class:'okad-invitation', onclick:()=>openOrder(),
     text:tr('Заяви о себе','Get noticed','บอกให้โลกรู้')
   }));
   list.append(inviteWrap);
  }
  if(event)list.append(eventCard(event));
  root.append(list);
  if(inviteWrap)mountInviteOki(inviteWrap);
`+ads.slice(end);
replaceOnce('function paint() {',readFileSync('ad-invitation-oki.js','utf8').replaceAll('__OKI_INVITATION_ASSET__','/'+portraitAsset)+'\nfunction paint() {\n  inviteOkiCleanup();');
// Keep the paid-placement disclosure inside the form, before any submission.
replaceOnce("h('p', { class: 'hint', text: tr(`${price} USDT за ${hours} часов. Текст проверяется до оплаты.`, `${price} USDT for ${hours} hours. The text is checked before payment.`, `${price} USDT ต่อ ${hours} ชั่วโมง ตรวจข้อความก่อนชำระ`) }), form)",
"h('p', { class: 'hint', text: tr(`Платное размещение: ${price} USDT за ${hours} часов. Текст проверяется до оплаты.`, `Paid placement: ${price} USDT for ${hours} hours. The text is checked before payment.`, `โฆษณาแบบเสียเงิน: ${price} USDT ต่อ ${hours} ชั่วโมง ตรวจข้อความก่อนชำระ`) }), h('p', {class:'hint',text:tr('Платное размещение — это не рекомендация и не статус «Проверено ok-ok».','A paid placement is not a recommendation or an “ok-ok verified” status.','โฆษณาแบบเสียเงินไม่ใช่คำแนะนำหรือสถานะ \"ตรวจสอบโดย ok-ok\"')}), form)");
replaceOnce("tr('Разместить объявление', 'Place an ad', 'ลงโฆษณา')", "tr('Твоё сообщение', 'Your message', 'ข้อความของคุณ')");
writeFileSync(path,ads);
console.log('Single ad invitation ready; pricing disclosed after opening.');

// Keep the invitation inline and preserve Oki’s existing peek animation.
const cssPath='site/public/assets/ads/ads.css';
const css=readFileSync(cssPath,'utf8')+String.raw`
/* okok-personal-invitation-text-v2 */
html body #okAds .okads-list{margin-bottom:0}
html body .hint.okad-oki-underlay-hidden{opacity:0;pointer-events:none}
html body #okAds .okad-invitation-wrap{--oki-rise:88px;position:relative;padding:0;isolation:isolate;min-width:0;scroll-margin-block:110px}
html body #okAds .okad-oki-peek{position:absolute;left:0;right:0;top:calc(-1 * var(--oki-rise));height:var(--oki-rise);overflow:hidden;pointer-events:none;z-index:2}
html body #okAds .okad-oki-peek[hidden]{display:none}
html body #okAds .okad-oki-rig{--oki-look-x:0;--oki-look-y:0;position:absolute;right:22px;top:0;height:calc(var(--oki-rise) + 6px);aspect-ratio:384/324;display:block;pointer-events:none;transform:translateY(105%);animation:okad-oki-rise .6s cubic-bezier(.2,.8,.2,1) forwards,okad-oki-retreat .5s 6.4s ease-in forwards}
html body #okAds :is(.okad-oki-portrait,.okad-oki-head,.okad-oki-hand){position:absolute;inset:0;width:100%;height:100%;max-width:none;display:block;pointer-events:none;background-image:var(--oki-portrait);background-size:100% 100%;background-repeat:no-repeat}
html body #okAds .okad-oki-portrait{clip-path:polygon(36% 70%,65% 70%,70% 77%,70% 94%,30% 94%,31% 77%)}
html body #okAds .okad-oki-head{clip-path:polygon(0 0,100% 0,100% 71.5%,0 71.5%);transform-origin:50% 69%;translate:calc(var(--oki-look-x) * 2px) calc(var(--oki-look-y) * 1px);rotate:calc(var(--oki-look-x) * 5deg);transition:translate .16s ease-out,rotate .16s ease-out;animation:okad-oki-greet 5.2s .6s ease-in-out both}
html body #okAds .okad-oki-hand-left{clip-path:polygon(0 71.5%,36% 71.5%,40% 86%,42% 100%,0 100%);transform-origin:34% 74%;animation:okad-oki-point-left 1.15s 1.3s ease-in-out 2}
html body #okAds .okad-oki-hand-right{clip-path:polygon(65% 71.5%,100% 71.5%,100% 100%,61% 100%,60% 86%);transform-origin:66% 74%;animation:okad-oki-point-right 1.15s 1.45s ease-in-out 2}
html body #okAds .okad-oki-speech{position:absolute;left:0;right:140px;top:4px;padding:7px 9px;border:1px solid var(--toy-rim);border-radius:15px 15px 3px 15px;background:var(--card);color:var(--text);box-shadow:inset 0 1px 0 #ffffff66,0 4px 10px #0002;font-size:12px;font-weight:750;line-height:1.35;opacity:0;animation:okad-oki-say .25s .45s ease forwards}
html body #okAds button.okad-oki-close{position:absolute;right:0;top:0;width:44px;min-width:44px;height:44px;min-height:44px;padding:0;border:0!important;background:transparent!important;box-shadow:none!important;color:var(--muted)!important;font-size:22px;pointer-events:auto;z-index:2}
@keyframes okad-oki-rise{to{transform:translateY(0)}}
@keyframes okad-oki-retreat{to{transform:translateY(108%)}}
@keyframes okad-oki-greet{0%,100%{transform:rotate(0deg)}12%{transform:rotate(-4deg)}25%,68%{transform:rotate(0deg)}44%{transform:rotate(3deg)}78%{transform:rotate(-2deg)}}
@keyframes okad-oki-point-left{0%,100%{transform:rotate(0deg) translateY(0)}45%,62%{transform:rotate(-9deg) translateY(3px)}}
@keyframes okad-oki-point-right{0%,100%{transform:rotate(0deg) translateY(0)}45%,62%{transform:rotate(9deg) translateY(3px)}}
@keyframes okad-oki-say{to{opacity:1}}
html body #okAds button.okad-invitation{
 position:relative;z-index:1;display:inline-flex;align-items:center;min-height:44px;
 padding:0 4px;border:0!important;border-radius:0!important;background:transparent!important;
 color:var(--text)!important;box-shadow:none!important;text-shadow:none;font:inherit;
 font-weight:700;text-decoration:underline;text-underline-offset:.2em;cursor:pointer;
}
@media(prefers-reduced-motion:reduce){html body #okAds :is(.okad-oki-rig,.okad-oki-head,.okad-oki-hand){animation:none;transition:none;transform:none;translate:none;rotate:none}html body #okAds .okad-oki-speech{animation:none;opacity:1}}
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
const swPath='site/public/sw.js',sw=readFileSync(swPath,'utf8');
if(!sw.includes('const CORE = ['))throw Error('Oki offline asset anchor missing');
writeFileSync(swPath,sw.replace('const CORE = [','const CORE = ['+JSON.stringify('./'+portraitAsset)+','));
