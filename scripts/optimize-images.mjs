// Optional build-time image optimization. Originals are never overwritten.
// Requires sharp to be installed separately; no access to credentials or payments.
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, extname, relative, dirname } from 'node:path';
const root = 'site/public';
const output = join(root, 'assets', 'optimized');
const enabled = process.env.OKOK_OPTIMIZE_IMAGES === '1';
if (!enabled) {
  console.log('Image optimization disabled (set OKOK_OPTIMIZE_IMAGES=1 to enable).');
  process.exit(0);
}
let sharp;
try { ({default: sharp} = await import('sharp')); }
catch { throw new Error('Install sharp before enabling image optimization'); }
let count=0, saved=0;
async function visit(dir) {
  for (const item of await readdir(dir, {withFileTypes:true})) {
    const full=join(dir,item.name);
    if(item.isDirectory()) {
      if(full===output) continue;
      await visit(full);
      continue;
    }
    if(!item.isFile() || !/\.(jpe?g|png)$/i.test(item.name)) continue;
    const input=await readFile(full);
    if(input.length<20_000) continue;
    const rel=relative(root,full);
    const dest=join(output,rel.replace(/\.(jpe?g|png)$/i,'.webp'));
    const optimized=await sharp(input,{failOn:'warning'}).rotate().webp({quality:78,effort:4}).toBuffer();
    if(optimized.length>=input.length) continue;
    await mkdir(dirname(dest),{recursive:true});
    await writeFile(dest,optimized,{flag:'w'});
    count++;saved+=input.length-optimized.length;
  }
}
await visit(root);
console.log('Optimized copies:',count,'bytes saved:',saved,'(original files unchanged)');