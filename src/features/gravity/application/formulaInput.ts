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

// Define las cuatro variables de la fórmula gravitatoria.
const variables = ["force", "mass1", "mass2", "distance"] as const;

// Establece el estado inicial de la calculadora con los campos vacíos.
export const initialFormulaInput: FormulaInputState = {
  values: { force: "", mass1: "", mass2: "", distance: "" },
  unknown: null,
  result: null,
  numericalError: false,
};

// Calcula la variable desconocida a partir de los valores introducidos.
const calculateFormulaInput = (state: FormulaInputState): FormulaInputState => {
  const { values } = state;

  // Prepara el estado para un nuevo cálculo.
  const next = { ...state, result: null, numericalError: false };

  // Identifica las variables que no tienen un valor numérico válido.
  const missing = variables.filter(
    (variable) => parseFormulaValue(values[variable]) === null,
  );

  // Determina qué variable debe calcularse.
  const target = state.unknown ?? (missing.length === 1 ? missing[0] : null);

  if (!target) return next;

  // Recoge los valores conocidos necesarios para resolver la fórmula.
  const known: Partial<GravityValues> = {};

  for (const variable of variables) {
    if (variable === target) continue;

    const value = parseFormulaValue(values[variable]);

    if (value === null) return next;

    known[variable] = value;
  }

  try {
    // Resuelve la fórmula y corrige pequeñas imprecisiones numéricas en los límites.
    const result = solveGravity(target, known);

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

// Inicializa la calculadora con los parámetros actuales del laboratorio.
export const formulaInputFromParameters = (
  parameters: GravityParameters,
  unknown: GravityVariable = "force",
): FormulaInputState => {
  // Calcula la fuerza correspondiente a los parámetros actuales.
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

// Actualiza el texto de un campo y recalcula la fórmula si es posible.
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

// Cambia la incógnita de la fórmula conservando los resultados anteriores.
export const selectFormulaUnknown = (
  state: FormulaInputState,
  unknown: GravityVariable,
): FormulaInputState => {
  if (unknown === state.unknown) return state;

  // Prepara los valores para calcular la nueva incógnita.
  const values = { ...state.values, [unknown]: "" };

  if (state.unknown && state.result) {
    values[state.unknown] = String(state.result[state.unknown]);
  }

  return calculateFormulaInput({ ...state, values, unknown });
};

// Reutiliza la validación de los límites permitidos en el laboratorio.
export const isInLaboratoryRange = isWithinLaboratoryRange;
