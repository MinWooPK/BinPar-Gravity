import {
  validateGravityParameters,
  type GravityParameters,
} from "../newtonian-physics";

import type {
  ExperimentConfiguration,
  ExperimentTrajectory,
  ExperimentStateSample,
} from "./experiment.types";

import { positions, validateExperimentState } from "./experiment-state";
import { createIntegrator, MAX_ATTEMPTS } from "./adaptive-integrator";

// Simula tres cuerpos mediante RK4 adaptativo.
export function simulateExperiment(
  config: ExperimentConfiguration,
  sampleCount = 601,
): ExperimentTrajectory {
  const { bodies, gravity: G, duration } = config;

  // Comprueba los cuerpos, la duración y las muestras.
  if (!Array.isArray(bodies) || bodies.length !== 3) {
    throw new RangeError("La simulación necesita exactamente tres cuerpos.");
  }

  if (!Number.isFinite(duration) || duration <= 0 || duration > 100) {
    throw new RangeError(
      "La duración debe ser mayor que 0 y no superar 100 unidades de tiempo.",
    );
  }

  if (!Number.isInteger(sampleCount) || sampleCount < 2 || sampleCount > 2000) {
    throw new RangeError("El número de muestras debe estar entre 2 y 2000.");
  }

  // Prepara los parámetros físicos.
  const physics: GravityParameters = {
    G,
    masses: [bodies[0].mass, bodies[1].mass, bodies[2].mass],
  };

  validateGravityParameters(physics);

  // Prepara y valida el estado inicial.
  const initial = bodies.flatMap(({ x, y, vx, vy }) => [x, y, vx, vy]);

  validateExperimentState(initial);

  // Guarda las posiciones y los estados físicos.
  const samples = [positions(initial)];

  const stateSamples: ExperimentStateSample[] = [{ time: 0, state: initial }];

  const sampleInterval = duration / (sampleCount - 1);

  // Crea el integrador RK4 adaptativo.
  const integrator = createIntegrator(
    stateSamples[0],
    duration,
    physics,
    Math.min(sampleInterval, duration / 500),
    MAX_ATTEMPTS,
    (sample) => stateSamples.push(sample),
  );

  // Calcula las muestras de la trayectoria.
  for (let index = 1; index < sampleCount; index++) {
    const target =
      index === sampleCount - 1 ? duration : index * sampleInterval;

    samples.push(positions(integrator.advance(target).state));
  }

  // Busca los límites de la trayectoria.
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

  // Calcula el centro de la trayectoria.
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  // Calcula el radio necesario para visualizarla.
  const radius = Math.max(
    1e-9,
    ...samples.flatMap((sample) => [
      Math.hypot(sample[0] - cx, sample[1] - cy),
      Math.hypot(sample[2] - cx, sample[3] - cy),
      Math.hypot(sample[4] - cx, sample[5] - cy),
    ]),
  );

  return {
    duration,
    samples,
    stateSamples,
    bounds: { cx, cy, radius },
  };
}
