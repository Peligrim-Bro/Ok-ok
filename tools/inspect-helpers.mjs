/* Shared pure helpers for OK-OK INSPECT. No DOM, storage, or network. */
export function sanitizeInspectionFilename(rawName) {
  return String(rawName || 'bike').normalize('NFC')
    .replace(/[^\p{L}\p{N}_-]/gu, '_')
    .slice(0, 30) || 'bike';
}

/* Prevent an async photo operation started before reset from repopulating state. */
export function createCaptureEpoch() {
  let epoch = 0;
  return Object.freeze({
    capture: () => epoch,
    isCurrent: token => token === epoch,
    invalidate: () => ++epoch
  });
}

/* Snapshot the selected mode and its metadata before asynchronous PDF work. */
export function snapshotInspection(mode, store) {
  if (mode !== 'START' && mode !== 'RETURN') throw new Error('Unknown inspection mode');
  const source = store?.[mode];
  if (!source) throw new Error('Missing inspection data');
  return {
    mode,
    rentalName: String(source.rentalName || ''),
    plateNumber: String(source.plateNumber || ''),
    odometer: String(source.odometer || ''),
    damageNotes: String(source.damageNotes || ''),
    photos: Object.fromEntries(
      Object.entries(source.photos || {}).map(([key, value]) => [
        key, value && typeof value === 'object' ? {...value} : value
      ])
    )
  };
}
