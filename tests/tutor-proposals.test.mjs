import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const directory = mkdtempSync(join(tmpdir(), 'tutor-proposals-'));
after(() => rmSync(directory, { recursive: true, force: true }));
execFileSync(process.execPath, ['node_modules/typescript/bin/tsc',
  'src/features/ai/application/tutorProposal.ts',
  'src/features/ai/application/tutorResponse.ts',
  'src/features/gravity/application/gravityState.ts',
  '--outDir', directory, '--rootDir', 'src', '--module', 'commonjs',
  '--target', 'es2022', '--lib', 'es2022,dom', '--strict', '--skipLibCheck']);
const require = createRequire(import.meta.url);
const load = path => require(join(directory, `features/${path}.js`));
const { isGravityParameterProposal: valid, resolveGravityProposal: resolve } = load('gravity/application/gravityProposal');
const { createGravityState, gravityStateReducer: reduce } = load('gravity/application/gravityState');
const { gravitationalForce: force, initialParameters: baseline } = load('gravity/domain/gravitation');
const { decideTutorProposal: decide } = load('ai/application/tutorProposal');
const { parseTutorReply: parse } = load('ai/application/tutorResponse');
const action = (parameters = { mass1: 80 }) => ({ action: 'set_gravity_parameters', parameters: { mass1: null, mass2: null, distance: null, ...parameters } });
const context = parameters => ({ kind: 'gravity', stage: 'gravity-laboratory', parameters });
const fixture = () => {
  let state = createGravityState();
  let calls = 0;
  const apply = (proposal, expectedRevision) => {
    calls++;
    const next = reduce(state, { type: 'proposal', proposal, expectedRevision });
    const applied = next !== state;
    state = next;
    return applied;
  };
  const target = () => ({ context: context(state.parameters), gravity: { revision: state.revision, apply } });
  const proposal = { kind: "gravity", action: action(), baseline: { ...state.parameters }, source: target().gravity, contextSnapshot: JSON.stringify(target().context), status: 'pending' };
  return { proposal, target, state: () => state, calls: () => calls, dispatch: event => { state = reduce(state, event); } };
};

test('doubling mass 1 resolves a proposal without applying it and doubles the domain force', () => {
  const f = fixture();
  assert.deepEqual(parse({ text: 'If applied, the force doubles.', proposal: action() }, f.target().context), { text: 'If applied, the force doubles.', proposal: action() });
  const next = resolve(baseline, action());
  assert.deepEqual(next, { mass1: 80, mass2: 40, distance: 8 });
  assert.equal(force(next), 2 * force(baseline));
  assert.deepEqual(f.state().parameters, baseline);
  assert.equal(f.calls(), 0);
});

test('confirmation synchronizes parameters and formula for all four unknowns, exactly once', () => {
  for (const key of ['force', 'mass1', 'mass2', 'distance']) {
    const f = fixture();
    f.dispatch({ type: 'unknown', key });
    const applied = decide(f.proposal, 'apply', f.target());
    assert.equal(applied.status, 'applied');
    assert.deepEqual(f.state().parameters, { mass1: 80, mass2: 40, distance: 8 });
    assert.equal(f.state().formula.unknown, key);
    assert.equal(f.state().formula.result.force, force(f.state().parameters));
    for (const field of ['force', 'mass1', 'mass2', 'distance']) {
      assert.equal(f.state().formula.values[field], field === key ? '' : String(f.state().formula.result[field]));
    }
    assert.equal(f.state().revision, 1);
    assert.strictEqual(decide(applied, 'apply', f.target()), applied);
    assert.equal(decide(f.proposal, 'apply', f.target()).status, 'stale');
    assert.equal(f.calls(), 1);
  }
});

test('cancel never calls the laboratory, even without a current page, and cannot later apply', () => {
  const f = fixture();
  const before = f.state();
  const cancelled = decide(f.proposal, 'cancel', null);
  assert.equal(cancelled.status, 'cancelled');
  assert.strictEqual(decide(cancelled, 'apply', f.target()), cancelled);
  assert.strictEqual(f.state(), before);
  assert.equal(f.calls(), 0);
});

test('strict proposal validation rejects range, step, coercion, unknown fields and arbitrary actions', () => {
  const invalid = [null, [], {}, { ...action(), action: 'execute_code' }, { ...action(), code: 'alert(1)' },
    { ...action(), parameters: { mass1: 80 } }, action({ command: 'reset' }), action({ mass1: null })];
  for (const value of [9, 101, 40.5, NaN, Infinity, -Infinity, '80', '40 * 2', '(()=>80)()', true, undefined]) invalid.push(action({ mass1: value }));
  for (const value of [4.9, 20.1, 8.25, '8']) invalid.push(action({ distance: value }));
  for (const proposal of invalid) {
    assert.equal(valid(proposal), false, JSON.stringify(proposal));
    assert.equal(resolve(baseline, proposal), null);
    const state = createGravityState();
    assert.strictEqual(reduce(state, { type: 'proposal', proposal, expectedRevision: 0 }), state);
  }
  for (const mass1 of [10, 100]) for (const distance of [5, 8.1, 20]) assert.equal(valid(action({ mass1, distance })), true);
});

