import {
  rk4Step,
  validateGravityParameters,
  type GravityParameters,
} from "../newtonian-physics";

import type {
  ExperimentState,
  ExperimentStateSample,
} from "./experiment.types";

import { validateExperimentState } from "./experiment-state";

// Límite de intentos de integración.
export const MAX_ATTEMPTS = 150_000;

// Tolerancias del cálculo.
const RELATIVE_TOLERANCE = 1e-8;
const ABSOLUTE_TOLERANCE = 1e-9;

// Crea un integrador RK4 con paso adaptativo.
export function createIntegrator(
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

  // Límites del paso temporal.
  const minimumStep = Math.max(duration * 1e-12, Number.MIN_VALUE);
  const maximumStep = duration / 50;

  // Avanza la simulación hasta el tiempo indicado.
  const advance = (target: number): ExperimentStateSample => {
    while (time < target) {
      if (++attempts > maxAttempts) {
        throw new RangeError(
          "El cálculo ha superado el límite de pasos; prueba con otros parámetros.",
        );
      }

      // Calcula el siguiente paso.
      const h = Math.min(step, target - time, maximumStep);
      const clippedToTarget = h === target - time;

      if (
        time + h === time ||
        (h < minimumStep && target - time > minimumStep)
      ) {
        throw new RangeError(
          "Los cuerpos se acercan demasiado para continuar con precisión.",
        );
      }

      // Compara un paso completo con dos medios pasos RK4.
      const full = rk4Step(state, h, physics);
      const firstHalf = rk4Step(state, h / 2, physics);
      const twoHalves = rk4Step(firstHalf, h / 2, physics);

      let error = 0;

      // Corrige el resultado y calcula el error.
      const candidate = twoHalves.map((value, component) => {
        const correction = (value - full[component]) / 15;

        const scale =
          ABSOLUTE_TOLERANCE +
          RELATIVE_TOLERANCE *
            Math.max(Math.abs(state[component]), Math.abs(value));

        error = Math.max(error, Math.abs(correction) / scale);

        return value + correction;
      });

      // Evita resultados numéricos inválidos.
      if (!Number.isFinite(error) || !candidate.every(Number.isFinite)) {
        throw new RangeError("El cálculo produjo valores no finitos.");
      }

      // Acepta el paso si el error está dentro de la tolerancia.
      if (error <= 1) {
        validateExperimentState(candidate);

        state = candidate;
        time = h === target - time ? target : time + h;

        observe?.({ time, state });
      }

      // Ajusta el siguiente paso según el error.
      if (!(clippedToTarget && h < minimumStep)) {
        step =
          h * Math.max(0.2, Math.min(4, error === 0 ? 4 : 0.9 * error ** -0.2));
      }
    }

    return { time, state };
  };

  return { advance, attempts: () => attempts };
}

// Recalcula el estado físico hasta un instante concreto.
export function refineExperimentState(
  start: ExperimentStateSample,
  target: number,
  duration: number,
  physics: GravityParameters,
  maxAttempts = MAX_ATTEMPTS,
): { sample: ExperimentStateSample; attempts: number } {
  validateGravityParameters(physics);
  validateExperimentState(start.state);

  // Comprueba los límites del intervalo.
  if (
    !Number.isFinite(duration) ||
    duration <= 0 ||
    duration > 100 ||
    !Number.isFinite(start.time) ||
    start.time < 0 ||
    !Number.isFinite(target) ||
    target < start.time ||
    target > duration ||
    !Number.isInteger(maxAttempts) ||
    maxAttempts < 1 ||
    maxAttempts > MAX_ATTEMPTS
  ) {
    throw new RangeError("El intervalo de refinamiento no es válido.");
  }

  // Recalcula el intervalo con RK4 adaptativo.
  const integrator = createIntegrator(
    start,
    duration,
    physics,
    (target - start.time) / 4,
    maxAttempts,
  );

  return {
    sample: integrator.advance(target),
    attempts: integrator.attempts(),
  };
}
