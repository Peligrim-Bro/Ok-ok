import {readFileSync,writeFileSync,copyFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root='site/public/';
for(const name of ['split-bill.html','inspect.html','tools.html'])copyFileSync(name,root+name);
mkdirSync(root+'tools',{recursive:true});
for(const name of ['split-math.mjs','split-ui-adapter.mjs','receipt-ocr.mjs','inspect-helpers.mjs','inspect-storage.mjs','inspect-pdf-text.mjs'])copyFileSync('tools/'+name,root+'tools/'+name);
const path=root+'index.html';
let html=readFileSync(path,'utf8');
const marker='okok-tools-link-v1';
if(!html.includes(marker)){
 const css='<style id="'+marker+'">.okok-tools-entry{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:10px 0;padding:13px 16px;border-radius:16px;background:#103344;color:#e8fff9!important;border:1px solid #4b8c9c;text-decoration:none;font:600 15px system-ui,-apple-system,sans-serif;min-height:48px}.okok-tools-entry small{opacity:.8;font-size:12px}.okok-tools-entry:focus-visible{outline:3px solid #57efc3}</style>';
 const js='<script id="'+marker+'-script">(function(){function mount(){if(document.querySelector(".okok-tools-entry"))return;var target=document.querySelector(".filters")||document.querySelector(".zones")||document.querySelector("main");if(!target)return;var link=document.createElement("a");link.className="okok-tools-entry";link.href="./tools.html";var lang=(document.documentElement.lang||localStorage.getItem("okok_lang")||"ru").toLowerCase();var title=lang.startsWith("th")?"เครื่องมือ":lang.startsWith("en")?"Tools":"Полезное";link.textContent="🧰 "+title+" · SPLIT / INSPECT";target.insertAdjacentElement("afterbegin",link)}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount()})();</script>';
 if(!html.includes('</head>')||!html.includes('</body>'))throw new Error('Tools: homepage anchors missing');
 html=html.replace('</head>',css+'</head>').replace('</body>',js+'</body>');
 writeFileSync(path,html);
}
console.log('OK-OK SPLIT / INSPECT preview tools linked');
