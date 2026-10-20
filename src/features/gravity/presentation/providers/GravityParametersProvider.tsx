"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { gravitationalForce } from "../../domain/gravitation";

import {
  createGravityState,
  gravityStateReducer,
} from "../../application/gravityState";

import type { GravityAction } from "../../application/gravityState";
import type { FormulaInputState } from "../../types/formula.types";

import type {
  GravityParameters,
  GravityParameterProposal,
  GravityVariable,
} from "../../types/gravity.types";

// Define las funciones y propiedades para controlar el laboratorio gravitatorio.
type GravityControls = {
  setParameters: Dispatch<SetStateAction<GravityParameters>>;
  resetParameters: () => void;
  resetVersion: number;
  revision: number;
  applyProposal: (
    proposal: GravityParameterProposal,
    expectedRevision: number,
  ) => boolean;
};

// Define el estado editable de la calculadora y sus funciones de actualización.
type GravityFormulaState = FormulaInputState & {
  changeValue: (key: GravityVariable, text: string) => void;
  selectUnknown: (key: GravityVariable) => void;
};

// Crea el contexto para compartir los parámetros físicos y la fuerza gravitatoria.
const ParametersContext = createContext<{
  parameters: GravityParameters;
  force: number;
} | null>(null);

// Crea el contexto para compartir las funciones de control del laboratorio.
const ControlsContext = createContext<GravityControls | null>(null);

// Crea el contexto para compartir el estado de la calculadora.
const FormulaContext = createContext<GravityFormulaState | null>(null);

// Gestiona el estado compartido del laboratorio y la calculadora,
// manteniendo sincronizados los parámetros, los cálculos y las propuestas de IA.
export const GravityParametersProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  // Almacena el estado general del laboratorio.
  const [state, setState] = useState(createGravityState);

  // Mantiene una referencia actualizada del estado para procesar los cambios.
  const stateRef = useRef(state);

  // Ejecuta las acciones mediante el reducer y actualiza el estado compartido.
  const dispatch = useCallback((action: GravityAction) => {
    // Obtiene el estado anterior y calcula el siguiente.
    const previous = stateRef.current;
    const next = gravityStateReducer(previous, action);

    stateRef.current = next;
    setState(next);

    return next !== previous;
  }, []);

  // Actualiza las masas o la distancia del laboratorio.
  const setParameters: GravityControls["setParameters"] = useCallback(
    (update) => {
      dispatch({ type: "parameters", update });
    },
    [dispatch],
  );

  // Restablece los parámetros y la calculadora a sus valores iniciales.
  const resetParameters = useCallback(() => {
    dispatch({ type: "reset" });
  }, [dispatch]);

  // Aplica una propuesta válida del Tutor IA a la configuración actual.
  const applyProposal = useCallback(
    (proposal: GravityParameterProposal, expectedRevision: number) =>
      dispatch({ type: "proposal", proposal, expectedRevision }),
    [dispatch],
  );

  // Actualiza el valor introducido en un campo de la calculadora.
  const changeValue = useCallback(
    (key: GravityVariable, text: string) => {
      dispatch({ type: "formula", key, text });
    },
    [dispatch],
  );

  // Cambia la variable desconocida que debe resolver la calculadora.
  const selectUnknown = useCallback(
    (key: GravityVariable) => {
      dispatch({ type: "unknown", key });
    },
    [dispatch],
  );

  // Agrupa las funciones de control y las versiones del estado del laboratorio.
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

  // Comparte los parámetros actuales y la fuerza gravitatoria calculada.
  const physical = useMemo(
    () => ({
      parameters: state.parameters,
      force: gravitationalForce(state.parameters),
    }),
    [state.parameters],
  );

  // Agrupa el estado de la calculadora y las funciones para modificarlo.
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

// Permite acceder a las funciones de control del laboratorio.
export const useGravityControls = () => {
  // Obtiene el contexto compartido de los controles.
  const context = useContext(ControlsContext);

  if (!context)
    throw new Error("Gravity parameters require GravityParametersProvider");

  return context;
};

// Permite acceder a los parámetros físicos, la fuerza
// gravitatoria y las funciones de control del laboratorio.
export const useGravityParameters = () => {
  // Obtiene los parámetros y la fuerza gravitatoria actual.
  const physical = useContext(ParametersContext);

  // Obtiene las funciones para modificar los parámetros.
  const controls = useGravityControls();

  if (!physical)
    throw new Error("Gravity parameters require GravityParametersProvider");

  return { ...physical, ...controls };
};

// Permite acceder al estado editable de la calculadora,
// compartido entre la versión integrada y el panel lateral.
export const useGravityFormulaDraft = () => {
  // Obtiene el contexto compartido de la calculadora.
  const context = useContext(FormulaContext);

  if (!context)
    throw new Error("Formula inputs require GravityParametersProvider");

  return context;
};
