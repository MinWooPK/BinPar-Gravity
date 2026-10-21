import type { ExperimentState } from "./experiment.types";

// Define la distancia mínima de seguridad entre dos cuerpos.
const MIN_DISTANCE = 1e-3;

// Extrae únicamente las posiciones X e Y de los tres cuerpos.
export const positions = (state: readonly number[]): number[] => [
  state[0],
  state[1],
  state[4],
  state[5],
  state[8],
  state[9],
];

// Valida que el estado contenga posiciones y velocidades finitas
// y que los cuerpos mantengan una separación mínima de seguridad.
export function validateExperimentState(
  state: readonly number[],
): asserts state is ExperimentState {
  if (state.length !== 12 || !state.every(Number.isFinite)) {
    throw new RangeError(
      "Las posiciones y velocidades deben ser números finitos.",
    );
  }

  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      // Identifica las posiciones de los dos cuerpos que se comparan.
      const a = 4 * i;
      const b = 4 * j;

      if (
        Math.hypot(state[a] - state[b], state[a + 1] - state[b + 1]) <
        MIN_DISTANCE
      ) {
        throw new RangeError(
          "Los cuerpos se han acercado demasiado para calcular la trayectoria con seguridad.",
        );
      }
    }
  }
}
