import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const directory = mkdtempSync(join(tmpdir(), 'orbit-visualization-'));
after(() => rmSync(directory, { recursive: true, force: true }));
execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', 'src/features/three-body/components/orbit-visualization.ts', '--outDir', directory, '--rootDir', 'src', '--module', 'commonjs', '--target', 'es2017', '--skipLibCheck']);
const require = createRequire(import.meta.url);
const { prepareOrbitPlayback, getOrbitFrame, getOrbitTrails } = require(join(directory, 'features/three-body/components/orbit-visualization.js'));

const diagnostics = { closure: 0, positionClosure: 0, maxEnergyDrift: 0, maxMomentum: 0, maxAngularDrift: 0, maxCenterOfMass: 0, minSeparation: 1, acceptedSteps: 1, rejectedSteps: 0 };
const orbit = () => ({
  slug: 'test-orbit', period: 8,
  samples: [[6, -5, 10, -1, 14, -5], [8, -7, 12, -3, 10, -5], [6, -5, 10, -1, 14, -5]],
  bounds: { cx: 10, cy: -5, radius: 4 }, diagnostics: { ...diagnostics },
});
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);
const frameNear = (actual, expected) => { assert.equal(actual.length, 6); expected.forEach((value, i) => near(actual[i], value)); };

test('projection centers all bodies in a 320×200 viewBox, inverts y and preserves a single aspect scale', () => {
  const playback = prepareOrbitPlayback(orbit());
  assert.deepEqual(playback.samples[0], [80, 100, 160, 20, 240, 100]);
  assert.deepEqual(playback.samples[1], [120, 140, 200, 60, 160, 100]);
  // A physical displacement of two units becomes 40 SVG units on either axis.
  assert.equal(playback.samples[1][0] - playback.samples[0][0], 40);
  assert.equal(playback.samples[1][1] - playback.samples[0][1], 40);
  assert.equal(playback.slug, 'test-orbit');
  assert.equal(playback.period, 8);
  for (const sample of playback.samples) for (let body = 0; body < 3; body++) {
    assert.ok(sample[body * 2] >= 80 && sample[body * 2] <= 240);
    assert.ok(sample[body * 2 + 1] >= 20 && sample[body * 2 + 1] <= 180);
  }
});

test('projection rounds only the display copy and does not mutate frozen physical samples or diagnostics', () => {
  const source = orbit();
  source.samples[1][0] = 8.123456789;
  const snapshot = JSON.stringify(source);
  source.samples.forEach(Object.freeze);
  Object.freeze(source.samples); Object.freeze(source.bounds); Object.freeze(source.diagnostics); Object.freeze(source);
  const playback = prepareOrbitPlayback(source);
  assert.equal(playback.samples[1][0], 122.469);
  assert.equal(JSON.stringify(source), snapshot);
  assert.notEqual(playback.samples, source.samples);
  assert.notEqual(playback.samples[0], source.samples[0]);
  const drawingSnapshot = JSON.stringify(playback);
  getOrbitFrame(playback, 1.75); getOrbitTrails(playback);
  assert.equal(JSON.stringify(playback), drawingSnapshot);
});

test('uniform playback uses N−1 intervals because samples include both zero and the period endpoint', () => {
  const playback = { slug: 'unequal-positions', period: 6, samples: [[0, 0, 0, 0, 0, 0], [10, 20, 30, 40, 50, 60], [30, 40, 50, 60, 70, 80], [60, 80, 100, 120, 140, 160]] };
  frameNear(getOrbitFrame(playback, 0), playback.samples[0]);
  frameNear(getOrbitFrame(playback, 1), [5, 10, 15, 20, 25, 30]);
  frameNear(getOrbitFrame(playback, 2), playback.samples[1]);
  frameNear(getOrbitFrame(playback, 3), [20, 30, 40, 50, 60, 70]);
  frameNear(getOrbitFrame(playback, 4), playback.samples[2]);
  frameNear(getOrbitFrame(playback, 5), [45, 60, 75, 90, 105, 120]);
  frameNear(getOrbitFrame(playback, 6), playback.samples[0]);
});

