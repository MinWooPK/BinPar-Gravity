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

// Simula el movimiento gravitatorio de tres cuerpos durante
// un intervalo de tiempo mediante integración RK4 adaptativa.
export function simulateExperiment(
  config: ExperimentConfiguration,
  sampleCount = 601,
): ExperimentTrajectory {
  // Obtiene los cuerpos, la constante gravitatoria y la duración.
  const { bodies, gravity: G, duration } = config;

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

  // Prepara los parámetros físicos utilizados por el motor Newtoniano.
  const physics: GravityParameters = {
    G,
    masses: [bodies[0].mass, bodies[1].mass, bodies[2].mass],
  };

  validateGravityParameters(physics);

  // Convierte las condiciones iniciales en el estado físico de 12 componentes.
  const initial = bodies.flatMap(({ x, y, vx, vy }) => [x, y, vx, vy]);

  validateExperimentState(initial);

  // Guarda las posiciones iniciales para representar la trayectoria.
  const samples = [positions(initial)];

  // Guarda los estados físicos aceptados durante la integración.
  const stateSamples: ExperimentStateSample[] = [{ time: 0, state: initial }];

  // Calcula el intervalo temporal entre las muestras visuales.
  const sampleInterval = duration / (sampleCount - 1);

  // Prepara el integrador y registra los estados físicos calculados.
  const integrator = createIntegrator(
    stateSamples[0],
    duration,
    physics,
    Math.min(sampleInterval, duration / 500),
    MAX_ATTEMPTS,
    (sample) => stateSamples.push(sample),
  );

  for (let index = 1; index < sampleCount; index++) {
    // Determina el instante correspondiente a cada muestra visual.
    const target =
      index === sampleCount - 1 ? duration : index * sampleInterval;

    samples.push(positions(integrator.advance(target).state));
  }

  // Inicializa los límites espaciales de la trayectoria.
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const sample of samples) {
    for (let body = 0; body < 3; body++) {
      // Obtiene las coordenadas del cuerpo en la muestra actual.
      const x = sample[body * 2];
      const y = sample[body * 2 + 1];

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }

  // Calcula el centro horizontal de toda la trayectoria.
  const cx = (minX + maxX) / 2;

  // Calcula el centro vertical de toda la trayectoria.
  const cy = (minY + maxY) / 2;

  // Calcula el radio necesario para encajar la trayectoria en una vista SVG.
  const radius = Math.max(
    1e-9,
    ...samples.flatMap((sample) => [
      Math.hypot(sample[0] - cx, sample[1] - cy),
      Math.hypot(sample[2] - cx, sample[3] - cy),
      Math.hypot(sample[4] - cx, sample[5] - cy),
    ]),
  );

  return { duration, samples, stateSamples, bounds: { cx, cy, radius } };
}
