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

/** Trayectoria abierta: duration NO implica que el movimiento sea periódico. */
export type ExperimentTrajectory = {
  duration: number;
  samples: number[][]; // [x1, y1, x2, y2, x3, y3] por instante
  bounds: { cx: number; cy: number; radius: number };
};

const MAX_ATTEMPTS = 150_000;
const MIN_DISTANCE = 1e-3; // Corte numérico de seguridad, no radio físico.
const RELATIVE_TOLERANCE = 1e-8;
const ABSOLUTE_TOLERANCE = 1e-9;

const positions = (state: readonly number[]): number[] => [
  state[0], state[1], state[4], state[5], state[8], state[9],
];

function checkSeparation(state: readonly number[]) {
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
  if (!initial.every(Number.isFinite)) {
    throw new RangeError("Las posiciones y velocidades deben ser números finitos.");
  }
  checkSeparation(initial);

  let state = initial;
  let time = 0;
  let attempts = 0;
  const samples = [positions(state)];
  const sampleInterval = duration / (sampleCount - 1);
  const minimumStep = Math.max(duration * 1e-12, Number.MIN_VALUE);
  const maximumStep = duration / 50;
  let step = Math.min(sampleInterval, duration / 500);

  for (let index = 1; index < sampleCount; index++) {
    const target = index === sampleCount - 1 ? duration : index * sampleInterval;

    while (time < target) {
      if (++attempts > MAX_ATTEMPTS) {
        throw new RangeError("El cálculo ha superado el límite de pasos; prueba con otros parámetros.");
      }

      const h = Math.min(step, target - time, maximumStep);
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
        checkSeparation(candidate);
        state = candidate;
        time = h === target - time ? target : time + h;
      }

      step = h * Math.max(0.2, Math.min(4, error === 0 ? 4 : 0.9 * error ** -0.2));
    }

    samples.push(positions(state));
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

  return { duration, samples, bounds: { cx, cy, radius } };
}
