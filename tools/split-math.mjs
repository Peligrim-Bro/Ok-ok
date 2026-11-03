/* OK-OK SPLIT: pure satang math; standalone, no DOM or network. */
export const toSatang = amount => {
  const value = Number(amount);
  if (!Number.isFinite(value) || value < 0 || value > 1_000_000) throw new RangeError('Invalid THB amount');
  return Math.round(value * 100);
};

export function calculateSplit({ items = [], members = [], service = false, vat = false, taxMode = 'excluded', taxFormula = 'compound', tipPercent = 0 }) {
  const memberIds = members.map(m => m.id);
  if (new Set(memberIds).size !== memberIds.length) throw new Error('Duplicate member IDs');
  if (!Number.isFinite(tipPercent) || tipPercent < 0 || tipPercent > 100) throw new RangeError('Invalid tip');
  let multiplier = 1;
  if (taxMode === 'included') multiplier += tipPercent / 100;
  else if (taxMode === 'excluded') {
    multiplier = taxFormula === 'compound'
      ? (service ? 1.1 : 1) * (vat ? 1.07 : 1)
      : 1 + (service ? 0.1 : 0) + (vat ? 0.07 : 0);
    multiplier += tipPercent / 100;
  } else throw new Error('Unknown tax mode');

  const base = Object.fromEntries(memberIds.map(id => [id, 0]));
  let total = 0, unassigned = 0;
  for (const item of items) {
    const amount = toSatang(item.price);
    total += amount;
    const ids = [...new Set(item.assignedIds || [])];
    if (ids.some(id => !Object.hasOwn(base, id))) throw new Error('Unknown participant in item');
    if (!ids.length) unassigned += amount;
    else for (const id of ids) base[id] += amount / ids.length;
  }
  const grandTotal = Math.round(total * multiplier);
  const unassignedTotal = total ? Math.round(grandTotal * unassigned / total) : 0;
  const allocatedTarget = grandTotal - unassignedTotal;
  const assignedTotal = total - unassigned;
  const shares = Object.fromEntries(memberIds.map(id => [id, 0]));
  if (assignedTotal && allocatedTarget) {
    const ranked = memberIds.map((id, index) => {
      const exact = base[id] / assignedTotal * allocatedTarget;
      const floor = Math.floor(exact);
      shares[id] = floor;
      return { id, index, remainder: exact - floor };
    }).sort((a,b) => b.remainder - a.remainder || a.index - b.index);
    let left = allocatedTarget - Object.values(shares).reduce((a,b) => a+b, 0);
    for (let i = 0; i < left; i++) shares[ranked[i % ranked.length].id]++;
  }
  if (Object.values(shares).reduce((a,b)=>a+b, 0) + unassignedTotal !== grandTotal)
    throw new Error('Split does not reconcile');
  return { grandTotal, unassignedTotal, shares, multiplier };
}

export function splitEqually(amount, people, multiplier = 1) {
  if (!Number.isSafeInteger(people) || people < 1 || people > 1000) throw new RangeError('Invalid guest count');
  if (!Number.isFinite(multiplier) || multiplier < 0) throw new RangeError('Invalid multiplier');
  const total = Math.round(toSatang(amount) * multiplier);
  const low = Math.floor(total / people);
  const extra = total % people;
  return { total, shares: Array.from({length:people}, (_,i) => low + (i < extra ? 1 : 0)) };
}
