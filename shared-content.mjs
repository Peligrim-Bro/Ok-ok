// Reviewed place facts shared by the website build and channel draft tools.
// Keep canonical records in their existing content files; never restamp dates.
import jkao from './content/jkao-seafood.json' with {type:'json'};
import musselana from './content/musselana-shabu.json' with {type:'json'};

const places = new Map([jkao, musselana].map(place => [place.id, place]));
export const SHARED_PLACE_IDS = Object.freeze([...places.keys()]);

export function getSharedPlace(id) {
  const place = places.get(id);
  if (!place) throw Error('unknown_shared_place:' + id);
  for (const key of ['name', 'maps', 'photos', 'blurb', 'conditions', 'hoursText', 'ownerReview']) {
    if (!place[key]) throw Error('incomplete_shared_place:' + id + ':' + key);
  }
  return structuredClone(place);
}

export function placeDraft(id) {
  const place = getSharedPlace(id);
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
