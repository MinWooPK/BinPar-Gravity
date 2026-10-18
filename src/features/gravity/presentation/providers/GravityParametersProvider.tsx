"use client";

import { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { gravitationalForce } from "../../domain/gravitation";
import { createGravityState, gravityStateReducer } from "../../application/gravityState";
import type { FormulaInputState } from "../../types/formula.types";
import type { GravityParameters, GravityVariable } from "../../types/gravity.types";

type GravityControls = {
  setParameters: Dispatch<SetStateAction<GravityParameters>>;
  resetParameters: () => void;
  resetVersion: number;
};
type GravityFormulaState = FormulaInputState & {
  changeValue: (key: GravityVariable, text: string) => void;
  selectUnknown: (key: GravityVariable) => void;
};
const ParametersContext = createContext<{ parameters: GravityParameters; force: number } | null>(null);
const ControlsContext = createContext<GravityControls | null>(null);
const FormulaContext = createContext<GravityFormulaState | null>(null);

export const GravityParametersProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gravityStateReducer, undefined, createGravityState);
  const setParameters: GravityControls["setParameters"] = useCallback(
    (update) => dispatch({ type: "parameters", update }), [],
  );
  const resetParameters = useCallback(() => dispatch({ type: "reset" }), []);
  const changeValue = useCallback(
    (key: GravityVariable, text: string) => dispatch({ type: "formula", key, text }), [],
  );
  const selectUnknown = useCallback(
    (key: GravityVariable) => dispatch({ type: "unknown", key }), [],
  );
  const controls = useMemo(
    () => ({ setParameters, resetParameters, resetVersion: state.resetVersion }),
    [setParameters, resetParameters, state.resetVersion],
  );
  const physical = useMemo(
    () => ({ parameters: state.parameters, force: gravitationalForce(state.parameters) }),
    [state.parameters],
  );
  const formula = useMemo(
    () => ({ ...state.formula, changeValue, selectUnknown }),
    [state.formula, changeValue, selectUnknown],
  );

  return (
    <ControlsContext.Provider value={controls}>
      <ParametersContext.Provider value={physical}>
        <FormulaContext.Provider value={formula}>{children}</FormulaContext.Provider>
      </ParametersContext.Provider>
    </ControlsContext.Provider>
  );
};

export const useGravityControls = () => {
  const context = useContext(ControlsContext);
  if (!context) throw new Error("Gravity parameters require GravityParametersProvider");
  return context;
};

export const useGravityParameters = () => {
  const physical = useContext(ParametersContext);
  const controls = useGravityControls();
  if (!physical) throw new Error("Gravity parameters require GravityParametersProvider");
  return { ...physical, ...controls };
};

/** Inline and drawer presentations share editable text and the selected unknown. */
export const useGravityFormulaDraft = () => {
  const context = useContext(FormulaContext);
  if (!context) throw new Error("Formula inputs require GravityParametersProvider");
  return context;
};
