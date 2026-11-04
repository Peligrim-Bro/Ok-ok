import { calculateSplit, splitEqually, toSatang } from './split-math.mjs';

/**
 * Adapter for the owner's original SPLIT HTML.
 * Import this module from split-bill.html with <script type="module">,
 * then replace the original calculate() function with a wrapper that
 * calls calculateSplitFromUi. No changes to the live website.
 */
export function calculateSplitFromUi({
  mode, items, members, vat, service, taxMode, taxFormula, tipPercent,
  equalTotal, equalPeople
}) {
  const params = {vat, service, taxMode, taxFormula, tipPercent};
  const rate = calculateSplit({...params, items:[], members:[]}).multiplier;
  if (mode === 'equal') {
    const result = splitEqually(equalTotal || 0, equalPeople, rate);
    const groups = new Map();
    for (const satang of result.shares) groups.set(satang, (groups.get(satang) || 0) + 1);
    return {
      mode, grandTotal: result.total, unassignedTotal: 0,
      equalGroups: [...groups].map(([amount, count]) => ({amount, count})),
      multiplier: rate
    };
  }
  if (mode !== 'items') throw new Error('Unknown split mode');
  const result = calculateSplit({...params,items,members});
  return {...result,mode,equalGroups:[]};
}

export function formatSatang(satang) {
  if (!Number.isSafeInteger(satang) || satang < 0) throw new RangeError('Invalid satang');
  return (satang / 100).toFixed(2) + ' ฿';
}

export function validateReceiptPrice(raw) {
  const value = Number(raw);
  if (raw === '' || !Number.isFinite(value) || value <= 0 || value > 1_000_000)
    return null;
  return toSatang(value) / 100;
}
