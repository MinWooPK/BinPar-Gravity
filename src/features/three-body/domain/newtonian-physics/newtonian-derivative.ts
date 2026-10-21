import type { GravityParameters } from "./physics-parameters";

// Calcula las derivadas de las posiciones y velocidades
// aplicando la ley de gravitación universal de Newton.
export const derivative = (
  state: readonly number[],
  { G, masses }: GravityParameters,
): number[] => {
  // Prepara el array que almacenará las velocidades y aceleraciones.
  const result = new Array<number>(12).fill(0);

  for (let body = 0; body < 3; body++) {
    // Identifica la posición del cuerpo dentro del estado físico.
    const index = body * 4;

    result[index] = state[index + 2];
    result[index + 1] = state[index + 3];
  }

  for (let first = 0; first < 3; first++) {
    for (let second = first + 1; second < 3; second++) {
      // Obtiene los índices de los dos cuerpos que interactúan.
      const a = first * 4;
      const b = second * 4;

      // Calcula la separación entre ambos cuerpos en los ejes X e Y.
      const dx = state[b] - state[a];
      const dy = state[b + 1] - state[a + 1];

      // Calcula el cuadrado de la distancia entre los dos cuerpos.
      const squaredDistance = dx * dx + dy * dy;

      if (!Number.isFinite(squaredDistance) || squaredDistance <= 1e-24) {
        throw new RangeError("The Newtonian point-mass state is singular.");
      }

      // Calcula el inverso de la distancia elevada al cubo.
      const inverseCube = 1 / (squaredDistance * Math.sqrt(squaredDistance));

      // Calcula los componentes de la atracción gravitatoria.
      const ax = dx * inverseCube;
      const ay = dy * inverseCube;

      // Cada cuerpo es atraído por los otros dos.
      result[a + 2] += G * masses[second] * ax;
      result[a + 3] += G * masses[second] * ay;

      result[b + 2] -= G * masses[first] * ax;
      result[b + 3] -= G * masses[first] * ay;
    }
  }

  return result;
};
