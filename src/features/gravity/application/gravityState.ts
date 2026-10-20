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

// Define el estado global del laboratorio y la calculadora.
export type GravityState = {
  parameters: GravityParameters;
  formula: FormulaInputState;
  resetVersion: number;
  revision: number;
};

// Define las formas permitidas de actualizar los parámetros gravitatorios.
export type GravityParameterUpdate =
  | GravityParameters
  | ((current: GravityParameters) => GravityParameters);

// Define las acciones que pueden modificar el estado del laboratorio.
export type GravityAction =
  | { type: "parameters"; update: GravityParameterUpdate }
  | { type: "formula"; key: GravityVariable; text: string }
  | { type: "unknown"; key: GravityVariable }
  | { type: "reset" }
  | { type: "proposal"; proposal: unknown; expectedRevision: number };

// Crea el estado inicial del laboratorio con los parámetros predeterminados.
export const createGravityState = (): GravityState => ({
  parameters: { ...initialParameters },
  formula: formulaInputFromParameters(initialParameters),
  resetVersion: 0,
  revision: 0,
});

// Gestiona las acciones del laboratorio y mantiene sincronizados
// los parámetros físicos, la calculadora y las propuestas de la IA.
export const gravityStateReducer = (
  state: GravityState,
  action: GravityAction,
): GravityState => {
  switch (action.type) {
    case "parameters": {
      // Obtiene los nuevos parámetros gravitatorios.
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

    case "formula": {
      // Actualiza los valores introducidos en la calculadora.
      const formula = changeFormulaInput(
        state.formula,
        action.key,
        action.text,
      );

      if (formula === state.formula) return state;

      // Obtiene el resultado calculado, si existe.
      const result = formula.result;

      // Sincroniza los parámetros físicos cuando el resultado es válido.
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

    case "unknown": {
      if (action.key === state.formula.unknown) return state;

      // Cambia la variable desconocida de la fórmula.
      const formula = selectFormulaUnknown(state.formula, action.key);

      // Recupera el último resultado disponible.
      const result = state.formula.result;

      // Comprueba si el resultado coincide con los parámetros del laboratorio.
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

    case "reset":
      return {
        ...createGravityState(),
        resetVersion: state.resetVersion + 1,
        revision: state.revision + 1,
      };

    case "proposal": {
      if (action.expectedRevision !== state.revision) return state;

      // Valida y resuelve los nuevos parámetros propuestos por la IA.
      const parameters = resolveGravityProposal(
        state.parameters,
        action.proposal,
      );

      return parameters
        ? gravityStateReducer(state, { type: "parameters", update: parameters })
        : state;
    }
  }
};
