import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';

const directory = mkdtempSync(join(tmpdir(), 'three-body-experiment-'));
after(() => rmSync(directory, { recursive: true, force: true }));
execFileSync(process.execPath, [
  'node_modules/typescript/bin/tsc',
  'src/features/three-body/domain/newtonian-physics.ts',
  'src/features/three-body/domain/experiment-simulation.ts',
  'src/features/three-body/domain/periodicity-detection.ts',
  'src/features/three-body/presentation/components/experiment/experiment.worker.ts',
  '--outDir', directory, '--rootDir', 'src', '--module', 'commonjs',
  '--target', 'es2020', '--skipLibCheck', '--strict',
]);
const require = createRequire(import.meta.url);
const { simulateExperiment } = require(join(directory, 'features/three-body/domain/experiment-simulation.js'));
const { detectPeriodicity, measureReturnErrors, PERIODICITY_TOLERANCE } = require(join(directory, 'features/three-body/domain/periodicity-detection.js'));

const omega = Math.pow(3, -0.25);
const lagrangePeriod = (2 * Math.PI) / omega;
const lagrangeBodies = [0, 1, 2].map((i) => {
  const angle = i * (2 * Math.PI / 3);
  return { mass: 1, x: Math.cos(angle), y: Math.sin(angle), vx: -omega * Math.sin(angle), vy: omega * Math.cos(angle) };
});
const analyze = (config, count = 101) => {
  const trajectory = simulateExperiment(config, count);
  return detectPeriodicity(trajectory, { G: config.gravity, masses: config.bodies.map(({ mass }) => mass) });
};

const sampleBodies = [
  { mass: 1, x: -1, y: 0, vx: 0, vy: 0.3 },
  { mass: 2, x: 1, y: 0, vx: 0, vy: -0.3 },
  { mass: 3, x: 0, y: 1, vx: 0.4, vy: 0 },
];

test('three unequal masses produce finite samples and preserve the seed', () => {
  const result = simulateExperiment({ gravity: 2, duration: 0.4, bodies: sampleBodies }, 101);
  assert.equal(result.samples.length, 101);
  assert.equal(result.duration, 0.4);
  assert.deepEqual(result.samples[0], [-1, 0, 1, 0, 0, 1]);
  assert.ok(result.samples.every((frame) => frame.length === 6 && frame.every(Number.isFinite)));
  assert.ok(result.bounds.radius > 0);
  assert.deepEqual(result.stateSamples[0], { time: 0, state: sampleBodies.flatMap(({ x, y, vx, vy }) => [x, y, vx, vy]) });
  assert.equal(result.stateSamples.at(-1).time, result.duration);
  assert.ok(result.stateSamples.every(({ time, state }, i, states) =>
    Number.isFinite(time) && (i === 0 || time > states[i - 1].time) &&
    state.length === 12 && state.every(Number.isFinite)));
  const statesByTime = new Map(result.stateSamples.map(({ time, state }) => [time, state]));
  result.samples.forEach((positions, index) => {
    const state = statesByTime.get(index === 100 ? result.duration : index * (result.duration / 100));
    assert.deepEqual(positions, [state[0], state[1], state[4], state[5], state[8], state[9]]);
  });
});

test('changing a mass changes the simulated motion', () => {
  const first = simulateExperiment({ gravity: 1, duration: 0.3, bodies: sampleBodies }, 41);
  const second = simulateExperiment({ gravity: 1, duration: 0.3, bodies: sampleBodies.map((b, i) => ({ ...b, mass: i === 2 ? 9 : b.mass })) }, 41);
  assert.notDeepEqual(first.samples.at(-1), second.samples.at(-1));
});

test('Lagrange triangular orbit nearly closes without artificial endpoint correction', () => {
  const omega = Math.pow(3, -0.25);
  const period = (2 * Math.PI) / omega;
  const bodies = [0, 1, 2].map((i) => {
    const angle = i * (2 * Math.PI / 3);
    return { mass: 1, x: Math.cos(angle), y: Math.sin(angle), vx: -omega * Math.sin(angle), vy: omega * Math.cos(angle) };
  });
  const trajectory = simulateExperiment({ gravity: 1, duration: period, bodies }, 201);
  const first = trajectory.samples[0];
  const last = trajectory.samples.at(-1);
  assert.ok(last.every((value, i) => Math.abs(value - first[i]) < 1e-6));
});

test('invalid parameters and overlapping bodies are rejected', () => {
  assert.throws(() => simulateExperiment({ gravity: 0, duration: 1, bodies: sampleBodies }), RangeError);
  assert.throws(() => simulateExperiment({ gravity: 1, duration: -1, bodies: sampleBodies }), RangeError);
  assert.throws(() => simulateExperiment({ gravity: 1, duration: 1, bodies: [sampleBodies[0], sampleBodies[0], sampleBodies[2]] }), RangeError);
});

