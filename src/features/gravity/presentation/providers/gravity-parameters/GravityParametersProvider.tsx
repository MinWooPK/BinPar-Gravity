"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

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

// Gestiona el estado compartido del laboratorio y la calculadora
// utilizando las mismas acciones y el mismo reducer de la aplicación.
export const GravityParametersProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  // Guarda el estado único de los parámetros y de la fórmula.
  const [state, setState] = useState(createGravityState);

  // Mantiene el estado más reciente para procesar acciones consecutivas.
  const stateRef = useRef(state);

  // Ejecuta las acciones y actualiza el estado compartido.
  const dispatch = useCallback((action: GravityAction) => {
    const previous = stateRef.current;
    const next = gravityStateReducer(previous, action);

    stateRef.current = next;
    setState(next);

    return next !== previous;
  }, []);

  // Modifica los parámetros físicos del laboratorio.
  const setParameters: GravityControls["setParameters"] = useCallback(
    (update) => {
      dispatch({ type: "parameters", update });
    },
    [dispatch],
  );

  // Restablece los parámetros y los campos de la calculadora.
  const resetParameters = useCallback(() => {
    dispatch({ type: "reset" });
  }, [dispatch]);

  // Aplica una propuesta validada del Tutor IA.
  const applyProposal = useCallback(
    (proposal: GravityParameterProposal, expectedRevision: number) =>
      dispatch({ type: "proposal", proposal, expectedRevision }),
    [dispatch],
  );

  // Actualiza el texto de un campo de la fórmula.
  const changeValue = useCallback(
    (key: GravityVariable, text: string) => {
      dispatch({ type: "formula", key, text });
    },
    [dispatch],
  );

  // Selecciona la variable desconocida que debe calcularse.
  const selectUnknown = useCallback(
    (key: GravityVariable) => {
      dispatch({ type: "unknown", key });
    },
    [dispatch],
  );

  // Agrupa los controles y los metadatos de la sesión.
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

  // Calcula la fuerza a partir de los parámetros actuales.
  const physical = useMemo(
    () => ({
      parameters: state.parameters,
      force: gravitationalForce(state.parameters),
    }),
    [state.parameters],
  );

  // Comparte los valores y los controladores de la fórmula.
  const formula = useMemo(
    () => ({ ...state.formula, changeValue, selectUnknown }),
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
