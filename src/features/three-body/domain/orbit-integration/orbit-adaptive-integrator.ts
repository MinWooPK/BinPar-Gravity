import type { OrbitData } from "../../types/orbit.types";
import { CATALOGUE_PHYSICS, rk4Step } from "../newtonian-physics";
import { positions } from "./orbit-trajectory";

// Tolerancias originales del integrador RK4 del catálogo.
const RELATIVE_TOLERANCE = 2e-12;
const ABSOLUTE_TOLERANCE = 2e-13;
const MAX_ATTEMPTS = 100_000;

// Recalcula la trayectoria con paso adaptativo y conserva las muestras físicas.
// No fuerza el cierre de ninguna órbita.
export const integrateOrbitSamples = (
  initial: readonly number[],
  period: number,
  sampleCount: number,
  diagnostics: OrbitData["diagnostics"],
  observe: (accepted: readonly number[]) => void,
) => {
  // Guarda el estado físico que irá evolucionando durante la integración.
  let state = initial.slice();

  // Inicializa las muestras con las posiciones originales.
  const samples = [positions(initial)];

  // Calcula el intervalo de tiempo entre las muestras visuales.
  const interval = period / (sampleCount - 1);

  // Define el paso temporal mínimo permitido.
  const minimumStep = Math.max(period * 1e-14, Number.MIN_VALUE);

  // Define el paso temporal máximo permitido.
  const maximumStep = period / 40;

  // Establece el tamaño inicial del paso de integración.
  let step = Math.min(interval, period / 400);

  // Guarda el tiempo físico transcurrido.
  let time = 0;

  // Cuenta los intentos de integración realizados.
  let attempts = 0;

  for (let sample = 1; sample < sampleCount; sample++) {
    // Determina el instante físico correspondiente a la siguiente muestra.
    const target = sample === sampleCount - 1 ? period : sample * interval;

    while (time < target) {
      if (++attempts > MAX_ATTEMPTS) {
        throw new RangeError("The orbit exceeded the integration step limit.");
      }

      // Calcula el tamaño del paso temporal que se intentará ejecutar.
      const h = Math.min(step, target - time, maximumStep);

      if (
        time + h === time ||
        (h < minimumStep && target - time > minimumStep)
      ) {
        throw new RangeError(
          "The orbit needs a step below the supported numerical resolution.",
        );
      }

      // Calcula una estimación utilizando un paso RK4 completo.
      const full = rk4Step(state, h, CATALOGUE_PHYSICS);

      // Calcula una estimación utilizando la primera mitad del paso.
      const firstHalf = rk4Step(state, h / 2, CATALOGUE_PHYSICS);

      // Calcula otra estimación completando dos medios pasos RK4.
      const twoHalves = rk4Step(firstHalf, h / 2, CATALOGUE_PHYSICS);

      // Almacena el mayor error numérico normalizado.
      let error = 0;

      // Corrige la estimación comparando el paso completo
      // con los dos medios pasos mediante extrapolación de Richardson.
      const corrected = twoHalves.map((value, index) => {
        // Calcula la corrección estimada para cada componente.
        const difference = (value - full[index]) / 15;

        // Calcula el límite de tolerancia para el componente.
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

        // Actualiza el tiempo evitando errores acumulados de redondeo.
        time = h === target - time ? target : time + h;

        diagnostics.acceptedSteps++;
        observe(state);
      } else {
        diagnostics.rejectedSteps++;
      }

      // Ajusta el siguiente paso temporal según el error obtenido.
      step =
        h * Math.max(0.2, Math.min(4, error === 0 ? 4 : 0.9 * error ** -0.2));
    }

    samples.push(positions(state));
  }

  return { samples, state };
};
