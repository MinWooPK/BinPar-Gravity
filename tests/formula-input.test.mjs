import { after, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";

const directory = mkdtempSync(join(tmpdir(), "gravity-formula-"));
after(() => rmSync(directory, { recursive: true, force: true }));
execFileSync(process.execPath, [
  "node_modules/typescript/bin/tsc",
  "src/features/gravity/application/parseFormulaValue.ts",
  "src/features/gravity/application/formulaInput.ts",
  "src/features/gravity/domain/gravitation.ts",
  "--outDir",
  directory, "--rootDir", "src",
  "--module",
  "commonjs",
  "--target",
  "es2017",
  "--skipLibCheck",
]);
const require = createRequire(import.meta.url);
const { parseFormulaValue: parse } = require(
  join(directory, "features/gravity/application/parseFormulaValue.js"),
);
const { gravitationalForce, solveGravity } = require(
  join(directory, "features/gravity/domain/gravitation.js"),
);

test("formula accepts decimal points and commas without changing SI units", () => {
  for (const [text, value] of [
    ["10", 10],
    [" 10,5 ", 10.5],
    ["10.5", 10.5],
    [",5", 0.5],
    ["+2", 2],
  ])
    assert.equal(parse(text), value);
});
test("scientific notation preserves large masses and very small forces", () => {
  assert.equal(parse("40e12"), 40e12);
  assert.equal(parse("6,6743e-11"), 6.6743e-11);
});
test("empty and unfinished entries cannot trigger a calculation", () => {
  for (const text of ["", " ", ".", ",", "+", "1e", "1e-"])
    assert.equal(parse(text), null, text);
});
test("invalid, non-positive and unrepresentable numbers are rejected", () => {
  for (const text of [
    "abc",
    "0",
    "-2",
    "NaN",
    "Infinity",
    "1e999",
    "1e-999",
    "0x10",
    "1,2.3",
    "1 000",
  ])
    assert.equal(parse(text), null, text);
});
test("parsed inputs recover each of the four unknowns using the existing solver", () => {
  const parameters = { mass1: 10.5, mass2: 20, distance: 10 };
  const expected = { ...parameters, force: gravitationalForce(parameters) };
  const entries = {
    force: String(expected.force).replace(".", ","),
    mass1: "10,5",
    mass2: "20",
    distance: "10",
  };
  for (const unknown of Object.keys(entries)) {
    const known = Object.fromEntries(
      Object.entries(entries)
        .filter(([key]) => key !== unknown)
        .map(([key, value]) => [key, parse(value)]),
    );
    const result = solveGravity(unknown, known);
    assert.ok(
      Math.abs(result[unknown] / expected[unknown] - 1) < 1e-12,
      unknown,
    );
  }
});

const { changeFormulaInput, initialFormulaInput, isInLaboratoryRange, selectFormulaUnknown } = require(
  join(directory, "features/gravity/application/formulaInput.js"),
);
const enterValues = (entries, initial = initialFormulaInput) =>
  Object.entries(entries).reduce((state, [key, text]) => changeFormulaInput(state, key, text), initial);

test("the third valid entry selects each possible unknown and solves in SI", () => {
  const expected = { mass1: 40, mass2: 40, distance: 8 };
  const entries = { ...expected, force: gravitationalForce(expected) };
  for (const unknown of Object.keys(entries)) {
    const state = enterValues(Object.fromEntries(Object.entries(entries)
      .filter(([key]) => key !== unknown).map(([key, value]) => [key, String(value)])));
    assert.equal(state.unknown, unknown);
    assert.ok(Math.abs(state.result[unknown] / entries[unknown] - 1) < 1e-12);
    assert.equal(state.numericalError, false);
  }
  assert.deepEqual(initialFormulaInput.values, { force: "", mass1: "", mass2: "", distance: "" });
});

test("unfinished edits clear stale results but preserve the unknown until reset", () => {
  const solved = enterValues({ mass1: "40", mass2: "40", distance: "8" });
  const incomplete = changeFormulaInput(solved, "distance", "1e-");
  assert.equal(incomplete.unknown, "force");
  assert.equal(incomplete.result, null);
  assert.equal(incomplete.numericalError, false);
  const next = changeFormulaInput(incomplete, "distance", "16");
  assert.equal(next.unknown, "force");
  assert.equal(next.result.force, solved.result.force / 4);
  assert.equal(solved.values.distance, "8");
  assert.deepEqual(initialFormulaInput, {
    values: { force: "", mass1: "", mass2: "", distance: "" },
    unknown: null, result: null, numericalError: false,
  });
});

test("numerical overflow preserves the inferred unknown and recovers on correction", () => {
  const overflow = enterValues({ mass1: "1e308", mass2: "1e308", distance: "1" });
  assert.equal(overflow.unknown, "force");
  assert.equal(overflow.result, null);
  assert.equal(overflow.numericalError, true);
  const corrected = enterValues({ mass1: "1", mass2: "1" }, overflow);
  assert.equal(corrected.numericalError, false);
  assert.equal(corrected.result.force, gravitationalForce({ mass1: 1, mass2: 1, distance: 1 }));
});

test("laboratory application includes slider bounds and rejects out-of-range solutions", () => {
  for (const mass1 of [10, 100]) for (const mass2 of [10, 100]) {
    for (const distance of [5, 20]) {
      assert.ok(isInLaboratoryRange({ mass1, mass2, distance, force: 1 }));
    }
  }
  const baseline = { mass1: 40, mass2: 40, distance: 8, force: 1 };
  for (const [key, value] of [["mass1", 9], ["mass1", 101],
    ["mass2", 9], ["mass2", 101], ["distance", 4.9], ["distance", 20.1]]) {
    assert.equal(isInLaboratoryRange({ ...baseline, [key]: value }), false);
  }
});

test("an explicitly selected unknown solves from its three known inputs", () => {
  const parameters = { mass1: 40, mass2: 60, distance: 12.5 };
  const expected = { ...parameters, force: gravitationalForce(parameters) };
  for (const unknown of Object.keys(expected)) {
    const selected = selectFormulaUnknown(initialFormulaInput, unknown);
    assert.equal(selected.unknown, unknown);
    assert.equal(selected.result, null);
    const solved = enterValues(Object.fromEntries(Object.entries(expected)
      .filter(([key]) => key !== unknown).map(([key, value]) => [key, String(value)])), selected);
    assert.equal(solved.unknown, unknown);
    assert.ok(Math.abs(solved.result[unknown] / expected[unknown] - 1) < 1e-12);
    assert.equal(solved.values[unknown], "");
    assert.equal(solved.numericalError, false);
  }
});

test("changing the unknown reuses the latest result without rounding or altering known drafts", () => {
  const initial = selectFormulaUnknown(initialFormulaInput, "force");
  const solved = enterValues({ mass1: "1,2345678901234567e13", mass2: "7.654321098765432e13", distance: "8123.456789012345" }, initial);
  const latest = changeFormulaInput(solved, "distance", "9234.567890123456");
  assert.notEqual(latest.result.force, solved.result.force);
  const mass = selectFormulaUnknown(latest, "mass1");
  assert.equal(mass.values.force, String(latest.result.force));
  assert.equal(parse(mass.values.force), latest.result.force);
  assert.equal(mass.values.mass1, "");
  assert.equal(mass.values.mass2, latest.values.mass2);
  assert.equal(mass.values.distance, latest.values.distance);
  assert.ok(Math.abs(mass.result.mass1 / latest.result.mass1 - 1) < 1e-12);
  const distance = selectFormulaUnknown(mass, "distance");
  assert.equal(distance.values.mass1, String(mass.result.mass1));
  assert.equal(distance.values.force, mass.values.force);
  assert.equal(distance.values.distance, "");
  assert.ok(Math.abs(distance.result.distance / latest.result.distance - 1) < 1e-12);
});

test("the selected unknown cannot be edited or erase its current result", () => {
  const state = enterValues({ mass1: "40", mass2: "40", distance: "8" },
    selectFormulaUnknown(initialFormulaInput, "force"));
  for (const text of ["1", "", "Infinity"]) {
    assert.strictEqual(changeFormulaInput(state, "force", text), state);
  }
  assert.strictEqual(selectFormulaUnknown(state, "force"), state);
});

test("invalid or unfinished known inputs clear results and retain the explicit unknown", () => {
  const solved = enterValues({ force: "6.6743e-11", mass2: "1", distance: "1" },
    selectFormulaUnknown(initialFormulaInput, "mass1"));
  for (const text of ["", "1e-", "-1", "0", "NaN", "Infinity", "1e999", "1e-999"]) {
    const invalid = changeFormulaInput(solved, "force", text);
    assert.equal(invalid.unknown, "mass1", text);
    assert.equal(invalid.result, null, text);
    assert.equal(invalid.numericalError, false, text);
    const changed = selectFormulaUnknown(invalid, "distance");
    assert.equal(changed.values.force, text);
    assert.equal(changed.values.mass1, "");
    assert.equal(changed.result, null);
  }
  assert.equal(changeFormulaInput(solved, "force", "1.33486e-10").result.mass1, 2);
});

test("explicit calculations recover from overflow and preserve very small results", () => {
  const initial = selectFormulaUnknown(initialFormulaInput, "force");
  const overflow = enterValues({ mass1: "1e308", mass2: "1e308", distance: "1" }, initial);
  assert.equal(overflow.unknown, "force");
  assert.equal(overflow.result, null);
  assert.equal(overflow.numericalError, true);
  const corrected = enterValues({ mass1: "1e-200", mass2: "1" }, overflow);
  assert.equal(corrected.numericalError, false);
  assert.ok(corrected.result.force > 0);
  const mass = selectFormulaUnknown(corrected, "mass1");
  assert.equal(parse(mass.values.force), corrected.result.force);
  assert.ok(Math.abs(mass.result.mass1 / 1e-200 - 1) < 1e-12);
});

test("selection and edits never mutate inputs, and a fresh calculator starts without stale values", () => {
  const solved = enterValues({ mass1: "40", mass2: "40", distance: "8" },
    selectFormulaUnknown(initialFormulaInput, "force"));
  const snapshot = structuredClone(solved);
  Object.freeze(solved.values);
  Object.freeze(solved.result);
  Object.freeze(solved);
  selectFormulaUnknown(solved, "distance");
  changeFormulaInput(solved, "mass1", "80");
  assert.deepEqual(solved, snapshot);
  assert.deepEqual(selectFormulaUnknown(initialFormulaInput, "force"), {
    values: { force: "", mass1: "", mass2: "", distance: "" },
    unknown: "force", result: null, numericalError: false,
  });
  assert.equal(initialFormulaInput.unknown, null);
});
