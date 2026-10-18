import type { FormulaInputState } from "../types/formula.types";
import { gravitationalForce, isWithinLaboratoryRange, laboratoryLimits, solveGravity } from "../domain/gravitation";
import type { GravityParameters, GravityValues, GravityVariable } from "../types/gravity.types";
import { parseFormulaValue } from "./parseFormulaValue";

const variables = ["force", "mass1", "mass2", "distance"] as const;

export const initialFormulaInput: FormulaInputState = {
  values: { force: "", mass1: "", mass2: "", distance: "" },
  unknown: null,
  result: null,
  numericalError: false,
};

const calculateFormulaInput = (state: FormulaInputState): FormulaInputState => {
  const { values } = state;
  const next = { ...state, result: null, numericalError: false };
  const missing = variables.filter(
    (variable) => parseFormulaValue(values[variable]) === null,
  );
  const target = state.unknown ?? (missing.length === 1 ? missing[0] : null);
  if (!target) return next;

  const known: Partial<GravityValues> = {};
  for (const variable of variables) {
    if (variable === target) continue;
    const value = parseFormulaValue(values[variable]);
    if (value === null) return next;
    known[variable] = value;
  }

  try {
    const result = solveGravity(target, known);
    if (target !== "force") {
      // Inverting F for (10 kg, 10 kg, 5.8 m) yields 9.999999999999998 kg.
      // Correct only machine precision at a solved boundary, never an entered value.
      const { min, max } = laboratoryLimits[target];
      for (const boundary of [min, max]) {
        if (Math.abs(result[target] - boundary) <= 8 * Number.EPSILON * boundary) {
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

/** Hydrate text from shared parameters, without solving an inverse again. */
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

/** Keep literal editing text; the laboratory decides whether the result can synchronize. */
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

/** Reuse the previous exact result as a known value when changing the unknown. */
export const selectFormulaUnknown = (
  state: FormulaInputState,
  unknown: GravityVariable,
): FormulaInputState => {
  if (unknown === state.unknown) return state;
  const values = { ...state.values, [unknown]: "" };
  if (state.unknown && state.result) {
    values[state.unknown] = String(state.result[state.unknown]);
  }
  return calculateFormulaInput({ ...state, values, unknown });
};

export const isInLaboratoryRange = isWithinLaboratoryRange;
