import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const data=JSON.parse(readFileSync('content/services.json','utf8'));
assert.equal(data.providers.filter(p=>p.category==='bikes').length,5);
assert.equal(new Set(data.providers.map(p=>p.id)).size,data.providers.length);
for(const p of data.providers){assert(['bikes','visas'].includes(p.category));for(const l of ['ru','en','th'])assert(p.text[l]);for(const u of [p.website,p.reviews].filter(Boolean))assert.equal(new URL(u).protocol,'https:');}
const js=readFileSync('catalogue-services.js','utf8').replace('__SERVICE_DATA__',JSON.stringify(data));
const asset='assets/catalogue-'+createHash('sha256').update(js).digest('hex').slice(0,16)+'.js';
writeFileSync('site/public/'+asset,js);
let html=readFileSync('site/public/index.html','utf8');
const anchor='      renderDock();\n    }\n\n    document.querySelectorAll("nav.tab button")';
assert(html.includes(anchor));
html=html.replace(anchor,'      renderDock();\n      window.okokScreen?.(tab,city);\n    }\n\n    document.querySelectorAll("nav.tab button")');
html=html.replace('renderBangkok();renderDock();return;','renderBangkok();renderDock();window.okokScreen?.(tab,city);return;');
const contact='          <div class="actions">\n            ${p.partner';
assert(html.includes(contact));
html=html.replace(contact,'          <p class="service-attribution">${window.okokAttribution?.()||""}</p>\n'+contact);
html=html.replace('${wa(p.phone)}','${wa(p.phone)+"?text="+encodeURIComponent(window.okokContactMessage?.()||"")}');
html=html.replace('</body>','<script src="'+asset+'"></script></body>');
html=html.replace('</head>',`<style id="okok-service-style">
#citySelect{height:44px;min-height:44px;max-height:44px;min-width:160px;padding:8px 34px 8px 14px!important;font:inherit;color:var(--text);background-color:var(--card);border:1px solid var(--line);border-radius:18px}#citySelect option{background:var(--card);color:var(--text)}
.service-tabs{display:flex;gap:8px;margin:8px 0 16px}.service-tabs .btn{flex:1;min-width:0;min-height:44px;padding:10px 6px!important;font-size:14px!important}.service-tabs [aria-pressed=true]{outline:2px solid var(--mint,#57efc3);outline-offset:-2px}.service-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.service-card{border:1px solid var(--line);border-radius:22px;padding:18px;background:var(--card);display:flex;flex-direction:column;min-width:0}.service-icon{font-size:28px}.service-card h3{margin:12px 0 4px;overflow-wrap:anywhere}.service-card p{line-height:1.6}.service-card>.btn{margin-top:auto;white-space:normal;min-height:44px}.service-rating small{display:block;color:var(--muted)}.service-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px;position:sticky;top:0;background:var(--card);z-index:5}.service-heading h2{font-size:20px;margin:0;overflow-wrap:anywhere}.service-heading button{flex:0 0 44px;height:44px}.service-attribution{padding:12px;border:1px solid var(--line);border-radius:14px;line-height:1.5}#sheet .actions{flex-wrap:wrap}#sheet .actions a{white-space:normal}@media(max-width:560px){.service-grid{grid-template-columns:1fr}}
</style></head>`);
writeFileSync('site/public/index.html',html);
const sw='site/public/sw.js';let worker=readFileSync(sw,'utf8');assert(worker.includes('const CORE = ['));worker=worker.replace('const CORE = [','const CORE = [\n  "'+asset+'",');writeFileSync(sw,worker);
console.log('Compact navigation and curated service catalogue ready.');