test('Lagrange return is refined between visual AND accepted RK4 samples, before the endpoint', () => {
  const config = { gravity: 1, duration: 1.35 * lagrangePeriod, bodies: lagrangeBodies };
  const trajectory = simulateExperiment(config, 8);
  assert.ok(trajectory.samples.at(-1).some((value, i) => Math.abs(value - trajectory.samples[0][i]) > 0.5));
  assert.ok(trajectory.stateSamples.every(({ time }) => Math.abs(time - lagrangePeriod) > 1e-5));
  const unrefinedErrors = trajectory.stateSamples.filter(({ time }) => time > lagrangePeriod / 2)
    .map(({ state }) => measureReturnErrors(trajectory.stateSamples[0].state, state, { G: 1, masses: [1, 1, 1] }).combinedError);
  assert.ok(Math.min(...unrefinedErrors) > PERIODICITY_TOLERANCE, 'accepted steps alone are insufficient at this tolerance');
  const result = detectPeriodicity(trajectory, { G: 1, masses: [1, 1, 1] });
  assert.equal(result.detected, true);
  assert.equal(result.reason, 'approximateReturn');
  assert.ok(Math.abs(result.estimatedPeriod - lagrangePeriod) < 1e-5, JSON.stringify(result));
  assert.ok(result.positionError < 1e-6);
  assert.ok(result.velocityError < 1e-6);
  assert.equal(result.combinedError, Math.max(result.positionError, result.velocityError));
  assert.equal(result.tolerance, PERIODICITY_TOLERANCE);
});

test('two animation samples cannot hide the excursion or fabricate stationarity', () => {
  const result = analyze({ gravity: 1, duration: lagrangePeriod, bodies: lagrangeBodies }, 2);
  assert.equal(result.detected, true);
  assert.ok(Math.abs(result.estimatedPeriod - lagrangePeriod) < 1e-5);
});

test('a partial Lagrange cycle is not a periodic return', () => {
  const result = analyze({ gravity: 1, duration: 0.4 * lagrangePeriod, bodies: lagrangeBodies });
  assert.equal(result.detected, false);
  assert.equal(result.estimatedPeriod, null);
  assert.equal(result.reason, 'noReturn');
});

test('bulk translation is not removed from the return comparison', () => {
  const drift = analyze({ gravity: 1, duration: 1.35 * lagrangePeriod, bodies: lagrangeBodies.map((b) => ({ ...b, vx: b.vx + 0.05 })) });
  assert.equal(drift.detected, false);
  const straight = analyze({ gravity: 1e-12, duration: 12, bodies: lagrangeBodies.map((b) => ({ ...b, vx: 1, vy: 0 })) });
  assert.equal(straight.detected, false);
  assert.equal(straight.estimatedPeriod, null);
});

test('zero initial velocities and almost stationary motion never count as a trivial return', () => {
  for (const config of [
    { gravity: 1e-16, duration: 1, bodies: lagrangeBodies.map((b) => ({ ...b, vx: 0, vy: 0 })) },
    { gravity: 1, duration: 1e-5, bodies: lagrangeBodies.map((b) => ({ ...b, vx: 0, vy: 0 })) },
    { gravity: 1, duration: 1e-5, bodies: lagrangeBodies },
  ]) {
    const result = analyze(config);
    assert.equal(result.detected, false);
    assert.equal(result.reason, 'insufficientMotion');
    assert.equal(result.estimatedPeriod, null);
    assert.ok([result.positionError, result.velocityError, result.combinedError].every(Number.isFinite));
  }
});

test('all three labelled positions AND velocities must return, including initially zero components', () => {
  const initial = lagrangeBodies.flatMap(({ x, y, vx, vy }) => [x, y, vx, vy]);
  const physics = { G: 1, masses: [1, 1, 1] };
  for (let body = 0; body < 3; body++) {
    for (let component = 0; component < 4; component++) {
      const state = initial.slice();
      state[4 * body + component] += 0.01;
      const errors = measureReturnErrors(initial, state, physics);
      assert.ok(errors.combinedError > PERIODICITY_TOLERANCE);
      assert.ok(errors[component < 2 ? 'positionError' : 'velocityError'] > PERIODICITY_TOLERANCE);
    }
  }
  const permuted = [...initial.slice(4, 8), ...initial.slice(8), ...initial.slice(0, 4)];
  assert.ok(measureReturnErrors(initial, permuted, physics).positionError > PERIODICITY_TOLERANCE);
  const stationary = initial.map((value, i) => i % 4 >= 2 ? 0 : value);
  const changed = stationary.slice();
  changed[2] = 0.01;
  const errors = measureReturnErrors(stationary, changed, physics);
  assert.equal(errors.positionError, 0);
  assert.ok(Number.isFinite(errors.velocityError) && errors.velocityError > PERIODICITY_TOLERANCE);
});

test('roundoff at a clipped sample boundary does not poison the next adaptive step', () => {
  const trajectory = simulateExperiment({ gravity: 1, duration: 1, bodies: lagrangeBodies }, 11);
  assert.equal(trajectory.samples.length, 11);
  assert.equal(trajectory.stateSamples.at(-1).time, 1);
});

