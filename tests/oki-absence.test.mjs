import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
function setup(){
 const storage=new Map(),context={localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}};
 new Script(readFileSync('oki-absence.js','utf8')).runInNewContext(context);
 return {...context.OKI_ABSENCE,storage};
}
const now=Date.parse('2026-10-22T00:00:00Z');
test('seven full days is the boundary; care declines alone cannot cause loss',()=>{
 const {transition,WEEK}=setup(),pet={gender:'boy',careDays:160,food:0,absenceSeenAt:now-WEEK+1};
 assert.equal(transition(pet,now).lost,false);
 assert.equal(transition({...pet,absenceSeenAt:now-WEEK},now).lost,true);
 assert.equal(transition({...pet,gender:''},now).lost,false);
});
test('legacy and invalid/future visit dates receive a fresh grace period',()=>{
 const {transition}=setup();for(const last of [undefined,null,0,-10,'old',NaN,now+1]){
  const r=transition({gender:'girl',careDays:190,absenceSeenAt:last},now);
  assert.equal(r.lost,false);assert.equal(r.next.careDays,190);assert.equal(r.next.absenceSeenAt,now);
 }
});
test('loss resets the pet while preserving account assets and reward limits',()=>{
 const {transition,WEEK}=setup();
 const old={gender:'boy',careDays:190,careStreak:11,xp:600,sleeping:true,crystals:231,skin:'aurora',owned:['neon','aurora'],shopUnlocked:true,giftDay:'2026-10-15',gameRewards:3,routineClaimDay:'2026-10-15',quest:{feed:true,pet:true,play:true},absenceGeneration:2,absenceSeenAt:now-WEEK};
 const r=transition(old,now);assert(r.lost);assert.equal(r.next.gender,'');assert.equal(r.next.careDays,0);assert.equal(r.next.careStreak,0);assert.equal(r.next.sleeping,false);assert.equal(r.next.absenceGeneration,3);assert.equal(r.next.absenceLostAt,now);
 for(const key of ['crystals','skin','owned','shopUnlocked','giftDay','gameRewards','routineClaimDay','quest'])assert.deepEqual(r.next[key],old[key]);
 assert.equal(old.careDays,190);
});
test('an old tab cannot overwrite a newer pet generation or an active visit',()=>{
 const {beforeSave,storage}=setup();storage.set('oki-life-v1',JSON.stringify({absenceGeneration:3,absenceSeenAt:now}));
 assert.equal(beforeSave({absenceGeneration:2,absenceSeenAt:now-100}),false);
 const current={gender:'girl',absenceGeneration:3,absenceSeenAt:now-100,absenceLostAt:now-100};assert(beforeSave(current));assert.equal(current.absenceSeenAt,now);assert.equal(current.absenceLostAt,0);
});
test('new pets do not inherit routine mutations from an earlier loss',()=>{
 const {transition,WEEK}=setup(),first=transition({gender:'boy',absenceSeenAt:now-WEEK},now);
 first.next.routine.feed=true;
 const second=transition({...first.next,gender:'girl',absenceSeenAt:now-WEEK},now);
 assert.equal(second.next.routine.feed,false);
});
test('loss and absence instructions are localized and do not claim immortality',()=>{
 const {notice}=setup();for(const lang of ['ru','en','th']){const s=notice({absenceLostAt:now,gender:''},lang);assert(s.includes('role="status"'));assert(s.includes('7'));assert(s.includes('ol-absence-rule'));}
 assert(!notice({gender:'boy',absenceLostAt:0},'ru').includes('role="status"'));
});