test('playback wraps positive and negative physical times without changing the orbital period', () => {
  const playback = prepareOrbitPlayback(orbit());
  const initial = getOrbitFrame(playback, 0);
  for (const time of [8, 16, 8000, -8, -16, -8000]) frameNear(getOrbitFrame(playback, time), initial);
  for (const time of [0.5, 2, 3.25, 7.5]) {
    frameNear(getOrbitFrame(playback, time + 8), getOrbitFrame(playback, time));
    frameNear(getOrbitFrame(playback, time - 8), getOrbitFrame(playback, time));
    frameNear(getOrbitFrame(playback, -time), getOrbitFrame(playback, 8 - time));
  }
  const twoSamples = { slug: 'minimal', period: 4, samples: [[0, 0, 0, 0, 0, 0], [2, 4, 6, 8, 10, 12]] };
  frameNear(getOrbitFrame(twoSamples, 2), [1, 2, 3, 4, 5, 6]);
  frameNear(getOrbitFrame(twoSamples, -2), getOrbitFrame(twoSamples, 2));
});

test('three trail strings keep body identity and exactly match prepared samples and sampled frame positions', () => {
  const playback = prepareOrbitPlayback(orbit());
  const trails = getOrbitTrails(playback);
  assert.equal(trails.length, 3);
  assert.equal(trails[0], '80,100 120,140 80,100');
  for (let body = 0; body < 3; body++) {
    const points = trails[body].split(' ').map((point) => point.split(',').map(Number));
    assert.equal(points.length, playback.samples.length);
    points.forEach((point, index) => {
      assert.deepEqual(point, playback.samples[index].slice(body * 2, body * 2 + 2));
      if (index < playback.samples.length - 1) {
        const frame = getOrbitFrame(playback, index * playback.period / (playback.samples.length - 1));
        frameNear(frame, playback.samples[index]);
      }
    });
  }
});

test('invalid metadata, malformed samples and unrepresentable projection bounds are rejected', () => {
  for (const invalid of [0, -1, NaN, Infinity]) {
    assert.throws(() => prepareOrbitPlayback({ ...orbit(), period: invalid }), RangeError);
    assert.throws(() => prepareOrbitPlayback({ ...orbit(), bounds: { ...orbit().bounds, radius: invalid } }), RangeError);
  }
  for (const bounds of [{ cx: NaN, cy: 0, radius: 1 }, { cx: 0, cy: Infinity, radius: 1 }]) assert.throws(() => prepareOrbitPlayback({ ...orbit(), bounds }), RangeError);
  for (const samples of [[], Array(2), [[0, 0, 0, 0, 0, 0]], [[0, 0], [0, 0]], [[NaN, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]], [Array(6), [0, 0, 0, 0, 0, 0]]]) assert.throws(() => prepareOrbitPlayback({ ...orbit(), samples }), RangeError);
  assert.throws(() => prepareOrbitPlayback({ ...orbit(), slug: '  ' }), RangeError);
  assert.throws(() => prepareOrbitPlayback({ ...orbit(), bounds: { cx: -1e308, cy: 0, radius: Number.MIN_VALUE } }), RangeError);
});

test('frames reject invalid times and interval coordinates without scanning unrelated samples', () => {
  const playback = prepareOrbitPlayback(orbit());
  for (const invalid of [NaN, Infinity, -Infinity]) assert.throws(() => getOrbitFrame(playback, invalid), RangeError);
  const unrelated = [0, 0, 0, 0, 0, 0];
  Object.defineProperty(unrelated, 0, { get() { throw new Error('A frame must not inspect another interval'); } });
  const sparsePlayback = { ...playback, samples: [playback.samples[0], playback.samples[1], unrelated] };
  frameNear(getOrbitFrame(sparsePlayback, 2), [100, 120, 180, 40, 200, 100]);
  const malformed = { ...playback, samples: [[0, 0, 0, 0, 0, 0], [0, 0, 0, Infinity, 0, 0]] };
  assert.throws(() => getOrbitFrame(malformed, 1), RangeError);
  assert.throws(() => getOrbitTrails(malformed), RangeError);
});
