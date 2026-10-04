import { readFileSync, writeFileSync } from 'node:fs';
// Keep sharing, social previews and runtime overrides on the active domain.
for(const path of ['site/public/index.html','site/public/config.js']){
  writeFileSync(path,readFileSync(path,'utf8').replaceAll('https://pattayaok.netlify.app/','https://ok-ok.click/'));
}
console.log('Sharing and metadata use the active Cloudflare domain.');
