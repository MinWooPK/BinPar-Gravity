/**
 * Núcleo físico compartido.
 * Estado de cada cuerpo: [x, y, vx, vy].
 */
export type GravityParameters = Readonly<{
  G: number;
  masses: readonly [number, number, number];
}>;

// Configuración original de las seis órbitas.
export const CATALOGUE_PHYSICS: GravityParameters = {
  G: 1,
  masses: [1, 1, 1],
};

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

/**
 * Calcula las velocidades y aceleraciones
 * debidas a la atracción gravitatoria.
 */
export const derivative = (
  state: readonly number[],
  { G, masses }: GravityParameters,
): number[] => {
  const result = new Array<number>(12).fill(0);

  for (let body = 0; body < 3; body++) {
    const index = body * 4;

    result[index] = state[index + 2];
    result[index + 1] = state[index + 3];
  }

  for (let first = 0; first < 3; first++) {
    for (let second = first + 1; second < 3; second++) {
      const a = first * 4;
      const b = second * 4;

      const dx = state[b] - state[a];
      const dy = state[b + 1] - state[a + 1];

      const squaredDistance = dx * dx + dy * dy;

      if (!Number.isFinite(squaredDistance) || squaredDistance <= 1e-24) {
        throw new RangeError("The Newtonian point-mass state is singular.");
      }

      const inverseCube = 1 / (squaredDistance * Math.sqrt(squaredDistance));

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

/**
 * Calcula un paso con Runge-Kutta de orden 4.
 */
export const rk4Step = (
  state: readonly number[],
  step: number,
  physics: GravityParameters,
): number[] => {
  const k1 = derivative(state, physics);

  const k2 = derivative(
    state.map((value, index) => value + (step * k1[index]) / 2),
    physics,
  );

  const k3 = derivative(
    state.map((value, index) => value + (step * k2[index]) / 2),
    physics,
  );

  const k4 = derivative(
    state.map((value, index) => value + step * k3[index]),
    physics,
  );

  return state.map(
    (value, index) =>
      value +
      (step * (k1[index] + 2 * k2[index] + 2 * k3[index] + k4[index])) / 6,
  );
};
