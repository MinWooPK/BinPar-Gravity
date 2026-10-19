import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { Worker } from 'node:worker_threads';
import { once } from 'node:events';

const directory = mkdtempSync(join(tmpdir(), 'orbit-search-'));
after(() => rmSync(directory, { recursive: true, force: true }));
execFileSync(process.execPath, [
  'node_modules/typescript/bin/tsc',
  'src/features/three-body/domain/orbit-search.ts',
  'src/features/three-body/application/apply-orbit-search.ts',
  'src/features/three-body/presentation/components/experiment/orbit-search.worker.ts',
  'src/features/three-body/presentation/components/experiment/orbit-search-controller.ts',
  '--outDir', directory, '--rootDir', 'src', '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck', '--strict',
]);
const require = createRequire(import.meta.url);
const load = (path) => require(join(directory, 'features/three-body', path));
const { searchOrbit } = load('domain/orbit-search.js');
const { simulateExperiment } = load('domain/experiment-simulation.js');
const { detectPeriodicity, measureReturnErrors, characteristicScales, PERIODICITY_TOLERANCE } = load('domain/periodicity-detection.js');
const { applyOrbitSearchCandidate } = load('application/apply-orbit-search.js');
const { createOrbitSearchController } = load('presentation/components/experiment/orbit-search-controller.js');
const { ORBIT_SEARCH_LIMITS } = load('types/orbit-search.types.js');
const workerPath = join(directory, 'features/three-body/presentation/components/experiment/orbit-search.worker.js');
const omega = 3 ** -0.25;
const period = 2 * Math.PI / omega;
const lagrange = { gravity: 1, duration: 12, bodies: [0, 1, 2].map((i) => {
  const angle = i * 2 * Math.PI / 3;
  return { mass: 1, x: Math.cos(angle), y: Math.sin(angle), vx: -omega * Math.sin(angle), vy: omega * Math.cos(angle) };
}) };
const perturbed = { ...lagrange, bodies: lagrange.bodies.map((body, i) => ({ ...body, vx: body.vx + (i === 1 ? -0.01 : 0.01), vy: body.vy + (i === 2 ? -0.01 : 0.01) })) };
const unequal = { gravity: 2, duration: 0.4, bodies: [
  { mass: 1, x: -1, y: 0, vx: 0, vy: 0.3 },
  { mass: 2, x: 1, y: 0, vx: 0, vy: -0.3 },
  { mass: 3, x: 0, y: 1, vx: 0.4, vy: 0 },
] };
const physicsOf = (config) => ({ G: config.gravity, masses: config.bodies.map(({ mass }) => mass) });
function run(config, options, control, observe = () => {}) {
  const search = searchOrbit(config, options, control);
  for (;;) {
    const step = search.next();
    if (step.done) return step.value;
    observe(step.value);
  }
}
function assertFinite(value) {
  if (typeof value === 'number') assert.ok(Number.isFinite(value));
  else if (value && typeof value === 'object') Object.values(value).forEach(assertFinite);
}
function assertFixed(seed, candidate) {
  assert.equal(candidate.configuration.gravity, seed.gravity);
  for (let i = 0; i < 3; i++) for (const key of ['mass', 'x', 'y']) assert.equal(candidate.configuration.bodies[i][key], seed.bodies[i][key]);
  assert.ok(candidate.period >= seed.duration * 0.2 && candidate.period <= seed.duration);
  const V = characteristicScales(seed.bodies.flatMap(({ x, y, vx, vy }) => [x, y, vx, vy]), physicsOf(seed)).velocity;
  for (let i = 0; i < 3; i++) for (const key of ['vx', 'vy']) {
    assert.ok(Math.abs(candidate.configuration.bodies[i][key] - seed.bodies[i][key]) <= V * 0.5 + 1e-14);
  }
}
function assertConfirmed(result) {
  assert.equal(result.found, true);
  assert.equal(result.best.verified, true);
  const config = result.best.configuration;
  const fresh = simulateExperiment(config);
  const endpoint = measureReturnErrors(fresh.stateSamples[0].state, fresh.stateSamples.at(-1).state, physicsOf(config));
  assert.ok(endpoint.positionError <= PERIODICITY_TOLERANCE);
  assert.ok(endpoint.velocityError <= PERIODICITY_TOLERANCE);
  assert.equal(detectPeriodicity(fresh, physicsOf(config)).detected, true);
  assertFinite(result);
}

test('Lagrange is found and independently confirmed at its full-state period', () => {
  const result = run(lagrange);
  assertConfirmed(result);
  assertFixed(lagrange, result.best);
  assert.ok(Math.abs(result.best.period - period) < 1e-5);
  assert.ok(result.evaluations >= 2, 'confirmation is a separate counted integration');
});

