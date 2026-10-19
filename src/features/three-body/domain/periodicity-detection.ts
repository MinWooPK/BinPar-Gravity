import {
  refineExperimentState,
  SimulationStoppedError,
  validateExperimentState,
  type ExperimentState,
  type ExperimentTrajectory,
  type SimulationControl,
} from "./experiment-simulation";
import { validateGravityParameters, type GravityParameters } from "./newtonian-physics";

/** 0.1% of each characteristic scale, independently for position and velocity. */
export const PERIODICITY_TOLERANCE = 1e-3;
// Require an excursion of at least 5% of the initial system size before a return.
export const MINIMUM_PERIODICITY_EXCURSION = 0.05;
const MAX_REFINEMENT_ATTEMPTS = 150_000;

export type PeriodicityResult = Readonly<{
  detected: boolean;
  estimatedPeriod: number | null;
  positionError: number;
  velocityError: number;
  combinedError: number;
  tolerance: number;
  evaluatedTime: number;
  reason: "approximateReturn" | "noReturn" | "insufficientMotion";
}>;

/** Only animation data and the summary cross the Worker boundary. */
export type AnalyzedExperimentTrajectory = Pick<ExperimentTrajectory, "duration" | "samples" | "bounds"> & {
  periodicity: PeriodicityResult;
};

export type ReturnErrors = Pick<PeriodicityResult, "positionError" | "velocityError" | "combinedError">;
export type CharacteristicScales = Readonly<{ position: number; velocity: number }>;

/**
 * L = RMS of the three initial pair separations (independent of origin).
 * V = max(initial internal RMS speed, sqrt(G * total mass / L)). The gravity
 * scale stays positive for initially stationary bodies; bulk drift cannot
 * inflate either denominator. No recentering, rotation or body permutation is
 * applied to the comparison itself: every labelled body must return in place.
 */
export function characteristicScales(initial: ExperimentState, physics: GravityParameters): CharacteristicScales {
  const distances = [[0, 4], [0, 8], [4, 8]].map(([a, b]) =>
    Math.hypot(initial[a] - initial[b], initial[a + 1] - initial[b + 1]),
  );
  const position = Math.hypot(...distances) / Math.sqrt(3);
  const totalMass = physics.masses.reduce((sum, mass) => sum + mass, 0);
  let cx = 0;
  let cy = 0;
  for (let body = 0; body < 3; body++) {
    cx += initial[4 * body + 2] * (physics.masses[body] / totalMass);
    cy += initial[4 * body + 3] * (physics.masses[body] / totalMass);
  }
  const internalSpeeds = [0, 4, 8].map((offset) =>
    Math.hypot(initial[offset + 2] - cx, initial[offset + 3] - cy),
  );
  const velocity = Math.max(
    Math.hypot(...internalSpeeds) / Math.sqrt(3),
    Math.sqrt(physics.G * (totalMass / position)),
  );
  if (![position, velocity, totalMass].every((value) => Number.isFinite(value) && value > 0)) {
    throw new RangeError("Las escalas del sistema no se pueden representar con seguridad.");
  }
  return { position, velocity };
}

function returnErrors(initial: ExperimentState, state: ExperimentState, scales: CharacteristicScales): ReturnErrors {
  let positionError = 0;
  let velocityError = 0;
  for (const offset of [0, 4, 8]) {
    positionError = Math.max(positionError, Math.hypot(
      state[offset] - initial[offset], state[offset + 1] - initial[offset + 1],
    ) / scales.position);
    velocityError = Math.max(velocityError, Math.hypot(
      state[offset + 2] - initial[offset + 2], state[offset + 3] - initial[offset + 3],
    ) / scales.velocity);
  }
  const combinedError = Math.max(positionError, velocityError);
  if (!Number.isFinite(combinedError)) {
    throw new RangeError("El error de retorno no se puede representar con seguridad.");
  }
  return { positionError, velocityError, combinedError };
}

/** Measure a labelled full-state return using fixed, positive initial scales. */
export function measureReturnErrors(
  initial: ExperimentState,
  state: ExperimentState,
  physics: GravityParameters,
): ReturnErrors {
  validateGravityParameters(physics);
  validateExperimentState(initial);
  validateExperimentState(state);
  return returnErrors(initial, state, characteristicScales(initial, physics));
}

/** Signed full-state residuals for local least-squares optimization. */
export function measureReturnResiduals(
  initial: ExperimentState,
  state: ExperimentState,
  physics: GravityParameters,
): readonly number[] {
  validateGravityParameters(physics);
  validateExperimentState(initial);
  validateExperimentState(state);
  const scales = characteristicScales(initial, physics);
  const residuals = state.map((value, index) =>
    (value - initial[index]) / (index % 4 < 2 ? scales.position : scales.velocity),
  );
  if (!residuals.every(Number.isFinite)) throw new RangeError("Invalid return residuals.");
  return residuals;
}

