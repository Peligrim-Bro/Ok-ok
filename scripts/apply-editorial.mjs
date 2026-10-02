import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {Script} from 'node:vm';
const file='content/editorial.json';
if(existsSync(file)){
 const data=JSON.parse(readFileSync(file,'utf8'));
 const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const text=(s,max=1800)=>{if(typeof s!=='string'||!s.trim()||s.length>max)throw Error('Invalid editorial text');return escape(s);};
 const url=s=>{const u=new URL(s);if(u.protocol!=='https:'||u.username||u.password)throw Error('Invalid editorial source URL');return u.href;};
 const translated=o=>Object.fromEntries(['ru','en','th'].map(k=>[k,text(o?.[k])]));
 const date=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s||'')||!Number.isFinite(Date.parse(s)))throw Error('Invalid editorial date');return s;};
 const json=o=>JSON.stringify(o).replace(/</g,'\\u003c');
 if(data.news!==null){
  if(!Array.isArray(data.news)||data.news.length!==5)throw Error('Exactly five news stories required');
  const categories=data.news.map(n=>n.category).sort().join(',');
  if(categories!=='pattaya,pattaya,thailand,thailand,world')throw Error('News ratio must be 1 world / 2 Thailand / 2 Pattaya');
  const seen=new Set();
  const news=data.news.map(n=>{const href=url(n.href);if(seen.has(href))throw Error('Duplicate news source');seen.add(href);if(!Array.isArray(n.sources)||!n.sources.length)throw Error('News evidence missing');n.sources.forEach(url);date(n.publishedAt);if(n.category==='world'&&n.nonWar!==true)throw Error('World story must exclude war');return {category:n.category,when:text(n.when,100),href,...translated(n)};});
  const cfg='site/public/config.js';let source=readFileSync(cfg,'utf8');
  const start=source.indexOf('  newsVerifiedAt:'),end=source.indexOf('  trusts:',start);
  if(start<0||end<start)throw Error('News config anchors missing');
  source=source.slice(0,start)+'  newsVerifiedAt: '+json(date(data.verifiedAt))+',\n  news: '+json(news)+',\n'+source.slice(end);
  new Script(source);writeFileSync(cfg,source);
 }
 if(!Array.isArray(data.scams)||data.scams.length>12)throw Error('Invalid scam update list');
 if(data.scams.length){
  const ids=new Set();const scams=data.scams.map(s=>{
   if(!/^[a-z0-9-]{1,64}$/.test(s.id)||ids.has(s.id))throw Error('Invalid scam ID');ids.add(s.id);
   if(!['official-warning','reported-investigation'].includes(s.status))throw Error('Unverified allegations cannot be auto-published');
   if(!Array.isArray(s.sources)||!s.sources.length)throw Error('Scam evidence missing');
   const sources=s.sources.map(url),checked=date(s.verifiedAt);
   const body=translated(s.text);for(const lang of ['ru','en','th'])body[lang]+=' · '+checked+' · '+sources.map(u=>'<a href="'+escape(u)+'" target="_blank" rel="noopener noreferrer">'+({'ru':'Источник','en':'Source','th':'แหล่งข่าว'}[lang])+'</a>').join(' · ');
   return {id:s.id,title:translated(s.title),text:body,do:translated(s.do),level:s.status==='official-warning'?'⚠':'ⓘ',photo:'assets/images/hero.jpg'};
  });
  const path='site/public/index.html';let html=readFileSync(path,'utf8');const anchor='const SCAMS = [';const start=html.indexOf(anchor);
  if(start<0)throw Error('Scam list anchor missing');
  // Append after the existing declaration, keeping archived advice and report IDs.
  let i=start+'const SCAMS = '.length,depth=0,quote=null,escaped=false,end=-1;
  for(;i<html.length;i++){const c=html[i];if(quote){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c===quote)quote=null;continue;}if(c==='"'||c==="'"||c==='`'){quote=c;continue;}if(c==='[')depth++;if(c===']'&&--depth===0){end=i+1;break;}}
  if(end<0||html[end]!==';')throw Error('Cannot locate scam declaration end');
  html=html.slice(0,end+1)+'\n    SCAMS.unshift(...'+json(scams)+');\n'+html.slice(end+1);
  writeFileSync(path,html);
 }
 console.log('Editorial overlay validated; existing content preserved where no update supplied.');
}
