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
  directory,
  "--module",
  "commonjs",
  "--target",
  "es2017",
  "--skipLibCheck",
]);
const require = createRequire(import.meta.url);
const { parseFormulaValue: parse } = require(
  join(directory, "application/parseFormulaValue.js"),
);
const { gravitationalForce, solveGravity } = require(
  join(directory, "domain/gravitation.js"),
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

const { changeFormulaInput, initialFormulaInput, isInLaboratoryRange } = require(
  join(directory, "application/formulaInput.js"),
);
const enterValues = (entries, initial = initialFormulaInput) =>
  Object.entries(entries).reduce((state, [key, text]) => changeFormulaInput(state, key, text), initial);

test("the third valid entry selects each possible unknown and solves in SI", () => {
  const expected = { mass1: 40e12, mass2: 40e12, distance: 8000 };
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
  const solved = enterValues({ mass1: "40e12", mass2: "40e12", distance: "8000" });
  const incomplete = changeFormulaInput(solved, "distance", "1e-");
  assert.equal(incomplete.unknown, "force");
  assert.equal(incomplete.result, null);
  assert.equal(incomplete.numericalError, false);
  const next = changeFormulaInput(incomplete, "distance", "16000");
  assert.equal(next.unknown, "force");
  assert.equal(next.result.force, solved.result.force / 4);
  assert.equal(solved.values.distance, "8000");
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

test("laboratory synchronization includes slider bounds and rejects only out-of-range solutions", () => {
  for (const mass1 of [1e13, 1e14]) for (const mass2 of [1e13, 1e14]) {
    for (const distance of [5000, 20000]) {
      assert.ok(isInLaboratoryRange({ mass1, mass2, distance, force: 1 }));
    }
  }
  const baseline = { mass1: 40e12, mass2: 40e12, distance: 8000, force: 1 };
  for (const [key, value] of [["mass1", 1e13 - 1], ["mass1", 1e14 + 1],
    ["mass2", 1e13 - 1], ["mass2", 1e14 + 1], ["distance", 4999], ["distance", 20001]]) {
    assert.equal(isInLaboratoryRange({ ...baseline, [key]: value }), false);
  }
});
