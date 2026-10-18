import { gravitationalForce, initialParameters, isWithinLaboratoryRange } from "../domain/gravitation";
import type { FormulaInputState } from "../types/formula.types";
import type { GravityParameters, GravityVariable } from "../types/gravity.types";
import { changeFormulaInput, formulaInputFromParameters, selectFormulaUnknown } from "./formulaInput";
import { resolveGravityProposal, sameGravityParameters } from "./gravityProposal";

export type GravityState = {
  parameters: GravityParameters;
  formula: FormulaInputState;
  resetVersion: number;
  revision: number;
};

export type GravityParameterUpdate = GravityParameters | ((current: GravityParameters) => GravityParameters);
export type GravityAction =
  | { type: "parameters"; update: GravityParameterUpdate }
  | { type: "formula"; key: GravityVariable; text: string }
  | { type: "unknown"; key: GravityVariable }
  | { type: "reset" }
  | { type: "proposal"; proposal: unknown; expectedRevision: number };

export const createGravityState = (): GravityState => ({
  parameters: { ...initialParameters },
  formula: formulaInputFromParameters(initialParameters),
  resetVersion: 0,
  revision: 0,
});

/** One event updates physics and editable text atomically; no effect-based echo cycle. */
export const gravityStateReducer = (state: GravityState, action: GravityAction): GravityState => {
  switch (action.type) {
    case "parameters": {
      const parameters = typeof action.update === "function"
        ? action.update(state.parameters) : action.update;
      if (!isWithinLaboratoryRange(parameters)) return state;
      return {
        ...state, parameters,
        revision: state.revision + (sameGravityParameters(state.parameters, parameters) ? 0 : 1),
        formula: formulaInputFromParameters(parameters, state.formula.unknown ?? "force"),
      };
    }
    case "formula": {
      const formula = changeFormulaInput(state.formula, action.key, action.text);
      if (formula === state.formula) return state;
      const result = formula.result;
      // Invalid or out-of-range edits stay visible without changing physics.
      const parameters = result && isWithinLaboratoryRange(result)
        ? { mass1: result.mass1, mass2: result.mass2, distance: result.distance }
        : state.parameters;
      return { ...state, parameters, formula, revision: state.revision + (sameGravityParameters(state.parameters, parameters) ? 0 : 1) };
    }
    case "unknown": {
      if (action.key === state.formula.unknown) return state;
      const formula = selectFormulaUnknown(state.formula, action.key);
      const result = state.formula.result;
      const synchronized = result && result.mass1 === state.parameters.mass1 &&
        result.mass2 === state.parameters.mass2 && result.distance === state.parameters.distance;
      // Selecting a different unknown does not need to invert already-known physics.
      return {
        ...state,
        formula: synchronized ? {
          ...formula,
          result: { ...state.parameters, force: gravitationalForce(state.parameters) },
        } : formula,
      };
    }
    case "reset":
      return { ...createGravityState(), resetVersion: state.resetVersion + 1, revision: state.revision + 1 };
    case "proposal": {
      if (action.expectedRevision !== state.revision) return state;
      const parameters = resolveGravityProposal(state.parameters, action.proposal);
      return parameters ? gravityStateReducer(state, { type: "parameters", update: parameters }) : state;
    }
  }
};
