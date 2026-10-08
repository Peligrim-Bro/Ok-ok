import {readFileSync,writeFileSync} from 'node:fs';
import {releaseCacheName,verifyReleaseCache} from './release-cache.mjs';
const path='site/public/sw.js';
const info=JSON.parse(readFileSync('site/public/build-info.json','utf8'));
const sw=readFileSync(path,'utf8').replace(/\bconst\s+CACHE\s*=\s*[^;]+;/,()=> 'const CACHE = '+JSON.stringify(releaseCacheName(info))+';');
verifyReleaseCache(sw,info);
writeFileSync(path,sw);
console.log('PASS: service-worker cache finalized for source release');
