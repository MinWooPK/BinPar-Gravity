import type { OrbitData } from "../../types/orbit.types";

// Calcula las magnitudes físicas de los tres cuerpos.
function invariants(state: readonly number[]) {
  let energy = 0;
  let px = 0;
  let py = 0;
  let angularMomentum = 0;
  let cx = 0;
  let cy = 0;
  let minSeparation = Infinity;

  // Calcula la energía, los momentos y el centro de masas.
  for (let body = 0; body < 3; body++) {
    const [x, y, vx, vy] = state.slice(body * 4, body * 4 + 4);

    energy += (vx * vx + vy * vy) / 2;
    px += vx;
    py += vy;
    angularMomentum += x * vy - y * vx;
    cx += x / 3;
    cy += y / 3;

    // Calcula la distancia entre cada pareja de cuerpos.
    for (let other = body + 1; other < 3; other++) {
      const distance = Math.hypot(
        x - state[other * 4],
        y - state[other * 4 + 1],
      );

      if (!Number.isFinite(distance) || distance <= 1e-12) {
        throw new RangeError(
          "La órbita contiene una colisión o una distancia que no se puede representar.",
        );
      }

      energy -= 1 / distance;
      minSeparation = Math.min(minSeparation, distance);
    }
  }

  // Comprueba que las magnitudes físicas sean válidas.
  if (![energy, px, py, angularMomentum, cx, cy].every(Number.isFinite)) {
    throw new RangeError(
      "Las magnitudes físicas de la órbita deben ser números finitos.",
    );
  }

  return { energy, px, py, angularMomentum, cx, cy, minSeparation };
}

// Prepara los indicadores de precisión de la órbita.
export const createOrbitDiagnostics = (initial: readonly number[]) => {
  const reference = invariants(initial);

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

  // Actualiza los indicadores después de cada paso aceptado.
  const observe = (accepted: readonly number[]) => {
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

// Calcula el error de cierre de la órbita.
export const finishOrbitDiagnostics = (
  diagnostics: OrbitData["diagnostics"],
  initial: readonly number[],
  state: readonly number[],
  samples: readonly number[][],
) => {
  const DIMENSIONS = 12;

  // Compara los estados físicos inicial y final.
  diagnostics.closure = Math.sqrt(
    state.reduce(
      (total, value, index) => total + (value - initial[index]) ** 2,
      0,
    ) / DIMENSIONS,
  );

  // Compara las posiciones iniciales y finales.
  const firstPositions = samples[0];

  diagnostics.positionClosure = Math.sqrt(
    samples[samples.length - 1].reduce(
      (total, value, index) => total + (value - firstPositions[index]) ** 2,
      0,
    ) / 6,
  );
};
