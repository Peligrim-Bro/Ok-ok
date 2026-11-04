import assert from 'node:assert/strict';
import {calculateSplit, splitEqually} from '../tools/split-math.mjs';

const equal = splitEqually(100, 3);
assert.equal(equal.total, 10000);
assert.deepEqual(equal.shares, [3334, 3333, 3333]);

const members = [{id:'a'}, {id:'b'}, {id:'c'}];
const split = calculateSplit({
  members,
  items: [
    {price:100, assignedIds:['a','b']},
    {price:50, assignedIds:['c']},
    {price:20, assignedIds:[]}
  ],
  vat:true, service:true, tipPercent:5
});
assert.equal(split.grandTotal, Math.round(17000 * (1.1*1.07 + .05)));
assert.equal(Object.values(split.shares).reduce((a,b)=>a+b,0) + split.unassignedTotal, split.grandTotal);
assert.equal(calculateSplit({members,items:[{price:0.01,assignedIds:['a','b','c']}]}).grandTotal, 1);
assert.throws(() => calculateSplit({members,items:[{price:10,assignedIds:['missing']}]}));
assert.throws(() => splitEqually(100, 0));
console.log('SPLIT math checks passed');
