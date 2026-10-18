import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const directory = mkdtempSync(join(tmpdir(), 'gravity-visualization-'));
after(() => rmSync(directory, { recursive: true, force: true }));
execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', 'src/features/gravity/presentation/gravityVisualization.ts', 'src/features/gravity/domain/gravitation.ts', '--outDir', directory, "--rootDir", "src", '--module', 'commonjs', '--target', 'es2017', '--skipLibCheck']);
const require = createRequire(import.meta.url);
const { getGravityDiagram: diagram, getRelativeForceBars: bars } = require(join(directory, 'features/gravity/presentation/gravityVisualization.js'));
const { gravitationalForce: force, initialParameters: base, challenges } = require(join(directory, 'features/gravity/domain/gravitation.js'));
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < Math.abs(expected) * 1e-12, `${actual} != ${expected}`);
const compare = (parameters) => bars(force(parameters), force(base));

test('arrows keep identical constant lengths and opposite inward directions across all distances', () => {
  const length = diagram(base).leftArrow.end - diagram(base).leftArrow.start;
  for (let metreTenths = 50; metreTenths <= 200; metreTenths++) {
    for (const mass1 of [10, 40, 100]) for (const mass2 of [10, 40, 100]) {
      const d = diagram({ mass1, mass2, distance: metreTenths / 10 });
      near(d.leftArrow.end - d.leftArrow.start, length);
      near(d.rightArrow.start - d.rightArrow.end, length);
      assert.ok(d.leftArrow.start < d.leftArrow.end);
      assert.ok(d.rightArrow.start > d.rightArrow.end);
    }
  }
});
test('arrow shafts and tips remain outside body halos and never cross at mass and distance extremes', () => {
  for (let mass1 = 10; mass1 <= 100; mass1++) for (let mass2 = 10; mass2 <= 100; mass2++) {
    for (const distance of [5, 8, 20]) {
      const d = diagram({ mass1, mass2, distance });
      assert.ok(d.leftArrow.start > d.x1 + d.radius1 + 9);
      assert.ok(d.rightArrow.start < d.x2 - d.radius2 - 9);
      assert.ok(d.leftArrow.end < d.rightArrow.end);
      assert.ok(d.leftArrow.end < d.x2 - d.radius2);
      assert.ok(d.rightArrow.end > d.x1 + d.radius1);
      assert.ok(d.x1 - d.radius1 - 9 > 0 && d.x2 + d.radius2 + 9 < 520);
    }
  }
});
test('initial bars are equal and the shared linear scale reproduces real Newtonian force ratios', () => {
  assert.deepEqual(compare(base), { currentFraction: 1, initialFraction: 1, ratio: 1 });
  for (const mass1 of [10, 40, 80, 100]) for (const mass2 of [10, 40, 80, 100]) for (const distance of [5, 8, 16, 20]) {
    const parameters = { mass1, mass2, distance };
    const b = compare(parameters);
    near(b.ratio, force(parameters) / force(base));
    near(b.currentFraction / b.initialFraction, b.ratio);
    assert.ok(b.currentFraction > 0 && b.currentFraction <= 1);
    assert.ok(b.initialFraction > 0 && b.initialFraction <= 1);
    assert.equal(Math.max(b.currentFraction, b.initialFraction), 1);
  }
});
test('doubling one mass yields twice the initial force and doubling distance yields one quarter', () => {
  near(compare({ ...base, mass1: base.mass1 * 2 }).ratio, 2);
  near(compare({ ...base, distance: base.distance * 2 }).ratio, 0.25);
  near(compare({ mass1: base.mass1 * 2, mass2: base.mass2 * 2, distance: base.distance * 2 }).ratio, 1);
});
test('indicator increases with either mass and decreases with distance throughout the slider range', () => {
  for (const key of ['mass1', 'mass2']) {
    let previous = 0;
    for (let mass = 10; mass <= 100; mass++) {
      const current = compare({ ...base, [key]: mass });
      assert.ok(current.ratio > previous);
      near(current.currentFraction / current.initialFraction, current.ratio);
      previous = current.ratio;
    }
  }
  let previous = Infinity;
  for (let distance = 5; distance <= 20; distance += 0.1) {
    const current = compare({ ...base, distance });
    assert.ok(current.ratio < previous);
    previous = current.ratio;
  }
});
test('slider minimum and maximum forces remain distinguishable without saturation or log scaling', () => {
  const minimum = compare({ mass1: 10, mass2: 10, distance: 20 });
  const maximum = compare({ mass1: 100, mass2: 100, distance: 5 });
  near(minimum.ratio, 0.01);
  near(maximum.ratio, 16);
  near(minimum.currentFraction, 0.01);
  near(maximum.initialFraction, 1 / 16);
});
test('swapping masses preserves intensity and exchanges body sizes', () => {
  const a = { mass1: 30, mass2: 70, distance: 11 };
  const b = { ...a, mass1: a.mass2, mass2: a.mass1 };
  near(compare(a).ratio, compare(b).ratio);
  near(diagram(a).radius1, diagram(b).radius2);
});
test('invalid force measurements cannot generate a visual intensity', () => {
  for (const invalid of [0, -1, NaN, Infinity]) {
    assert.throws(() => bars(invalid, 1), RangeError);
    assert.throws(() => bars(1, invalid), RangeError);
  }
});
test('all challenge bars share one scale and retain their true 200%, 400% and 25% proportions', () => {
  const initialForce = force(base);
  const scaleForce = Math.max(initialForce, ...challenges.map((challenge) => force(challenge.parameters)));
  const expected = {
    oneMass: { percentage: 200, fraction: 0.5 },
    bothMasses: { percentage: 400, fraction: 1 },
    distance: { percentage: 25, fraction: 0.0625 },
  };
  const widths = new Set();
  for (const challenge of challenges) {
    const current = bars(force(challenge.parameters), initialForce, scaleForce);
    near(current.ratio * 100, expected[challenge.id].percentage);
    near(current.initialFraction, 0.25);
    near(current.currentFraction, expected[challenge.id].fraction);
    near(current.currentFraction / current.initialFraction, current.ratio);
    widths.add(current.currentFraction);
  }
  assert.equal(widths.size, challenges.length, 'Different final forces must have different widths across challenges');
});
test('explicit scales cannot clip larger forces or turn different forces into equivalent bars', () => {
  for (const scale of [0, -1, NaN, Infinity, 1, 3]) assert.throws(() => bars(4, 1, scale), RangeError);
  assert.deepEqual(bars(4, 1, 8), { currentFraction: 0.5, initialFraction: 0.125, ratio: 4 });
});
test('before/after labels and shared-scale explanation are translated in all locales', () => {
  for (const locale of ['es', 'en', 'fr']) {
    const messages = JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), 'utf8')).Gravity;
    for (const key of ['challengeBefore', 'challengeAfter', 'challengeComparisonTitle', 'challengeComparisonScale']) assert.ok(messages[key]?.trim(), `${locale}.${key}`);
    assert.ok(messages.challengeComparisonScale.includes('{percentage}'));
    for (const challenge of challenges) assert.ok(messages[`feedback_${challenge.id}`]?.trim());
  }
});
test('comparison and direction descriptions are translated in ES/EN/FR', () => {
  for (const locale of ['es', 'en', 'fr']) {
    const messages = JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), 'utf8')).Gravity;
    for (const key of ['forceComparisonTitle','forceComparisonDescription','forceComparisonInitial','forceComparisonCurrent','forceComparisonScale','directionOnlyNote','visualDescription']) assert.ok(messages[key]?.trim(), `${locale}.${key}`);
    assert.ok(messages.forceComparisonDescription.includes('{ratio}'));
  }
});


test('SI masses and centre distances change only illustrative radii and separation', () => {
  const initial = diagram(base);
  near(initial.separation, 196);
  assert.ok(diagram({ ...base, mass1: 40.5 }).radius1 > initial.radius1);
  assert.ok(diagram({ ...base, mass2: 40.5 }).radius2 > initial.radius2);
  assert.ok(diagram({ ...base, distance: 8.25 }).separation > initial.separation);
  assert.equal(diagram({ ...base, mass1: 80 }).separation, initial.separation);
  assert.equal(diagram({ ...base, distance: 16 }).radius1, initial.radius1);
});
