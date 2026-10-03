import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=readFileSync('site/public/index.html','utf8');
const source=html.slice(html.indexOf('    const HOLIDAY_PLACES ='),html.indexOf('    function renderRules()',html.indexOf('    const HOLIDAY_PLACES =')));
const storage=new Map();
const context={localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},lang:'ru',console};
vm.createContext(context);vm.runInContext(source,context);
const run=s=>vm.runInContext(s,context);
assert.equal(run('HOLIDAY_PLACES.length'),50);
assert.equal(run('new Set(HOLIDAY_PLACES.map(p=>p.name)).size'),50);
for(const lang of ['ru','en','th']){context.lang=lang;assert.ok(run('HW().lead').includes('50'));assert.ok(run('HW().visited'));}
assert.equal(run("HOLIDAY_PLACES.filter(p=>p.category==='sights').length"),20);
assert.equal(run("HOLIDAY_PLACES.filter(p=>p.category==='food').length"),30);
const picked=[];
for(let i=0;i<50;i++){const id=run('holidayPool()[0].id');picked.push(id);run('holidayState.seen.push('+JSON.stringify(id)+')');}
assert.equal(new Set(picked).size,50);assert.equal(run('holidayPool().length'),0);
run("holidayState.seen=[];holidayState.visited=[HOLIDAY_PLACES[0].id];holidayState.saved=[HOLIDAY_PLACES[1].id];holidayPersist()");
assert.equal(run('holidayPool().length'),49);
assert.equal(run("holidayCategory='food';holidayPool().length"),30);
assert.equal(run("holidayCategory='sights';holidayPool().length"),19);
const restored={...context};vm.createContext(restored);vm.runInContext(source,restored);
assert.equal(vm.runInContext('holidayState.saved.length',restored),1);
assert.equal(vm.runInContext('holidayState.visited.length',restored),1);
assert.ok(!source.includes('Math.random() < 0.22'));
assert.ok(source.includes('start=fi10072'));
console.log('PASS holiday wheel: 50 unique places, categories, no repeats, visited exclusion, saved persistence, RU/EN/TH and Senate referral.');
