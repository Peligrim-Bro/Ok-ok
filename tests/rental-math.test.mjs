import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateRental,
  compareRentals,
  parseAmount,
} from "../tools/rental-math.mjs";
const terms = {
  rent: "12000",
  deposit: "24000",
  advance: "12000",
  once: "500",
  powerRate: "7",
  powerUse: "200",
  water: "300",
  internet: "500",
  other: "0",
};
test("entry counts total advance once; deposit stays out of monthly costs", () => {
  const r = calculateRental(terms);
  assert.equal(r.upfront, 36500);
  assert.equal(r.monthly, 14200);
  assert.equal(calculateRental({ ...terms, advance: "36000" }).upfront, 60500);
});
test("unknown usage is incomplete, zero is a known charge", () => {
  const r = calculateRental({ ...terms, powerUse: "" });
  assert.equal(r.monthly, 12800);
  assert.deepEqual(r.monthlyMissing, ["powerUse"]);
  assert.equal(compareRentals(r, calculateRental(terms)), null);
  assert.equal(calculateRental({ ...terms, powerUse: "0" }).monthly, 12800);
});
test("reject negative, exponent, non-finite and malformed input", () => {
  for (const v of ["-1", "1e4", "Infinity", "1,2,3", "100000001", "0.001"])
    assert.ok(Number.isNaN(parseAmount(v)));
  assert.equal(parseAmount("1,25"), 1.25);
  assert.equal(calculateRental({ ...terms, rent: "-2" }).invalid[0], "rent");
});
test("decimal amounts round at satang and comparison retains its sign", () => {
  const a = calculateRental({
    ...terms,
    rent: "0.10",
    water: "0.20",
    internet: "0",
    other: "0",
    powerUse: "0",
  });
  assert.equal(a.monthly, 0.3);
  assert.equal(
    compareRentals(
      calculateRental(terms),
      calculateRental({ ...terms, rent: "11800" }),
    ),
    -200,
  );
});
