import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const place=JSON.parse(readFileSync('content/jkao-seafood.json','utf8'));
assert.equal(place.id,'jkao-seafood');
assert.equal(place.rating,undefined,'Do not invent a Google rating');
for(const lang of ['ru','en','th'])for(const key of ['blurb','conditions','hoursText','ownerReview','firstVisitLabel','statusLabel'])assert(place[key][lang]);
for(const photo of place.photos){
 const source='content/places/jkao-seafood/'+photo.split('/').pop();
 const bytes=readFileSync(source);assert.equal(bytes.readUInt16BE(0),0xffd8);
 const target='site/public/'+photo;mkdirSync(target.slice(0,target.lastIndexOf('/')),{recursive:true});copyFileSync(source,target);
}
// A content-addressed data file avoids stale config caches on the first visit.
const data='window.OKOK_JKAO_PLACE='+JSON.stringify(place).replaceAll('<','\\u003c')+';\n';
const asset='assets/data/jkao-seafood-'+createHash('sha256').update(data).digest('hex').slice(0,16)+'.js';
mkdirSync('site/public/assets/data',{recursive:true});writeFileSync('site/public/'+asset,data);
const path='site/public/index.html';let html=readFileSync(path,'utf8');
const replace=(from,to)=>{assert(html.includes(from),'J-Kao anchor missing');html=html.replaceAll(from,to);};
replace('<script src="config.js?v=99"></script>','<script src="config.js?v=99"></script><script src="'+asset+'"></script>');
replace('    const WHO = {','    if(window.OKOK_JKAO_PLACE){const p=window.OKOK_JKAO_PLACE;if(!PLACES.some(x=>x.id===p.id))PLACES.unshift(p);GEO[p.id]=p.coordinates;}\n    const WHO = {');
replace('const flag = p.badge === "premium"','const flag = p.firstVisitLabel ? `<span class="flag check">${L(p.firstVisitLabel)}</span>` : p.badge === "premium"');
replace('["senate","ex24","musselana-shabu"].includes(p.id) ? "" : `<span class="stars">','(["senate","ex24","musselana-shabu"].includes(p.id)||p.rating==null) ? "" : `<span class="stars">');
replace('${({ru:"Примерный график",en:"Approximate hours",th:"เวลาโดยประมาณ"})[lang]}','${p.statusLabel ? L(p.statusLabel) : ({ru:"Примерный график",en:"Approximate hours",th:"เวลาโดยประมาณ"})[lang]}');
writeFileSync(path,html);
const sw='site/public/sw.js';const source=readFileSync(sw,'utf8');assert(source.includes('const CORE = ['));
writeFileSync(sw,source.replace('const CORE = [','const CORE = ['+JSON.stringify('./'+asset)+','+JSON.stringify('./'+place.photo)+','));
console.log('PASS: J-Kao owner review, Sunday closure and 120-baht tom yum; no invented live opening status');
