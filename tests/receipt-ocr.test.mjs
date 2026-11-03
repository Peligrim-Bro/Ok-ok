import assert from 'node:assert/strict';
import {parseReceiptCandidates} from '../tools/receipt-ocr.mjs';
const rows=parseReceiptCandidates('Pad Thai 120.00\n2 x Fried Rice 80.00\nTOTAL 280.00\nVAT 7% 19.60\nต้มยำกุ้ง 150\nWater 1,200.00\nDiscount -20');
assert.deepEqual(rows.map(x=>[x.name,x.price,x.quantity]),[
 ['Pad Thai',120,1],['Fried Rice',80,2],['ต้มยำกุ้ง',150,1],['Water',1200,1]
]);
assert.deepEqual(parseReceiptCandidates('TOTAL 200\nChange 10\n'),[]);
console.log('Receipt OCR parser checks passed');
