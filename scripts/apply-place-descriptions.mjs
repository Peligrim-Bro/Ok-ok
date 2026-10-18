import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';
const path='site/public/index.html';let html=readFileSync(path,'utf8');
const notes=JSON.parse(readFileSync('content/place-descriptions.json','utf8'));
const wheel=JSON.parse(readFileSync('content/holiday-wheel.json','utf8'));
assert.equal(Object.keys(notes.places).length,wheel.length);
for(const p of wheel){
 const n=notes.places[p.id];assert(n,'Missing description: '+p.id);
 for(const lang of ['ru','en','th'])assert(typeof n.description[lang]==='string'&&n.description[lang].length>60,'Missing localized description: '+p.id+' '+lang);
 assert(n.sources.length>0,'Missing sources: '+p.id);
 for(const s of n.sources)assert(new URL(s.url).protocol==='https:');
}
const begin=html.indexOf('    const HOLIDAY_PLACES = '),end=html.indexOf(';',begin);
assert(begin>=0&&end>begin,'Wheel data anchor missing');
const runtimePlaces=runInNewContext(html.slice(begin+'    const HOLIDAY_PLACES = '.length,end));
assert.equal(runtimePlaces.length,wheel.length);
for(const p of runtimePlaces){const n=notes.places[p.id];if(n.area)p.area=n.area;}
// Keep the richer text out of the already large HTML; version and precache it.
const data='window.OKOK_PLACE_NOTES='+JSON.stringify(notes).replaceAll('<','\\u003c')+';\nwindow.OKOK_HOLIDAY_PLACES='+JSON.stringify(runtimePlaces).replaceAll('<','\\u003c')+';\n';
const asset='assets/data/place-descriptions-'+createHash('sha256').update(data).digest('hex').slice(0,16)+'.js';
mkdirSync('site/public/assets/data',{recursive:true});writeFileSync('site/public/'+asset,data);
html=html.slice(0,begin)+'    const HOLIDAY_PLACES = window.OKOK_HOLIDAY_PLACES;'+html.slice(end+1);
function replace(from,to){assert(html.includes(from),'Place description anchor missing: '+from.slice(0,80));html=html.replaceAll(from,to);}
replace('<script src="config.js?v=99"></script>','<script src="config.js?v=99"></script><script src="'+asset+'"></script>');
const helpers=String.raw`
    function placeNote(p){const n=window.OKOK_PLACE_NOTES;return n.places[n.aliases[p.id]||p.id];}
    function placeDescription(p){return L(placeNote(p)?.description||VERDICT[p.id]||p.blurb);}
    function placeSources(p){const n=placeNote(p);if(!n)return '';return '<details class="place-sources"><summary>'+({ru:'Источники и отзывы',en:'Sources and reviews',th:'แหล่งข้อมูลและรีวิว'})[lang]+'</summary><p class="hint">'+({ru:'Обзор открытых источников · ',en:'Public-source review · ',th:'ทบทวนข้อมูลสาธารณะ · '})[lang]+holidayEsc(n.reviewedAt)+'</p>'+n.sources.map(s=>'<p><a href="'+holidayEsc(s.url)+'" target="_blank" rel="noopener noreferrer">'+holidayEsc(new URL(s.url).hostname.replace(/^www\./,''))+' ↗</a></p>').join('')+'</details>';}
`;
replace('    const WHO = {',helpers+'\n    const WHO = {');
replace('const why = L(VERDICT[p.id] || p.blurb);','const why = placeDescription(p);');
replace('<p>${L(VERDICT[p.id] || p.blurb)}</p>','<p class="place-description">${placeDescription(p)}</p>${placeSources(p)}');
replace('${VERDICT[p.id] && L(VERDICT[p.id]) !== L(p.blurb) ?', '${!placeNote(p) && VERDICT[p.id] && L(VERDICT[p.id]) !== L(p.blurb) ?');
replace("<h3>'+holidayEsc(p.name)+'</h3>","<h3>'+holidayEsc(p.name)+'</h3><p class=\"place-description\">'+holidayEsc(placeDescription(p))+'</p>'+placeSources(p)+'");
// Keep corrected areas in the catalogue as well as the wheel.
for(const [id,n] of Object.entries(notes.places))if(n.area){
 // Mutate only matching catalogue data at runtime, without touching partner data.
 const marker='    function placeNote(p)';
 replace(marker,'    for(const p of PLACES){if(p.id==='+JSON.stringify(id)+')p.area='+JSON.stringify(n.area)+';}\n'+marker);
}
replace('</head>','<style>.place-sources a{color:var(--text);text-underline-offset:3px}</style></head>');
writeFileSync(path,html);
const swPath='site/public/sw.js';const sw=readFileSync(swPath,'utf8');assert(sw.includes('const CORE = ['));
writeFileSync(swPath,sw.replace('const CORE = [','const CORE = ['+JSON.stringify('./'+asset)+','));
console.log('PASS: 50 sourced place descriptions, RU/EN/TH, catalogue and holiday wheel, versioned offline data');
