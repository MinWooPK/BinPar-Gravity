"use client";

import { createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { FormulaInputState } from "../../../types/formula.types";
import type {
  GravityParameters,
  GravityParameterProposal,
  GravityVariable,
} from "../../../types/gravity.types";

// Acciones del laboratorio.
export type GravityControls = {
  setParameters: Dispatch<SetStateAction<GravityParameters>>;
  resetParameters: () => void;
  resetVersion: number;
  revision: number;
  applyProposal: (
    proposal: GravityParameterProposal,
    expectedRevision: number,
  ) => boolean;
};

// Estado y acciones de la calculadora.
export type GravityFormulaState = FormulaInputState & {
  changeValue: (key: GravityVariable, text: string) => void;
  selectUnknown: (key: GravityVariable) => void;
};

// Comparte los parámetros y la fuerza.
export const ParametersContext = createContext<{
  parameters: GravityParameters;
  force: number;
} | null>(null);

// Comparte los controles del laboratorio.
export const ControlsContext = createContext<GravityControls | null>(null);

// Comparte el estado de la calculadora.
export const FormulaContext = createContext<GravityFormulaState | null>(null);

// Accede a los controles del laboratorio.
export const useGravityControls = () => {
  const context = useContext(ControlsContext);

  if (!context) {
    throw new Error("Gravity parameters require GravityParametersProvider");
  }

  return context;
};

// Accede a los parámetros, la fuerza y los controles.
export const useGravityParameters = () => {
  const physical = useContext(ParametersContext);
  const controls = useGravityControls();

  if (!physical) {
    throw new Error("Gravity parameters require GravityParametersProvider");
  }

  return { ...physical, ...controls };
};

// Accede al estado editable de la calculadora.
export const useGravityFormulaDraft = () => {
  const context = useContext(FormulaContext);

  if (!context) {
    throw new Error("Formula inputs require GravityParametersProvider");
  }

  return context;
};
