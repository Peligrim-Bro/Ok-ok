import assert from 'node:assert/strict';
import {calculateSplitFromUi,formatSatang,validateReceiptPrice} from '../tools/split-ui-adapter.mjs';

const params={vat:true,service:true,taxMode:'excluded',taxFormula:'compound',tipPercent:0};
const equal=calculateSplitFromUi({...params,mode:'equal',equalTotal:100,equalPeople:3});
assert.equal(equal.grandTotal,11770);
assert.deepEqual(equal.equalGroups,[{amount:3924,count:1},{amount:3923,count:2}]);
const items=calculateSplitFromUi({...params,mode:'items',members:[{id:'a'},{id:'b'}],items:[{price:100,assignedIds:['a']},{price:20,assignedIds:[]}]});
assert.equal(items.grandTotal,14124);
assert.equal(Object.values(items.shares).reduce((a,b)=>a+b,0)+items.unassignedTotal,items.grandTotal);
assert.equal(formatSatang(1),'0.01 ฿');
assert.equal(validateReceiptPrice('10.25'),10.25);
assert.equal(validateReceiptPrice(''),null);
assert.equal(validateReceiptPrice('-10'),null);
console.log('SPLIT UI adapter checks passed');
