import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
const html=readFileSync('site/public/index.html','utf8');
const start=html.indexOf('    let city = (()=>');
const end=html.indexOf('    function render() {',start);
assert(start>0&&end>start);
const code=html.slice(start,end);
for(const lang of ['ru','en','th']){
 const nodes={app:{innerHTML:''},searchBar:{style:{}},filters:{style:{}},zones:{style:{}}};
 nodes.app.querySelectorAll=()=>[];
 const ctx={lang,tab:'home',localStorage:{getItem:()=>null},$:id=>nodes[id],L:p=>p[lang],partnersHTML:()=>'<div>partners preserved</div>'};
 runInNewContext(code+"\nrenderBangkok();",ctx);
 assert.equal((nodes.app.innerHTML.match(/class=\"bkk-card\"/g)||[]).length,4);
 assert(nodes.app.innerHTML.includes('Wat Pho'));
 assert(!nodes.app.innerHTML.includes('okAds'));
 runInNewContext("bangkokCategory='exchange';renderBangkok();",ctx);
 assert.equal((nodes.app.innerHTML.match(/class=\"bkk-card\"/g)||[]).length,1);
 assert(nodes.app.innerHTML.includes('SuperRich'));
 ctx.tab='scam';runInNewContext('renderBangkok();',ctx);
 assert(!nodes.app.innerHTML.includes('Jet ski'));
 assert(!nodes.app.innerHTML.includes('SuperRich'));
}
const nav=html.match(/<nav class="tab">([\s\S]*?)<\/nav>/)[1];
assert.equal((nav.match(/data-tab=/g)||[]).length,5);
assert(html.includes('HAF8KW')===false); // Registry remains shared, not duplicated inline.
console.log('PASS Bangkok: RU/EN/TH, four cards, category filtering, no Pattaya ads/scams, five navigation items');
