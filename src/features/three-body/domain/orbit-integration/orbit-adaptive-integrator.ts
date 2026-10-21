import type { OrbitData } from "../../types/orbit.types";
import { CATALOGUE_PHYSICS, rk4Step } from "../newtonian-physics";
import { positions } from "./orbit-trajectory";

// Tolerancias y límite de integración.
const RELATIVE_TOLERANCE = 2e-12;
const ABSOLUTE_TOLERANCE = 2e-13;
const MAX_ATTEMPTS = 100_000;

// Calcula la órbita mediante RK4 adaptativo sin forzar su cierre.
export const integrateOrbitSamples = (
  initial: readonly number[],
  period: number,
  sampleCount: number,
  diagnostics: OrbitData["diagnostics"],
  observe: (accepted: readonly number[]) => void,
) => {
  let state = initial.slice();
  const samples = [positions(initial)];

  // Configura los pasos temporales.
  const interval = period / (sampleCount - 1);
  const minimumStep = Math.max(period * 1e-14, Number.MIN_VALUE);
  const maximumStep = period / 40;

  let step = Math.min(interval, period / 400);
  let time = 0;
  let attempts = 0;

  // Calcula cada muestra de la trayectoria.
  for (let sample = 1; sample < sampleCount; sample++) {
    const target = sample === sampleCount - 1 ? period : sample * interval;

    while (time < target) {
      if (++attempts > MAX_ATTEMPTS) {
        throw new RangeError(
          "La órbita ha superado el límite de pasos de integración.",
        );
      }

      // Calcula el siguiente paso temporal.
      const h = Math.min(step, target - time, maximumStep);

      if (
        time + h === time ||
        (h < minimumStep && target - time > minimumStep)
      ) {
        throw new RangeError(
          "La órbita necesita un paso temporal inferior a la precisión numérica permitida.",
        );
      }

      // Compara un paso completo con dos medios pasos RK4.
      const full = rk4Step(state, h, CATALOGUE_PHYSICS);
      const firstHalf = rk4Step(state, h / 2, CATALOGUE_PHYSICS);
      const twoHalves = rk4Step(firstHalf, h / 2, CATALOGUE_PHYSICS);

      let error = 0;

      // Corrige el resultado y calcula el error numérico.
      const corrected = twoHalves.map((value, index) => {
        const difference = (value - full[index]) / 15;

        const scale =
          ABSOLUTE_TOLERANCE +
          RELATIVE_TOLERANCE *
            Math.max(Math.abs(state[index]), Math.abs(value));

        error = Math.max(error, Math.abs(difference) / scale);

        return value + difference;
      });

      // Comprueba que los resultados sean finitos.
      if (!Number.isFinite(error) || !corrected.every(Number.isFinite)) {
        throw new RangeError(
          "La integración ha producido valores numéricos no finitos.",
        );
      }

      // Acepta o rechaza el paso según su error.
      if (error <= 1) {
        state = corrected;

        time = h === target - time ? target : time + h;

        diagnostics.acceptedSteps++;
        observe(state);
      } else {
        diagnostics.rejectedSteps++;
      }

      // Ajusta el tamaño del siguiente paso.
      step =
        h * Math.max(0.2, Math.min(4, error === 0 ? 4 : 0.9 * error ** -0.2));
    }

    samples.push(positions(state));
  }

  return { samples, state };
};
