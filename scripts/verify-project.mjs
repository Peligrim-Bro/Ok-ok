import {readFileSync,existsSync} from 'node:fs';
import {Script} from 'node:vm';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {verifyReleaseCache} from './release-cache.mjs';
const html=readFileSync('site/public/index.html','utf8');
let parsed=0;
for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
 if(/\bsrc\s*=|type=["'](?:module|application\/ld\+json|application\/json)/i.test(match[1]))continue;
 new Script(match[2],{filename:'index-inline-'+(++parsed)});
}
assert(parsed>0,'No inline scripts verified');
assert.equal((html.match(/id="timerBtn"/g)||[]).length,1,'Header timer must remain');
const utilities=html.match(/<div class="top-actions">([\s\S]*?)<\/div>/)?.[1];
assert(utilities,'Header utility grid missing');
assert.equal((utilities.match(/<button\b/g)||[]).length,4,'Utility grid must contain exactly four controls');
assert(!utilities.includes('id="timerBtn"'),'Timer must stay outside the utility grid');
assert(html.includes('id="langClose"'),'Language picker close control missing');
assert(!html.includes('data-timer="1"'),'Duplicate timer returned');
assert(html.includes('id="visaForm"')&&html.includes('function clockHTML'),'Visa timer missing');
for(const token of ['timerSave','ol-routine','block-rotate']){
 assert(html.includes(token),'Missing feature '+token);
}
for(const lang of ['ru','en','th'])assert(new RegExp('\\b'+lang+'\\s*:').test(html),'Missing language '+lang);
const asset=html.match(/\/assets\/oki-3d-v\d+\.js/);
assert(asset&&existsSync('site/public'+asset[0]),'3D runtime missing');
new Script(readFileSync('site/public'+asset[0],'utf8'),{filename:asset[0]});
const modelBundle=readFileSync('site/public'+asset[0],'utf8');
const modelHash=createHash('sha256').update(readFileSync('oki-3d-source.mjs')).digest('hex');
assert(modelBundle.startsWith('// OKI source SHA256: '+modelHash+'\n'),'Rebuild the OKI bundle after changing its source');
assert(modelBundle.includes('neon-glass-v2')&&asset[0]==='/assets/oki-3d-v91.js','Current OKI model revision missing');
assert(existsSync('wrangler-telegram.json'),'Cloudflare deploy config missing');
console.log('PASS: '+parsed+' inline scripts, 3D bundle, RU/EN/TH, timer, daily care, Tetris and Cloudflare configuration');

// Uses only an in-memory SQLite database; no live telemetry or bot messages.
await import('./verify-oki-analytics.mjs');

new Script(readFileSync('site/public/assets/spatial/pattaya-map.js','utf8'),{filename:'travel-map.js'});
assert(existsSync('site/public/assets/spatial/travel-map.css'),'Travel map styles missing');
console.log('PASS: transport map script and styles');

const nav=html.match(/<nav class="tab">([\s\S]*?)<\/nav>/)?.[1];
assert(nav,'Bottom navigation missing');
assert.deepEqual([...nav.matchAll(/data-tab="([^"]+)"/g)].map(m=>m[1]),['home','game','list','scam','shop'],'Bottom navigation order changed');
assert(html.includes("bubble.style.setProperty('--oki-tail-x'"),'OKI bubble must anchor its tail to OKI');
assert(html.includes('left:var(--oki-tail-x,50%)'),'OKI tail positioning missing');
for(const marker of ['okok-pulse-v1','oki-prompt-tail-fix-v4','okok-tetris-playable-v2'])assert(html.includes(marker),'Missing current UI patch '+marker);
verifyReleaseCache(readFileSync('site/public/sw.js','utf8'),JSON.parse(readFileSync('site/public/build-info.json','utf8')));
console.log('PASS current UI: OKI second, smiley fifth, anchored tail, Pulse and unique deployment cache');

const partnerSource=readFileSync('site/public/assets/commerce/partners.js','utf8');
assert(!/agoda/i.test(partnerSource),'Discontinued Agoda partner returned');
const partnerContext={window:{}};
new Script(partnerSource).runInNewContext(partnerContext);
assert.deepEqual(Object.keys(partnerContext.window.OK_PARTNERS),['senate','klook','airalo','safetywing','travel12go'],'Other partners must remain');
assert.equal(partnerContext.window.OK_PARTNERS.klook.referralCode,'HAF8KW');
assert.equal(partnerContext.window.OK_PARTNERS.airalo.referralCode,'TIMUR5494');
assert.equal(partnerContext.window.OK_PARTNERS.travel12go.ref,'https://12go.asia/?z=17095940');
console.log('PASS: Agoda excluded; all remaining partners and referral codes preserved');

const configSource=readFileSync('site/public/config.js','utf8');
const configContext={window:{}};
new Script(configSource).runInNewContext(configContext);
assert.equal(configContext.window.PATTAYAOK.site,'https://ok-ok.click/');
assert(html.includes('config.js?v=99'),'Updated runtime configuration must invalidate the legacy cached asset');
for(const source of [html,configSource]){
 assert(!/Supermao|id: "supermao"|avmLVvqgaYhCYtGP7\?g_st=it/.test(source),'Discontinued Supermao content returned');
 assert(!source.includes('https://pattayaok.netlify.app/'),'Legacy hosting URL returned');
}
const editorial=JSON.parse(readFileSync('content/editorial.json','utf8'));
assert.equal(configContext.window.PATTAYAOK.newsVerifiedAt,editorial.verifiedAt,'Editorial date changed');
if(editorial.news)assert.deepEqual(Array.from(configContext.window.PATTAYAOK.news,n=>n.href),editorial.news.map(n=>n.href),'Current editorial stories changed');
assert(html.includes('id="ok-card-reveal"'),'Card reveal missing');
assert.equal(readFileSync('site/public/assets/spatial/spatial.js','utf8'),readFileSync('hedgehog-background.js','utf8'),'Approved 3D background changed');
console.log('PASS: retired content excluded, active domain, current editorial and weather preserved');

const headerStyle=html.match(/<style id="ok-header-layout-v100">([\s\S]*?)<\/style>/)?.[1];
assert(headerStyle,'Compact header sizing patch missing');
assert(headerStyle.includes('grid-template-rows:44px;grid-auto-rows:44px'),'Utility grid rows must stay compact');
assert(headerStyle.includes('.top-actions>:is(#donateBtn,#themeBtn,#langBtn,#reportBtn){height:44px!important;min-height:44px!important;max-height:44px!important'),'All four utility controls must have bounded height');
console.log('PASS: utility buttons and grid rows locked to 44px');
