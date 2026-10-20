import {
  isWithinLaboratoryRange,
  laboratoryLimits,
} from "../domain/gravitation";

import type {
  GravityParameters,
  GravityParameterProposal,
} from "../types/gravity.types";

// Define los parámetros del laboratorio que la IA puede proponer modificar.
const keys = ["mass1", "mass2", "distance"] as const;

// Comprueba si un valor es un objeto válido, excluyendo null y arrays.
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

// Comprueba si dos configuraciones gravitatorias tienen los mismos valores.
export const sameGravityParameters = (
  a: GravityParameters,
  b: GravityParameters,
) => keys.every((key) => a[key] === b[key]);

// Valida que una propuesta de la IA tenga la estructura correcta
// y que sus valores respeten los límites y pasos del laboratorio.
export const isGravityParameterProposal = (
  value: unknown,
): value is GravityParameterProposal => {
  if (
    !isRecord(value) ||
    Object.keys(value).length !== 2 ||
    value.action !== "set_gravity_parameters" ||
    !isRecord(value.parameters)
  )
    return false;

  // Obtiene los parámetros incluidos en la propuesta.
  const parameters = value.parameters;

  if (
    Object.keys(parameters).length !== keys.length ||
    !keys.every((key) => key in parameters)
  )
    return false;

  return (
    keys.some((key) => parameters[key] !== null) &&
    keys.every((key) => {
      const value = parameters[key];

      if (value === null) return true;

      // Obtiene los límites y el incremento permitido del parámetro.
      const { min, max, step } = laboratoryLimits[key];

      if (
        typeof value !== "number" ||
        !Number.isFinite(value) ||
        value < min ||
        value > max
      )
        return false;

      // Comprueba que el valor coincide con un incremento válido del control.
      const steps = (value - min) / step;

      return Math.abs(steps - Math.round(steps)) < 1e-9;
    })
  );
};

// Convierte una propuesta válida de la IA en nuevos parámetros,
// manteniendo los valores actuales cuando la propuesta contiene null.
export const resolveGravityProposal = (
  current: GravityParameters,
  value: unknown,
): GravityParameters | null => {
  if (!isGravityParameterProposal(value)) return null;

  // Combina los parámetros propuestos con los actuales.
  const parameters = {
    mass1: value.parameters.mass1 ?? current.mass1,
    mass2: value.parameters.mass2 ?? current.mass2,
    distance: value.parameters.distance ?? current.distance,
  };

  return isWithinLaboratoryRange(parameters) &&
    !sameGravityParameters(current, parameters)
    ? parameters
    : null;
};
