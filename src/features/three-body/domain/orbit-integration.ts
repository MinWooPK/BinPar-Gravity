import type { OrbitData, OrbitDefinition } from "../types/orbit.types";

// All three masses and G are 1 in the catalogue's dimensionless units.
const DIMENSIONS = 12;
const RELATIVE_TOLERANCE = 2e-12;
const ABSOLUTE_TOLERANCE = 2e-13;
const MAX_ATTEMPTS = 100_000;
const MAX_SAMPLES = 20_000;

function derivative(state: readonly number[]): number[] {
  const result = new Array<number>(DIMENSIONS).fill(0);
  for (let body = 0; body < 3; body++) {
    const index = body * 4;
    result[index] = state[index + 2];
    result[index + 1] = state[index + 3];
  }
  for (let first = 0; first < 3; first++) {
    for (let second = first + 1; second < 3; second++) {
      const a = first * 4;
      const b = second * 4;
      const dx = state[b] - state[a];
      const dy = state[b + 1] - state[a + 1];
      const squaredDistance = dx * dx + dy * dy;
      if (!Number.isFinite(squaredDistance) || squaredDistance <= 1e-24) {
        throw new RangeError("The Newtonian point-mass state is singular.");
      }
      const inverseCube = 1 / (squaredDistance * Math.sqrt(squaredDistance));
      const ax = dx * inverseCube;
      const ay = dy * inverseCube;
      result[a + 2] += ax;
      result[a + 3] += ay;
      result[b + 2] -= ax;
      result[b + 3] -= ay;
    }
  }
  return result;
}

function rk4(state: readonly number[], step: number): number[] {
  const k1 = derivative(state);
  const k2 = derivative(
    state.map((value, index) => value + (step * k1[index]) / 2),
  );
  const k3 = derivative(
    state.map((value, index) => value + (step * k2[index]) / 2),
  );
  const k4 = derivative(state.map((value, index) => value + step * k3[index]));
  return state.map(
    (value, index) =>
      value +
      (step * (k1[index] + 2 * k2[index] + 2 * k3[index] + k4[index])) / 6,
  );
}

function invariants(state: readonly number[]) {
  let energy = 0;
  let px = 0;
  let py = 0;
  let angularMomentum = 0;
  let cx = 0;
  let cy = 0;
  let minSeparation = Infinity;
  for (let body = 0; body < 3; body++) {
    const [x, y, vx, vy] = state.slice(body * 4, body * 4 + 4);
    energy += (vx * vx + vy * vy) / 2;
    px += vx;
    py += vy;
    angularMomentum += x * vy - y * vx;
    cx += x / 3;
    cy += y / 3;
    for (let other = body + 1; other < 3; other++) {
      const distance = Math.hypot(
        x - state[other * 4],
        y - state[other * 4 + 1],
      );
      if (!Number.isFinite(distance) || distance <= 1e-12) {
        throw new RangeError(
          "The orbit contains a collision or an unrepresentable separation.",
        );
      }
      energy -= 1 / distance;
      minSeparation = Math.min(minSeparation, distance);
    }
  }
  if (![energy, px, py, angularMomentum, cx, cy].every(Number.isFinite)) {
    throw new RangeError("The orbit's physical quantities must remain finite.");
  }
  return { energy, px, py, angularMomentum, cx, cy, minSeparation };
}

function positions(state: readonly number[]): number[] {
  return [state[0], state[1], state[4], state[5], state[8], state[9]];
}

/**
 * Integrate one physical period with adaptive RK4 step doubling and Richardson
 * correction, without softening or changing the supplied initial conditions.
 * Samples include t=0 and t=T and are uniformly spaced in physical time, rather
 * than distance along the curve. No endpoint is replaced to force a closed loop.
 * Energy drift is relative to |E(0)| (or epsilon for zero energy); angular drift
 * is absolute. Other extrema are observed at accepted steps, not guaranteed
 * continuous-time extrema. Closure values are RMS differences from the seed.
 */
