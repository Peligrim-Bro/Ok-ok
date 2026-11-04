import assert from 'node:assert/strict';
import {sanitizeInspectionFilename, createCaptureEpoch, snapshotInspection} from '../tools/inspect-helpers.mjs';

assert.equal(sanitizeInspectionFilename('กข 1234'), 'กข_1234');
assert.equal(sanitizeInspectionFilename('АБ 123 / 45'), 'АБ_123___45');
assert.equal(sanitizeInspectionFilename(''), 'bike');
assert.equal(sanitizeInspectionFilename('../'), '___');

const epoch = createCaptureEpoch();
const before = epoch.capture();
assert.equal(epoch.isCurrent(before), true);
epoch.invalidate();
assert.equal(epoch.isCurrent(before), false);
const after = epoch.capture();
assert.equal(epoch.isCurrent(after), true);

const store = {
 START: {rentalName:'Rental',plateNumber:'กข 1234',photos:{front:{dataUrl:'before'}}},
 RETURN: {rentalName:'Rental',plateNumber:'กข 1234',photos:{front:{dataUrl:'after'}}}
};
const snapshot = snapshotInspection('START', store);
store.START.photos.front.dataUrl = 'changed';
assert.equal(snapshot.photos.front.dataUrl, 'before');
assert.equal(snapshot.mode, 'START');
assert.throws(() => snapshotInspection('UNKNOWN',store));
console.log('INSPECT helper checks passed');
