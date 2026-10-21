import {
  isWithinLaboratoryRange,
  laboratoryLimits,
} from "../domain/gravitation";

import type {
  GravityParameters,
  GravityParameterProposal,
} from "../types/gravity.types";

// Parámetros que puede modificar la IA.
const keys = ["mass1", "mass2", "distance"] as const;

// Comprueba que sea un objeto.
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

// Comprueba si los parámetros son iguales.
export const sameGravityParameters = (
  a: GravityParameters,
  b: GravityParameters,
) => keys.every((key) => a[key] === b[key]);

// Valida los cambios propuestos por la IA.
export const isGravityParameterProposal = (
  value: unknown,
): value is GravityParameterProposal => {
  // Comprueba la estructura de la propuesta.
  if (
    !isRecord(value) ||
    Object.keys(value).length !== 2 ||
    value.action !== "set_gravity_parameters" ||
    !isRecord(value.parameters)
  )
    return false;

  const parameters = value.parameters;

  // Comprueba que estén los tres parámetros.
  if (
    Object.keys(parameters).length !== keys.length ||
    !keys.every((key) => key in parameters)
  )
    return false;

  return (
    // Al menos un parámetro debe cambiar.
    keys.some((key) => parameters[key] !== null) &&
    keys.every((key) => {
      const value = parameters[key];

      if (value === null) return true;

      const { min, max, step } = laboratoryLimits[key];

      // Comprueba los límites permitidos.
      if (
        typeof value !== "number" ||
        !Number.isFinite(value) ||
        value < min ||
        value > max
      )
        return false;

      // Comprueba que el incremento sea válido.
      const steps = (value - min) / step;

      return Math.abs(steps - Math.round(steps)) < 1e-9;
    })
  );
};

// Calcula los nuevos parámetros del laboratorio.
export const resolveGravityProposal = (
  current: GravityParameters,
  value: unknown,
): GravityParameters | null => {
  if (!isGravityParameterProposal(value)) return null;

  // Conserva los valores que la IA no modifica.
  const parameters = {
    mass1: value.parameters.mass1 ?? current.mass1,
    mass2: value.parameters.mass2 ?? current.mass2,
    distance: value.parameters.distance ?? current.distance,
  };

  // Comprueba que los cambios sean válidos y diferentes.
  return isWithinLaboratoryRange(parameters) &&
    !sameGravityParameters(current, parameters)
    ? parameters
    : null;
};
