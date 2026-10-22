import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync,unlinkSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

execFileSync(process.execPath,['--test','tests/oki-place-guide.test.mjs'],{stdio:'inherit'});
const source=readFileSync('oki-place-guide.js','utf8');
// This module uses explicit semicolons; omit source comments and indentation.
// No third-party minifier or runtime request is required.
const js=source.split('\n').filter(line=>!line.trimStart().startsWith('//')).map(line=>line.trim()).join('');
const css=readFileSync('oki-place-guide.css','utf8');
const stem='oki-place-guide-'+createHash('sha256').update(js+css).digest('hex').slice(0,16);
for(const file of readdirSync('site/public/assets'))if(/^oki-place-guide-[a-f0-9]{16}\.(js|css)$/.test(file)&&!file.startsWith(stem+'.'))unlinkSync('site/public/assets/'+file);
writeFileSync('site/public/assets/'+stem+'.js',js);
writeFileSync('site/public/assets/'+stem+'.css',css);
const path='site/public/index.html';let html=readFileSync(path,'utf8');
const anchor="$('holidayFamily').checked;holidayRenderBody();};holidayRenderBody();";
assert(html.includes(anchor),'Guide integration anchor missing');
html=html.replace(anchor,anchor+"import('./assets/"+stem+".js').then(()=>window.OKOK_GUIDE.mount()).catch(()=>{});");
writeFileSync(path,html);
const swPath='site/public/sw.js',sw=readFileSync(swPath,'utf8');
assert(sw.includes('const CORE = ['),'Guide precache anchor missing');
writeFileSync(swPath,sw.replace('const CORE = [','const CORE = ["./assets/'+stem+'.js","./assets/'+stem+'.css",'));
console.log('PASS: optional Oki place guide; local catalogue, no service dependency');
