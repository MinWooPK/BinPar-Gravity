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
  "src/features/gravity/components/parseFormulaValue.ts",
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
  join(directory, "components/parseFormulaValue.js"),
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
