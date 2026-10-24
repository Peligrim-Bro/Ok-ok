// Reviewed place facts shared by the website build and channel draft tools.
// Keep canonical records in their existing content files; never restamp dates.
import jkao from './content/jkao-seafood.json' with {type:'json'};
import musselana from './content/musselana-shabu.json' with {type:'json'};

const places = [jkao, musselana];
export const SHARED_PLACE_IDS = Object.freeze(places.map(place => place.id));

export function getSharedPlace(id, records = places) {
  const place = records.find(place => place.id === id);
  if (!place) throw Error('unknown_shared_place:' + id);
  for (const key of ['name', 'maps', 'photos', 'blurb', 'conditions', 'hoursText', 'ownerReview']) {
    if (!place[key]) throw Error('incomplete_shared_place:' + id + ':' + key);
  }
  if (!Array.isArray(place.photos) || !place.photos.length) throw Error('missing_place_photos:' + id);
  const map = new URL(place.maps);
  if (map.protocol !== 'https:' || map.username || map.password) throw Error('invalid_place_map:' + id);
  for (const key of ['blurb', 'conditions', 'hoursText', 'ownerReview']) {
    for (const lang of ['ru', 'en', 'th']) {
      if (typeof place[key][lang] !== 'string' || !place[key][lang].trim()) throw Error('missing_place_translation:' + id);
    }
  }
  return structuredClone(place);
}

export function placeDraft(id, records = places) {
  const place = getSharedPlace(id, records);
  // Draft only: an editor selects a slot, topics, artwork and approvals.
  // Owner review/conditions retain the actual historical visit information.
  return {
    approved: false, placeRef: id,
    text: [place.name, place.ownerReview.ru, place.hoursText.ru,
      place.conditions.ru, '📍 ' + place.maps].join('\n\n'),
    sourceSnapshot: {id, name: place.name, maps: place.maps,
      ownerReview: place.ownerReview, hoursText: place.hoursText, conditions: place.conditions}
  };
}
