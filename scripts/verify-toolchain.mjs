// Offline checks for the actual Lighthouse dependency consumers, not network services.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';

const require = createRequire(import.meta.url);
const lhci = createRequire(require.resolve('@lhci/cli/package.json'));
const uuid = lhci('uuid');
assert(uuid.validate(uuid.v4()), 'Lighthouse UUID v4 consumer must remain compatible');
assert.equal(uuid.v5('example', uuid.v5.DNS), '7cb48787-6d91-5b9f-bc60-f30298ea5736');
assert.throws(() => uuid.v5('x', uuid.v5.DNS, new Uint8Array(8), 4), RangeError,
              'Short UUID output buffers must be rejected');

const uri = createRequire(require.resolve('get-uri/package.json'));
assert.equal(typeof require('get-uri').getUri, 'function');
const ftp = uri('basic-ftp');
const entries = ftp.parseList('-rw-r--r-- 1 owner group 12 Oct 20 12:00 example.txt\r\n');
assert.equal(entries.length, 1);
assert.equal(entries[0].name, 'example.txt');
assert.equal(entries[0].size, 12);
const client = new ftp.Client();
for (const method of ['access', 'downloadTo', 'list', 'lastMod', 'size', 'close'])
  assert.equal(typeof client[method], 'function', `get-uri FTP consumer needs ${method}`);
client.close();

// Bound the regression check in a child so an accidentally restored vulnerable
// parser cannot hang CI. The malformed listing uses only local synthetic data.
const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
 import {createRequire} from 'node:module';
 const require=createRequire(import.meta.url);
 const uri=createRequire(require.resolve('get-uri/package.json'));
 const {parseList}=uri('basic-ftp');
 const malformed='-rw-r--r-- 1 '+('owner '.repeat(10000))+'invalid';
 parseList(malformed+'\\r\\n-rw-r--r-- 1 owner group 12 Oct 20 12:00 example.txt\\r\\n');
`], {cwd: process.cwd(), timeout: 3000, encoding: 'utf8'});
assert.ifError(result.error);
assert.equal(result.status, 0, result.stderr || 'FTP parser regression');
console.log('PASS: Lighthouse UUID API, buffer bounds and get-uri FTP parser compatibility');
