// Constante gravitatoria y masas de los tres cuerpos.
export type GravityParameters = Readonly<{
  G: number;
  masses: readonly [number, number, number];
}>;

// Parámetros físicos de las seis órbitas.
export const CATALOGUE_PHYSICS: GravityParameters = {
  G: 1,
  masses: [1, 1, 1],
};

// Comprueba que la gravedad y las masas sean válidas.
export const validateGravityParameters = ({ G, masses }: GravityParameters) => {
  if (
    !Number.isFinite(G) ||
    G <= 0 ||
    masses.length !== 3 ||
    masses.some((mass) => !Number.isFinite(mass) || mass <= 0)
  ) {
    throw new RangeError(
      "La constante gravitatoria y las tres masas deben ser números positivos y finitos.",
    );
  }
};
