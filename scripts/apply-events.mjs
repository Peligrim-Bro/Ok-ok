import {readFileSync,writeFileSync} from 'node:fs';
const path='site/public/assets/ads/ads.js';
const events=JSON.parse(readFileSync('content/events.json','utf8'));
for(const e of events){
 if(!e.id||!Number.isFinite(Date.parse(e.startAt))||!Number.isFinite(Date.parse(e.endAt))||Date.parse(e.endAt)<=Date.parse(e.startAt))throw Error('Invalid event dates');
 for(const lang of ['ru','en','th'])if(!e.title[lang]||!e.text[lang])throw Error('Missing event translation');
 for(const link of [e.maps,e.source])if(new URL(link).protocol!=='https:')throw Error('Invalid event link');
}
writeFileSync('site/public/assets/ads/events-data.js','window.OKOK_EVENTS='+JSON.stringify(events).replaceAll('<','\\u003c')+';\n');
let ads=readFileSync(path,'utf8');
const helpers=String.raw`
function currentEvent(now=Date.now()) {
 return (window.OKOK_EVENTS||[]).find(e=>Date.parse(e.endAt)>now && Date.parse(e.startAt)-now<=7*86400e3) || null;
}
function eventCard(e){
 const today=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Bangkok'});
 const when=e.startAt.slice(0,10)<=today ? tr('Сегодня','Today','วันนี้') : tr('Скоро','Coming up','เร็ว ๆ นี้');
 const card=h('article',{class:'okad okad-event'},
  h('div',{class:'okad-top'},h('b',{text:'🎉 '+tr('Идём тусить!','Let’s go out!','ไปเที่ยวกัน!')}),h('span',{class:'okad-badge',text:tr('Афиша · свободное место','Events · available slot','กิจกรรม · พื้นที่ว่าง')})),
  h('h4',{text:tr(e.title.ru,e.title.en,e.title.th)}),
  h('p',{class:'okad-text',text:tr(e.text.ru,e.text.en,e.text.th)}),
  h('p',{class:'okad-event-when',text:when+' · '+tr(e.when.ru,e.when.en,e.when.th)}),
  h('p',{class:'okad-event-venue',text:'📍 '+e.venue}),
  h('div',{class:'okad-event-links'},
   h('a',{class:'btn map',href:e.maps,target:'_blank',rel:'noopener noreferrer',text:tr('На карте →','Map →','แผนที่ →')}),
   h('a',{class:'btn ghost',href:e.source,target:'_blank',rel:'noopener noreferrer',text:tr('Подробности →','Details →','รายละเอียด →')})),
  h('p',{class:'okad-example-note',text:tr('Концерт, встреча, вечеринка — здесь можно собрать людей.','Concerts, meetups, parties — invite people here.','คอนเสิร์ต พบปะ ปาร์ตี้ — ชวนผู้คนมาที่นี่')}),
  h('button',{class:'btn call',type:'button',onclick:()=>openOrder(),text:tr('Разместить своё событие · 15 USDT / 24 ч','Post your event · 15 USDT / 24 h','ลงกิจกรรม · 15 USDT / 24 ชม.')}));
 return card;
}
`;
ads=ads.replace('function paint() {',helpers+'\nfunction paint() {');
const anchor='const freeCount = Math.max(0, data.slots - ads.length);';
if(!ads.includes(anchor))throw Error('Ads free-slot anchor missing');
ads=ads.replace(anchor,anchor+'\n  const event = freeCount ? currentEvent() : null;\n  const eventSlots = event ? 1 : 0;\n  if(event)list.append(eventCard(event));');
ads=ads.replace('Math.max(0, freeCount - 1)','Math.max(0, freeCount - 1 - eventSlots)').replace('if (freeCount) list.append','if (freeCount > eventSlots) list.append');
writeFileSync(path,ads);
const css='\n.okad-event{border-color:#a78bfa;background:linear-gradient(135deg,#8b5cf619,#22d3ee12)}.okad-event h4{margin:10px 0 6px;font-size:16px}.okad-event .okad-text{display:block;overflow:visible;-webkit-line-clamp:unset;max-height:none}.okad-event-when,.okad-event-venue{font-size:12px;line-height:1.5;margin:6px 0}.okad-event-links{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.okad-event .btn{font-size:12px!important;min-height:44px}.okad-event>.btn{width:100%;margin-top:8px}\n';
const cssPath='site/public/assets/ads/ads.css';writeFileSync(cssPath,readFileSync(cssPath,'utf8')+css);
for(const name of ['index.html','admin.html']){
 const file='site/public/'+name;let html=readFileSync(file,'utf8');
 html=html.replace(/<script\b[^>]*src="assets\/ads\/ads\.js\?v=\d+"[^>]*>/,tag=>'<script src="assets/ads/events-data.js?v=95" defer></script>\n'+tag.replace(/v=\d+/,'v=95'));
 html=html.replace(/ads\.css\?v=\d+/g,'ads.css?v=95');writeFileSync(file,html);
}
const swPath='site/public/sw.js';writeFileSync(swPath,readFileSync(swPath,'utf8').replace('const CORE = [','const CORE = ["./assets/ads/events-data.js?v=95",').replace(/ads\.js\?v=\d+/g,'ads.js?v=95').replace(/ads\.css\?v=\d+/g,'ads.css?v=95').replace('pattayaok-senate-ads-v94-','pattayaok-events-v95-'));
console.log('Event placeholder ready: one free slot only, Bangkok dates, expired events excluded.');
