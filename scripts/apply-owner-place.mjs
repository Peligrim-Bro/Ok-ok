import {readFileSync,writeFileSync,mkdirSync,copyFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const place=JSON.parse(readFileSync('content/musselana-shabu.json','utf8'));
assert.equal(place.id,'musselana-shabu');
for(const lang of ['ru','en','th'])for(const key of ['blurb','conditions','hoursText','ownerReview'])assert(place[key][lang]);
for(const photo of place.photos){
 const source='content/places/musselana-shabu/'+photo.split('/').pop();assert(existsSync(source));
 const bytes=readFileSync(source);assert(bytes.length>16&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP','Invalid owner photo: '+source);
 const target='site/public/'+photo;mkdirSync(target.slice(0,target.lastIndexOf('/')),{recursive:true});copyFileSync(source,target);
}
const path='site/public/index.html';let html=readFileSync(path,'utf8');
const replace=(from,to)=>{assert(html.includes(from),'Owner place anchor missing: '+from);html=html.replaceAll(from,to);};
const card={...place};delete card.coordinates;
replace('    const WHO = {',`    // Personal recommendation and photos supplied by the owner, 2026-10-12.
    const ownerSoupPlace=${JSON.stringify(card).replaceAll('<','\\u003c')};
    PLACES.splice(PLACES.findIndex(p=>p.cat==='food')+1,0,ownerSoupPlace);
    GEO[ownerSoupPlace.id]=${JSON.stringify(place.coordinates)};
    const WHO = {`);
replace('["senate","ex24"].includes(p.id)','["senate","ex24","musselana-shabu"].includes(p.id)');
replace('function hoursOf(p) { return p.hours || HOURS[p.id] || "10:00–22:00"; }','function hoursOf(p) { return p.hoursText ? L(p.hoursText) : p.hours || HOURS[p.id] || "10:00–22:00"; }');
// A mobile stall has an approximate schedule, not a known closing time/live status.
const schedule='${({ru:"Примерный график",en:"Approximate hours",th:"เวลาโดยประมาณ"})[lang]}';
replace('<span class="${open?"ok":"off"}">${open ? t().openNow : t().closedNow}</span>','${p.hoursText ? `<span class="off">'+schedule+'</span>` : `<span class="${open?"ok":"off"}">${open ? t().openNow : t().closedNow}</span>`}');
replace('<span class="${isOpenNow(hoursOf(p))?"ok":"off"}">${isOpenNow(hoursOf(p)) ? t().openNow : t().closedNow}</span>','${p.hoursText ? `<span class="off">'+schedule+'</span>` : `<span class="${isOpenNow(hoursOf(p))?"ok":"off"}">${isOpenNow(hoursOf(p)) ? t().openNow : t().closedNow}</span>`}');
replace('<h3>${t().reviews}</h3>','<h3>${t().reviews}</h3>\n          ${p.ownerReview ? `<p class="owner-review">${L(p.ownerReview)}</p>` : ""}');
writeFileSync(path,html);
console.log('PASS: owner-recommended Musselana soup cart, OK badge, approximate hours, exact Plus Code and five owner photos');
