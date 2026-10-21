import type { GravityParameters } from "./physics-parameters";

// Calcula las velocidades y aceleraciones de los tres cuerpos.
export const derivative = (
  state: readonly number[],
  { G, masses }: GravityParameters,
): number[] => {
  // Prepara los 12 componentes del resultado.
  const result = new Array<number>(12).fill(0);

  // Obtiene las velocidades de cada cuerpo.
  for (let body = 0; body < 3; body++) {
    const index = body * 4;

    result[index] = state[index + 2];
    result[index + 1] = state[index + 3];
  }

  // Calcula la atracción entre cada pareja de cuerpos.
  for (let first = 0; first < 3; first++) {
    for (let second = first + 1; second < 3; second++) {
      const a = first * 4;
      const b = second * 4;

      // Distancia entre los cuerpos.
      const dx = state[b] - state[a];
      const dy = state[b + 1] - state[a + 1];
      const squaredDistance = dx * dx + dy * dy;

      if (!Number.isFinite(squaredDistance) || squaredDistance <= 1e-24) {
        throw new RangeError(
          "Los cuerpos están demasiado cerca para calcular la gravedad.",
        );
      }

      // Calcula la intensidad de la atracción.
      const inverseCube = 1 / (squaredDistance * Math.sqrt(squaredDistance));

      const ax = dx * inverseCube;
      const ay = dy * inverseCube;

      // Aplica la aceleración gravitatoria a ambos cuerpos.
      result[a + 2] += G * masses[second] * ax;
      result[a + 3] += G * masses[second] * ay;

      result[b + 2] -= G * masses[first] * ax;
      result[b + 3] -= G * masses[first] * ay;
    }
  }

  return result;
};
