/**
 * Núcleo físico compartido.
 * Estado de cada cuerpo: [x, y, vx, vy].
 */

// Define la constante gravitatoria y las masas de los tres cuerpos.
export type GravityParameters = Readonly<{
  G: number;
  masses: readonly [number, number, number];
}>;

// Define los parámetros físicos originales de las seis órbitas.
export const CATALOGUE_PHYSICS: GravityParameters = {
  G: 1,
  masses: [1, 1, 1],
};

// Comprueba que la constante gravitatoria y las tres masas
// sean valores positivos y finitos.
export const validateGravityParameters = ({ G, masses }: GravityParameters) => {
  if (
    !Number.isFinite(G) ||
    G <= 0 ||
    masses.length !== 3 ||
    masses.some((mass) => !Number.isFinite(mass) || mass <= 0)
  ) {
    throw new RangeError(
      "G and the three masses must be positive finite numbers.",
    );
  }
};

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

// Calcula el siguiente estado del sistema mediante
// el método de integración Runge-Kutta de cuarto orden (RK4).
export const rk4Step = (
  state: readonly number[],
  step: number,
  physics: GravityParameters,
): number[] => {
  // Calcula la primera estimación de las derivadas.
  const k1 = derivative(state, physics);

  // Calcula la segunda estimación a mitad del paso temporal.
  const k2 = derivative(
    state.map((value, index) => value + (step * k1[index]) / 2),
    physics,
  );

  // Calcula la tercera estimación utilizando el resultado de k2.
  const k3 = derivative(
    state.map((value, index) => value + (step * k2[index]) / 2),
    physics,
  );

  // Calcula la cuarta estimación al final del paso temporal.
  const k4 = derivative(
    state.map((value, index) => value + step * k3[index]),
    physics,
  );

  // Combina las cuatro estimaciones para obtener el siguiente estado.
  return state.map(
    (value, index) =>
      value +
      (step * (k1[index] + 2 * k2[index] + 2 * k3[index] + k4[index])) / 6,
  );
};
