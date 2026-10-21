import type { OrbitData, OrbitDefinition } from "../../types/orbit.types";
import { integrateOrbitSamples } from "./orbit-adaptive-integrator";
import {
  createOrbitDiagnostics,
  finishOrbitDiagnostics,
} from "./orbit-invariants";
import { orbitBounds } from "./orbit-trajectory";

// Conserva el límite original de muestras de las órbitas del catálogo.
const MAX_SAMPLES = 20_000;

// Calcula una órbita completa y sus indicadores de precisión.
export const integrateOrbit = (
  orbit: OrbitDefinition,
  sampleCount = 1200,
): OrbitData => {
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

  // Convierte las condiciones iniciales en un array de 12 componentes.
  const initial = orbit.initial.flat();

  // Crea los diagnósticos físicos y su observador de pasos aceptados.
  const { diagnostics, observe } = createOrbitDiagnostics(initial);

  // Integra los estados hasta cada tiempo de muestreo solicitado.
  const { samples, state } = integrateOrbitSamples(
    initial,
    orbit.period,
    sampleCount,
    diagnostics,
    observe,
  );

  // Determina el error de cierre real, sin cerrar artificialmente la órbita.
  finishOrbitDiagnostics(diagnostics, initial, state, samples);

  // Calcula el encuadre espacial a partir de todas las posiciones.
  const bounds = orbitBounds(samples);

  return {
    slug: orbit.slug,
    period: orbit.period,
    samples,
    bounds,
    diagnostics,
  };
};