export const integrateOrbit = (orbit: OrbitDefinition, sampleCount = 1200): OrbitData => {
  if (!Number.isFinite(orbit.period) || orbit.period <= 0) {
    throw new RangeError("The period must be a positive finite number.");
  }
  if (
    !Number.isInteger(sampleCount) ||
    sampleCount < 2 ||
    sampleCount > MAX_SAMPLES
  ) {
    throw new RangeError(
      `The sample count must be an integer between 2 and ${MAX_SAMPLES}.`,
    );
  }
  if (
    !Array.isArray(orbit.initial) ||
    orbit.initial.length !== 3 ||
    orbit.initial.some(
      (body) =>
        !Array.isArray(body) ||
        body.length !== 4 ||
        !body.every(Number.isFinite),
    )
  ) {
    throw new RangeError("An orbit needs three finite [x, y, vx, vy] states.");
  }
  const initial = orbit.initial.flat();
  let state = initial.slice();
  const reference = invariants(initial);
  const diagnostics: OrbitData["diagnostics"] = {
    closure: 0,
    positionClosure: 0,
    maxEnergyDrift: 0,
    maxMomentum: Math.hypot(reference.px, reference.py),
    maxAngularDrift: 0,
    maxCenterOfMass: Math.hypot(reference.cx, reference.cy),
    minSeparation: reference.minSeparation,
    acceptedSteps: 0,
    rejectedSteps: 0,
  };
  const observe = (accepted: readonly number[]) => {
    const current = invariants(accepted);
    diagnostics.maxEnergyDrift = Math.max(
      diagnostics.maxEnergyDrift,
      Math.abs(current.energy - reference.energy) /
        Math.max(Math.abs(reference.energy), Number.EPSILON),
    );
    diagnostics.maxMomentum = Math.max(
      diagnostics.maxMomentum,
      Math.hypot(current.px, current.py),
    );
    diagnostics.maxAngularDrift = Math.max(
      diagnostics.maxAngularDrift,
      Math.abs(current.angularMomentum - reference.angularMomentum),
    );
    diagnostics.maxCenterOfMass = Math.max(
      diagnostics.maxCenterOfMass,
      Math.hypot(current.cx, current.cy),
    );
    diagnostics.minSeparation = Math.min(
      diagnostics.minSeparation,
      current.minSeparation,
    );
  };
  const samples = [positions(initial)];
  const interval = orbit.period / (sampleCount - 1);
  const minimumStep = Math.max(orbit.period * 1e-14, Number.MIN_VALUE);
  const maximumStep = orbit.period / 40;
  let step = Math.min(interval, orbit.period / 400);
  let time = 0;
  let attempts = 0;

  for (let sample = 1; sample < sampleCount; sample++) {
    const target =
      sample === sampleCount - 1 ? orbit.period : sample * interval;
    while (time < target) {
      if (++attempts > MAX_ATTEMPTS) {
        throw new RangeError("The orbit exceeded the integration step limit.");
      }
      const h = Math.min(step, target - time, maximumStep);
      if (
        time + h === time ||
        (h < minimumStep && target - time > minimumStep)
      ) {
        throw new RangeError(
          "The orbit needs a step below the supported numerical resolution.",
        );
      }
      const full = rk4(state, h);
      const firstHalf = rk4(state, h / 2);
      const twoHalves = rk4(firstHalf, h / 2);
      let error = 0;
      const corrected = twoHalves.map((value, index) => {
        const difference = (value - full[index]) / 15;
        const scale =
          ABSOLUTE_TOLERANCE +
          RELATIVE_TOLERANCE *
            Math.max(Math.abs(state[index]), Math.abs(value));
        error = Math.max(error, Math.abs(difference) / scale);
        return value + difference;
      });
      if (!Number.isFinite(error) || !corrected.every(Number.isFinite)) {
        throw new RangeError("The integration produced a non-finite state.");
      }
      if (error <= 1) {
        state = corrected;
        // Assignment at a clipped step prevents accumulated rounding in sample times.
        time = h === target - time ? target : time + h;
        diagnostics.acceptedSteps++;
        observe(state);
      } else {
        diagnostics.rejectedSteps++;
      }
      step =
        h * Math.max(0.2, Math.min(4, error === 0 ? 4 : 0.9 * error ** -0.2));
    }
    samples.push(positions(state));
  }

  diagnostics.closure = Math.sqrt(
    state.reduce(
      (total, value, index) => total + (value - initial[index]) ** 2,
      0,
    ) / DIMENSIONS,
  );
  const firstPositions = samples[0];
  diagnostics.positionClosure = Math.sqrt(
    samples[samples.length - 1].reduce(
      (total, value, index) => total + (value - firstPositions[index]) ** 2,
      0,
    ) / 6,
  );
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const sample of samples) {
    for (let body = 0; body < 3; body++) {
      minX = Math.min(minX, sample[body * 2]);
      maxX = Math.max(maxX, sample[body * 2]);
      minY = Math.min(minY, sample[body * 2 + 1]);
      maxY = Math.max(maxY, sample[body * 2 + 1]);
    }
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  let radius = 0;
  for (const sample of samples) {
    for (let body = 0; body < 3; body++) {
      radius = Math.max(
        radius,
        Math.hypot(sample[body * 2] - cx, sample[body * 2 + 1] - cy),
      );
    }
  }
  return {
    slug: orbit.slug,
    period: orbit.period,
    samples,
    bounds: { cx, cy, radius },
    diagnostics,
  };
};
