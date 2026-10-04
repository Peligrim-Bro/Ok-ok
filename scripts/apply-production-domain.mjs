import { readFileSync, writeFileSync } from 'node:fs';
// Keep sharing, social previews and runtime overrides on the active domain.
for(const path of ['site/public/index.html','site/public/admin.html','site/public/config.js','site/public/sw.js']){
  writeFileSync(path,readFileSync(path,'utf8')
    .replaceAll('https://pattayaok.netlify.app/','https://ok-ok.click/')
    .replace(/config\.js\?v=\d+/g,'config.js?v=99'));
}
console.log('Sharing and metadata use the active Cloudflare domain.');
