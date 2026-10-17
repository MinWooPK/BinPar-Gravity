import { solveGravity } from "../domain/gravitation";
import type { GravityValues, GravityVariable } from "../domain/gravitation";
import { parseFormulaValue } from "./parseFormulaValue";

const variables = ["force", "mass1", "mass2", "distance"] as const;

export type FormulaInputState = {
  values: Record<GravityVariable, string>;
  unknown: GravityVariable | null;
  result: GravityValues | null;
  numericalError: boolean;
};

export const initialFormulaInput: FormulaInputState = {
  values: { force: "", mass1: "", mass2: "", distance: "" },
  unknown: null,
  result: null,
  numericalError: false,
};

/** Keep the first inferred unknown until reset, including during incomplete edits. */
export const changeFormulaInput = (
  state: FormulaInputState,
  key: GravityVariable,
  text: string,
): FormulaInputState => {
  const values = { ...state.values, [key]: text };
  const next = { ...state, values, result: null, numericalError: false };
  const missing = variables.filter((variable) => parseFormulaValue(values[variable]) === null);
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

/** Only values supported by the laboratory sliders are applied to the experiment. */
export const isInLaboratoryRange = (values: GravityValues) =>
  values.mass1 >= 1e13 && values.mass1 <= 1e14 &&
  values.mass2 >= 1e13 && values.mass2 <= 1e14 &&
  values.distance >= 5000 && values.distance <= 20000;
