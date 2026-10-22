import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const context={window:{}};runInNewContext(readFileSync('oki-place-guide.js','utf8'),context);
const {pick}=context.window.OKOK_GUIDE;
const places=[{id:'a',category:'food',minutes:60},{id:'b',category:'sights',minutes:60},{id:'c',category:'sights',minutes:120},{id:'d',category:'sights',minutes:240},{id:'e',category:'sights',minutes:480}];
const minutes=p=>p.minutes,all=()=>true;
test('guide matches category and visit limit without changing catalogue or history',()=>{
 const before=JSON.stringify(places),excluded=['b'];
 assert.deepEqual(Array.from(pick(places,'sights',240,excluded,minutes,all),p=>p.id),['c','d']);
 assert.equal(JSON.stringify(places),before);assert.deepEqual(excluded,['b']);
 assert.deepEqual(Array.from(pick(places,'food',60,[],minutes,all),p=>p.id),['a']);
});
test('family predicate, three-item pages and exhausted results are explicit',()=>{
 assert.deepEqual(Array.from(pick(places,'sights',480,[],minutes,p=>p.id!=='c'),p=>p.id),['b','d','e']);
 assert.deepEqual(Array.from(pick(places,'sights',480,[],minutes,all,3),p=>p.id),['e']);
 assert.equal(pick(places,'sights',60,['b'],minutes,all).length,0);
 assert.deepEqual(Array.from(pick(places,'food',60,[],minutes,all,3),p=>p.id),['a']);
});
