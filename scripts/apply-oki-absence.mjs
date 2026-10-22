import {readFileSync,writeFileSync,readdirSync,unlinkSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
execFileSync(process.execPath,['--test','tests/oki-absence.test.mjs'],{stdio:'inherit'});
const source=readFileSync('oki-absence.js','utf8');
const asset='assets/oki-absence-'+createHash('sha256').update(source).digest('hex').slice(0,16)+'.js';
writeFileSync('site/public/'+asset,source);
for(const name of readdirSync('site/public/assets')){
  if(/^oki-absence-[a-f0-9]{16}\.js$/.test(name)&&'assets/'+name!==asset)unlinkSync('site/public/assets/'+name);
}
for(const name of ['index.html','admin.html']){
  const path='site/public/'+name;let html=readFileSync(path,'utf8');
  const pattern=/(<script\b[^>]*id="ok-v80-neon-pet-js"[^>]*>)([\s\S]*?)(<\/script>)/;
  const match=html.match(pattern);assert(match,'OKI runtime anchor missing');
  let life=match[2];
  const replace=(old,value)=>{assert(life.includes(old),'OKI absence anchor missing: '+old);life=life.replace(old,value);};
  replace('function save(){try{','function save(){if(window.OKI_ABSENCE?.beforeSave(state)===false)return;try{');
  replace('load();tick();mark();','load();window.OKI_ABSENCE?.bind(state,load,()=>{close();hideBubble();});tick();mark();');
  replace("body=(!selected?","body=(window.OKI_ABSENCE?.notice(state,lang())||'')+(!selected?");
  const paused=['Развитие ждёт заботы','Growth waits for care','การเติบโตรอการดูแล'];let count=0;
  life=life.replace(/paused:'[^']*'/g,()=>"paused:"+JSON.stringify(paused[count++]));assert.equal(count,3);
  // Source-only comments are not needed in the inline payload; keep the HTML budget.
  life=life.replace(/^\/\* OKI Life[^\n]*\*\/\n/,'').replace(/^\s*\/\/[^\n]*\n/gm,'');
  html=html.replace(pattern,()=>'<script src="'+asset+'"></script>'+match[1]+life+match[3]);
  writeFileSync(path,html);
}
const sw='site/public/sw.js',worker=readFileSync(sw,'utf8');assert(worker.includes('const CORE = ['));
writeFileSync(sw,worker.replace('const CORE = [','const CORE = ["'+asset+'",'));