test('local optimization improves perturbed Lagrange velocities and independently passes both errors', () => {
  const reference = simulateExperiment({ ...perturbed, duration: period });
  const initialError = measureReturnErrors(reference.stateSamples[0].state, reference.stateSamples.at(-1).state, physicsOf(perturbed)).combinedError;
  const result = run(perturbed);
  assertConfirmed(result);
  assert.ok(result.best.errors.combinedError < initialError / 10);
  assert.notDeepEqual(result.best.configuration.bodies, perturbed.bodies);
  assertFixed(perturbed, result.best);
});

test('unequal masses retain a finite best candidate without inventing a solution', () => {
  const result = run(unequal, { maxEvaluations: 80, starts: 4, iterations: 5 });
  assertFinite(result);
  assert.ok(result.best);
  assertFixed(unequal, result.best);
  assert.ok(result.evaluations <= 80);
  if (result.found) assertConfirmed(result);
  else assert.equal(result.best.verified, false);
});

test('the same seed and budgets reproduce the entire result without mutating inputs', () => {
  const source = structuredClone(unequal);
  source.bodies.forEach(Object.freeze);
  Object.freeze(source.bodies);
  Object.freeze(source);
  const options = Object.freeze({ maxEvaluations: 64, starts: 4, iterations: 2, seed: 12345 });
  const first = run(source, options);
  assert.deepEqual(first, run(source, options));
  assert.deepEqual(source, unequal);
});

test('evaluation caps include failed trials, derivative probes and independent confirmation', () => {
  for (const maxEvaluations of [1, 2, 8, 17]) {
    const progress = [];
    const result = run(maxEvaluations <= 2 ? lagrange : unequal, { maxEvaluations }, undefined, (p) => progress.push(p));
    assert.ok(result.evaluations <= maxEvaluations);
    assert.ok(progress.every((p) => p.evaluations <= maxEvaluations));
    assertFinite(result);
    if (maxEvaluations === 2) {
      assert.equal(result.found, false, 'a good coarse trial cannot bypass confirmation');
      assert.equal(result.reason, 'evaluationLimit');
      assert.ok(result.best.errors.combinedError <= PERIODICITY_TOLERANCE);
      assert.equal(result.best.verified, false);
    }
  }
});

test('time budget stops inside RK4 and retains previously completed candidates', () => {
  let calls = 0;
  const interrupted = run(lagrange, {}, { shouldStop: () => ++calls >= 25 });
  assert.equal(interrupted.reason, 'timeLimit');
  assert.equal(interrupted.evaluations, 1);
  assert.equal(interrupted.best, null);
  let expired = false;
  let previous;
  const result = run(unequal, {}, { shouldStop: () => expired }, (p) => {
    if (p.best) { previous = p.best; expired = true; }
  });
  assert.equal(result.reason, 'timeLimit');
  assert.deepEqual(result.best, previous);
});

test('failed encounters are discarded and later starting points are still evaluated', () => {
  const approaching = { gravity: 1e-10, duration: 0.011, bodies: [
    { mass: 1, x: -0.01, y: 0, vx: 1, vy: 0 },
    { mass: 1, x: 0.01, y: 0, vx: -1, vy: 0 },
    { mass: 1, x: 0, y: 10, vx: 0, vy: 0 },
  ] };
  assert.throws(() => simulateExperiment(approaching), RangeError);
  const result = run(approaching, { starts: 4, iterations: 1 });
  assert.equal(result.found, false);
  assert.ok(result.evaluations >= 5);
  assertFinite(result);
});

test('almost stationary states, invalid inputs and unsafe budgets never become solutions', () => {
  const result = run({ ...lagrange, gravity: 1e-16, duration: 1e-5, bodies: lagrange.bodies.map((b) => ({ ...b, vx: 0, vy: 0 })) });
  assert.equal(result.found, false);
  assert.equal(result.best, null);
  for (const change of [{ gravity: NaN }, { duration: 101 }, { bodies: [] }, { bodies: [lagrange.bodies[0], lagrange.bodies[0], lagrange.bodies[2]] }]) {
    assert.throws(() => run({ ...lagrange, ...change }), RangeError);
  }
  for (const options of [{ maxEvaluations: 0 }, { maxEvaluations: 1001 }, { starts: 9 }, { iterations: Infinity }, { seed: NaN }]) {
    assert.throws(() => run(lagrange, options), RangeError);
  }
});

test('explicit application changes only velocities and duration, rejecting stale or unconfirmed proposals', () => {
  const candidate = run(perturbed).best;
  const applied = applyOrbitSearchCandidate(perturbed, candidate);
  assertFixed(perturbed, { ...candidate, configuration: applied });
  assert.equal(applied.duration, candidate.period);
  assert.notEqual(applied, perturbed);
  assert.equal(applyOrbitSearchCandidate({ ...perturbed, gravity: 2 }, candidate), null);
  assert.equal(applyOrbitSearchCandidate(perturbed, { ...candidate, verified: false }), null);
  assert.equal(applyOrbitSearchCandidate(perturbed, { ...candidate, period: Infinity }), null);
});

