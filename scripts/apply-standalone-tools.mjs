import { addReceiptBook } from './apply-receipt-book.mjs';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = 'site/public/';
const pages = ['split-bill.html', 'inspect.html', 'tools.html', 'travel-reads.html'];
const modules = ['split-math', 'split-ui-adapter', 'receipt-ocr', 'inspect-helpers', 'inspect-storage', 'inspect-pdf-text'];
mkdirSync(root + 'tools/vendor', { recursive: true });
const assets = [...pages, ...modules.map(name => 'tools/' + name + '.mjs'), 'tools/vendor/jspdf.umd.min.js'];
for (const asset of assets) copyFileSync(asset, root + asset);
copyFileSync('tools/vendor/jspdf-LICENSE.txt', root + 'tools/vendor/jspdf-LICENSE.txt');

let reader = readFileSync('travel-reads.html', 'utf8');
for (const id of [1, 2, 3, 4, 5]) {
  const name = 'tools/cover-' + id + (id <= 3 ? '-cinema.webp' : '-storybook.webp');
  const cover = new RegExp('(id="cover' + id + '">)<svg[\\s\\S]*?</svg>');
  if (!cover.test(reader)) throw new Error('Missing illustrated book cover ' + id);
  reader = reader.replace(cover, '$1<img src="./' + name + '" alt="" width="480" height="480">');
  copyFileSync(name, root + name);
  assets.push(name);
}
reader = reader.replace('.cover svg{', '.cover img{');
reader = addReceiptBook(reader, root, assets);
const close = '</script></body>';
if (!reader.includes(close)) throw new Error('Missing book reader script anchor');
writeFileSync(root + 'travel-reads.html', reader.replace(close, `
const requestedBook = new URLSearchParams(location.search).get('book');
if (['1','2','3'].includes(requestedBook)) document.querySelectorAll('.book')[Number(requestedBook)-1].click();
` + close));

const style = readFileSync('home-reference.css', 'utf8');
const cssName = 'tools/home-' + createHash('sha256').update(style).digest('hex').slice(0, 12) + '.css';
writeFileSync(root + cssName, style);
assets.push(cssName);
assets.push("assets/icons/icon-192-v80.png");
const index = root + 'index.html';
writeFileSync(index, readFileSync(index, 'utf8').replace('</head>', '<link rel="stylesheet" href="./' + cssName + '"></head>'));

const worker = root + 'sw.js';
let sw = readFileSync(worker, 'utf8');
sw = sw.replace('const CORE = [', 'const CORE = [' + assets.map(asset => JSON.stringify('./' + asset)).join(',') + ',');
// Standalone navigation must never replace the cached home shell.
sw = sw.replace('  if (request.mode === "navigate") {', `  if (request.mode === "navigate" && /^\\/books\\/(?:receipt|rain|change|keys|window)(?:\\.html)?$/.test(url.pathname)) {
    e.respondWith(fetch(request).catch(async () => await caches.match(url.pathname.endsWith('.html') ? url.pathname : url.pathname + '.html') || Response.error()));
    return;
  }
  if (request.mode === "navigate" && /^\\/(?:tools|split-bill|inspect|travel-reads)(?:\\.html)?$/.test(url.pathname)) {
    const page = url.pathname.endsWith('.html') ? url.pathname : url.pathname + '.html';
    e.respondWith(fetch(request).catch(async () => await caches.match(page) || Response.error()));
    return;
  }
  if (request.mode === "navigate") {`);
writeFileSync(worker, sw);
