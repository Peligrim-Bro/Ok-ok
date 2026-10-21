import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

// Only catalogue/home thumbnails use these variants. Detail photos stay original.
const root='site/public',source='content/responsive-photos';
const manifest=JSON.parse(readFileSync(source+'/manifest.json','utf8'));
const variants={},files=[],version=createHash('sha256').update(JSON.stringify(manifest));
for(const [original,entry] of Object.entries(manifest)){
 assert(original.startsWith('assets/images/places/')&&!original.includes('..'));
 assert(readFileSync(root+'/'+original).length>0,'Original photo must remain available: '+original);
 variants[original]=entry.name;
 for(const width of [480,960]){
  const input=source+'/'+entry.name+'-'+width+'.webp';
  const bytes=readFileSync(input);
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
  version.update(bytes);
  files.push({input,name:entry.name+'-'+width+'.webp'});
 }
}
const directory='assets/responsive/'+version.digest('hex').slice(0,12)+'/';
mkdirSync(root+'/'+directory,{recursive:true});
for(const file of files)copyFileSync(file.input,root+'/'+directory+file.name);
const file=root+'/index.html';
let html=readFileSync(file,'utf8');
const anchor='    function cardHTML(p) {';
const image='<div class="pic">${flag}<img src="${p.photo}" alt="${p.name}" loading="lazy" decoding="async" /></div>';
assert.equal(html.split(anchor).length,2,'Catalogue renderer anchor changed');
assert.equal(html.split(image).length,2,'Catalogue thumbnail anchor changed');
// .wrap is at most 560px including 32px padding; card adds a 2px border.
const helper='    function cardPhotoAttrs(photo) {\n      const sources='+JSON.stringify(variants)+';\n      return Object.hasOwn(sources,photo) ? ` srcset="'+directory+'${sources[photo]}-480.webp 480w, '+directory+'${sources[photo]}-960.webp 960w" sizes="(max-width: 560px) calc(100vw - 34px), 526px"` : "";\n    }\n\n';
html=html.replace(anchor,helper+anchor).replace(image,image.replace('src="${p.photo}"','src="${p.photo}"${cardPhotoAttrs(p.photo)}'));
assert(html.includes('<img src="${p.photo}" alt="${p.name}" />'),'Detail cover must keep the original');
writeFileSync(file,html);
console.log('PASS: responsive catalogue photos; originals, layout and lazy loading retained');
