"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { gravitationalForce } from "../../domain/gravitation";
import { createGravityState, gravityStateReducer } from "../../application/gravityState";
import type { GravityAction } from "../../application/gravityState";
import type { FormulaInputState } from "../../types/formula.types";
import type { GravityParameters, GravityParameterProposal, GravityVariable } from "../../types/gravity.types";

type GravityControls = {
  setParameters: Dispatch<SetStateAction<GravityParameters>>;
  resetParameters: () => void;
  resetVersion: number;
  revision: number;
  applyProposal: (proposal: GravityParameterProposal, expectedRevision: number) => boolean;
};
type GravityFormulaState = FormulaInputState & {
  changeValue: (key: GravityVariable, text: string) => void;
  selectUnknown: (key: GravityVariable) => void;
};
const ParametersContext = createContext<{ parameters: GravityParameters; force: number } | null>(null);
const ControlsContext = createContext<GravityControls | null>(null);
const FormulaContext = createContext<GravityFormulaState | null>(null);

export const GravityParametersProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(createGravityState);
  const stateRef = useRef(state);
  // Commit through the same reducer synchronously so confirmation is atomic,
  // even when multiple updates happen before React's next render.
  const dispatch = useCallback((action: GravityAction) => {
    const previous = stateRef.current;
    const next = gravityStateReducer(previous, action);
    stateRef.current = next;
    setState(next);
    return next !== previous;
  }, []);
  const setParameters: GravityControls["setParameters"] = useCallback(
    (update) => { dispatch({ type: "parameters", update }); }, [dispatch],
  );
  const resetParameters = useCallback(() => { dispatch({ type: "reset" }); }, [dispatch]);
  const applyProposal = useCallback(
    (proposal: GravityParameterProposal, expectedRevision: number) => dispatch({ type: "proposal", proposal, expectedRevision }), [dispatch],
  );
  const changeValue = useCallback(
    (key: GravityVariable, text: string) => { dispatch({ type: "formula", key, text }); }, [dispatch],
  );
  const selectUnknown = useCallback(
    (key: GravityVariable) => { dispatch({ type: "unknown", key }); }, [dispatch],
  );
  const controls = useMemo(
    () => ({ setParameters, resetParameters, resetVersion: state.resetVersion, revision: state.revision, applyProposal }),
    [setParameters, resetParameters, state.resetVersion, state.revision, applyProposal],
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
