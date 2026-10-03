import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=readFileSync('site/public/index.html','utf8');
const source=html.slice(html.indexOf('    const HOLIDAY_PLACES ='),html.indexOf('    function renderRules()',html.indexOf('    const HOLIDAY_PLACES =')));
const storage=new Map();
const context={localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},lang:'ru',console,URL,URLSearchParams};
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

run("holidayState.seen=[];holidayState.visited=[];holidayCategory='all';holidayTime='hour'");
assert.ok(run('holidayPool().length')>0);assert.equal(run('holidayPool().every(p=>holidayMinutes(p)<=60)'),true);
run("holidayTime='half';holidayFamily=true");assert.equal(run('holidayPool().some(p=>p.id==="t20-walk")'),false);assert.equal(run('holidayPool().some(p=>p.id==="t20-nong")'),true);assert.equal(run('holidayPool().some(p=>p.id==="t20-larn")'),false);
run("holidayCategory='food'");assert.equal(run('holidayPool().length'),30);
run("holidayTime='day';holidayCategory='sights'");assert.equal(run('holidayPool().some(p=>p.id==="t20-larn")'),true);
run('holidayState.saved=HOLIDAY_PLACES.slice(0,12).map(p=>p.id).reverse()');assert.equal(run('holidaySaved()[0].id'),run('HOLIDAY_PLACES[11].id'));
const routes=JSON.parse(run('JSON.stringify(holidayRoutes(holidaySaved()))'));assert.equal(routes.length,3);
for(const r of routes){const u=new URL(r.url);assert.equal(u.searchParams.get('api'),'1');assert.ok(r.stops.length<=5);assert.ok((u.searchParams.get('waypoints')||'').split('|').length<=3);assert.ok(u.searchParams.get('origin'));assert.ok(u.searchParams.get('destination'));}
assert.equal(routes[0].stops.at(-1).id,routes[1].stops[0].id);assert.equal(routes.at(-1).stops.at(-1).id,run('HOLIDAY_PLACES[0].id'));
assert.equal(run('holidayRoutes([]).length'),0);assert.equal(run('holidayRoutes([HOLIDAY_PLACES[0]]).length'),0);assert.equal(run('holidayRoutes(HOLIDAY_PLACES.slice(0,2)).length'),1);
console.log('PASS planner: time and family intersections, saved order, mobile route limits and contiguous sections.');
