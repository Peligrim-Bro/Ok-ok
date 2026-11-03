import {readFileSync,writeFileSync,copyFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root='site/public/';
for(const name of ['split-bill.html','inspect.html','tools.html','travel-reads.html'])copyFileSync(name,root+name);
mkdirSync(root+'tools',{recursive:true});
for(const name of ['split-math.mjs','split-ui-adapter.mjs','receipt-ocr.mjs','inspect-helpers.mjs','inspect-storage.mjs','inspect-pdf-text.mjs'])copyFileSync('tools/'+name,root+'tools/'+name);
const path=root+'index.html';
let html=readFileSync(path,'utf8');
const marker='okok-tools-link-v1';
if(!html.includes(marker)){
 const css='<style id="'+marker+'">.okok-preview-links{position:relative;z-index:1;display:flex;flex-wrap:wrap;gap:10px;margin:18px 12px;padding:12px;border:1px solid #57efc3;border-radius:16px;background:#103743}.okok-preview-links a{flex:1 1 150px;min-height:44px;display:flex;align-items:center;justify-content:center;text-align:center;padding:10px;border:1px solid #57efc3;border-radius:12px;background:#0b2734;color:#e8fff9!important;text-decoration:none;font:600 14px system-ui,sans-serif}.okok-preview-links a:focus-visible{outline:3px solid white}</style>';
 const js='<script id="'+marker+'-script">(function(){function mount(){if(document.getElementById("okok-preview-links"))return;var target=document.querySelector("main")||document.body;if(!target)return;var box=document.createElement("nav");box.id="okok-preview-links";box.className="okok-preview-links";box.setAttribute("aria-label","Preview tools");var a=document.createElement("a");a.href="./tools.html";a.textContent="🧰 Полезное · Tools";var b=document.createElement("a");b.href="./travel-reads.html";b.textContent="📚 Попутчик · Travel Reads";box.append(a,b);target.append(box)}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount()})();</script>';
 if(!html.includes('</head>')||!html.includes('</body>'))throw new Error('Tools: homepage anchors missing');
 html=html.replace('</head>',css+'</head>').replace('</body>',js+'</body>');
 writeFileSync(path,html);
}
console.log('OK-OK travel tools and Travel Reads preview linked');
