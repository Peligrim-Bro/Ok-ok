import {readFileSync,writeFileSync} from 'node:fs';
const file='site/public/index.html';
let html=readFileSync(file,'utf8');
const start=html.indexOf('    function renderHome() {'),end=html.indexOf('    function renderList() {',start);
if(start<0||end<0)throw Error('Home renderer boundaries missing');
let home=html.slice(start,end);
const ads='<div id="okAds" class="okads" aria-live="polite"></div>';
const anchor='<p class="hint">${t().spinLead}</p>';
if(!home.includes(ads)||!home.includes(anchor))throw Error('Home loading layout anchors changed');
home=home.replace(ads,'').replace(anchor,anchor+'\n        '+ads);
html=html.slice(0,start)+home+html.slice(end);
// Preserve Manrope while avoiding a late font swap that shifts visible controls.
html=html.replace('family=Manrope:wght@400;500;600;700;800&display=swap','family=Manrope:wght@400;500;600;700;800&display=optional');
writeFileSync(file,html);
console.log('PASS: primary home actions precede async advertisements; late font swaps avoided');
