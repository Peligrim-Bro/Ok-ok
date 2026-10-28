import {readFileSync,writeFileSync} from 'node:fs';
const source=readFileSync('site/public/oki-house.html','utf8'),dictionary=JSON.parse(readFileSync('prototypes/oki-house-locales.json','utf8'));
for(const [index,lang] of ['en','th'].entries()){
 let html=source;for(const key of Object.keys(dictionary).sort((a,b)=>b.length-a.length))html=html.split(key).join(dictionary[key][index]);
 html=html.replace('lang="ru"','lang="'+lang+'"');writeFileSync('site/public/oki-house-'+lang+'.html',html);
}
