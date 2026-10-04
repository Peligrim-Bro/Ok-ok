import { readFileSync, writeFileSync } from 'node:fs';
const path='site/public/index.html';
let html=readFileSync(path,'utf8');
html=html.replace(/\n      \{\n        id: "supermao",[\s\S]*?\n      \},/,'');
html=html.replace(/^.*href: "https:\/\/maps\.app\.goo\.gl\/avmLVvqgaYhCYtGP7[^\n]*\r?\n/gm,'');
// Also exclude a stale promotion supplied by an optional runtime configuration.
const start=html.indexOf('    const ADS =');
const end=html.indexOf('    const RECS =',start);
if(start<0||end<0)throw new Error('Promotion list boundaries missing');
let ads=html.slice(start,end);
if(!ads.includes('.filter(')){
  ads=ads.replace('const ADS = ','const ADS = (').replace(/\];\s*$/, `]).filter(ad => !/super\\s*mao|avmLVvqgaYhCYtGP7/i.test(JSON.stringify(ad)));\n`);
  html=html.slice(0,start)+ads+html.slice(end);
}
if(/id: "supermao"|Supermao/.test(html))throw new Error('Discontinued listing remains');
writeFileSync(path,html);
const config='site/public/config.js';
writeFileSync(config,readFileSync(config,'utf8').replace(/^.*href: "https:\/\/maps\.app\.goo\.gl\/avmLVvqgaYhCYtGP7[^\n]*\r?\n/gm,''));
console.log('Discontinued promotion and listing excluded on every build.');
