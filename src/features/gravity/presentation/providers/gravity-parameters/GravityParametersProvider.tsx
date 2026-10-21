"use client";

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";

import { gravitationalForce } from "../../../domain/gravitation";
import {
  createGravityState,
  gravityStateReducer,
  type GravityAction,
} from "../../../application/gravityState";

import type {
  GravityParameterProposal,
  GravityVariable,
} from "../../../types/gravity.types";

import {
  ControlsContext,
  FormulaContext,
  ParametersContext,
  type GravityControls,
} from "./GravityParametersContext";

// Comparte el estado del laboratorio y la calculadora.
export const GravityParametersProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, setState] = useState(createGravityState);
  const stateRef = useRef(state);

  // Procesa las acciones y actualiza el estado.
  const dispatch = useCallback((action: GravityAction) => {
    const previous = stateRef.current;
    const next = gravityStateReducer(previous, action);

    stateRef.current = next;
    setState(next);

    return next !== previous;
  }, []);

  // Actualiza los parámetros del laboratorio.
  const setParameters: GravityControls["setParameters"] = useCallback(
    (update) => {
      dispatch({ type: "parameters", update });
    },
    [dispatch],
  );

  // Restablece el laboratorio y la fórmula.
  const resetParameters = useCallback(() => {
    dispatch({ type: "reset" });
  }, [dispatch]);

  // Aplica los parámetros propuestos por el Tutor IA.
  const applyProposal = useCallback(
    (proposal: GravityParameterProposal, expectedRevision: number) =>
      dispatch({ type: "proposal", proposal, expectedRevision }),
    [dispatch],
  );

  // Modifica un campo de la fórmula.
  const changeValue = useCallback(
    (key: GravityVariable, text: string) => {
      dispatch({ type: "formula", key, text });
    },
    [dispatch],
  );

  // Selecciona la variable que se calculará.
  const selectUnknown = useCallback(
    (key: GravityVariable) => {
      dispatch({ type: "unknown", key });
    },
    [dispatch],
  );

  // Comparte las acciones del laboratorio.
  const controls = useMemo(
    () => ({
      setParameters,
      resetParameters,
      resetVersion: state.resetVersion,
      revision: state.revision,
      applyProposal,
    }),
    [
      setParameters,
      resetParameters,
      state.resetVersion,
      state.revision,
      applyProposal,
    ],
  );

  // Calcula y comparte la fuerza gravitatoria.
  const physical = useMemo(
    () => ({
      parameters: state.parameters,
      force: gravitationalForce(state.parameters),
    }),
    [state.parameters],
  );

  // Comparte el estado y las acciones de la fórmula.
  const formula = useMemo(
    () => ({
      ...state.formula,
      changeValue,
      selectUnknown,
    }),
    [state.formula, changeValue, selectUnknown],
  );

  return (
    <ControlsContext.Provider value={controls}>
      <ParametersContext.Provider value={physical}>
        <FormulaContext.Provider value={formula}>
          {children}
        </FormulaContext.Provider>
      </ParametersContext.Provider>
    </ControlsContext.Provider>
  );
};
