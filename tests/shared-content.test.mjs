import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {getSharedPlace, placeDraft, SHARED_PLACE_IDS} from '../shared-content.mjs';
import {POSTS} from '../channel-posts.mjs';
import {projectContext} from '../scripts/project-context.mjs';

test('website records and channel drafts use the same canonical reviewed facts', () => {
  for (const id of SHARED_PLACE_IDS) {
    const canonical = JSON.parse(readFileSync(new URL('../content/'+id+'.json', import.meta.url)));
    assert.deepEqual(getSharedPlace(id), canonical);
    const draft = placeDraft(id);
    assert.equal(draft.approved, false);
    assert.equal(draft.placeRef, id);
    for (const text of [canonical.ownerReview.ru, canonical.hoursText.ru, canonical.conditions.ru, canonical.maps]) {
      assert(draft.text.includes(text));
    }
    assert.equal(draft.publishAt, undefined);
    assert.equal(draft.id, undefined);
  }
});

test('a factual edit feeds a new draft without changing approved queue identity', () => {
  const before = JSON.stringify(POSTS);
  const record = getSharedPlace('jkao-seafood');
  record.hoursText.ru = 'Тестовая правка: часы уточняются';
  assert(placeDraft(record.id, [record]).text.includes(record.hoursText.ru));
  assert(!placeDraft(record.id).text.includes(record.hoursText.ru));
  assert.equal(JSON.stringify(POSTS), before);
});

test('callers cannot mutate the shared records or lose required languages/maps', () => {
  const record = getSharedPlace('jkao-seafood');
  record.photos.push('wrong');
  assert(!getSharedPlace(record.id).photos.includes('wrong'));
  delete record.ownerReview.th;
  assert.throws(() => placeDraft(record.id, [record]), /missing_place_translation/);
  assert.throws(() => getSharedPlace('missing'), /unknown_shared_place/);
  const invalid = getSharedPlace('jkao-seafood'); invalid.maps = 'http://example.com';
  assert.throws(() => placeDraft(invalid.id, [invalid]), /invalid_place_map/);
});

test('continuation reads real sources and keeps deferred ideas explicitly deferred', () => {
  const report = projectContext();
  assert(report.tasks.some(t => t.id === 'selfie-tarot' && t.status === 'deferred'));
  assert(report.tasks.some(t => t.id === 'catalogue-assistant' && t.status === 'deferred'));
  for (const file of report.sources) {
    assert.equal(file.sha256, createHash('sha256').update(readFileSync(new URL('../'+file.path, import.meta.url))).digest('hex'));
  }
  const content = projectContext('content');
  assert(content.decisions.length > 0);
  assert(!content.tasks.some(t => t.id === 'selfie-tarot'));
});