/**
 * Pure, deterministic analysis of a finite Newtonian trajectory. Errors are
 * dimensionless maxima across all three bodies, not an integration error bound.
 * A detection is evidence of ONE approximate return, never indefinite repetition
 * or a proof of the fundamental period. A short/poorly resolved interval can
 * miss a return. Accepted RK4 steps, rather than animation samples, locate local
 * minima; golden-section refinement reintegrates from the left checkpoint with
 * the existing adaptive RK4 and its encounter/step limits. No extrapolation.
 * Refinement has a shared 150,000-attempt budget and at most 40 iterations/minimum.
 */
export function detectPeriodicity(
  trajectory: Pick<ExperimentTrajectory, "duration" | "stateSamples">,
  physics: GravityParameters,
  control: SimulationControl = {},
): PeriodicityResult {
  validateGravityParameters(physics);
  const { duration, stateSamples } = trajectory;
  if (
    !Number.isFinite(duration) || duration <= 0 || duration > 100 ||
    stateSamples.length < 2 || stateSamples.length > 150_001 ||
    stateSamples[0].time !== 0 || stateSamples[stateSamples.length - 1].time !== duration
  ) {
    throw new RangeError("La trayectoria no contiene un intervalo de análisis válido.");
  }
  for (let index = 0; index < stateSamples.length; index++) {
    if (control.shouldStop?.()) throw new SimulationStoppedError();
    const sample = stateSamples[index];
    if (!Number.isFinite(sample.time) || (index > 0 && sample.time <= stateSamples[index - 1].time)) {
      throw new RangeError("Los instantes de análisis deben ser finitos y crecientes.");
    }
    validateExperimentState(sample.state);
  }

  const initial = stateSamples[0].state;
  const scales = characteristicScales(initial, physics);
  const errors = stateSamples.map(({ state }) => returnErrors(initial, state, scales));
  let best = { time: duration, ...errors[errors.length - 1] };
  let departureIndex: number | null = null;
  let remainingAttempts = MAX_REFINEMENT_ATTEMPTS;

  const result = (detected: boolean): PeriodicityResult => ({
    detected,
    estimatedPeriod: detected ? best.time : null,
    positionError: best.positionError,
    velocityError: best.velocityError,
    combinedError: best.combinedError,
    tolerance: PERIODICITY_TOLERANCE,
    evaluatedTime: best.time,
    reason: detected ? "approximateReturn" : departureIndex === null ? "insufficientMotion" : "noReturn",
  });

  for (let index = 1; index < stateSamples.length; index++) {
    if (departureIndex === null) {
      if (errors[index].positionError >= MINIMUM_PERIODICITY_EXCURSION) {
        departureIndex = index;
        best = { time: stateSamples[index].time, ...errors[index] };
      }
      continue;
    }
    if (errors[index].combinedError < best.combinedError) {
      best = { time: stateSamples[index].time, ...errors[index] };
    }
    const last = index === stateSamples.length - 1;
    if (
      errors[index].combinedError > errors[index - 1].combinedError ||
      (!last && errors[index].combinedError > errors[index + 1].combinedError)
    ) continue;

    const start = stateSamples[index - 1];
    let left = start.time;
    let right = stateSamples[last ? index : index + 1].time;
    const evaluate = (time: number) => {
      const refined = refineExperimentState(start, time, duration, physics, remainingAttempts, control);
      remainingAttempts -= refined.attempts;
      const candidate = { time, ...returnErrors(initial, refined.sample.state, scales) };
      if (candidate.combinedError < best.combinedError) best = candidate;
      return candidate;
    };
    // Include the endpoint using the same reintegration as interior evaluations.
    evaluate(stateSamples[index].time);
    const ratio = (Math.sqrt(5) - 1) / 2;
    let a = evaluate(right - ratio * (right - left));
    let b = evaluate(left + ratio * (right - left));
    for (let iteration = 0; iteration < 40 && right - left > duration * 1e-10; iteration++) {
      if (a.combinedError <= b.combinedError) {
        right = b.time;
        b = a;
        a = evaluate(right - ratio * (right - left));
      } else {
        left = a.time;
        a = b;
        b = evaluate(left + ratio * (right - left));
      }
    }
    if (best.combinedError <= PERIODICITY_TOLERANCE) return result(true);
  }
  return result(false);
}
