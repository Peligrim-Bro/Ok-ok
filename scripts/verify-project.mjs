import {readFileSync,existsSync} from 'node:fs';
import {Script} from 'node:vm';
import assert from 'node:assert/strict';
const html=readFileSync('site/public/index.html','utf8');
let parsed=0;
for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
 if(/\bsrc\s*=|type=["'](?:module|application\/ld\+json|application\/json)/i.test(match[1]))continue;
 new Script(match[2],{filename:'index-inline-'+(++parsed)});
}
assert(parsed>0,'No inline scripts verified');
assert.equal((html.match(/id="timerBtn"/g)||[]).length,1,'Header timer must remain');
assert(!html.includes('data-timer="1"'),'Duplicate timer returned');
assert(html.includes('id="visaForm"')&&html.includes('function clockHTML'),'Visa timer missing');
for(const token of ['timerSave','ol-routine','block-rotate']){
 assert(html.includes(token),'Missing feature '+token);
}
for(const lang of ['ru','en','th'])assert(new RegExp('\\b'+lang+'\\s*:').test(html),'Missing language '+lang);
const asset=html.match(/\/assets\/oki-3d-v\d+\.js/);
assert(asset&&existsSync('site/public'+asset[0]),'3D runtime missing');
new Script(readFileSync('site/public'+asset[0],'utf8'),{filename:asset[0]});
assert(existsSync('wrangler-telegram.json'),'Cloudflare deploy config missing');
console.log('PASS: '+parsed+' inline scripts, 3D bundle, RU/EN/TH, timer, daily care, Tetris and Cloudflare configuration');

// Uses only an in-memory SQLite database; no live telemetry or bot messages.
await import('./verify-oki-analytics.mjs');

new Script(readFileSync('site/public/assets/spatial/pattaya-map.js','utf8'),{filename:'travel-map.js'});
assert(existsSync('site/public/assets/spatial/travel-map.css'),'Travel map styles missing');
console.log('PASS: transport map script and styles');
