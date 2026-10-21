import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

// Only catalogue/home thumbnails use these variants. Detail photos stay original.
const root='site/public',source='content/responsive-photos';
const manifest=JSON.parse(readFileSync(source+'/manifest.json','utf8'));
const variants={};
mkdirSync(root+'/assets/responsive',{recursive:true});
for(const [original,entry] of Object.entries(manifest)){
 assert(original.startsWith('assets/images/places/')&&!original.includes('..'));
 assert(readFileSync(root+'/'+original).length>0,'Original photo must remain available: '+original);
 variants[original]=[480,960].map(width=>{
  const input=source+'/'+entry.name+'-'+width+'.webp';
  const bytes=readFileSync(input);
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
  const hash=createHash('sha256').update(bytes).digest('hex').slice(0,12);
  const url='assets/responsive/'+entry.name+'-'+width+'-'+hash+'.webp';
  copyFileSync(input,root+'/'+url);
  return url+' '+width+'w';
 }).join(', ');
}
const file=root+'/index.html';
let html=readFileSync(file,'utf8');
const anchor='    function cardHTML(p) {';
const image='<div class="pic">${flag}<img src="${p.photo}" alt="${p.name}" loading="lazy" decoding="async" /></div>';
assert.equal(html.split(anchor).length,2,'Catalogue renderer anchor changed');
assert.equal(html.split(image).length,2,'Catalogue thumbnail anchor changed');
// .wrap is at most 560px including 32px padding; card adds a 2px border.
const helper='    function cardPhotoAttrs(photo) {\n      const sources='+JSON.stringify(variants)+';\n      return Object.hasOwn(sources,photo) ? ` srcset="${sources[photo]}" sizes="(max-width: 560px) calc(100vw - 34px), 526px"` : "";\n    }\n\n';
html=html.replace(anchor,helper+anchor).replace(image,image.replace('src="${p.photo}"','src="${p.photo}"${cardPhotoAttrs(p.photo)}'));
assert(html.includes('<img src="${p.photo}" alt="${p.name}" />'),'Detail cover must keep the original');
writeFileSync(file,html);
console.log('PASS: responsive catalogue photos; originals, layout and lazy loading retained');
