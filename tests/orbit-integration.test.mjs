import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const directory = mkdtempSync(join(tmpdir(), 'orbit-integration-'));
after(() => rmSync(directory, { recursive: true, force: true }));
execFileSync(process.execPath, [
  'node_modules/typescript/bin/tsc',
  'src/features/three-body/domain/orbit-integration.ts', 'src/data/orbits.ts',
  '--outDir', directory, '--rootDir', 'src', '--module', 'commonjs',
  '--target', 'es2019', '--resolveJsonModule', '--esModuleInterop', '--skipLibCheck',
]);
const require = createRequire(import.meta.url);
const { integrateOrbit } = require(join(directory, 'features/three-body/domain/orbit-integration.js'));
const { orbits } = require(join(directory, 'data/orbits.js'));
const integrated = new Map(orbits.map((orbit) => [orbit.slug, integrateOrbit(orbit)]));
const near = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);

test('all six physical trajectories include the unmodified seed and true final state', () => {
  assert.equal(orbits.length, 6);
  for (const orbit of orbits) {
    const data = integrated.get(orbit.slug);
    assert.equal(data.slug, orbit.slug);
    assert.equal(data.period, orbit.period);
    assert.equal(data.samples.length, 1200);
    assert.deepEqual(data.samples[0], orbit.initial.flatMap(([x, y]) => [x, y]));
    for (const sample of data.samples) {
      assert.equal(sample.length, 6);
      assert.ok(sample.every(Number.isFinite));
    }
    assert.ok(data.diagnostics.closure < 1e-6, `${orbit.slug} state closure`);
    assert.ok(data.diagnostics.positionClosure < 1e-6, `${orbit.slug} position closure`);
    const measuredPositionClosure = Math.sqrt(data.samples.at(-1).reduce((sum, value, index) => sum + (value - data.samples[0][index]) ** 2, 0) / 6);
    near(data.diagnostics.positionClosure, measuredPositionClosure, 1e-16);
  }
  // The rounded figure-eight seed has a small genuine closure error: it is not
  // overwritten with its first frame merely to create a perfect visual loop.
  assert.ok(integrated.get('figura-de-ocho').diagnostics.positionClosure > 1e-10);
});

test('Newtonian energy, angular momentum, total momentum and barycentre are conserved', () => {
  for (const [slug, { diagnostics, samples }] of integrated) {
    assert.ok(diagnostics.maxEnergyDrift < 1e-8, `${slug} energy`);
    assert.ok(diagnostics.maxAngularDrift < 1e-9, `${slug} angular momentum`);
    assert.ok(diagnostics.maxMomentum < 1e-10, `${slug} linear momentum`);
    assert.ok(diagnostics.maxCenterOfMass < 1e-10, `${slug} barycentre`);
    assert.ok(diagnostics.minSeparation > 0, `${slug} collision-free`);
    assert.ok(diagnostics.acceptedSteps >= samples.length - 1);
    assert.ok(Number.isInteger(diagnostics.rejectedSteps) && diagnostics.rejectedSteps >= 0);
    for (const sample of samples) {
      near((sample[0] + sample[2] + sample[4]) / 3, 0, 1e-10);
      near((sample[1] + sample[3] + sample[5]) / 3, 0, 1e-10);
    }
  }
});

test('Lagrange samples match the analytic rotating triangle at uniform physical times', () => {
  const orbit = orbits.find(({ slug }) => slug === 'lagrange');
  const data = integrateOrbit(orbit, 257);
  const omega = 2 * Math.PI / orbit.period;
  data.samples.forEach((sample, frame) => {
    const time = frame * orbit.period / (data.samples.length - 1);
    for (let body = 0; body < 3; body++) {
      const angle = body * 2 * Math.PI / 3 + omega * time;
      near(sample[body * 2], Math.cos(angle), 1e-9);
      near(sample[body * 2 + 1], Math.sin(angle), 1e-9);
    }
    for (const [first, second] of [[0, 1], [0, 2], [1, 2]]) {
      near(Math.hypot(sample[first * 2] - sample[second * 2], sample[first * 2 + 1] - sample[second * 2 + 1]), Math.sqrt(3), 1e-9);
    }
  });
});

test('changing sample density keeps the same physical time and nonuniform orbital speed', () => {
  const orbit = orbits.find(({ slug }) => slug === 'figura-de-ocho');
  const coarse = integrateOrbit(orbit, 121);
  const dense = integrateOrbit(orbit, 481);
  coarse.samples.forEach((sample, frame) => sample.forEach((value, component) => near(value, dense.samples[frame * 4][component], 1e-8)));
  const displacements = coarse.samples.slice(1).map((sample, index) => Math.hypot(sample[0] - coarse.samples[index][0], sample[1] - coarse.samples[index][1]));
  assert.ok(Math.max(...displacements) / Math.min(...displacements) > 1.5, 'equal time intervals must not become equal curve-length intervals');
});

test('Newtonian scaling works without changing the orbit catalogue or hardcoding trajectories', () => {
  const orbit = orbits.find(({ slug }) => slug === 'lagrange');
  const scale = 3;
  const transformed = {
    ...orbit,
    period: orbit.period * scale ** 1.5,
    initial: orbit.initial.map(([x, y, vx, vy]) => [x * scale, y * scale, vx / Math.sqrt(scale), vy / Math.sqrt(scale)]),
  };
  const original = integrateOrbit(orbit, 81);
  const scaled = integrateOrbit(transformed, 81);
  original.samples.forEach((sample, frame) => sample.forEach((value, component) => near(scaled.samples[frame][component], value * scale, 1e-8)));
});

test('bounds contain every body and a partial period does not fabricate closure', () => {
  for (const data of integrated.values()) {
    const { cx, cy, radius } = data.bounds;
    assert.ok(Number.isFinite(radius) && radius > 0);
    for (const sample of data.samples) {
      for (let body = 0; body < 3; body++) {
        assert.ok(Math.hypot(sample[body * 2] - cx, sample[body * 2 + 1] - cy) <= radius + 1e-12);
      }
    }
  }
  const lagrange = orbits.find(({ slug }) => slug === 'lagrange');
  const partial = integrateOrbit({ ...lagrange, period: lagrange.period / 4 }, 2);
  assert.equal(partial.samples.length, 2);
  near(partial.samples[1][0], 0, 1e-9);
  near(partial.samples[1][1], 1, 1e-9);
  assert.ok(partial.diagnostics.positionClosure > 0.5);
});

test('input states are immutable and repeated integration is deterministic', () => {
  const orbit = orbits.find(({ slug }) => slug === 'lagrange');
  const seed = structuredClone(orbit);
  seed.initial.forEach(Object.freeze);
  Object.freeze(seed.initial);
  Object.freeze(seed);
  assert.deepEqual(integrateOrbit(seed, 11), integrateOrbit(seed, 11));
  assert.deepEqual(seed, orbit);
});

test('invalid periods, sampling counts, states and collisions are rejected', () => {
  const base = orbits[0];
  for (const period of [0, -1, NaN, Infinity]) {
    assert.throws(() => integrateOrbit({ ...base, period }), RangeError);
  }
  for (const count of [0, 1, -10, 1.5, NaN, Infinity, 20001]) {
    assert.throws(() => integrateOrbit(base, count), RangeError);
  }
  for (const initial of [[], [[0, 0, 0, 0]], [[0, 0, 0, 0], [0, 0, 1, 1], [1, 1, 0, 0]], [[NaN, 0, 0, 0], [1, 0, 0, 0], [2, 0, 0, 0]]]) {
    assert.throws(() => integrateOrbit({ ...base, initial }), RangeError);
  }
});
