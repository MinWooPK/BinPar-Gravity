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

// Establece el número máximo de intentos permitidos durante la integración.
export const MAX_ATTEMPTS = 150_000;

// Define la tolerancia relativa del error numérico.
const RELATIVE_TOLERANCE = 1e-8;

// Define la tolerancia absoluta del error numérico.
const ABSOLUTE_TOLERANCE = 1e-9;

// Crea un integrador RK4 adaptativo que ajusta el paso temporal
// según el error numérico y las condiciones del sistema.
export function createIntegrator(
  start: ExperimentStateSample,
  duration: number,
  physics: GravityParameters,
  initialStep: number,
  maxAttempts = MAX_ATTEMPTS,
  observe?: (sample: ExperimentStateSample) => void,
) {
  // Guarda el estado físico actual de los tres cuerpos.
  let state: ExperimentState = start.state;

  // Guarda el instante actual de la simulación.
  let time = start.time;

  // Cuenta los intentos realizados por el integrador.
  let attempts = 0;

  // Guarda el tamaño del siguiente paso temporal.
  let step = initialStep;

  // Establece el tamaño mínimo permitido para cada paso.
  const minimumStep = Math.max(duration * 1e-12, Number.MIN_VALUE);

  // Establece el tamaño máximo permitido para cada paso.
  const maximumStep = duration / 50;

  // Avanza la simulación hasta un instante concreto,
  // adaptando el paso según la precisión del cálculo.
  const advance = (target: number): ExperimentStateSample => {
    while (time < target) {
      if (++attempts > maxAttempts) {
        throw new RangeError(
          "El cálculo ha superado el límite de pasos; prueba con otros parámetros.",
        );
      }

      // Calcula el tamaño del paso que se intentará ejecutar.
      const h = Math.min(step, target - time, maximumStep);

      // Comprueba si el paso termina exactamente en el instante solicitado.
      const clippedToTarget = h === target - time;

      if (
        time + h === time ||
        (h < minimumStep && target - time > minimumStep)
      ) {
        throw new RangeError(
          "Los cuerpos se acercan demasiado para continuar con precisión.",
        );
      }

      // Calcula el resultado utilizando un único paso RK4.
      const full = rk4Step(state, h, physics);

      // Calcula la primera mitad del mismo intervalo temporal.
      const firstHalf = rk4Step(state, h / 2, physics);

      // Completa el intervalo utilizando dos medios pasos RK4.
      const twoHalves = rk4Step(firstHalf, h / 2, physics);

      // Guarda el mayor error numérico normalizado del paso.
      let error = 0;

      // Calcula un estado corregido comparando ambos resultados RK4.
      const candidate = twoHalves.map((value, component) => {
        // Estima la corrección numérica del componente.
        const correction = (value - full[component]) / 15;

        // Calcula la escala de tolerancia del componente.
        const scale =
          ABSOLUTE_TOLERANCE +
          RELATIVE_TOLERANCE *
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

      // Ajusta el siguiente paso según el error, evitando que
      // un pequeño resto de redondeo provoque un rechazo incorrecto.
      if (!(clippedToTarget && h < minimumStep)) {
        step =
          h * Math.max(0.2, Math.min(4, error === 0 ? 4 : 0.9 * error ** -0.2));
      }
    }

    return { time, state };
  };

  return { advance, attempts: () => attempts };
}

// Recalcula el estado físico desde una muestra real hasta un instante
// determinado, utilizando el mismo integrador RK4 adaptativo.
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

  // Crea un integrador para recalcular el intervalo solicitado.
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
