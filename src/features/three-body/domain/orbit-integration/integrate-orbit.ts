import type { OrbitData, OrbitDefinition } from "../../types/orbit.types";
import { integrateOrbitSamples } from "./orbit-adaptive-integrator";
import {
  createOrbitDiagnostics,
  finishOrbitDiagnostics,
} from "./orbit-invariants";
import { orbitBounds } from "./orbit-trajectory";

// Número máximo de muestras permitidas.
const MAX_SAMPLES = 20_000;

// Calcula una órbita y sus indicadores de precisión.
export const integrateOrbit = (
  orbit: OrbitDefinition,
  sampleCount = 1200,
): OrbitData => {
  // Valida el período de la órbita.
  if (!Number.isFinite(orbit.period) || orbit.period <= 0) {
    throw new RangeError("El período debe ser un número positivo y finito.");
  }

  // Comprueba el número de muestras.
  if (
    !Number.isInteger(sampleCount) ||
    sampleCount < 2 ||
    sampleCount > MAX_SAMPLES
  ) {
    throw new RangeError(
      `El número de muestras debe ser un entero entre 2 y ${MAX_SAMPLES}.`,
    );
  }

  // Valida las posiciones y velocidades iniciales.
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
    throw new RangeError(
      "La órbita necesita tres cuerpos con posiciones y velocidades válidas [x, y, vx, vy].",
    );
  }

  // Prepara los 12 valores del estado inicial.
  const initial = orbit.initial.flat();

  // Prepara los indicadores físicos.
  const { diagnostics, observe } = createOrbitDiagnostics(initial);

  // Calcula las muestras de la órbita.
  const { samples, state } = integrateOrbitSamples(
    initial,
    orbit.period,
    sampleCount,
    diagnostics,
    observe,
  );

  // Calcula el error de cierre real.
  finishOrbitDiagnostics(diagnostics, initial, state, samples);

  // Calcula los límites para visualizar la órbita.
  const bounds = orbitBounds(samples);

  return {
    slug: orbit.slug,
    period: orbit.period,
    samples,
    bounds,
    diagnostics,
  };
};
