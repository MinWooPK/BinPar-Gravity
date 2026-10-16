import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const directory = mkdtempSync(join(tmpdir(), 'gravity-comparison-'));
after(() => rmSync(directory, { recursive: true, force: true }));
execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', 'src/features/gravity/domain/compareGravitation.ts', '--outDir', directory, '--module', 'commonjs', '--target', 'es2017', '--skipLibCheck']);
const require = createRequire(import.meta.url);
const { compareGravitation: compare } = require(join(directory, 'compareGravitation.js'));
const { initialParameters: base, gravitationalForce: force } = require(join(directory, 'gravitation.js'));
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) <= Math.abs(expected) * 1e-10, `${actual} != ${expected}`);

test('initial and reset values have no attributed change', () => {
  const actual = compare({ ...base });
  assert.equal(actual.explanation, 'initial');
  near(actual.forceRatio, 1);
  near(actual.currentForce, force(base));
  near(actual.referenceForce, force(base));
});
test('doubling either mass alone doubles force', () => {
  for (const key of ['mass1', 'mass2']) {
    const actual = compare({ ...base, [key]: base[key] * 2 });
    assert.equal(actual.explanation, 'massDoubled');
    near(actual.forceRatio, 2);
  }
});
test('doubling distance alone quarters force', () => {
  const actual = compare({ ...base, distance: base.distance * 2 });
  assert.equal(actual.explanation, 'distanceDoubled');
  near(actual.forceRatio, 0.25);
});
test('arbitrary single mass changes use the actual proportional force', () => {
  for (const factor of [0.25, 0.5, 1.025, 1.5, 2.5]) {
    const actual = compare({ ...base, mass2: base.mass2 * factor });
    assert.equal(actual.explanation, 'massChanged');
    near(actual.forceRatio, factor);
  }
});
test('arbitrary distance changes follow the inverse square', () => {
  for (const factor of [0.625, 0.8, 1.0125, 1.5, 3]) {
    const actual = compare({ ...base, distance: base.distance * factor });
    assert.equal(actual.explanation, 'distanceChanged');
    near(actual.forceRatio, 1 / factor ** 2);
  }
});
test('multiple changes never receive a single-variable explanation', () => {
  for (const [mass1, mass2, distance] of [[2,2,1], [2,1,2], [1,2,2], [0.5,1.5,1.25]]) {
    const current = { mass1: base.mass1 * mass1, mass2: base.mass2 * mass2, distance: base.distance * distance };
    const actual = compare(current);
    assert.equal(actual.explanation, 'combined');
    near(actual.forceRatio, mass1 * mass2 / distance ** 2);
    near(actual.currentForce / actual.referenceForce, actual.forceRatio);
  }
});
test('compensating changes explain unchanged force, not unchanged parameters', () => {
  const actual = compare({ mass1: base.mass1 * 2, mass2: base.mass2 * 2, distance: base.distance * 2 });
  assert.equal(actual.explanation, 'combinedUnchanged');
  near(actual.forceRatio, 1);
});
test('comparison always uses the supplied baseline and does not mutate inputs', () => {
  const reference = Object.freeze({ mass1: 12, mass2: 3, distance: 0.1 });
  const current = Object.freeze({ ...reference, distance: 0.2 });
  assert.equal(compare(current, reference).explanation, 'distanceDoubled');
  near(compare(current, reference).forceRatio, 0.25);
  assert.deepEqual(reference, { mass1: 12, mass2: 3, distance: 0.1 });
});
test('floating point noise is tolerated, but small real slider changes are preserved', () => {
  assert.equal(compare({ ...base, mass1: base.mass1 * (1 + Number.EPSILON) }).explanation, 'initial');
  assert.equal(compare({ ...base, mass1: base.mass1 + 1e12 }).explanation, 'massChanged');
  assert.equal(compare({ ...base, distance: base.distance + 100 }).explanation, 'distanceChanged');
  assert.equal(compare({ ...base, mass1: base.mass1 * (2 + Number.EPSILON) }).explanation, 'massDoubled');
});
test('invalid and numerically unrepresentable comparisons are rejected', () => {
  for (const key of ['mass1','mass2','distance']) for (const value of [0,-1,NaN,Infinity]) {
    assert.throws(() => compare({ ...base, [key]: value }), RangeError);
    assert.throws(() => compare(base, { ...base, [key]: value }), RangeError);
  }
  assert.throws(() => compare({ mass1: 1e300, mass2: 1e300, distance: 1 }), RangeError);
});
test('every explanation is translated in all three locales with valid percentage placeholders', () => {
  const cases = [base, { ...base, mass1: base.mass1 * 2 }, { ...base, distance: base.distance * 2 }, { ...base, mass2: base.mass2 * 1.5 }, { ...base, distance: base.distance * 1.5 }, { ...base, mass1: base.mass1 * 2, mass2: base.mass2 * 2 }, { ...base, mass1: base.mass1 * 2, mass2: base.mass2 * 2, distance: base.distance * 2 }];
  for (const locale of ['es','en','fr']) {
    const messages = JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), 'utf8')).Gravity.forceExplanation;
    for (const current of cases) {
      const key = compare(current).explanation;
      assert.ok(typeof messages[key] === 'string' && messages[key].length > 0, `${locale}.${key}`);
      assert.equal(messages[key].includes('{percentage}'), ['massChanged', 'distanceChanged', 'combined'].includes(key));
    }
  }
});