function harness() {
  let clock = 0, sequence = 0;
  const timers = new Map();
  const scheduler = {
    set(callback, delay) { const id = ++sequence; timers.set(id, { callback, at: clock + delay }); return id; },
    clear(id) { timers.delete(id); },
  };
  const advance = (ms) => {
    clock += ms;
    for (const [id, timer] of [...timers]) if (timer.at <= clock) { timers.delete(id); timer.callback(); }
  };
  const workers = [], states = [];
  const controller = createOrbitSearchController(() => {
    const worker = { onmessage: null, onerror: null, terminated: 0, postMessage(message) { this.request = message; }, terminate() { this.terminated++; } };
    workers.push(worker);
    return worker;
  }, (state) => states.push(state), scheduler);
  const post = (worker, progress) => worker.onmessage({ data: { id: worker.request.id, type: 'progress', progress } });
  return { controller, workers, states, advance, timers, post };
}

test('progress is batched, cancel terminates the worker, and late messages cannot revive it', () => {
  const h = harness();
  h.controller.start(unequal);
  const worker = h.workers[0];
  const late = worker.onmessage;
  for (let evaluations = 1; evaluations <= 20; evaluations++) h.post(worker, { evaluations, maxEvaluations: 480, best: null });
  assert.equal(h.states.length, 1);
  h.advance(250);
  assert.equal(h.states.length, 2);
  assert.equal(h.states.at(-1).progress.evaluations, 20);
  h.controller.cancel();
  assert.equal(worker.terminated, 1);
  assert.equal(h.states.at(-1).status, 'cancelled');
  late({ data: { id: worker.request.id, type: 'result', result: {} } });
  assert.equal(h.states.at(-1).status, 'cancelled');
  assert.equal(h.timers.size, 0);
});

test('hard deadline preserves the latest best even between UI updates; disposal stops all work', () => {
  const h = harness();
  h.controller.start(unequal);
  const best = run(unequal, { maxEvaluations: 1 }).best;
  h.post(h.workers[0], { evaluations: 1, maxEvaluations: 480, best });
  h.advance(ORBIT_SEARCH_LIMITS.timeMs);
  assert.equal(h.workers[0].terminated, 1);
  assert.equal(h.states.at(-1).result.reason, 'timeLimit');
  assert.deepEqual(h.states.at(-1).result.best, best);
  h.controller.start(unequal);
  h.controller.start(lagrange);
  assert.equal(h.workers[1].terminated, 1);
  h.controller.dispose();
  assert.equal(h.workers[2].terminated, 1);
  assert.equal(h.timers.size, 0);
});

test('worker protocol confirms results and honors its monotonic deadline', () => {
  for (const expire of [false, true]) {
    let now = 0;
    const responses = [];
    const self = { postMessage: (message) => responses.push(message) };
    runInNewContext(readFileSync(workerPath, 'utf8'), { self, Error, RangeError, exports: {}, require: createRequire(workerPath), performance: { now: () => expire ? (now += 1000) : 0 } });
    self.onmessage({ data: { id: 7, configuration: lagrange } });
    assert.ok(responses.every((r) => r.id === 7));
    const result = responses.at(-1);
    assert.equal(result.type, 'result');
    if (expire) assert.equal(result.result.reason, 'timeLimit');
    else assertConfirmed(result.result);
  }
});

test('cancellation actually terminates a running worker thread', { timeout: 5000 }, async () => {
  let thread;
  let exited;
  let controller;
  const states = [];
  controller = createOrbitSearchController(() => {
    thread = new Worker(`const {parentPort,workerData}=require('node:worker_threads'); global.self={postMessage:m=>parentPort.postMessage(m)}; require(workerData); parentPort.on('message',data=>self.onmessage({data}));`, { eval: true, workerData: workerPath });
    exited = once(thread, 'exit');
    const port = { onmessage: null, onerror: null, postMessage: (m) => thread.postMessage(m), terminate: () => { void thread.terminate(); } };
    thread.on('message', (data) => {
      port.onmessage?.({ data });
      if (data.type === 'progress') controller.cancel();
    });
    thread.on('error', () => port.onerror?.());
    return port;
  }, (state) => states.push(state));
  try {
    controller.start(unequal);
    const [code] = await exited;
    assert.equal(code, 1);
    assert.equal(states.at(-1).status, 'cancelled');
    assert.ok(!states.some((s) => s.status === 'finished'));
  } finally {
    controller.dispose();
    await thread?.terminate();
  }
});

test('search messages are present in all locales with matching interpolation parameters', () => {
  const dictionaries = ['es', 'en', 'fr'].map((locale) => JSON.parse(readFileSync(`messages/${locale}.json`, 'utf8')).ThreeBody.experiment.orbitSearch);
  for (const messages of dictionaries) {
    assert.deepEqual(Object.keys(messages).sort(), Object.keys(dictionaries[0]).sort());
    for (const [key, text] of Object.entries(messages)) {
      assert.ok(text.trim());
      assert.deepEqual([...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort(), [...dictionaries[0][key].matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort());
    }
  }
});
