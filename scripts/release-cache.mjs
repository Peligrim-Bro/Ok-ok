import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

export function releaseCacheName(info) {
  assert(info && typeof info.builtAt === 'string' && Number.isFinite(Date.parse(info.builtAt)), 'Missing build timestamp');
  assert(info.commit === null || /^[a-f0-9]{40}$/i.test(info.commit), 'Invalid source commit');
  const identity = info.commit?.toLowerCase() || info.builtAt;
  const id = info.commit ? identity.slice(0,12) : createHash('sha256').update(identity).digest('hex').slice(0,12);
  return 'pattayaok-release-' + id;
}

export function verifyReleaseCache(sw, info) {
  const declarations = [...sw.matchAll(/\bconst\s+CACHE\s*=\s*([^;]+);/g)];
  assert.equal(declarations.length, 1, 'Expected one service-worker cache declaration');
  assert.equal(declarations[0][1].trim(), JSON.stringify(releaseCacheName(info)), 'Cache must be a fixed literal tied to this build identity');
}
