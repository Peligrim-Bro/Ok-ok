// Read-only report: image files in the generated OK-OK site.
// Run after npm run build. No files are modified.
import { readdir, stat, readFile } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
const root='site/public';
const files=[];
async function walk(dir){
 for(const entry of await readdir(dir,{withFileTypes:true})){
  const full=join(dir,entry.name);
  if(entry.isDirectory()) await walk(full);
  else if(entry.isFile() && /\.(png|jpe?g|webp|avif|gif)$/i.test(entry.name)){
   const size=(await stat(full)).size;
   files.push({path:relative(root,full).replaceAll('\\','/'),bytes:size});
  }
 }
}
await walk(root);
files.sort((a,b)=>b.bytes-a.bytes);
const total=files.reduce((s,f)=>s+f.bytes,0);
console.log('IMAGE AUDIT (read only)');
console.log('Images:',files.length,'Total MiB:',(total/1048576).toFixed(2));
for(const f of files.slice(0,40)) console.log((f.bytes/1048576).toFixed(2)+' MiB  '+f.path);
const html=(await readFile(join(root,'index.html'),'utf8')).toLowerCase();
const config=(await readFile(join(root,'config.js'),'utf8')).toLowerCase();
console.log('Top 40 file references (raw string occurrence in HTML/config):');
for(const f of files.slice(0,40)){
 const name=f.path.toLowerCase();
 console.log((html.includes(name)||config.includes(name)?'REFERENCED':'NOT DIRECTLY FOUND')+' '+f.path);
}
