import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const directory = mkdtempSync(join(tmpdir(), 'gravity-sync-'));
after(() => rmSync(directory, { recursive: true, force: true }));
execFileSync(process.execPath, ['node_modules/typescript/bin/tsc',
  'src/features/gravity/application/gravityState.ts', '--outDir', directory,
  '--rootDir', 'src', '--module', 'commonjs', '--target', 'es2017', '--skipLibCheck']);
const require = createRequire(import.meta.url);
const { createGravityState, gravityStateReducer: reduce } = require(join(directory, 'features/gravity/application/gravityState.js'));
const { gravitationalForce: force, initialParameters, challenges } = require(join(directory, 'features/gravity/domain/gravitation.js'));
const edit = (state, key, text) => reduce(state, { type: 'formula', key, text });
const select = (state, key) => reduce(state, { type: 'unknown', key });
const near = (actual, expected) => assert.ok(Math.abs(actual / expected - 1) < 1e-12, `${actual} ≈ ${expected}`);
const assertPhysical = (state, parameters) => {
  for (const key of Object.keys(parameters)) near(state.parameters[key], parameters[key]);
  near(state.formula.result.force, force(parameters));
};

test('formula starts from the shared SI laboratory with F already calculated', () => {
  const state = createGravityState();
  assert.deepEqual(state.parameters, { mass1: 40, mass2: 40, distance: 8 });
  assert.deepEqual(state.formula.values, { mass1: '40', mass2: '40', distance: '8', force: '' });
  assert.equal(state.formula.unknown, 'force');
  assertPhysical(state, initialParameters);
  assert.ok(state.formula.result.force > 0 && state.formula.result.force < 1e-8);
});

test('each valid formula edit synchronizes physics immediately and preserves literal decimal text', () => {
  let state = createGravityState();
  for (const [key, text, value] of [['mass1', '60,5', 60.5], ['mass2', '72.5', 72.5], ['distance', '8,25', 8.25]]) {
    state = edit(state, key, text);
    assert.equal(state.parameters[key], value);
    assert.equal(state.formula.values[key], text);
    assert.equal(state.formula.result.force, force(state.parameters));
  }
  assert.equal(state.formula.values.mass1, '60,5');
  assert.equal(state.formula.values.mass2, '72.5');
});

test('solving for either mass or distance automatically synchronizes the laboratory', () => {
  for (const key of ['mass1', 'mass2', 'distance']) {
    const target = { ...initialParameters, [key]: key === 'distance' ? 12.6 : 65.5 };
    const selected = select(createGravityState(), key);
    const state = edit(selected, 'force', String(force(target)));
    assertPhysical(state, target);
    near(state.formula.result[key], target[key]);
    assert.equal(state.formula.values.force, String(force(target)));
  }
});

test('external slider updates hydrate all known formula fields for every selected unknown', () => {
  for (const key of ['force', 'mass1', 'mass2', 'distance']) {
    const selected = select(createGravityState(), key);
    const parameters = { mass1: 73, mass2: 59, distance: 13.2 };
    const state = reduce(selected, { type: 'parameters', update: parameters });
    assert.equal(state.formula.unknown, key);
    assertPhysical(state, parameters);
    for (const variable of ['mass1', 'mass2', 'distance', 'force']) {
      assert.equal(state.formula.values[variable], variable === key ? '' : String(state.formula.result[variable]));
    }
  }
});

test('incomplete and invalid edits keep their exact text and the last valid physical state', () => {
  const initial = edit(createGravityState(), 'mass1', '55');
  for (const text of ['', '.', ',', '+', '1e', '1e-', '-2', '0', 'abc', 'Infinity', '1e999']) {
    const state = edit(initial, 'distance', text);
    assert.strictEqual(state.parameters, initial.parameters, text);
    assert.equal(state.formula.values.distance, text);
    assert.equal(state.formula.result, null, text);
  }
});

test('out-of-range solutions remain visible without silently clamping any physical value', () => {
  for (const [key, text] of [['mass1', '9.9'], ['mass2', '100.1'], ['distance', '4.9'], ['distance', '20.1']]) {
    const initial = createGravityState();
    const state = edit(initial, key, text);
    assert.strictEqual(state.parameters, initial.parameters);
    assert.equal(state.formula.result[key], Number(text));
    assert.equal(state.formula.values[key], text);
  }
  for (const key of ['mass1', 'mass2', 'distance']) {
    const initial = select(createGravityState(), key);
    const target = { ...initialParameters, [key]: key === 'distance' ? 30 : 200 };
    const state = edit(initial, 'force', String(force(target)));
    assert.strictEqual(state.parameters, initial.parameters);
    near(state.formula.result[key], target[key]);
  }
});

