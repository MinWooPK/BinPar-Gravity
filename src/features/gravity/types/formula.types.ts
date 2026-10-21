import type { GravityValues, GravityVariable } from "./gravity.types";

export type FormulaInputState = {
  values: Record<GravityVariable, string>;
  unknown: GravityVariable | null;
  result: GravityValues | null;
  numericalError: boolean;
};
export type FormulaTerm = GravityVariable | "constant" | "masses";
