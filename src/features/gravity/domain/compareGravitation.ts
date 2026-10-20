import { gravitationalForce, initialParameters } from "./gravitation";

import type { GravityParameters } from "../types/gravity.types";

// Define los tipos de explicación según los cambios en la fuerza gravitatoria.
type GravityExplanation =
  | "initial"
  | "massDoubled"
  | "distanceDoubled"
  | "massChanged"
  | "distanceChanged"
  | "combined"
  | "combinedUnchanged";

// Compara dos números teniendo en cuenta pequeñas imprecisiones decimales.
const nearlyEqual = (left: number, right: number) =>
  Math.abs(left - right) <= 1e-10 * Math.max(Math.abs(left), Math.abs(right));

// Compara la fuerza gravitatoria actual con una configuración de referencia
// e identifica cómo han influido los cambios de masa y distancia.
export const compareGravitation = (
  current: GravityParameters,
  reference: GravityParameters = initialParameters,
) => {
  // Calcula la fuerza gravitatoria con los parámetros actuales.
  const currentForce = gravitationalForce(current);

  // Calcula la fuerza gravitatoria de referencia.
  const referenceForce = gravitationalForce(reference);

  // Calcula la proporción entre ambas fuerzas gravitatorias.
  const forceRatio = currentForce / referenceForce;

  if (
    ![currentForce, referenceForce, forceRatio].every(
      (value) => Number.isFinite(value) && value > 0,
    )
  ) {
    throw new RangeError("Forces must be finite and positive to compare them.");
  }

  // Comprueba si ha cambiado la masa del primer cuerpo.
  const mass1Changed = !nearlyEqual(current.mass1, reference.mass1);

  // Comprueba si ha cambiado la masa del segundo cuerpo.
  const mass2Changed = !nearlyEqual(current.mass2, reference.mass2);

  // Comprueba si ha cambiado la distancia entre ambos cuerpos.
  const distanceChanged = !nearlyEqual(current.distance, reference.distance);

  // Cuenta cuántos parámetros han cambiado respecto a la referencia.
  const changedCount =
    Number(mass1Changed) + Number(mass2Changed) + Number(distanceChanged);

  // Almacena el tipo de explicación correspondiente a los cambios detectados.
  let explanation: GravityExplanation;

  if (changedCount === 0) explanation = "initial";
  else if (changedCount > 1) {
    explanation = nearlyEqual(forceRatio, 1) ? "combinedUnchanged" : "combined";
  } else if (distanceChanged) {
    explanation = nearlyEqual(current.distance / reference.distance, 2)
      ? "distanceDoubled"
      : "distanceChanged";
  } else {
    // Calcula cuánto ha variado la masa del cuerpo que se ha modificado.
    const massRatio = mass1Changed
      ? current.mass1 / reference.mass1
      : current.mass2 / reference.mass2;

    explanation = nearlyEqual(massRatio, 2) ? "massDoubled" : "massChanged";
  }

  return { explanation, currentForce, referenceForce, forceRatio };
};
