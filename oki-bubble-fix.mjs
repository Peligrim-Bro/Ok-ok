import { readFileSync, writeFileSync } from 'node:fs';
const path='site/public/index.html';
let html=readFileSync(path,'utf8');
if(!html.includes('</head>')) throw new Error('OKI bubble fix: missing </head>');
const patch=`<style id="oki-bubble-pointer-fix-v1">
/* OKI speech bubbles must visually belong to OKI, never to the Scam tab below. */
:is(.oki-bubble,.oki-message,.oki-speech,.oki-tip,.oki-tooltip,[class*="oki"][class*="bubble"],[class*="oki"][class*="message"])::after,
:is(.oki-bubble,.oki-message,.oki-speech,.oki-tip,.oki-tooltip,[class*="oki"][class*="bubble"],[class*="oki"][class*="message"])::before{
  pointer-events:none!important;
}
/* Hide legacy downward tails: near the bottom nav they read as an arrow to Scam. */
:is(.oki-bubble,.oki-message,.oki-speech,.oki-tip,.oki-tooltip,[class*="oki"][class*="bubble"],[class*="oki"][class*="message"])::after{
  border-bottom-color:transparent!important;
  border-left-color:transparent!important;
  border-right-color:transparent!important;
  clip-path:none!important;
}
/* Keep OKI overlays clearly above and separated from the fixed navigation. */
:is(.oki-bubble,.oki-message,.oki-speech,.oki-tip,.oki-tooltip,[class*="oki"][class*="bubble"],[class*="oki"][class*="message"]){
  z-index:1200!important;
}
@media(max-width:700px){
 :is(.oki-bubble,.oki-message,.oki-speech,.oki-tip,.oki-tooltip,[class*="oki"][class*="bubble"],[class*="oki"][class*="message"]){margin-bottom:10px!important;}
}
</style>`;
if(!html.includes('oki-bubble-pointer-fix-v1')) html=html.replace('</head>',patch+'\n</head>');
writeFileSync(path,html);
const sw='site/public/sw.js';
let s=readFileSync(sw,'utf8');
s=s.replace(/const CACHE = [^;]+;/,'const CACHE = "okok-20261003-oki-bubble-fix";');
writeFileSync(sw,s);
console.log('OKI bubble pointer fix applied.');
