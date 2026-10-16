import { after, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";

const directory = mkdtempSync(join(tmpdir(), "gravity-tests-"));
after(() => rmSync(directory, { recursive: true, force: true }));
execFileSync(process.execPath, [
  "node_modules/typescript/bin/tsc",
  "src/features/gravity/domain/gravitation.ts",
  "--outDir",
  directory,
  "--module",
  "commonjs",
  "--target",
  "es2017",
  "--skipLibCheck",
]);
const {
  gravitationalForce: force,
  initialParameters: base,
  challenges,
  solveGravity,
} = createRequire(import.meta.url)(join(directory, "gravitation.js"));
const near = (actual, expected) =>
  assert.ok(Math.abs(actual - expected) <= Math.abs(expected) * 1e-12);

test("SI force for two 1 kg masses at 1 metre", () =>
  near(force({ mass1: 1, mass2: 1, distance: 1 }), 6.6743e-11));
test("force is symmetric in the two masses", () =>
  near(
    force({ mass1: 300, mass2: 700, distance: 9 }),
    force({ mass1: 700, mass2: 300, distance: 9 }),
  ));
test("doubling a mass doubles force; doubling both quadruples it", () => {
  near(force({ ...base, mass1: base.mass1 * 2 }), force(base) * 2);
  near(
    force({ ...base, mass1: base.mass1 * 2, mass2: base.mass2 * 2 }),
    force(base) * 4,
  );
});
test("doubling distance quarters force", () =>
  near(force({ ...base, distance: base.distance * 2 }), force(base) / 4));
test("challenge answers agree with their physical experiments", () => {
  const factors = { double: 2, four: 4, quarter: 0.25 };
  for (const challenge of challenges)
    near(force(challenge.parameters) / force(base), factors[challenge.answer]);
});
test("invalid physical inputs are rejected", () => {
  for (const key of ["mass1", "mass2", "distance"])
    for (const value of [0, -1, NaN, Infinity])
      assert.throws(() => force({ ...base, [key]: value }), RangeError);
});

test("every unknown can be recovered from the other three SI values", () => {
  const expected = { mass1: 68e12, mass2: 54e12, distance: 10400 };
  const all = { ...expected, force: force(expected) };
  for (const unknown of ["force", "mass1", "mass2", "distance"]) {
    const known = { ...all };
    delete known[unknown];
    const result = solveGravity(unknown, known);
    near(result[unknown], all[unknown]);
    near(force(result), result.force);
  }
});
test("inverse solver rejects missing, non-positive and non-finite known values", () => {
  assert.throws(
    () => solveGravity("distance", { force: 0, mass1: 1, mass2: 1 }),
    RangeError,
  );
  assert.throws(
    () => solveGravity("mass1", { force: 1, distance: 1 }),
    RangeError,
  );
  assert.throws(
    () => solveGravity("mass2", { force: Infinity, distance: 1, mass1: 1 }),
    RangeError,
  );
  assert.throws(
    () =>
      solveGravity("distance", { force: 1e-300, mass1: 1e300, mass2: 1e300 }),
    RangeError,
  );
});
