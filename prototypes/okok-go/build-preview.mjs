import {mkdir,copyFile} from 'node:fs/promises';
await mkdir(new URL('./preview-dist/',import.meta.url),{recursive:true});
await copyFile(new URL('./index.html',import.meta.url),new URL('./preview-dist/index.html',import.meta.url));
await copyFile(new URL('./grab-test.html',import.meta.url),new URL('./preview-dist/grab-test.html',import.meta.url));
console.log('GO preview static assets prepared');
