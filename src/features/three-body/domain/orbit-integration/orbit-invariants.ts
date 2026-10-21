import type { OrbitData } from "../../types/orbit.types";

// Calcula las magnitudes físicas del sistema para comprobar
// la estabilidad y precisión de la integración.
function invariants(state: readonly number[]) {
  // Acumula la energía mecánica total del sistema.
  let energy = 0;

  // Acumula el momento lineal en el eje X.
  let px = 0;

  // Acumula el momento lineal en el eje Y.
  let py = 0;

  // Acumula el momento angular del sistema.
  let angularMomentum = 0;

  // Acumula la coordenada X del centro de masas.
  let cx = 0;

  // Acumula la coordenada Y del centro de masas.
  let cy = 0;

  // Guarda la menor distancia encontrada entre dos cuerpos.
  let minSeparation = Infinity;

  for (let body = 0; body < 3; body++) {
    // Obtiene la posición y velocidad del cuerpo actual.
    const [x, y, vx, vy] = state.slice(body * 4, body * 4 + 4);

    energy += (vx * vx + vy * vy) / 2;
    px += vx;
    py += vy;
    angularMomentum += x * vy - y * vx;
    cx += x / 3;
    cy += y / 3;

    for (let other = body + 1; other < 3; other++) {
      // Calcula la distancia entre los dos cuerpos.
      const distance = Math.hypot(
        x - state[other * 4],
        y - state[other * 4 + 1],
      );

      if (!Number.isFinite(distance) || distance <= 1e-12) {
        throw new RangeError(
          "The orbit contains a collision or an unrepresentable separation.",
        );
      }

      energy -= 1 / distance;
      minSeparation = Math.min(minSeparation, distance);
    }
  }

  if (![energy, px, py, angularMomentum, cx, cy].every(Number.isFinite)) {
    throw new RangeError("The orbit's physical quantities must remain finite.");
  }

  return { energy, px, py, angularMomentum, cx, cy, minSeparation };
}

// Crea los diagnósticos y el observador que se actualiza con cada paso aceptado.
export const createOrbitDiagnostics = (initial: readonly number[]) => {
  // Calcula las magnitudes físicas iniciales que servirán de referencia.
  const reference = invariants(initial);

  // Almacena los indicadores de precisión y estabilidad de la órbita.
  const diagnostics: OrbitData["diagnostics"] = {
    closure: 0,
    positionClosure: 0,
    maxEnergyDrift: 0,
    maxMomentum: Math.hypot(reference.px, reference.py),
    maxAngularDrift: 0,
    maxCenterOfMass: Math.hypot(reference.cx, reference.cy),
    minSeparation: reference.minSeparation,
    acceptedSteps: 0,
    rejectedSteps: 0,
  };

  // Actualiza los diagnósticos físicos después de cada paso aceptado.
  const observe = (accepted: readonly number[]) => {
    // Calcula las magnitudes físicas del estado aceptado.
    const current = invariants(accepted);

    diagnostics.maxEnergyDrift = Math.max(
      diagnostics.maxEnergyDrift,
      Math.abs(current.energy - reference.energy) /
        Math.max(Math.abs(reference.energy), Number.EPSILON),
    );

    diagnostics.maxMomentum = Math.max(
      diagnostics.maxMomentum,
      Math.hypot(current.px, current.py),
    );

    diagnostics.maxAngularDrift = Math.max(
      diagnostics.maxAngularDrift,
      Math.abs(current.angularMomentum - reference.angularMomentum),
    );

    diagnostics.maxCenterOfMass = Math.max(
      diagnostics.maxCenterOfMass,
      Math.hypot(current.cx, current.cy),
    );

    diagnostics.minSeparation = Math.min(
      diagnostics.minSeparation,
      current.minSeparation,
    );
  };

  return { diagnostics, observe };
};

// Calcula las diferencias entre el estado final y el inicial.
export const finishOrbitDiagnostics = (
  diagnostics: OrbitData["diagnostics"],
  initial: readonly number[],
  state: readonly number[],
  samples: readonly number[][],
) => {
  // Define la dimensión total del estado de los tres cuerpos.
  const DIMENSIONS = 12;

  // Calcula cuánto difiere el estado final del estado inicial.
  diagnostics.closure = Math.sqrt(
    state.reduce(
      (total, value, index) => total + (value - initial[index]) ** 2,
      0,
    ) / DIMENSIONS,
  );

  // Obtiene las posiciones iniciales de los tres cuerpos.
  const firstPositions = samples[0];

  // Calcula la diferencia entre las posiciones finales e iniciales.
  diagnostics.positionClosure = Math.sqrt(
    samples[samples.length - 1].reduce(
      (total, value, index) => total + (value - firstPositions[index]) ** 2,
      0,
    ) / 6,
  );
};
