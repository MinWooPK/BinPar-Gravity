import {
  simulateExperiment, SimulationStoppedError, validateExperimentState,
  type ExperimentConfiguration, type ExperimentTrajectory, type SimulationControl,
} from "./experiment-simulation";
import { validateGravityParameters, type GravityParameters } from "./newtonian-physics";
import {
  characteristicScales, detectPeriodicity, measureReturnErrors, measureReturnResiduals,
  MINIMUM_PERIODICITY_EXCURSION, PERIODICITY_TOLERANCE,
} from "./periodicity-detection";
import {
  ORBIT_SEARCH_LIMITS,
  type OrbitSearchCandidate, type OrbitSearchOptions, type OrbitSearchProgress, type OrbitSearchResult,
} from "../types/orbit-search.types";

type Evaluation = {
  point: number[];
  residuals: readonly number[];
  objective: number;
  trajectory: ExperimentTrajectory;
};

class SearchFinished extends Error {
  constructor(readonly reason: OrbitSearchResult["reason"]) { super(reason); }
}

// Partial-pivot Gaussian elimination of the small damped normal system (7 × 7).
function solve(matrix: number[][], rhs: number[]): number[] | null {
  const rows = matrix.map((row, i) => [...row, rhs[i]]);
  const n = rhs.length;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(rows[row][col]) > Math.abs(rows[pivot][col])) pivot = row;
    }
    if (!Number.isFinite(rows[pivot][col]) || Math.abs(rows[pivot][col]) < 1e-15) return null;
    [rows[col], rows[pivot]] = [rows[pivot], rows[col]];
    for (let row = col + 1; row < n; row++) {
      const factor = rows[row][col] / rows[col][col];
      for (let k = col; k <= n; k++) rows[row][k] -= factor * rows[col][k];
    }
  }
  const result = new Array<number>(n).fill(0);
  for (let row = n - 1; row >= 0; row--) {
    let value = rows[row][n];
    for (let col = row + 1; col < n; col++) value -= rows[row][col] * result[col];
    result[row] = value / rows[row][row];
  }
  return result.every(Number.isFinite) ? result : null;
}

/**
 * Deterministic multistart shooting with damped least squares (Levenberg–Marquardt).
 * Seven variables: six velocity offsets / V and log(T / configured duration).
 * Twelve residuals: signed normalized x,y,vx,vy returns. Numerical derivatives
 * use the existing integrator; no gravity equations or RK4 implementation here.
 * The generator yields after integrations; scheduling, clocks and React live outside.
 * See docs/orbit-search.md for bounds, confirmation and limitations.
 */
