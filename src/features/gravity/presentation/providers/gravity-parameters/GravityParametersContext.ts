"use client";

import { createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { FormulaInputState } from "../../../types/formula.types";
import type {
  GravityParameters,
  GravityParameterProposal,
  GravityVariable,
} from "../../../types/gravity.types";

// Define las operaciones que controlan los parámetros del laboratorio.
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

// Define el estado editable y las acciones de la calculadora.
export type GravityFormulaState = FormulaInputState & {
  changeValue: (key: GravityVariable, text: string) => void;
  selectUnknown: (key: GravityVariable) => void;
};

// Comparte las magnitudes físicas y la fuerza gravitatoria calculada.
export const ParametersContext = createContext<{
  parameters: GravityParameters;
  force: number;
} | null>(null);

// Comparte los controles y la versión del estado del laboratorio.
export const ControlsContext = createContext<GravityControls | null>(null);

// Comparte los valores y las acciones de la calculadora.
export const FormulaContext = createContext<GravityFormulaState | null>(null);

// Permite acceder a las acciones del laboratorio.
export const useGravityControls = () => {
  const context = useContext(ControlsContext);

  if (!context)
    throw new Error("Gravity parameters require GravityParametersProvider");

  return context;
};

// Devuelve los parámetros, la fuerza y las acciones del laboratorio.
export const useGravityParameters = () => {
  const physical = useContext(ParametersContext);
  const controls = useGravityControls();

  if (!physical)
    throw new Error("Gravity parameters require GravityParametersProvider");

  return { ...physical, ...controls };
};

// Permite editar la calculadora integrada y la del panel lateral.
export const useGravityFormulaDraft = () => {
  const context = useContext(FormulaContext);

  if (!context)
    throw new Error("Formula inputs require GravityParametersProvider");

  return context;
};
