import {
  rk4Step,
  validateGravityParameters,
  type GravityParameters,
} from "./newtonian-physics";

/** Cada cuerpo tiene su masa y su estado inicial en dos dimensiones. */
export type ExperimentBody = Readonly<{
  mass: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}>;

export type ExperimentConfiguration = Readonly<{
  gravity: number;
  duration: number;
  bodies: readonly ExperimentBody[];
}>;

/** Estado completo, en el mismo orden [x, y, vx, vy] que el motor Newton/RK4. */
export type ExperimentState = readonly [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
];

export type ExperimentStateSample = Readonly<{
  time: number;
  state: ExperimentState;
}>;

/** Trayectoria abierta: duration NO implica que el movimiento sea periódico. */
export type ExperimentTrajectory = {
  duration: number;
  samples: number[][]; // [x1, y1, x2, y2, x3, y3] por instante
  // Pasos aceptados del integrador: evita aliasing al analizar muestras visuales escasas.
  stateSamples: ExperimentStateSample[];
  bounds: { cx: number; cy: number; radius: number };
};

const MAX_ATTEMPTS = 150_000;
const MIN_DISTANCE = 1e-3; // Corte numérico de seguridad, no radio físico.
const RELATIVE_TOLERANCE = 1e-8;
const ABSOLUTE_TOLERANCE = 1e-9;

const positions = (state: readonly number[]): number[] => [
  state[0], state[1], state[4], state[5], state[8], state[9],
];

export function validateExperimentState(state: readonly number[]): asserts state is ExperimentState {
  if (state.length !== 12 || !state.every(Number.isFinite)) {
    throw new RangeError("Las posiciones y velocidades deben ser números finitos.");
  }
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      const a = 4 * i;
      const b = 4 * j;
      if (Math.hypot(state[a] - state[b], state[a + 1] - state[b + 1]) < MIN_DISTANCE) {
        throw new RangeError("Los cuerpos se han acercado demasiado para calcular la trayectoria con seguridad.");
      }
    }
  }
}

/** Comparte el RK4 adaptativo y sus protecciones entre simulación y refinamiento. */
function createIntegrator(
  start: ExperimentStateSample,
  duration: number,
  physics: GravityParameters,
  initialStep: number,
  maxAttempts = MAX_ATTEMPTS,
  observe?: (sample: ExperimentStateSample) => void,
) {
  let state: ExperimentState = start.state;
  let time = start.time;
  let attempts = 0;
  let step = initialStep;
  const minimumStep = Math.max(duration * 1e-12, Number.MIN_VALUE);
  const maximumStep = duration / 50;

  const advance = (target: number): ExperimentStateSample => {
    while (time < target) {
      if (++attempts > maxAttempts) {
        throw new RangeError("El cálculo ha superado el límite de pasos; prueba con otros parámetros.");
      }

      const h = Math.min(step, target - time, maximumStep);
      const clippedToTarget = h === target - time;
      if (time + h === time || (h < minimumStep && target - time > minimumStep)) {
        throw new RangeError("Los cuerpos se acercan demasiado para continuar con precisión.");
      }

      const full = rk4Step(state, h, physics);
      const firstHalf = rk4Step(state, h / 2, physics);
      const twoHalves = rk4Step(firstHalf, h / 2, physics);

      let error = 0;
      const candidate = twoHalves.map((value, component) => {
        const correction = (value - full[component]) / 15;
        const scale = ABSOLUTE_TOLERANCE + RELATIVE_TOLERANCE *
          Math.max(Math.abs(state[component]), Math.abs(value));
        error = Math.max(error, Math.abs(correction) / scale);
        return value + correction;
      });

      if (!Number.isFinite(error) || !candidate.every(Number.isFinite)) {
        throw new RangeError("El cálculo produjo valores no finitos.");
      }

      if (error <= 1) {
        validateExperimentState(candidate);
        state = candidate;
        time = h === target - time ? target : time + h;
        observe?.({ time, state });
      }

      // A sub-minimum endpoint remainder is only roundoff, not a new adaptive
      // step proposal. Keeping it would falsely reject the next sample interval.
      if (!(clippedToTarget && h < minimumStep)) {
        step = h * Math.max(0.2, Math.min(4, error === 0 ? 4 : 0.9 * error ** -0.2));
      }
    }
    return { time, state };
  };
  return { advance, attempts: () => attempts };
}

/** Reintegra desde un paso real, nunca interpola estados para fabricar un retorno. */
export function refineExperimentState(
  start: ExperimentStateSample,
  target: number,
  duration: number,
  physics: GravityParameters,
  maxAttempts = MAX_ATTEMPTS,
): { sample: ExperimentStateSample; attempts: number } {
  validateGravityParameters(physics);
  validateExperimentState(start.state);
  if (
    !Number.isFinite(duration) || duration <= 0 || duration > 100 ||
    !Number.isFinite(start.time) || start.time < 0 ||
    !Number.isFinite(target) || target < start.time || target > duration ||
    !Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > MAX_ATTEMPTS
  ) {
    throw new RangeError("El intervalo de refinamiento no es válido.");
  }
  const integrator = createIntegrator(start, duration, physics, (target - start.time) / 4, maxAttempts);
  return { sample: integrator.advance(target), attempts: integrator.attempts() };
}

/** Integra un intervalo libre con RK4 adaptativo, sin cerrar ni repetir la órbita. */
export function simulateExperiment(
  config: ExperimentConfiguration,
  sampleCount = 601,
): ExperimentTrajectory {
  const { bodies, gravity: G, duration } = config;

  if (!Array.isArray(bodies) || bodies.length !== 3) {
    throw new RangeError("La simulación necesita exactamente tres cuerpos.");
  }
  if (!Number.isFinite(duration) || duration <= 0 || duration > 100) {
    throw new RangeError("La duración debe ser mayor que 0 y no superar 100 unidades de tiempo.");
  }
  if (!Number.isInteger(sampleCount) || sampleCount < 2 || sampleCount > 2000) {
    throw new RangeError("El número de muestras debe estar entre 2 y 2000.");
  }
  const physics: GravityParameters = {
    G,
    masses: [bodies[0].mass, bodies[1].mass, bodies[2].mass],
  };
  validateGravityParameters(physics);

  const initial = bodies.flatMap(({ x, y, vx, vy }) => [x, y, vx, vy]);
  validateExperimentState(initial);

  const samples = [positions(initial)];
  const stateSamples: ExperimentStateSample[] = [{ time: 0, state: initial }];
  const sampleInterval = duration / (sampleCount - 1);
  const integrator = createIntegrator(
    stateSamples[0], duration, physics, Math.min(sampleInterval, duration / 500),
    MAX_ATTEMPTS, (sample) => stateSamples.push(sample),
  );

  for (let index = 1; index < sampleCount; index++) {
    const target = index === sampleCount - 1 ? duration : index * sampleInterval;

    samples.push(positions(integrator.advance(target).state));
  }

  // Encaje de la trayectoria en una futura vista SVG.
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const sample of samples) {
    for (let body = 0; body < 3; body++) {
      const x = sample[body * 2];
      const y = sample[body * 2 + 1];
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const radius = Math.max(1e-9, ...samples.flatMap((sample) => [
    Math.hypot(sample[0] - cx, sample[1] - cy),
    Math.hypot(sample[2] - cx, sample[3] - cy),
    Math.hypot(sample[4] - cx, sample[5] - cy),
  ]));

  return { duration, samples, stateSamples, bounds: { cx, cy, radius } };
}
