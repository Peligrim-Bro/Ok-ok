import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const files = ['site/public/index.html', 'site/public/admin.html'];
for (const path of files) {
  if (!existsSync(path)) continue;
  let html = readFileSync(path, 'utf8');
  // Remove rendered Agoda cards/links without disturbing neighboring partner cards.
  html = html.replace(/<a\b[^>]*>[\s\S]*?Agoda[\s\S]*?<\/a>/gi, '');
  html = html.replace(/<button\b[^>]*>[\s\S]*?Agoda[\s\S]*?<\/button>/gi, '');
  html = html.replace(/<div\b[^>]*(?:class|id)=["'][^"']*(?:partner|useful|travel)[^"']*["'][^>]*>[\s\S]*?Agoda[\s\S]*?<\/div>/gi, m => {
    // Avoid deleting a whole multi-partner container: only remove when it looks like one compact card.
    const links = (m.match(/<a\b/gi) || []).length;
    return links <= 1 ? '' : m;
  });
  writeFileSync(path, html);
}

// Remove Agoda from generated JS/data assets too, when present as a compact object/entry.
for (const path of ['site/public/assets/ads/ads.js', 'site/public/config.js']) {
  if (!existsSync(path)) continue;
  let s = readFileSync(path, 'utf8');
  s = s.replace(/\{[^{}]{0,1200}(?:Agoda|agoda\.com)[^{}]{0,1200}\},?/gi, '');
  writeFileSync(path, s);
}

const sw = 'site/public/sw.js';
if (existsSync(sw)) {
  let s = readFileSync(sw, 'utf8');
  s = s.replace(/const CACHE = [^;]+;/, 'const CACHE = "okok-20261003-no-agoda";');
  writeFileSync(sw, s);
}
console.log('OK-OK: Agoda removed.');
