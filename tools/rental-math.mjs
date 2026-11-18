// Amounts are rounded to satang before summing. Blank is unknown, never zero.
export const FIELDS = [
  "rent",
  "deposit",
  "advance",
  "once",
  "powerRate",
  "powerUse",
  "water",
  "internet",
  "other",
];
export function parseAmount(raw) {
  const s = String(raw ?? "")
    .trim()
    .replace(",", ".");
  if (!s) return null;
  if (!/^\d+(?:\.\d{1,2})?$/.test(s)) return NaN;
  const n = Number(s);
  return n <= 1000000 ? n : NaN;
}
export function calculateRental(raw) {
  const v = Object.fromEntries(FIELDS.map((k) => [k, parseAmount(raw[k])]));
  const invalid = FIELDS.filter((k) => Number.isNaN(v[k]));
  if (invalid.length) return { invalid };
  const sum = (keys) =>
    keys.reduce((n, k) => n + Math.round((v[k] ?? 0) * 100), 0) / 100;
  const upfrontMissing = ["deposit", "advance", "once"].filter(
    (k) => v[k] === null,
  );
  const monthlyMissing = [
    "rent",
    "powerRate",
    "powerUse",
    "water",
    "internet",
    "other",
  ].filter((k) => v[k] === null);
  const power =
    v.powerRate === null || v.powerUse === null
      ? null
      : Math.round(v.powerRate * v.powerUse * 100) / 100;
  return {
    invalid,
    upfront: sum(["deposit", "advance", "once"]),
    monthly:
      Math.round(
        (sum(["rent", "water", "internet", "other"]) + (power ?? 0)) * 100,
      ) / 100,
    power,
    deposit: v.deposit,
    upfrontMissing,
    monthlyMissing,
  };
}
export function compareRentals(a, b) {
  if (
    a.invalid.length ||
    b.invalid.length ||
    a.monthlyMissing.length ||
    b.monthlyMissing.length
  )
    return null;
  return Math.round((b.monthly - a.monthly) * 100) / 100;
}
