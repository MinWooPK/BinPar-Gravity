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