test('unequal masses do not acquire invented periodicity', () => {
  const result = analyze({ gravity: 2, duration: 0.4, bodies: sampleBodies });
  assert.equal(result.detected, false);
  assert.equal(result.estimatedPeriod, null);
});

test('return comparison retains absolute position and Newtonian scale invariance', () => {
  const scale = 2;
  for (const bodies of [
    lagrangeBodies.map((b) => ({ ...b, x: b.x + 100, y: b.y - 50 })),
    lagrangeBodies.map((b) => ({ ...b, x: scale * b.x, y: scale * b.y, vx: b.vx / Math.sqrt(scale), vy: b.vy / Math.sqrt(scale) })),
  ]) {
    const scaled = bodies[0].x < 10;
    const expected = lagrangePeriod * (scaled ? scale ** 1.5 : 1);
    const result = analyze({ gravity: 1, duration: expected * 1.15, bodies }, 13);
    assert.equal(result.detected, true);
    assert.ok(Math.abs(result.estimatedPeriod - expected) < 1e-4);
  }
});

test('periodicity analysis is deterministic and does not modify trajectory or physics', () => {
  const trajectory = simulateExperiment({ gravity: 1, duration: lagrangePeriod * 1.2, bodies: lagrangeBodies }, 31);
  const before = structuredClone(trajectory);
  for (const sample of trajectory.stateSamples) {
    Object.freeze(sample.state);
    Object.freeze(sample);
  }
  Object.freeze(trajectory.stateSamples);
  Object.freeze(trajectory);
  const physics = Object.freeze({ G: 1, masses: Object.freeze([1, 1, 1]) });
  assert.deepEqual(detectPeriodicity(trajectory, physics), detectPeriodicity(trajectory, physics));
  assert.deepEqual(trajectory, before);
});

test('invalid samples, nonfinite values and close encounters keep safe errors', () => {
  const config = { gravity: 1, duration: 1, bodies: lagrangeBodies };
  for (const change of [
    { gravity: Infinity }, { duration: 101 },
    { bodies: lagrangeBodies.map((b, i) => ({ ...b, vx: i === 0 ? NaN : b.vx })) },
    { bodies: lagrangeBodies.map((b, i) => ({ ...b, mass: i === 0 ? -1 : b.mass })) },
    { bodies: lagrangeBodies.slice(1) },
  ]) assert.throws(() => analyze({ ...config, ...change }), RangeError);
  for (const count of [1, 2001, 1.5, NaN]) {
    assert.throws(() => simulateExperiment(config, count), RangeError);
  }
  // Initial separation is safe, but the two approaching bodies cross the safety cutoff.
  assert.throws(() => analyze({ gravity: 1e-10, duration: 0.011, bodies: [
    { mass: 1, x: -0.01, y: 0, vx: 1, vy: 0 },
    { mass: 1, x: 0.01, y: 0, vx: -1, vy: 0 },
    { mass: 1, x: 0, y: 10, vx: 0, vy: 0 },
  ] }), RangeError);
  const trajectory = simulateExperiment(config, 11);
  for (const corrupted of [
    { ...trajectory, stateSamples: [] },
    { ...trajectory, duration: Infinity },
    { ...trajectory, stateSamples: trajectory.stateSamples.map((s, i) => i === 1 ? { ...s, time: 0 } : s) },
    { ...trajectory, stateSamples: trajectory.stateSamples.map((s, i) => i === 1 ? { ...s, state: [NaN, ...s.state.slice(1)] } : s) },
    { ...trajectory, stateSamples: trajectory.stateSamples.map((s, i) => i === 1 ? { ...s, state: [...s.state.slice(0, 4), ...s.state.slice(0, 4), ...s.state.slice(8)] } : s) },
  ]) assert.throws(() => detectPeriodicity(corrupted, { G: 1, masses: [1, 1, 1] }), RangeError);
});

test('the existing Worker returns periodicity with playback data and keeps checkpoints off the UI thread', () => {
  const path = join(directory, 'features/three-body/presentation/components/experiment/experiment.worker.js');
  const responses = [];
  const self = { postMessage: (response) => responses.push(response) };
  // Imported modules and the worker harness share the browser Worker's Error realm.
  runInNewContext(readFileSync(path, 'utf8'), { self, Error, exports: {}, require: createRequire(path) });
  self.onmessage({ data: { id: 42, config: { gravity: 1, duration: 12, bodies: lagrangeBodies } } });
  assert.equal(responses[0].id, 42);
  assert.equal(responses[0].ok, true);
  assert.equal(responses[0].result.samples.length, 601);
  assert.equal(responses[0].result.periodicity.detected, true);
  assert.ok(Math.abs(responses[0].result.periodicity.estimatedPeriod - lagrangePeriod) < 1e-5);
  assert.equal('stateSamples' in responses[0].result, false);
  self.onmessage({ data: { id: 43, config: { gravity: 1, duration: 12, bodies: [lagrangeBodies[0], lagrangeBodies[0], lagrangeBodies[2]] } } });
  assert.equal(responses[1].id, 43);
  assert.equal(responses[1].ok, false);
  assert.equal(responses[1].error, 'tooClose');
});
