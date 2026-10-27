import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const page='site/public/index.html';let html=readFileSync(page,'utf8');
const guide=readFileSync('safety/bike-deposit.html','utf8');
const version=createHash('sha256').update(guide).digest('hex').slice(0,12);
const url='./safety/bike-deposit-'+version+'.html';mkdirSync('site/public/safety',{recursive:true});writeFileSync('site/public/'+url.slice(2),guide);
const start=html.indexOf('    function renderScams() {'),end=html.indexOf('    function stopGame()',start);
if(start<0||end<0)throw Error('Safety renderer anchors missing');
const renderer=`    function renderScams() {
      const label=cityText('Не попадись','Stay scam-aware','รู้ทันก่อนพลาด');
      $('app').innerHTML='<iframe id="safetyGuide" title="'+label+'" src="${url}?lang='+lang+'" style="display:block;width:100%;height:1600px;border:0" ></iframe><details class="news"><summary>'+cityText('Другие предупреждения и источники','Other warnings and sources','คำเตือนอื่นและแหล่งข้อมูล')+'</summary>'+SCAMS.map(s=>'<article><h3>'+L(s.title)+'</h3><p>'+L(s.text)+'</p><p>'+L(s.do)+'</p></article>').join('')+'</details>';
    }
    window.addEventListener('message',e=>{
      const frame=$('safetyGuide');if(!frame||e.origin!==location.origin||e.source!==frame.contentWindow)return;
      if(e.data?.okokSafety==='height'&&Number.isFinite(e.data.height))frame.style.height=Math.max(400,Math.min(e.data.height+16,12000))+'px';
      if(['copy','share','mode','report'].includes(e.data?.okokSafety))window.dispatchEvent(new CustomEvent('okok:safety',{detail:{action:e.data.okokSafety,mode:['before','after'].includes(e.data.mode)?e.data.mode:''}}));
      if(e.data?.okokSafety==='report')$('authorChatButton')?.click();
    });
    function safetyRoute(){if(location.hash==='#safety/bike-deposit'){setTab('scam',false);history.replaceState({view:'tab',tab:'scam'},'');}}
    window.addEventListener('hashchange',safetyRoute);setTimeout(safetyRoute,0);

`;
html=html.slice(0,start)+renderer+html.slice(end);
// Thailand-wide checklist remains available in every selected city.
html=html.replace('["home","list","shop","scam"].includes(tab)','["home","list","shop"].includes(tab)');
html=html.replace('navScam: "Скам"','navScam: "Не попадись"').replace('navScam: "Scam"','navScam: "Stay alert"');
const homeStart=html.indexOf('        <article class="scam" data-open-scam="jetski">');
const homeEnd=html.indexOf('        <h3 style="margin:18px 0 8px">',homeStart);
if(homeStart<0||homeEnd<0)throw Error('Safety home entry missing');
html=html.slice(0,homeStart)+html.slice(homeEnd);
const homeAnchor='        <button class="btn map" type="button" data-openmap="1"';
if(!html.includes(homeAnchor))throw Error('Home primary actions missing');
html=html.replace(homeAnchor,`        <a id="homeSafety" class="btn call" href="#safety/bike-deposit" style="display:block;text-align:center;margin:0 0 10px">🛡 \${cityText('Байк и депозит: не попадись','Bike deposits: stay scam-aware','เช่ารถและเงินมัดจำ: รู้ทันก่อนพลาด')}</a>\n`+homeAnchor);
html=html.replace('<h1>PattayaOK</h1>','<h1>OK-OK</h1>');
html=html.replace('tagline: "Места, которым можно верить"','tagline: "Места и защита от скама"').replace('tagline: "Places you can actually trust"','tagline: "Places and scam awareness"').replace('tagline: "สถานที่ที่ไว้ใจได้"','tagline: "แนะนำสถานที่และรู้ทันกลโกง"');
writeFileSync(page,html);
const swPath='site/public/sw.js';let sw=readFileSync(swPath,'utf8').replace('const CORE = [','const CORE = ['+['ru','en','th'].map(lang=>JSON.stringify(url+'?lang='+lang)).join(',')+',');
// Offline child navigation must return its own document, not the PWA shell.
sw=sw.replace('if (request.mode === "navigate") {','if (request.mode === "navigate" && !url.pathname.startsWith("/safety/")) {');
writeFileSync(swPath,sw);
console.log('PASS: versioned bike-deposit guide, safe embedded sizing and direct route');
