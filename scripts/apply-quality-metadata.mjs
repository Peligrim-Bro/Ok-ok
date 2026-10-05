import {readFileSync,writeFileSync} from 'node:fs';
const path='site/public/index.html';
let html=readFileSync(path,'utf8');
if(!/rel=["']canonical["']/.test(html))html=html.replace('</head>','<link rel="canonical" href="https://ok-ok.click/" />\n</head>');
writeFileSync(path,html);
writeFileSync('site/public/build-info.json',JSON.stringify({commit:process.env.WORKERS_CI_COMMIT_SHA||process.env.CF_PAGES_COMMIT_SHA||process.env.COMMIT_REF||null,builtAt:new Date().toISOString()})+'\n');
