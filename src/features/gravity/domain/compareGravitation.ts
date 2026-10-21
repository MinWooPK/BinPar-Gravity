import { gravitationalForce, initialParameters } from "./gravitation";

import type { GravityParameters } from "../types/gravity.types";

// Tipos de explicación de los cambios gravitatorios.
type GravityExplanation =
  | "initial"
  | "massDoubled"
  | "distanceDoubled"
  | "massChanged"
  | "distanceChanged"
  | "combined"
  | "combinedUnchanged";

// Compara números con un pequeño margen de error.
const nearlyEqual = (left: number, right: number) =>
  Math.abs(left - right) <= 1e-10 * Math.max(Math.abs(left), Math.abs(right));

// Compara la fuerza actual con la de referencia.
export const compareGravitation = (
  current: GravityParameters,
  reference: GravityParameters = initialParameters,
) => {
  // Calcula las fuerzas y su proporción.
  const currentForce = gravitationalForce(current);
  const referenceForce = gravitationalForce(reference);
  const forceRatio = currentForce / referenceForce;

  // Comprueba que los resultados sean válidos.
  if (
    ![currentForce, referenceForce, forceRatio].every(
      (value) => Number.isFinite(value) && value > 0,
    )
  ) {
    throw new RangeError("Forces must be finite and positive to compare them.");
  }

  // Comprueba qué parámetros han cambiado.
  const mass1Changed = !nearlyEqual(current.mass1, reference.mass1);
  const mass2Changed = !nearlyEqual(current.mass2, reference.mass2);
  const distanceChanged = !nearlyEqual(current.distance, reference.distance);

  const changedCount =
    Number(mass1Changed) + Number(mass2Changed) + Number(distanceChanged);

  // Selecciona la explicación correspondiente.
  let explanation: GravityExplanation;

  if (changedCount === 0) {
    explanation = "initial";
  } else if (changedCount > 1) {
    explanation = nearlyEqual(forceRatio, 1) ? "combinedUnchanged" : "combined";
  } else if (distanceChanged) {
    explanation = nearlyEqual(current.distance / reference.distance, 2)
      ? "distanceDoubled"
      : "distanceChanged";
  } else {
    const massRatio = mass1Changed
      ? current.mass1 / reference.mass1
      : current.mass2 / reference.mass2;

    explanation = nearlyEqual(massRatio, 2) ? "massDoubled" : "massChanged";
  }

  return { explanation, currentForce, referenceForce, forceRatio };
};
