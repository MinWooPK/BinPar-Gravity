import type { FormulaInputState } from "../types/formula.types";

import {
  gravitationalForce,
  isWithinLaboratoryRange,
  laboratoryLimits,
  solveGravity,
} from "../domain/gravitation";

import type {
  GravityParameters,
  GravityValues,
  GravityVariable,
} from "../types/gravity.types";

import { parseFormulaValue } from "./parseFormulaValue";

// Variables de la fórmula.
const variables = ["force", "mass1", "mass2", "distance"] as const;

// Estado inicial de la calculadora.
export const initialFormulaInput: FormulaInputState = {
  values: { force: "", mass1: "", mass2: "", distance: "" },
  unknown: null,
  result: null,
  numericalError: false,
};

// Calcula la variable desconocida.
const calculateFormulaInput = (state: FormulaInputState): FormulaInputState => {
  const { values } = state;

  const next = { ...state, result: null, numericalError: false };

  // Busca los campos sin un número válido.
  const missing = variables.filter(
    (variable) => parseFormulaValue(values[variable]) === null,
  );

  // Selecciona la incógnita.
  const target = state.unknown ?? (missing.length === 1 ? missing[0] : null);

  if (!target) return next;

  // Recoge los valores conocidos.
  const known: Partial<GravityValues> = {};

  for (const variable of variables) {
    if (variable === target) continue;

    const value = parseFormulaValue(values[variable]);

    if (value === null) return next;

    known[variable] = value;
  }

  try {
    // Resuelve la fórmula.
    const result = solveGravity(target, known);

    // Corrige pequeñas diferencias decimales en los límites.
    if (target !== "force") {
      const { min, max } = laboratoryLimits[target];

      for (const boundary of [min, max]) {
        if (
          Math.abs(result[target] - boundary) <=
          8 * Number.EPSILON * boundary
        ) {
          result[target] = boundary;
          break;
        }
      }
    }

    return { ...next, unknown: target, result };
  } catch {
    return { ...next, unknown: target, numericalError: true };
  }
};

// Carga los valores actuales del laboratorio.
export const formulaInputFromParameters = (
  parameters: GravityParameters,
  unknown: GravityVariable = "force",
): FormulaInputState => {
  const result = { ...parameters, force: gravitationalForce(parameters) };

  return {
    values: {
      force: String(result.force),
      mass1: String(parameters.mass1),
      mass2: String(parameters.mass2),
      distance: String(parameters.distance),
      [unknown]: "",
    },
    unknown,
    result,
    numericalError: false,
  };
};

// Actualiza un campo y recalcula la fórmula.
export const changeFormulaInput = (
  state: FormulaInputState,
  key: GravityVariable,
  text: string,
): FormulaInputState => {
  if (key === state.unknown) return state;

  return calculateFormulaInput({
    ...state,
    values: { ...state.values, [key]: text },
  });
};

// Cambia la incógnita de la fórmula.
export const selectFormulaUnknown = (
  state: FormulaInputState,
  unknown: GravityVariable,
): FormulaInputState => {
  if (unknown === state.unknown) return state;

  const values = { ...state.values, [unknown]: "" };

  // Conserva el resultado de la incógnita anterior.
  if (state.unknown && state.result) {
    values[state.unknown] = String(state.result[state.unknown]);
  }

  return calculateFormulaInput({ ...state, values, unknown });
};

// Comprueba los límites del laboratorio.
export const isInLaboratoryRange = isWithinLaboratoryRange;