test('unchanged off-step formula inputs are preserved, and no-op proposals are rejected', () => {
  assert.deepEqual(resolve({ mass1: 40, mass2: 45.5, distance: 8.25 }, action()), { mass1: 80, mass2: 45.5, distance: 8.25 });
  assert.equal(resolve(baseline, action({ mass1: 40 })), null);
});

test('parameter changes invalidate proposals, including change then return and resets', () => {
  for (const change of [
    f => f.dispatch({ type: 'parameters', update: { ...baseline, mass1: 60 } }),
    f => { f.dispatch({ type: 'parameters', update: { ...baseline, distance: 9 } }); f.dispatch({ type: 'parameters', update: baseline }); },
    f => { f.dispatch({ type: 'formula', key: 'mass1', text: '60' }); f.dispatch({ type: 'formula', key: 'mass1', text: '40' }); },
    f => f.dispatch({ type: 'reset' }),
  ]) {
    const f = fixture();
    change(f);
    const before = f.state();
    assert.equal(decide(f.proposal, 'apply', f.target()).status, 'stale');
    assert.strictEqual(f.state(), before);
    assert.equal(f.calls(), 0);
  }
});

test('missing capability, other stage, challenge, Part B and remounted provider cannot apply', () => {
  const f = fixture();
  for (const target of [null, { context: f.target().context },
    { ...f.target(), context: { ...f.target().context, stage: 'gravity-challenges', challenge: 'oneMass' } },
    { ...f.target(), context: { kind: 'three-body', slug: 'figure-eight' } },
    { ...f.target(), gravity: { revision: 0, apply: () => { throw Error('Must not execute'); } } },
  ]) assert.equal(decide(f.proposal, 'apply', target).status, 'stale');
  assert.equal(f.calls(), 0);
});

test('provider compare-and-set rejects a race even before the bridge publishes the new revision', () => {
  const f = fixture();
  const previousTarget = f.target();
  f.dispatch({ type: 'parameters', update: { ...baseline, mass1: 60 } });
  const before = f.state();
  assert.equal(decide(f.proposal, 'apply', previousTarget).status, 'stale');
  assert.equal(f.calls(), 1);
  assert.strictEqual(f.state(), before);
});

test('confirmation revalidates the action even if an untrusted response bypasses initial parsing', () => {
  const f = fixture();
  assert.equal(decide({ ...f.proposal, action: action({ mass1: 200 }) }, 'apply', f.target()).status, 'stale');
  assert.equal(f.calls(), 0);
});

test('normal questions remain text-only; rejected actions request a safe localized explanation', () => {
  const gravity = context(baseline);
  for (const proposal of [undefined, null]) assert.deepEqual(parse({ text: '  Newton explains attraction. ', proposal }, gravity), { text: 'Newton explains attraction.' });
  for (const proposal of [action({ mass1: 101 }), action({ mass1: 40 }), { ...action(), action: 'arbitrary' }]) {
    assert.deepEqual(parse({ text: 'Unsafe model claim.', proposal }, gravity), { text: '', proposalRejected: true });
  }
  const threeBody = { kind: 'three-body', slug: 'figure-eight' };
  assert.deepEqual(parse({ text: 'Unsafe model claim.', proposal: action() }, threeBody), { text: '', proposalRejected: true });
  for (const reply of [null, [], { text: '' }, { text: 'ok', code: 'run' }, { text: 'ok', proposalRejected: true }]) assert.throws(() => parse(reply, gravity), /Invalid tutor response/);
});


test('the formula lesson drops all model proposals, including free-text follow-ups', () => {
  const f = fixture();
  const target = { ...f.target(), context: { ...f.target().context, stage: 'gravity-understanding' } };
  for (const intent of [undefined, 'explain_formula']) {
    assert.deepEqual(parse({ text: 'Educational explanation.', proposal: action() }, target.context, intent), { text: 'Educational explanation.' });
  }
  const forged = { ...f.proposal, contextSnapshot: JSON.stringify(target.context) };
  assert.equal(decide(forged, 'apply', target).status, 'stale');
  assert.equal(f.calls(), 0);
  assert.deepEqual(f.state().parameters, baseline);
});