test('correcting an incomplete draft resumes synchronization without losing other known text', () => {
  let state = edit(createGravityState(), 'mass1', '60,50');
  state = edit(state, 'distance', '1e-');
  state = edit(state, 'mass2', '70');
  assert.deepEqual(state.parameters, { mass1: 60.5, mass2: 40, distance: 8 });
  state = edit(state, 'distance', '12.5');
  assertPhysical(state, { mass1: 60.5, mass2: 70, distance: 12.5 });
  assert.equal(state.formula.values.mass1, '60,50');
});

test('a slider takes precedence over a pending formula draft and preserves the selected unknown', () => {
  let state = edit(select(createGravityState(), 'mass1'), 'force', '1e-');
  state = reduce(state, { type: 'parameters', update: (current) => ({ ...current, distance: 10 }) });
  assertPhysical(state, { mass1: 40, mass2: 40, distance: 10 });
  assert.equal(state.formula.unknown, 'mass1');
  assert.equal(state.formula.values.force, String(force(state.parameters)));
});

test('changing the unknown preserves physics, and calculated fields are read-only', () => {
  let state = edit(createGravityState(), 'mass1', '60.5');
  for (const key of ['mass1', 'mass2', 'distance', 'force']) {
    const parameters = state.parameters;
    state = select(state, key);
    assert.strictEqual(state.parameters, parameters);
    near(state.formula.result[key], { ...parameters, force: force(parameters) }[key]);
    assert.strictEqual(edit(state, key, '99'), state);
  }
});

test('reset clears pending text, restores physical defaults and F as unknown together', () => {
  let state = edit(createGravityState(), 'mass1', '75');
  state = edit(select(state, 'distance'), 'force', '1e-');
  const snapshot = structuredClone(state);
  const reset = reduce(state, { type: 'reset' });
  assert.deepEqual(reset, { ...createGravityState(), resetVersion: 1 });
  assert.deepEqual(state, snapshot);
});

test('challenge base/scenario transitions synchronize formula with unchanged answer ratios', () => {
  let state = edit(createGravityState(), 'mass1', '99');
  for (const [index, challenge] of challenges.entries()) {
    state = reduce(state, { type: 'parameters', update: initialParameters });
    assertPhysical(state, initialParameters);
    state = reduce(state, { type: 'parameters', update: challenge.parameters });
    assertPhysical(state, challenge.parameters);
    assert.equal(force(state.parameters) / force(initialParameters), [2, 4, 0.25][index]);
  }
});

test('out-of-range and non-finite external updates cannot corrupt the shared state', () => {
  const state = createGravityState();
  for (const value of [0, -1, NaN, Infinity, 101, 1e13]) {
    assert.strictEqual(reduce(state, { type: 'parameters', update: { ...state.parameters, mass1: value } }), state);
  }
});

test('selecting an unknown preserves exact boundary values without repeated inverse drift', () => {
  let state = reduce(createGravityState(), { type: 'parameters', update: { mass1: 10, mass2: 10, distance: 5.8 } });
  for (let i = 0; i < 10; i++) for (const key of ['mass1', 'mass2', 'distance', 'force']) {
    state = select(state, key);
    assert.deepEqual(state.parameters, { mass1: 10, mass2: 10, distance: 5.8 });
    assertPhysical(state, state.parameters);
    assert.equal(state.formula.result[key], { ...state.parameters, force: force(state.parameters) }[key]);
  }
});

test('inverse results tolerate only machine precision at limits, never clamp explicit out-of-range entries', () => {
  for (const key of ['mass1', 'mass2', 'distance']) for (const value of key === 'distance' ? [5, 20] : [10, 100]) {
    const target = { mass1: 47, mass2: 67, distance: 5.8, [key]: value };
    let state = reduce(createGravityState(), { type: 'parameters', update: target });
    state = select(state, key);
    state = edit(state, 'force', String(force(target)));
    assertPhysical(state, target);
    assert.equal(state.parameters[key], value);
  }
  const state = createGravityState();
  const invalid = edit(state, 'mass1', '9.999999999999998');
  assert.strictEqual(invalid.parameters, state.parameters);
  assert.equal(invalid.formula.values.mass1, '9.999999999999998');
});
