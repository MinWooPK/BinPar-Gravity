import {
  gravitationalForce,
  initialParameters,
  isWithinLaboratoryRange,
} from "../domain/gravitation";

import type { FormulaInputState } from "../types/formula.types";

import type {
  GravityParameters,
  GravityVariable,
} from "../types/gravity.types";

import {
  changeFormulaInput,
  formulaInputFromParameters,
  selectFormulaUnknown,
} from "./formulaInput";

import {
  resolveGravityProposal,
  sameGravityParameters,
} from "./gravityProposal";

// Estado del laboratorio y la calculadora.
export type GravityState = {
  parameters: GravityParameters;
  formula: FormulaInputState;
  resetVersion: number;
  revision: number;
};

// Formas de actualizar los parámetros.
export type GravityParameterUpdate =
  | GravityParameters
  | ((current: GravityParameters) => GravityParameters);

// Acciones disponibles en el laboratorio.
export type GravityAction =
  | { type: "parameters"; update: GravityParameterUpdate }
  | { type: "formula"; key: GravityVariable; text: string }
  | { type: "unknown"; key: GravityVariable }
  | { type: "reset" }
  | { type: "proposal"; proposal: unknown; expectedRevision: number };

// Crea el estado inicial.
export const createGravityState = (): GravityState => ({
  parameters: { ...initialParameters },
  formula: formulaInputFromParameters(initialParameters),
  resetVersion: 0,
  revision: 0,
});

// Actualiza el estado del laboratorio.
export const gravityStateReducer = (
  state: GravityState,
  action: GravityAction,
): GravityState => {
  switch (action.type) {
    // Actualiza los parámetros de gravedad.
    case "parameters": {
      const parameters =
        typeof action.update === "function"
          ? action.update(state.parameters)
          : action.update;

      if (!isWithinLaboratoryRange(parameters)) return state;

      return {
        ...state,
        parameters,
        revision:
          state.revision +
          (sameGravityParameters(state.parameters, parameters) ? 0 : 1),
        formula: formulaInputFromParameters(
          parameters,
          state.formula.unknown ?? "force",
        ),
      };
    }

    // Actualiza los valores de la fórmula.
    case "formula": {
      const formula = changeFormulaInput(
        state.formula,
        action.key,
        action.text,
      );

      if (formula === state.formula) return state;

      const result = formula.result;

      // Sincroniza los parámetros si el resultado es válido.
      const parameters =
        result && isWithinLaboratoryRange(result)
          ? {
              mass1: result.mass1,
              mass2: result.mass2,
              distance: result.distance,
            }
          : state.parameters;

      return {
        ...state,
        parameters,
        formula,
        revision:
          state.revision +
          (sameGravityParameters(state.parameters, parameters) ? 0 : 1),
      };
    }

    // Cambia la incógnita de la fórmula.
    case "unknown": {
      if (action.key === state.formula.unknown) return state;

      const formula = selectFormulaUnknown(state.formula, action.key);
      const result = state.formula.result;

      // Comprueba si los valores siguen sincronizados.
      const synchronized =
        result &&
        result.mass1 === state.parameters.mass1 &&
        result.mass2 === state.parameters.mass2 &&
        result.distance === state.parameters.distance;

      return {
        ...state,
        formula: synchronized
          ? {
              ...formula,
              result: {
                ...state.parameters,
                force: gravitationalForce(state.parameters),
              },
            }
          : formula,
      };
    }

    // Restablece el laboratorio.
    case "reset":
      return {
        ...createGravityState(),
        resetVersion: state.resetVersion + 1,
        revision: state.revision + 1,
      };

    // Aplica los cambios aceptados del Tutor IA.
    case "proposal": {
      if (action.expectedRevision !== state.revision) return state;

      const parameters = resolveGravityProposal(
        state.parameters,
        action.proposal,
      );

      return parameters
        ? gravityStateReducer(state, {
            type: "parameters",
            update: parameters,
          })
        : state;
    }
  }
};
