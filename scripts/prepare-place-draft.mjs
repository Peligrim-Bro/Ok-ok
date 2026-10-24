import {placeDraft, SHARED_PLACE_IDS} from '../shared-content.mjs';
const id = process.argv[2];
if (!id) throw Error('Choose place: ' + SHARED_PLACE_IDS.join(', '));
// Prints a reviewable draft. Never inserts into POSTS or calls Telegram/AI.
console.log(JSON.stringify(placeDraft(id), null, 2));
