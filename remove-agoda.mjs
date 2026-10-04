// Owner decision: Agoda is discontinued; never restore its card or links.
import { readFileSync, writeFileSync } from 'node:fs';
import { Script } from 'node:vm';
const path = 'site/public/assets/commerce/partners.js';
let source = readFileSync(path, 'utf8');
// Remove only the named registry entry, preserving all neighbouring partners.
source = source.replace(/^\s*agoda:\s*\{[^\n]*\},?\r?\n/gmi, '');
if (/agoda/i.test(source)) throw new Error('Agoda remains in the partner registry');
new Script(source, { filename: path });
writeFileSync(path, source);
// Invalidate the registry asset URL while retaining the unique service-worker cache.
for (const file of ['site/public/index.html', 'site/public/admin.html', 'site/public/sw.js']) {
  writeFileSync(file, readFileSync(file, 'utf8').replace(/partners\.js\?v=\d+/g, 'partners.js?v=96'));
}
console.log('Agoda discontinued: registry removed, remaining partners preserved.');
