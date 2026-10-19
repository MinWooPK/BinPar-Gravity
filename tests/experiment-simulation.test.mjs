import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const directory = mkdtempSync(join(tmpdir(), 'three-body-experiment-'));
after(() => rmSync(directory, { recursive: true, force: true }));
execFileSync(process.execPath, [
  'node_modules/typescript/bin/tsc',
  'src/features/three-body/domain/newtonian-physics.ts',
  'src/features/three-body/domain/experiment-simulation.ts',
  '--outDir', directory, '--rootDir', 'src', '--module', 'commonjs',
  '--target', 'es2020', '--skipLibCheck',
]);
const require = createRequire(import.meta.url);
const { simulateExperiment } = require(join(directory, 'features/three-body/domain/experiment-simulation.js'));

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
