import type { FormulaInputState } from "../types/formula.types";
import { solveGravity } from "../domain/gravitation";
import type { GravityValues, GravityVariable } from "../types/gravity.types";
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
    return { ...next, unknown: target, result: solveGravity(target, known) };
  } catch {
    return { ...next, unknown: target, numericalError: true };
  }
};

/** Edits affect the calculator draft only; the selected unknown is read-only. */
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

/** Only values supported by the laboratory sliders are applied to the experiment. */
export const isInLaboratoryRange = (values: GravityValues) =>
  values.mass1 >= 1e13 &&
  values.mass1 <= 1e14 &&
  values.mass2 >= 1e13 &&
  values.mass2 <= 1e14 &&
  values.distance >= 5000 &&
  values.distance <= 20000;