export function* searchOrbit(
  configuration: ExperimentConfiguration,
  options: OrbitSearchOptions = {},
  control: Pick<SimulationControl, "shouldStop"> = {},
): Generator<OrbitSearchProgress, OrbitSearchResult, void> {
  const maxEvaluations = options.maxEvaluations ?? ORBIT_SEARCH_LIMITS.maxEvaluations;
  const starts = options.starts ?? ORBIT_SEARCH_LIMITS.starts;
  const iterations = options.iterations ?? ORBIT_SEARCH_LIMITS.iterations;
  let seed = options.seed ?? ORBIT_SEARCH_LIMITS.seed;
  for (const [value, maximum] of [[maxEvaluations, 1000], [starts, 8], [iterations, 30]]) {
    if (!Number.isInteger(value) || value < 1 || value > maximum) throw new RangeError("Invalid search budget.");
  }
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new RangeError("Invalid search seed.");
  if (
    !Number.isFinite(configuration.duration) || configuration.duration <= 0 || configuration.duration > 100 ||
    configuration.bodies.length !== 3
  ) throw new RangeError("Invalid search configuration.");
  const original = configuration.bodies.map((body) => ({ ...body }));
  const physics: GravityParameters = { G: configuration.gravity, masses: [original[0].mass, original[1].mass, original[2].mass] };
  validateGravityParameters(physics);
  const initial = original.flatMap(({ x, y, vx, vy }) => [x, y, vx, vy]);
  validateExperimentState(initial);
  const scale = characteristicScales(initial, physics);
  const velocities = original.flatMap(({ vx, vy }) => [vx, vy]);
  const minLogPeriod = Math.log(ORBIT_SEARCH_LIMITS.minimumPeriodRatio);
  const clamp = (point: readonly number[]) => point.map((value, i) => i === 6
    ? Math.max(minLogPeriod, Math.min(0, value))
    : Math.max(-ORBIT_SEARCH_LIMITS.velocityRadius, Math.min(ORBIT_SEARCH_LIMITS.velocityRadius, value)));
  const configAt = (point: readonly number[]): ExperimentConfiguration => ({
    gravity: configuration.gravity,
    duration: configuration.duration * Math.exp(point[6]),
    bodies: original.map((body, i) => ({ ...body,
      vx: velocities[2 * i] + point[2 * i] * scale.velocity,
      vy: velocities[2 * i + 1] + point[2 * i + 1] * scale.velocity,
    })),
  });
  // Seeded integer PRNG; no Math.random, clock, network or catalogue dependency.
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  let evaluations = 0;
  let best: OrbitSearchCandidate | null = null;
  const progress = (): OrbitSearchProgress => ({ evaluations, maxEvaluations, best });
  const finish = (reason: OrbitSearchResult["reason"]): OrbitSearchResult => ({ ...progress(), reason, found: reason === "found" });
  const budget = () => {
    if (control.shouldStop?.()) throw new SimulationStoppedError();
    if (evaluations >= maxEvaluations) throw new SearchFinished("evaluationLimit");
    evaluations++;
  };
  const isNontrivial = (trajectory: ExperimentTrajectory) => {
    const start = trajectory.stateSamples[0].state;
    const size = characteristicScales(start, physics).position;
    return trajectory.stateSamples.some(({ state }) => [0, 4, 8].some((offset) =>
      Math.hypot(state[offset] - start[offset], state[offset + 1] - start[offset + 1]) / size >= MINIMUM_PERIODICITY_EXCURSION));
  };
  const candidateFrom = (config: ExperimentConfiguration, trajectory: ExperimentTrajectory): OrbitSearchCandidate => ({
    configuration: config, period: config.duration, verified: false,
    errors: measureReturnErrors(trajectory.stateSamples[0].state, trajectory.stateSamples[trajectory.stateSamples.length - 1].state, physics),
  });

  function* evaluate(input: readonly number[]): Generator<OrbitSearchProgress, Evaluation | null, void> {
    budget();
    const point = clamp(input);
    const config = configAt(point);
    let evaluation: Evaluation | null = null;
    let candidate: OrbitSearchCandidate | null = null;
    try {
      // Same full RK4 accuracy. Fewer output frames and a smaller work budget.
      const trajectory = simulateExperiment(config, 65, { ...control, maxAttempts: 15_000 });
      if (isNontrivial(trajectory)) {
        candidate = candidateFrom(config, trajectory);
        const residuals = measureReturnResiduals(trajectory.stateSamples[0].state, trajectory.stateSamples[trajectory.stateSamples.length - 1].state, physics);
        const objective = residuals.reduce((sum, value) => sum + value * value, 0);
        if (Number.isFinite(objective)) {
          evaluation = { point, residuals, objective, trajectory };
          if (!best || candidate.errors.combinedError < best.errors.combinedError) best = candidate;
        }
      }
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      // A collision, overflow or step limit invalidates this trial only.
    }
    yield progress();

    if (evaluation && candidate && candidate.errors.combinedError <= PERIODICITY_TOLERANCE) {
      budget();
      try {
        // Independent integration from t=0, at the proposed T, with default
        // precision, sampling and step limit. Check BOTH endpoint and detector.
        const fresh = simulateExperiment(config, 601, control);
        const confirmed = candidateFrom(config, fresh);
        const periodicity = detectPeriodicity(fresh, physics, control);
        if (confirmed.errors.combinedError <= PERIODICITY_TOLERANCE && periodicity.detected) {
          best = { ...confirmed, verified: true };
          yield progress();
          throw new SearchFinished("found");
        }
      } catch (error) {
        if (!(error instanceof RangeError)) throw error;
      }
      yield progress();
    }
    return evaluation;
  }

  yield progress();
  try {
    // Probe the configured interval to locate a first period without a hardcoded
    // orbit seed. If it fails, the other starts still get a chance at shorter T.
    const probe = yield* evaluate([0, 0, 0, 0, 0, 0, 0]);
    let periodRatio = 0.7;
    if (probe) {
      let detectedPeriod: number | null = null;
      try {
        const detected = detectPeriodicity(probe.trajectory, physics, control);
        if (detected.detected) detectedPeriod = detected.estimatedPeriod;
      } catch (error) {
        if (!(error instanceof RangeError)) throw error;
      }
      if (detectedPeriod !== null && detectedPeriod >= configuration.duration * ORBIT_SEARCH_LIMITS.minimumPeriodRatio) {
        periodRatio = detectedPeriod / configuration.duration;
      } else {
        const samples = probe.trajectory.stateSamples;
        const errors = samples.map(({ state }) => measureReturnErrors(samples[0].state, state, physics).combinedError);
        let lowest = Infinity;
        for (let i = 1; i < samples.length - 1; i++) {
          if (samples[i].time >= configuration.duration * ORBIT_SEARCH_LIMITS.minimumPeriodRatio &&
            errors[i] <= errors[i - 1] && errors[i] <= errors[i + 1] && errors[i] < lowest) {
            lowest = errors[i];
            periodRatio = samples[i].time / configuration.duration;
          }
        }
      }
    }

    for (let start = 0; start < starts; start++) {
      const point = Array.from({ length: 7 }, (_, i) => i === 6
        ? Math.log(periodRatio) + (start === 0 ? 0 : (random() - 0.5) * 0.15)
        : start === 0 ? 0 : (random() - 0.5) * 0.08);
      let current = yield* evaluate(point);
      let damping = 1e-3;
      for (let iteration = 0; current && iteration < iterations; iteration++) {
        const columns: number[][] = [];
        for (let variable = 0; variable < 7; variable++) {
          const delta = current.point[variable] + 1e-4 > (variable === 6 ? 0 : ORBIT_SEARCH_LIMITS.velocityRadius) ? -1e-4 : 1e-4;
          const shifted = current.point.slice();
          shifted[variable] += delta;
          const trial = yield* evaluate(shifted);
          if (!trial) break;
          columns.push(trial.residuals.map((value, i) => (value - current!.residuals[i]) / delta));
        }
        if (columns.length !== 7) break;
        const dot = (a: readonly number[], b: readonly number[]) => a.reduce((sum, value, i) => sum + value * b[i], 0);
        const normal = columns.map((a, row) => columns.map((b, col) =>
          dot(a, b) + (row === col ? damping * (1 + dot(a, a)) : 0)));
        const rhs = columns.map((column) => -dot(column, current!.residuals));
        const step = solve(normal, rhs);
        if (!step) break;
        // Bound each local move; parameter bounds are enforced separately.
        const factor = Math.min(1, 0.15 / Math.max(...step.map(Math.abs)));
        if (Math.hypot(...step) * factor < 1e-8) break;
        const trial = yield* evaluate(current.point.map((value, i) => value + step[i] * factor));
        if (trial && trial.objective < current.objective) {
          current = trial;
          damping = Math.max(1e-9, damping / 3);
        } else {
          damping *= 10;
          if (damping > 1e9) break;
        }
      }
    }
    return finish("completed");
  } catch (error) {
    if (error instanceof SearchFinished) return finish(error.reason);
    if (error instanceof SimulationStoppedError) return finish("timeLimit");
    throw error;
  }
}
