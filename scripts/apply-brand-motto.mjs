import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {BRAND} from '../brand-copy.mjs';
const path='site/public/index.html';let html=readFileSync(path,'utf8');
// Replace the construction notice in the existing contact/notes block. No new
// first-screen row, script, dependency or request; source notes remain intact.
const old=/const notes = \[\{ru:"Сайт в процессе строительства\.[^\n]+?\}, \.\.\.\(CFG.notes \|\| \[\]\)\];/;
assert(old.test(html),'Brand motto: author notice anchor missing');
const note=Object.fromEntries(Object.entries(BRAND).map(([lang,c])=>[lang,'<b>'+c.motto+'</b><br>'+c.cta.share]));
html=html.replace(old,'const notes = ['+JSON.stringify(note)+', ...(CFG.notes || [])];');
writeFileSync(path,html);
console.log('PASS: owner-approved mission in existing contact notes, RU/EN/TH');
