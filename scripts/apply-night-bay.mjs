import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { Script } from 'node:vm';
const source = readFileSync('night-bay.js', 'utf8');
new Script(source, { filename: 'night-bay.js' });
copyFileSync('night-bay.js', 'site/public/assets/spatial/spatial.js');
for (const file of ['site/public/index.html', 'site/public/sw.js']) {
  const html = readFileSync(file, 'utf8');
  if (!html.includes('spatial/spatial.js?v=')) throw new Error('Missing background asset in ' + file);
  writeFileSync(file, html.replace(/spatial\/spatial\.js\?v=\d+/g, 'spatial/spatial.js?v=97'));
}
console.log('Night bay background: local Canvas, 30 fps cap, reduced-motion support.');
